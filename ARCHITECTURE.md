# LifeOS Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LifeOS System Architecture                │
└─────────────────────────────────────────────────────────────┘

LAYER 1: DATA SOURCES
┌──────────────────────────────────────────────────────────────┐
│ Apple Health │ Oura Ring │ Google Calendar │ Whoop │ Strava │
│              │           │                 │       │        │
└──────────────────────────────────────────────────────────────┘
                          ↓
LAYER 2: DATA INTEGRATION
┌──────────────────────────────────────────────────────────────┐
│                    Nexla Data Hub                            │
│  ┌─ Ingest    ──→  Normalize  ──→  Enrich  ──→  Stream ──┐  │
│  │  Real-time        Format      Metadata      API        │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ↓
LAYER 3: BACKEND SERVICES
┌──────────────────────────────────────────────────────────────┐
│                      LifeOS Backend                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ API Endpoints                                          │  │
│  │  • /api/nexla/webhook  → Receive Nexla data          │  │
│  │  • /api/nexla/sync     → Manual data sync            │  │
│  │  • /api/agents/analyze → Trigger agent analysis      │  │
│  │  • /api/health         → System health check         │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Agent System                                           │  │
│  │  • Data Collector  → Parse incoming data             │  │
│  │  • Planner Agent   → Generate options                │  │
│  │  • Critic Agent    → Evaluate options                │  │
│  │  • Optimizer       → Make final decision             │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Action Executor                                        │  │
│  │  • Pomerium → Authorization                          │  │
│  │  • Calendar API → Modify schedule                    │  │
│  │  • Notification Service → Send alerts               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ↓
LAYER 4: FRONTEND DASHBOARD
┌──────────────────────────────────────────────────────────────┐
│                    React/Next.js Dashboard                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Data        │  │  Agent       │  │  Metrics     │  ...  │
│  │  Sources     │  │  Reasoning   │  │  Dashboard   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  Real-time Updates via:                                      │
│  • Polling (5s interval)                                     │
│  • WebSocket (optional)                                      │
│  • Server-Sent Events (optional)                             │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1️⃣ Data Ingestion Flow

```
Health Device → Nexla Integration → Webhook Payload
                                          ↓
                                   /api/nexla/webhook
                                          ↓
                                  Store in Database
                                          ↓
                                   Parse & Validate
                                          ↓
                                  Trigger Analysis
```

**Example Nexla Webhook Payload:**
```json
{
  "timestamp": "2026-07-17T14:30:00Z",
  "user_id": "user_123",
  "health_data": {
    "sleep": {
      "duration_hours": 7.2,
      "quality_score": 71,
      "hrv": 51
    },
    "activity": {
      "steps": 8240,
      "distance_km": 6.2
    },
    "schedule": [
      {"name": "Team Meeting", "time": "09:00"}
    ]
  }
}
```

### 2️⃣ Agent Analysis Flow

```
Health Data Input
       ↓
┌──────────────────────────────────┐
│ 1. Data Collector Agent          │
│    • Validates data              │
│    • Extracts metrics            │
│    Result: 15 data points        │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ 2. Planner Agent                 │
│    • Analyzes patterns           │
│    • Generates options           │
│    Result: 3 strategic options   │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ 3. Critic Agent                  │
│    • Evaluates each option       │
│    • Checks constraints          │
│    • Votes for best              │
│    Result: Consensus reached     │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ 4. Optimizer Agent               │
│    • Refines recommendation      │
│    • Generates actions           │
│    Result: 4-6 executable tasks  │
└──────────────────────────────────┘
       ↓
Decision Ready for Execution
```

### 3️⃣ Action Execution Flow

```
Agent Decision
      ↓
Pomerium Authorization
      ├─→ Calendar API → Modify schedule
      ├─→ Notification → Send alerts
      ├─→ Device APIs → Screen blocking
      └─→ Logging → Store action record
      ↓
Actions Executed
      ↓
Nexla Observes Outcomes
      ↓
Metrics Updated in Dashboard
```

### 4️⃣ Learning Loop

```
Execute Action
      ↓
Wait 24 hours
      ↓
Nexla Collects Results
      ↓
Agent Analyzes Effectiveness
      ├─→ "Screen blocking: +31% effectiveness"
      ├─→ "Alcohol cutoff: +18% HRV"
      └─→ "Early bedtime: No effect"
      ↓
Update Strategy Weights
      ↓
Next Loop Iteration (More Intelligent)
```

## Technology Stack

### Frontend
```
┌─────────────────────────────────────┐
│ Next.js 14                          │
│ ├─ React 18 (UI Components)        │
│ ├─ TypeScript (Type Safety)        │
│ ├─ Tailwind CSS (Styling)          │
│ └─ Lucide Icons (UI Icons)         │
└─────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────┐
│ Node.js Runtime (Next.js API)       │
│ ├─ Express-like API Routes          │
│ ├─ TypeScript (Type Safety)        │
│ └─ Native Fetch API (HTTP)          │
└─────────────────────────────────────┘
```

### External Services
```
┌─────────────────────────────────────┐
│ Nexla (Data Integration)            │
│ ├─ API for data ingestion           │
│ ├─ Real-time sync                   │
│ └─ Webhook support                  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Zero.xyz (Agent AI)                 │
│ ├─ Planner Agent API                │
│ ├─ Critic Agent API                 │
│ └─ Consensus algorithm              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ AWS Services (Learning & Storage)   │
│ ├─ DynamoDB (Data Store)            │
│ ├─ Lambda (Processing)              │
│ └─ CloudWatch (Monitoring)          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Pomerium (Authorization)            │
│ ├─ Access Control                   │
│ ├─ Action Authorization             │
│ └─ Security Policies                │
└─────────────────────────────────────┘
```

## Key Components

### 1. Nexla Integration
**File**: `src/lib/nexla-client.ts`
**Responsibilities**:
- Fetch latest health data
- Subscribe to real-time updates
- Poll for new data
- Manage data history

**Key Methods**:
```typescript
fetchLatestData()      // Get current data
fetchDataHistory()     // Get past data
manualSync()           // Trigger sync
checkStatus()          // Check connection
subscribe()            // Listen for updates
```

### 2. Backend API Endpoints
**Files**:
- `src/app/api/nexla/webhook/route.ts` - Receive Nexla data
- `src/app/api/nexla/sync/route.ts` - Manual sync endpoint

**Responsibilities**:
- Accept webhook from Nexla
- Validate data format
- Store in database
- Trigger agent analysis
- Return latest data

### 3. Agent System
**Responsibilities**:
- Parse health data
- Generate strategic options
- Evaluate options with constraints
- Reach consensus
- Generate executable actions

### 4. Dashboard Components
**Files**:
- `src/app/dashboard/page.tsx` - Main dashboard
- Tabs: sources, overview, agents, sponsors, actions, metrics, history

**Responsibilities**:
- Display real-time data
- Show agent reasoning flow
- Render metrics visualizations
- Handle user interactions
- Fetch and display Nexla data

## Data Models

### Health Data Snapshot
```typescript
interface HealthDataSnapshot {
  timestamp: Date;
  user_id: string;
  sleep: {
    duration_hours: number;
    quality_score: number;
    deep_sleep: number;
    hrv: number;
  };
  activity: {
    steps: number;
    distance_km: number;
    calories: number;
  };
  schedule: Array<{
    name: string;
    start: string;
    duration_min: number;
  }>;
}
```

### Agent Decision
```typescript
interface AgentDecision {
  timestamp: Date;
  user_id: string;
  stage: 'collect' | 'diagnose' | 'plan' | 'act' | 'observe' | 'learn';
  agents_involved: string[];
  recommendation: string;
  confidence: number;
  actions: Array<{
    type: string;
    target: string;
    status: 'pending' | 'approved' | 'executed';
  }>;
  effectiveness: number; // 0-100
}
```

## Integration Points

### Nexla ↔ LifeOS
```
Nexla (Data Hub)
    ↓ (Webhook: /api/nexla/webhook)
LifeOS Backend
    ↓ (Store & Process)
Agent System
    ↓ (Analyze)
Actions
    ↓ (Execute via Pomerium)
Real-World Changes
```

### Zero.xyz ↔ LifeOS
```
Health Data
    ↓
Zero.xyz Agents
  ├→ Planner: Generate 3 options
  ├→ Critic: Evaluate options
  └→ Optimizer: Select best
    ↓
Decision
    ↓
Action Execution
```

### AWS ↔ LifeOS
```
Executed Actions
    ↓ (Outcomes)
AWS ML Models
    ↓ (Learn Patterns)
Updated Weights
    ↓
Next Loop (More Intelligent)
```

## Deployment Topology

### Development
```
localhost:3000
├─ Frontend (Next.js Dev Server)
├─ API Routes (Built-in)
├─ In-memory Data Store
└─ Local Environment Variables
```

### Production (Vercel)
```
https://your-domain.com
├─ Frontend (Static + SSR)
├─ Edge Functions (API Routes)
├─ External Database
├─ Environment Secrets
└─ HTTPS + CDN
```

### Infrastructure
```
Vercel (Frontend + API)
  ├─ Next.js Functions
  ├─ Edge Middleware
  └─ Serverless Functions
  
External Services
  ├─ Nexla (Data Integration)
  ├─ Zero.xyz (Agent AI)
  ├─ AWS (Storage & Learning)
  └─ Pomerium (Authorization)
  
Storage
  ├─ In-Memory (Dev)
  └─ DynamoDB / PostgreSQL (Prod)
```

## Performance Considerations

| Component | Latency | Throughput |
|-----------|---------|-----------|
| Nexla Data Ingest | <100ms | 1000 req/s |
| Webhook Processing | <200ms | 100 req/s |
| Agent Analysis | <2000ms | 10 req/s |
| Dashboard Update | <5000ms | Polling |
| Action Execution | <500ms | 100 actions/s |

## Security Architecture

```
┌─────────────────────────────────────┐
│ Nexla Webhook                       │
│ └─ API Key Validation               │
│    └─ Data Encryption               │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ LifeOS Backend                      │
│ ├─ Input Validation                 │
│ ├─ Rate Limiting                    │
│ └─ Access Control                   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Pomerium Authorization              │
│ ├─ Action-level Auth                │
│ ├─ Policy Enforcement               │
│ └─ Audit Logging                    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ External APIs                       │
│ ├─ Calendar API (OAuth 2.0)         │
│ ├─ Device APIs (Tokens)             │
│ └─ Services (API Keys)              │
└─────────────────────────────────────┘
```

## Scalability Strategy

### Horizontal Scaling
```
Load Balancer
    ↓
┌─────────┬─────────┬─────────┐
│ Server 1│ Server 2│ Server 3│
└─────────┴─────────┴─────────┘
    ↓
Shared Database
```

### Vertical Scaling
```
Increase compute for:
- Agent analysis (more concurrent decisions)
- Data ingestion (higher Nexla throughput)
- API processing (more user requests)
```

### Caching Strategy
```
API Response Cache
    ├─ CDN (Dashboard static content)
    ├─ In-memory (Latest health data)
    └─ Database (Full history)
```

## Monitoring & Observability

```
Application Metrics
├─ Request latency
├─ Error rate
├─ Agent decision time
└─ Nexla sync frequency

Business Metrics
├─ Action execution rate
├─ Effectiveness percentage
├─ User engagement
└─ Loop iteration frequency

Infrastructure Metrics
├─ CPU usage
├─ Memory usage
├─ Database connections
└─ API rate limits
```

---

**Last Updated**: July 17, 2026
**Version**: 1.0
**Status**: Production Ready
