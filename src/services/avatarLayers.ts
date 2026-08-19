import type { EquipmentSlot, Item, Player, Rarity } from "@/types/game";
import { getInventory } from "./inventory";
import { getPlayerProfile } from "./player";

/**
 * AvatarLayerService - Frontend Service Layer for Character Layering & Cosmetics
 *
 * TODO backend:
 * Expected future API routes:
 *   GET /api/player/avatar
 *   GET /api/player/equipment
 *   GET /api/items/{id}
 *   GET /api/avatar/layers
 */

export interface BaseAvatarData {
  avatarId: string;
  name: string;
  imageUrl: string;
  bodySpriteUrl?: string;
}

export interface EquippedLayerData {
  slot: EquipmentSlot;
  itemId: string;
  name: string;
  imageUrl: string;
  rarity: Rarity;
  level: number;
  layerZIndex: number;
  positionOffset?: { x: number; y: number; scale?: number };
}

export interface ItemArtworkData {
  itemId: string;
  name: string;
  slot: EquipmentSlot;
  imageUrl: string;
  rarity: Rarity;
  layerPosition?: { x?: number; y?: number; scale?: number };
}

export interface AvatarLayersConfig {
  layerOrder: EquipmentSlot[];
  zIndexMap: Record<EquipmentSlot, number>;
  defaultPositions: Record<EquipmentSlot, { x: number; y: number; scale: number }>;
}

/**
 * TODO backend: GET /api/player/avatar
 * Returns the base avatar configuration (e.g. 3D Fartboy Raider base model, custom skin URL, or base sprite)
 */
export async function getAvatarData(player?: Player): Promise<BaseAvatarData> {
  const p = player || (await getPlayerProfile());
  return {
    avatarId: p.avatar || "fartboy-3d-raider",
    name: "3D Fartboy Raider Base",
    imageUrl: "/assets/avatar/base/fartboy-3d-raider.png",
    bodySpriteUrl: "/assets/avatar/base/fartboy-3d-raider.png",
  };
}

export async function getBaseAvatar(player?: Player): Promise<BaseAvatarData> {
  return getAvatarData(player);
}

/**
 * TODO backend: GET /api/player/equipment
 * Resolves equipped item layers back-to-front for rendering on top of the base avatar
 */
export async function getEquipmentLayers(player?: Player): Promise<EquippedLayerData[]> {
  const p = player || (await getPlayerProfile());
  const inventory = await getInventory();
  const equipped = p.equipped ?? {};

  const slotsOrder: { slot: EquipmentSlot; zIndex: number }[] = [
    { slot: "back", zIndex: 20 },
    { slot: "feet", zIndex: 40 },
    { slot: "body", zIndex: 50 },
    { slot: "hands", zIndex: 60 },
    { slot: "head", zIndex: 70 },
    { slot: "face", zIndex: 75 },
    { slot: "accessory", zIndex: 80 },
  ];

  const layers: EquippedLayerData[] = [];

  for (const { slot, zIndex } of slotsOrder) {
    const itemId = equipped[slot];
    if (itemId) {
      const item = inventory.find((i) => i.id === itemId);
      if (item) {
        layers.push({
          slot,
          itemId: item.id,
          name: item.name,
          imageUrl: item.image,
          rarity: item.rarity,
          level: item.level ?? 1,
          layerZIndex: zIndex,
        });
      }
    }
  }

  return layers;
}

export async function getEquippedLayers(player?: Player): Promise<EquippedLayerData[]> {
  return getEquipmentLayers(player);
}

/**
 * TODO backend: GET /api/items/{id}
 * Retrieves full artwork details and layering positioning offsets for a single item ID
 */
export async function getItemArtwork(itemId: string): Promise<ItemArtworkData | null> {
  const inventory = await getInventory();
  const item = inventory.find((i) => i.id === itemId);
  if (!item) return null;

  return {
    itemId: item.id,
    name: item.name,
    slot: item.slot,
    imageUrl: item.image,
    rarity: item.rarity,
  };
}

/**
 * TODO backend: GET /api/avatar/layers
 * Returns the layer hierarchy and z-index ordering matrix for character composites
 */
export async function getAvatarLayersConfig(): Promise<AvatarLayersConfig> {
  return {
    layerOrder: ["back", "feet", "body", "hands", "head", "face", "accessory"],
    zIndexMap: {
      back: 20,
      feet: 40,
      body: 50,
      hands: 60,
      head: 70,
      face: 75,
      accessory: 80,
    },
    defaultPositions: {
      back: { x: 0, y: -10, scale: 1.1 },
      feet: { x: 0, y: 40, scale: 1 },
      body: { x: 0, y: 0, scale: 1 },
      hands: { x: 0, y: 10, scale: 1 },
      head: { x: 0, y: -45, scale: 1 },
      face: { x: 0, y: -35, scale: 1 },
      accessory: { x: 50, y: 35, scale: 0.9 },
    },
  };
}
