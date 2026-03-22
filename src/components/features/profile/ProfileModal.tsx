"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import {
  X, User, MapPin, DollarSign, Tag, Clock,
  Plus, Trash2, Check, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityWindow } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
);

const BUDGET_OPTIONS = [
  { id: "frugal",   label: "Budget-friendly", range: "< $30/wk"   },
  { id: "moderate", label: "Balanced",         range: "$30–100/wk" },
  { id: "luxury",   label: "Premium",          range: "$100+/wk"  },
];

const INTEREST_TAGS = [
  "Hiking", "Concerts", "Food Tours", "Yoga", "Art Galleries", "Sports Games",
  "Jazz", "Photography", "Theatre", "Nightlife", "Farmers Markets", "Comedy",
  "Wine Tasting", "Gaming", "Film", "Dance", "Fitness", "Cooking Classes",
  "Museums", "Outdoor Cinema", "Trivia Nights", "Volunteering",
];

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { signOut } = useAuth();
  const {
    userProfile, updateUserProfile,
    availabilityWindows, addAvailabilityWindow, removeAvailabilityWindow,
    weeklySavingsGoal, setWeeklySavingsGoal,
  } = useAppStore();

  const [tab, setTab] = useState<"profile" | "schedule" | "budget">("profile");
  const [name, setName] = useState(userProfile?.name || "");
  const [location, setLocation] = useState(userProfile?.location || "");
  const [interests, setInterests] = useState<string[]>(userProfile?.preferences || []);
  const [budget, setBudget] = useState(userProfile?.budgetTier || "moderate");
  const [goalInput, setGoalInput] = useState(String(weeklySavingsGoal || 0));
  const [saved, setSaved] = useState(false);

  // Availability form state
  const [newDay, setNewDay] = useState(6); // Saturday
  const [newStart, setNewStart] = useState(10);
  const [newEnd, setNewEnd] = useState(18);
  const [newLabel, setNewLabel] = useState("");

  const toggleInterest = (t: string) =>
    setInterests(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const saveProfile = () => {
    updateUserProfile({ name, location, preferences: interests, budgetTier: budget as any });
    const g = parseFloat(goalInput);
    if (!isNaN(g) && g >= 0) setWeeklySavingsGoal(g);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addWindow = () => {
    if (newEnd <= newStart) return;
    const window: AvailabilityWindow = {
      id: crypto.randomUUID(),
      dayOfWeek: newDay,
      startHour: newStart,
      endHour: newEnd,
      label: newLabel || `${DAYS[newDay]} ${HOURS[newStart]}–${HOURS[newEnd]}`,
    };
    addAvailabilityWindow(window);
    setNewLabel("");
  };

  const TABS = [
    { id: "profile",  label: "Profile"   },
    { id: "schedule", label: "Schedule"  },
    { id: "budget",   label: "Budget"    },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)]">
            <X className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === t.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Profile Tab ───────────────────────────────── */}
          {tab === "profile" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Display name
                </label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Detroit, MI"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Interests ({interests.length})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {INTEREST_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleInterest(tag)}
                      className={cn("px-2.5 py-1 rounded-full text-xs border transition-all",
                        interests.includes(tag)
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300"
                      )}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Schedule Tab ──────────────────────────────── */}
          {tab === "schedule" && (
            <div className="space-y-5">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Tell us when you're free — we'll only recommend events that fit your schedule.
              </p>

              {/* Existing windows */}
              {availabilityWindows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">Your availability</p>
                  {availabilityWindows.map(w => (
                    <div key={w.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {DAYS[w.dayOfWeek]}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {HOURS[w.startHour]} – {HOURS[w.endHour]}
                        </span>
                      </div>
                      <button onClick={() => removeAvailabilityWindow(w.id)}
                        className="p-1 rounded-full text-[var(--color-error)] hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new window */}
              <div className="space-y-3 p-4 rounded-xl border border-dashed border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Add a free window</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Day</label>
                    <select value={newDay} onChange={e => setNewDay(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none">
                      {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">From</label>
                    <select value={newStart} onChange={e => setNewStart(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none">
                      {HOURS.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Until</label>
                    <select value={newEnd} onChange={e => setNewEnd(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none">
                      {HOURS.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="Label (optional — e.g. 'Saturday morning')"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none" />
                <button onClick={addWindow}
                  disabled={newEnd <= newStart}
                  className="flex items-center gap-1.5 btn-primary text-xs rounded-full px-3 py-1.5 disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Add window
                </button>
              </div>
            </div>
          )}

          {/* ── Budget Tab ────────────────────────────────── */}
          {tab === "budget" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Weekly spending goal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                  <input type="number" min={0} value={goalInput} onChange={e => setGoalInput(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">Budget style</label>
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setBudget(opt.id as "frugal" | "moderate" | "luxury")}
                    className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
                      budget === opt.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "border-[var(--color-border)] hover:border-gray-300"
                    )}>
                    <span className={cn("text-sm font-medium", budget === opt.id ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]")}>
                      {opt.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-text-muted)]">{opt.range}</span>
                      {budget === opt.id && <Check className="w-4 h-4 text-[var(--color-primary)]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] px-5 py-4 flex items-center justify-between">
          <button onClick={() => { signOut(); onClose(); }}
            className="flex items-center gap-1.5 text-sm text-[var(--color-error)] hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
          <button onClick={saveProfile}
            className={cn("flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all",
              saved
                ? "bg-[var(--color-success)] text-white"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            )}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
