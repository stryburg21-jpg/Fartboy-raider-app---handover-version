import {
  XP_ACTIVITIES,
  QUALITY_MULTIPLIERS,
  EQUIPMENT_SET_XP_BONUSES,
  getDailyDecayMultiplier,
  XP_DAILY_DECAY_BRACKETS,
  type XPActivityType,
  type QualityTier,
  type SetBonusXPConfig,
} from "@/config/xpConfig";
import { getReputationMultiplier } from "@/config/reputationConfig";
import { getLevelInfoFromLifetimeXP } from "@/config/levelConfig";
import { getCurrentPlayer, setMockPlayer } from "@/services/player";
import { getInventory } from "@/services/inventory";
import { getActiveProfileData } from "@/services/profiles";
import { useGameStore } from "@/store/gameStore";
import { resolveItemById } from "@/lib/equipmentResolver";
import { syncPlayerLeaderboards } from "@/services/leaderboards";
import { contributeToSeasonMeter } from "@/services/communityMeters";
import type { EquipmentSlot, Item, Player } from "@/types/game";

export interface ActivityUsageRecord {
  count: number;
  lastTimestamp: number;
  dailyXpEarned: number;
}

export interface PlayerDailyXPState {
  dailyXPEarned: number;
  lastResetDate: string; // YYYY-MM-DD UTC
  activityCounts: Record<string, ActivityUsageRecord>;
}

export interface XPTransactionRecord {
  id: string;
  activityType: XPActivityType;
  activityName: string;
  timestamp: string;
  baseXP: number;
  qualityMultiplier: number;
  viralBonusXP: number;
  setBonusPct: number;
  setBonusName?: string;
  grossXP: number;
  decayMultiplier: number;
  netXPAwarded: number;
  ltXpBefore: number;
  ltXpAfter: number;
  spXpBefore: number;
  spXpAfter: number;
  note?: string;
}

export interface AwardXPParams {
  activityType: XPActivityType;
  qualityTier?: QualityTier;
  customQualityMultiplier?: number;
  impressions?: number;
  customBaseXP?: number;
  note?: string;
}

export interface AwardXPResult {
  success: boolean;
  error?: string;
  transaction?: XPTransactionRecord;
  updatedPlayer?: Player;
  dailyXPEarned?: number;
  decayMultiplier?: number;
}

export interface AvailabilityStatus {
  available: boolean;
  reason?: string;
  remainingCooldownSec: number;
  remainingDailyLimit: number;
  dailyCount: number;
  dailyXPEarned: number;
  decayMultiplier: number;
}

// In-memory daily state store per session, fallback if not in active profile
let currentDailyStateCache: PlayerDailyXPState | null = null;
let currentXpHistoryCache: XPTransactionRecord[] | null = null;

/**
 * Gets current UTC date string YYYY-MM-DD
 */
export function getUTCDayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Checks and returns active daily XP tracking state, resetting if date changed.
 */
export function getPlayerDailyXPState(): PlayerDailyXPState {
  const today = getUTCDayString();

  if (!currentDailyStateCache || currentDailyStateCache.lastResetDate !== today) {
    currentDailyStateCache = {
      dailyXPEarned: 0,
      lastResetDate: today,
      activityCounts: {},
    };
  }

  return currentDailyStateCache;
}

/**
 * Gets full XP Transaction History
 */
export function getXPTransactionHistory(): XPTransactionRecord[] {
  if (!currentXpHistoryCache) {
    currentXpHistoryCache = [];
  }
  return [...currentXpHistoryCache];
}

/**
 * Records a custom XP Transaction (e.g., Forge deduction or dismantle refund)
 */
export function recordCustomXPTransaction(params: {
  activityName: string;
  netXPAwarded: number;
  spXpBefore: number;
  spXpAfter: number;
  ltXpBefore: number;
  ltXpAfter: number;
  note?: string;
}): XPTransactionRecord {
  const transaction: XPTransactionRecord = {
    id: `xptx_custom_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    activityType: "gameplay_raid_win",
    activityName: params.activityName,
    timestamp: new Date().toISOString(),
    baseXP: Math.abs(params.netXPAwarded),
    qualityMultiplier: 1,
    viralBonusXP: 0,
    setBonusPct: 0,
    grossXP: Math.abs(params.netXPAwarded),
    decayMultiplier: 1,
    netXPAwarded: params.netXPAwarded,
    ltXpBefore: params.ltXpBefore,
    ltXpAfter: params.ltXpAfter,
    spXpBefore: params.spXpBefore,
    spXpAfter: params.spXpAfter,
    note: params.note,
  };

  if (!currentXpHistoryCache) currentXpHistoryCache = [];
  currentXpHistoryCache.unshift(transaction);
  return transaction;
}

/**
 * Evaluates player's equipped items to check if a 7/7 Equipment Set is active
 */
export function getActiveEquipmentSetXPBonus(
  player: Player,
  inventory: Item[],
  activityType: XPActivityType,
): { setConfig: SetBonusXPConfig | null; isActive: boolean } {
  const equippedMap = player.equipped || {};
  const slots: EquipmentSlot[] = ["head", "face", "body", "back", "hands", "feet", "accessory"];

  const equippedSets: string[] = [];
  for (const slot of slots) {
    const itemId = equippedMap[slot];
    if (!itemId) return { setConfig: null, isActive: false };

    const item = resolveItemById(itemId, inventory);
    if (!item || !item.set) return { setConfig: null, isActive: false };

    equippedSets.push(item.set);
  }

  // Check if all 7 slots share the same set category
  const firstSet = equippedSets[0];
  const allMatch = equippedSets.every(
    (s) =>
      s === firstSet ||
      s.toLowerCase() === firstSet.toLowerCase() ||
      s.startsWith(firstSet) ||
      firstSet.startsWith(s),
  );

  if (!allMatch) return { setConfig: null, isActive: false };

  // Match against configured set bonuses
  for (const setKey of Object.keys(EQUIPMENT_SET_XP_BONUSES)) {
    if (
      firstSet.toLowerCase().includes(setKey.toLowerCase()) ||
      setKey.toLowerCase().includes(firstSet.toLowerCase())
    ) {
      const setConfig = EQUIPMENT_SET_XP_BONUSES[setKey];
      const isApplicable = setConfig.applicableActivities.includes(activityType);
      return {
        setConfig,
        isActive: isApplicable,
      };
    }
  }

  return { setConfig: null, isActive: false };
}

/**
 * Calculates total Equipment XP Bonus from individual equipped items' bonusXP stats.
 * Capped at +10% total across all items.
 */
export function getEquipmentXPBonus(player: Player, inventory: Item[]): number {
  const equippedMap = player.equipped || {};
  const slots: EquipmentSlot[] = ["head", "face", "body", "back", "hands", "feet", "accessory"];
  let totalBonusXPStat = 0;

  for (const slot of slots) {
    const itemId = equippedMap[slot];
    if (!itemId) continue;
    const item = resolveItemById(itemId, inventory);
    if (item && typeof item.bonusXP === "number") {
      totalBonusXPStat += item.bonusXP;
    }
  }

  // Capped at +10% max
  return Math.min(0.1, totalBonusXPStat / 100);
}

/**
 * Returns prior-season Prestige rank bonus (+1% to +5%).
 */
export function getPriorSeasonPrestigeBonus(player: Player): number {
  if (player.priorSeasonPrestigeBonus && typeof player.priorSeasonPrestigeBonus === "number") {
    return Math.min(0.05, Math.max(0, player.priorSeasonPrestigeBonus));
  }
  return 0;
}

/**
 * Validates whether an activity can be performed based on cooldowns and daily limits.
 */
export function validateActivityAvailability(activityType: XPActivityType): AvailabilityStatus {
  const config = XP_ACTIVITIES[activityType];
  if (!config) {
    return {
      available: false,
      reason: "Invalid activity type",
      remainingCooldownSec: 0,
      remainingDailyLimit: 0,
      dailyCount: 0,
      dailyXPEarned: 0,
      decayMultiplier: 1.0,
    };
  }

  const dailyState = getPlayerDailyXPState();
  const usage = dailyState.activityCounts[activityType] || {
    count: 0,
    lastTimestamp: 0,
    dailyXpEarned: 0,
  };

  const now = Date.now();
  const elapsedSec = (now - usage.lastTimestamp) / 1000;
  const cooldownSec = config.cooldownSeconds || 0;
  const remainingCooldown = Math.max(0, Math.ceil(cooldownSec - elapsedSec));

  const remainingLimit = Math.max(0, config.dailyLimit - usage.count);
  const decayMultiplier = getDailyDecayMultiplier(dailyState.dailyXPEarned);

  // Cooldown check
  if (remainingCooldown > 0) {
    return {
      available: false,
      reason: `Cooldown active. Please wait ${remainingCooldown}s.`,
      remainingCooldownSec: remainingCooldown,
      remainingDailyLimit: remainingLimit,
      dailyCount: usage.count,
      dailyXPEarned: dailyState.dailyXPEarned,
      decayMultiplier,
    };
  }

  // Daily count limit check
  if (remainingLimit <= 0) {
    return {
      available: false,
      reason: `Daily limit reached (${config.dailyLimit}/${config.dailyLimit}). Resets at 00:00 UTC.`,
      remainingCooldownSec: 0,
      remainingDailyLimit: 0,
      dailyCount: usage.count,
      dailyXPEarned: dailyState.dailyXPEarned,
      decayMultiplier,
    };
  }

  // Daily max activity XP check
  if (config.maxDailyXP && usage.dailyXpEarned >= config.maxDailyXP) {
    return {
      available: false,
      reason: `Daily maximum XP cap for ${config.name} reached (${config.maxDailyXP.toLocaleString()} XP).`,
      remainingCooldownSec: 0,
      remainingDailyLimit: remainingLimit,
      dailyCount: usage.count,
      dailyXPEarned: dailyState.dailyXPEarned,
      decayMultiplier,
    };
  }

  // Hard Daily Decay Cap check
  if (dailyState.dailyXPEarned >= 100000) {
    return {
      available: true,
      reason: "Daily hard cap of 100,000 XP reached. Further activity grants 0 XP.",
      remainingCooldownSec: 0,
      remainingDailyLimit: remainingLimit,
      dailyCount: usage.count,
      dailyXPEarned: dailyState.dailyXPEarned,
      decayMultiplier: 0.0,
    };
  }

  return {
    available: true,
    remainingCooldownSec: 0,
    remainingDailyLimit: remainingLimit,
    dailyCount: usage.count,
    dailyXPEarned: dailyState.dailyXPEarned,
    decayMultiplier,
  };
}

/**
 * CENTRAL XP REWARD SERVICE
 * Calculates base XP, quality multiplier, set bonus, viral engagement bonus,
 * and daily decay diminishing returns.
 * Updates Lifetime XP and Spendable XP 1:1.
 */
export async function awardActivityXP(params: AwardXPParams): Promise<AwardXPResult> {
  const {
    activityType,
    qualityTier = "standard",
    customQualityMultiplier,
    impressions = 0,
    customBaseXP,
    note,
  } = params;

  const activityConfig = XP_ACTIVITIES[activityType];
  if (!activityConfig) {
    return { success: false, error: "Unknown activity type" };
  }

  const availability = validateActivityAvailability(activityType);
  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  const player = await getCurrentPlayer();
  const inventory = await getInventory();

  // 1. Calculate Base XP
  const baseXP = customBaseXP ?? activityConfig.baseXP;
  const isMissionActivity = activityConfig.category === "mission" || activityConfig.exemptFromDecay;

  // 2. Calculate Quality Multiplier (strictly clamped to tier min/max bounds)
  let qualityMultiplier = 1.0;
  if (!isMissionActivity && activityConfig.supportsQualityMultiplier) {
    const tierConfig = QUALITY_MULTIPLIERS[qualityTier] || QUALITY_MULTIPLIERS.standard;
    if (customQualityMultiplier !== undefined) {
      qualityMultiplier = Math.min(
        tierConfig.maxMultiplier,
        Math.max(tierConfig.minMultiplier, customQualityMultiplier),
      );
    } else {
      qualityMultiplier = tierConfig.defaultMultiplier;
    }
  }

  // 3. Calculate Reputation Multiplier (exempt for flat mission activities)
  const repMultiplier = isMissionActivity ? 1.0 : getReputationMultiplier(player.reputation ?? 500);

  // 4. Calculate Equipment Set Bonus & Individual Equipment XP Bonus
  const { setConfig, isActive: setBonusActive } = getActiveEquipmentSetXPBonus(
    player,
    inventory,
    activityType,
  );
  const setBonusPct =
    !isMissionActivity && setBonusActive && setConfig ? setConfig.bonusPercentage : 0;
  const equipBonusPct = isMissionActivity ? 0 : getEquipmentXPBonus(player, inventory);
  const prestigeBonusPct = isMissionActivity ? 0 : getPriorSeasonPrestigeBonus(player);

  // 5. Calculate Gross XP: Base * Quality * Reputation * (1 + Set Bonus + Equipment Bonus + Prestige Bonus)
  const grossXP = isMissionActivity
    ? baseXP
    : Math.floor(
        baseXP *
          qualityMultiplier *
          repMultiplier *
          (1 + setBonusPct + equipBonusPct + prestigeBonusPct),
      );

  // 6. Calculate Daily Decay Diminishing Returns (Missions are flat & exempt from daily decay)
  const dailyState = getPlayerDailyXPState();
  const decayMultiplier = isMissionActivity
    ? 1.0
    : getDailyDecayMultiplier(dailyState.dailyXPEarned);

  // 7. Calculate Final Net Awarded XP
  const netXPAwarded = isMissionActivity ? baseXP : Math.floor(grossXP * decayMultiplier);

  // Record Before State
  const ltXpBefore = player.lifetimeXP ?? player.xp ?? 0;
  const spXpBefore = player.spendableXP ?? player.xp ?? 0;

  // Update Player LT-XP and SP-XP 1:1
  const ltXpAfter = ltXpBefore + netXPAwarded;
  const spXpAfter = spXpBefore + netXPAwarded;

  // Calculate Level Progression from Lifetime XP (Formula: 250 * L^2.15)
  const levelInfo = getLevelInfoFromLifetimeXP(ltXpAfter);

  // Update Activity Stats
  const activityStatsKey =
    activityConfig.category === "raid"
      ? "raids"
      : activityType === "content_meme_graphic"
        ? "memes"
        : activityType === "content_short_video"
          ? "videos"
          : null;

  const updatedLifetimeStats = { ...player.lifetimeStats };
  if (activityStatsKey && updatedLifetimeStats[activityStatsKey] !== undefined) {
    updatedLifetimeStats[activityStatsKey] += 1;
  }

  const updatedPlayer: Player = {
    ...player,
    level: levelInfo.level,
    xpToNext: levelInfo.xpRequiredForCurrentLevel,
    xp: levelInfo.xpInCurrentLevel, // XP progress within current level
    lifetimeXP: ltXpAfter,
    spendableXP: spXpAfter,
    raidCount: activityConfig.category === "raid" ? player.raidCount + 1 : player.raidCount,
    lifetimeStats: updatedLifetimeStats,
  };

  // Update Daily Tracking
  dailyState.dailyXPEarned += netXPAwarded;
  const usage = dailyState.activityCounts[activityType] || {
    count: 0,
    lastTimestamp: 0,
    dailyXpEarned: 0,
  };
  dailyState.activityCounts[activityType] = {
    count: usage.count + 1,
    lastTimestamp: Date.now(),
    dailyXpEarned: usage.dailyXpEarned + netXPAwarded,
  };

  // Create Transaction Record
  const transaction: XPTransactionRecord = {
    id: `xptx_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    activityType,
    activityName: activityConfig.name,
    timestamp: new Date().toISOString(),
    baseXP,
    qualityMultiplier,
    viralBonusXP,
    setBonusPct,
    setBonusName: setBonusActive && setConfig ? setConfig.setName : undefined,
    grossXP,
    decayMultiplier,
    netXPAwarded,
    ltXpBefore,
    ltXpAfter,
    spXpBefore,
    spXpAfter,
    note,
  };

  if (!currentXpHistoryCache) currentXpHistoryCache = [];
  currentXpHistoryCache.unshift(transaction);

  // Sync back to player mock service and Zustand store
  setMockPlayer(updatedPlayer);

  const activeProfile = getActiveProfileData();
  activeProfile.player = updatedPlayer;

  // Sync to Leaderboards (Seasonal, Weekly, Squad)
  syncPlayerLeaderboards(netXPAwarded);

  // Synchronize store state if active
  useGameStore.setState({
    player: updatedPlayer,
  });

  // Feature 1 (Community Season Meter): single additive hook — every XP award also
  // feeds the shared weekly meter (scaled down; counts at full value regardless of
  // this player's own daily decay, per spec). Never block the XP award on this.
  if (netXPAwarded > 0) {
    contributeToSeasonMeter(netXPAwarded).catch((e) =>
      console.error("[Season Meter] contribution failed", e),
    );
  }

  return {
    success: true,
    transaction,
    updatedPlayer,
    dailyXPEarned: dailyState.dailyXPEarned,
    decayMultiplier,
  };
}
