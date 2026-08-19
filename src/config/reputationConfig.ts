export interface ReputationTier {
  tier: number;
  id: string;
  name: string;
  shortName: string;
  tierName: string;
  minScore: number;
  maxScore: number;
  minRepXP: number; // Backward compatibility alias
  nextTierRepXP: number; // Backward compatibility alias for next tier threshold
  multiplier: number; // 0.5, 0.75, 1.0, 1.25, 1.50
  multiplierPct: number; // -50.0, -25.0, 0.0, 25.0, 50.0
  badgeEmoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
}

/**
 * 0–1000 Reputation Score Model Constants
 */
export const BASE_REPUTATION_SCORE = 500;
export const MIN_REPUTATION_SCORE = 0;
export const MAX_REPUTATION_SCORE = 1000;

// Legacy alias constants for backward compatibility
export const WEEKLY_REP_XP_CAP = 10000;
export const MAX_REPUTATION_XP = 1000;

/**
 * Reputation Penalty Types & Deductions
 */
export type ReputationPenaltyType = "spam" | "fake_engagement" | "multi_account";

export interface ReputationPenalty {
  type: ReputationPenaltyType;
  name: string;
  penalty: number; // negative deduction
  description: string;
}

export const REPUTATION_PENALTIES: Record<ReputationPenaltyType, ReputationPenalty> = {
  spam: {
    type: "spam",
    name: "Spam / Repetitive Activity",
    penalty: -50,
    description:
      "Repeated spam, copy-pasting raid comments, or low-effort bot-like behavior (-50 Rep).",
  },
  fake_engagement: {
    type: "fake_engagement",
    name: "Fake Engagement / Deleted Actions",
    penalty: -100,
    description:
      "Unliking/unretweeting after verification, deleted raid proofs, or falsified links (-100 Rep).",
  },
  multi_account: {
    type: "multi_account",
    name: "Multi-Account / Sybil Abuse",
    penalty: -500,
    description:
      "Running automated farming alt accounts or coordinated Sybil manipulation (-500 Rep).",
  },
};

/**
 * Official Reputation Score Tiers (0–1000 Model):
 * - <300: Severely Penalized / Restricted (0.5x Multiplier)
 * - 300–499: Probational Raider (0.75x Multiplier)
 * - 500–699: Baseline Raider (1.0x Multiplier) [Starting Base Score = 500]
 * - 700–999: Trusted Raider (1.25x Multiplier)
 * - 1000+: Apex / High Standing (1.5x Multiplier)
 */
export const REPUTATION_TIERS: ReputationTier[] = [
  {
    tier: 0,
    id: "tier_0_restricted",
    name: "Restricted / Penalized",
    shortName: "Restricted",
    tierName: "Tier 0 (Restricted <300)",
    minScore: 0,
    maxScore: 299,
    minRepXP: 0,
    nextTierRepXP: 300,
    multiplier: 0.5,
    multiplierPct: -50.0,
    badgeEmoji: "⛔",
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    description:
      "Severely penalized for infractions (spam, sybil abuse). Multiplier reduced to 0.5x (-50% penalty).",
  },
  {
    tier: 1,
    id: "tier_1_probational",
    name: "Probational",
    shortName: "Probational",
    tierName: "Tier 1 (Probational 300-499)",
    minScore: 300,
    maxScore: 499,
    minRepXP: 300,
    nextTierRepXP: 500,
    multiplier: 0.75,
    multiplierPct: -25.0,
    badgeEmoji: "⚠️",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    description: "Probational raider standing. Multiplier reduced to 0.75x (-25% penalty).",
  },
  {
    tier: 2,
    id: "tier_2_baseline",
    name: "Baseline Raider",
    shortName: "Baseline",
    tierName: "Tier 2 (Baseline 500-699)",
    minScore: 500,
    maxScore: 699,
    minRepXP: 500,
    nextTierRepXP: 700,
    multiplier: 1.0,
    multiplierPct: 0.0,
    badgeEmoji: "🛡️",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/30",
    description:
      "Standard community baseline standing. Default starting score (500 Rep) with 1.0x baseline XP output.",
  },
  {
    tier: 3,
    id: "tier_3_trusted",
    name: "Trusted Raider",
    shortName: "Trusted",
    tierName: "Tier 3 (Trusted 700-999)",
    minScore: 700,
    maxScore: 999,
    minRepXP: 700,
    nextTierRepXP: 1000,
    multiplier: 1.25,
    multiplierPct: 25.0,
    badgeEmoji: "⭐",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    description:
      "Trusted veteran raider standing. Unlocks +25.0% passive multiplier (1.25x XP output).",
  },
  {
    tier: 4,
    id: "tier_4_apex",
    name: "Apex / High Standing",
    shortName: "Apex",
    tierName: "Tier 4 (Apex 1000+)",
    minScore: 1000,
    maxScore: Infinity,
    minRepXP: 1000,
    nextTierRepXP: 1000,
    multiplier: 1.5,
    multiplierPct: 50.0,
    badgeEmoji: "👑",
    colorClass: "text-amber-300 font-extrabold",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-400/60",
    description:
      "Apex high standing raider. Unlocks maximum +50.0% passive multiplier (1.50x XP output).",
  },
];

/**
 * Resolves a player's Reputation Tier by 0-1000 Reputation Score (or rank name fallback)
 */
export function getReputationTier(
  score: number = BASE_REPUTATION_SCORE,
  rankName?: string,
): ReputationTier {
  if (rankName && typeof score !== "number") {
    const cleanRank = rankName.toLowerCase().trim();
    if (cleanRank.includes("apex") || cleanRank.includes("og") || cleanRank.includes("4")) {
      return REPUTATION_TIERS[4];
    }
    if (
      cleanRank.includes("trusted") ||
      cleanRank.includes("vanguard") ||
      cleanRank.includes("3")
    ) {
      return REPUTATION_TIERS[3];
    }
    if (
      cleanRank.includes("baseline") ||
      cleanRank.includes("contributor") ||
      cleanRank.includes("2")
    ) {
      return REPUTATION_TIERS[2];
    }
    if (
      cleanRank.includes("probational") ||
      cleanRank.includes("initiate") ||
      cleanRank.includes("1")
    ) {
      return REPUTATION_TIERS[1];
    }
    if (
      cleanRank.includes("restricted") ||
      cleanRank.includes("penalized") ||
      cleanRank.includes("0")
    ) {
      return REPUTATION_TIERS[0];
    }
  }

  const safeScore = Math.max(0, score);
  if (safeScore >= 1000) return REPUTATION_TIERS[4];
  if (safeScore >= 700) return REPUTATION_TIERS[3];
  if (safeScore >= 500) return REPUTATION_TIERS[2];
  if (safeScore >= 300) return REPUTATION_TIERS[1];
  return REPUTATION_TIERS[0];
}

/**
 * Returns the multiplicative factor (1.50, 1.25, 1.00, 0.75, or 0.50)
 */
export function getReputationMultiplier(
  score: number = BASE_REPUTATION_SCORE,
  rankName?: string,
): number {
  const tier = getReputationTier(score, rankName);
  return tier.multiplier;
}

/**
 * Returns the passive boost / penalty percentage (+50%, +25%, 0%, -25%, -50%)
 */
export function getReputationMultiplierPct(
  score: number = BASE_REPUTATION_SCORE,
  rankName?: string,
): number {
  const tier = getReputationTier(score, rankName);
  return tier.multiplierPct;
}

/**
 * Applies a reputation penalty to a score and returns the updated score and tier
 */
export function applyReputationPenalty(
  currentScore: number = BASE_REPUTATION_SCORE,
  penaltyType: ReputationPenaltyType,
): { newScore: number; penaltyApplied: number; tier: ReputationTier } {
  const penaltyRule = REPUTATION_PENALTIES[penaltyType];
  const deduction = penaltyRule ? penaltyRule.penalty : 0;
  const newScore = Math.max(MIN_REPUTATION_SCORE, currentScore + deduction);
  const tier = getReputationTier(newScore);
  return {
    newScore,
    penaltyApplied: deduction,
    tier,
  };
}
