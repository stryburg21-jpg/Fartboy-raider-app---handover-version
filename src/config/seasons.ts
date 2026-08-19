export interface SeasonConfig {
  seasonId: number;
  name: string;
  subtitle: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
  spendableXpCarryLimit: number; // 50,000 Spendable XP max carry
}

export const CURRENT_SEASON: SeasonConfig = {
  seasonId: 1,
  name: "Season 1: Stench of Valor",
  subtitle: "The Genesis Competitive Season & Social Prestige Track",
  durationDays: 90,
  startDate: "2026-08-01T00:00:00Z",
  endDate: "2026-10-30T00:00:00Z",
  status: "active",
  spendableXpCarryLimit: 50000,
};

export const SEASON_REWARDS_PER_TIER = {
  xpPerTier: 1000,
  totalTiers: 50,
  /**
   * Contributor Track Rules:
   * - 50-Tier linear progression.
   * - Free track is open to all raiders.
   * - Contributor Track (contributorTierUnlocked) is unlocked exclusively for users with an active Contributor Rank.
   * - Rewards are strictly non-pay-to-win (cosmetic badges, themes, avatars, frames, and spendable XP only).
   */
  requiresContributorRankForBonusTrack: true,
  nonPayToWinRestricted: true,
} as const;

export const SEASON_PASS_RULES = {
  totalTiers: 50,
  xpPerTier: 1000,
  requiresContributorRankForBonusTrack: true,
  nonPayToWinRestricted: true,
} as const;

export interface LegacyCommemorativeBadge {
  id: string;
  seasonId: number;
  seasonName: string;
  excessXpConverted: number;
  badgeCount: number;
  grantedAt: string;
}
