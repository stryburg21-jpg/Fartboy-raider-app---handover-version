import type { Rarity } from "@/types/game";
import { SEASON_1_PACKS_MAP } from "@/config/packs";
import type { PerPackPityCounter, PityState } from "./packEngine";

export interface PackHistoryEntry {
  id: string;
  packId: string;
  openedAt: string;
  raritiesObtained: Rarity[];
}

export interface PityCounterState {
  packs?: Record<string, PerPackPityCounter>;
  epicPityCounter: number;
  legendaryPityCounter: number;
  totalPacksOpened: number;
  packHistory: PackHistoryEntry[];
}

export function getInitialPityState(): PityCounterState {
  return {
    packs: {
      pack_raider: { epicPityCounter: 0, legendaryPityCounter: 0, totalPacksOpened: 0 },
      pack_specialist: { epicPityCounter: 0, legendaryPityCounter: 0, totalPacksOpened: 0 },
      pack_legendary_raider: { epicPityCounter: 0, legendaryPityCounter: 0, totalPacksOpened: 0 },
    },
    epicPityCounter: 0,
    legendaryPityCounter: 0,
    totalPacksOpened: 0,
    packHistory: [],
  };
}

/**
 * Retrieves the specific pity counters for a given pack ID
 */
export function getPackPityCounters(
  state: PityCounterState | PityState | undefined,
  packId: string,
): {
  epicPityCounter: number;
  legendaryPityCounter: number;
  totalPacksOpened: number;
  epicThreshold: number;
  legendaryThreshold: number;
  epicPityRemaining: number;
  legendaryPityRemaining: number;
} {
  const packConfig = SEASON_1_PACKS_MAP[packId] || SEASON_1_PACKS_MAP["pack_raider"];
  const epicThreshold = packConfig?.pityRules?.epicPityThreshold ?? 20;
  const legendaryThreshold = packConfig?.pityRules?.legendaryPityThreshold ?? 30;

  const packPity = state?.packs?.[packId] || {
    epicPityCounter: state?.epicPityCounter || 0,
    legendaryPityCounter: state?.legendaryPityCounter || 0,
    totalPacksOpened: state?.totalPacksOpened || 0,
  };

  const epicPityCounter = packPity.epicPityCounter || 0;
  const legendaryPityCounter = packPity.legendaryPityCounter || 0;

  return {
    epicPityCounter,
    legendaryPityCounter,
    totalPacksOpened: packPity.totalPacksOpened || 0,
    epicThreshold,
    legendaryThreshold,
    epicPityRemaining: Math.max(0, epicThreshold - epicPityCounter),
    legendaryPityRemaining: Math.max(0, legendaryThreshold - legendaryPityCounter),
  };
}

/**
 * Checks whether pity protection will trigger on the NEXT pack open for a specific pack
 */
export function checkPityProtectionTrigger(
  state: PityCounterState | PityState | undefined,
  packId: string,
): { epicProtectionActive: boolean; legendaryProtectionActive: boolean } {
  const counters = getPackPityCounters(state, packId);
  return {
    epicProtectionActive: counters.epicPityCounter + 1 >= counters.epicThreshold,
    legendaryProtectionActive: counters.legendaryPityCounter + 1 >= counters.legendaryThreshold,
  };
}

/**
 * Updates pity state given the rarities obtained in a pack opening.
 */
export function updatePityStateOnPackOpened(
  currentState: PityCounterState,
  packId: string,
  raritiesObtained: Rarity[],
): PityCounterState {
  const currentPacks = currentState.packs || {};
  const currentPackPity = currentPacks[packId] || {
    epicPityCounter: currentState.epicPityCounter || 0,
    legendaryPityCounter: currentState.legendaryPityCounter || 0,
    totalPacksOpened: 0,
  };

  const updatedPackPity: PerPackPityCounter = {
    epicPityCounter: currentPackPity.epicPityCounter + 1,
    legendaryPityCounter: currentPackPity.legendaryPityCounter + 1,
    totalPacksOpened: currentPackPity.totalPacksOpened + 1,
  };

  const newState: PityCounterState = {
    packs: {
      ...currentPacks,
      [packId]: updatedPackPity,
    },
    epicPityCounter: currentState.epicPityCounter + 1,
    legendaryPityCounter: currentState.legendaryPityCounter + 1,
    totalPacksOpened: currentState.totalPacksOpened + 1,
    packHistory: [...(currentState.packHistory || [])],
  };

  let hitEpic = false;
  let hitLegendaryOrMythic = false;

  for (const rarity of raritiesObtained) {
    if (rarity === "epic") {
      hitEpic = true;
    } else if (rarity === "legendary" || rarity === "mythic") {
      hitLegendaryOrMythic = true;
    }
  }

  if (hitLegendaryOrMythic) {
    updatedPackPity.epicPityCounter = 0;
    updatedPackPity.legendaryPityCounter = 0;
    newState.epicPityCounter = 0;
    newState.legendaryPityCounter = 0;
  } else if (hitEpic) {
    updatedPackPity.epicPityCounter = 0;
    newState.epicPityCounter = 0;
  }

  // Record pack history entry (keep last 50)
  const historyEntry: PackHistoryEntry = {
    id: `pkh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    packId,
    openedAt: new Date().toISOString(),
    raritiesObtained,
  };

  newState.packHistory.unshift(historyEntry);
  if (newState.packHistory.length > 50) {
    newState.packHistory = newState.packHistory.slice(0, 50);
  }

  return newState;
}
