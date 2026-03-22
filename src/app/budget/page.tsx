"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Plus, Trash2, DollarSign, TrendingDown, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { Category } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  Events:"#1a73e8", Relaxation:"#60a5fa", Social:"#34d399",
  Outdoor:"#86efac", Sports:"#f87171", Budget:"#fbbf24",
  Traveling:"#f97316", Other:"#9aa0a6",
};

const CATEGORIES: Category[] = ["Events","Relaxation","Social","Outdoor","Sports","Traveling","Budget","Other"];

import { useToast } from "@/components/ui/Toast";

export default function BudgetPage() {
  const { expenses, weeklySavingsGoal, setWeeklySavingsGoal, addExpense, removeExpense } = useAppStore();
  const { toast } = useToast();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(weeklySavingsGoal || 0));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "Events" as Category, description: "", date: format(new Date(), "yyyy-MM-dd") });

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining = Math.max((weeklySavingsGoal || 0) - totalSpent, 0);
  const pct = weeklySavingsGoal > 0 ? Math.min((totalSpent / weeklySavingsGoal) * 100, 100) : 0;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) { map[e.category] = (map[e.category] || 0) + e.amount; }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    addExpense({ amount: amt, category: form.category, description: form.description, date: form.date });
    toast(`$${amt.toFixed(0)} expense added`);
    setShowAdd(false);
    setForm({ amount: "", category: "Events", description: "", date: format(new Date(), "yyyy-MM-dd") });
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="page-header">Budget</h1>

      {/* Budget Overview Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Weekly Budget</h2>
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-secondary)]">$</span>
              <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)}
                className="w-24 px-2 py-1 border border-[var(--color-primary)] rounded-lg text-sm focus:outline-none"
                autoFocus onKeyDown={e => { if (e.key === "Enter") { setWeeklySavingsGoal(Number(goalInput)); setEditingGoal(false); }}} />
              <button onClick={() => { setWeeklySavingsGoal(Number(goalInput)); setEditingGoal(false); }} className="p-1 text-[var(--color-success)]"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingGoal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => { setGoalInput(String(weeklySavingsGoal)); setEditingGoal(true); }}
              className="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium">
              <Edit2 className="w-3.5 h-3.5" /> ${weeklySavingsGoal}
            </button>
          )}
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-medium text-[var(--color-text-primary)]">${totalSpent.toFixed(0)}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">spent</p>
          </div>
          <div className="text-center">
            <p className={cn("text-2xl font-medium", remaining === 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]")}>
              ${remaining.toFixed(0)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-medium text-[var(--color-text-primary)]">{pct.toFixed(0)}%</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">used</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pct > 90 ? "var(--color-error)" : pct > 70 ? "var(--color-warning)" : "var(--color-primary)" }} />
        </div>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">By Category</h2>
          {byCategory.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[cat] || "#9aa0a6" }} />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-medium text-[var(--color-text-primary)] mb-1">
                  <span>{cat}</span><span>${amt.toFixed(0)}</span>
                </div>
                <div className="h-1.5 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(amt / totalSpent) * 100}%`, background: CAT_COLORS[cat] || "#9aa0a6" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expenses list */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Transactions</h2>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 btn-primary text-xs rounded-full px-3 py-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <DollarSign className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">No expenses yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {[...expenses].reverse().map(exp => (
              <div key={exp.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[var(--color-bg-alt)] group">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[exp.category] || "#9aa0a6" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{exp.description || exp.category}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{exp.category} · {exp.date}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-error)]">-${exp.amount.toFixed(0)}</span>
                <button onClick={() => { removeExpense(exp.id); toast("Expense removed", "info"); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-[var(--color-error)] hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Add Expense</h3>
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} placeholder="0.00" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none" />
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">Cancel</button>
              <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
