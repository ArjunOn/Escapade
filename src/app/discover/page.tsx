"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store";
import {
  Search, SlidersHorizontal, MapPin, Clock, Star,
  Compass, X, RefreshCw, ExternalLink, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const CATEGORIES = ["All", "Music", "Sports & Fitness", "Arts", "Food & Drink", "Community", "Outdoor", "Tech", "Family", "Wellness"];
const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function getCategoryColor(category?: string | null): string {
  const map: Record<string, string> = {
    "Music": "#e91e63", "Sports & Fitness": "#f57c00", "Arts": "#00838f",
    "Food & Drink": "#e64a19", "Community": "#7b1fa2", "Outdoor": "#2e7d32",
    "Tech": "#1565c0", "Family": "#f9a825", "Wellness": "#388e3c",
  };
  if (!category) return "#5f6368";
  for (const [k, v] of Object.entries(map)) {
    if (category.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "#1a73e8";
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    eventbrite: "#f05537", ticketmaster: "#026cdf", meetup: "#ed1c40",
  };
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
      background: (colors[source] || "#5f6368") + "18",
      color: colors[source] || "#5f6368",
    }}>
      {source}
    </span>
  );
}

function EventGridCard({ event, onSave, saved }: { event: any; onSave: () => void; saved: boolean }) {
  const color = getCategoryColor(event.category);
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
      style={{ "--event-color": color } as React.CSSProperties}>
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-[var(--color-bg-alt)]">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: color + "18" }}>
            <Compass className="w-8 h-8" style={{ color }} />
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          className={cn("absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors",
            saved ? "bg-yellow-400 text-white" : "bg-white/80 text-[var(--color-text-muted)] hover:bg-white"
          )}
        >
          <Star className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
        </button>
        {event.isFree && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[var(--color-free)] text-white text-[10px] font-bold">
            FREE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{format(parseISO(event.startDateTime), "EEE, MMM d · h:mm a")}</span>
        </div>
        {event.locationName && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.locationName}{event.city ? `, ${event.city}` : ""}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <SourceBadge source={event.sourceName} />
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold", event.isFree ? "text-[var(--color-free)]" : "text-[var(--color-text-primary)]")}>
              {event.isFree ? "Free" : `$${event.cost}${event.costMax && event.costMax !== event.cost ? `–$${event.costMax}` : ""}`}
            </span>
            <a href={event.url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { weeklySavingsGoal, expenses } = useAppStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [maxCost, setMaxCost] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("date");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - expenses.reduce((s, e) => s + e.amount, 0), 0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ lat: "42.3314", lng: "-83.0458", days: "14", limit: "60" });
    if (freeOnly) params.set("free", "true");
    if (maxCost !== "") params.set("maxCost", String(maxCost));
    if (category !== "All") params.set("category", category);
    try {
      const res = await fetch(`/api/events?${params}`);
      if (res.ok) { const d = await res.json(); setEvents(d.events || []); }
    } catch (_) {} finally { setLoading(false); }
  }, [freeOnly, maxCost, category]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const triggerIngest = async () => {
    setIngesting(true);
    try {
      await fetch("/api/events/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: 42.3314, lng: -83.0458, city: "Detroit", radiusMiles: 30, daysAhead: 14 }),
      });
      await fetchEvents();
    } finally { setIngesting(false); }
  };

  const filtered = events.filter(e => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.title?.toLowerCase().includes(q) && !e.locationName?.toLowerCase().includes(q) && !e.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.cost - b.cost;
    if (sortBy === "price_desc") return b.cost - a.cost;
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Discover Events</h1>
          <p className="page-subtitle">Real events near Detroit · Next 14 days</p>
        </div>
        <button onClick={triggerIngest} disabled={ingesting}
          className="hidden md:flex items-center gap-2 btn-primary text-sm rounded-full px-4 py-2 disabled:opacity-60">
          <RefreshCw className={cn("w-4 h-4", ingesting && "animate-spin")} />
          {ingesting ? "Syncing..." : "Sync Events"}
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="card p-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, venues, categories..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--color-bg-alt)] border-0 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            )}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--color-bg-alt)] border-0 text-sm text-[var(--color-text-secondary)] focus:outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn("flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                category === cat
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              )}>
              {cat}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-[var(--color-border-light)]">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
              <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} className="accent-[var(--color-primary)]" />
              Free events only
            </label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
              <input type="number" placeholder="Max price" value={maxCost}
                onChange={e => setMaxCost(e.target.value ? Number(e.target.value) : "")}
                className="w-24 px-2 py-1 rounded-lg bg-[var(--color-bg-alt)] border-0 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
            <button onClick={() => setMaxCost(budgetRemaining)}
              className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1">
              Use my budget (${budgetRemaining.toFixed(0)})
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {loading ? "Loading..." : `${filtered.length} events found`}
        </span>
        <button onClick={triggerIngest} disabled={ingesting} className="md:hidden flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
          <RefreshCw className={cn("w-3 h-3", ingesting && "animate-spin")} /> Sync
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-64 animate-pulse bg-[var(--color-bg-alt)]" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <EventGridCard key={ev.id} event={ev}
              saved={savedIds.has(ev.id)}
              onSave={() => setSavedIds(p => { const n = new Set(p); n.has(ev.id) ? n.delete(ev.id) : n.add(ev.id); return n; })}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Compass className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-1">No events yet</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Click "Sync Events" to pull real events from Eventbrite and Ticketmaster near Detroit.
          </p>
          <button onClick={triggerIngest} disabled={ingesting} className="btn-primary rounded-full px-5 py-2 text-sm">
            {ingesting ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      )}
    </div>
  );
}
