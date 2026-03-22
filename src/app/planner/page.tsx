"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Plus, Trash2, CheckCircle2, Circle, Clock, MapPin,
  ChevronLeft, ChevronRight, DollarSign, Calendar
} from "lucide-react";
import {
  format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks
} from "date-fns";
import type { Activity, Category } from "@/lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–11pm
const CATEGORY_COLORS: Record<string, string> = {
  Relaxation: "#60a5fa", Social: "#34d399", Outdoor: "#86efac",
  Sports: "#f87171", Events: "#1a73e8", Other: "#a78bfa",
  Budget: "#fbbf24", Traveling: "#f97316",
};

function getCatColor(cat?: string) { return CATEGORY_COLORS[cat || "Other"] || "#9aa0a6"; }

export default function PlannerPage() {
  const { activities, addActivity, removeActivity, toggleActivity, weeklySavingsGoal, expenses } = useAppStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), startTime: "09:00", cost: 0, category: "Events" as Category, location: "" });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const activitiesInWeek = useMemo(() =>
    activities.filter(a => {
      const d = parseISO(a.date);
      return d >= weekStart && d <= addDays(weekStart, 6);
    }), [activities, weekStart]);

  const totalCost = useMemo(() => activitiesInWeek.reduce((s, a) => s + a.cost, 0), [activitiesInWeek]);
  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - expenses.reduce((s, e) => s + e.amount, 0), 0);

  const submit = () => {
    if (!form.title) return;
    addActivity({ id: Date.now().toString(), ...form, completed: false } as Activity);
    setShowForm(false);
    setForm({ title: "", date: format(new Date(), "yyyy-MM-dd"), startTime: "09:00", cost: 0, category: "Events", location: "" });
  };

  const activitiesOnDay = (day: Date) =>
    activitiesInWeek.filter(a => isSameDay(parseISO(a.date), day));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">My Week</h1>
          <p className="page-subtitle">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="p-2 rounded-full hover:bg-[var(--color-bg-alt)]"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">Today</button>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="p-2 rounded-full hover:bg-[var(--color-bg-alt)]"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 btn-primary text-sm rounded-full px-4 py-2 ml-2">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-lg font-medium text-[var(--color-text-primary)]">{activitiesInWeek.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">activities</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-lg font-medium text-[var(--color-text-primary)]">${totalCost}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">planned spend</p>
        </div>
        <div className="card p-3 text-center">
          <p className={cn("text-lg font-medium", budgetRemaining < totalCost ? "text-[var(--color-error)]" : "text-[var(--color-success)]")}>
            ${budgetRemaining}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">budget left</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-[var(--color-border)]">
          <div className="p-3 text-xs text-[var(--color-text-muted)]" />
          {weekDays.map(day => (
            <div key={day.toISOString()} className={cn(
              "p-3 text-center border-l border-[var(--color-border-light)]",
              isSameDay(day, new Date()) && "bg-[var(--color-primary-light)]"
            )}>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">{format(day, "EEE")}</p>
              <p className={cn("text-lg font-medium mt-0.5",
                isSameDay(day, new Date()) ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
              )}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto max-h-[480px]">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-[var(--color-border-light)] min-h-[52px]">
              <div className="p-2 text-[11px] text-[var(--color-text-muted)] font-medium text-right pr-3 pt-2">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              {weekDays.map(day => {
                const slots = activitiesOnDay(day).filter(a => {
                  const h = parseInt(a.startTime?.split(":")[0] || "0");
                  return h === hour;
                });
                return (
                  <div key={day.toISOString()} className={cn(
                    "border-l border-[var(--color-border-light)] p-1 relative",
                    isSameDay(day, new Date()) && "bg-[var(--color-primary-light)]/30"
                  )}>
                    {slots.map(act => (
                      <div key={act.id}
                        className="rounded-md px-2 py-1 text-white text-[10px] font-medium mb-1 cursor-pointer group relative"
                        style={{ background: getCatColor(act.category) }}>
                        <div className="truncate">{act.title}</div>
                        <div className="text-[9px] opacity-80">${act.cost}</div>
                        {/* Hover actions */}
                        <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
                          <button onClick={() => toggleActivity(act.id)} className="p-0.5 bg-white/20 rounded hover:bg-white/40">
                            {act.completed ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </button>
                          <button onClick={() => removeActivity(act.id)} className="p-0.5 bg-white/20 rounded hover:bg-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Activity list for this week */}
      {activitiesInWeek.length > 0 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">All activities this week</h3>
          <div className="space-y-2">
            {activitiesInWeek.map(act => (
              <div key={act.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[var(--color-bg-alt)] group">
                <button onClick={() => toggleActivity(act.id)}>
                  {act.completed
                    ? <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                    : <Circle className="w-5 h-5 text-[var(--color-text-muted)]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", act.completed && "line-through text-[var(--color-text-muted)]")}>{act.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{act.date} · {act.startTime}</span>
                    {act.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{act.location}</span>}
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${act.cost}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ background: getCatColor(act.category) }}>{act.category}</span>
                <button onClick={() => removeActivity(act.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-[var(--color-error)] hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Add Activity</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Activity name*" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Date</label>
                  <input type="date" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Start time</label>
                  <input type="time" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Cost ($)</label>
                  <input type="number" min={0} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={form.cost} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Category</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {["Events","Relaxation","Social","Outdoor","Sports","Traveling","Budget","Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Location (optional)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]">Cancel</button>
              <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)]">Add Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
