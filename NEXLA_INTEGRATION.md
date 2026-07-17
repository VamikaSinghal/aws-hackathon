# LifeOS Nexla Integration Guide

## Overview
This guide explains how to integrate Nexla (a data orchestration platform) with LifeOS for live data ingestion and real-time health data synchronization.

## What is Nexla?
Nexla is a data integration platform that allows you to:
- Connect multiple health data sources (Apple Health, Oura Ring, Google Calendar, Strava, etc.)
- Normalize and transform data in real-time
- Stream data to your applications via APIs or webhooks
- Monitor data quality and flow

## Architecture

```
Health Data Sources (Apple Health, Oura Ring, etc.)
                    ↓
            Nexla Data Hub
                    ↓
        LifeOS Dashboard (Real-time Display)
                    ↓
    Multi-Agent Analysis & Decision Making
                    ↓
          Action Execution (Pomerium)
```

## Step 1: Set Up Nexla Account & API

### 1.1 Create Nexla Account
1. Visit https://www.nexla.io
2. Sign up for a free account
3. Create an organization workspace
4. Navigate to **Settings → API Keys**
5. Generate an API key and secret

### 1.2 Environment Configuration
Create `.env.local` file in project root:

```env
NEXT_PUBLIC_NEXLA_API_URL=https://api.nexla.io/v1
NEXLA_API_KEY=your_api_key_here
NEXLA_API_SECRET=your_api_secret_here
NEXLA_WORKSPACE_ID=your_workspace_id
```

## Step 2: Create Nexla Flows

### 2.1 Connect Data Sources in Nexla

**Apple Health Flow:**
1. In Nexla Dashboard → "Add Source"
2. Select "Apple Health"
3. Authorize with Apple ID
4. Select data types: Sleep, Heart Rate, Steps, Workouts
5. Set sync frequency: Real-time or Hourly

**Oura Ring Flow:**
1. Add Source → "Oura Ring"
2. Enter Oura API token
3. Select metrics: Sleep Score, HRV, Temperature, Movement
4. Set auto-sync interval

**Google Calendar Flow:**
1. Add Source → "Google Calendar"
2. Authorize with Google account
3. Select calendars to sync
4. Extract: Event name, duration, time, attendees

**Strava Flow:**
1. Add Source → "Strava"
2. Authorize with Strava account
3. Track: Running, Cycling, Distance, Elevation, Pace

**Gmail Flow:**
1. Add Source → "Gmail"
2. Authorize with Google
3. Extract: Subject, sender, timestamp, importance

### 2.2 Create Unified Data Hub
In Nexla:
1. Create Recipe → "Combine Sources"
2. Merge all health sources into single normalized dataset
3. Transform format to JSON:

```json
{
  "timestamp": "2026-07-17T14:30:00Z",
  "user_id": "user_123",
  "health_data": {
    "sleep": {
      "duration_hours": 7.2,
      "quality_score": 71,
      "deep_sleep": 1.2,
      "hrv": 51
    },
    "activity": {
      "steps": 8240,
      "distance_km": 6.2,
      "calories": 350
    },
    "schedule": {
      "events": [
        {
          "name": "Team Meeting",
          "start": "09:00",
          "duration_min": 60
        }
      ]
    }
  }
}
```

### 2.3 Create API Endpoint
In Nexla:
1. Click "Share" → "API"
2. Enable "Webhook Push" mode
3. Set webhook URL: `https://your-domain.com/api/nexla/webhook`
4. Authentication: Use API key header
5. Frequency: Real-time streaming

## Step 3: Implement Backend API

Create `src/app/api/nexla/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface NexlaData {
  timestamp: string;
  user_id: string;
  health_data: {
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
    schedule: {
      events: Array<{
        name: string;
        start: string;
        duration_min: number;
      }>;
    };
  };
}

// Store latest data in memory (use Redis/DB in production)
let latestHealthData: NexlaData | null = null;

export async function POST(request: NextRequest) {
  try {
    const data: NexlaData = await request.json();
    
    // Verify Nexla API key from header
    const apiKey = request.headers.get('x-nexla-key');
    if (apiKey !== process.env.NEXLA_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Store data
    latestHealthData = data;
    
    // Log for monitoring
    console.log('[Nexla] Received health data:', {
      timestamp: data.timestamp,
      sleep_score: data.health_data.sleep.quality_score,
      hrv: data.health_data.sleep.hrv,
      steps: data.health_data.activity.steps
    });

    // Trigger agent analysis
    await triggerAgentAnalysis(data);

    return NextResponse.json({ 
      success: true, 
      message: 'Data received and processed' 
    });
  } catch (error) {
    console.error('[Nexla] Webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(latestHealthData || { status: 'no data' });
}

async function triggerAgentAnalysis(data: NexlaData) {
  // Call your agent analysis system
  // This would trigger the multi-agent workflow
  const response = await fetch('/api/agents/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      health_data: data.health_data,
      timestamp: data.timestamp
    })
  });
  
  return response.json();
}
```

Create `src/app/api/nexla/sync/route.ts` (Manual sync endpoint):

```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Call Nexla API to fetch latest data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NEXLA_API_URL}/recipes/execute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXLA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipe_id: process.env.NEXLA_RECIPE_ID,
          workspace_id: process.env.NEXLA_WORKSPACE_ID
        })
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nexla sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

## Step 4: Update Dashboard with Live Data

Create `src/lib/nexla-client.ts`:

```typescript
export interface HealthDataSnapshot {
  timestamp: Date;
  sleep: {
    duration: number;
    quality: number;
    hrv: number;
  };
  activity: {
    steps: number;
    distance: number;
  };
  events: Array<{ name: string; time: string }>;
}

export async function fetchLatestHealthData(): Promise<HealthDataSnapshot | null> {
  try {
    const response = await fetch('/api/nexla/webhook');
    const data = await response.json();
    
    if (!data.health_data) return null;

    return {
      timestamp: new Date(data.timestamp),
      sleep: {
        duration: data.health_data.sleep.duration_hours,
        quality: data.health_data.sleep.quality_score,
        hrv: data.health_data.sleep.hrv
      },
      activity: {
        steps: data.health_data.activity.steps,
        distance: data.health_data.activity.distance_km
      },
      events: data.health_data.schedule.events
    };
  } catch (error) {
    console.error('Failed to fetch health data:', error);
    return null;
  }
}

export async function manualSyncNexla() {
  try {
    const response = await fetch('/api/nexla/sync', { method: 'POST' });
    return response.json();
  } catch (error) {
    console.error('Manual sync failed:', error);
  }
}
```

Update `src/app/dashboard/page.tsx` to use live Nexla data:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const healthData = await fetchLatestHealthData();
    if (healthData) {
      // Update dashboard with real data
      updateDashboardMetrics(healthData);
    }
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

## Step 5: Create Live Demo Flow

### 5.1 Demo Scenario Script

Create `DEMO_SCRIPT.md`:

```markdown
# LifeOS Live Demo - 15 Minutes

## Setup (2 min)
1. Show Nexla dashboard with 5 connected sources
2. Display data sync status: "Real-time • All sources connected"

## Act 1: Data Collection (3 min)
- Navigate to "Data Sources" tab
- Show:
  - Apple Health: "7.2h sleep recorded"
  - Oura Ring: "HRV: 28ms (low)"
  - Strava: "Morning run: 5km"
  - Google Calendar: "HIIT scheduled at 7am"
  - Gmail: "Late meeting flagged"
- Explain: "Nexla is collecting this data in real-time from 5 sources"

## Act 2: Agent Analysis (4 min)
- Switch to "Agent Reasoning" tab
- Click different agents to show their reasoning:
  - Data Collector: Reading all sources
  - Planner: Generating options
  - Critic: Evaluating HRV (28ms < 40ms threshold)
  - Optimizer: Final recommendation
- Show consensus: "REJECT HIIT, APPROVE 20min walk"

## Act 3: Actions & Results (4 min)
- Show "Suggested Actions": 4 executed, 2 pending
- Switch to "Metrics" tab
- Display metrics before/after:
  - Sleep: 23% → 71% (+208%)
  - HRV: 28ms → 51ms (+82%)
- Explain: "Nexla continuously feeds data; agents learn and adapt"

## Act 4: Future Loop (2 min)
- Show History tab with past experiments
- Explain: "Next morning, the process repeats with updated data"
```

### 5.2 Add Live Demo Mode

Update dashboard to support demo mode:

```typescript
// Add demo toggle in header
const [demoMode, setDemoMode] = useState(false);

useEffect(() => {
  if (demoMode) {
    // Simulate Nexla data stream
    simulateNexlaStream();
  }
}, [demoMode]);

async function simulateNexlaStream() {
  const demoSteps = [
    { step: 'collect', delay: 2000 },
    { step: 'diagnose', delay: 3000 },
    { step: 'plan', delay: 3000 },
    { step: 'act', delay: 2000 },
    { step: 'observe', delay: 3000 },
    { step: 'learn', delay: 2000 }
  ];

  for (const { step, delay } of demoSteps) {
    await new Promise(r => setTimeout(r, delay));
    // Advance stage
  }
}
```

## Step 6: Deployment & Monitoring

### 6.1 Production Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# NEXLA_API_KEY
# NEXLA_API_SECRET
# NEXLA_WORKSPACE_ID
# NEXLA_RECIPE_ID
```

### 6.2 Monitoring

Create `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  const nexlaStatus = await checkNexlaConnection();
  const lastSync = await getLastSyncTime();
  
  return Response.json({
    status: nexlaStatus.connected ? 'healthy' : 'disconnected',
    nexla: nexlaStatus,
    lastSync,
    timestamp: new Date().toISOString()
  });
}
```

## Step 7: Advanced Features

### 7.1 Real-time WebSocket Updates

```typescript
// Use Socket.io for real-time dashboard updates
import { io } from 'socket.io-client';

const socket = io('/api/socket', {
  query: { userId: 'user_123' }
});

socket.on('health_data_update', (data) => {
  updateDashboardLive(data);
});

socket.on('agent_decision', (decision) => {
  displayDecisionFlow(decision);
});
```

### 7.2 Data Quality Monitoring

Track in Nexla:
- Data freshness (last update time)
- Missing values
- Anomalies
- Sync failures

## Testing Checklist

- [ ] Nexla webhook receiving data
- [ ] API endpoint responding with latest data
- [ ] Dashboard updating with real-time metrics
- [ ] Agent workflow triggering on new data
- [ ] Metrics showing accurate before/after comparisons
- [ ] Demo mode cycling through stages smoothly
- [ ] Responsive design on mobile
- [ ] Error handling for Nexla connection failures

## Troubleshooting

### Nexla not sending data
1. Check API key in `.env.local`
2. Verify webhook URL in Nexla dashboard
3. Check Nexla logs: Settings → Activity Log
4. Test with `curl -X POST http://localhost:3000/api/nexla/webhook`

### Dashboard not updating
1. Check browser console for errors
2. Verify `/api/nexla/webhook` endpoint is working
3. Confirm data format matches interface
4. Check polling interval (5 seconds)

### Agent analysis not triggering
1. Ensure `/api/agents/analyze` endpoint exists
2. Check agent logs
3. Verify health data format

## Next Steps

1. Connect real health devices to Nexla
2. Deploy to production
3. Customize agent decision logic
4. Add user-specific rules
5. Integrate with Pomerium for action execution
6. Create mobile app version

## Resources

- Nexla Docs: https://docs.nexla.io
- Nexla API Reference: https://api.nexla.io/docs
- LifeOS GitHub: https://github.com/VamikaSinghal/aws-hackathon
- Demo Video: [Link to demo]

---

**Last Updated:** July 17, 2026
**Status:** Ready for Production Integration
