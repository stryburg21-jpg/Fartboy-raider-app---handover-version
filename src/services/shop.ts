import type { Pack, Player, ShopListing } from "@/types/game";
import { getActiveProfileData } from "@/services/profiles";
import { grantPackToPlayer, getOwnedPacks } from "@/services/packs";
import { useGameStore } from "@/store/gameStore";
import mockInventoryData from "@/data/mockInventoryData.json";

/**
 * Shop Service Layer — Backend API ready.
 *
 * Frontend handles presentation, client state updates, and navigation.
 * All prices, reward probability tables, availability windows, and pack grants
 * will be dynamically fetched from the backend API.
 */

export interface ConfirmPackPurchaseResult {
  success: boolean;
  message: string;
  updatedPlayer?: Player;
  grantedPack?: Pack;
  grantedPacks?: Pack[];
  quantityPurchased?: number;
  remainingBalance?: number;
  unopenedPacksCount?: number;
}

/**
 * Async Purchase & Inventory Hook
 * Validates Spendable XP balance -> Deducts XP -> Adds N Pack(s) to Vault Inventory State
 * Syncs mock data & Zustand store so purchasing updates Spendable XP & Unopened Packs globally.
 */
export async function confirmPackPurchasePayload(
  packId: string,
  priceXP: number,
  quantity: number = 1,
): Promise<ConfirmPackPurchaseResult> {
  const profile = getActiveProfileData();
  const player = profile.player;
  const currentXP = player?.spendableXP ?? player?.xp ?? 0;
  const totalCost = priceXP * quantity;

  if (currentXP < totalCost) {
    return {
      success: false,
      message: `Not enough Spendable XP! You need ${totalCost.toLocaleString()} XP to unlock ${quantity}x pack${quantity > 1 ? "s" : ""}.`,
      remainingBalance: currentXP,
    };
  }

  // Deduct XP
  const newXP = Math.max(0, currentXP - totalCost);
  player.spendableXP = newXP;
  player.xp = newXP;

  // Grant Packs to Vault Inventory State
  const newlyGrantedPacks: Pack[] = [];
  for (let i = 0; i < quantity; i++) {
    const granted = grantPackToPlayer(packId);
    newlyGrantedPacks.push(granted);
  }
  const updatedPacks = await getOwnedPacks();

  // Sync mockInventoryData json in-memory object
  (mockInventoryData as unknown as Record<string, unknown>).spendableXP = newXP;
  (mockInventoryData as unknown as Record<string, unknown>).unopenedPacksCount =
    updatedPacks.length;

  // Sync Zustand Game Store globally
  const store = useGameStore.getState();
  if (store.player) {
    store.setPlayer({
      ...store.player,
      spendableXP: newXP,
      xp: newXP,
    });
    store.setPacks(updatedPacks);
  }

  return {
    success: true,
    message:
      quantity === 1
        ? "Your new pack has been delivered directly to your Pack Vault and is ready to open!"
        : `${quantity}x packs have been delivered directly to your Pack Vault and are ready to open!`,
    updatedPlayer: player,
    grantedPack: newlyGrantedPacks[0],
    grantedPacks: newlyGrantedPacks,
    quantityPurchased: quantity,
    remainingBalance: newXP,
    unopenedPacksCount: updatedPacks.length,
  };
}

// TODO backend: GET /api/shop/listings — fetch dynamic shop listings & reward packs
const mockListings: ShopListing[] = [
  // OFFICIAL SEASON 1 PACKS
  {
    id: "shop_pack_raider",
    kind: "pack",
    refId: "pack_raider",
    name: "Raider Pack",
    image: "📦",
    iconEmoji: "📦",
    priceXP: 5000,
    currencyType: "XP",
    rarity: "common",
    category: "Season 1 Packs",
    categoryGroup: "Season 1 Packs",
    featured: false,
    packGrantId: "pack_raider",
    specialistSet: "Season 1 Catalogue",
    rewardPreview: "3 Items • Full Season 1 Catalogue Pool",
    availability: "Season 1 Core",
    description:
      "Primary item acquisition pack for early-game progression. Contains 3 items from the Season 1 catalogue.",
    probabilities: {
      common: 0.55,
      uncommon: 0.25,
      rare: 0.12,
      epic: 0.06,
      legendary: 0.018,
      mythic: 0.002,
    },
  },
  {
    id: "shop_pack_specialist",
    kind: "pack",
    refId: "pack_specialist",
    name: "Specialist Pack",
    image: "🎯",
    iconEmoji: "🎯",
    priceXP: 15000,
    currencyType: "XP",
    discountBadge: "+150% SET BOOST",
    rarity: "epic",
    category: "Season 1 Packs",
    categoryGroup: "Season 1 Packs",
    featured: false,
    packGrantId: "pack_specialist",
    specialistSet: "Target Specialist Set",
    rewardPreview: "3 Items • Select Target Set (+150% Boost on Unowned)",
    availability: "Season 1 Core",
    description:
      "Targeted gear collection pack. Choose a target set and receive +150% RNG weighting boost on unowned items!",
    probabilities: {
      common: 0.45,
      uncommon: 0.3,
      rare: 0.15,
      epic: 0.075,
      legendary: 0.023,
      mythic: 0.002,
    },
  },
  {
    id: "shop_pack_legendary_raider",
    kind: "pack",
    refId: "pack_legendary_raider",
    name: "Legendary Pack",
    image: "👑",
    iconEmoji: "👑",
    priceXP: 50000,
    currencyType: "XP",
    discountBadge: "NO COMMON DROPS",
    rarity: "legendary",
    category: "Season 1 Packs",
    categoryGroup: "Season 1 Packs",
    featured: false,
    packGrantId: "pack_legendary_raider",
    specialistSet: "High Tier Equipment",
    rewardPreview: "3 High-Tier Items • Guaranteed Rare+ (0% Common)",
    availability: "Season 1 Elite",
    description:
      "End-game pack for serious collectors. Guaranteed Rare or better drops with zero common items.",
    probabilities: {
      common: 0.0,
      uncommon: 0.2,
      rare: 0.5,
      epic: 0.22,
      legendary: 0.075,
      mythic: 0.005,
    },
  },
];

export interface PurchasePackRequest {
  packId: string;
  quantity?: number;
}

export interface PurchasePackResponse {
  updatedPlayer: Player;
  updatedWallet: { spendableXP: number; lifetimeXP: number };
  newlyOwnedPacks: Pack[];
}

export interface PurchaseItemRequest {
  listingId: string;
  playerId: string;
}

export interface PurchaseItemResponse {
  success: boolean;
  message: string;
  updatedPlayer?: Player;
  updatedWallet?: { spendableXP: number; lifetimeXP: number };
  packGrantId?: string;
  itemGrantId?: string;
  newlyOwnedPacks?: Pack[];
}

export async function getShopListings(): Promise<ShopListing[]> {
  // TODO(backend): GET /api/shop/listings — fetch dynamic shop listings & reward packs
  return mockListings;
}

/**
 * Service Abstraction for Shop Purchase Flow
 *
 * Frontend calls this service, then refreshes player data & Vault from backend.
 * Frontend DOES NOT deduct currencies or generate packs itself.
 *
 * API Contract: POST /api/shop/purchase-pack
 */
export async function purchaseShopListing(
  listingId: string,
  playerId: string,
): Promise<PurchaseItemResponse> {
  // TODO(backend): Replace mock transaction with POST /api/shop/purchase-pack or POST /api/shop/purchase
  // Request body: { listingId, playerId }
  // Response body: PurchaseItemResponse { success, message, updatedPlayer, updatedWallet, newlyOwnedPacks, packGrantId, itemGrantId }
  const item = mockListings.find((l) => l.id === listingId);
  if (!item) {
    return { success: false, message: "Shop item not found." };
  }
  return {
    success: true,
    message: `Successfully purchased ${item.name}!`,
    packGrantId: item.packGrantId,
    itemGrantId: item.itemGrantId,
  };
}
