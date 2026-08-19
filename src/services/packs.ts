import { SEASON_1_PACKS, SEASON_1_PACKS_MAP, type PackConfig } from "@/config/packs";
import { generatePackLoot, type PityState } from "@/services/packEngine";
import { getCurrentPlayer } from "@/services/player";
import { getInventory, setMockInventory } from "@/services/inventory";
import { getCollectionProgress } from "@/services/collection";
import { getActiveProfileData, subscribeToProfileChanges } from "@/services/profiles";
import { trackMissionEvent } from "@/services/missions";
import { broadcastRareDrop } from "@/services/discordWebhook";
import type { Item, ItemSet, Pack, Player } from "@/types/game";
export { confirmPackPurchasePayload, type ConfirmPackPurchaseResult } from "@/services/shop";

export interface OpenPackRequest {
  packInstanceId: string;
  targetSetName?: string;
}

export interface OpenPackResponse {
  success: boolean;
  error?: string;
  openedPack?: Pack;
  packConfig?: PackConfig;
  rewards: Item[];
  updatedInventory: Item[];
  updatedCollection: ItemSet[];
  updatedPlayer: Player;
  unopenedPacks: Pack[];
  slotAntiClusteringApplied?: boolean;
  missingItemBoostsAppliedCount?: number;
  epicPityTriggered?: boolean;
  legendaryPityTriggered?: boolean;
  luckAppliedPct?: number;
}

// Convert PackConfig to standard Pack model
export const season1CatalogPacks: Pack[] = SEASON_1_PACKS.map((p) => ({
  id: p.id,
  configId: p.id,
  name: p.name,
  rarity: p.color === "amber" ? "legendary" : p.color === "purple" ? "epic" : "common",
  description: p.description,
  image: p.image,
  contents: [],
  probabilities: p.rarityWeights,
  cost: p.cost,
  badge: p.badge,
}));

let currentPacksCache: Pack[] | null = null;

subscribeToProfileChanges(() => {
  currentPacksCache = null;
});

export async function getAllPacks(): Promise<Pack[]> {
  return season1CatalogPacks;
}

export async function getOwnedPacks(): Promise<Pack[]> {
  if (!currentPacksCache) {
    const profile = getActiveProfileData();
    currentPacksCache = [...profile.packs];
  }
  return [...currentPacksCache];
}

export function setOwnedPacks(packs: Pack[]): void {
  currentPacksCache = [...packs];
  const profile = getActiveProfileData();
  profile.packs = [...packs];
}

/**
 * Service Abstraction for Season 1 Pack Opening Flow
 * Handles pack purchase using Spendable XP, deterministic weighted loot rolls,
 * target set missing-item weighting (+150%), slot anti-clustering, and pity protection.
 */
export async function openPack(
  packInstanceIdOrConfigId: string,
  targetSetName?: string,
): Promise<OpenPackResponse> {
  const { useGameStore } = await import("@/store/gameStore");
  const isTutorialMode =
    useGameStore.getState().isTutorialMode || packInstanceIdOrConfigId === "pack_raider";

  const owned = await getOwnedPacks();
  const packIndex = owned.findIndex((p) => p.id === packInstanceIdOrConfigId);

  // Determine if opening an owned pack or purchasing a catalog pack directly
  let packConfig: PackConfig | undefined;
  let packToOpen: Pack | undefined;

  if (packIndex !== -1) {
    packToOpen = owned[packIndex];
    const configId = packToOpen.configId || packToOpen.id;
    packConfig = SEASON_1_PACKS_MAP[configId] || SEASON_1_PACKS[0];
  } else {
    packConfig = SEASON_1_PACKS_MAP[packInstanceIdOrConfigId] || SEASON_1_PACKS[0];
    packToOpen = season1CatalogPacks.find((p) => p.id === packConfig?.id) || season1CatalogPacks[0];
  }

  const [currentPlayer, currentInventory] = await Promise.all([getCurrentPlayer(), getInventory()]);

  // If opening directly via XP purchase, validate Spendable XP
  let spendableXP = currentPlayer.spendableXP ?? currentPlayer.xp;
  const isDirectPurchase = packIndex === -1;

  if (isDirectPurchase && !isTutorialMode) {
    const cost = packConfig.cost || 5000;
    if (spendableXP < cost) {
      return {
        success: false,
        error: `Insufficient Spendable XP. Need ${cost.toLocaleString()} XP, but you have ${spendableXP.toLocaleString()} XP.`,
        rewards: [],
        updatedInventory: currentInventory,
        updatedCollection: await getCollectionProgress(),
        updatedPlayer: currentPlayer,
        unopenedPacks: owned,
      };
    }
    spendableXP -= cost;
  }

  // Retrieve equipped items to calculate player luck stats at time of purchase
  const equippedItemIds = Object.values(currentPlayer.equipped || {}).filter(Boolean);
  const equippedItems = currentInventory.filter(
    (item) =>
      equippedItemIds.includes(item.id) ||
      (item.templateId && equippedItemIds.includes(item.templateId)),
  );

  // Retrieve or initialize player pity state
  const playerPityState: PityState = currentPlayer.pityState || {
    epicPityCounter: 0,
    legendaryPityCounter: 0,
    totalPacksOpened: currentPlayer.lifetimeStats?.packsOpened || 0,
  };

  // Generate deterministic weighted loot using v3.2 Server Engine
  const lootResult = generatePackLoot({
    packConfig,
    playerInventory: currentInventory,
    equippedItems,
    targetSetName,
    pityState: playerPityState,
  });

  // Tag items as tutorial assets if in tutorial sandbox mode
  const rolledItems = lootResult.items.map((item) => ({
    ...item,
    isTutorialAsset: isTutorialMode ? true : item.isTutorialAsset,
  }));

  // Consume pack if it was owned in inventory and not tutorial
  if (packIndex !== -1 && !isTutorialMode) {
    owned.splice(packIndex, 1);
    setOwnedPacks(owned);
  }

  // Update Inventory
  const updatedInventory = [...rolledItems, ...currentInventory];
  if (!isTutorialMode) {
    setMockInventory(updatedInventory);
  }

  // Calculate high rarity drops
  const legendaryOrMythicCount = rolledItems.filter(
    (i) => i.rarity === "legendary" || i.rarity === "mythic",
  ).length;

  // Update Player Profile & Lifetime Stats (never touch Lifetime XP!)
  const updatedPlayer: Player = isTutorialMode
    ? currentPlayer
    : {
        ...currentPlayer,
        spendableXP: spendableXP,
        xp: spendableXP, // synchronize spendable XP field
        pityState: lootResult.updatedPityState,
        lifetimeStats: {
          ...currentPlayer.lifetimeStats,
          packsOpened: (currentPlayer.lifetimeStats?.packsOpened || 0) + 1,
          itemsCollected: (currentPlayer.lifetimeStats?.itemsCollected || 0) + rolledItems.length,
          legendaryItemsFound:
            (currentPlayer.lifetimeStats?.legendaryItemsFound || 0) + legendaryOrMythicCount,
        },
      };

  // Sync back to active profile data if not tutorial
  if (!isTutorialMode) {
    const activeProfile = getActiveProfileData();
    activeProfile.player = updatedPlayer;
    activeProfile.inventory = updatedInventory;
  }

  const collection = await getCollectionProgress();

  // Track mission events for opening pack and unlocking items
  if (!isTutorialMode) {
    trackMissionEvent("pack_opened", 1);
    if (legendaryOrMythicCount > 0) {
      trackMissionEvent("mythic_item_acquired", legendaryOrMythicCount);
    }
    trackMissionEvent("catalogue_unlocked", 0);

    // Feature 2: Public Rare-Drop Broadcasts — reads the already-resolved rarity
    // result, doesn't recompute anything. Fire-and-forget so a Discord/network hiccup
    // never blocks the pack-opening flow.
    for (const item of rolledItems) {
      broadcastRareDrop(updatedPlayer, item).catch((e) =>
        console.error("[Rare-Drop Broadcast] failed", e),
      );
    }
  }

  return {
    success: true,
    openedPack: packToOpen,
    packConfig,
    rewards: rolledItems,
    updatedInventory,
    updatedCollection: collection,
    updatedPlayer,
    unopenedPacks: owned,
    slotAntiClusteringApplied: lootResult.slotAntiClusteringApplied,
    missingItemBoostsAppliedCount: lootResult.missingItemBoostsAppliedCount,
    epicPityTriggered: lootResult.epicPityTriggered,
    legendaryPityTriggered: lootResult.legendaryPityTriggered,
    luckAppliedPct: lootResult.luckAppliedPct,
  };
}

/**
 * Grants a new unopened pack instance to the player's vault.
 */
export function grantPackToPlayer(packConfigId: string): Pack {
  const config = SEASON_1_PACKS_MAP[packConfigId] || SEASON_1_PACKS[0];
  const newPack: Pack = {
    id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    configId: config.id,
    name: config.name,
    rarity: config.color === "amber" ? "legendary" : config.color === "purple" ? "epic" : "common",
    description: config.description,
    image: config.image,
    contents: [],
    probabilities: config.rarityWeights,
    cost: config.cost,
    badge: config.badge,
  };

  const current = getActiveProfileData().packs || [];
  const updated = [...current, newPack];
  setOwnedPacks(updated);
  return newPack;
}
