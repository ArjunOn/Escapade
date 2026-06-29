# Escapade — Your Weekend Event Companion

> Discover real local events, plan your time, track your budget, and set goals — powered by Eventbrite, Ticketmaster, and AI.

Live at: **[escapade-delta.vercel.app](https://escapade-delta.vercel.app)**

---

## What It Does

| Feature | Description |
|---|---|
| **Discover** | Live events from Eventbrite & Ticketmaster near your location |
| **Planner** | Weekly calendar view — add events, check in, track what you did |
| **Budget** | Set a weekly spending goal and log expenses by category |
| **Goals** | Short-term and long-term goals with progress tracking |
| **AI Planner** | Chat with an AI that knows your budget, vibe, and local events |
| **Journal** | Capture moods and memories after weekends |
| **Insights** | Spending charts and activity streaks |
| **Weather** | 7-day forecast on the planner, rain warnings for outdoor events |
| **Dark mode** | System-aware toggle, persisted to localStorage |
| **PWA** | Installable on mobile and desktop |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Auth | Supabase Auth (email/password, session cookies via `@supabase/ssr`) |
| Database | Supabase PostgreSQL + Prisma ORM |
| State | Zustand (persisted, client-side) |
| Styling | Tailwind CSS + CSS variables design system |
| AI | Claude API (Anthropic) via `@anthropic-ai/sdk` |
| Events | Eventbrite API + Ticketmaster Discovery API |
| Weather | Open-Meteo API (free, no API key) |
| Geocoding | Nominatim / OpenStreetMap (free, no API key) |
| Deployment | Vercel (Hobby plan) |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Dashboard (authenticated) / Landing (unauthenticated)
│   ├── login/page.tsx          # Sign-in page
│   ├── signup/page.tsx         # Account creation page
│   ├── onboarding/page.tsx     # First-run setup (location, vibe, budget)
│   ├── discover/page.tsx       # Event discovery map/feed
│   ├── planner/page.tsx        # Weekly planner with weather strip
│   ├── goals/page.tsx          # Goals tracking
│   ├── budget/page.tsx         # Budget tracker
│   ├── ai/page.tsx             # AI weekend planner chat
│   ├── insights/page.tsx       # Charts and streaks
│   ├── journal/page.tsx        # Weekend journal
│   ├── saved/page.tsx          # Saved events
│   ├── events/[id]/page.tsx    # Public event detail page (shareable)
│   └── api/                    # API routes
│       ├── events/route.ts     # Fetch nearby events (Eventbrite + Ticketmaster)
│       ├── events/ingest/      # Cron job: ingest events into DB
│       ├── goals/route.ts      # Goals CRUD
│       ├── goals/[id]/route.ts
│       ├── ai/plan-weekend/    # AI planner endpoint
│       └── user/profile/       # User profile sync
├── components/
│   ├── layout/                 # Navbar, MobileBottomNav, RouteGuard
│   ├── features/               # LoginModal, BudgetTracker, ProfileModal, etc.
│   └── ui/                     # Shared components (Toast, DarkModeToggle, etc.)
├── contexts/
│   └── AuthContext.tsx         # Auth state + signIn / signUp / signOut
├── lib/
│   ├── auth-service.ts         # Supabase auth wrapper with typed errors
│   ├── db.ts                   # Prisma client singleton
│   ├── store.ts                # Zustand store
│   ├── types.ts                # Shared TypeScript types
│   ├── validation.ts           # Email, password, username validators
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client (RSC / Route Handlers)
│   │   └── middleware.ts       # Session refresh middleware
│   └── utils.ts                # cn() and misc helpers
├── services/
│   ├── eventbrite-service.ts
│   ├── ticketmaster-service.ts
│   ├── weather-service.ts      # Open-Meteo integration
│   └── ai-provider.ts
└── middleware.ts               # Next.js middleware (session refresh)

prisma/
└── schema.prisma               # DB schema: User, Goal, ExternalEvent, Activity, etc.

scripts/
├── setup.js                    # One-time DB setup helper
└── push-schema.js              # Prisma schema push workaround for local dev
```

---

## Authentication Flow

Escapade uses **Supabase Auth** with email/password.

### Sign In (`/login`)
1. User enters email + password (both validated client-side before submission)
2. Calls `supabase.auth.signInWithPassword()`
3. On success → redirects to `/` (or `/onboarding` if first time)
4. On **"Invalid login credentials"** → shows amber banner:
   - "No account found with these credentials"
   - CTA button: **"Create a free account"** (pre-fills email on `/signup`)
5. All errors surface inline on the relevant field or as a banner

### Sign Up (`/signup`)
1. User enters name, email, password (with strength meter), confirm password
2. Client-side validation via `validateSignupForm()`:
   - Email format check
   - Password: min 8 chars, at least one letter + one number
   - Name: 3–20 chars, alphanumeric + underscores
   - Passwords match
3. Calls `supabase.auth.signUp()` (email confirmation is **disabled** in Supabase settings)
4. On success → redirects to `/onboarding`
5. On **email already registered** → shows blue banner with "Sign in instead" CTA

### Session Management
- Sessions are maintained via HttpOnly cookies (`@supabase/ssr`)
- `middleware.ts` silently refreshes tokens on every request
- `AuthContext` listens to `onAuthStateChange` and syncs with Zustand store

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Event APIs
EVENTBRITE_API_KEY=your-key
TICKETMASTER_API_KEY=your-key

# AI
ANTHROPIC_API_KEY=your-claude-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Weather (Open-Meteo) and geocoding (Nominatim) require no API keys.

---

## Local Development

```bash
# Install dependencies
npm install

# Push Prisma schema to Supabase
npm run db:push

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Supabase Setup

1. Create a project at [app.supabase.com](https://app.supabase.com)
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**
3. **Disable email confirmation**: Authentication → Email Templates → uncheck "Enable email confirmations"
4. Add your site URL to **Authentication → URL Configuration → Redirect URLs**

---

## Deployment (Vercel)

The project is deployed on Vercel. Every push to `main` triggers a new production deploy.

```bash
# Push to deploy
git add -A
git commit -m "your message"
git push origin main
```

### Vercel Environment Variables
Set all variables from `.env.local` in **Vercel → Project → Settings → Environment Variables**.

### Cron Jobs
`vercel.json` defines a daily event ingestion cron (Vercel Hobby plan allows 1 cron/day):
```json
{
  "crons": [{ "path": "/api/events/ingest", "schedule": "0 8 * * *" }]
}
```

---

## Database Schema (Key Models)

| Model | Purpose |
|---|---|
| `User` | Auth user record linked to Supabase UID |
| `Goal` | Short/long-term goals with progress tracking |
| `ExternalEvent` | Ingested events from Eventbrite/Ticketmaster |
| `Activity` | User's planned activities for the week |
| `PlannedActivity` | Events added to user's planner |
| `BudgetLog` | Expense entries with category |
| `SavedEvent` | Bookmarked events |
| `Weekend` | Weekend plan containers |

---

## Design System

CSS variables defined in `globals.css`, toggled via `data-theme="dark"` on `<html>`:

```css
--color-primary          /* Brand blue */
--color-surface          /* Card backgrounds */
--color-bg               /* Page background */
--color-bg-alt           /* Input backgrounds */
--color-border           /* Borders */
--color-text-primary     /* Main text */
--color-text-secondary   /* Subdued text */
--color-text-muted       /* Placeholder / disabled */
--color-success          /* Green for completed states */
```

Dark mode is system-aware and persisted to `localStorage` via the `DarkModeToggle` component.

---

## Key Libraries

```json
{
  "next": "15.x",
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "@prisma/client": "^6.x",
  "zustand": "^5.x",
  "@anthropic-ai/sdk": "^0.x",
  "date-fns": "^4.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```
