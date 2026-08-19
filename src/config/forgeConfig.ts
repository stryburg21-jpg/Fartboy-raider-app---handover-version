import type { Rarity, EquipmentSlot, Player, Item } from "@/types/game";
import { calculateActive6Stats } from "@/utils/itemStats";

export interface ForgeTierRule {
  fromRarity: Rarity;
  toRarity: Rarity;
  requiredDuplicates: number; // Total identical items required (including base item)
  costXP: number; // Spendable XP cost
  fromRaidPower: number;
  toRaidPower: number;
  allowForge: boolean;
}

export const MAX_ITEM_LEVEL = 10;
export const MAX_LEVEL_CUMULATIVE_COST_XP = 447500;

export interface PlayerForgeModifiers {
  forgeEfficiencyPct: number;
  luckPct: number;
  rerollQualityFloor: number;
  hasEfficiencyDiscount: boolean;
  hasLuckBoost: boolean;
}

/**
 * Calculates dynamic Forge efficiency discounts and Luck reroll floors
 * based on the player's active equipped gear and profile stats.
 */
export function getPlayerForgeModifiers(
  player: Player | null | undefined,
  inventory: Item[] = [],
): PlayerForgeModifiers {
  if (!player) {
    return {
      forgeEfficiencyPct: 10,
      luckPct: 4.0,
      rerollQualityFloor: 0.84,
      hasEfficiencyDiscount: true,
      hasLuckBoost: true,
    };
  }

  const equippedItems = inventory.filter((item) => {
    if (item.equipped) return true;
    if (player.equipped && Object.values(player.equipped).includes(item.id)) return true;
    return false;
  });

  const active6 = calculateActive6Stats(equippedItems);

  // 1. Forge Efficiency Stat:
  // Check explicit forge efficiency from items/metadata or passive gear bonus / generalXP
  let explicitEfficiency = 0;
  for (const it of equippedItems) {
    const rawStats = it.stats as Record<string, unknown> | undefined;
    const rawMeta = it.metadata as Record<string, unknown> | undefined;
    if (typeof rawStats?.forgeEfficiency === "number") {
      explicitEfficiency += rawStats.forgeEfficiency;
    } else if (typeof rawMeta?.forge_efficiency === "number") {
      explicitEfficiency += rawMeta.forge_efficiency;
    }
  }

  const playerStats = player.stats as Record<string, unknown> | undefined;
  if (typeof playerStats?.forgeEfficiency === "number") {
    explicitEfficiency += playerStats.forgeEfficiency;
  }

  // Derive Forge Efficiency percentage (capped at 50% discount to maintain game balance)
  const forgeEfficiencyPct = Math.min(
    50,
    Math.max(
      0,
      explicitEfficiency > 0
        ? explicitEfficiency
        : active6.generalXP || active6.totalGearBonus || 10,
    ),
  );

  // 2. Luck Stat (For Stat Rerolls):
  // Baseline floor is 80% (0.80). Luck stat skews floor towards 100%.
  const luckPct = Math.max(0, active6.luck > 0 ? active6.luck : 4.0);
  const luckFloorAddition = luckPct / 100;
  const rerollQualityFloor = Math.min(1.0, Number((0.8 + luckFloorAddition).toFixed(4)));

  return {
    forgeEfficiencyPct: Number(forgeEfficiencyPct.toFixed(1)),
    luckPct: Number(luckPct.toFixed(1)),
    rerollQualityFloor,
    hasEfficiencyDiscount: forgeEfficiencyPct > 0,
    hasLuckBoost: luckPct > 0,
  };
}

/**
 * Calculates discounted SP-XP cost based on active Forge Efficiency.
 */
export function calculateForgeDiscount(
  baseCost: number,
  efficiencyPct: number,
): {
  baseCost: number;
  discountedCost: number;
  discountPct: number;
  discountAmount: number;
} {
  if (efficiencyPct <= 0 || baseCost <= 0) {
    return {
      baseCost,
      discountedCost: baseCost,
      discountPct: 0,
      discountAmount: 0,
    };
  }

  const discountPct = Math.min(50, Math.max(0, efficiencyPct));
  const discountAmount = Math.round(baseCost * (discountPct / 100));
  const discountedCost = Math.max(0, baseCost - discountAmount);

  return {
    baseCost,
    discountedCost,
    discountPct,
    discountAmount,
  };
}

/**
 * Calculates Luck floor bonus for Stat Rerolls.
 */
export function calculateLuckRerollFloor(luckPct: number): {
  baseFloor: number;
  boostedFloor: number;
  luckBonusPct: number;
} {
  const luckBonusPct = Math.max(0, luckPct);
  const boostedFloor = Math.min(1.0, Number((0.8 + luckBonusPct / 100).toFixed(4)));
  return {
    baseFloor: 0.8,
    boostedFloor,
    luckBonusPct,
  };
}

/**
 * Official Fartboy Raid 2.0 Season 1 Level Up XP Curve (Levels 1 -> 10)
 * Total cumulative cost to reach Level 10 is 447,500 SP-XP.
 */
export const LEVEL_UP_XP_COSTS: Record<number, number> = {
  1: 2500, // Lvl 1 -> 2
  2: 5000, // Lvl 2 -> 3
  3: 10000, // Lvl 3 -> 4
  4: 20000, // Lvl 4 -> 5
  5: 35000, // Lvl 5 -> 6
  6: 50000, // Lvl 6 -> 7
  7: 75000, // Lvl 7 -> 8
  8: 100000, // Lvl 8 -> 9
  9: 150000, // Lvl 9 -> 10
};

export const SECONDARY_SLOTS_BY_RARITY: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 1,
  epic: 2,
  legendary: 2,
  mythic: 3,
};

export function getLevelUpCostXP(currentLevel: number): number {
  if (currentLevel >= MAX_ITEM_LEVEL) return 0;
  return LEVEL_UP_XP_COSTS[currentLevel] ?? 2500;
}

export function getCumulativeLevelCostXP(level: number): number {
  const target = Math.min(MAX_ITEM_LEVEL, Math.max(1, level));
  let sum = 0;
  for (let i = 1; i < target; i++) {
    sum += LEVEL_UP_XP_COSTS[i] ?? 0;
  }
  return sum;
}

/**
 * Official Fartboy Raid 2.0 Season 1 Forge Upgrade Rules
 */
export const FORGE_UPGRADE_RULES: Record<Rarity, ForgeTierRule> = {
  common: {
    fromRarity: "common",
    toRarity: "uncommon",
    requiredDuplicates: 3, // Requires 3 identical Common items (base + 2 duplicates)
    costXP: 2500,
    fromRaidPower: 10,
    toRaidPower: 15,
    allowForge: true,
  },
  uncommon: {
    fromRarity: "uncommon",
    toRarity: "rare",
    requiredDuplicates: 4, // Requires 4 identical Uncommon items (base + 3 duplicates)
    costXP: 7500,
    fromRaidPower: 15,
    toRaidPower: 25,
    allowForge: true,
  },
  rare: {
    fromRarity: "rare",
    toRarity: "epic",
    requiredDuplicates: 5, // Requires 5 identical Rare items (base + 4 duplicates)
    costXP: 15000,
    fromRaidPower: 25,
    toRaidPower: 45,
    allowForge: true,
  },
  epic: {
    fromRarity: "epic",
    toRarity: "legendary",
    requiredDuplicates: 7, // Requires 7 identical Epic items (base + 6 duplicates)
    costXP: 35000,
    fromRaidPower: 45,
    toRaidPower: 85,
    allowForge: true,
  },
  legendary: {
    fromRarity: "legendary",
    toRarity: "mythic",
    requiredDuplicates: 0,
    costXP: 0,
    fromRaidPower: 85,
    toRaidPower: 85,
    allowForge: false, // NOT AVAILABLE: Mythic items cannot be forged
  },
  mythic: {
    fromRarity: "mythic",
    toRarity: "mythic",
    requiredDuplicates: 0,
    costXP: 0,
    fromRaidPower: 120,
    toRaidPower: 120,
    allowForge: false, // NOT AVAILABLE: Mythic items cannot be forged
  },
};

/**
 * Official Fartboy Raid 2.0 Season 1 Dismantle XP Recovery Sinks
 * Dismantling duplicates refunds Spendable XP directly to player profile.
 */
export const FORGE_DISMANTLE_RATES: Record<Rarity, number> = {
  common: 350,
  uncommon: 1000,
  rare: 2500,
  epic: 6500,
  legendary: 18000,
  mythic: 45000,
};

/**
 * Reroll Mechanic Configurations
 */
export interface StatRerollRule {
  costXP: number; // 5,000 Spendable XP
  allowedRarities: Rarity[]; // Rare, Epic, Legendary, Mythic
  minQuality: number; // 0.80 (80%)
  maxQuality: number; // 1.00 (100%)
}

export interface IdentityRerollRule {
  costXP: number; // 15,000 Spendable XP
  allowedRarities: Rarity[]; // Rare, Epic, Legendary
  disallowedRarities: Rarity[]; // Mythic
  disallowedSetPrefixes: string[]; // Contributor Pass variants
}

export const FORGE_REROLL_RULES = {
  statReroll: {
    costXP: 5000,
    allowedRarities: ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as Rarity[],
    minQuality: 0.8,
    maxQuality: 1.0,
  } as StatRerollRule,
  identityReroll: {
    costXP: 15000,
    allowedRarities: ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as Rarity[],
    disallowedRarities: [] as Rarity[],
    disallowedSetPrefixes: ["Contributor Pass", "Contributor", "CP_"],
  } as IdentityRerollRule,
};

/**
 * Helper to check if an item rarity is eligible for Fusion Upgrade
 */
export function canForgeItem(rarity: Rarity): boolean {
  return FORGE_UPGRADE_RULES[rarity]?.allowForge ?? false;
}

/**
 * Helper to get fusion requirements for a given item rarity
 */
export function getForgeRequirement(rarity: Rarity): {
  requiredDuplicates: number; // total copies needed
  neededDuplicates: number; // additional copies needed beyond base item
  costXP: number;
  targetRarity: Rarity | null;
  targetPower: number;
  allowForge: boolean;
} {
  const rule = FORGE_UPGRADE_RULES[rarity];
  if (!rule || !rule.allowForge) {
    return {
      requiredDuplicates: 0,
      neededDuplicates: 0,
      costXP: 0,
      targetRarity: null,
      targetPower: rule?.fromRaidPower ?? 0,
      allowForge: false,
    };
  }
  return {
    requiredDuplicates: rule.requiredDuplicates,
    neededDuplicates: rule.requiredDuplicates - 1,
    costXP: rule.costXP,
    targetRarity: rule.toRarity,
    targetPower: rule.toRaidPower,
    allowForge: true,
  };
}

/**
 * Helper to get dismantle XP recovery for an item rarity
 */
export function getDismantleRefundXP(rarity: Rarity): number {
  return FORGE_DISMANTLE_RATES[rarity] ?? 500;
}
