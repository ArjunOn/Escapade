## Escapade · Weekend Companion

Escapade is a lifestyle productivity + budget hybrid for weekends. It helps you:

- Plan gentle, realistic weekends
- See your money and time in one place
- Discover activities that fit your vibe and budget
- Track streaks, scores, and habits over time
- Prepare for a future AI assistant that can co-plan with you

### Vision

- **Time**: Treat weekends as a limited, precious resource instead of an afterthought.
- **Money**: Make spending feel intentional and kind rather than restrictive.
- **Energy**: Balance social, active, and restorative time.
- **AI-ready**: All key flows are wired through services so an AI layer can plug in later.

## Architecture

- **Next.js App Router** (`src/app`)
  - `page.tsx` / `dashboard/` – lifestyle dashboard, smart suggestions, streaks, and quick stats
  - `planner/` – weekend planner
  - `budget/` – budget tracker and breakdowns
  - `discover/` – activity discovery with matching
  - `insights/` – historical trends, averages, diversity, and scores
  - `ai/` – natural-language AI companion scaffold
- **Design system**
  - Inter font, light palette (`#F9FAFB` background, `#3AAFA9` primary, `#FF6F61` accent, `#475569` text)
  - Card radius `20px`, soft shadows, and glass components in `globals.css`
- **Domain & state**
  - `src/lib/types.ts` – core domain models (activities, expenses, weekends, history, user profile)
  - `src/lib/store.ts` – persisted Zustand store for accounts and active user state
  - `src/store/index.ts` + `src/types/index.ts` – clean imports for UI layer
- **Business logic layers**
  - `src/lib/analytics.ts` – weekend summaries, budget accuracy, diversity scores, engagement metrics
  - `src/lib/gamification.ts` – weekend score, streaks, and badge logic
  - `src/lib/recommendation-engine.ts` – rule-based recommendations using budget, hours, and preferences
  - `src/services/*` – thin service layer (`analytics-service`, `gamification-service`, `recommendation-service`)
- **Data & persistence**
  - `prisma/schema.prisma` – Postgres schema for users, weekends, activities, planned_activities, budget_logs, engagement_metrics, ai_logs
  - `src/lib/db.ts` – Prisma client

## Tech Stack

- **Framework**: Next.js (App Router, React 19)
- **Styling**: Tailwind CSS v4 + custom design tokens
- **UI kit**: Shadcn-style components
- **State Management**: Zustand (persisted per user)
- **Charts**: Recharts
- **Database**: PostgreSQL via Prisma (schema + client included)

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up the database**:

   ```bash
   npx prisma migrate dev
   npx prisma db seed   # optional once you add a seed script
   ```

   Configure `DATABASE_URL` in `.env` (PostgreSQL).

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Behavioral Design

- **Soft constraints**: Progress bars and scores without harsh failure states.
- **Gentle nudges**: Copy and visuals encourage reflection rather than guilt.
- **Badges & streaks**: Explorer, Budget Master, and Consistent Planner badges are computed by the gamification layer and surfaced in insights.
- **Discover → Plan → Reflect loop**: Discover ideas, plan them, track spend, then look back via insights.

## SaaS & Monetization Roadmap

- **Stripe-ready**: App is structured so that subscription checks can be added in the services layer and/or middleware.
- **Feature gating**:
  - Good candidates for premium tiers:
    - Deep insights (`/insights`)
    - Advanced recommendations and AI companion (`/ai`)
    - Exporting history and advanced analytics
- **Role-based access**:
  - Future `User` model extensions (role field, team/weekend-sharing) can plug into the Prisma schema without breaking existing tables.

## AI Integration Plan

- **Recommendation engine**: Already rule-based and encapsulated in `src/lib/recommendation-engine.ts`.
- **AI companion**:
  - `src/app/ai/page.tsx` calls the recommendation engine and is wired so you can replace the mock handler with a real API call.
  - Add a Next.js route (e.g. `/api/ai/plan-weekend`) that:
    - Accepts natural language input
    - Uses the same context (profile, activities, expenses, budget)
    - Calls OpenAI (or other provider) and shapes results into activity suggestions and budget hints.
- **Analytics & logs**:
  - `AiLog` table in Prisma is ready to store prompts/responses for observability and future tuning.

## 🚀 Production Deployment

### Prerequisites
- Supabase account and project
- Vercel account
- GitHub repository

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider (optional)
AI_PROVIDER=mock
OPENAI_API_KEY=your-key-here
```

### Database Setup

1. Create a Supabase project
2. Get your connection strings from Project Settings → Database
3. Run migrations:
```bash
npx prisma migrate deploy
```

### Deploying to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### AI Provider Setup

By default, the app uses a mock AI provider. To enable real AI:

1. Set `AI_PROVIDER` in environment variables
2. Add the corresponding API key
3. Supported providers: `openai`, `groq`, `claude`, `gemini`, `ollama`

Example for OpenAI:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### Post-Deployment

- Configure redirect URLs in Supabase Auth settings
- Test authentication flow
- Monitor logs in Vercel dashboard
- Check database connections

## 🔒 Security

- All sensitive keys are server-side only
- API routes are protected with Supabase auth
- Input validation on all forms
- Rate limiting implemented
- HTTPS enforced in production

## 📊 Monitoring

Check these after deployment:
- `/api/health` - Health check endpoint
- Vercel Analytics - Performance monitoring
- Supabase Logs - Database queries
- Browser Console - Client-side errors

## Deployment (Legacy Note)

The project is a standard Next.js app and can be deployed on platforms like Vercel.  
Make sure your `DATABASE_URL` and any future Stripe / AI provider keys are configured as environment variables.

