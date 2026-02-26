import { calculateWeekendScore } from "@/lib/gamification";
import { Activity, MissionHistory } from "@/lib/types";

export function getLocalGamificationSummary(params: {
  activities: Activity[];
  history: MissionHistory[];
}) {
  return calculateWeekendScore(params);
}

