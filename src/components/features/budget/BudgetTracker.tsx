"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Trash2, Edit2, Plus, Save, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Expense } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  Events: "#1a73e8", Relaxation: "#60a5fa", Social: "#34d399",
  Outdoor: "#86efac", Sports: "#f87171", Budget: "#fbbf24",
  Traveling: "#f97316", Other: "#9aa0a6",
};

const CATEGORIES: Category[] = [
  "Events", "Social", "Relaxation", "Outdoor", "Sports", "Traveling", "Budget", "Other"
];

export function BudgetTracker({ compact = false }: { compact?: boolean }) {
  const { expenses, weeklySavingsGoal, addExpense, removeExpense, editExpense, setWeeklySavingsGoal } = useAppStore();

  const [amount, setAmount]     = useState("");
  const [desc, setDesc]         = useState("");
  const [category, setCategory] = useState<Category>("Events");
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc]     = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput]   = useState(String(weeklySavingsGoal || 0));

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining  = Math.max(weeklySavingsGoal - totalSpent, 0);

  const chartData = [
    { name: "Spent",     value: totalSpent, color: "#ea4335" },
    { name: "Remaining", value: remaining,  color: "#34a853" },
  ];

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      addExpense({ amount: val, description: desc, category, date: new Date().toISOString() });
      setAmount(""); setDesc("");
    }
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val)) {
      editExpense(id, { amount: val, description: editDesc });
      setEditingId(null);
    }
  };

  const saveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val >= 0) { setWeeklySavingsGoal(val); setIsEditingGoal(false); }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Budget Overview</h3>
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">$</span>
              <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveGoal()}
                className="w-20 px-2 py-1 border border-[var(--color-primary)] rounded-lg text-sm focus:outline-none"
                autoFocus />
              <button onClick={saveGoal} className="p-1 text-[var(--color-success)]"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setIsEditingGoal(false)} className="p-1 text-[var(--color-text-muted)]"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => { setGoalInput(String(weeklySavingsGoal)); setIsEditingGoal(true); }}
              className="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium">
              <Edit2 className="w-3 h-3" /> Goal: ${weeklySavingsGoal}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-[var(--color-error)]">${totalSpent.toFixed(0)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[var(--color-success)]">${remaining.toFixed(0)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">remaining</p>
          </div>
        </div>
        {weeklySavingsGoal > 0 && (
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Add expense form */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Log Expense</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Amount ($)" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          <select value={category} onChange={e => setCategory(e.target.value as Category)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        <button onClick={handleAdd} className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Expenses list */}
      {expenses.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Transactions</h3>
          </div>
          <div className="divide-y divide-[var(--color-border-light)]">
            {[...expenses].reverse().map(exp => (
              <div key={exp.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-alt)] group">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: CAT_COLORS[exp.category] || "#9aa0a6" }} />
                <div className="flex-1 min-w-0">
                  {editingId === exp.id ? (
                    <div className="flex gap-2">
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded text-sm focus:outline-none" />
                      <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                        className="w-20 px-2 py-1 border border-[var(--color-border)] rounded text-sm focus:outline-none" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {exp.description || exp.category}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{exp.category} · {exp.date.slice(0, 10)}</p>
                    </>
                  )}
                </div>
                <span className="text-sm font-semibold text-[var(--color-error)]">-${exp.amount.toFixed(0)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === exp.id ? (
                    <>
                      <button onClick={() => saveEdit(exp.id)} className="p-1 text-[var(--color-success)] hover:bg-green-50 rounded"><Save className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] rounded"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(exp.id); setEditAmount(String(exp.amount)); setEditDesc(exp.description || ""); }}
                        className="p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeExpense(exp.id)} className="p-1 text-[var(--color-error)] hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
