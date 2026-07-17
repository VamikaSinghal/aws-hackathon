# LifeOS — Your Autonomous Health Agent

An AI-powered autonomous health agent that doesn't just recommend—it acts. LifeOS continuously monitors your data, analyzes your health patterns, and automatically optimizes your daily schedule for peak performance.

## 🎯 Overview

LifeOS runs a continuous agent loop while you sleep. By morning, your day is already rebuilt around what your body actually needs—not what you planned yesterday.

**Key Features:**
- **Autonomous Actions**: Cancels workouts, moves alarms, blocks screens, adjusts nutrition plans
- **Real-time Health Analysis**: Processes sleep, HRV, recovery metrics, and calendar data
- **Multi-Agent Architecture**: Specialized agents for planning, critiquing, workout expertise, and nutrition
- **Zero-Trust Security**: Every action goes through Pomerium's policy layer before execution
- **Decentralized Compute**: Runs 24/7 on Akash's network without central server dependency

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/VamikaSinghal/aws-hackathon.git
cd lifeos
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env.local and add your configuration
cp .env.example .env.local
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```text
GET  /health
GET  /api/state
GET  /api/timeline
GET  /api/integrations/status
POST /api/goal
POST /api/advance-day
POST /api/reset
GET  /auth/google
GET  /api/google-calendar/events?date=YYYY-MM-DD
POST /api/google-calendar/test-write
```

## 📁 Project Structure

```
lifeos/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page with hero, problem, solution sections
│   │   ├── layout.tsx            # Root layout with interactive background
│   │   ├── globals.css           # Global styles and animations
│   │   └── dashboard/            # Dashboard pages (app interface)
│   └── components/
│       └── InteractiveBackground.tsx  # Canvas-based animated background
├── public/                        # Static assets
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## ✨ Features

### Interactive Background
The project includes a beautiful interactive blurred moving background that:
- Features 6 animated circular blobs in sporty green colors (#7fee64, #9cbf93, #aed2a4, #18b759)
- Responds to mouse movement with subtle attraction effects
- Implements physics-based movement with bouncing and friction
- Uses canvas rendering with heavy blur for sleek visual effect
- Adapts to window resizing

### Landing Page Sections
1. **Hero** - Call-to-action with animated 3D cube visualization
2. **Problem** - Explains the gap in current health app ecosystem
3. **Solution** - Shows LifeOS in action with specific autonomy examples
4. **Workflow** - Interactive 6-step loop diagram showing how the agent operates
5. **Architecture** - Five-layer technical stack with sponsor integrations
6. **Sponsors** - Detailed breakdown of each technology partner
7. **CTA** - Final call to action for dashboard access

## 🏗️ Architecture

LifeOS operates through a continuous loop of six steps:

1. **Collect** - Nexla ingests data from Apple Health, Oura, Google Calendar, Gmail
2. **Diagnose** - AWS Bedrock + Zero.xyz run specialized sub-agents in parallel
3. **Plan** - Multi-agent debate between Planner, Critic, and experts
4. **Act** - Pomerium authorizes all actions before execution
5. **Observe** - Nexla streams outcomes back for evaluation
6. **Learn** - Strategy changelog updates with efficacy metrics

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Animation**: Canvas API for interactive background
- **Data Integration**: Nexla (health data hub)
- **AI/Agents**: AWS Bedrock, Zero.xyz (multi-agent orchestration)
- **Security**: Pomerium (zero-trust policy enforcement)
- **Compute**: Akash (decentralized 24/7 runtime)
- **Storage**: DynamoDB (strategy store and learning)

## 🎨 Design System

### Color Palette
- **Lime Pulse**: `#7fee64` - Primary action/accent
- **Phosphor White**: `#ddffdc` - Text/headings
- **Sage 60**: `#8cab87` - Secondary text
- **Moss 70**: `#9cbf93` - Tertiary elements
- **Void Black**: `#000000` - Dark backgrounds

### Typography
- **Display Font**: Space Grotesk (headings)
- **Body Font**: Inter (content)
- **Monospace**: Fira Mono (code/data)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
# Add your configuration here
NEXT_PUBLIC_API_URL=your_api_url
```

### Tailwind CSS
Custom configuration in `tailwind.config.ts` includes:
- Extended color palette
- Custom spacing
- Animation definitions

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
Create a `Dockerfile` for containerized deployment

### AWS
Deploy to AWS using Amplify or EC2

## 🔐 Security

- Zero-trust architecture with Pomerium policy enforcement
- No central server storage - decentralized on Akash network
- All agent actions require explicit authorization
- Privacy-first data handling
- Audit logging for all operations

## 📊 Performance

- **Build Size**: ~104 kB First Load JS (homepage)
- **Dashboard**: ~102 kB First Load JS
- **Canvas Rendering**: 60fps animations
- **Responsive**: Optimized for mobile, tablet, and desktop

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

## Google Calendar Setup (LIVE read/write)

Google Calendar can replace the simulated calendar context with your real schedule and can create real calendar events when the agent executes a `calendar_event` action through the Pomerium-protected bridge.

In Google Cloud Console:

1. Enable the Google Calendar API.
2. Create an OAuth web client.
3. Add this authorized redirect URI:

```text
http://127.0.0.1:8787/auth/google/callback
```

Then set `.env`:

```text
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
GOOGLE_REDIRECT_URI=http://127.0.0.1:8787/auth/google/callback
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_WRITE_ENABLED=false
```

Restart `npm run dev`, then open:

```text
http://127.0.0.1:8787/auth/google
```

After consent succeeds, `GET /api/state` and the dashboard will show `integrations.googleCalendar.mode`. `advance-day` will read real events into `observation.calendar` when connected. Flip `GOOGLE_CALENDAR_WRITE_ENABLED=true` only when you're ready for real writes; then restart the backend and use `POST /api/google-calendar/test-write` or the dashboard's `Advance Day` flow.

## AWS Setup (LIVE — deployed)

## 🏆 Built By

Built for the **Loop Engineering Hackathon** at tokens& SF 2025

**Sponsors & Partners:**
- Nexla - Health data hub
- Zero.xyz - Multi-agent planner
- AWS - Orchestration backbone
- Pomerium - Secure agent runtime
- Akash - Persistent decentralized compute

## 📧 Contact

For questions or support, reach out to the team at the hackathon or via the GitHub issues.

---

**Wake up to a better day. Every day.**
