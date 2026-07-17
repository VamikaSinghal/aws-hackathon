# LifeOS Live Demo Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser

### Step 1: Install Dependencies
```bash
cd lifeos-steep
npm install
```

### Step 2: Configure Environment
Create `.env.local`:
```env
# Nexla Configuration (Optional - for real integration)
NEXT_PUBLIC_NEXLA_API_URL=https://api.nexla.io/v1
NEXLA_API_KEY=your_api_key_here
NEXLA_API_SECRET=your_api_secret_here
NEXLA_WORKSPACE_ID=your_workspace_id

# Demo Mode (Show simulated data)
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_AGENTS=true
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Navigate to: http://localhost:3000

---

## Demo Flow (15 Minutes)

### 🎬 Act 1: Landing Page (2 min)
**URL**: http://localhost:3000

**What to show:**
- ✨ Hero section: "Your health, on autopilot"
- 🎯 Tagline: "LifeOS • AUTONOMOUS HEALTH AGENT"
- New description about continuous learning
- Click "Launch App" button

**Talking points:**
- "LifeOS is an autonomous health agent"
- "It continuously learns from your body and makes decisions for you"
- "No recommendations, just action"

---

### 📊 Act 2: Data Sources (3 min)
**URL**: http://localhost:3000/dashboard?tab=sources

**What to show:**
- 🏥 Connected data sources
- ⭕ Oura Ring - Sleep & Recovery
- 📅 Google Calendar - Schedule
- 📊 Whoop - Fitness Metrics
- 🚴 Strava - Activity Tracking
- 📧 Gmail - Communication

**Demonstrate:**
1. Point to each source card
2. Show "Connected" status with green indicator
3. Explain: "Real-time sync • All sources active"
4. Show data points being collected:
   - Heart Rate, Steps, Sleep, Workouts
   - Sleep Score, HRV, Temperature
   - Events, Duration, Attendees
   - Running, Cycling, Distance, Pace

**Talking points:**
- "Nexla is our data integration layer"
- "It connects 6 different health sources in real-time"
- "All data flows into LifeOS for analysis"

---

### 🧠 Act 3: Agent Reasoning (4 min)
**URL**: http://localhost:3000/dashboard?tab=agents

**What to show:**
- 📥 Data Collector: "Received 15 data points"
- 📋 Planner Agent: "Generated 3 options"
- 🔍 Critic Agent: "Evaluated and approved plan"
- ⚡ Optimizer: "Final recommendations ready"

**Interactive Demo:**
1. Click each agent card to see their reasoning
2. Watch the workflow visualization
3. Show progress bar advancing through stages

**Watch in Real-Time:**
- Messages stream in one by one
- Color-coded by stage
- Animated transitions between agents

**Talking points:**
- "LifeOS uses multi-agent AI"
- "Each agent has a role: Plan, Critique, Optimize"
- "They debate and reach consensus"
- "No human review needed - the system auto-decides"

---

### ⚡ Act 4: Loop Overview (3 min)
**URL**: http://localhost:3000/dashboard?tab=overview

**What to show:**
- 📈 Live event timeline
- 🎯 6-stage loop progress
- ✅ Completed stages with checkmarks
- 🔄 Current stage highlighted

**Live Timeline Events:**
```
14:30:15 [collect] 📊 Oura Ring: Sleep score 71%
14:30:16 [collect] 📅 Calendar: HIIT 7am found
14:30:20 [diagnose] 🧠 Zero.xyz: Analyzing patterns...
14:30:25 [plan] 📝 Planner: Creating schedule...
14:30:30 [act] 🔐 Pomerium: Authorizing changes...
14:31:00 [observe] 📊 Collecting outcomes...
```

**Explain the Loop:**
1. **Collect**: Gather data from all sources (Nexla)
2. **Diagnose**: Analyze patterns (Zero.xyz AI)
3. **Plan**: Generate options (Agent consensus)
4. **Act**: Execute changes (Pomerium)
5. **Observe**: Measure outcomes (Tracking)
6. **Learn**: Update strategy (AWS ML)

---

### 📈 Act 5: Metrics Dashboard (3 min)
**URL**: http://localhost:3000/dashboard?tab=metrics

**What to show:**

**1. Current Health Score:**
- Donut chart: 71/100 (or 23/100 if showing poor day)
- HRV: 51ms (good recovery)
- Sleep: 7h 12m
- Steps: 8,240
- Recovery: 71%

**2. Goals Progress:**
- Lose 20 lbs: 38% (7.6 lbs lost)
- Increase energy: 62%
- Improve sleep: 71%

**3. Current Bottleneck:**
- Shows: "Sleep consistency improved"
- Agent response: "Testing: fixed 10:30pm wind-down trigger"

**4. Current Experiment:**
- Running: "Alcohol cutoff at 7pm"
- Day 2 of experiment
- Hypothesis: "+15% deep sleep, +8% HRV"

**5. Suggested Actions:**
- 4/6 completed
- ✓ Calendar changes executed
- ✓ Notifications set
- ⏳ Pending: Nutrition goals

**6. Experiment History:**
- Screen blocking: +31% success ✅
- Caffeine cutoff: +18% ✅
- Alcohol cutoff: Running 🔄

**Talking points:**
- "LifeOS isn't just analyzing - it's acting"
- "Calendar was automatically modified"
- "Notifications are being sent"
- "Results are being measured"
- "The system learns what works and what doesn't"

---

## Testing the Nexla Integration

### Manual Webhook Test

Send test data to webhook:

```bash
curl -X POST http://localhost:3000/api/nexla/webhook \
  -H "Content-Type: application/json" \
  -H "x-nexla-key: demo" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "user_id": "demo_user_123",
    "health_data": {
      "sleep": {
        "duration_hours": 7.2,
        "quality_score": 71,
        "deep_sleep": 1.5,
        "hrv": 51
      },
      "activity": {
        "steps": 8240,
        "distance_km": 6.2,
        "calories": 350
      },
      "schedule": {
        "events": [
          {"name": "Team Meeting", "start": "09:00", "duration_min": 60},
          {"name": "Workout", "start": "17:00", "duration_min": 45}
        ]
      }
    }
  }'
```

### Check Latest Data

```bash
curl http://localhost:3000/api/nexla/webhook
```

### Trigger Manual Sync

```bash
curl -X POST http://localhost:3000/api/nexla/sync
```

### Check Status

```bash
curl http://localhost:3000/api/nexla/sync
```

---

## Demo Scenarios

### Scenario 1: Poor Recovery Day ❌
```bash
# Send data with low HRV
curl -X POST http://localhost:3000/api/nexla/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "user_id": "demo_user",
    "health_data": {
      "sleep": {"duration_hours": 4.5, "quality_score": 23, "deep_sleep": 0.8, "hrv": 28},
      "activity": {"steps": 3200, "distance_km": 2.1, "calories": 150},
      "schedule": {"events": [{"name": "HIIT Workout", "start": "07:00", "duration_min": 60}]}
    }
  }'
```

**Expected Result:**
- Agent recommends: Cancel HIIT, go for light walk
- Bottleneck: "Sleep debt accumulation"
- Action: Calendar modified, notifications sent

### Scenario 2: Excellent Recovery ✅
```bash
# Send data with high metrics
curl -X POST http://localhost:3000/api/nexla/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "user_id": "demo_user",
    "health_data": {
      "sleep": {"duration_hours": 8.5, "quality_score": 85, "deep_sleep": 2.2, "hrv": 62},
      "activity": {"steps": 12000, "distance_km": 9.5, "calories": 600},
      "schedule": {"events": [{"name": "Intense Training", "start": "06:00", "duration_min": 90}]}
    }
  }'
```

**Expected Result:**
- Agent recommends: Go for intense training
- Bottleneck: "All systems optimal"
- Message: "Ready for peak performance"

---

## Production Deployment

### 1. Deploy to Vercel
```bash
vercel deploy --prod
```

### 2. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
NEXLA_API_KEY = [your-key]
NEXLA_API_SECRET = [your-secret]
NEXLA_WORKSPACE_ID = [your-workspace]
NEXT_PUBLIC_DEMO_MODE = false
NEXT_PUBLIC_ENABLE_AGENTS = true
```

### 3. Configure Nexla Webhook
In Nexla Dashboard → Recipes → Settings:
- **Webhook URL**: https://your-domain.com/api/nexla/webhook
- **Method**: POST
- **Headers**: `x-nexla-key: [your-key]`
- **Frequency**: Real-time or Hourly

### 4. Verify Deployment
```bash
curl https://your-domain.com/api/nexla/sync
```

---

## Troubleshooting

### Dashboard not updating
1. Check browser console for errors (F12)
2. Verify `/api/nexla/webhook` is accessible
3. Send test data using curl command above
4. Refresh page (Ctrl+R or Cmd+R)

### Webhook not receiving data
1. Check that port 3000 is accessible
2. Verify API key in request headers
3. Check server logs: `npm run dev` shows logs
4. Test with simpler JSON first

### Agents not triggering
1. Check `NEXT_PUBLIC_ENABLE_AGENTS=true` in .env.local
2. Verify health_data format matches interface
3. Check browser developer tools for API errors
4. Look at server console for agent logs

### Real-time updates not working
1. Ensure polling is active
2. Check network tab in DevTools
3. Verify CORS headers if cross-origin
4. Test with manual sync endpoint first

---

## Advanced Features

### 1. Add Real Nexla Connection
1. Sign up at https://nexla.io
2. Get API credentials
3. Update .env.local with real credentials
4. Connect your actual health devices

### 2. Enable Persistent Storage
Replace in-memory storage with database:
- Firebase Firestore
- PostgreSQL
- MongoDB
- DynamoDB

### 3. Add User Authentication
- Next.js Auth0 integration
- Clerk authentication
- Custom JWT tokens

### 4. Implement WebSocket Real-time
```bash
npm install socket.io socket.io-client
```

### 5. Add Mobile App
- React Native version
- Deep links from web to mobile
- Push notifications

---

## Key Metrics to Track in Demo

| Metric | Status | Notes |
|--------|--------|-------|
| Data Sources Connected | 6/6 | Apple Health, Oura, Calendar, Whoop, Strava, Gmail |
| Real-time Sync | Active | Nexla updating every 5 seconds |
| Agent Response Time | <2s | Multi-agent decision making |
| Action Execution | Auto | Calendar, notifications, screen blocking |
| Learning Loop | Active | Improving over time |

---

## Demo Tips

✅ **Do:**
- Start with landing page to set context
- Show one feature at a time
- Explain the flow as you demo
- Use the live timeline for visual feedback
- Interact with different tabs
- Test agent reasoning with different scenarios

❌ **Don't:**
- Rush through the demo
- Skip the agent reasoning section (it's the wow factor)
- Leave screens loading
- Talk about technical details excessively
- Switch tabs too quickly

---

## Resources

- [LifeOS GitHub](https://github.com/VamikaSinghal/aws-hackathon)
- [Nexla API Docs](https://docs.nexla.io)
- [Demo Video](https://youtube.com/placeholder)
- [Architecture Diagram](./ARCHITECTURE.md)
- [Integration Guide](./NEXLA_INTEGRATION.md)

---

**Last Updated**: July 17, 2026
**Status**: Ready for Live Demo
