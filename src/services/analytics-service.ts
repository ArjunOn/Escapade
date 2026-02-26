import { db } from "@/lib/db";
import { Activity, Expense, MissionHistory } from "@/lib/types";
import {
  calculateWeekendSummary,
  calculateEngagementMetrics,
} from "@/lib/analytics";

export async function trackLogin(userId: string) {
  await db.engagementMetric.create({
    data: {
      userId,
      loginCount: 1,
    },
  });
}

export async function trackPlanningEvent(userId: string) {
  await db.engagementMetric.create({
    data: {
      userId,
      planningCount: 1,
    },
  });
}

export function getLocalWeekendSummary(params: {
  activities: Activity[];
  expenses: Expense[];
  weeklySavingsGoal: number;
}) {
  return calculateWeekendSummary(params);
}

export function getLocalEngagementSummary(params: {
  history: MissionHistory[];
}) {
  return calculateEngagementMetrics(params);
}

