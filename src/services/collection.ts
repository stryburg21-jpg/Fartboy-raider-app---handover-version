import type { ItemSet } from "@/types/game";
import { SEASON_1_SETS, SEASON_1_CATALOG } from "@/config/masterCatalog";

// Dynamically generate ItemSet objects for the 4 Season 1 Equipment Sets
export const mockSets: ItemSet[] = SEASON_1_SETS.map((setDef) => {
  const setItems = SEASON_1_CATALOG.filter((i) => i.set === setDef.name);

  // Pick representative 7 items (one for each slot, e.g., Epic/Rare tier) as required items
  const requiredSlots = ["head", "face", "body", "back", "hands", "feet", "accessory"];
  const requiredItemIds = requiredSlots.map((slotKey) => {
    const item =
      setItems.find((i) => i.slot === slotKey && i.rarity === "epic") ||
      setItems.find((i) => i.slot === slotKey && i.rarity === "rare") ||
      setItems.find((i) => i.slot === slotKey);
    return item?.id || `s1_${setDef.name.toLowerCase().replace(/\s+/g, "_")}_${slotKey}_1`;
  });

  return {
    name: setDef.name,
    category: setDef.category,
    specialistIdentity: setDef.specialistIdentity,
    description: setDef.description,
    bonusDescription: setDef.bonusDescription,
    fullSetReward: setDef.fullSetReward,
    requiredItemIds,
    ownedItemIds: requiredItemIds.slice(0, 3), // Initial demo progress
    completed: false,
  };
});

export async function getCollectionProgress(): Promise<ItemSet[]> {
  return mockSets;
}

export async function getSetProgress(name: string): Promise<ItemSet | undefined> {
  return mockSets.find((s) => s.name === name);
}
