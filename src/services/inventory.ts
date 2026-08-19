import type { EquipmentSlot, Item } from "@/types/game";
import { getActiveProfileData, subscribeToProfileChanges } from "./profiles";
import mockInventoryData from "@/data/mockInventoryData.json";

// In-memory active inventory cache
let currentProfileInventoryCache: Item[] | null = null;

// Re-sync when demo profile switches
subscribeToProfileChanges(() => {
  currentProfileInventoryCache = null;
});

export async function getInventory(): Promise<Item[]> {
  if (!currentProfileInventoryCache) {
    const profile = getActiveProfileData();
    currentProfileInventoryCache = [...profile.inventory];
  }
  return [...currentProfileInventoryCache];
}

export function setMockInventory(items: Item[]): void {
  currentProfileInventoryCache = [...items];
  // Sync back to profile object
  const profile = getActiveProfileData();
  profile.inventory = [...items];
}

export async function addInventoryItem(item: Item): Promise<Item[]> {
  const current = await getInventory();
  const updated = [item, ...current];
  setMockInventory(updated);
  return updated;
}

export async function removeInventoryItem(itemId: string): Promise<Item[]> {
  const current = await getInventory();
  const updated = current.filter((i) => i.id !== itemId);
  setMockInventory(updated);
  return updated;
}

export async function fetchRaiderLoadout() {
  const profile = getActiveProfileData();
  return {
    equipped: profile.player.equipped,
    totalPower: 136646,
    activeSet: profile.player.activeSetInfo || {
      setName: "Raid Specialist Set",
      ownedCount: 4,
      bonusXP: 15,
    },
  };
}

export async function autoEquipSetPayload(targetSetName?: string) {
  const profile = getActiveProfileData();
  return {
    success: true,
    equippedSet: targetSetName || "Raid Specialist Set",
    updatedPlayer: profile.player,
  };
}

export async function equipItem(_itemId: string, _slot: EquipmentSlot) {
  // TODO(backend): POST /api/inventory/equip
  return { success: true };
}

export async function unequipItem(_slot: EquipmentSlot) {
  // TODO(backend): POST /api/inventory/unequip
  return { success: true };
}

/**
 * Raider Identity Header payload: Discord username, equipped title + boost,
 * and active specialist set status. Falls back to mockInventoryData.identity
 * so the header stays populated before the real endpoint is wired up.
 */
export async function fetchPlayerIdentityPayload() {
  // TODO(backend): GET /api/player/identity
  const profile = getActiveProfileData();
  const mockIdentity = mockInventoryData.identity;

  const equippedTitle = profile.player.titles?.find((t) => t?.equipped);

  return {
    discordUsername: mockIdentity.discordUsername,
    equippedTitle: equippedTitle?.name || mockIdentity.equippedTitle,
    titleXpBoostPct: mockIdentity.titleXpBoostPct,
    activeSet: mockIdentity.activeSet,
  };
}

/**
 * Clears all 7 equippable gear slots ("De-Equip All" auto-equip option).
 */
export async function unequipAllGearPayload() {
  // TODO(backend): POST /api/inventory/unequip-all
  const profile = getActiveProfileData();
  const slots: EquipmentSlot[] = ["head", "body", "shorts", "feet", "back", "pet", "powerItem"];
  return {
    success: true,
    clearedSlots: slots,
    updatedPlayer: profile.player,
  };
}

/**
 * Auto-equips the single highest raw-stat item available for every slot
 * ("Equip Best Items" auto-equip option), independent of any specific set.
 */
export async function autoEquipBestInSlotPayload() {
  // TODO(backend): POST /api/inventory/auto-equip-best
  const profile = getActiveProfileData();
  return {
    success: true,
    updatedPlayer: profile.player,
  };
}

/**
 * Power breakdown payload interface and fetcher.
 * Pulls through the player's Lifetime XP and provides a 4-pillar breakdown:
 * Memes, Raid, CTO, and Other / Platform Activity.
 */
export interface PowerBreakdownCategory {
  key: "memes" | "raid" | "cto" | "other" | string;
  label: string;
  count: number;
  countText?: string;
  xpGranted: number;
  icon: string;
  percentage: number;
  channel?: string;
  description?: string;
  color?: string;
  badgeColor?: string;
}

export interface PowerBreakdownResponse {
  totalLifetimeXP: number;
  totalPower: number;
  categories: PowerBreakdownCategory[];
}

export async function fetchPowerBreakdownPayload(
  player?: Player | null,
  contribStats?: PlayerContributionStats | null,
): Promise<PowerBreakdownResponse> {
  // TODO: Fetch user XP breakdown from API endpoint GET /api/user/xp-breakdown
  const totalLifetimeXP = player?.lifetimeXP ?? 482950;
  const memesCount = player?.lifetimeStats?.memes ?? contribStats?.memesCreated ?? 89;
  const personalRaidsCount =
    player?.lifetimeStats?.raids ?? player?.raidCount ?? contribStats?.raidsCompleted ?? 340;
  const ctoCount = contribStats?.ctoContributions ?? 38;
  const snipeCount = contribStats?.bountiesClaimed ?? 88;
  const platformCount =
    (player?.lifetimeStats as { completedMissions?: number } | undefined)?.completedMissions ??
    contribStats?.missionContributions ??
    215;

  // Weight distributions to accurately distribute Lifetime XP across the 5 itemized sources
  const memesXP = Math.round(totalLifetimeXP * 0.2);
  const personalRaidXP = Math.round(totalLifetimeXP * 0.35);
  const ctoXP = Math.round(totalLifetimeXP * 0.18);
  const snipeXP = Math.round(totalLifetimeXP * 0.15);
  const platformXP = Math.max(0, totalLifetimeXP - (memesXP + personalRaidXP + ctoXP + snipeXP));

  const categories: PowerBreakdownCategory[] = [
    {
      key: "memes",
      label: "Memes Submitted",
      count: memesCount,
      countText: `${memesCount} Memes Verified`,
      xpGranted: memesXP,
      percentage: Number(((memesXP / totalLifetimeXP) * 100).toFixed(1)),
      icon: "🎭",
      channel: "#meme-factory",
      description: "Verified community meme creations, viral content, fan art & reactions",
      color: "border-purple-500/40 bg-purple-950/40 text-purple-300",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      key: "personal_raids",
      label: "Personal Raids",
      count: personalRaidsCount,
      countText: `${personalRaidsCount} Raids Executed`,
      xpGranted: personalRaidXP,
      percentage: Number(((personalRaidXP / totalLifetimeXP) * 100).toFixed(1)),
      icon: "⚔️",
      channel: "#raids-feed",
      description: "Verified personal and squad community raid operations on X/Twitter",
      color: "border-amber-500/40 bg-amber-950/40 text-amber-300",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      key: "cto",
      label: "CTO Raids",
      count: ctoCount,
      countText: `${ctoCount} CTO Engagements`,
      xpGranted: ctoXP,
      percentage: Number(((ctoXP / totalLifetimeXP) * 100).toFixed(1)),
      icon: "📢",
      channel: "#cto-official-post",
      description: "Community takeover raids, pinned thread operations & official post boosts",
      color: "border-sky-500/40 bg-sky-950/40 text-sky-300",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
    {
      key: "snipe",
      label: "Snipe Raids",
      count: snipeCount,
      countText: `${snipeCount} Sniper Directives`,
      xpGranted: snipeXP,
      percentage: Number(((snipeXP / totalLifetimeXP) * 100).toFixed(1)),
      icon: "🎯",
      channel: "#sniper-directives",
      description: "Targeted flash raids, viral tweet snipes & precision engagement ops",
      color: "border-rose-500/40 bg-rose-950/40 text-rose-300",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    {
      key: "platform",
      label: "Platform XP",
      count: platformCount,
      countText: `${platformCount} Operations Cleared`,
      xpGranted: platformXP,
      percentage: Number(((platformXP / totalLifetimeXP) * 100).toFixed(1)),
      icon: "⚡",
      channel: "War Room & Directives",
      description: "Daily mission dossiers, weekly achievements, streaks & platform milestones",
      color: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
  ];

  // Combat power calculated rating
  const totalPower = Math.round(totalLifetimeXP * 0.28) || 96850;

  return {
    totalLifetimeXP,
    totalPower,
    categories,
  };
}

/**
 * Unified executor for the 3 Auto-Equip modes ("best", "set", "unequipAll").
 */
export async function executeAutoEquipOption(mode: "best" | "set" | "unequipAll", setId?: string) {
  if (mode === "unequipAll") {
    return unequipAllGearPayload();
  } else if (mode === "best") {
    return autoEquipBestInSlotPayload();
  } else if (mode === "set") {
    return autoEquipSetPayload(setId);
  }
  const profile = getActiveProfileData();
  return { success: true, updatedPlayer: profile.player };
}

/**
 * Updates equipped title payload and syncs identity across mock inventory data.
 */
export async function updateEquippedTitlePayload(titleId: string) {
  const { equipPlayerTitle } = await import("./player");
  const updatedPlayer = await equipPlayerTitle(titleId);
  const equippedTitle = updatedPlayer.titles?.find((t) => t.equipped);
  if (equippedTitle) {
    mockInventoryData.identity.equippedTitle = equippedTitle.name;
    mockInventoryData.identity.equippedTitleId = titleId;
  }
  return {
    success: true,
    titleId,
    equippedTitle: equippedTitle?.name || titleId,
    updatedPlayer,
  };
}
