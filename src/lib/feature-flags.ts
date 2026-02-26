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

