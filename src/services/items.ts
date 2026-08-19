import type { Item } from "@/types/game";
import { SEASON_1_CATALOG, SEASON_1_CATALOG_MAP } from "@/config/masterCatalog";

// Master Season 1 Items (168 unique items)
export const mockItems: Item[] = SEASON_1_CATALOG;

export async function getAllItems(): Promise<Item[]> {
  return SEASON_1_CATALOG;
}

export async function getItemById(id: string): Promise<Item | undefined> {
  return SEASON_1_CATALOG_MAP[id] || mockItems.find((i) => i.id === id);
}
