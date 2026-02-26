import { UserProfile } from "@/lib/types";
import { canAccessFeature, FeatureKey, SubscriptionTier } from "@/lib/feature-flags";

export function getCurrentTier(_profile: UserProfile | null): SubscriptionTier {
  // Placeholder: wire to Stripe / billing provider later.
  // For now, treat everyone as "free" and use this as a single integration point.
  return "free";
}

export function isFeatureEnabled(
  feature: FeatureKey,
  profile: UserProfile | null
): boolean {
  const tier = getCurrentTier(profile);
  return canAccessFeature(tier, feature);
}

