# VSCode Implementation Prompt for Escapade Redesign

**Copy this entire prompt and paste it into Claude Code, Cursor, or your AI coding assistant in VSCode:**

---

You are redesigning the Escapade weekend planning app from a dark military/tactical theme to a bright, friendly, welcoming theme for general public users. The app helps people plan their weekends with time management, budgeting, and activity discovery.

## Context
- Next.js 15 app with App Router
- React 19, TypeScript
- Tailwind CSS v4
- Shadcn UI components
- Framer Motion animations
- Zustand state management

## Project Location
Local path: `A:/Projects/Escapade`

---

## PHASE 1: CORE DESIGN SYSTEM (Priority 1)

### Task 1.1: Update Color System
**File:** `src/app/globals.css`

Replace the entire `@theme` section with:

```css
@theme {
  --font-sans: var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-heading: 'Fraunces', Georgia, serif;

  /* Spacing */
  --radius-xl: 20px;
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;

  /* Light, welcoming backgrounds */
  --color-background: #FAFAFA;
  --color-foreground: #1F2937;

  --color-card: #FFFFFF;
  --color-card-foreground: #1F2937;

  --color-popover: #FFFFFF;
  --color-popover-foreground: #1F2937;

  /* Indigo primary - trustworthy and calming */
  --color-primary: #6366F1;
  --color-primary-light: #818CF8;
  --color-primary-dark: #4F46E5;
  --color-primary-foreground: #FFFFFF;

  /* Warm secondary */
  --color-secondary: #F3F4F6;
  --color-secondary-foreground: #1F2937;

  --color-muted: #F3F4F6;
  --color-muted-foreground: #6B7280;

  /* Warm amber accent */
  --color-accent: #F59E0B;
  --color-accent-light: #FBBF24;
  --color-accent-foreground: #FFFFFF;

  --color-destructive: #EF4444;
  --color-destructive-foreground: #FFFFFF;

  --color-border: #E5E7EB;
  --color-input: #F9FAFB;
  --color-ring: #6366F1;

  /* Category colors - softer, friendlier */
  --relaxation: #A78BFA;
  --social: #34D399;
  --outdoor: #FBBF24;
  --sports: #FB7185;
  --events: #818CF8;
  --budget: #F59E0B;
  --traveling: #60A5FA;

  /* Success states */
  --color-success: #10B981;
  --color-info: #3B82F6;
  --color-warning: #F59E0B;
}
```

Update the utility classes section to remove dark glass effects:

```css
@layer utilities {
  .glass {
    @apply bg-white border border-gray-100 rounded-2xl shadow-lg;
  }
  
  .card-gradient {
    background: linear-gradient(to bottom right, #FFFFFF, #F9FAFB);
  }
  
  .hero-gradient {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  }
  
  /* Keep existing category color utilities */
}
```

### Task 1.2: Update Base Styles
In the same `globals.css` file, update:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply text-foreground bg-background min-h-screen selection:bg-primary/20;
  }

  h1 {
    @apply text-4xl md:text-5xl font-bold text-gray-900 tracking-tight;
  }

  h2 {
    @apply text-3xl md:text-4xl font-bold text-gray-900 tracking-tight;
  }

  h3 {
    @apply text-2xl font-semibold text-gray-800;
  }

  p {
    @apply text-base text-gray-600 leading-relaxed;
  }
}
```

---

## PHASE 2: NAVIGATION REDESIGN

### Task 2.1: Update Navbar Component
**File:** `src/components/layout/Navbar.tsx`

Changes needed:
1. Remove all dark glass-morphism styling
2. Make navigation light with white background
3. Replace "Commander" with user's first name
4. Simplify the design
5. Remove aggressive uppercase tracking

Key updates:
- Change navbar background from `glass` to `bg-white border-b border-gray-100 shadow-sm`
- Update text colors from `text-white` to `text-gray-900`
- Change icon colors to be more colorful (use category colors)
- Replace `tracking-widest` with `tracking-normal` or `tracking-wide`
- Update user popover to show name instead of "Commander"
- Make mobile nav light themed

Replace the entire navbar with a clean, light design. Use soft shadows instead of glass effects.

---

## PHASE 3: HOMEPAGE REDESIGN

### Task 3.1: Update Main Dashboard Page
**File:** `src/app/page.tsx`

Major changes:

#### Hero Section (Logged Out State):
```tsx
// Replace the dark hero with bright, welcoming design
<div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6 max-w-3xl px-4"
  >
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
      <Sparkles className="w-4 h-4" />
      Your Weekend, Beautifully Organized
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
      Make Every Weekend{" "}
      <span className="text-primary">Count</span>
    </h1>
    <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
      Plan weekends you'll actually look forward to—with time, budget, and energy in harmony.
    </p>
  </motion.div>
  {/* Rest of hero content */}
</div>
```

#### Replace Military Language:
- "Weekday mode · building your weekend fund" → "Planning mode · Build your weekend fund"
- "Weekend mode · time to enjoy" → "Weekend mode · Time to enjoy!"
- "Plan the weekend you need." → "Plan Your Perfect Weekend"
- "Enjoy the weekend you planned." → "Enjoy Your Weekend!"
- Remove ShieldCheck/Rocket military icons, use Calendar, Sun, Coffee icons instead

#### Update Cards:
- Change all dark cards to light: `className="bg-white border border-gray-100 rounded-2xl shadow-md p-6"`
- Use colorful accent borders for different sections
- Add soft hover effects: `hover:shadow-lg transition-shadow`

#### Countdown Timer:
- Make it less aggressive, more friendly
- Use softer colors and font
- Change "DAYS/HRS/MIN" to "days / hours / minutes"
- Make it optional/collapsible

#### Discovery Section:
- Replace "Top Matched Escapades" with "Perfect For You"
- Change "Elite Match" badge to "Recommended" with softer styling
- Replace "Initialize" button with "Add to Weekend" 
- Use warm colors for categories

---

## PHASE 4: PLANNER PAGE REDESIGN

### Task 4.1: Redesign Planner
**File:** `src/app/planner/page.tsx`

Complete overhaul needed:

```tsx
// New header section
<header className="space-y-4">
  <div className="flex items-center gap-2 text-primary">
    <Calendar className="w-5 h-5" />
    <span className="text-sm font-semibold">Weekend Planner</span>
  </div>
  <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
    Plan Your Weekend
  </h1>
  <p className="text-xl text-gray-600">
    Add activities, set times, and make this weekend yours.
  </p>
</header>
```

Form updates:
- Replace "Mission Title" → "What do you want to do?"
- Replace "Temporal Window" → "When?"
- Replace "Classification" → "Activity Type"
- Replace "Deployment Parameters" → "Activity Details"
- Replace "Initialize Operation" → "Add Activity"

Input styling:
```tsx
<Input
  placeholder="e.g., Brunch with friends, Morning hike..."
  className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-primary focus:ring-primary"
/>
```

Add friendly empty state:
```tsx
{activities.length === 0 && (
  <div className="py-16 flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <Calendar className="w-8 h-8 text-primary" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-semibold text-gray-900">
        Your weekend is wide open!
      </h3>
      <p className="text-gray-600">
        Add your first activity to get started.
      </p>
    </div>
    <Button className="bg-primary hover:bg-primary-dark text-white">
      Add Your First Activity
    </Button>
  </div>
)}
```

---

## PHASE 5: DISCOVERY PAGE UPDATES

### Task 5.1: Update Discovery/Browse
**File:** `src/app/discovery/page.tsx` or similar

Changes:
1. Light card backgrounds with category color accents
2. Replace "Initialize" with "Add to Weekend"
3. Add heart icon for "Save for later"
4. Use friendly tags: "Budget-friendly", "Quick & Easy", "Perfect for you"
5. Add images/illustrations to cards
6. Soft hover effects

Card structure:
```tsx
<Card className="bg-white border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all rounded-2xl overflow-hidden group">
  <CardContent className="p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl">
        {event.icon}
      </div>
      <Badge className="bg-primary/10 text-primary text-xs font-semibold">
        Perfect for you
      </Badge>
    </div>
    {/* Rest of card content */}
  </CardContent>
</Card>
```

---

## PHASE 6: BUDGET TRACKER IMPROVEMENTS

### Task 6.1: Friendly Budget Design
**File:** Look for BudgetTracker component

Updates:
1. Replace aggressive warnings with encouraging messages
2. Use growth/savings metaphors
3. Add "You're doing great!" when on track
4. Soft gradient progress bars
5. Celebrate milestones

Progress bar:
```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm font-medium text-gray-600">
    <span>Weekend Fund Progress</span>
    <span className="text-primary font-semibold">
      {progress}% saved
    </span>
  </div>
  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
    />
  </div>
  {progress >= 80 && (
    <p className="text-sm text-success font-medium flex items-center gap-1">
      <Sparkles className="w-4 h-4" />
      You're doing great! Keep it up!
    </p>
  )}
</div>
```

---

## PHASE 7: COMPONENT UPDATES

### Task 7.1: Update Button Component
**File:** `src/components/ui/button.tsx`

Update variants to be more colorful and friendly:
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg",
        destructive: "bg-red-500 hover:bg-red-600 text-white",
        outline: "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
        ghost: "hover:bg-gray-100 text-gray-900",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Task 7.2: Update Card Component
**File:** `src/components/ui/card.tsx`

Make cards lighter and more welcoming:
```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border border-gray-100 rounded-2xl shadow-md text-gray-900",
        className
      )}
      {...props}
    />
  )
)
```

---

## PHASE 8: MICRO-INTERACTIONS

### Task 8.1: Add Celebration Animations
Add confetti or celebration effects when:
- Activity completed
- Budget goal reached
- Streak milestone achieved

Use Framer Motion for animations:
```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {/* Content */}
</motion.div>
```

### Task 8.2: Add Toast Notifications
Install and configure a toast library (if not present):
```bash
npm install sonner
```

Add friendly success messages:
- "Added to your weekend! 🎉"
- "Activity completed! Great job! ✨"
- "Budget updated! You're on track! 💰"

---

## PHASE 9: EMPTY STATES & FEEDBACK

### Task 9.1: Create Empty State Component
**File:** `src/components/ui/empty-state.tsx`

```tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel
}: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      {action && (
        <Button onClick={action} className="bg-primary hover:bg-primary-dark text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

---

## PHASE 10: ACCESSIBILITY & POLISH

### Task 10.1: Improve Contrast
Ensure all text meets WCAG AA standards:
- Body text: #1F2937 on #FFFFFF
- Secondary text: #6B7280 on #FFFFFF  
- Primary button text: #FFFFFF on #6366F1

### Task 10.2: Touch Targets
All interactive elements minimum 44x44px:
```tsx
className="min-h-[44px] min-w-[44px]"
```

### Task 10.3: Focus States
Add visible focus indicators:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

---

## TESTING CHECKLIST

After implementation, verify:
- [ ] No military/tactical language remains
- [ ] All pages use light theme
- [ ] Colors follow new design system
- [ ] Typography is readable (min 14px)
- [ ] Buttons are friendly and colorful
- [ ] Cards have soft shadows
- [ ] Animations are smooth
- [ ] Empty states are encouraging
- [ ] Success states are celebratory
- [ ] Mobile responsive
- [ ] Accessible (keyboard nav, focus states, contrast)

---

## IMPLEMENTATION ORDER

1. ✅ Update globals.css (colors, typography)
2. ✅ Update Navbar component
3. ✅ Update homepage/dashboard
4. ✅ Update planner page
5. ✅ Update discovery page
6. ✅ Update budget tracker
7. ✅ Update UI components (button, card, input)
8. ✅ Add micro-interactions
9. ✅ Create empty states
10. ✅ Polish and accessibility

---

## FINAL NOTES

- Use Inter font for body, consider Fraunces or similar friendly serif for headings
- Keep animations subtle and delightful
- Always test in light mode (this is primary now)
- Focus on making users feel good about planning their weekend
- Avoid any language that creates pressure or anxiety
- Celebrate small wins
- Make errors friendly, not scary

**Goal:** Transform this from a tactical military operation simulator into a joyful weekend companion that people actually want to use.
