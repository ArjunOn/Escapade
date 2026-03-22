"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, MapPin, Clock, DollarSign, Zap, ChevronRight,
  Plus, Compass, TrendingUp, Star, ArrowRight, CheckCircle2,
  Sparkles, RefreshCw
} from "lucide-react";
import { LoginModal } from "@/components/features/auth/LoginModal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

// ─── Category color map (GCal-style) ──────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "Music":          "#e91e63",
  "Sports & Fitness":"#f57c00",
  "Arts":           "#00838f",
  "Food & Drink":   "#e64a19",
  "Community":      "#7b1fa2",
  "Outdoor":        "#2e7d32",
  "Tech":           "#1565c0",
  "Family":         "#f9a825",
  "Wellness":       "#388e3c",
  "Social":         "#7b1fa2",
  "Events":         "#1a73e8",
  "default":        "#5f6368",
};

function getCategoryColor(category?: string | null) {
  if (!category) return CATEGORY_COLORS.default;
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return CATEGORY_COLORS.default;
}

function getCategoryChipClass(category?: string | null): string {
  const c = (category || "").toLowerCase();
  if (c.includes("music"))   return "chip-music";
  if (c.includes("outdoor") || c.includes("nature")) return "chip-outdoor";
  if (c.includes("sport"))   return "chip-sports";
  if (c.includes("social") || c.includes("community")) return "chip-social";
  if (c.includes("food"))    return "chip-food";
  if (c.includes("art"))     return "chip-arts";
  if (c.includes("wellness") || c.includes("health")) return "chip-wellness";
  if (c.includes("tech"))    return "chip-tech";
  if (c.includes("family"))  return "chip-family";
  return "chip-other";
}

function formatEventDate(dt: string | Date): string {
  const d = typeof dt === "string" ? parseISO(dt) : dt;
  if (isToday(d))    return `Today · ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow · ${format(d, "h:mm a")}`;
  if (isThisWeek(d)) return format(d, "EEEE · h:mm a");
  return format(d, "MMM d · h:mm a");
}

// ─── Greeting based on time of day ────────────────────────────────────────────
function getGreeting(name?: string): string {
  const h = new Date().getHours();
  const first = name ? name.split(" ")[0] : "there";
  if (h < 12) return `Good morning, ${first} ☀️`;
  if (h < 17) return `Good afternoon, ${first} 👋`;
  return `Good evening, ${first} 🌙`;
}

// ─── Event Card Component ─────────────────────────────────────────────────────
function EventCard({ event, onSave, saved }: { event: any; onSave?: () => void; saved?: boolean }) {
  const color = getCategoryColor(event.category || event.sourceName);
  return (
    <div
      className="event-card card card-interactive p-4 flex gap-3"
      style={{ "--event-color": color } as React.CSSProperties}
      onClick={() => event.url && window.open(event.url, "_blank")}
    >
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      )}
      {!event.imageUrl && (
        <div
          className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
          style={{ background: color + "18" }}
        >
          <Compass className="w-6 h-6" style={{ color }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">{event.title}</h4>
        <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--color-text-secondary)]">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{formatEventDate(event.startDateTime)}</span>
        </div>
        {event.locationName && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--color-text-secondary)]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.locationName}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className={cn("event-chip", getCategoryChipClass(event.category))}>
            {event.category || event.sourceName}
          </span>
          <span className={cn("text-xs font-semibold", event.isFree ? "text-[var(--color-free)]" : "text-[var(--color-text-secondary)]")}>
            {event.isFree ? "Free" : `$${event.cost}`}
          </span>
        </div>
      </div>
      {onSave && (
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          className={cn(
            "self-start p-1.5 rounded-full transition-colors",
            saved ? "text-yellow-500 bg-yellow-50" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)]"
          )}
        >
          <Star className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "#1a73e8" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <p className="text-2xl font-medium text-[var(--color-text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ activity }: { activity: any }) {
  const color = getCategoryColor(activity.category);
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", activity.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>
          {activity.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">{activity.date} · {activity.startTime}</p>
      </div>
      <span className="text-xs text-[var(--color-text-secondary)]">${activity.cost}</span>
      {activity.completed && <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, expenses, weeklySavingsGoal, activities, syncStore, currentUserEmail, availabilityWindows } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [scoredEvents, setScoredEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => { if (currentUserEmail) syncStore(); }, [currentUserEmail, syncStore]);

  useEffect(() => {
    // Only redirect to onboarding once auth is settled and profile is loaded
    if (!authLoading && user && userProfile && !userProfile.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [userProfile, router, authLoading, user]);

  const fetchNearby = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/events?lat=42.3314&lng=-83.0458&days=14&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setNearbyEvents(data.events || []);
        if (data.events?.length === 0) toast("No events in DB yet — go to Discover and click Sync Events", "info");
      }
    } catch (_) {} finally { setEventsLoading(false); }
  }, []);

  // Fetch + score personalised recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!userProfile) return;
    try {
      const { fetchAndScoreRecommendations } = await import("@/services/recommendation-service");
      const totalSpentNow = expenses.reduce((s, e) => s + e.amount, 0);
      const results = await fetchAndScoreRecommendations({
        userPreferences: userProfile.preferences || [],
        userVibes: userProfile.vibes || [],
        weeklyBudgetRemaining: Math.max((weeklySavingsGoal || 0) - totalSpentNow, 0),
        userLat: 42.3314,
        userLng: -83.0458,
        availabilityWindows: availabilityWindows || [],
      }, 4);
      setScoredEvents(results);
    } catch (_) {}
  }, [userProfile, expenses, weeklySavingsGoal]);

  useEffect(() => { if (user) fetchNearby(); }, [user, fetchNearby]);
  useEffect(() => { if (user && userProfile?.onboardingCompleted) fetchRecommendations(); }, [user, userProfile, fetchRecommendations]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - totalSpent, 0);
  const budgetPct = weeklySavingsGoal > 0 ? Math.min((totalSpent / weeklySavingsGoal) * 100, 100) : 0;
  const upcomingActivities = useMemo(() =>
    activities.filter(a => !a.completed).slice(0, 5), [activities]);

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LandingPage onLogin={() => setIsLoginModalOpen(true)} isLoginOpen={isLoginModalOpen} onLoginClose={() => setIsLoginModalOpen(false)} />;
  if (!userProfile) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">{getGreeting(userProfile.name)}</h1>
          <p className="page-subtitle">
            {format(new Date(), "EEEE, MMMM d")} · Here's what's happening around you
          </p>
        </div>
        <Link href="/discover"
          className="hidden md:flex items-center gap-2 btn-primary text-sm rounded-full px-4 py-2">
          <Plus className="w-4 h-4" /> Find Events
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Budget remaining" value={`$${budgetRemaining.toFixed(0)}`}
          sub={`of $${weeklySavingsGoal} this week`} color="#1a73e8" />
        <StatCard icon={Calendar} label="Planned activities" value={String(upcomingActivities.length)}
          sub="upcoming this week" color="#e91e63" />
        <StatCard icon={TrendingUp} label="Spent so far" value={`$${totalSpent.toFixed(0)}`}
          sub={`${budgetPct.toFixed(0)}% of budget`} color="#f57c00" />
        <StatCard icon={Zap} label="Events nearby" value={eventsLoading ? "..." : String(nearbyEvents.length)}
          sub="in the next 14 days" color="#34a853" />
      </div>

      {/* Budget Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Weekly Budget</span>
          <span className="text-sm text-[var(--color-text-secondary)]">${totalSpent.toFixed(0)} / ${weeklySavingsGoal}</span>
        </div>
        <div className="h-2 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${budgetPct}%`,
              background: budgetPct > 90 ? "var(--color-error)" : budgetPct > 70 ? "var(--color-warning)" : "var(--color-primary)"
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--color-text-muted)]">
            {budgetPct > 90 ? "⚠️ Almost at limit" : `$${budgetRemaining.toFixed(0)} remaining`}
          </span>
          <Link href="/budget" className="text-xs text-[var(--color-primary)] font-medium">Manage →</Link>
        </div>
      </div>

      {/* Picked For You — personalised scored recommendations */}
      {scoredEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Picked For You</h2>
            </div>
            <Link href="/discover" className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {scoredEvents.map((ev: any) => {
              const color = getCategoryColor(ev.category);
              return (
                <div key={ev.id}
                  onClick={() => ev.url && window.open(ev.url, "_blank")}
                  className="card card-interactive p-3 space-y-2 cursor-pointer"
                  style={{ "--event-color": color } as React.CSSProperties}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("event-chip text-[10px]", getCategoryChipClass(ev.category))}>
                      {ev.category || "Event"}
                    </span>
                    <span className={cn("text-xs font-semibold flex-shrink-0", ev.isFree ? "text-[var(--color-free)]" : "text-[var(--color-text-secondary)]")}>
                      {ev.isFree ? "Free" : `$${ev.cost}`}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">{ev.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{ev.reason}</p>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{format(ev.startDateTime instanceof Date ? ev.startDateTime : new Date(ev.startDateTime), "EEE, MMM d")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Events */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Events Near You</h2>
            <div className="flex items-center gap-2">
              <button onClick={fetchNearby} className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors">
                <RefreshCw className={cn("w-4 h-4 text-[var(--color-text-muted)]", eventsLoading && "animate-spin")} />
              </button>
              <Link href="/discover" className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1">
                See all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-4 h-24 animate-pulse bg-[var(--color-bg-alt)]" />
              ))}
            </div>
          ) : nearbyEvents.length > 0 ? (
            <div className="space-y-2">
              {nearbyEvents.slice(0,6).map(ev => (
                <EventCard key={ev.id} event={ev}
                  saved={savedIds.has(ev.id)}
                  onSave={() => setSavedIds(p => {
                    const n = new Set(p);
                    n.has(ev.id) ? n.delete(ev.id) : n.add(ev.id);
                    return n;
                  })} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Compass className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">No events in the database yet</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Go to <a href="/discover" className="text-[var(--color-primary)] font-medium underline">Discover</a> and click <strong>Sync Events</strong> to pull real events from Eventbrite and Ticketmaster near you.
              </p>
              <a href="/discover" className="btn-primary rounded-full px-5 py-2 text-sm inline-flex items-center gap-2">
                <Compass className="w-4 h-4" /> Go to Discover
              </a>
            </div>
          )}
        </div>

        {/* Right: My Week */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">My Week</h2>
            <Link href="/planner" className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1">
              Open planner <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {upcomingActivities.length > 0 ? (
              <div className="divide-y divide-[var(--color-border-light)]">
                {upcomingActivities.map(act => (
                  <div key={act.id} className="px-1 py-0.5">
                    <ActivityRow activity={act} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Calendar className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">Nothing planned yet</p>
                <Link href="/planner" className="btn-ghost text-xs rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add activity
                </Link>
              </div>
            )}
          </div>

          {/* Quick AI suggestion */}
          <div className="card p-4 border-[var(--color-primary)] border-opacity-30 bg-[var(--color-primary-light)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-xs font-semibold text-[var(--color-primary)]">AI Planner</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              Let AI plan your perfect weekend based on your budget, interests, and real nearby events.
            </p>
            <Link href="/ai" className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
              Plan my weekend <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page (unauthenticated) ──────────────────────────────────────────
function LandingPage({ onLogin, isLoginOpen, onLoginClose }: {
  onLogin: () => void; isLoginOpen: boolean; onLoginClose: () => void;
}) {
  const features = [
    { icon: Compass, color: "#1a73e8", title: "Discover Real Events", desc: "Live events from Eventbrite & Ticketmaster near you — music, food, sports, arts, and more." },
    { icon: DollarSign, color: "#34a853", title: "Budget-Aware Planning", desc: "Set a weekly budget and see which events you can actually afford right now." },
    { icon: Sparkles, color: "#e91e63", title: "AI Weekend Planner", desc: "Tell AI your free time and budget. Get a full weekend schedule using real local events." },
  ];
  return (
    <div className="max-w-3xl mx-auto text-center space-y-12 py-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> Real events · Smart planning · Your budget
        </div>
        <h1 className="text-4xl font-medium text-[var(--color-text-primary)] leading-tight">
          Your personal weekend<br />event companion
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-xl mx-auto">
          Discover what's happening near you, plan your time, and stick to your budget — all in one friendly app.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/signup" className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium">
            Get started free
          </Link>
          <button onClick={onLogin} className="btn-ghost rounded-full px-6 py-2.5 text-sm font-medium border border-[var(--color-border)]">
            Sign in
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        {features.map(f => (
          <div key={f.title} className="card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: f.color + "18" }}>
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{f.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </div>
  );
}
