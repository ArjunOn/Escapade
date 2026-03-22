"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store";
import {
  BarChart2, TrendingUp, CheckCircle2, DollarSign, Zap,
  Flame, Trophy, Target, Calendar, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import { format, parseISO, startOfWeek, isSameMonth } from "date-fns";
import { getLocalGamificationSummary } from "@/services/gamification-service";
import { cn } from "@/lib/utils";

function StatTile({ icon: Icon, label, value, sub, color = "#1a73e8" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

const CAT_COLORS = [
  "#1a73e8","#e91e63","#34a853","#f57c00","#7b1fa2",
  "#00838f","#fbbc04","#ea4335","#546e7a",
];

export default function InsightsPage() {
  const { activities, expenses, history, weeklySavingsGoal, savedEventIds } = useAppStore();

  const completionRate = useMemo(() => {
    if (!activities.length) return 0;
    return Math.round((activities.filter(a => a.completed).length / activities.length) * 100);
  }, [activities]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const gamification = useMemo(
    () => getLocalGamificationSummary({ activities, history }),
    [activities, history]
  );

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.category] = (map[e.category] || 0) + e.amount;
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const weeklySpend = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      const wk = format(startOfWeek(parseISO(e.date), { weekStartsOn: 1 }), "MMM d");
      map[wk] = (map[wk] || 0) + e.amount;
    }
    return Object.entries(map).map(([week, amount]) => ({ week, amount: Math.round(amount) }));
  }, [expenses]);

  const thisMonthActivities = useMemo(() =>
    activities.filter(a => isSameMonth(parseISO(a.date), new Date())), [activities]);

  const activityBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of activities) map[a.category] = (map[a.category] || 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const isEmpty = activities.length === 0 && expenses.length === 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-header">Insights</h1>
        <p className="page-subtitle">Your activity and spending trends</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={CheckCircle2} label="Completion" value={`${completionRate}%`}
          sub={`${activities.filter(a=>a.completed).length}/${activities.length} done`} color="#34a853" />
        <StatTile icon={DollarSign} label="Total spent" value={`$${totalSpent.toFixed(0)}`}
          sub={`goal: $${weeklySavingsGoal}/wk`} color="#ea4335" />
        <StatTile icon={Flame} label="Streak" value={`${gamification.streak} wks`}
          sub="planning streak" color="#f57c00" />
        <StatTile icon={Trophy} label="Score" value={`${gamification.weekendScore}/100`}
          sub="weekend score" color="#fbbc04" />
      </div>

      {/* Score + Badges row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score visual */}
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Weekend Score</h3>
          <div className="relative h-3 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${gamification.weekendScore}%`,
                background: gamification.weekendScore >= 70
                  ? "var(--color-success)"
                  : gamification.weekendScore >= 40
                    ? "var(--color-warning)"
                    : "var(--color-error)"
              }} />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {gamification.weekendScore >= 70 ? "🎉 Great week!" :
             gamification.weekendScore >= 40 ? "👍 Keep going!" : "💪 Get started!"}
          </p>
        </div>

        {/* Badges */}
        <div className="card p-5 space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Badges</h3>
          <div className="grid grid-cols-3 gap-3">
            {gamification.badges.map(badge => (
              <div key={badge.id}
                className={cn("p-3 rounded-xl text-center border transition-all",
                  badge.unlocked
                    ? "border-[var(--color-warning)] bg-yellow-50"
                    : "border-[var(--color-border)] bg-[var(--color-bg-alt)] opacity-50"
                )}>
                <div className="text-xl mb-1">
                  {badge.id === "explorer" ? "🧭" :
                   badge.id === "budget-master" ? "💰" : "📅"}
                </div>
                <p className={cn("text-xs font-semibold",
                  badge.unlocked ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")}>
                  {badge.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* This month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={Calendar} label="This month"
          value={String(thisMonthActivities.length)}
          sub="activities planned" color="#1a73e8" />
        <StatTile icon={Target} label="Completed"
          value={String(thisMonthActivities.filter(a => a.completed).length)}
          sub="this month" color="#34a853" />
        <StatTile icon={Star} label="Saved events"
          value={String(savedEventIds.length)}
          sub="starred to try" color="#fbbc04" />
        <StatTile icon={Zap} label="Weekends logged"
          value={String(history.length)}
          sub="mission history" color="#7b1fa2" />
      </div>

      {/* Charts */}
      {!isEmpty ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {categoryData.length > 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Spending by Category</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`$${v}`, "Spent"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Bar>
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
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`$${v}`, "Spent"]} />
                  <Line type="monotone" dataKey="amount" stroke="#1a73e8" strokeWidth={2}
                    dot={{ fill: "#1a73e8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activityBreakdown.length > 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Activities by Category</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={activityBreakdown} dataKey="value" cx="50%" cy="50%"
                    outerRadius={80} label={({ name, value }) => `${name} (${value})`}
                    labelLine={false}>
                    {activityBreakdown.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {history.length > 0 && (
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Mission History</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 6).map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[var(--color-bg-alt)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{h.weekLabel}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{h.activitiesCount} activities</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">${h.totalSpent}</p>
                      <p className={cn("text-xs font-medium",
                        h.totalSpent <= h.savingsGoal ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
                        {h.totalSpent <= h.savingsGoal ? "On budget" : "Over budget"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <BarChart2 className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Nothing to show yet</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Add activities, log expenses, and complete your week to see insights here.
          </p>
        </div>
      )}
    </div>
  );
}
