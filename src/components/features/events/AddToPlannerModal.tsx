"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { useToast } from "@/components/ui/Toast";
import { X, Calendar, Clock, DollarSign, MapPin, ExternalLink, Plus, Check } from "lucide-react";
import { format, addDays } from "date-fns";
import type { Category } from "@/lib/types";

interface AddToPlannerModalProps {
  event: any;
  onClose: () => void;
}

const NEXT_DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = addDays(new Date(), i);
  return { label: format(d, "EEE, MMM d"), value: format(d, "yyyy-MM-dd") };
});

function guessCategoryFromEvent(event: any): Category {
  const cat = (event.category || "").toLowerCase();
  if (cat.includes("music") || cat.includes("concert")) return "Events";
  if (cat.includes("sport") || cat.includes("fitness")) return "Sports";
  if (cat.includes("food") || cat.includes("drink")) return "Social";
  if (cat.includes("outdoor") || cat.includes("nature")) return "Outdoor";
  if (cat.includes("wellness") || cat.includes("yoga")) return "Relaxation";
  return "Events";
}

export function AddToPlannerModal({ event, onClose }: AddToPlannerModalProps) {
  const { addActivity, addExpense } = useAppStore();
  const { toast } = useToast();

  const eventDate = event.startDateTime
    ? format(new Date(event.startDateTime), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");
  const validDate = NEXT_DAYS.find(d => d.value === eventDate)?.value || NEXT_DAYS[0].value;

  const [date, setDate] = useState(validDate);
  const [time, setTime] = useState(
    event.startDateTime ? format(new Date(event.startDateTime), "HH:mm") : "10:00"
  );
  const [cost, setCost] = useState(String(event.cost ?? 0));
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const costVal = parseFloat(cost) || 0;
    const category = guessCategoryFromEvent(event);

    addActivity({
      id: crypto.randomUUID(),
      title: event.title,
      category,
      date,
      startTime: time,
      cost: costVal,
      completed: false,
      location: event.locationName || event.city || undefined,
      originalEventId: event.id,
    });

    if (costVal > 0) {
      addExpense({
        amount: costVal,
        category,
        description: event.title,
        date: new Date().toISOString(),
      });
    }

    setAdded(true);
    toast(`"${event.title}" added to your planner!`);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Preview header */}
        <div className="relative h-28 overflow-hidden bg-[var(--color-bg-alt)]">
          {event.imageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-light)] text-5xl">🎪</div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-10">
            <p className="text-white font-semibold text-sm line-clamp-1">{event.title}</p>
            {event.locationName && (
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{event.locationName}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Add to My Week</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date
            </label>
            <select value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
              {NEXT_DAYS.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}{d.value === eventDate ? " (event date)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Start time
              </label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Cost ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} value={cost} onChange={e => setCost(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
            </div>
          </div>

          {event.url && (
            <a href={event.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--color-primary)] font-medium hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> View original event page
            </a>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={added}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{ background: added ? "var(--color-success)" : "var(--color-primary)", color: "white" }}>
              {added ? <><Check className="w-4 h-4" /> Added!</> : <><Plus className="w-4 h-4" /> Add to Planner</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
