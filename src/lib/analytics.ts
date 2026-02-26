import { Activity, Expense, MissionHistory } from "@/lib/types";

export type WeekendSummary = {
  totalHoursPlanned: number;
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  totalSpent: number;
  remainingBudget: number;
  budgetAccuracy: number;
  activityDiversityScore: number;
};

export type EngagementMetrics = {
  planningStreak: number;
  weekendsCompleted: number;
  averageWeekendSpend: number;
  averageTimeUtilization: number;
};

export function calculateWeekendSummary(params: {
  activities: Activity[];
  expenses: Expense[];
  weeklySavingsGoal: number;
}): WeekendSummary {
  const { activities, expenses, weeklySavingsGoal } = params;

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.completed).length;
  const completionRate =
    totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(weeklySavingsGoal - totalSpent, 0);

  const budgetAccuracy =
    weeklySavingsGoal === 0
      ? 0
      : Math.round((1 - Math.abs(weeklySavingsGoal - totalSpent) / weeklySavingsGoal) * 100);

  const categoryCounts = activities.reduce<Record<string, number>>((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {});

  const uniqueCategories = Object.keys(categoryCounts).length;
  const activityDiversityScore = Math.min(uniqueCategories * 12.5, 100);

  // Simple assumption: each activity is roughly 2 hours
  const totalHoursPlanned = totalActivities * 2;

  return {
    totalHoursPlanned,
    totalActivities,
    completedActivities,
    completionRate,
    totalSpent,
    remainingBudget,
    budgetAccuracy: Math.max(0, Math.min(100, budgetAccuracy)),
    activityDiversityScore,
  };
}

export function calculateEngagementMetrics(params: {
  history: MissionHistory[];
}): EngagementMetrics {
  const { history } = params;

  const weekendsCompleted = history.length;

  const averageWeekendSpend =
    weekendsCompleted === 0
      ? 0
      : Math.round(
          history.reduce((sum, mission) => sum + mission.totalSpent, 0) / weekendsCompleted
        );

  const averageTimeUtilization =
    weekendsCompleted === 0
      ? 0
      : Math.round(
          history.reduce((sum, mission) => sum + mission.activitiesCount, 0) /
            weekendsCompleted *
            10
        ); // simple proxy: more activities ~= higher utilization

  // Streak: consecutive recent weekends with a mission logged
  const planningStreak = calculatePlanningStreak(history);

  return {
    planningStreak,
    weekendsCompleted,
    averageWeekendSpend,
    averageTimeUtilization: Math.max(0, Math.min(100, averageTimeUtilization)),
  };
}

function calculatePlanningStreak(history: MissionHistory[]): number {
  if (history.length === 0) return 0;

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1].date);
    const previous = new Date(sorted[i].date);
    const diffInDays = Math.abs(current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays <= 9) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

