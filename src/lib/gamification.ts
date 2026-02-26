import { Activity, MissionHistory } from "@/lib/types";

export type BadgeId = "explorer" | "budget-master" | "consistent-planner";

export type Badge = {
  id: BadgeId;
  label: string;
  description: string;
  unlocked: boolean;
};

export type GamificationSummary = {
  weekendScore: number;
  streak: number;
  badges: Badge[];
};

export function calculateWeekendScore(params: {
  activities: Activity[];
  history: MissionHistory[];
}): GamificationSummary {
  const { activities, history } = params;

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.completed).length;
  const completionRate =
    totalActivities === 0 ? 0 : completedActivities / totalActivities;

  const baseScore = completionRate * 70;

  const diversityBonus = calculateDiversityBonus(activities);
  const streakBonus = Math.min(history.length * 3, 30);

  const weekendScore = Math.round(
    Math.max(0, Math.min(100, baseScore + diversityBonus + streakBonus))
  );

  const streak = history.length;
  const badges = deriveBadges({ activities, history, streak, weekendScore });

  return {
    weekendScore,
    streak,
    badges,
  };
}

function calculateDiversityBonus(activities: Activity[]): number {
  const categories = new Set(activities.map((a) => a.category));
  const diversityMultiplier = Math.min(categories.size, 4);
  return diversityMultiplier * 5;
}

function deriveBadges(params: {
  activities: Activity[];
  history: MissionHistory[];
  streak: number;
  weekendScore: number;
}): Badge[] {
  const { activities, history, streak, weekendScore } = params;

  const hasDiverseCategories = new Set(activities.map((a) => a.category)).size >= 4;
  const hasBudgetConsistency = history.some(
    (m) => m.totalSpent <= m.savingsGoal && m.savingsGoal > 0
  );

  const badges: Badge[] = [
    {
      id: "explorer",
      label: "Explorer",
      description: "Tried a diverse mix of activities.",
      unlocked: hasDiverseCategories || weekendScore >= 70,
    },
    {
      id: "budget-master",
      label: "Budget Master",
      description: "Kept weekend spending in line with your goal.",
      unlocked: hasBudgetConsistency,
    },
    {
      id: "consistent-planner",
      label: "Consistent Planner",
      description: "Planned weekends several times in a row.",
      unlocked: streak >= 3,
    },
  ];

  return badges;
}

