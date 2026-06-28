"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import {
  Target, Plus, Trash2, CheckCircle2, Flag, TrendingUp,
  Calendar, DollarSign, Compass, Heart, Users, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Goal } from "@/lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "events",      label: "Events",      icon: Calendar,   color: "#1a73e8" },
  { value: "budget",      label: "Budget",      icon: DollarSign, color: "#34a853" },
  { value: "exploration", label: "Exploration", icon: Compass,    color: "#f57c00" },
  { value: "wellness",    label: "Wellness",    icon: Heart,      color: "#e91e63" },
  { value: "social",      label: "Social",      icon: Users,      color: "#7b1fa2" },
];

const UNITS = ["events", "check-ins", "dollars", "categories", "neighborhoods", "days"];

const SUGGESTED_GOALS = [
  { title: "Attend 4 events this month", type: "short_term" as const, category: "events", targetValue: 4, unit: "events", description: "Explore what your city has to offer" },
  { title: "Stay under budget this weekend", type: "short_term" as const, category: "budget", targetValue: 100, unit: "dollars", description: "Track spending and hit your weekly goal" },
  { title: "Try 5 different event categories", type: "long_term" as const, category: "exploration", targetValue: 5, unit: "categories", description: "Broaden your horizons with new experiences" },
  { title: "Check in to 50 events this year", type: "long_term" as const, category: "events", targetValue: 50, unit: "check-ins", description: "Build a rich history of weekend memories" },
];

const CAT_INFO = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progressPct(goal: Goal) {
  return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
}

function GoalCard({ goal, onDelete, onCheckIn }: {
  goal: Goal;
  onDelete: (id: string) => void;
  onCheckIn: (id: string, delta: number) => void;
}) {
  const cat = CAT_INFO[goal.category ?? ""] ?? { color: "#9aa0a6", icon: Target };
  const CatIcon = cat.icon ?? Target;
  const pct = progressPct(goal);
  const done = goal.status === "completed" || pct >= 100;

  return (
    <div className={cn("card p-4 space-y-3 transition-all", done && "opacity-80")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: cat.color + "18" }}>
            <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold text-[var(--color-text-primary)] truncate", done && "line-through text-[var(--color-text-muted)]")}>
              {goal.title}
            </p>
            {goal.description && (
              <p className="text-xs text-[var(--color-text-muted)] truncate">{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {done
            ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
            : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cat.color + "18", color: cat.color }}>
                {goal.type === "short_term" ? "This month" : "Long-term"}
              </span>
            )
          }
          <button onClick={() => onDelete(goal.id)}
            className="p-1 rounded-full hover:bg-red-50 hover:text-red-500 text-[var(--color-text-muted)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--color-text-secondary)]">
            {goal.currentValue.toFixed(0)} / {goal.targetValue} {goal.unit}
          </span>
          <span className="font-semibold" style={{ color: done ? "var(--color-success)" : cat.color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: done ? "var(--color-success)" : cat.color }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {goal.deadline && (
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Flag className="w-3 h-3" />
            {format(parseISO(goal.deadline), "MMM d, yyyy")}
          </span>
        )}
        {!done && (
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => onCheckIn(goal.id, -1)}
              className="px-2 py-1 text-xs rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]">
              −1
            </button>
            <button onClick={() => onCheckIn(goal.id, 1)}
              className="px-2 py-1 text-xs rounded-lg font-medium text-white transition-colors"
              style={{ background: cat.color }}>
              +1 {goal.unit.split("-")[0]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Goal Modal ───────────────────────────────────────────────────────────

function AddGoalModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: Omit<Goal, "id" | "currentValue" | "status" | "createdAt">) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"short_term" | "long_term">("short_term");
  const [category, setCategory] = useState<Goal['category']>("events");
  const [targetValue, setTargetValue] = useState(4);
  const [unit, setUnit] = useState("events");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd({ title, type, category, targetValue, unit, deadline: deadline || undefined, description: description || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">New Goal</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)]">
            <X className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Goal title</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Attend 4 events this month"
            className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Timeframe</label>
          <div className="flex gap-2">
            {(["short_term", "long_term"] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={cn("flex-1 py-2 rounded-xl text-sm font-medium border transition-colors",
                  type === t
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
                )}>
                {t === "short_term" ? "Short-term (weeks)" : "Long-term (months+)"}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Category</label>
          <div className="grid grid-cols-5 gap-1.5">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.icon;
              return (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-colors",
                    category === cat.value
                      ? "border-transparent text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
                  )}
                  style={category === cat.value ? { background: cat.color } : {}}>
                  <CatIcon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Target</label>
            <input type="number" value={targetValue} min={1}
              onChange={e => setTargetValue(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Deadline (optional)</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Note (optional)</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Why does this goal matter?"
            className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={!title.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Goals Page ──────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { user } = useAuth();
  const { activities, expenses, weeklySavingsGoal } = useAppStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // Auto-compute progress from local store for display
  const enrichedGoals = goals.map(g => {
    if (g.category === "events") {
      const checkedIn = activities.filter(a => a.completed).length;
      return { ...g, currentValue: Math.min(g.currentValue, g.targetValue) };
    }
    if (g.category === "budget" && g.unit === "dollars") {
      const spent = expenses.reduce((s, e) => s + e.amount, 0);
      // For budget goals: remaining = target - spent (invert for display)
      return { ...g, currentValue: Math.min(spent, g.targetValue) };
    }
    return g;
  });

  const shortTerm = enrichedGoals.filter(g => g.type === "short_term" && g.status === "active");
  const longTerm = enrichedGoals.filter(g => g.type === "long_term" && g.status === "active");
  const completed = enrichedGoals.filter(g => g.status === "completed" || progressPct(g) >= 100);

  const handleAdd = async (data: Omit<Goal, "id" | "currentValue" | "status" | "createdAt">) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleCheckIn = async (id: string, delta: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newValue = Math.max(0, Math.min(goal.currentValue + delta, goal.targetValue));
    const newStatus = newValue >= goal.targetValue ? "completed" : "active";
    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue: newValue, status: newStatus }),
    });
    if (res.ok) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, currentValue: newValue, status: newStatus } : g));
    }
  };

  const addFromTemplate = (tpl: typeof SUGGESTED_GOALS[0]) => {
    setShowAdd(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Target className="w-10 h-10 text-[var(--color-text-muted)]" />
        <p className="text-[var(--color-text-secondary)]">Sign in to set and track your goals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Target className="w-6 h-6 text-[var(--color-primary)]" /> Goals
          </h1>
          <p className="page-subtitle">Track short-term wins and long-term ambitions</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 btn-primary text-sm rounded-full px-4 py-2">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xl font-semibold text-[var(--color-primary)]">{shortTerm.length + longTerm.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Active goals</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-semibold text-[var(--color-success)]">{completed.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Completed</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-semibold text-[var(--color-text-primary)]">
            {activities.filter(a => a.completed).length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Check-ins</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <>
          {/* Short-term goals */}
          {shortTerm.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Short-Term Goals
              </h2>
              {shortTerm.map(g => (
                <GoalCard key={g.id} goal={g} onDelete={handleDelete} onCheckIn={handleCheckIn} />
              ))}
            </section>
          )}

          {/* Long-term goals */}
          {longTerm.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
                <Flag className="w-4 h-4" /> Long-Term Goals
              </h2>
              {longTerm.map(g => (
                <GoalCard key={g.id} goal={g} onDelete={handleDelete} onCheckIn={handleCheckIn} />
              ))}
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--color-success)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Completed 🎉
              </h2>
              {completed.map(g => (
                <GoalCard key={g.id} goal={g} onDelete={handleDelete} onCheckIn={handleCheckIn} />
              ))}
            </section>
          )}

          {/* Empty state + suggestions */}
          {shortTerm.length === 0 && longTerm.length === 0 && (
            <div className="space-y-4">
              <div className="card p-8 text-center">
                <Target className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">No active goals yet</p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">Set a goal and track your progress automatically as you check in to events.</p>
                <button onClick={() => setShowAdd(true)} className="btn-primary rounded-full px-5 py-2 text-sm">
                  Create your first goal
                </button>
              </div>

              {/* Suggested goals */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Quick start — tap to add:</p>
                {SUGGESTED_GOALS.map(tpl => {
                  const cat = CAT_INFO[tpl.category];
                  const CatIcon = cat?.icon ?? Target;
                  return (
                    <button key={tpl.title} onClick={() => setShowAdd(true)}
                      className="w-full card p-3.5 text-left hover:shadow-md transition-all group flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: cat?.color + "18" }}>
                        <CatIcon className="w-4 h-4" style={{ color: cat?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{tpl.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{tpl.description}</p>
                      </div>
                      <Plus className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddGoalModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
