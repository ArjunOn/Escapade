"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store";
import { useToast } from "@/components/ui/Toast";
import { AddToPlannerModal } from "@/components/features/events/AddToPlannerModal";
import {
  Search, SlidersHorizontal, MapPin, Clock, Star,
  Compass, X, RefreshCw, ExternalLink, DollarSign,
  CalendarPlus, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const CATEGORIES = ["All","Music","Sports & Fitness","Arts","Food & Drink","Community","Outdoor","Tech","Family","Wellness"];
const SORT_OPTIONS = [
  { value: "date",       label: "Date"               },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const CAT_COLOR_MAP: Record<string, string> = {
  "Music":"#e91e63","Sports & Fitness":"#f57c00","Arts":"#00838f",
  "Food & Drink":"#e64a19","Community":"#7b1fa2","Outdoor":"#2e7d32",
  "Tech":"#1565c0","Family":"#f9a825","Wellness":"#388e3c",
};
function getCatColor(cat?: string | null) {
  if (!cat) return "#1a73e8";
  for (const [k,v] of Object.entries(CAT_COLOR_MAP)) {
    if (cat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "#1a73e8";
}

const SOURCE_COLORS: Record<string,string> = {
  eventbrite:"#f05537", ticketmaster:"#026cdf", meetup:"#ed1c40",
};

function EventGridCard({ event, onSave, saved, onAddToPlanner }: {
  event: any; onSave: () => void; saved: boolean; onAddToPlanner: () => void;
}) {
  const color = getCatColor(event.category);
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all group flex flex-col"
      style={{ "--event-color": color } as React.CSSProperties}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-[var(--color-bg-alt)] flex-shrink-0">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: color + "18" }}>
            <Compass className="w-8 h-8" style={{ color }} />
          </div>
        )}
        {/* Badges */}
        <button onClick={e => { e.stopPropagation(); onSave(); }}
          className={cn("absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors shadow",
            saved ? "bg-yellow-400 text-white" : "bg-white/90 text-[var(--color-text-muted)] hover:bg-white"
          )}>
          <Star className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
        </button>
        {event.isFree && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[var(--color-free)] text-white text-[10px] font-bold shadow">
            FREE
          </span>
        )}
        {/* Source badge */}
        <span className="absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: SOURCE_COLORS[event.sourceName] || "#5f6368",
            backdropFilter: "blur(8px)",
          }}>
          {event.sourceName}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1 space-y-1.5">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug flex-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{format(parseISO(event.startDateTime), "EEE, MMM d · h:mm a")}</span>
        </div>
        {event.locationName && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.locationName}{event.city ? `, ${event.city}` : ""}</span>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)]">
          <span className={cn("text-xs font-semibold",
            event.isFree ? "text-[var(--color-free)]" : "text-[var(--color-text-primary)]")}>
            {event.isFree ? "Free" : `$${event.cost}${event.costMax && event.costMax !== event.cost ? `–$${event.costMax}` : ""}`}
          </span>
          <div className="flex items-center gap-1">
            <a href={event.url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="View event page"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text-secondary)] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={e => { e.stopPropagation(); onAddToPlanner(); }}
              title="Add to My Week"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors text-xs font-medium">
              <CalendarPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { weeklySavingsGoal, expenses, userProfile, savedEventIds, toggleSavedEvent } = useAppStore();
  const { toast } = useToast();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [maxCost, setMaxCost] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [plannerEvent, setPlannerEvent] = useState<any | null>(null);

  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - expenses.reduce((s,e) => s + e.amount, 0), 0);

  // Use location from profile, fall back to Detroit
  const lat = 42.3314;
  const lng = -83.0458;
  const cityLabel = userProfile?.location || "Detroit area";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ lat: String(lat), lng: String(lng), days: "14", limit: "60" });
    if (freeOnly) p.set("free", "true");
    if (maxCost !== "") p.set("maxCost", String(maxCost));
    if (category !== "All") p.set("category", category);
    try {
      const res = await fetch(`/api/events?${p}`);
      if (res.ok) { const d = await res.json(); setEvents(d.events || []); }
    } catch (_) {}
    finally { setLoading(false); }
  }, [freeOnly, maxCost, category, lat, lng]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const triggerIngest = async () => {
    setIngesting(true);
    setIngestStatus("Connecting to Eventbrite & Ticketmaster…");
    try {
      const res = await fetch("/api/events/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, city: userProfile?.location || "Detroit", radiusMiles: 30, daysAhead: 14 }),
      });
      if (res.ok) {
        const data = await res.json();
        const total = data.total || 0;
        setIngestStatus(null);
        toast(`Synced ${total} events near ${cityLabel}`, "success");
        await fetchEvents();
      } else {
        setIngestStatus(null);
        toast("Sync failed — check API keys in .env.local", "error");
      }
    } catch (_) {
      setIngestStatus(null);
      toast("Could not reach event APIs", "error");
    } finally { setIngesting(false); }
  };

  const filtered = events
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.title?.toLowerCase().includes(q) ||
        e.locationName?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_asc")  return a.cost - b.cost;
      if (sortBy === "price_desc") return b.cost - a.cost;
      return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Discover Events</h1>
          <p className="page-subtitle">
            <MapPin className="inline w-3 h-3 mr-1" />
            {cityLabel} · Next 14 days
          </p>
        </div>
        <button onClick={triggerIngest} disabled={ingesting}
          className="hidden md:flex items-center gap-2 btn-primary text-sm rounded-full px-4 py-2 disabled:opacity-60">
          {ingesting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</>
            : <><RefreshCw className="w-4 h-4" /> Sync Events</>}
        </button>
      </div>

      {/* Ingest progress */}
      {ingestStatus && (
        <div className="card p-3 flex items-center gap-3 border-[var(--color-primary)] bg-[var(--color-primary-light)]">
          <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin flex-shrink-0" />
          <span className="text-sm text-[var(--color-primary)]">{ingestStatus}</span>
        </div>
      )}

      {/* Search + Filters */}
      <div className="card p-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, venues, categories…"
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--color-bg-alt)] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
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
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer select-none">
              <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)}
                className="accent-[var(--color-primary)]" />
              Free events only
            </label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
              <input type="number" placeholder="Max price" value={maxCost}
                onChange={e => setMaxCost(e.target.value ? Number(e.target.value) : "")}
                className="w-24 px-2 py-1 rounded-lg bg-[var(--color-bg-alt)] border-0 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
            {budgetRemaining > 0 && (
              <button onClick={() => setMaxCost(budgetRemaining)}
                className="text-xs text-[var(--color-primary)] font-medium">
                Use my budget (${budgetRemaining.toFixed(0)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Count + mobile sync */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {loading ? "Loading…" : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
        </span>
        <button onClick={triggerIngest} disabled={ingesting}
          className="md:hidden flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
          {ingesting
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <RefreshCw className="w-3 h-3" />}
          Sync
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-64 animate-pulse bg-[var(--color-bg-alt)]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <EventGridCard key={ev.id} event={ev}
              saved={savedEventIds.includes(ev.id)}
              onSave={() => {
                toggleSavedEvent(ev.id);
                toast(savedEventIds.includes(ev.id) ? "Removed from saved" : "Saved!", savedEventIds.includes(ev.id) ? "info" : "success");
              }}
              onAddToPlanner={() => setPlannerEvent(ev)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Compass className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-1">No events yet</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Click "Sync Events" to pull real events from Eventbrite and Ticketmaster.
          </p>
          <button onClick={triggerIngest} disabled={ingesting}
            className="btn-primary rounded-full px-5 py-2 text-sm flex items-center gap-2 mx-auto">
            {ingesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</> : "Sync Now"}
          </button>
        </div>
      )}

      {/* Add to Planner modal */}
      {plannerEvent && (
        <AddToPlannerModal event={plannerEvent} onClose={() => setPlannerEvent(null)} />
      )}
    </div>
  );
}
