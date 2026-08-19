import { Sparkles } from "lucide-react";
import type { Item, Player } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { resolveItemById } from "@/lib/equipmentResolver";
import { isImageUrl } from "./RaiderAvatar";

/**
 * AvatarRenderer Component
 *
 * Full-body Fartboy Raider layered composite system.
 * Renders SVG/transparent PNG layers in precise Z-order over the base body.
 *
 * Layer Hierarchy:
 *  1. BACK: Power Effect Layer (Green gas / aura) - Z-Index 10
 *  2. BACK: Cape Layer (Purple Raider Cape) - Z-Index 20
 *  3. MIDDLE: Base Avatar Body (Cyan Fartboy Boy Silhouette + Pedestal) - Z-Index 30
 *  4. MIDDLE: Shorts Layer (Blue Raider Shorts) - Z-Index 40
 *  5. MIDDLE: Top Layer (Green Fartboy Hoodie / Shirt) - Z-Index 50
 *  6. FRONT: Boots Layer (Orange High-Top Sneakers & Socks) - Z-Index 60
 *  7. FRONT: Hat Layer (Purple/Black Fartboy Cap) - Z-Index 70
 *  8. SIDE: Pet Companion Layer (Golden Dog w/ Sunglasses) - Z-Index 80
 *
 * TODO backend:
 * Expected future API routes:
 *   GET /api/player/avatar
 *   GET /api/player/equipment
 *   GET /api/items/{id}
 *   GET /api/avatar/layers
 */

export interface AvatarRendererProps {
  player: Player;
  itemsById?: Record<string, Item>;
  size?: number;
  className?: string;
}

export function AvatarRenderer({
  player,
  itemsById = {},
  size = 320,
  className = "",
}: AvatarRendererProps) {
  const inventory = useGameStore((s) => s.inventory);

  // TODO backend: GET /api/player/equipment
  const hatItem = resolveItemById(player.equipped?.hat, inventory, itemsById);
  const topItem = resolveItemById(player.equipped?.top, inventory, itemsById);
  const trousersItem = resolveItemById(player.equipped?.trousers, inventory, itemsById);
  const socksItem = resolveItemById(player.equipped?.socks, inventory, itemsById);
  const capeItem = resolveItemById(player.equipped?.cape, inventory, itemsById);
  const petItem = resolveItemById(player.equipped?.pet, inventory, itemsById);
  const powerItem = resolveItemById(player.equipped?.power, inventory, itemsById);

  // Resolve SVG image sources for each layer
  const hatSrc =
    hatItem && isImageUrl(hatItem.image)
      ? hatItem.image
      : hatItem
        ? "/assets/avatar/layers/hat/fartboy-cap-01.svg"
        : null;

  const topSrc =
    topItem && isImageUrl(topItem.image)
      ? topItem.image
      : topItem
        ? "/assets/avatar/layers/top/fartboy-shirt-01.svg"
        : null;

  const shortsSrc =
    trousersItem && isImageUrl(trousersItem.image)
      ? trousersItem.image
      : trousersItem
        ? "/assets/avatar/layers/shorts/fartboy-shorts-01.svg"
        : null;

  const bootsSrc =
    socksItem && isImageUrl(socksItem.image)
      ? socksItem.image
      : socksItem
        ? "/assets/avatar/layers/boots/fartboy-boots-01.svg"
        : null;

  const capeSrc =
    capeItem && isImageUrl(capeItem.image)
      ? capeItem.image
      : capeItem
        ? "/assets/avatar/layers/cape/fartboy-cape-01.svg"
        : null;

  const petSrc =
    petItem && isImageUrl(petItem.image)
      ? petItem.image
      : petItem
        ? "/assets/avatar/layers/pet/fartboy-pet-01.svg"
        : null;

  const powerSrc =
    powerItem && isImageUrl(powerItem.image)
      ? powerItem.image
      : powerItem
        ? "/assets/avatar/layers/power/fartboy-gas-effect.svg"
        : null;

  const baseAvatarSrc = isImageUrl(player.avatar)
    ? player.avatar
    : "/assets/avatar/base/fartboy-3d-raider.png";

  return (
    <div
      className={`relative select-none flex items-center justify-center p-2 transition-all ${className}`}
      style={{ width: size, height: Math.round(size * 1.35) }}
      aria-label={`${player.username} 3D Collectible Raider Avatar`}
      data-avatar-renderer="true"
    >
      {/* BACKGROUND STAGE ATMOSPHERE LIGHTING */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-amber-500/10 via-emerald-500/10 to-purple-500/10 blur-2xl opacity-80" />

      {/* FULL-BODY COMPOSITE CANVAS WRAPPER (MATCHING 400x520 VIEWBOX RATIO) */}
      <div className="relative w-full h-full max-w-full max-h-full aspect-[400/520]">
        {/* LAYER 1: POWER EFFECT (BACK) - Z-INDEX 10 */}
        {powerSrc && (
          <img
            src={powerSrc}
            alt="Power Effect Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-10 animate-pulse transition-opacity duration-300"
            style={{ animationDuration: "3s" }}
            data-layer="power"
          />
        )}

        {/* LAYER 2: CAPE LAYER (BACK) - Z-INDEX 20 */}
        {capeSrc && (
          <img
            src={capeSrc}
            alt="Cape Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-20 animate-scale-in transition-all duration-300 drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
            data-layer="cape"
          />
        )}

        {/* LAYER 3: BASE AVATAR BODY + PEDESTAL (MIDDLE) - Z-INDEX 30 */}
        <img
          src={baseAvatarSrc}
          alt="Base Fartboy Raider Body"
          className="pointer-events-none absolute inset-0 w-full h-full object-contain z-30 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
          data-layer="base"
        />

        {/* LAYER 4: SHORTS LAYER (MIDDLE) - Z-INDEX 40 */}
        {shortsSrc && (
          <img
            src={shortsSrc}
            alt="Shorts Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-40 animate-scale-in transition-all duration-300 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
            data-layer="shorts"
          />
        )}

        {/* LAYER 5: TOP / HOODIE LAYER (MIDDLE) - Z-INDEX 50 */}
        {topSrc && (
          <img
            src={topSrc}
            alt="Top Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-50 animate-scale-in transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            data-layer="top"
          />
        )}

        {/* LAYER 6: BOOTS & SOCKS LAYER (FRONT) - Z-INDEX 60 */}
        {bootsSrc && (
          <img
            src={bootsSrc}
            alt="Boots Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-60 animate-scale-in transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            data-layer="boots"
          />
        )}

        {/* LAYER 7: HAT LAYER (FRONT) - Z-INDEX 70 */}
        {hatSrc && (
          <img
            src={hatSrc}
            alt="Hat Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-70 animate-scale-in transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            data-layer="hat"
          />
        )}

        {/* LAYER 8: PET COMPANION LAYER (SIDE) - Z-INDEX 80 */}
        {petSrc && (
          <img
            src={petSrc}
            alt="Pet Companion Layer"
            className="pointer-events-none absolute inset-0 w-full h-full object-contain z-80 animate-bounce transition-all duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            style={{ animationDuration: "2.6s" }}
            data-layer="pet"
          />
        )}
      </div>

      {/* FOOTER COLLECTIBLE LEVEL BADGE */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-amber-400/80 bg-surface-1/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-mono font-black text-amber-300 shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-90">
        <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
        RAIDER LVL {player.level}
      </div>
    </div>
  );
}
