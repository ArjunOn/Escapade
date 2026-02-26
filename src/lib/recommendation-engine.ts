import { Activity, Expense, UserProfile } from "@/lib/types";
import { MOCK_EVENTS, DiscoveryEvent } from "@/lib/data";

export type RecommendationContext = {
  userProfile: UserProfile | null;
  activities: Activity[];
  expenses: Expense[];
  weeklySavingsGoal: number;
  availableHours: number;
};

export type RankedRecommendation = DiscoveryEvent & {
  score: number;
  reason: string;
};

export function generateRecommendations(
  context: RecommendationContext
): RankedRecommendation[] {
  const { userProfile, activities, expenses, weeklySavingsGoal, availableHours } = context;

  const remainingBudget =
    weeklySavingsGoal -
    expenses.reduce((sum, e) => sum + e.amount, 0);

  const preferredTags = new Set(userProfile?.preferences ?? []);
  const preferredVibes = new Set(userProfile?.vibes ?? []);

  return MOCK_EVENTS.map((event) => {
    const tagMatches = event.tags.filter((t) => preferredTags.has(t)).length;
    const vibeMatches = event.vibes.filter((v) => preferredVibes.has(v)).length;

    const costFit =
      remainingBudget <= 0
        ? 0
        : event.cost <= remainingBudget
        ? 1
        : remainingBudget / event.cost;

    const timeFit = availableHours <= 0 ? 0.5 : 1;

    const preferenceScore = tagMatches * 2 + vibeMatches;
    const budgetScore = costFit * 3;
    const timeScore = timeFit * 2;

    const score = preferenceScore + budgetScore + timeScore;

    const reasonParts: string[] = [];
    if (tagMatches > 0) reasonParts.push("matches your interests");
    if (vibeMatches > 0) reasonParts.push("fits your weekend vibe");
    if (event.cost === 0) reasonParts.push("free to enjoy");
    else if (costFit >= 0.8) reasonParts.push("fits your budget");

    return {
      ...event,
      score,
      reason: reasonParts.join(", ") || "balanced fit for your weekend",
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

