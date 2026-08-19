import {
  SEASON_1_CONTRIBUTOR_PASS_CONFIG,
  type ContributorPassReward,
  type ContributorTierConfig,
} from "@/config/contributorPassConfig";
import { getActiveProfileData } from "@/services/profiles";
import { useGameStore } from "@/store/gameStore";
import type { Title } from "@/types/game";
import { safeStorage } from "@/lib/storage";

export interface UserContributorPassData {
  discordId: string;
  seasonId: number;
  contributorXP: number;
  currentTier: number;
  hasContributorUnlock: boolean;
  claimedFreeRewards: number[];
  claimedContributorRewards: number[];
  createdAt: string;
  updatedAt: string;
  transactionHistory: Array<{
    id: string;
    amount: number;
    source: string;
    timestamp: string;
  }>;
}

const STORAGE_KEY = "fartboy_user_contributor_pass_v1";

// In-flight locks to guarantee atomic claim transactions
const claimingInFlight = new Set<string>();

// Event emitter hooks for Discord Bot integration
type TierUnlockedListener = (tier: number, data: UserContributorPassData) => void;
type RewardClaimedListener = (
  tier: number,
  track: "free" | "contributor",
  reward: ContributorPassReward,
) => void;

const tierUnlockedListeners: TierUnlockedListener[] = [];
const rewardClaimedListeners: RewardClaimedListener[] = [];

export function onContributorTierUnlocked(listener: TierUnlockedListener): () => void {
  tierUnlockedListeners.push(listener);
  return () => {
    const idx = tierUnlockedListeners.indexOf(listener);
    if (idx >= 0) tierUnlockedListeners.splice(idx, 1);
  };
}

export function onContributorRewardClaimed(listener: RewardClaimedListener): () => void {
  rewardClaimedListeners.push(listener);
  return () => {
    const idx = rewardClaimedListeners.indexOf(listener);
    if (idx >= 0) rewardClaimedListeners.splice(idx, 1);
  };
}

function emitContributorEvent(
  eventType: "contributor_tier_unlocked" | "contributor_reward_claimed",
  payload: {
    tier: number;
    data?: UserContributorPassData;
    track?: "free" | "contributor";
    reward?: ContributorPassReward;
  },
) {
  if (eventType === "contributor_tier_unlocked") {
    tierUnlockedListeners.forEach((fn) => fn(payload.tier, payload.data));
  } else if (eventType === "contributor_reward_claimed") {
    rewardClaimedListeners.forEach((fn) => fn(payload.tier, payload.track, payload.reward));
  }
}

/**
 * Calculates contributor tier based strictly on CP-XP.
 * Tiers: 1 to 50. Each tier requires 10,000 CP-XP.
 * Tier 0 = less than 10,000 CP-XP (not completed Tier 1).
 */
export function calculateContributorTier(cpxp: number): number {
  const xpPerTier = SEASON_1_CONTRIBUTOR_PASS_CONFIG.xpPerTier;
  const maxTiers = SEASON_1_CONTRIBUTOR_PASS_CONFIG.totalTiers;
  const tier = Math.floor(cpxp / xpPerTier);
  return Math.max(0, Math.min(maxTiers, tier));
}

/**
 * Loads user contributor pass data from persistent local storage.
 */
export function getContributorPassData(): UserContributorPassData {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UserContributorPassData = JSON.parse(raw);
      // Ensure recalculation of tier
      parsed.currentTier = calculateContributorTier(parsed.contributorXP);
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load contributor pass data", err);
  }

  const defaultData: UserContributorPassData = {
    discordId: "fartboy_raider_1337",
    seasonId: SEASON_1_CONTRIBUTOR_PASS_CONFIG.seasonId,
    contributorXP: 0,
    currentTier: 0,
    hasContributorUnlock: false,
    claimedFreeRewards: [],
    claimedContributorRewards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transactionHistory: [],
  };

  saveContributorPassData(defaultData);
  return defaultData;
}

export function saveContributorPassData(data: UserContributorPassData): void {
  try {
    data.updatedAt = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save contributor pass data", err);
  }
}

/**
 * Toggles or sets Contributor Pass unlock status (Pass Purchase / Activation).
 */
export function toggleContributorPassUnlock(unlocked?: boolean): UserContributorPassData {
  const data = getContributorPassData();
  data.hasContributorUnlock = unlocked !== undefined ? unlocked : !data.hasContributorUnlock;
  saveContributorPassData(data);
  return data;
}

/**
 * Gets high-level progress details for the UI.
 */
export function getContributorProgress(): {
  cpxp: number;
  currentTier: number;
  xpIntoTier: number;
  xpForNextTier: number;
  progressPercent: number;
  hasContributorUnlock: boolean;
} {
  const data = getContributorPassData();
  const xpPerTier = SEASON_1_CONTRIBUTOR_PASS_CONFIG.xpPerTier;
  const cpxp = data.contributorXP;
  const currentTier = data.currentTier;

  const xpIntoTier = cpxp % xpPerTier;
  const xpForNextTier = xpPerTier;
  const progressPercent = Math.min(100, Math.floor((xpIntoTier / xpPerTier) * 100));

  return {
    cpxp,
    currentTier,
    xpIntoTier,
    xpForNextTier,
    progressPercent,
    hasContributorUnlock: data.hasContributorUnlock,
  };
}

/**
 * Awards Contributor Pass XP (CP-XP) for verified contribution actions.
 * Completely isolated from Lifetime / Spendable / Combat XP.
 */
export async function awardContributorXP(
  amount: number,
  source: string,
  eventId?: string,
): Promise<{ success: boolean; newCPXP: number; newTier: number; leveledUp: boolean }> {
  if (amount <= 0) {
    const current = getContributorPassData();
    return {
      success: false,
      newCPXP: current.contributorXP,
      newTier: current.currentTier,
      leveledUp: false,
    };
  }

  const data = getContributorPassData();

  // Deduplicate transaction if eventId provided
  if (eventId && data.transactionHistory.some((tx) => tx.id === eventId)) {
    return {
      success: true,
      newCPXP: data.contributorXP,
      newTier: data.currentTier,
      leveledUp: false,
    };
  }

  const prevTier = data.currentTier;
  data.contributorXP += amount;
  const newTier = calculateContributorTier(data.contributorXP);
  data.currentTier = newTier;

  data.transactionHistory.unshift({
    id: eventId || `cpxp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    amount,
    source,
    timestamp: new Date().toISOString(),
  });

  // Limit transaction history length
  if (data.transactionHistory.length > 50) {
    data.transactionHistory = data.transactionHistory.slice(0, 50);
  }

  saveContributorPassData(data);

  const leveledUp = newTier > prevTier;
  if (leveledUp) {
    emitContributorEvent("contributor_tier_unlocked", { tier: newTier, data });
  }

  return {
    success: true,
    newCPXP: data.contributorXP,
    newTier,
    leveledUp,
  };
}

/**
 * Claims a free or contributor track reward for a completed tier.
 */
export async function claimContributorReward(
  tierNumber: number,
  track: "free" | "contributor",
): Promise<{ success: boolean; message: string; reward?: ContributorPassReward }> {
  const lockKey = `${track}_${tierNumber}`;
  if (claimingInFlight.has(lockKey)) {
    return { success: false, message: "Claim request already in progress." };
  }

  claimingInFlight.add(lockKey);

  try {
    const data = getContributorPassData();

    // 1. Validate Tier Completion
    if (data.currentTier < tierNumber) {
      return {
        success: false,
        message: `Tier ${tierNumber} is locked. Reach ${tierNumber * SEASON_1_CONTRIBUTOR_PASS_CONFIG.xpPerTier} CP-XP to unlock.`,
      };
    }

    // 2. Validate Contributor Pass Unlock if claiming contributor track
    if (track === "contributor" && !data.hasContributorUnlock) {
      return {
        success: false,
        message: "Unlock the Contributor Pass to access the Contributor Track rewards.",
      };
    }

    // 3. Validate Duplicate Claims
    const claimedList = track === "free" ? data.claimedFreeRewards : data.claimedContributorRewards;
    if (claimedList.includes(tierNumber)) {
      return { success: false, message: `Tier ${tierNumber} ${track} reward already claimed.` };
    }

    // 4. Find Tier Config
    const tierCfg = SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers.find((t) => t.tier === tierNumber);
    if (!tierCfg) {
      return { success: false, message: `Tier ${tierNumber} configuration not found.` };
    }

    const reward = track === "free" ? tierCfg.freeReward : tierCfg.contributorReward;

    // 5. Grant Reward via cosmetic/identity systems
    const profile = getActiveProfileData();

    if (reward.type === "title" && reward.titleId) {
      const existingTitles = profile.player.titles || [];
      if (!existingTitles.some((t) => t.id === reward.titleId)) {
        const newTitle: Title = {
          id: reward.titleId,
          name: reward.name,
          equipped: false,
          unlocked: true,
          description: reward.description,
        };
        profile.player.titles = [...existingTitles, newTitle];
      }
    }

    // Record claimed status
    if (track === "free") {
      data.claimedFreeRewards.push(tierNumber);
    } else {
      data.claimedContributorRewards.push(tierNumber);
    }

    saveContributorPassData(data);

    // Sync player in Zustand gameStore
    useGameStore.getState().setPlayer({ ...profile.player });

    emitContributorEvent("contributor_reward_claimed", {
      tier: tierNumber,
      track,
      reward,
    });

    return {
      success: true,
      message: `Claimed Tier ${tierNumber} ${reward.name}!`,
      reward,
    };
  } finally {
    claimingInFlight.delete(lockKey);
  }
}

export const awardSeasonPassXP = awardContributorXP;
