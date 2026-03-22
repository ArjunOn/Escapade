/**
 * Recommendation Service
 * Bridges the Zustand store context with the real scoring engine.
 * Fetches live events from the API and scores them for the current user.
 */

import { scoreEvents, RecommendationContext, ScoredEvent } from "@/lib/recommendation-engine";
import type { AvailabilityWindow } from "@/lib/types";

export interface LocalRecommendationParams {
  userPreferences: string[];
  userVibes: string[];
  weeklyBudgetRemaining: number;
  userLat?: number;
  userLng?: number;
  availabilityWindows: AvailabilityWindow[];
}

/**
 * Client-side: fetch events from our API and score them.
 * Call this from a React component with useEffect.
 */
export async function fetchAndScoreRecommendations(
  params: LocalRecommendationParams,
  topN = 6
): Promise<ScoredEvent[]> {
  try {
    const lat = params.userLat ?? 42.3314;
    const lng = params.userLng ?? -83.0458;
    const maxCost = params.weeklyBudgetRemaining > 0
      ? params.weeklyBudgetRemaining
      : undefined;

    const query = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      days: "14",
      limit: "60",
    });
    if (maxCost !== undefined) query.set("maxCost", String(maxCost));

    const res = await fetch(`/api/events?${query}`);
    if (!res.ok) return [];

    const data = await res.json();
    const events = (data.events || []).map((e: any) => ({
      ...e,
      startDateTime: new Date(e.startDateTime),
    }));

    const context: RecommendationContext = {
      userLat: lat,
      userLng: lng,
      userPreferences: params.userPreferences,
      userVibes: params.userVibes,
      weeklyBudgetRemaining: params.weeklyBudgetRemaining,
      availabilityWindows: params.availabilityWindows,
    };

    return scoreEvents(events, context, topN);
  } catch {
    return [];
  }
}
