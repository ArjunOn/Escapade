"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { useToast } from "@/components/ui/Toast";
import { AddToPlannerModal } from "@/components/features/events/AddToPlannerModal";
import {
  Star, Compass, Clock, MapPin, ExternalLink, Trash2,
  CalendarPlus, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const CAT_COLORS: Record<string, string> = {
  "Music":"#e91e63","Sports & Fitness":"#f57c00","Arts":"#00838f",
  "Food & Drink":"#e64a19","Community":"#7b1fa2","Outdoor":"#2e7d32",
  "Tech":"#1565c0","Family":"#f9a825","Wellness":"#388e3c",
};
function getCatColor(cat?: string | null) {
  if (!cat) return "#1a73e8";
  for (const [k,v] of Object.entries(CAT_COLORS)) {
    if (cat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "#1a73e8";
}

export default function SavedPage() {
  const { savedEventIds, toggleSavedEvent } = useAppStore();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plannerEvent, setPlannerEvent] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      if (savedEventIds.length === 0) { setLoading(false); return; }
      try {
        // Fetch a broad set and filter client-side by saved IDs
        const res = await fetch("/api/events?lat=42.3314&lng=-83.0458&days=30&limit=100");
        if (res.ok) {
          const data = await res.json();
          const saved = (data.events || []).filter((e: any) => savedEventIds.includes(e.id));
          setEvents(saved);
        }
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, [savedEventIds]);

  const handleUnsave = (id: string, title: string) => {
    toggleSavedEvent(id);
    setEvents(e => e.filter(ev => ev.id !== id));
    toast(`"${title}" removed from saved`, "info");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-header">Saved Events</h1>
        <p className="page-subtitle">
          {savedEventIds.length} event{savedEventIds.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-1">No saved events yet</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Star events on the Discover page to save them here.
          </p>
          <a href="/discover" className="btn-primary rounded-full px-5 py-2 text-sm inline-block">
            Browse Events
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const color = getCatColor(ev.category);
            return (
              <div key={ev.id}
                className="card p-4 flex gap-4 items-start hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${color}` }}>
                {/* Image */}
                {ev.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.imageUrl} alt={ev.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex-shrink-0 hidden sm:flex items-center justify-center"
                    style={{ background: color + "18" }}>
                    <Compass className="w-6 h-6" style={{ color }} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                    {ev.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{format(parseISO(ev.startDateTime), "EEE, MMM d · h:mm a")}</span>
                  </div>
                  {ev.locationName && (
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{ev.locationName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className={cn("text-xs font-semibold",
                      ev.isFree ? "text-[var(--color-free)]" : "text-[var(--color-text-primary)]")}>
                      {ev.isFree ? "Free" : `$${ev.cost}`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: color + "18", color }}>
                      {ev.category}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => setPlannerEvent(ev)}
                    title="Add to My Week"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors text-xs font-medium">
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add to Planner</span>
                  </button>
                  <a href={ev.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors text-xs font-medium">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <button onClick={() => handleUnsave(ev.id, ev.title)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--color-error)] hover:bg-red-50 transition-colors text-xs font-medium">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {plannerEvent && (
        <AddToPlannerModal event={plannerEvent} onClose={() => setPlannerEvent(null)} />
      )}
    </div>
  );
}
