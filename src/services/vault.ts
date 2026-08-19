import type { Item, ItemSet, Pack, Player } from "@/types/game";
import { getInventory } from "./inventory";
import { getAllItems } from "./items";
import { getOwnedPacks, openPack, type OpenPackResponse } from "./packs";
import { getCollectionProgress } from "./collection";
import { getActiveProfileData } from "./profiles";
import { confirmPackPurchasePayload, type ConfirmPackPurchaseResult } from "./shop";
import mockInventoryData from "@/data/mockInventoryData.json";
import { useGameStore } from "@/store/gameStore";

export { confirmPackPurchasePayload, type ConfirmPackPurchaseResult };

export interface VaultResponse {
  unopenedPacks: Pack[];
  ownedItems: Item[];
  collectionProgress: ItemSet[];
  activeSets: ItemSet[];
}

export interface VaultCatalogPayload {
  catalogItems: Item[];
  ownedItems: Item[];
  unopenedPacks: Pack[];
  collectionProgress: ItemSet[];
  totalCatalogCount: number;
  discoveredCount: number;
  discoveryPercentage: number;
  spendableXP: number;
  player?: Player;
}

/**
 * Async execution hook: fetchVaultCatalogPayload()
 * Fetches 86-item catalogue, owned items, unopened packs, set progress, and spendable XP.
 * Synchronizes mockInventoryData so pack counts, set progress, and catalog states render accurately.
 */
export async function fetchVaultCatalogPayload(): Promise<VaultCatalogPayload> {
  const [ownedItems, allItems, unopenedPacks, collectionProgress] = await Promise.all([
    getInventory(),
    getAllItems(),
    getOwnedPacks(),
    getCollectionProgress(),
  ]);

  const profile = getActiveProfileData();
  const player = profile.player;
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;

  // Master 86-item catalogue
  const catalogItems = allItems.slice(0, 86);
  const totalCatalogCount = 86;

  // Compute unique owned items
  const ownedItemIdsSet = new Set<string>();
  for (const item of ownedItems) {
    ownedItemIdsSet.add(item.id);
    if (item.templateId) ownedItemIdsSet.add(item.templateId);
  }

  const discoveredCount = catalogItems.filter((i) => ownedItemIdsSet.has(i.id)).length;
  const discoveryPercentage = Math.round((discoveredCount / totalCatalogCount) * 100);

  // Sync mockInventoryData json in-memory object
  (mockInventoryData as unknown as Record<string, unknown>).unopenedPacksCount =
    unopenedPacks.length;
  (mockInventoryData as unknown as Record<string, unknown>).spendableXP = spendableXP;

  return {
    catalogItems,
    ownedItems,
    unopenedPacks,
    collectionProgress,
    totalCatalogCount,
    discoveredCount,
    discoveryPercentage,
    spendableXP,
    player,
  };
}

/**
 * Async execution hook: openVaultPackPayload(packId)
 * Opens a pack, decrements unopened packs count, adds newly revealed items to owned items,
 * updates set completion percentages dynamically, and syncs global Zustand game store.
 */
export async function openVaultPackPayload(packId: string): Promise<OpenPackResponse> {
  const response = await openPack(packId);

  if (response.success) {
    const store = useGameStore.getState();

    // Decrement unopened packs count & update global state
    store.setPacks(response.unopenedPacks);

    // Add newly revealed gear items to owned items
    store.setInventory(response.updatedInventory);

    // Update set completion percentages dynamically
    store.setCollection(response.updatedCollection);

    if (response.updatedPlayer) {
      store.setPlayer(response.updatedPlayer);
    }

    // Sync mockInventoryData
    (mockInventoryData as unknown as Record<string, unknown>).unopenedPacksCount =
      response.unopenedPacks.length;
    (mockInventoryData as unknown as Record<string, unknown>).spendableXP =
      response.updatedPlayer?.spendableXP ?? 0;
  }

  return response;
}

export interface PackUnboxPayloadResult {
  success: boolean;
  rewards: Item[];
  error?: string;
  slotAntiClusteringApplied?: boolean;
  missingItemBoostsAppliedCount?: number;
  epicPityTriggered?: boolean;
  legendaryPityTriggered?: boolean;
  luckAppliedPct?: number;
}

/**
 * Async execution hook: executePackTearAndUnboxPayload(packId, targetSet?)
 * Deducts pack from inventory, processes weighted RNG, and returns 3 pulled gear items.
 */
export async function executePackTearAndUnboxPayload(
  packId: string,
  targetSet?: string,
): Promise<PackUnboxPayloadResult> {
  const response = await openPack(packId, targetSet);
  if (response.success) {
    const store = useGameStore.getState();
    store.setPacks(response.unopenedPacks);
    store.setInventory(response.updatedInventory);
    store.setCollection(response.updatedCollection);
    if (response.updatedPlayer) {
      store.setPlayer(response.updatedPlayer);
    }
    (mockInventoryData as unknown as Record<string, unknown>).unopenedPacksCount =
      response.unopenedPacks.length;
    (mockInventoryData as unknown as Record<string, unknown>).spendableXP =
      response.updatedPlayer?.spendableXP ?? 0;
    return {
      success: true,
      rewards: response.rewards,
      slotAntiClusteringApplied: response.slotAntiClusteringApplied,
      missingItemBoostsAppliedCount: response.missingItemBoostsAppliedCount,
      epicPityTriggered: response.epicPityTriggered,
      legendaryPityTriggered: response.legendaryPityTriggered,
      luckAppliedPct: response.luckAppliedPct,
    };
  }
  return { success: false, rewards: [], error: response.error || "Failed to open pack" };
}

export const VaultService = {
  /**
   * Fetches the entire Vault snapshot from the backend.
   */
  async getVault(): Promise<VaultResponse> {
    const [unopenedPacks, ownedItems, collectionProgress] = await Promise.all([
      getOwnedPacks(),
      getInventory(),
      getCollectionProgress(),
    ]);
    const activeSets = collectionProgress.filter((s) => s.completed);
    return {
      unopenedPacks,
      ownedItems,
      collectionProgress,
      activeSets,
    };
  },

  async getOwnedItems(): Promise<Item[]> {
    return getInventory();
  },

  async getAvailableItems(): Promise<Item[]> {
    const all = await getAllItems();
    return all.slice(0, 86);
  },

  async getOwnedPacks(): Promise<Pack[]> {
    return getOwnedPacks();
  },

  async getCollectionProgress(): Promise<ItemSet[]> {
    return getCollectionProgress();
  },
};
