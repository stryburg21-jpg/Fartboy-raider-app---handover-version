import type { EquipmentSlot, Rarity } from "@/types/game";

/**
 * Backend Contract Interfaces for Raider Character Layering System
 *
 * TODO(backend):
 * Expected API Endpoint: GET /api/player/avatar
 * Expected Payload:
 * {
 *   avatarId: string;
 *   baseBodyUrl: string;
 *   equippedItemIds: Record<EquipmentSlot, string>;
 *   itemArtworkUrls: Record<string, ItemArtwork>;
 *   layerPositionOverrides?: Record<AvatarLayerId, { x: number; y: number; scale?: number }>;
 *   petPosition?: { x: number; y: number; scale?: number };
 *   powerEffectAssetUrl?: string;
 * }
 */

export interface ItemArtwork {
  url?: string;
  icon?: string;
  spriteClass?: string;
}

export interface EquipmentVisual {
  itemId: string;
  slot: EquipmentSlot;
  image: string;
  artwork?: ItemArtwork;
  rarity: Rarity;
  layerPosition?: {
    x?: number;
    y?: number;
    scale?: number;
    zIndex?: number;
  };
}

export interface AvatarLayer {
  id: AvatarLayerId;
  label: string;
  /** Higher = rendered on top. Values are spaced to allow future insertion. */
  z: number;
  /** Which equipment slot (if any) drives this layer. */
  slot?: EquipmentSlot;
  /** Whether the slot is player-equippable today or reserved for future work. */
  reserved?: boolean;
  /** Placeholder artwork used until real asset URLs are wired from backend. */
  placeholder: string;
  defaultVisual?: string;
}

export type AvatarLayerId =
  | "background"
  | "power" // aura / power FX layer
  | "pet" // companion pet rendered beside character
  | "cape" // back cape rendered behind body
  | "body" // 3D Fartboy base Raider character body
  | "trousers" // shorts on legs
  | "shoes" // feet on shoes
  | "shirt" // body top
  | "hat"; // head hat

export const AVATAR_LAYERS: AvatarLayer[] = [
  { id: "background", label: "Background", z: 0, placeholder: "" },
  { id: "cape", label: "Back", z: 20, slot: "back", placeholder: "🦸", defaultVisual: "🦸" },
  { id: "pet", label: "Pet", z: 25, slot: "pet", placeholder: "🐾", defaultVisual: "🐾" },
  { id: "body", label: "Body Base", z: 30, placeholder: "🤢", defaultVisual: "3D Fartboy Raider" },
  { id: "trousers", label: "Shorts", z: 40, slot: "shorts", placeholder: "🩳" },
  { id: "shoes", label: "Feet", z: 50, slot: "feet", placeholder: "👟" },
  { id: "shirt", label: "Body", z: 60, slot: "body", placeholder: "👕" },
  { id: "hat", label: "Head", z: 70, slot: "head", placeholder: "🎩" },
  {
    id: "power",
    label: "Power Item",
    z: 75,
    slot: "powerItem",
    placeholder: "⚡",
    defaultVisual: "✨",
  },
];

/** Ordered back-to-front for rendering. */
export const AVATAR_LAYERS_SORTED = [...AVATAR_LAYERS].sort((a, b) => a.z - b.z);
