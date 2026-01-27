# Escapade

A high-fidelity Web Application designed to help users balance relaxation, social life, sports, and budgeting. Built with Next.js 14, Tailwind CSS, and Shadcn/UI.

## Features

- **Dashboard**: "Today's Plan" overview and quick stats.
- **Activity Planner**: Visual drag-and-drop style planner (tabbed view) for Friday, Saturday, and Sunday.
- **Budget Tracker**: Set budgets, log expenses, and view spending breakdown with a Pie Chart.
- **Discovery**: Find mock local events (Concerts, Sports, etc.).
- **Calendar**: Weekend schedule at a glance.
- **Journal**: Reflect on your weekend with mood tracking.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand (Persisted locally)
- **Icons**: Lucide-React
- **Charts**: Recharts

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Folder Structure

```
/src
  /app           # Next.js App Router pages
    /budget      # Budget Tracker
    /calendar    # Calendar View
    /discovery   # Event Discovery
    /journal     # Journal & Reflection
    /planner     # Activity Planner
    layout.tsx   # Main Root Layout
    page.tsx     # Dashboard (Home)
    globals.css  # Global styles & Tailwind config
  /components
    /layout      # Navbar and shared layout components
    /ui          # Shadcn UI reusable components
  /lib
    store.ts     # Zustand global store
    types.ts     # TypeScript interfaces
    utils.ts     # Helper functions
```

## Deployment

The project is standard Next.js and ready for deployment on [Vercel](https://vercel.com).
