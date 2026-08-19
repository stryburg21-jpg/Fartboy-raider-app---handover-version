import { SEASON_1_CATALOG, normalizeSlot, RARITY_CONFIG } from "@/config/masterCatalog";
import { SEASON_1_PACKS_MAP, type PackConfig, type PackRarityWeights } from "@/config/packs";
import { computeStatValue, STAT_META, type BibleStatKey } from "@/services/economyEngineBible";
import type { Item, Rarity, EquipmentSlot } from "@/types/game";

export interface PerPackPityCounter {
  epicPityCounter: number;
  legendaryPityCounter: number;
  totalPacksOpened: number;
}

export interface PityState {
  // Per pack ID pity counters
  packs?: Record<string, PerPackPityCounter>;
  // Global / fallback accessors
  epicPityCounter: number;
  legendaryPityCounter: number;
  totalPacksOpened: number;
}

export interface GenerateLootOptions {
  packConfig: PackConfig;
  playerInventory?: Item[];
  equippedItems?: Item[];
  equippedLuckPct?: number;
  targetSetName?: string;
  pityState?: PityState;
}

export interface GenerateLootResult {
  items: Item[];
  updatedPityState: PityState;
  slotAntiClusteringApplied: boolean;
  missingItemBoostsAppliedCount: number;
  packId: string;
  epicPityTriggered: boolean;
  legendaryPityTriggered: boolean;
  luckAppliedPct: number;
}

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

/**
 * Compare rarities: returns > 0 if r1 > r2, 0 if equal, < 0 if r1 < r2
 */
export function compareRarities(r1: Rarity, r2: Rarity): number {
  return RARITY_ORDER.indexOf(r1) - RARITY_ORDER.indexOf(r2);
}

/**
 * Calculates equipped luck percentage from player's inventory/equipped gear
 */
export function calculateEquippedLuck(equippedItems: Item[] = []): number {
  let totalLuck = 0;
  for (const item of equippedItems) {
    // Check metadata stats
    const rawMeta = item.metadata as Record<string, unknown> | undefined;
    if (rawMeta && typeof rawMeta.luck_bonus === "number") {
      totalLuck += rawMeta.luck_bonus;
    }
    // Check item secondaries or stats
    if (item.stats) {
      const statsObj = item.stats as Record<string, unknown>;
      if (typeof statsObj.luck === "number") {
        totalLuck += statsObj.luck;
      }
    }
    // Check bonusXP or generic luck attribute if primary/secondary stat is luck
    if (item.name?.toLowerCase().includes("lucky") || item.name?.toLowerCase().includes("clover")) {
      totalLuck += 2.5;
    }
  }
  return Number(Math.max(0, totalLuck).toFixed(2));
}

/**
 * Generates an item Quality Roll PCT (80% - 100%) dynamically skewed by equipped Luck.
 * Luck does NOT alter base rarity probabilities, but pulls the quality curve toward 100%.
 */
export function rollQualityPct(equippedLuckPct: number = 0): {
  qualityPct: number;
  qualityRollRaw: number;
} {
  const safeLuck = Math.max(0, equippedLuckPct);
  // Base uniform random in [0, 1]
  const baseRoll = Math.random();
  // Power transformation skew: higher luck skews distribution closer to 1.0
  const skewExponent = 1 / (1 + safeLuck / 15);
  const transformedRoll = Math.pow(baseRoll, skewExponent);

  // Quality range is 80% to 100% (0.80 to 1.00)
  const qualityRoll = 0.8 + 0.2 * transformedRoll;
  const clampedQuality = Math.min(1.0, Math.max(0.8, Number(qualityRoll.toFixed(4))));

  return {
    qualityPct: clampedQuality,
    qualityRollRaw: Number((clampedQuality * 100).toFixed(1)),
  };
}

/**
 * Roll a rarity from defined weights with optional guaranteed minimums and pity protection overrides.
 * Fixed base rates - never modified by Luck stats.
 */
export function rollRarity(
  weights: PackRarityWeights,
  minimumRarity?: Rarity,
  noCommon?: boolean,
): Rarity {
  const activeWeights = { ...weights };

  if (noCommon) {
    activeWeights.common = 0;
  }

  // Calculate sum of active weights
  let totalWeight = 0;
  for (const rarity of RARITY_ORDER) {
    if (minimumRarity && compareRarities(rarity, minimumRarity) < 0) {
      activeWeights[rarity] = 0;
    }
    totalWeight += activeWeights[rarity] || 0;
  }

  if (totalWeight <= 0) {
    return minimumRarity || "rare";
  }

  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (const rarity of RARITY_ORDER) {
    const w = activeWeights[rarity] || 0;
    if (w <= 0) continue;
    cumulative += w;
    if (rand <= cumulative) {
      return rarity;
    }
  }

  return minimumRarity || "rare";
}

/**
 * Server-Side Deterministic Loot Generation Engine v3.2
 *
 * Requirements:
 * 1. Fixed Rarity Rates (Luck does NOT alter rarity probabilities).
 * 2. Independent Per-Pack Pity Counters (Epic+ & Legendary+ per pack type).
 * 3. Mythic Rule: NO pity protection (Pure 0.5% RNG roll in Legendary pack).
 * 4. Slot Anti-Clustering Check: If all 3 items roll identical slot, auto-reroll 3rd slot.
 * 5. Quality Roll PCT (80% - 100%) dynamically skewed by equipped Luck.
 * 6. Specialist Pack: Incomplete set slots receive +150% probability weight (scaling further with player Luck).
 */
export function generatePackLoot(options: GenerateLootOptions): GenerateLootResult {
  const {
    packConfig,
    playerInventory = [],
    equippedItems = [],
    equippedLuckPct,
    targetSetName,
    pityState,
  } = options;

  const packId = packConfig.id;
  const luckValue =
    equippedLuckPct !== undefined ? equippedLuckPct : calculateEquippedLuck(equippedItems);

  // Initialize or read per-pack pity state
  const currentPityState: PityState = pityState
    ? { ...pityState, packs: { ...(pityState.packs || {}) } }
    : { epicPityCounter: 0, legendaryPityCounter: 0, totalPacksOpened: 0, packs: {} };

  if (!currentPityState.packs) {
    currentPityState.packs = {};
  }

  // Get specific pity counter for this pack type
  const packPity: PerPackPityCounter = currentPityState.packs[packId]
    ? { ...currentPityState.packs[packId] }
    : {
        epicPityCounter: currentPityState.epicPityCounter || 0,
        legendaryPityCounter: currentPityState.legendaryPityCounter || 0,
        totalPacksOpened: 0,
      };

  packPity.totalPacksOpened += 1;
  packPity.epicPityCounter += 1;
  packPity.legendaryPityCounter += 1;

  currentPityState.totalPacksOpened += 1;
  currentPityState.epicPityCounter += 1;
  currentPityState.legendaryPityCounter += 1;

  const epicPityThreshold = packConfig.pityRules?.epicPityThreshold ?? 20;
  const legendaryPityThreshold = packConfig.pityRules?.legendaryPityThreshold ?? 30;

  // Check if pity thresholds are reached (Guaranteed on the final roll of the pack)
  let triggerEpicPity = packPity.epicPityCounter >= epicPityThreshold;
  let triggerLegendaryPity = packPity.legendaryPityCounter >= legendaryPityThreshold;

  const rolledItems: Item[] = [];
  const rolledSlots: string[] = [];
  let slotAntiClusteringApplied = false;
  let missingItemBoostsAppliedCount = 0;

  // Track owned item template IDs for missing item weighting boost calculation
  const ownedItemTemplateIds = new Set<string>();
  for (const invItem of playerInventory) {
    if (invItem.templateId) ownedItemTemplateIds.add(invItem.templateId);
    if (invItem.id) ownedItemTemplateIds.add(invItem.id);
  }

  const itemsToRollCount = packConfig.itemsPerPack || 3;

  for (let i = 0; i < itemsToRollCount; i++) {
    const isLastRoll = i === itemsToRollCount - 1;

    // Determine target minimum rarity for this roll based on guaranteed rules and pity
    let minRarityOverride: Rarity | undefined = packConfig.guaranteedRules?.minimumRarity;

    // Pity Protection (Mythic is excluded - pure RNG only)
    if (triggerLegendaryPity && isLastRoll) {
      minRarityOverride = "legendary";
    } else if (triggerEpicPity && isLastRoll) {
      if (!minRarityOverride || compareRarities("epic", minRarityOverride) > 0) {
        minRarityOverride = "epic";
      }
    }

    // Step 3: Roll Rarity using fixed server weights
    const selectedRarity = rollRarity(
      packConfig.rarityWeights,
      minRarityOverride,
      packConfig.guaranteedRules?.noCommon,
    );

    // Step 4: Roll Candidate Item & Equipment Slot with Anti-Clustering & Targeted Weighting
    let candidatePool = [...SEASON_1_CATALOG];

    // Anti-Clustering Check: If this is the 3rd roll and previous 2 rolls share identical slot, filter it out
    if (i === 2 && rolledSlots.length === 2 && rolledSlots[0] === rolledSlots[1]) {
      const forbiddenSlot = rolledSlots[0];
      const antiClusterPool = candidatePool.filter(
        (item) => normalizeSlot(item.slot) !== forbiddenSlot,
      );
      if (antiClusterPool.length > 0) {
        candidatePool = antiClusterPool;
        slotAntiClusteringApplied = true;
      }
    }

    // Compute weighted item selection
    const itemWeights: number[] = [];
    let totalWeight = 0;

    const allowTargetSet =
      packConfig.targetSetRules?.allowTargetSetSelection && Boolean(targetSetName);

    // Incomplete set slots receive +150% base probability weight, scaling further with Luck stats
    const baseMissingBoost = packConfig.targetSetRules?.missingItemWeightBoost ?? 1.5; // +150%
    const luckScaledBoost = baseMissingBoost * (1 + luckValue / 100);
    const boostMultiplier = 1 + luckScaledBoost;

    candidatePool.forEach((item) => {
      let weight = 1.0;

      if (allowTargetSet && item.set === targetSetName) {
        const isOwned =
          ownedItemTemplateIds.has(item.id) || ownedItemTemplateIds.has(item.templateId || "");
        if (!isOwned) {
          weight *= boostMultiplier; // +150%+ scaled by Luck
          missingItemBoostsAppliedCount++;
        } else {
          weight *= 1.2; // slight base affinity for targeted set
        }
      }

      itemWeights.push(weight);
      totalWeight += weight;
    });

    // Pick item template by weighted random
    let selectedItemTemplate = candidatePool[0];
    const weightRandom = Math.random() * totalWeight;
    let cumulative = 0;

    for (let j = 0; j < candidatePool.length; j++) {
      cumulative += itemWeights[j];
      if (weightRandom <= cumulative) {
        selectedItemTemplate = candidatePool[j];
        break;
      }
    }

    const normSlot = normalizeSlot(selectedItemTemplate.slot);
    rolledSlots.push(normSlot);

    // Step 5: Generate Quality Roll PCT (80% - 100%), adjusted upwards by equipped Luck stats
    const { qualityPct, qualityRollRaw } = rollQualityPct(luckValue);

    const uniqueInstanceId = `s1_${selectedItemTemplate.id}_${Date.now()}_${i}_${Math.floor(
      Math.random() * 10000,
    )}`;

    const rarityData = RARITY_CONFIG[selectedRarity];

    // Compute exact matrix stat values based on quality roll
    const baseStatVal = computeStatValue(selectedRarity, 1, false, qualityPct);

    const instantiatedItem: Item = {
      ...selectedItemTemplate,
      id: uniqueInstanceId,
      templateId: selectedItemTemplate.id,
      itemId: selectedItemTemplate.id,
      rarity: selectedRarity,
      raidPower: Math.round(rarityData.raidPower * (0.8 + 0.2 * qualityPct)),
      bonusXP: Number(baseStatVal.toFixed(2)),
      forgeable: rarityData.forgeable,
      rerollable: rarityData.rerollable,
      dropRate: rarityData.dropRate,
      level: 1,
      maxLevel: 10,
      metadata: {
        ...(selectedItemTemplate.metadata || {}),
        quality_roll_pct: qualityPct,
        reroll_quality_pct: qualityPct,
        quality_roll_pct_display: qualityRollRaw,
        discoveryPath: `Season 1 ${packConfig.name}`,
      },
      stats: {
        ...(selectedItemTemplate.stats || {}),
        qualityRoll: qualityPct,
        qualityRollPct: qualityRollRaw,
        primary_stat: baseStatVal,
      },
    };

    rolledItems.push(instantiatedItem);

    // Reset pity counters if high rarity item is obtained
    if (selectedRarity === "epic") {
      packPity.epicPityCounter = 0;
      currentPityState.epicPityCounter = 0;
      triggerEpicPity = false;
    } else if (selectedRarity === "legendary" || selectedRarity === "mythic") {
      packPity.epicPityCounter = 0;
      packPity.legendaryPityCounter = 0;
      currentPityState.epicPityCounter = 0;
      currentPityState.legendaryPityCounter = 0;
      triggerEpicPity = false;
      triggerLegendaryPity = false;
    }
  }

  // Commit updated pity state for this pack type
  currentPityState.packs[packId] = packPity;

  return {
    items: rolledItems,
    updatedPityState: currentPityState,
    slotAntiClusteringApplied,
    missingItemBoostsAppliedCount,
    packId,
    epicPityTriggered: triggerEpicPity,
    legendaryPityTriggered: triggerLegendaryPity,
    luckAppliedPct: luckValue,
  };
}
