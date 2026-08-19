import type { Item, EquipmentSlot } from "@/types/game";
import { SEASON_1_CATALOG_MAP, normalizeSlot, SEASON_1_SLOTS } from "@/config/masterCatalog";
import { mockItems } from "@/services/items";

/**
 * Universal Equipment Resolver
 *
 * Single Source of Truth helper that maps an equipped slot or item ID to the actual Item object
 * by checking inventory instance IDs, template IDs, itemsById cache, and fallback master catalog.
 */
export function resolveItemById(
  itemId: string | undefined | null,
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
): Item | undefined {
  if (!itemId) return undefined;

  // 1. Direct match in inventory by instance ID
  const invMatch = inventory.find((it) => it.id === itemId);
  if (invMatch) return invMatch;

  // 2. Direct match in itemsById map
  if (itemsById[itemId]) return itemsById[itemId];

  // 3. Match in master catalog map
  if (SEASON_1_CATALOG_MAP[itemId]) return SEASON_1_CATALOG_MAP[itemId];

  // 4. Match in inventory by templateId or prefix
  const templateInvMatch = inventory.find(
    (it) =>
      it.templateId === itemId ||
      (it.templateId && itemId.startsWith(it.templateId)) ||
      itemId.startsWith(it.id),
  );
  if (templateInvMatch) return templateInvMatch;

  // 5. Match in itemsById by key or templateId prefix
  for (const [key, item] of Object.entries(itemsById)) {
    if (
      itemId === key ||
      itemId.startsWith(key) ||
      (item.templateId && itemId.startsWith(item.templateId))
    ) {
      return item;
    }
  }

  // 6. Fallback match in catalog mockItems
  const catalogMatch = mockItems.find(
    (it) =>
      it.id === itemId ||
      it.templateId === itemId ||
      itemId.startsWith(it.id) ||
      (it.templateId && itemId.startsWith(it.templateId)),
  );
  if (catalogMatch) return catalogMatch;

  return undefined;
}

/**
 * Helper to resolve all equipped items for a player into a Record<EquipmentSlot, Item | undefined>
 * Supports both canonical Season 1 slots (head, face, body, back, hands, feet, accessory) and legacy slot aliases.
 */
export function resolveEquippedItemsMap(
  equippedMap: Partial<Record<EquipmentSlot, string>> = {},
  inventory: Item[] = [],
  itemsById: Record<string, Item> = {},
): Record<EquipmentSlot, Item | undefined> {
  const result: Partial<Record<EquipmentSlot, Item | undefined>> = {};

  // Resolve all canonical Season 1 slots
  for (const slotObj of SEASON_1_SLOTS) {
    const canonicalSlot = slotObj.key;
    const itemId = equippedMap[canonicalSlot];
    result[canonicalSlot] = resolveItemById(itemId, inventory, itemsById);
  }

  return result as Record<EquipmentSlot, Item | undefined>;
}
