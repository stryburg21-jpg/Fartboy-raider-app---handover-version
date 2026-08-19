import type { EquipmentSlot, Item, Player } from "@/types/game";
import { resolveItemById } from "@/lib/equipmentResolver";
import { mockSets } from "@/services/collection";

import {
  getReputationTier,
  WEEKLY_REP_XP_CAP,
  MAX_REPUTATION_XP,
  type ReputationTier,
} from "@/config/reputationConfig";

export interface EquipmentCapSummary {
  rawBonusXP: number;
  cappedBonusXP: number;
  maxCapXP: number;
  isCapped: boolean;
  capProgressPct: number;
}

export interface SpecialistSetSummary {
  activeSetName: string | null;
  activeCategory: string | null;
  piecesEquipped: number;
  piecesRequired: number;
  is7of7Complete: boolean;
  bonusXP: number;
  bonusDescription: string;
}

export interface ReputationSummary {
  score: number;
  tier: number;
  tierName: string;
  shortName: string;
  multiplier: number;
  multiplierPct: number;
  badgeEmoji: string;
  currentRepXP: number;
  nextTierRepXP: number;
  weeklyCap: number;
  weeklyEarned: number;
  isWarbound: boolean;
  nextTierThreshold: number | null;
}

export interface DecayCeilingSummary {
  dailyXPEarned: number;
  tierLabel: string;
  marginalRate: number; // e.g. 1.0, 0.75, 0.50, 0.25, 0.0
  decayTier: number; // 1 to 5
}

export interface SeasonalTitleSummary {
  prestigeDivision: string;
  bonusXP: number;
  badgeEmoji: string;
}

export interface EconomyLuckSummary {
  packLuckPct: number;
  collectionLuckPct: number;
  forgeEfficiencyPct: number;
}

export interface PowerRatingsSummary {
  raidPower: number;
  ctoPower: number;
  memePower: number;
  videoPower: number;
  missionPower: number;
  grandTotalPower: number;
}

export interface FullEconomyCalculation {
  equipmentCap: EquipmentCapSummary;
  specialistSet: SpecialistSetSummary;
  seasonalTitle: SeasonalTitleSummary;
  reputation: ReputationSummary;
  decayCeiling: DecayCeilingSummary;
  luck: EconomyLuckSummary;
  power: PowerRatingsSummary;
  effectiveMultiplier: number;
  rawBaseMultiplier: number;
  netMultiplierWithDecay: number;
}

/**
 * Calculates Equipment XP bonus with strict +10.0% capping.
 */
export function calculateEquipmentXpCap(
  equippedMap: Partial<Record<EquipmentSlot, string>> = {},
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
): EquipmentCapSummary {
  let rawBonusXP = 0;

  for (const [slot, itemId] of Object.entries(equippedMap)) {
    if (slot === "cosmeticTheme" || slot === "frame") continue; // Theme/Frame slots do not count toward gear stats
    if (itemId) {
      const item = resolveItemById(itemId, inventory, itemsById);
      if (item && item.bonusXP) {
        rawBonusXP += item.bonusXP;
      }
    }
  }

  const maxCapXP = 10.0;
  const cappedBonusXP = Math.min(maxCapXP, rawBonusXP);
  const isCapped = rawBonusXP >= maxCapXP;
  const capProgressPct = Math.min(100, (rawBonusXP / maxCapXP) * 100);

  return {
    rawBonusXP,
    cappedBonusXP,
    maxCapXP,
    isCapped,
    capProgressPct,
  };
}

/**
 * Enforces 7/7 set bonus exclusivity (+15.0% XP for active 7/7 set, 0% for partial).
 */
export function calculateSpecialistSetBonus(
  equippedMap: Partial<Record<EquipmentSlot, string>> = {},
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
): SpecialistSetSummary {
  const equippedItemIds = Object.entries(equippedMap)
    .filter(([slot]) => slot !== "cosmeticTheme" && slot !== "frame")
    .map(([, id]) => id)
    .filter(Boolean) as string[];

  const setCounts: Record<string, number> = {};

  for (const id of equippedItemIds) {
    const item = resolveItemById(id, inventory, itemsById);
    if (item?.set) {
      setCounts[item.set] = (setCounts[item.set] || 0) + 1;
    }
  }

  let maxEquippedCount = 0;
  let topSetName: string | null = null;

  for (const [setName, count] of Object.entries(setCounts)) {
    if (count > maxEquippedCount) {
      maxEquippedCount = count;
      topSetName = setName;
    }
  }

  if (!topSetName) {
    return {
      activeSetName: null,
      activeCategory: null,
      piecesEquipped: 0,
      piecesRequired: 7,
      is7of7Complete: false,
      bonusXP: 0,
      bonusDescription: "No set items equipped",
    };
  }

  const foundSet = mockSets.find((s) => s.name === topSetName);
  const required = foundSet?.requiredItemIds.length || 7;
  const is7of7Complete = maxEquippedCount >= required;

  return {
    activeSetName: topSetName,
    activeCategory: foundSet?.category ?? topSetName.replace(" Set", ""),
    piecesEquipped: maxEquippedCount,
    piecesRequired: required,
    is7of7Complete,
    bonusXP: is7of7Complete ? 15.0 : 0,
    bonusDescription: is7of7Complete
      ? "+15.0% Specialist Category XP Bonus Active"
      : `Incomplete Set (${maxEquippedCount}/${required} pieces equipped — 0% Set Bonus)`,
  };
}

/**
 * Calculates Seasonal Title XP Bonus (+1% to +5% based on prior season division).
 */
export function calculateSeasonalTitleXp(prestigeDivision: string = "Gold"): SeasonalTitleSummary {
  const div = prestigeDivision.toLowerCase();
  if (div.includes("master") || div.includes("prestige")) {
    return { prestigeDivision: "Master / Prestige", bonusXP: 5.0, badgeEmoji: "👑" };
  }
  if (div.includes("diamond")) {
    return { prestigeDivision: "Diamond Tier", bonusXP: 4.0, badgeEmoji: "💎" };
  }
  if (div.includes("gold")) {
    return { prestigeDivision: "Gold Tier", bonusXP: 3.0, badgeEmoji: "🥇" };
  }
  if (div.includes("silver")) {
    return { prestigeDivision: "Silver Tier", bonusXP: 2.0, badgeEmoji: "🥈" };
  }
  return { prestigeDivision: "Bronze Tier", bonusXP: 1.0, badgeEmoji: "🥉" };
}

/**
 * Calculates Reputation Multiplier based on 0-1000 Reputation Score Model:
 * - Tier 0 (<300): 0.5x Multiplier (-50% Penalty)
 * - Tier 1 (300-499): 0.75x Multiplier (-25% Penalty)
 * - Tier 2 (500-699): 1.0x Multiplier (Baseline, starting score 500)
 * - Tier 3 (700-999): 1.25x Multiplier (+25% Boost)
 * - Tier 4 (1000+): 1.5x Multiplier (+50% Boost)
 */
export function calculateReputationSummary(
  score: number = 500,
  rankName?: string,
): ReputationSummary {
  const tier = getReputationTier(score, rankName);
  const nextThreshold = tier.tier >= 4 ? null : tier.nextTierRepXP;

  // Estimated weekly raid rep earned within cap
  const weeklyEarned = Math.min(WEEKLY_REP_XP_CAP, Math.round(score % WEEKLY_REP_XP_CAP || 4200));

  return {
    score,
    tier: tier.tier,
    tierName: tier.tierName,
    shortName: tier.shortName,
    multiplier: tier.multiplier,
    multiplierPct: tier.multiplierPct,
    badgeEmoji: tier.badgeEmoji,
    currentRepXP: score,
    nextTierRepXP: tier.nextTierRepXP,
    weeklyCap: WEEKLY_REP_XP_CAP,
    weeklyEarned,
    isWarbound: true,
    nextTierThreshold: nextThreshold,
  };
}

/**
 * Calculates Daily XP Decay Ceiling Tier (Canonical 25k Brackets):
 * Tier 1 (0 - 25,000 XP): 100% Rate (1.0x)
 * Tier 2 (25,001 - 50,000 XP): 75% Rate (0.75x)
 * Tier 3 (50,001 - 75,000 XP): 50% Rate (0.50x)
 * Tier 4 (75,001 - 100,000 XP): 25% Rate (0.25x)
 * Tier 5 (100,000+ XP): 0% Rate (0.0x Hard Cap)
 */
export function calculateDecayCeilingSummary(dailyXP: number): DecayCeilingSummary {
  if (dailyXP <= 25000) {
    return {
      dailyXPEarned: dailyXP,
      tierLabel: "Tier 1 (0 - 25,000 XP)",
      marginalRate: 1.0,
      decayTier: 1,
    };
  }
  if (dailyXP <= 50000) {
    return {
      dailyXPEarned: dailyXP,
      tierLabel: "Tier 2 (25,001 - 50,000 XP)",
      marginalRate: 0.75,
      decayTier: 2,
    };
  }
  if (dailyXP <= 75000) {
    return {
      dailyXPEarned: dailyXP,
      tierLabel: "Tier 3 (50,001 - 75,000 XP)",
      marginalRate: 0.5,
      decayTier: 3,
    };
  }
  if (dailyXP <= 100000) {
    return {
      dailyXPEarned: dailyXP,
      tierLabel: "Tier 4 (75,001 - 100,000 XP)",
      marginalRate: 0.25,
      decayTier: 4,
    };
  }
  return {
    dailyXPEarned: dailyXP,
    tierLabel: "Tier 5 (100,000+ XP Cap)",
    marginalRate: 0.0,
    decayTier: 5,
  };
}

/**
 * Evaluates the full dynamic economy calculation for a player state.
 */
export function calculateFullEconomy(
  player: Player | null | undefined,
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
  overrides?: {
    reputationScore?: number;
    dailyXP?: number;
    seasonalPrestigeDivision?: string;
  },
): FullEconomyCalculation {
  const equippedMap = player?.equipped ?? {};
  const repScore = overrides?.reputationScore ?? player?.reputation ?? 850;
  const dailyXP = overrides?.dailyXP ?? 4120;
  const prestigeDiv = overrides?.seasonalPrestigeDivision ?? "Gold";

  const equipmentCap = calculateEquipmentXpCap(equippedMap, inventory, itemsById);
  const specialistSet = calculateSpecialistSetBonus(equippedMap, inventory, itemsById);
  const seasonalTitle = calculateSeasonalTitleXp(prestigeDiv);
  const reputation = calculateReputationSummary(repScore);
  const decayCeiling = calculateDecayCeilingSummary(dailyXP);

  // Calculate Equipment & Set Base Power
  let equipmentRaidPower = 0;
  for (const [slot, id] of Object.entries(equippedMap)) {
    if (slot === "cosmeticTheme" || slot === "frame" || !id) continue;
    const it = resolveItemById(id, inventory, itemsById);
    if (it) {
      equipmentRaidPower += (it.raidPower ?? 25) * (it.level ?? 1);
    }
  }

  const playerLevel = player?.level || 1;
  const raidCount = player?.raidCount || 10;

  const raidPower = Math.round(playerLevel * 250 + raidCount * 80 + equipmentRaidPower * 4.5);
  const ctoPower = Math.round(
    playerLevel * 200 +
      (player?.lifetimeStats?.itemsCollected || 15) * 120 +
      equipmentRaidPower * 3.5,
  );
  const memePower = Math.round(
    playerLevel * 180 + (player?.lifetimeStats?.memes || 12) * 150 + equipmentRaidPower * 3.0,
  );
  const videoPower = Math.round(
    playerLevel * 190 + (player?.lifetimeStats?.videos || 8) * 180 + equipmentRaidPower * 3.2,
  );
  const missionPower = Math.round(
    playerLevel * 220 +
      (player?.lifetimeStats?.completedMissions || 40) * 90 +
      equipmentRaidPower * 4.0,
  );

  const grandTotalPower = raidPower + ctoPower + memePower + videoPower + missionPower;

  // Luck calculations
  const packLuckPct = Number(
    (12.0 + equipmentCap.cappedBonusXP * 0.8 + (specialistSet.is7of7Complete ? 5.0 : 0)).toFixed(1),
  );
  const collectionLuckPct = Number(
    (8.0 + (player?.lifetimeStats?.itemsCollected || 10) * 0.4).toFixed(1),
  );
  const forgeEfficiencyPct = Number((10.0 + playerLevel * 0.2).toFixed(1));

  // Multiplier sum
  // Base sum = 1 + cappedEquipment% + set% + title%
  const sumBonusPct = equipmentCap.cappedBonusXP + specialistSet.bonusXP + seasonalTitle.bonusXP;
  const rawBaseMultiplier = Number((1.0 + sumBonusPct / 100).toFixed(2));
  const effectiveMultiplier = Number((rawBaseMultiplier * reputation.multiplier).toFixed(2));
  const netMultiplierWithDecay = Number(
    (effectiveMultiplier * decayCeiling.marginalRate).toFixed(2),
  );

  return {
    equipmentCap,
    specialistSet,
    seasonalTitle,
    reputation,
    decayCeiling,
    luck: { packLuckPct, collectionLuckPct, forgeEfficiencyPct },
    power: { raidPower, ctoPower, memePower, videoPower, missionPower, grandTotalPower },
    effectiveMultiplier,
    rawBaseMultiplier,
    netMultiplierWithDecay,
  };
}
