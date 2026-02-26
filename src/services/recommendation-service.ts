import { generateRecommendations } from "@/lib/recommendation-engine";
import { Activity, Expense, UserProfile } from "@/lib/types";

export function getLocalRecommendations(params: {
  userProfile: UserProfile | null;
  activities: Activity[];
  expenses: Expense[];
  weeklySavingsGoal: number;
  availableHours: number;
}) {
  return generateRecommendations(params);
}

