import type { Item, Player } from "@/types/game";
import { AvatarStage } from "./AvatarStage";
import { AvatarRenderer } from "./AvatarRenderer";

export { AvatarStage, AvatarRenderer };

/**
 * Full-Body Raider Avatar Composite Showcase
 *
 * Delegate component wrapping AvatarStage for backward compatibility.
 */
export function AvatarLayerStack({
  player,
  itemsById = {},
  size = 360,
  className = "",
  hoveredSlot,
  activeSlot,
  onSlotHover,
  onSlotClick,
  is3DMode,
}: {
  player: Player;
  itemsById?: Record<string, Item>;
  size?: number;
  className?: string;
  hoveredSlot?: string | null;
  activeSlot?: string | null;
  onSlotHover?: (slotKey: string | null) => void;
  onSlotClick?: (slotKey: string) => void;
  is3DMode?: boolean;
}) {
  return (
    <AvatarStage
      player={player}
      itemsById={itemsById}
      size={size}
      className={className}
      hoveredSlot={hoveredSlot}
      activeSlot={activeSlot}
      onSlotHover={onSlotHover}
      onSlotClick={onSlotClick}
      is3DMode={is3DMode}
    />
  );
}
