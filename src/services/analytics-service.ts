/**
 * Analytics Service — client-safe functions only.
 * Server-side DB operations are handled by API routes.
 */
import { Activity, Expense, MissionHistory } from "@/lib/types";
import { calculateWeekendSummary, calculateEngagementMetrics } from "@/lib/analytics";

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
