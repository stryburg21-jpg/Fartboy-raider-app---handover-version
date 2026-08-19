import type { Rarity } from "@/types/game";

export interface PackRarityWeights {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

export interface PackGuaranteedRules {
  minimumRarity?: Rarity;
  noCommon?: boolean;
}

export interface PackTargetSetRules {
  allowTargetSetSelection: boolean;
  missingItemWeightBoost: number; // 1.5 = +150% weight boost
}

export interface PackPityRules {
  epicPityThreshold: number;
  legendaryPityThreshold: number;
}

export interface PackConfig {
  id: string;
  name: string;
  description: string;
  cost: number; // Spendable XP
  itemsPerPack: number;
  rarityWeights: PackRarityWeights;
  guaranteedRules?: PackGuaranteedRules;
  targetSetRules?: PackTargetSetRules;
  pityRules?: PackPityRules;
  badge?: string;
  image: string;
  color: string;
}

export const SEASON_1_PACKS: PackConfig[] = [
  {
    id: "pack_raider",
    name: "Raider Pack",
    description: "Standard Season 1 supply pack for early-game progression.",
    cost: 5000,
    itemsPerPack: 3,
    rarityWeights: {
      common: 0.5,
      uncommon: 0.3,
      rare: 0.12,
      epic: 0.06,
      legendary: 0.02,
      mythic: 0.0,
    },
    guaranteedRules: {},
    pityRules: {
      epicPityThreshold: 20,
      legendaryPityThreshold: 30,
    },
    badge: "ENTRY COLLECTION",
    image: "📦",
    color: "emerald",
  },
  {
    id: "pack_specialist",
    name: "Specialist Pack",
    description: "Targeted set completion pack with +150% boost for missing set items.",
    cost: 15000,
    itemsPerPack: 3,
    rarityWeights: {
      common: 0.45,
      uncommon: 0.3,
      rare: 0.15,
      epic: 0.077,
      legendary: 0.023,
      mythic: 0.0,
    },
    targetSetRules: {
      allowTargetSetSelection: true,
      missingItemWeightBoost: 1.5,
    },
    pityRules: {
      epicPityThreshold: 20,
      legendaryPityThreshold: 30,
    },
    badge: "TARGETED SETS",
    image: "🎯",
    color: "purple",
  },
  {
    id: "pack_legendary_raider",
    name: "Legendary Pack",
    description: "End-game chase pack with zero common drops and guaranteed Rare+ drops.",
    cost: 50000,
    itemsPerPack: 3,
    rarityWeights: {
      common: 0.0,
      uncommon: 0.2,
      rare: 0.5,
      epic: 0.22,
      legendary: 0.075,
      mythic: 0.005,
    },
    guaranteedRules: {
      minimumRarity: "rare",
      noCommon: true,
    },
    pityRules: {
      epicPityThreshold: 10,
      legendaryPityThreshold: 20,
    },
    badge: "CHASE PACK",
    image: "💎",
    color: "amber",
  },
];

export const SEASON_1_PACKS_MAP: Record<string, PackConfig> = SEASON_1_PACKS.reduce(
  (acc, pack) => {
    acc[pack.id] = pack;
    return acc;
  },
  {} as Record<string, PackConfig>,
);
