"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { JournalEntry } from "@/lib/types";
import {
  BookOpen, Plus, Smile, Meh, Frown, Zap, Heart,
  Calendar, Tag, Trash2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const MOODS: { value: JournalEntry["mood"]; icon: React.ElementType; color: string; label: string }[] = [
  { value: "Happy",   icon: Smile,  color: "#34a853", label: "Happy"   },
  { value: "Excited", icon: Zap,    color: "#fbbc04", label: "Excited" },
  { value: "Neutral", icon: Meh,    color: "#1a73e8", label: "Neutral" },
  { value: "Tired",   icon: Heart,  color: "#7b1fa2", label: "Tired"   },
  { value: "Sad",     icon: Frown,  color: "#ea4335", label: "Sad"     },
];

const MOOD_BG: Record<string, string> = {
  Happy: "#e6f4ea", Excited: "#fef9e5", Neutral: "#e8f0fe",
  Tired: "#f3e5f5", Sad: "#fce8e6",
};

function MoodPill({ mood }: { mood: JournalEntry["mood"] }) {
  const m = MOODS.find(x => x.value === mood);
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: MOOD_BG[mood] || "#f1f3f4", color: m.color }}>
      <m.icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

export default function JournalPage() {
  const { journalEntries, addJournalEntry } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState<JournalEntry["mood"]>("Neutral");
  const [text, setText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };

  const submit = () => {
    if (!text.trim()) return;
    addJournalEntry({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: text.trim(),
      mood,
      tags,
    });
    setText(""); setTags([]); setTagInput("");
    setShowForm(false);
  };

  const byMonth = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {};
    for (const e of [...journalEntries].reverse()) {
      const key = format(parseISO(e.date), "MMMM yyyy");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [journalEntries]);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Journal</h1>
          <p className="page-subtitle">Capture moments, moods, and memories</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 btn-primary rounded-full px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Empty state */}
      {journalEntries.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-1">
            Your journal is empty
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Start capturing how you feel about your weekends and adventures.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-ghost rounded-full px-4 py-2 text-sm border border-[var(--color-border)]">
            Write first entry
          </button>
        </div>
      )}

      {/* Entries grouped by month */}
      {Object.entries(byMonth).map(([month, entries]) => (
        <div key={month} className="space-y-3">
          <h2 className="section-title">{month}</h2>
          <div className="space-y-3">
            {entries.map(entry => {
              const moodObj = MOODS.find(m => m.value === entry.mood);
              return (
                <div key={entry.id}
                  className="card p-4 space-y-3 hover:shadow-md transition-shadow"
                  style={{ borderLeft: `3px solid ${moodObj?.color || "#dadce0"}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MoodPill mood={entry.mood} />
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(entry.date), "EEE, MMM d · h:mm a")}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {entry.text}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] text-xs">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* New Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">New Journal Entry</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)]">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Mood picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">How are you feeling?</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      mood === m.value
                        ? "text-white border-transparent"
                        : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300"
                    )}
                    style={mood === m.value ? { background: m.color, borderColor: m.color } : {}}>
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">What's on your mind?</label>
              <textarea
                value={text} onChange={e => setText(e.target.value)}
                placeholder="Write about your day, what you did, how you felt..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Tags (optional)</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                  placeholder="e.g. weekend, concert, outdoors"
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                <button onClick={addTag} className="px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-border)]">Add</button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs">
                      {tag}
                      <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="ml-0.5 hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]">Cancel</button>
              <button onClick={submit} disabled={!text.trim()} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50 hover:bg-[var(--color-primary-dark)]">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
