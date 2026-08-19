import type { Item, Player, Rarity } from "@/types/game";
import {
  FORGE_UPGRADE_RULES,
  FORGE_DISMANTLE_RATES,
  FORGE_REROLL_RULES,
  MAX_ITEM_LEVEL,
  getLevelUpCostXP,
  canForgeItem,
  getForgeRequirement,
  getDismantleRefundXP,
  getPlayerForgeModifiers,
  calculateForgeDiscount,
  calculateLuckRerollFloor,
} from "@/config/forgeConfig";
import { SEASON_1_CATALOG, RARITY_CONFIG } from "@/config/masterCatalog";
import { getPlayerProfile, setMockPlayer } from "@/services/player";
import { getInventory, setMockInventory } from "@/services/inventory";
import { updateActiveProfileState } from "@/services/profiles";
import { trackMissionEvent } from "@/services/missions";
import { recordCustomXPTransaction } from "@/services/xpEngine";
import { useGameStore } from "@/store/gameStore";
import { getDetailedItemStats, getItem6Stats } from "@/utils/itemStats";
import {
  BASE_84_ITEMS,
  type BibleSlot,
  type BibleStatKey,
  STAT_RANGE_MATRIX,
  computeStatValue,
} from "@/services/economyEngineBible";

export interface ForgeUpgradeResult {
  success: boolean;
  item: Item;
  newLevel: number;
  costXP: number;
  baseCostXP?: number;
  discountXP?: number;
  efficiencyDiscountPct?: number;
  updatedPlayer?: Player;
  updatedInventory?: Item[];
  error?: string;
}

export interface ForgeFusionResult {
  success: boolean;
  newItem?: Item;
  consumedItemIds?: string[];
  costXP?: number;
  baseCostXP?: number;
  discountXP?: number;
  efficiencyDiscountPct?: number;
  updatedPlayer?: Player;
  updatedInventory?: Item[];
  error?: string;
}

export interface ForgeDismantleResult {
  success: boolean;
  refundXP: number;
  dismantledItemId?: string;
  updatedPlayer?: Player;
  updatedInventory?: Item[];
  error?: string;
}

export interface ForgeRerollResult {
  success: boolean;
  item?: Item;
  costXP?: number;
  qualityRoll?: number;
  luckFloor?: number;
  luckBonusPct?: number;
  updatedPlayer?: Player;
  updatedInventory?: Item[];
  error?: string;
}

export interface ForgeIdentitySwapResult {
  success: boolean;
  oldItemName?: string;
  newItem?: Item;
  costXP?: number;
  updatedPlayer?: Player;
  updatedInventory?: Item[];
  error?: string;
}

export interface StandardizedForgeStateItem {
  item_id: string;
  base_name: string;
  slot: string;
  set_id: string;
  rarity: string;
  level: number;
  max_level: number;
  quality_roll_pct: number;
  can_fuse: boolean;
  can_level_up: boolean;
  next_level_cost: number;
  stats: Array<{
    key: string;
    label: string;
    icon: string;
    type: "PRIMARY" | "SECONDARY";
    value_pct: number;
    formatted: string;
  }>;
}

export interface StandardizedForgeStateResponse {
  forge_state: {
    user_sp_xp_balance: number;
    active_item: StandardizedForgeStateItem | null;
  };
}

/**
 * Service Abstraction for Eligible Fusion Candidates
 * Returns unequipped items matching the exact template, slot, and rarity.
 */
export async function getFusionCandidates(baseItemId: string, baseItem: Item): Promise<Item[]> {
  const inventory = await getInventory();

  if (!baseItem) {
    return [];
  }

  // Cannot forge Mythic items
  if (!canForgeItem(baseItem.rarity)) {
    return [];
  }

  return inventory.filter((item) => {
    // Cannot consume the base item itself
    if (item.id === baseItemId) return false;

    // Equipped items CANNOT be consumed in fusion
    if (item.equipped) return false;

    // Must match slot and rarity
    if (item.slot !== baseItem.slot || item.rarity !== baseItem.rarity) return false;

    // Must match template ID or item name
    const isSameTemplate = item.templateId
      ? item.templateId === (baseItem.templateId || baseItem.id)
      : item.name === baseItem.name;

    return isSameTemplate;
  });
}

/**
 * Service Abstraction for Item Fusion / Rarity Upgrade
 * Consumes required duplicate copies + Spendable XP to produce a higher rarity item.
 * Preserves current Item Level and recalculates stats with newly unlocked secondary slots.
 */
export async function fuseItems(
  baseItemId: string,
  sacrificeItemIds: string[],
  options?: ExecuteForgeActionOptions,
): Promise<ForgeFusionResult> {
  await new Promise((res) => setTimeout(res, 400));

  const [player, inventory] = await Promise.all([getPlayerProfile(), getInventory()]);
  const baseItem = inventory.find((i) => i.id === baseItemId);

  if (!baseItem) {
    return { success: false, error: "Base item not found in inventory." };
  }

  const req = getForgeRequirement(baseItem.rarity);
  if (!req.allowForge || !req.targetRarity) {
    return { success: false, error: "Mythic and Legendary items cannot be forged further." };
  }

  const isTutorial = useGameStore.getState().isTutorialMode;
  const isDev = (options?.isDevMode ?? false) || isTutorial;

  // Check sacrifice count if not in dev mode
  if (!isDev && sacrificeItemIds.length < req.neededDuplicates) {
    return {
      success: false,
      error: `Requires ${req.neededDuplicates} duplicate copies (total ${req.requiredDuplicates} identical items). Selected ${sacrificeItemIds.length}.`,
    };
  }

  // Check spendable XP balance if not in dev mode (applying player's active Forge Efficiency discount)
  const currentXP = player.spendableXP ?? player.xp;
  const modifiers = getPlayerForgeModifiers(player, inventory);
  const discountResult = calculateForgeDiscount(req.costXP, modifiers.forgeEfficiencyPct);
  const costXP = isDev
    ? 0
    : options?.costXP !== undefined
      ? options.costXP
      : discountResult.discountedCost;

  if (!isDev && currentXP < costXP) {
    return {
      success: false,
      error: `Insufficient Spendable XP. Requires ${costXP.toLocaleString()} XP${modifiers.forgeEfficiencyPct > 0 ? ` (${req.costXP.toLocaleString()} XP base with -${modifiers.forgeEfficiencyPct}% Forge Efficiency)` : ""}.`,
    };
  }

  // Validate all sacrifice items exist, are not equipped, and match template/rarity/slot
  const consumedSet = new Set(sacrificeItemIds);
  if (!isDev && sacrificeItemIds.length > 0) {
    const validSacrifices = inventory.filter((item) => {
      if (!consumedSet.has(item.id)) return false;
      if (item.equipped) return false;
      if (item.slot !== baseItem.slot || item.rarity !== baseItem.rarity) return false;
      return true;
    });

    if (validSacrifices.length < req.neededDuplicates) {
      return { success: false, error: "Selected duplicate items are invalid or equipped." };
    }
  }

  const newSpendableXP = Math.max(0, currentXP - costXP);
  const targetR = req.targetRarity || "uncommon";
  const preservedLevel = baseItem.level ?? 1;
  const rawMeta = baseItem.metadata as Record<string, unknown> | undefined;
  const qualityRoll =
    (typeof rawMeta?.quality_roll_pct === "number" && rawMeta.quality_roll_pct) ||
    (typeof rawMeta?.reroll_quality_pct === "number" && rawMeta.reroll_quality_pct) ||
    0.95;

  const intermediateItem: Item = {
    ...baseItem,
    rarity: targetR,
    level: preservedLevel,
    maxLevel: MAX_ITEM_LEVEL,
    isTutorialAsset: baseItem.isTutorialAsset || isTutorial,
    raidPower: Math.max(req.targetPower, (baseItem.raidPower || 10) + 15),
    bonusXP: RARITY_CONFIG[targetR]?.bonusXP ?? baseItem.bonusXP + 5,
    forgeable: RARITY_CONFIG[targetR]?.forgeable ?? true,
    rerollable: RARITY_CONFIG[targetR]?.rerollable ?? true,
    metadata: {
      ...(baseItem.metadata || {}),
      quality_roll_pct: qualityRoll,
    },
  };

  const detailed = getDetailedItemStats(intermediateItem);
  const stats6 = getItem6Stats(intermediateItem);

  const newItem: Item = {
    ...intermediateItem,
    stats: {
      generalXP: stats6.generalXP,
      raidXP: stats6.raidXP,
      ctoXP: stats6.ctoXP,
      missionsXP: stats6.missionsXP,
      graphicXP: stats6.graphicXP,
      luck: stats6.luck,
    },
  };

  // Preserve base item ID, remove consumed duplicate sacrifice items
  const updatedInventory = [
    newItem,
    ...inventory.filter((i) => i.id !== baseItemId && !consumedSet.has(i.id)),
  ];

  const updatedPlayer: Player = {
    ...player,
    spendableXP: newSpendableXP,
    xp: newSpendableXP,
    equipped: baseItem.equipped
      ? { ...player.equipped, [baseItem.slot]: newItem.id }
      : player.equipped,
  };

  setMockInventory(updatedInventory);
  setMockPlayer(updatedPlayer);
  updateActiveProfileState(updatedPlayer, updatedInventory);

  useGameStore.setState({
    player: updatedPlayer,
    inventory: updatedInventory,
  });

  recordCustomXPTransaction({
    activityName: `Forge Fusion (${newItem.rarity.toUpperCase()})`,
    netXPAwarded: -costXP,
    spXpBefore: currentXP,
    spXpAfter: newSpendableXP,
    ltXpBefore: player.lifetimeXP ?? player.xp ?? 0,
    ltXpAfter: player.lifetimeXP ?? player.xp ?? 0,
    note: `Fused ${sacrificeItemIds.length + 1} items into ${newItem.name} (${targetR.toUpperCase()}) for ${costXP.toLocaleString()} XP${modifiers.forgeEfficiencyPct > 0 ? ` (-${modifiers.forgeEfficiencyPct}% Forge Efficiency discount from base ${req.costXP.toLocaleString()} XP)` : ""}`,
  });

  trackMissionEvent("forge_upgrade", 1);

  return {
    success: true,
    newItem,
    consumedItemIds: sacrificeItemIds,
    costXP,
    baseCostXP: req.costXP,
    discountXP: discountResult.discountAmount,
    efficiencyDiscountPct: modifiers.forgeEfficiencyPct,
    updatedPlayer,
    updatedInventory,
  };
}

/**
 * Service Abstraction for Item Level Upgrade (Levels 1 -> 10)
 * Uses official Economy Design Bible v3.1 XP cost curve with player active Forge Efficiency discounts.
 */
export async function upgradeItem(
  itemId: string,
  targetLevel?: number,
  costXPOverride?: number,
  options?: ExecuteForgeActionOptions,
): Promise<ForgeUpgradeResult> {
  await new Promise((res) => setTimeout(res, 400));
  const [player, inventory] = await Promise.all([getPlayerProfile(), getInventory()]);
  const existing = inventory.find((i) => i.id === itemId);

  if (!existing) {
    return { success: false, item: {} as Item, newLevel: 1, costXP: 0, error: "Item not found" };
  }

  const currentLevel = Math.max(1, Math.min(MAX_ITEM_LEVEL, existing.level ?? 1));
  if (currentLevel >= MAX_ITEM_LEVEL) {
    return {
      success: false,
      item: existing,
      newLevel: currentLevel,
      costXP: 0,
      error: `Item is already at Maximum Level ${MAX_ITEM_LEVEL}.`,
    };
  }

  const nextLvl = targetLevel
    ? Math.min(MAX_ITEM_LEVEL, Math.max(currentLevel + 1, targetLevel))
    : currentLevel + 1;
  const standardCost = getLevelUpCostXP(currentLevel);

  // Apply player active Forge Efficiency discount
  const modifiers = getPlayerForgeModifiers(player, inventory);
  const discountResult = calculateForgeDiscount(standardCost, modifiers.forgeEfficiencyPct);
  const effectiveCost =
    costXPOverride !== undefined ? costXPOverride : discountResult.discountedCost;

  const isTutorial = useGameStore.getState().isTutorialMode;
  const isDev = (options?.isDevMode ?? false) || isTutorial;
  const actualCostXP = isDev ? 0 : effectiveCost;

  const currentXP = player.spendableXP ?? player.xp;
  if (!isDev && currentXP < actualCostXP) {
    return {
      success: false,
      item: existing,
      newLevel: currentLevel,
      costXP: actualCostXP,
      error: `Insufficient Spendable XP. Requires ${actualCostXP.toLocaleString()} XP${modifiers.forgeEfficiencyPct > 0 ? ` (${standardCost.toLocaleString()} XP base with -${modifiers.forgeEfficiencyPct}% Forge Efficiency)` : ""}.`,
    };
  }

  const intermediateItem: Item = {
    ...existing,
    level: nextLvl,
    maxLevel: MAX_ITEM_LEVEL,
    isTutorialAsset: existing.isTutorialAsset || isTutorial,
  };

  const stats6 = getItem6Stats(intermediateItem);
  const updatedItem: Item = {
    ...intermediateItem,
    stats: {
      generalXP: stats6.generalXP,
      raidXP: stats6.raidXP,
      ctoXP: stats6.ctoXP,
      missionsXP: stats6.missionsXP,
      graphicXP: stats6.graphicXP,
      luck: stats6.luck,
    },
  };

  const updatedInventory = inventory.map((i) => (i.id === itemId ? updatedItem : i));
  const newSpendableXP = Math.max(0, currentXP - actualCostXP);

  const updatedPlayer: Player = {
    ...player,
    spendableXP: newSpendableXP,
    xp: newSpendableXP,
    equipped: existing.equipped
      ? { ...player.equipped, [existing.slot]: updatedItem.id }
      : player.equipped,
  };

  setMockInventory(updatedInventory);
  setMockPlayer(updatedPlayer);
  updateActiveProfileState(updatedPlayer, updatedInventory);

  useGameStore.setState({
    player: updatedPlayer,
    inventory: updatedInventory,
  });

  recordCustomXPTransaction({
    activityName: "Forge Level Upgrade",
    netXPAwarded: -actualCostXP,
    spXpBefore: currentXP,
    spXpAfter: newSpendableXP,
    ltXpBefore: player.lifetimeXP ?? player.xp ?? 0,
    ltXpAfter: player.lifetimeXP ?? player.xp ?? 0,
    note: `Upgraded ${existing.name} to Level ${nextLvl} for ${actualCostXP.toLocaleString()} XP${modifiers.forgeEfficiencyPct > 0 ? ` (-${modifiers.forgeEfficiencyPct}% Forge Efficiency discount from base ${standardCost.toLocaleString()} XP)` : ""}`,
  });

  trackMissionEvent("forge_upgrade", 1);

  return {
    success: true,
    item: updatedItem,
    newLevel: nextLvl,
    costXP: actualCostXP,
    baseCostXP: standardCost,
    discountXP: discountResult.discountAmount,
    efficiencyDiscountPct: modifiers.forgeEfficiencyPct,
    updatedPlayer,
    updatedInventory,
  };
}

/**
 * Service Abstraction for Stat Value Reroll
 * Requires Rare or higher gear. Costs 5,000 SP-XP.
 * Baseline range 80% to 100% Quality, with minimum guaranteed floor boosted by player's active equipped Luck.
 */
export async function rerollItemStatValues(
  itemId: string,
  options?: ExecuteForgeActionOptions,
): Promise<ForgeRerollResult> {
  await new Promise((res) => setTimeout(res, 400));
  const [player, inventory] = await Promise.all([getPlayerProfile(), getInventory()]);
  const existing = inventory.find((i) => i.id === itemId);

  if (!existing) {
    return { success: false, error: "Item not found in inventory." };
  }

  const isTutorial = useGameStore.getState().isTutorialMode;
  const isDev = (options?.isDevMode ?? false) || isTutorial;
  const rule = FORGE_REROLL_RULES.statReroll;

  const currentXP = player.spendableXP ?? player.xp;
  const costXP = isDev ? 0 : rule.costXP;
  if (!isDev && currentXP < costXP) {
    return {
      success: false,
      error: `Insufficient Spendable XP. Requires ${rule.costXP.toLocaleString()} XP.`,
    };
  }

  // Fetch active player Luck and calculate minimum guaranteed floor
  const modifiers = getPlayerForgeModifiers(player, inventory);
  const minFloor = modifiers.rerollQualityFloor; // e.g. 0.84 with +4% Luck Floor (baseline 0.80)

  // Skew reroll quality roll between minFloor and 1.00 (100% max cap)
  const qualityRoll = Number((minFloor + Math.random() * (1.0 - minFloor)).toFixed(4));

  const intermediateItem: Item = {
    ...existing,
    statRerollVersion: (existing.statRerollVersion ?? 0) + 1,
    metadata: {
      ...(existing.metadata || {}),
      quality_roll_pct: qualityRoll,
      reroll_quality_pct: qualityRoll,
    },
  };

  const stats6 = getItem6Stats(intermediateItem);
  const updatedItem: Item = {
    ...intermediateItem,
    stats: {
      generalXP: stats6.generalXP,
      raidXP: stats6.raidXP,
      ctoXP: stats6.ctoXP,
      missionsXP: stats6.missionsXP,
      graphicXP: stats6.graphicXP,
      luck: stats6.luck,
    },
  };

  const newSpendableXP = Math.max(0, currentXP - costXP);
  const updatedInventory = inventory.map((i) => (i.id === itemId ? updatedItem : i));
  const updatedPlayer: Player = {
    ...player,
    spendableXP: newSpendableXP,
    xp: newSpendableXP,
    equipped: existing.equipped
      ? { ...player.equipped, [existing.slot]: updatedItem.id }
      : player.equipped,
  };

  setMockInventory(updatedInventory);
  setMockPlayer(updatedPlayer);
  updateActiveProfileState(updatedPlayer, updatedInventory);

  useGameStore.setState({
    player: updatedPlayer,
    inventory: updatedInventory,
  });

  recordCustomXPTransaction({
    activityName: "Forge Stat Reroll",
    netXPAwarded: -costXP,
    spXpBefore: currentXP,
    spXpAfter: newSpendableXP,
    ltXpBefore: player.lifetimeXP ?? player.xp ?? 0,
    ltXpAfter: player.lifetimeXP ?? player.xp ?? 0,
    note: `Rerolled stat quality for ${existing.name} (${Math.round(qualityRoll * 100)}% roll, min ${Math.round(minFloor * 100)}% from +${modifiers.luckPct}% Luck floor)`,
  });

  return {
    success: true,
    item: updatedItem,
    costXP,
    qualityRoll,
    luckFloor: minFloor,
    luckBonusPct: modifiers.luckPct,
    updatedPlayer,
    updatedInventory,
  };
}

/**
 * Service Abstraction for Identity Swap Reroll
 * Requires Rare or higher gear (Mythic disallowed). Costs 15,000 SP-XP.
 * Swaps base item identity to a different item within SAME slot and SAME set/rarity class,
 * maintaining current Level and Quality Roll % while converting stats to target item's primary domain.
 */
export async function swapItemIdentity(
  itemId: string,
  options?: ExecuteForgeActionOptions,
): Promise<ForgeIdentitySwapResult> {
  await new Promise((res) => setTimeout(res, 400));
  const [player, inventory] = await Promise.all([getPlayerProfile(), getInventory()]);
  const existing = inventory.find((i) => i.id === itemId);

  if (!existing) {
    return { success: false, error: "Item not found in inventory." };
  }

  const isTutorial = useGameStore.getState().isTutorialMode;
  const isDev = (options?.isDevMode ?? false) || isTutorial;
  const rule = FORGE_REROLL_RULES.identityReroll;

  const currentXP = player.spendableXP ?? player.xp;
  const costXP = isDev ? 0 : rule.costXP;

  if (!isDev && currentXP < costXP) {
    return {
      success: false,
      error: `Insufficient Spendable XP. Requires ${rule.costXP.toLocaleString()} XP.`,
    };
  }

  // Find candidate templates from Master Catalog or Base 84 items
  let candidates = SEASON_1_CATALOG.filter((cat) => {
    if (cat.slot !== existing.slot) return false;
    if (rule.disallowedSetPrefixes.some((prefix) => cat.set?.startsWith(prefix))) return false;
    if (cat.id === existing.templateId || cat.name === existing.name) return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = SEASON_1_CATALOG.filter((cat) => cat.slot === existing.slot);
  }

  if (candidates.length === 0) {
    return {
      success: false,
      error: "No alternative item identities available for this slot.",
    };
  }

  const chosenTemplate = candidates[Math.floor(Math.random() * candidates.length)];
  const rawMeta = existing.metadata as Record<string, unknown> | undefined;
  const qualityRoll =
    (typeof rawMeta?.quality_roll_pct === "number" && rawMeta.quality_roll_pct) ||
    (typeof rawMeta?.reroll_quality_pct === "number" && rawMeta.reroll_quality_pct) ||
    0.95;

  // Determine target item's set domain and force-update primary/secondary stat mappings
  const targetSetId = (chosenTemplate.set || "set_season").toLowerCase();
  const targetName = (chosenTemplate.name || "").toLowerCase();

  let targetPrimaryStat: BibleStatKey = "general_xp";
  let targetSecondaryPool: BibleStatKey[] = ["mission_xp", "luck", "meme_xp"];

  if (
    targetSetId.includes("raid") ||
    targetName.includes("raid") ||
    targetName.includes("visor") ||
    targetName.includes("blade")
  ) {
    targetPrimaryStat = "raid_xp";
    targetSecondaryPool = ["general_xp", "luck", "cto_xp"];
  } else if (
    targetSetId.includes("cto") ||
    targetSetId.includes("dev") ||
    targetName.includes("cto") ||
    targetName.includes("terminal") ||
    targetName.includes("hoodie")
  ) {
    targetPrimaryStat = "cto_xp";
    targetSecondaryPool = ["general_xp", "luck", "mission_xp"];
  } else if (
    targetSetId.includes("meme") ||
    targetSetId.includes("jester") ||
    targetName.includes("meme") ||
    targetName.includes("pepe") ||
    targetName.includes("clown")
  ) {
    targetPrimaryStat = "meme_xp";
    targetSecondaryPool = ["general_xp", "luck", "raid_xp"];
  } else if (
    targetSetId.includes("video") ||
    targetSetId.includes("stream") ||
    targetName.includes("video") ||
    targetName.includes("camera") ||
    targetName.includes("mic")
  ) {
    targetPrimaryStat = "meme_xp";
    targetSecondaryPool = ["general_xp", "luck", "mission_xp"];
  } else if (
    targetSetId.includes("mission") ||
    targetSetId.includes("quest") ||
    targetName.includes("mission") ||
    targetName.includes("tactical")
  ) {
    targetPrimaryStat = "mission_xp";
    targetSecondaryPool = ["general_xp", "luck", "raid_xp"];
  } else {
    targetPrimaryStat = "general_xp";
    targetSecondaryPool = ["mission_xp", "luck", "meme_xp"];
  }

  const intermediateItem: Item = {
    ...chosenTemplate,
    id: existing.id, // Preserve item instance ID
    templateId: chosenTemplate.id,
    name: chosenTemplate.name,
    set: chosenTemplate.set || "set_season",
    equipped: existing.equipped ?? false,
    level: existing.level ?? 1,
    maxLevel: MAX_ITEM_LEVEL,
    rarity: existing.rarity, // Preserve current rarity
    metadata: {
      ...(existing.metadata || {}),
      base_name: chosenTemplate.name,
      set_id: chosenTemplate.set || "set_season",
      primary_stat: targetPrimaryStat,
      secondary_stats_pool: targetSecondaryPool,
      quality_roll_pct: qualityRoll,
      reroll_quality_pct: qualityRoll,
    },
  };

  const stats6 = getItem6Stats(intermediateItem);
  const newItem: Item = {
    ...intermediateItem,
    stats: {
      generalXP: stats6.generalXP,
      raidXP: stats6.raidXP,
      ctoXP: stats6.ctoXP,
      missionsXP: stats6.missionsXP,
      graphicXP: stats6.graphicXP,
      luck: stats6.luck,
    },
  };

  const newSpendableXP = Math.max(0, currentXP - costXP);
  const updatedInventory = inventory.map((i) => (i.id === itemId ? newItem : i));
  const updatedPlayer: Player = {
    ...player,
    spendableXP: newSpendableXP,
    xp: newSpendableXP,
    equipped: existing.equipped
      ? { ...player.equipped, [existing.slot]: newItem.id }
      : player.equipped,
  };

  setMockInventory(updatedInventory);
  setMockPlayer(updatedPlayer);
  updateActiveProfileState(updatedPlayer, updatedInventory);

  useGameStore.setState({
    player: updatedPlayer,
    inventory: updatedInventory,
  });

  recordCustomXPTransaction({
    activityName: "Forge Identity Swap",
    netXPAwarded: -costXP,
    spXpBefore: currentXP,
    spXpAfter: newSpendableXP,
    ltXpBefore: player.lifetimeXP ?? player.xp ?? 0,
    ltXpAfter: player.lifetimeXP ?? player.xp ?? 0,
    note: `Swapped identity of ${existing.name} to ${newItem.name}`,
  });

  return {
    success: true,
    oldItemName: existing.name,
    newItem,
    costXP,
    updatedPlayer,
    updatedInventory,
  };
}

/**
 * Service Abstraction for Item Dismantling / Scrap
 * Recovers Spendable XP from duplicate items. Equipped items cannot be dismantled.
 */
export async function dismantleDuplicateItem(itemId: string): Promise<ForgeDismantleResult> {
  await new Promise((res) => setTimeout(res, 400));
  const [player, inventory] = await Promise.all([getPlayerProfile(), getInventory()]);
  const itemToDismantle = inventory.find((i) => i.id === itemId);

  if (!itemToDismantle) {
    return { success: false, refundXP: 0, error: "Item not found in inventory." };
  }

  if (itemToDismantle.equipped) {
    return { success: false, refundXP: 0, error: "Equipped items cannot be dismantled." };
  }

  const refundXP = getDismantleRefundXP(itemToDismantle.rarity);
  const updatedInventory = inventory.filter((i) => i.id !== itemId);

  const currentXP = player.spendableXP ?? player.xp;
  const newSpendableXP = currentXP + refundXP;

  const updatedPlayer: Player = {
    ...player,
    spendableXP: newSpendableXP,
    xp: newSpendableXP,
  };

  setMockInventory(updatedInventory);
  setMockPlayer(updatedPlayer);
  updateActiveProfileState(updatedPlayer, updatedInventory);

  useGameStore.setState({
    player: updatedPlayer,
    inventory: updatedInventory,
  });

  recordCustomXPTransaction({
    activityName: `Forge Dismantle Scrap (${itemToDismantle.rarity.toUpperCase()})`,
    netXPAwarded: refundXP,
    spXpBefore: currentXP,
    spXpAfter: newSpendableXP,
    ltXpBefore: player.lifetimeXP ?? player.xp ?? 0,
    ltXpAfter: player.lifetimeXP ?? player.xp ?? 0,
    note: `Scrapped ${itemToDismantle.name} for +${refundXP.toLocaleString()} XP`,
  });

  trackMissionEvent("item_dismantled", 1);

  return {
    success: true,
    refundXP,
    dismantledItemId: itemId,
    updatedPlayer,
    updatedInventory,
  };
}

export type ForgeActionType = "fusion" | "levelup" | "reroll" | "identity_swap" | "dismantle";

export interface ExecuteForgeActionOptions {
  sacrificeItemIds?: string[];
  targetLevel?: number;
  costXP?: number;
  isDevMode?: boolean;
}

/**
 * Unified Async Forge Action Execution Hook
 */
export async function executeForgeActionPayload(
  actionType: ForgeActionType,
  itemId: string,
  options?: ExecuteForgeActionOptions,
) {
  switch (actionType) {
    case "fusion": {
      return fuseItems(itemId, options?.sacrificeItemIds || [], options);
    }
    case "levelup": {
      return upgradeItem(itemId, options?.targetLevel, options?.costXP, options);
    }
    case "reroll": {
      return rerollItemStatValues(itemId, options);
    }
    case "identity_swap": {
      return swapItemIdentity(itemId, options);
    }
    case "dismantle": {
      return dismantleDuplicateItem(itemId);
    }
    default:
      return { success: false, error: `Unknown forge action type: ${actionType}` };
  }
}

/**
 * Generates the standardized Forge State JSON payload for developer mock testing
 */
export function getStandardizedForgeState(
  activeItem: Item | null,
  userSpendableXP: number,
): StandardizedForgeStateResponse {
  if (!activeItem) {
    return {
      forge_state: {
        user_sp_xp_balance: userSpendableXP,
        active_item: null,
      },
    };
  }

  const detailed = getDetailedItemStats(activeItem);
  const currentLvl = activeItem.level ?? 1;
  const canLevelUp = currentLvl < MAX_ITEM_LEVEL;
  const nextCost = canLevelUp ? getLevelUpCostXP(currentLvl) : 0;
  const req = getForgeRequirement(activeItem.rarity);

  return {
    forge_state: {
      user_sp_xp_balance: userSpendableXP,
      active_item: {
        item_id: activeItem.id,
        base_name: activeItem.name,
        slot: activeItem.slot.toUpperCase(),
        set_id: activeItem.set || "set_season",
        rarity: activeItem.rarity.charAt(0).toUpperCase() + activeItem.rarity.slice(1),
        level: currentLvl,
        max_level: MAX_ITEM_LEVEL,
        quality_roll_pct: detailed.qualityPct,
        can_fuse: req.allowForge,
        can_level_up: canLevelUp,
        next_level_cost: nextCost,
        stats: detailed.all.map((s) => ({
          key: s.key,
          label: s.label,
          icon: s.icon,
          type: s.type,
          value_pct: s.value_pct,
          formatted: s.formatted,
        })),
      },
    },
  };
}

/**
 * Backward compatibility alias functions for legacy store calls
 */
export const rerollCapeStats = (itemId: string, costXP?: number) =>
  rerollItemStatValues(itemId, costXP !== undefined ? { isDevMode: costXP === 0 } : undefined);
