export type SubscriptionTier = "free" | "plus" | "pro";

export type FeatureKey =
  | "insights"
  | "ai-companion"
  | "advanced-recommendations"
  | "export-data";

type FeatureConfig = {
  key: FeatureKey;
  minTier: SubscriptionTier;
};

const FEATURE_CONFIG: FeatureConfig[] = [
  { key: "insights", minTier: "free" },
  { key: "ai-companion", minTier: "free" },
  { key: "advanced-recommendations", minTier: "plus" },
  { key: "export-data", minTier: "pro" },
];

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: FeatureKey
): boolean {
  const config = FEATURE_CONFIG.find((f) => f.key === feature);
  if (!config) return false;

  const order: SubscriptionTier[] = ["free", "plus", "pro"];
  return order.indexOf(tier) >= order.indexOf(config.minTier);
}

// For API routes - checks if user has access to a feature
// In production, this should fetch the user's subscription tier from the database
export async function isFeatureEnabled(userId: string, feature: FeatureKey): Promise<boolean> {
  // For now, return true for all features (free tier has access to everything)
  // In production, you would:
  // 1. Fetch user subscription tier from database
  // 2. Call canAccessFeature(userTier, feature)
  return true;
}

