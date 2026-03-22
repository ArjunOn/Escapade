/**
 * Real Multi-Signal Recommendation Engine
 * Scores ExternalEvents using: interest match, budget fit, time fit, distance, recency
 */

export interface AvailabilityWindow {
  dayOfWeek: number; // 0=Sun, 1=Mon...6=Sat
  startHour: number;
  endHour: number;
}

export interface EventForScoring {
  id: string;
  title: string;
  category: string | null;
  tags: string[];
  startDateTime: Date;
  cost: number;
  isFree: boolean;
  isVirtual: boolean;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  city: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  costMax?: number | null;
}

export interface ScoredEvent extends EventForScoring {
  score: number;
  reason: string;
  matchedTags: string[];
}

export interface RecommendationContext {
  userLat?: number;
  userLng?: number;
  userPreferences: string[]; // interests like "Jazz", "Hiking", "Art"
  userVibes: string[];        // mood/vibe like "Relaxation", "Social"
  weeklyBudgetRemaining: number;
  availabilityWindows: AvailabilityWindow[];
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTimeFitScore(event: EventForScoring, windows: AvailabilityWindow[]): number {
  if (windows.length === 0) return 0.5; // no preference set — neutral
  const eventDay = event.startDateTime.getDay();
  const eventHour = event.startDateTime.getHours();
  const matchingWindow = windows.find(
    w => w.dayOfWeek === eventDay && eventHour >= w.startHour && eventHour < w.endHour
  );
  return matchingWindow ? 1 : 0.1;
}

function getBudgetScore(event: EventForScoring, remaining: number): number {
  if (event.isFree || event.cost === 0) return 1;
  if (remaining <= 0) return 0;
  if (event.cost <= remaining) return 1;
  // Partial fit — 50% budget remaining covers 50% of cost = 0.5 score
  return Math.max(0, remaining / event.cost);
}

function getDistanceScore(event: EventForScoring, userLat?: number, userLng?: number): number {
  if (event.isVirtual) return 0.8; // virtual events are always somewhat relevant
  if (!userLat || !userLng || !event.lat || !event.lng) return 0.5;
  const miles = haversineMiles(userLat, userLng, event.lat, event.lng);
  if (miles <= 5) return 1;
  if (miles <= 15) return 0.8;
  if (miles <= 30) return 0.5;
  return 0.2;
}

function getInterestScore(event: EventForScoring, preferences: string[], vibes: string[]): {
  score: number;
  matched: string[];
} {
  const allPrefs = [...preferences, ...vibes].map(p => p.toLowerCase());
  const eventTerms = [
    ...(event.tags || []),
    event.category || "",
    event.title,
  ].map(t => t.toLowerCase());

  const matched: string[] = [];
  let score = 0;

  for (const pref of allPrefs) {
    if (eventTerms.some(t => t.includes(pref) || pref.includes(t))) {
      matched.push(pref);
      score += 1;
    }
  }

  return { score: Math.min(score / Math.max(allPrefs.length, 1), 1), matched };
}

export function scoreEvents(
  events: EventForScoring[],
  context: RecommendationContext,
  topN = 10
): ScoredEvent[] {
  const { userLat, userLng, userPreferences, userVibes, weeklyBudgetRemaining, availabilityWindows } = context;

  return events
    .map(event => {
      const { score: interestScore, matched } = getInterestScore(event, userPreferences, userVibes);
      const budgetScore = getBudgetScore(event, weeklyBudgetRemaining);
      const timeScore = getTimeFitScore(event, availabilityWindows);
      const distScore = getDistanceScore(event, userLat, userLng);

      // Weighted composite score
      const score =
        interestScore * 0.40 +
        budgetScore   * 0.30 +
        timeScore     * 0.15 +
        distScore     * 0.15;

      const reasons: string[] = [];
      if (matched.length > 0) reasons.push(`matches your interest in ${matched.slice(0, 2).join(" & ")}`);
      if (budgetScore >= 0.9) reasons.push(event.isFree ? "free to attend" : "fits your budget");
      if (timeScore === 1) reasons.push("fits your schedule");
      if (distScore >= 0.8 && !event.isVirtual) reasons.push("nearby");
      if (event.isVirtual) reasons.push("attend from home");

      return {
        ...event,
        score,
        reason: reasons.join(" · ") || "well-rounded pick for your weekend",
        matchedTags: matched,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
