import React from "react";
import type { Item, Player, Rarity } from "@/types/game";
import { resolveEquippedItemsMap } from "@/lib/equipmentResolver";

export interface FullRaritySetMatchResult {
  isMatching: boolean;
  rarity: Rarity | null;
  color: string;
  rgb: string;
  label: string;
  intensity: number;
}

const RARITY_FOIL_CONFIG: Record<
  Rarity,
  { color: string; rgb: string; label: string; intensity: number; foilSweepDuration: number }
> = {
  common: {
    color: "#d1d5db",
    rgb: "209, 213, 219",
    label: "Common",
    intensity: 0, // Very subtle or no special shine
    foilSweepDuration: 6,
  },
  uncommon: {
    color: "#10b981",
    rgb: "16, 185, 129",
    label: "Uncommon",
    intensity: 1, // Subtle shine
    foilSweepDuration: 5,
  },
  rare: {
    color: "#00F0FF",
    rgb: "0, 240, 255",
    label: "Rare",
    intensity: 2, // Clearly visible premium foil/shimmer
    foilSweepDuration: 4,
  },
  epic: {
    color: "#a855f7",
    rgb: "168, 85, 247",
    label: "Epic",
    intensity: 3, // Strong distinctive violet-purple foil treatment
    foilSweepDuration: 3.5,
  },
  legendary: {
    color: "#D4AF37",
    rgb: "212, 175, 55",
    label: "Legendary",
    intensity: 4, // Rich golden holographic foil with prismatic diffraction
    foilSweepDuration: 3,
  },
  mythic: {
    color: "#ef4444",
    rgb: "239, 68, 68",
    label: "Mythic",
    intensity: 5, // Cosmic crimson-ruby prismatic fire foil
    foilSweepDuration: 2.5,
  },
};

/**
 * Checks if the player has a COMPLETE equipped set where all 7 required slots
 * (head, body, shorts, feet, back, pet, powerItem) are equipped and share the EXACT SAME rarity.
 */
export function checkFullRaritySetMatch(
  equippedMap: Partial<Record<string, string | undefined>>,
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
): FullRaritySetMatchResult {
  const resolved = resolveEquippedItemsMap(equippedMap, inventory, itemsById);

  // The 7 required equipment slots for a complete set
  const requiredSlots: string[] = ["head", "body", "shorts", "feet", "back", "pet", "powerItem"];

  const equippedItems: Item[] = [];
  for (const slot of requiredSlots) {
    const item = resolved[slot];
    if (!item) {
      // Incomplete set: at least one required slot is empty
      return {
        isMatching: false,
        rarity: null,
        color: "#d1d5db",
        rgb: "209, 213, 219",
        label: "",
        intensity: 0,
      };
    }
    equippedItems.push(item);
  }

  const firstRarity = (equippedItems[0].rarity || "common").toLowerCase() as Rarity;
  const allMatch = equippedItems.every(
    (it) => (it.rarity || "common").toLowerCase() === firstRarity,
  );

  if (!allMatch) {
    // Complete set equipped, but with mixed rarities -> DO NOT activate
    return {
      isMatching: false,
      rarity: null,
      color: "#d1d5db",
      rgb: "209, 213, 219",
      label: "",
      intensity: 0,
    };
  }

  const config = RARITY_FOIL_CONFIG[firstRarity] || RARITY_FOIL_CONFIG.common;

  return {
    isMatching: true,
    rarity: firstRarity,
    color: config.color,
    rgb: config.rgb,
    label: config.label,
    intensity: config.intensity,
  };
}

export interface FullSetRarityFoilEffectProps {
  player: Player;
  inventory?: Item[];
  itemsById?: Record<string, Item>;
  className?: string;
}

/**
 * Premium Collectible Card Holographic Foil & Shimmer Effect.
 *
 * Activates ONLY when all 7 required gear slots are equipped with matching rarity.
 * Renders a subtle, moving diagonal foil sweep and holographic diffraction treatment
 * like a collectible rare Pokémon card without obscuring character art, video, or controls.
 */
export function FullSetRarityFoilEffect({
  player,
  inventory = [],
  itemsById = {},
  className = "",
}: FullSetRarityFoilEffectProps) {
  const match = React.useMemo(() => {
    return checkFullRaritySetMatch(player.equipped ?? {}, inventory, itemsById);
  }, [player.equipped, inventory, itemsById]);

  if (!match.isMatching || !match.rarity) {
    return null;
  }

  const config = RARITY_FOIL_CONFIG[match.rarity] || RARITY_FOIL_CONFIG.common;

  // Common has minimal to no shine
  if (match.intensity === 0) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl z-[25] overflow-hidden ${className}`}
      >
        <div
          className="absolute inset-0 border rounded-2xl opacity-20 pointer-events-none"
          style={{ borderColor: config.color }}
        />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-2xl z-[25] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Holographic Diagonal Light Sweep (Foil Shimmer) */}
      <div
        className="absolute -inset-[100%] pointer-events-none animate-foil-sweep"
        style={{
          background: `linear-gradient(
            115deg,
            transparent 30%,
            rgba(${config.rgb}, 0.05) 42%,
            rgba(${config.rgb}, ${0.12 * match.intensity}) 48%,
            rgba(255, 255, 255, ${0.18 * match.intensity}) 50%,
            rgba(${config.rgb}, ${0.12 * match.intensity}) 52%,
            rgba(${config.rgb}, 0.05) 58%,
            transparent 70%
          )`,
          mixBlendMode: "screen",
          animationDuration: `${config.foilSweepDuration}s`,
        }}
      />

      {/* 2. Prismatic Holographic Diffraction Sheen for Rare / Epic / Legendary / Mythic */}
      {match.intensity >= 2 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay animate-holographic-glitter"
          style={{
            backgroundImage: `linear-gradient(
              135deg,
              rgba(255, 0, 128, 0.08) 0%,
              rgba(0, 240, 255, 0.1) 25%,
              rgba(255, 215, 0, 0.08) 50%,
              rgba(168, 85, 247, 0.1) 75%,
              rgba(0, 240, 255, 0.08) 100%
            )`,
            backgroundSize: "200% 200%",
          }}
        />
      )}

      {/* 3. Secondary Micro-Light Sheen (Opposing Angle) */}
      {match.intensity >= 3 && (
        <div
          className="absolute -inset-[100%] pointer-events-none animate-foil-sweep-reverse"
          style={{
            background: `linear-gradient(
              -65deg,
              transparent 35%,
              rgba(${config.rgb}, 0.08) 47%,
              rgba(255, 255, 255, 0.15) 50%,
              rgba(${config.rgb}, 0.08) 53%,
              transparent 65%
            )`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* 4. Fine 1px Collectible Rarity Border Sheen */}
      <div
        className="absolute inset-0 rounded-2xl border pointer-events-none transition-all duration-700"
        style={{
          borderColor: `rgba(${config.rgb}, ${0.35 + match.intensity * 0.1})`,
          boxShadow: `inset 0 0 12px rgba(${config.rgb}, ${0.12 * match.intensity})`,
        }}
      />
    </div>
  );
}
