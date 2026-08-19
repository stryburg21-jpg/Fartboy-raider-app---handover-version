import type { Item, Player } from "@/types/game";
import { normalizeSlot } from "@/config/masterCatalog";
import { safeStorage } from "@/lib/storage";

/**
 * Checks whether the current player possesses an active Contributor status.
 * Evaluates player profile rank and persistent local storage states ($50+ contribution or Pass unlock).
 */
export function checkIsContributor(player?: Player | null): boolean {
  if (
    player?.contributorRank &&
    player.contributorRank.trim().length > 0 &&
    player.contributorRank.toLowerCase() !== "free" &&
    player.contributorRank.toLowerCase() !== "none"
  ) {
    return true;
  }

  try {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null && parseFloat(stored) >= 50) return true;

    const pass = safeStorage.getItem("fartboy_contributor_pass_s1");
    if (pass) {
      const parsed = JSON.parse(pass);
      if (parsed.hasContributorUnlock) return true;
    }
  } catch (err) {
    console.debug("Failed parsing contributor storage state:", err);
  }

  return false;
}

/**
 * Determines whether an equipment or cosmetic item requires Contributor status to equip.
 */
export function isContributorItem(item: Item): boolean {
  const normSlot = normalizeSlot(item.slot);

  // All Frames and Cosmetic Themes require Contributor status
  if (normSlot === "frame" || normSlot === "cosmeticTheme") {
    return true;
  }

  // Explicit item metadata flags
  const rawItem = item as Record<string, unknown>;
  if (
    rawItem.isContributor === true ||
    rawItem.contributorOnly === true ||
    rawItem.requiresContributor === true
  ) {
    return true;
  }

  // Check item set or tags
  const itemSet = (item.set || "").toLowerCase();
  const itemName = (item.name || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  const contributorKeywords = [
    "contributor",
    "supporter",
    "bubble blaster",
    "reef ripper",
    "apex fartboy",
    "dolphinately",
    "whale of a whiff",
    "tiny tooter",
    "golden raider",
    "mythic aura",
    "luma frame",
    "holographic",
    "vip",
  ];

  if (
    contributorKeywords.some(
      (kw) => itemSet.includes(kw) || itemName.includes(kw) || category.includes(kw),
    )
  ) {
    return true;
  }

  // Mythic Pet & Mythic Power relics with 3D/animated visuals
  if (
    (normSlot === "pet" || normSlot === "powerItem" || normSlot === "power") &&
    item.rarity === "mythic"
  ) {
    return true;
  }

  return false;
}
