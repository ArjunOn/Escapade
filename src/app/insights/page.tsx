"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store";
import { BarChart2, TrendingUp, CheckCircle2, DollarSign, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";
import { format, parseISO, startOfWeek } from "date-fns";

function StatTile({ icon: Icon, label, value, color = "#1a73e8" }: {
  icon: React.ElementType; label: string; value: string; color?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-medium text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export default function InsightsPage() {
  const { activities, expenses, history, weeklySavingsGoal } = useAppStore();

  const completionRate = useMemo(() => {
    if (!activities.length) return 0;
    return Math.round((activities.filter(a => a.completed).length / activities.length) * 100);
  }, [activities]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  // Spending by category for bar chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.category] = (map[e.category] || 0) + e.amount;
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Expenses over time (by week) for line chart
  const weeklySpend = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      const wk = format(startOfWeek(parseISO(e.date), { weekStartsOn: 1 }), "MMM d");
      map[wk] = (map[wk] || 0) + e.amount;
    }
    return Object.entries(map).map(([week, amount]) => ({ week, amount: Math.round(amount) }));
  }, [expenses]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-header">Insights</h1>
        <p className="page-subtitle">Your activity and spending trends</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={CheckCircle2} label="Completion rate" value={`${completionRate}%`} color="#34a853" />
        <StatTile icon={DollarSign} label="Total spent" value={`$${totalSpent.toFixed(0)}`} color="#ea4335" />
        <StatTile icon={Zap} label="Activities" value={String(activities.length)} color="#fbbc04" />
        <StatTile icon={TrendingUp} label="Weekly goal" value={`$${weeklySavingsGoal}`} color="#1a73e8" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {categoryData.length > 0 && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v}`, "Spent"]} />
                <Bar dataKey="value" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {weeklySpend.length > 0 && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Weekly Spending</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklySpend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v}`, "Spent"]} />
                <Line type="monotone" dataKey="amount" stroke="#1a73e8" strokeWidth={2} dot={{ fill: "#1a73e8", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {(categoryData.length === 0 && weeklySpend.length === 0) && (
        <div className="card p-10 text-center">
          <BarChart2 className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Add some expenses and activities to see your insights here.
          </p>
        </div>
      )}
    </div>
  );
}
