# Escapade — Your Weekend Event Companion

> Discover real local events, plan your week, and stay on budget — powered by Eventbrite, Ticketmaster, and AI.

---

## What It Does

- **Discover** live events from Eventbrite & Ticketmaster near you (Detroit default)
- **Plan** your week with a Google Calendar-style weekly planner
- **Budget** — set a weekly goal, log expenses, track spending by category
- **AI Planner** — chat with an AI that knows your budget, interests, and real nearby events
- **Journal** — capture moods and memories from your weekends
- **Insights** — spending charts and activity streaks

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS v4 + custom design tokens |
| State | Zustand (persisted) |
| Auth | Supabase Auth |
| Database | PostgreSQL via Prisma (hosted on Supabase) |
| Event APIs | Eventbrite API + Ticketmaster Discovery API |
| AI | Pluggable: Anthropic Claude / OpenAI / Groq / Ollama / Mock |

---

## Setup

### 1. Install dependencies

```powershell
cd A:\Projects\Escapade
npm install
```

### 2. Configure environment

`.env.local` is already set up with:
- Supabase credentials
- Eventbrite API key (`7TQSLIUJPK4EDS7OQSQC`)
- Ticketmaster API key (`EZq8nVHk2AjjxyyJDCbuuDr3m1HoWGMU`)
- Default location: Detroit, MI (lat 42.3314, lng -83.0458)

To enable real AI responses, add one of:
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OR
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### 3. Push DB schema

```powershell
# One-time setup — creates all tables including ExternalEvent, UserAvailability etc.
node scripts/setup.js
```

### 4. Start dev server

```powershell
npm run dev
```

Open **http://localhost:3000**

---

## First Run Walkthrough

1. **Sign up** at `/signup`
2. **Complete onboarding** — pick your vibe, budget style, interests, and location
3. Go to **Discover** → click **Sync Events** button
   - This calls `POST /api/events/ingest` which pulls real events from Eventbrite + Ticketmaster near Detroit
   - Events are upserted into your database and cached for 1 hour
4. Events now appear on **Dashboard** and **Discover**
5. Click **AI Planner** → try "Plan my Saturday with $50"

---

## Event Sync

### Manual (from UI)
Click **Sync Events** on the Discover page — triggers ingestion for Detroit area.

### Via API
```bash
# Manual POST
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{"lat":42.3314,"lng":-83.0458,"city":"Detroit","radiusMiles":30,"daysAhead":14}'

# Cron-friendly GET (requires CRON_SECRET from .env.local)
curl "http://localhost:3000/api/events/ingest?secret=escapade_cron_2026"
```

### Auto-sync (production)
Set up a cron job to call the GET endpoint every 2 hours:
- **Vercel Cron**: add to `vercel.json`
- **GitHub Actions**: schedule workflow
- **Any cron service**: call `GET /api/events/ingest?secret=YOUR_SECRET`

---

## Key Files

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── discover/page.tsx     # Event discovery + real-time filters
│   ├── planner/page.tsx      # Weekly calendar planner
│   ├── budget/page.tsx       # Budget tracker
│   ├── ai/page.tsx           # AI chat planner
│   ├── insights/page.tsx     # Charts + stats
│   ├── journal/page.tsx      # Mood journal
│   ├── onboarding/page.tsx   # First-run setup
│   └── api/
│       ├── events/route.ts         # GET nearby events
│       └── events/ingest/route.ts  # POST/GET trigger ingestion
│
├── services/
│   ├── eventbrite-service.ts   # Eventbrite API client
│   ├── ticketmaster-service.ts # Ticketmaster API client
│   ├── event-ingestion.ts      # Orchestrator (upserts to DB)
│   ├── recommendation-service.ts # Scores events for user
│   └── ai-provider.ts          # Multi-provider AI (Claude/OpenAI/etc)
│
├── lib/
│   ├── recommendation-engine.ts # Multi-signal scorer
│   ├── store.ts                 # Zustand state
│   └── types.ts                 # Domain types
│
└── components/
    ├── layout/Navbar.tsx           # Top bar + sidebar + budget widget
    ├── layout/MobileBottomNav.tsx  # Mobile tab bar
    └── features/profile/ProfileModal.tsx # Settings (profile, schedule, budget)
```

---

## Adding a New City

Change the default coordinates in `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_LAT=40.7128
NEXT_PUBLIC_DEFAULT_LNG=-74.0060
NEXT_PUBLIC_DEFAULT_CITY=New York
```

Then trigger a new sync. Events update automatically.

---

## AI Provider Setup

| Provider | Env Var | AI_PROVIDER value |
|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | `anthropic` |
| OpenAI | `OPENAI_API_KEY` | `openai` |
| Groq | `GROQ_API_KEY` | `groq` |
| Ollama (local) | `OLLAMA_BASE_URL` | `ollama` |
| Mock (no key needed) | — | `mock` |
