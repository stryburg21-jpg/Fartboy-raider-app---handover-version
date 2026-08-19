import { useGameStore } from "@/store/gameStore";

/**
 * Custom hook providing global game state for streak status, active daily reset timers,
 * player stats, inventory, packs, and quest completion progress.
 */
export function useGameState() {
  return useGameStore();
}

export { useGameStore };
