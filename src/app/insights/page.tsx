"use client";

import { useAppStore } from "@/store";
import { getLocalWeekendSummary, getLocalEngagementSummary } from "@/services/analytics-service";
import { getLocalGamificationSummary } from "@/services/gamification-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Activity as ActivityIcon, CalendarRange, LineChart } from "lucide-react";

export default function InsightsPage() {
  const { activities, expenses, weeklySavingsGoal, history } = useAppStore();

  const weekend = getLocalWeekendSummary({
    activities,
    expenses,
    weeklySavingsGoal,
  });
  const engagement = getLocalEngagementSummary({ history });
  const gamification = getLocalGamificationSummary({ activities, history });

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Weekend Insights</h1>
        <p className="text-sm text-slate-500">
          A gentle overview of how you spend your time and budget across weekends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <ActivityIcon className="w-4 h-4 text-primary" />
              Time utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Planned hours</span>
              <span className="font-semibold text-slate-800">
                {weekend.totalHoursPlanned.toFixed(0)}h
              </span>
            </div>
            <Progress value={weekend.completionRate} />
            <p className="text-xs text-slate-500">
              You completed {weekend.completedActivities} of {weekend.totalActivities} planned
              activities ({weekend.completionRate}%).
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarRange className="w-4 h-4 text-primary" />
              Planning streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-slate-800">
                {engagement.planningStreak}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                weekends in a row
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Keep planning a little something each weekend to grow this streak.
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Trophy className="w-4 h-4 text-accent" />
              Weekend score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-slate-800">
                {gamification.weekendScore}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                out of 100
              </span>
            </div>
            <Progress value={gamification.weekendScore} />
            <div className="flex flex-wrap gap-1 mt-1">
              {gamification.badges
                .filter((b) => b.unlocked)
                .map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  >
                    {badge.label}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LineChart className="w-4 h-4 text-primary" />
              Budget & habits over time
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              A high-level view of your average spend and activity mix across completed weekends.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Average weekend spend
            </p>
            <p className="text-xl font-semibold text-slate-800">
              ${engagement.averageWeekendSpend.toFixed(0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Activity diversity
            </p>
            <p className="text-xl font-semibold text-slate-800">
              {weekend.activityDiversityScore.toFixed(0)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Budget accuracy
            </p>
            <p className="text-xl font-semibold text-slate-800">
              {weekend.budgetAccuracy.toFixed(0)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

