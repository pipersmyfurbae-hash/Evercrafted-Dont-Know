export type Tier = 'free' | 'bloom' | 'craft' | 'studio' | 'pro';

export interface TierLimits {
  designsPerMonth: number;
  canExportSVG: boolean;
  canExportPrompt: boolean;
  canSell: boolean;
  hasInventoryWeaver: boolean;
  hasDesignStudio: boolean;
  hasCreatorUpload: boolean;
  hasAdvancedAI: boolean;
}

export const TIER_CONFIG: Record<Tier, TierLimits> = {
  free: {
    designsPerMonth: 0,
    canExportSVG: false,
    canExportPrompt: false,
    canSell: false,
    hasInventoryWeaver: false,
    hasDesignStudio: false,
    hasCreatorUpload: false,
    hasAdvancedAI: false,
  },
  bloom: {
    designsPerMonth: 2,
    canExportSVG: false,
    canExportPrompt: false,
    canSell: false,
    hasInventoryWeaver: false,
    hasDesignStudio: false,
    hasCreatorUpload: false,
    hasAdvancedAI: false,
  },
  craft: {
    designsPerMonth: 50,
    canExportSVG: true,
    canExportPrompt: true,
    canSell: false,
    hasInventoryWeaver: true,
    hasDesignStudio: false,
    hasCreatorUpload: false,
    hasAdvancedAI: false,
  },
  studio: {
    designsPerMonth: Infinity,
    canExportSVG: true,
    canExportPrompt: true,
    canSell: true,
    hasInventoryWeaver: true,
    hasDesignStudio: true,
    hasCreatorUpload: true,
    hasAdvancedAI: false,
  },
  pro: {
    designsPerMonth: Infinity,
    canExportSVG: true,
    canExportPrompt: true,
    canSell: true,
    hasInventoryWeaver: true,
    hasDesignStudio: true,
    hasCreatorUpload: true,
    hasAdvancedAI: true,
  },
};

export function checkFeatureAccess(tier: Tier, feature: keyof TierLimits): boolean {
  const config = TIER_CONFIG[tier];
  if (!config) return false;
  const access = config[feature];
  return typeof access === 'boolean' ? access : false;
}

export function checkUsageLimit(currentUsage: number, tier: Tier): boolean {
  return currentUsage < TIER_CONFIG[tier].designsPerMonth;
}

/**
 * profiles.role in the Supabase schema (owner/admin/client) has no
 * corresponding notion of a purchased tier — there's no per-creator
 * subscription entitlement for design tools today (see
 * marketplace_apps/marketplace_app_subscriptions, which only cover a few
 * unrelated named add-ons). Bridges role to the closest Tier so existing
 * checkFeatureAccess() call sites (Layout, TierGuard) keep working without
 * a real tier column to read. Replace this once a real per-creator
 * entitlement exists.
 */
export function roleToTier(role: 'owner' | 'admin' | 'client' | undefined): Tier {
  if (role === 'owner' || role === 'admin') return 'studio';
  return 'free';
}
