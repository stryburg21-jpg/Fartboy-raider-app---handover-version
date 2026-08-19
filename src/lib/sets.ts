import type { Item, ItemSet } from "@/types/game";
import { mockSets } from "@/services/collection";
import { mockItems } from "@/services/items";
import { resolveItemById } from "@/lib/equipmentResolver";

export interface SetProgressInfo {
  setName: string;
  category: string;
  specialistIdentity: string;
  totalRequired: number;
  ownedCount: number;
  isComplete: boolean;
  bonusDescription: string;
  missingItems: Array<{ id: string; name: string; slot: string; image: string }>;
  ownedItems: Array<{ id: string; name: string; slot: string; image: string }>;
}

/**
 * Returns set progress, owned items, missing items, and set bonuses for any item or set name.
 */
export function getSetInfoForItem(
  itemOrSetName: Item | string,
  ownedInventory: Item[] = [],
  equippedMap: Record<string, string> = {},
): SetProgressInfo | null {
  const targetSetName = typeof itemOrSetName === "string" ? itemOrSetName : itemOrSetName.set;
  if (!targetSetName) return null;

  const foundSet = mockSets.find(
    (s) =>
      s.name.toLowerCase() === targetSetName.toLowerCase() ||
      s.category?.toLowerCase() === targetSetName.toLowerCase(),
  );

  if (!foundSet) {
    return {
      setName: targetSetName,
      category: "Specialist Set",
      specialistIdentity: "Raider Specialist",
      totalRequired: 7,
      ownedCount: 0,
      isComplete: false,
      bonusDescription: "Equip 7 items for specialist set bonus.",
      missingItems: [],
      ownedItems: [],
    };
  }

  // Combine inventory and equipped item IDs
  const playerOwnedIds = new Set<string>([
    ...ownedInventory.map((i) => i.id),
    ...Object.values(equippedMap).filter(Boolean),
    ...foundSet.ownedItemIds,
  ]);

  const requiredDetails = foundSet.requiredItemIds.map((id) => {
    const fullItem = mockItems.find((i) => i.id === id);
    return {
      id,
      name: fullItem?.name ?? id,
      slot: fullItem?.slot ?? "accessory",
      image: fullItem?.image ?? "🛡️",
    };
  });

  const ownedItems = requiredDetails.filter((item) => playerOwnedIds.has(item.id));
  const missingItems = requiredDetails.filter((item) => !playerOwnedIds.has(item.id));

  return {
    setName: foundSet.name,
    category: foundSet.category ?? "Specialist",
    specialistIdentity: foundSet.specialistIdentity ?? "Specialist Raider",
    totalRequired: foundSet.requiredItemIds.length || 7,
    ownedCount: ownedItems.length,
    isComplete: ownedItems.length >= (foundSet.requiredItemIds.length || 7),
    bonusDescription: foundSet.bonusDescription,
    missingItems,
    ownedItems,
  };
}

export interface ActiveBonusEffect {
  label: string;
  value: string;
  description?: string;
}

export interface ActiveSetBonus {
  setName: string;
  category: string;
  specialistIdentity: string;
  piecesRequired: number;
  piecesEquipped: number;
  isFullSet: boolean;
  fullSetRewardTitle?: string;
  bonuses: ActiveBonusEffect[];
}

/**
 * Service function that evaluates currently equipped items and calculates ALL active set bonuses.
 * ONLY returns set bonuses when piecesEquipped >= piecesRequired (or active threshold met).
 * Does NOT return inactive set bonuses.
 */
export function calculateActiveSetBonuses(
  equippedMap: Record<string, string> = {},
  inventory: Item[] = [],
): ActiveSetBonus[] {
  const equippedItemIds = Object.values(equippedMap).filter(Boolean);
  if (equippedItemIds.length === 0) return [];

  // Count equipped pieces belonging to each set
  const setCounts: Record<string, number> = {};
  for (const id of equippedItemIds) {
    const item = resolveItemById(id, inventory);
    if (item?.set) {
      setCounts[item.set] = (setCounts[item.set] || 0) + 1;
    }
  }

  const activeBonuses: ActiveSetBonus[] = [];

  for (const setObj of mockSets) {
    const countEquipped = setCounts[setObj.name] || 0;
    const required = setObj.requiredItemIds.length || 7;

    // Only include when full set requirement (7/7) is met
    if (countEquipped >= required) {
      const bonuses: ActiveBonusEffect[] = [];

      if (setObj.name === "Raid Specialist Set") {
        bonuses.push(
          { label: "XP Multiplier", value: "+35%" },
          { label: "Rare Luck", value: "+21%" },
          { label: "Pack Opening Bonus", value: "+10%" },
        );
      } else if (setObj.name === "CTO Specialist Set") {
        bonuses.push(
          { label: "CTO XP Multiplier", value: "+40%" },
          { label: "Architecture Efficiency", value: "+25%" },
          { label: "Vault Pack Luck", value: "+15%" },
        );
      } else if (setObj.name === "Meme Specialist Set") {
        bonuses.push(
          { label: "Meme XP Multiplier", value: "+50%" },
          { label: "Viral Drop Multiplier", value: "+30%" },
          { label: "High-Tier Pack Luck", value: "+20%" },
        );
      } else if (setObj.name === "Video Specialist Set") {
        bonuses.push(
          { label: "Studio XP Multiplier", value: "+45%" },
          { label: "Timeline Render Luck", value: "+25%" },
          { label: "Director Pack Luck", value: "+15%" },
        );
      } else if (setObj.name === "Mission Specialist Set" || setObj.name === "Mission Specialist") {
        bonuses.push(
          { label: "Daily Mission Slot", value: "+1 Extra Slot" },
          { label: "Mission Cooldown", value: "-20% Cooldown" },
          { label: "Tactical Luck", value: "+15%" },
        );
      } else if (setObj.name === "Season Specialist Set" || setObj.name === "Season Specialist") {
        bonuses.push(
          { label: "Season XP Multiplier", value: "+10%" },
          { label: "Overall Activity Boost", value: "+15%" },
          { label: "Prestige Luck", value: "+15%" },
        );
      } else {
        bonuses.push({ label: "Set Bonus", value: setObj.bonusDescription });
      }

      activeBonuses.push({
        setName: setObj.name,
        category: setObj.category ?? "Specialist",
        specialistIdentity: setObj.specialistIdentity ?? "Raider",
        piecesRequired: required,
        piecesEquipped: countEquipped,
        isFullSet: true,
        fullSetRewardTitle: setObj.fullSetReward,
        bonuses,
      });
    }
  }

  return activeBonuses;
}

/**
 * Calculates the dominant active specialist identity based on equipped equipment slots.
 */
export function getActiveSpecialistIdentity(
  equippedMap: Record<string, string> = {},
  inventory: Item[] = [],
): string {
  const equippedItemIds = Object.values(equippedMap).filter(Boolean);
  if (equippedItemIds.length === 0) return "Raid Specialist";

  const setCounts: Record<string, number> = {};
  for (const id of equippedItemIds) {
    const item = resolveItemById(id, inventory);
    if (item?.set) {
      setCounts[item.set] = (setCounts[item.set] || 0) + 1;
    }
  }

  let maxCount = 0;
  let topSet = "Raid Specialist Set";
  for (const [setName, count] of Object.entries(setCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topSet = setName;
    }
  }

  const setObj = mockSets.find((s) => s.name === topSet);
  if (setObj) {
    return setObj.category ?? setObj.name.replace(" Set", "");
  }

  return topSet.replace(" Set", "");
}

export interface SetComparisonInfo {
  currentEquippedItem: Item | null;
  candidateSet: string | null;
  currentSetCount: number;
  afterEquipSetCount: number;
  totalRequired: number;
  nextUnlockBonus: string;
  isFullSetAfterEquip: boolean;
}

/**
 * Helper to compute current vs after-equip set piece contribution and unlock prediction.
 */
export function getSetComparisonForEquip(
  slot: string,
  candidateItem: Item,
  equippedMap: Record<string, string> = {},
  inventory: Item[] = [],
): SetComparisonInfo {
  const currentEquippedId = equippedMap[slot];
  const currentEquippedItem = currentEquippedId
    ? resolveItemById(currentEquippedId, inventory)
    : null;

  const targetSet = candidateItem.set ?? null;
  if (!targetSet) {
    return {
      currentEquippedItem,
      candidateSet: null,
      currentSetCount: 0,
      afterEquipSetCount: 0,
      totalRequired: 7,
      nextUnlockBonus: "No set bonus attached",
      isFullSetAfterEquip: false,
    };
  }

  // Find set object from mockSets
  const setObj = mockSets.find((s) => s.name.toLowerCase() === targetSet.toLowerCase());
  const totalRequired = setObj?.requiredItemIds.length || 7;

  // Calculate current count of targetSet in equippedMap
  let currentCount = 0;
  for (const id of Object.values(equippedMap).filter(Boolean)) {
    const item = resolveItemById(id, inventory);
    if (item?.set && item.set.toLowerCase() === targetSet.toLowerCase()) {
      currentCount++;
    }
  }

  // Simulate after equip
  const simulatedEquippedMap = { ...equippedMap, [slot]: candidateItem.id };
  let afterCount = 0;
  for (const id of Object.values(simulatedEquippedMap).filter(Boolean)) {
    const item = resolveItemById(id, inventory);
    if (item?.set && item.set.toLowerCase() === targetSet.toLowerCase()) {
      afterCount++;
    }
  }

  const isFullSetAfterEquip = afterCount >= totalRequired;
  const nextUnlockBonus = isFullSetAfterEquip
    ? `FULL SET BONUS ACTIVATED: ${setObj?.bonusDescription ?? "+35% XP Multiplier"}`
    : `Equip ${totalRequired - afterCount} more ${targetSet} piece(s) for Full Set Multiplier`;

  return {
    currentEquippedItem,
    candidateSet: targetSet,
    currentSetCount: currentCount,
    afterEquipSetCount: afterCount,
    totalRequired,
    nextUnlockBonus,
    isFullSetAfterEquip,
  };
}
