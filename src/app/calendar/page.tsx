"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarDays, DollarSign } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, addDays,
  isSameMonth, isSameDay, parseISO
} from "date-fns";

const CAT_COLORS: Record<string, string> = {
  Events: "#1a73e8", Relaxation: "#60a5fa", Social: "#34d399",
  Outdoor: "#86efac", Sports: "#f87171", Budget: "#fbbf24",
  Traveling: "#f97316", Other: "#9aa0a6",
};

export default function CalendarPage() {
  const { activities, expenses } = useAppStore();
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 });

  // Build a 6-week grid (42 cells)
  const grid = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
    return days;
  }, [gridStart]);

  const today = new Date();

  const activityMap = useMemo(() => {
    const m: Record<string, typeof activities> = {};
    for (const a of activities) {
      if (!m[a.date]) m[a.date] = [];
      m[a.date].push(a);
    }
    return m;
  }, [activities]);

  const spendMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of expenses) {
      const d = e.date.slice(0, 10);
      m[d] = (m[d] || 0) + e.amount;
    }
    return m;
  }, [expenses]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Calendar</h1>
          <p className="page-subtitle">Your activities and spending at a glance</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] px-3 min-w-[140px] text-center">
            {format(current, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {grid.map((day, idx) => {
            const key       = format(day, "yyyy-MM-dd");
            const dayActs   = activityMap[key] || [];
            const daySpend  = spendMap[key] || 0;
            const inMonth   = isSameMonth(day, current);
            const isToday   = isSameDay(day, today);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[90px] md:min-h-[110px] border-b border-r border-[var(--color-border-light)] p-1.5 flex flex-col",
                  !inMonth && "bg-[var(--color-bg-alt)]",
                  isWeekend && inMonth && "bg-blue-50/30",
                  isToday && "bg-[var(--color-primary-light)]"
                )}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-[var(--color-primary)] text-white"
                      : inMonth
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-muted)]"
                  )}>
                    {format(day, "d")}
                  </span>
                  {daySpend > 0 && (
                    <span className="text-[9px] font-semibold text-[var(--color-error)] flex items-center gap-0.5">
                      <DollarSign className="w-2.5 h-2.5" />{daySpend.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Activity chips */}
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayActs.slice(0, 2).map(act => (
                    <div
                      key={act.id}
                      className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded text-white"
                      style={{ background: CAT_COLORS[act.category] || "#9aa0a6" }}
                      title={act.title}
                    >
                      {act.title}
                    </div>
                  ))}
                  {dayActs.length > 2 && (
                    <span className="text-[9px] text-[var(--color-text-muted)] font-medium pl-1">
                      +{dayActs.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4 flex flex-wrap gap-3">
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-[var(--color-text-secondary)]">{cat}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <DollarSign className="w-3 h-3 text-[var(--color-error)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">Daily spend</span>
        </div>
      </div>

      {/* This month summary */}
      {(activities.length > 0 || Object.keys(spendMap).length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Activities this month", value: activities.filter(a => {
              const d = parseISO(a.date);
              return isSameMonth(d, current);
            }).length, icon: CalendarDays, color: "#1a73e8" },
            { label: "Spent this month", value: `$${Object.entries(spendMap).filter(([k]) => {
              return isSameMonth(parseISO(k), current);
            }).reduce((s, [, v]) => s + v, 0).toFixed(0)}`, icon: DollarSign, color: "#ea4335" },
            { label: "Completed", value: activities.filter(a => a.completed && isSameMonth(parseISO(a.date), current)).length, icon: CalendarDays, color: "#34a853" },
            { label: "Pending", value: activities.filter(a => !a.completed && isSameMonth(parseISO(a.date), current)).length, icon: CalendarDays, color: "#fbbc04" },
          ].map(stat => (
            <div key={stat.label} className="card p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: stat.color + "18" }}>
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">{stat.label}</span>
              </div>
              <p className="text-xl font-semibold text-[var(--color-text-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
