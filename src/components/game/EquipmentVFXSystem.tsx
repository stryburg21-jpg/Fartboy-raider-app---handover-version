import React from "react";
import type { Item, Rarity } from "@/types/game";

export interface UnifiedEnergyTheme {
  dominantRarity: Rarity;
  color: string;
  rgbColor: string;
  intensity: number;
  equippedCount: number;
  hasHat: boolean;
  hasTop: boolean;
  hasShorts: boolean;
  hasSocks: boolean;
  hasCape: boolean;
  hasPet: boolean;
  hasPower: boolean;
}

const RARITY_RANK: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 6,
};

const RARITY_THEMES: Record<Rarity, { color: string; rgbColor: string; intensity: number }> = {
  common: {
    color: "#d1d5db",
    rgbColor: "209, 213, 219",
    intensity: 1.0,
  },
  uncommon: {
    color: "#22c55e",
    rgbColor: "34, 197, 94",
    intensity: 1.4,
  },
  rare: {
    color: "#00F0FF",
    rgbColor: "0, 240, 255",
    intensity: 1.8,
  },
  epic: {
    color: "#a855f7",
    rgbColor: "168, 85, 247",
    intensity: 2.2,
  },
  legendary: {
    color: "#D4AF37",
    rgbColor: "212, 175, 55",
    intensity: 2.8,
  },
  mythic: {
    color: "#ef4444",
    rgbColor: "239, 68, 68",
    intensity: 3.5,
  },
};

/**
 * Computes a single unified energy state across all equipped items.
 */
export function computeUnifiedEnergyTheme(
  equippedMap: Record<string, Item | undefined>,
): UnifiedEnergyTheme {
  const getEquipped = (...keys: string[]): Item | undefined => {
    for (const k of keys) {
      if (equippedMap[k]) return equippedMap[k];
      const lowerK = k.toLowerCase();
      for (const [slotKey, item] of Object.entries(equippedMap)) {
        if (item && slotKey.toLowerCase() === lowerK) return item;
      }
    }
    return undefined;
  };

  const hatItem = getEquipped("hat", "head");
  const topItem = getEquipped("top", "body", "shirt");
  const shortsItem = getEquipped("shorts", "trousers", "bottoms");
  const socksItem = getEquipped("socks", "feet", "shoes", "boots");
  const capeItem = getEquipped("cape", "back");
  const petItem = getEquipped("pet");
  const powerItem = getEquipped("power", "powerItem", "power_item", "hand", "hands");

  const allActiveItems = [
    hatItem,
    topItem,
    shortsItem,
    socksItem,
    capeItem,
    petItem,
    powerItem,
  ].filter((item): item is Item => Boolean(item));

  if (allActiveItems.length === 0) {
    return {
      dominantRarity: "common",
      color: "#d1d5db",
      rgbColor: "209, 213, 219",
      intensity: 0,
      equippedCount: 0,
      hasHat: false,
      hasTop: false,
      hasShorts: false,
      hasSocks: false,
      hasCape: false,
      hasPet: false,
      hasPower: false,
    };
  }

  let highestItem = allActiveItems[0];
  for (const item of allActiveItems) {
    const currentRarity = item.rarity || "common";
    const highestRarity = highestItem.rarity || "common";
    if (RARITY_RANK[currentRarity] > RARITY_RANK[highestRarity]) {
      highestItem = item;
    }
  }

  const dominantRarity: Rarity = highestItem.rarity || "common";
  const baseTheme = RARITY_THEMES[dominantRarity] || RARITY_THEMES.common;

  const customColor = (highestItem as unknown as { color?: string })?.color;
  const color = customColor || baseTheme.color;

  let rgbColor = baseTheme.rgbColor;
  if (customColor && customColor.startsWith("#") && customColor.length === 7) {
    const r = parseInt(customColor.slice(1, 3), 16);
    const g = parseInt(customColor.slice(3, 5), 16);
    const b = parseInt(customColor.slice(5, 7), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      rgbColor = `${r}, ${g}, ${b}`;
    }
  }

  return {
    dominantRarity,
    color,
    rgbColor,
    intensity: baseTheme.intensity,
    equippedCount: allActiveItems.length,
    hasHat: Boolean(hatItem),
    hasTop: Boolean(topItem),
    hasShorts: Boolean(shortsItem),
    hasSocks: Boolean(socksItem),
    hasCape: Boolean(capeItem),
    hasPet: Boolean(petItem),
    hasPower: Boolean(powerItem),
  };
}

/* ========================================================================== */
/* CLEAN AMBIENT CARD ATMOSPHERE (NO CIRCULAR DISCS / AURAS)                  */
/* ========================================================================== */
function AmbientCardStageBackdrop({ theme }: { theme: UnifiedEnergyTheme }) {
  if (theme.equippedCount === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden">
      {/* Subtle linear backdrop gradient based on equipped gear theme */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(${theme.rgbColor}, 0.15) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}

/* ========================================================================== */
/* MASTER TRADING CARD VFX SYSTEM                                             */
/* ========================================================================== */
export interface EquipmentVFXSystemProps {
  equippedMap: Record<string, Item | undefined>;
}

export function EquipmentVFXSystem({ equippedMap }: EquipmentVFXSystemProps) {
  const theme = computeUnifiedEnergyTheme(equippedMap);

  if (theme.equippedCount === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AmbientCardStageBackdrop theme={theme} />
    </div>
  );
}
