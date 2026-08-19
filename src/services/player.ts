import type {
  DiscordRole,
  EquipmentSlot,
  Item,
  Player,
  PlayerContributionStats,
} from "@/types/game";
import { getContributorTierByName } from "@/config/contributor";
import {
  getReputationTier,
  getReputationMultiplier,
  getReputationMultiplierPct,
  WEEKLY_REP_XP_CAP,
  MAX_REPUTATION_XP,
  type ReputationTier,
} from "@/config/reputationConfig";
import { getInventory } from "./inventory";
import { getActiveProfileData, subscribeToProfileChanges } from "./profiles";
import { trackMissionEvent } from "@/services/missions";
import { getDetailedItemStats, getItem6Stats } from "@/utils/itemStats";
import { SET_CATALOGUE_BIBLE, STAT_META, type BibleStatKey } from "@/services/economyEngineBible";

export interface EquippedGearByStat {
  stat_key: BibleStatKey | string;
  label?: string;
  stat_label?: string;
  icon?: string;
  value_pct: number;
  total_bonus_pct?: number;
  items_contributing?: number;
}

export interface UserMultipliersResponse {
  user_id: string;
  combined_xp_multiplier_pct: number;
  breakdown: {
    reputation: {
      current_tier_name: string;
      multiplier_pct: number;
      current_rep_xp: number;
      next_tier_rep_xp: number;
      weekly_rep_xp_earned?: number;
      weekly_rep_cap?: number;
      is_warbound?: boolean;
    };
    title_boost: {
      active_title: string;
      multiplier_pct: number;
    };
    specialist_set: {
      active_set_name: string;
      pieces_equipped: number;
      is_active: boolean;
      multiplier_pct: number;
    };
    equipped_gear: {
      uncapped_sum_pct: number;
      applied_capped_pct: number;
      cap_limit_pct: number;
      by_stat_breakdown: Array<{
        stat_key: string;
        label: string;
        value_pct: number;
        icon?: string;
        items_contributing?: number;
      }>;
    };
  };

  // Backwards compatibility properties
  total_effective_multiplier: number;
  equipped_gear_passive_boost_pct: number;
  gear_cap_applied: boolean;
  max_gear_cap_pct: number;
  equipped_gear_by_stat: EquippedGearByStat[];
  specialist_set_bonus: {
    set_name: string;
    is_active_7_of_7: boolean;
    bonus_pct: number;
  };
  seasonal_prestige_title_boost: {
    title: string;
    bonus_pct: number;
  };
  reputation_multiplier: {
    tier: string;
    multiplier: number;
    multiplier_pct: number;
  };
}

export interface EquipItemRequest {
  slot: EquipmentSlot;
  itemId: string;
}

export interface EquipItemResponse {
  success: boolean;
  updatedPlayer: Player;
  updatedInventory: Item[];
}

export interface UnequipItemRequest {
  slot: EquipmentSlot;
}

export interface UnequipItemResponse {
  success: boolean;
  updatedPlayer: Player;
  updatedInventory: Item[];
}

// In-memory player state for active profile
let currentProfilePlayerCache: Player | null = null;

// Re-sync when profile changes
subscribeToProfileChanges(() => {
  currentProfilePlayerCache = null;
});

/**
 * Service Abstraction for Player Profile
 * API Contract: GET /api/player/profile (or GET /api/player/me)
 * Returns: Player profile with lifetimeXP, spendableXP, level, contributorRank, specialistIdentity
 */
export async function getPlayerProfile(): Promise<Player> {
  if (!currentProfilePlayerCache) {
    const profile = getActiveProfileData();
    currentProfilePlayerCache = { ...profile.player };
  }
  return { ...currentProfilePlayerCache };
}

export async function getCurrentPlayer(): Promise<Player> {
  return getPlayerProfile();
}

export function setMockPlayer(player: Player): void {
  currentProfilePlayerCache = { ...player };
  const profile = getActiveProfileData();
  profile.player = { ...player };
}

/**
 * Service Abstraction for Player Inventory Items
 * API Contract: GET /api/player/items
 * Returns: Array of owned items exposing itemId, templateId, name, artwork, rarity, slot, level, specialistSet, duplicateCount, equipped.
 */
export async function getPlayerItems(): Promise<Item[]> {
  return getInventory();
}

/**
 * Service Abstraction for Character Equipment
 * API Contract: POST /api/player/equip
 * Request: { slot, itemId }
 * Response: { success, updatedPlayer, updatedInventory }
 */
export async function equipPlayerItem(
  slot: EquipmentSlot,
  itemId: string,
): Promise<EquipItemResponse> {
  const p = await getPlayerProfile();
  p.equipped = { ...p.equipped, [slot]: itemId };
  setMockPlayer(p);
  const inventory = await getInventory();

  trackMissionEvent("set_equipped", 1);

  return {
    success: true,
    updatedPlayer: { ...p },
    updatedInventory: inventory,
  };
}

/**
 * Service Abstraction for Unequipping Equipment
 * API Contract: POST /api/player/unequip
 * Request: { slot }
 * Response: { success, updatedPlayer, updatedInventory }
 */
export async function unequipPlayerItem(slot: EquipmentSlot): Promise<UnequipItemResponse> {
  const p = await getPlayerProfile();
  const updatedEquipped = { ...p.equipped };
  delete updatedEquipped[slot];
  p.equipped = updatedEquipped;
  setMockPlayer(p);
  const inventory = await getInventory();
  return {
    success: true,
    updatedPlayer: { ...p },
    updatedInventory: inventory,
  };
}

/**
 * Service Abstraction for Player Roles & Discord Integration
 * Data Flow: Discord API / Database -> Backend API (GET /api/player/:id/roles) -> Player Service -> Store -> Character HQ UI
 */
export interface AvailableAvatar {
  id: string;
  name: string;
  url: string;
  unlocked: boolean;
  rarity?: string;
}

// TODO(backend): GET /api/player/avatars
export async function getOwnedAvatars(): Promise<AvailableAvatar[]> {
  return [
    {
      id: "fartboy_3d_raider",
      name: "3D Fartboy Raider",
      url: "/assets/avatar/base/fartboy-3d-raider.png",
      unlocked: true,
      rarity: "legendary",
    },
    {
      id: "fartboy_default",
      name: "Default Raider",
      url: "/assets/avatar/base/fartboy-default.png",
      unlocked: true,
      rarity: "common",
    },
    {
      id: "fartboy_cyber",
      name: "Cyber Specialist",
      url: "/assets/character/image_41.png",
      unlocked: true,
      rarity: "epic",
    },
    {
      id: "fartboy_vanguard",
      name: "Vault Vanguard",
      url: "/assets/character/raider_base.png",
      unlocked: true,
      rarity: "mythic",
    },
  ];
}

// TODO(backend): POST /api/player/avatar/select
export async function selectPlayerAvatar(avatarUrl: string): Promise<Player> {
  const p = await getPlayerProfile();
  p.avatar = avatarUrl;
  setMockPlayer(p);
  return { ...p };
}

export async function equipPlayerTitle(titleId: string): Promise<Player> {
  const p = await getPlayerProfile();
  if (!p.titles) {
    p.titles = [
      { id: "bubble_blaster", name: "BUBBLE BLASTER", equipped: true, unlocked: true },
      { id: "chaos_engineer", name: "Chaos Engineer", equipped: false, unlocked: true },
      { id: "raid_veteran", name: "Raid Veteran", equipped: false, unlocked: true },
      { id: "fartboy_lord", name: "Fartboy Lord", equipped: false, unlocked: true },
    ];
  }
  p.titles = p.titles.map((t) => ({
    ...t,
    equipped: t.id === titleId,
  }));
  setMockPlayer(p);
  return { ...p };
}

export async function getPlayerRoles(
  player: Player,
  activeSpecialistIdentity: string = "Raid",
): Promise<DiscordRole[]> {
  const equippedTitle = player.titles?.find((t) => t.equipped);
  const contributorTier = getContributorTierByName(player.contributorRank);
  const raidsCount = player.lifetimeStats?.raids ?? player.raidCount ?? 0;
  const memesCount = player.lifetimeStats?.memes ?? 0;
  const videosCount = player.lifetimeStats?.videos ?? 0;

  return [
    {
      id: "role_specialist",
      label: `Specialist: ${activeSpecialistIdentity}`,
      icon: "🎯",
      color: "bg-primary/10 text-primary border-primary/30",
      earned: true,
      type: "Game Role",
    },
    ...(player.contributorRank && contributorTier.id !== "unranked"
      ? [
          {
            id: "role_contributor",
            label: `Contributor: ${contributorTier.name}`,
            icon: contributorTier.badge || "🔴",
            color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
            earned: true,
            type: "Contributor Rank" as const,
          },
        ]
      : []),
    ...(equippedTitle
      ? [
          {
            id: "role_title",
            label: `Title: "${equippedTitle.name}"`,
            icon: "🏷️",
            color: "bg-accent/10 text-accent border-accent/30",
            earned: true,
            type: "Title" as const,
          },
        ]
      : []),
    {
      id: "role_discord_member",
      label: "Community Member",
      icon: "💎",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      earned: true,
      type: "Discord Role",
    },
    {
      id: "role_discord_supporter",
      label: "Early Supporter",
      icon: "🎖️",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      earned: true,
      type: "Discord Role",
    },
    ...(raidsCount >= 5
      ? [
          {
            id: "role_discord_raid_leader",
            label: "Raid Leader",
            icon: "🔥",
            color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
            earned: true,
            type: "Discord Role" as const,
          },
        ]
      : []),
    ...(videosCount > 0 || equippedTitle?.name.toLowerCase().includes("creator")
      ? [
          {
            id: "role_discord_creator",
            label: "Content Creator",
            icon: "🎥",
            color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
            earned: true,
            type: "Discord Role" as const,
          },
        ]
      : []),
    ...(memesCount > 0
      ? [
          {
            id: "role_discord_meme_crafter",
            label: "Meme Crafter",
            icon: "🎨",
            color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            earned: true,
            type: "Discord Role" as const,
          },
        ]
      : []),
  ];
}

/**
 * Service Abstraction for Player Contribution Statistics
 * Data Flow: Discord verification/Database -> Backend API (GET /api/player/:id/contributions) -> Player Service -> Store -> Character HQ UI
 */
export async function getPlayerContributionStats(
  _playerId: string,
  player?: Player,
): Promise<PlayerContributionStats> {
  return {
    raidsCompleted: player?.lifetimeStats?.raids ?? player?.raidCount ?? 312,
    memesCreated: player?.lifetimeStats?.memes ?? 87,
    videosCreated: player?.lifetimeStats?.videos ?? 12,
    postsSupported: 142,
    ctoContributions: 15,
    missionContributions: 45,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Standardized Multipliers Breakdown API Service (GET /api/v1/user/multipliers)
 * Calculates granular 6-canonical stat contributions, active set bonus, title boost, and cap status.
 */
export function getUserMultipliersPayload(
  player: Player,
  inventory: Item[],
  itemsById?: Record<string, Item>,
): UserMultipliersResponse {
  const equippedSlots = player.equipped ?? {};
  const equippedItems: Item[] = [];

  for (const itemId of Object.values(equippedSlots)) {
    if (!itemId) continue;
    const found =
      inventory.find((i) => i.id === itemId) || (itemsById ? itemsById[itemId] : undefined);
    if (found) {
      equippedItems.push(found);
    }
  }

  // Calculate canonical stat totals
  const statTotals: Record<BibleStatKey, { total: number; count: number }> = {
    general_xp: { total: 0, count: 0 },
    raid_xp: { total: 0, count: 0 },
    cto_xp: { total: 0, count: 0 },
    mission_xp: { total: 0, count: 0 },
    meme_xp: { total: 0, count: 0 },
    luck: { total: 0, count: 0 },
  };

  const setCounts: Record<string, number> = {};

  for (const item of equippedItems) {
    const detailed = getDetailedItemStats(item);
    for (const s of detailed.all) {
      if (statTotals[s.key]) {
        statTotals[s.key].total += s.value_pct;
        statTotals[s.key].count += 1;
      }
    }

    const setId = (item.set || "set_season").toLowerCase();
    setCounts[setId] = (setCounts[setId] || 0) + 1;
  }

  // Calculate uncapped sum of equipped gear stats
  let uncappedGearSum = 0;
  for (const s of Object.values(statTotals)) {
    uncappedGearSum += s.total;
  }
  // Fallback to individual items' bonusXP sum if stat totals were zero
  if (uncappedGearSum === 0) {
    for (const it of equippedItems) {
      uncappedGearSum += it.bonusXP || 0;
    }
  }
  if (uncappedGearSum === 0 && equippedItems.length > 0) {
    uncappedGearSum = 14.5;
  }

  const maxGearCapPct = 10.0;
  const gearCapApplied = uncappedGearSum > maxGearCapPct;
  const appliedCappedPct = Number(Math.min(maxGearCapPct, Number(uncappedGearSum.toFixed(1))));
  const equippedGearPassiveBoostPct = appliedCappedPct;

  const canonicalOrder: BibleStatKey[] = [
    "raid_xp",
    "general_xp",
    "luck",
    "cto_xp",
    "mission_xp",
    "meme_xp",
  ];

  const byStatBreakdown = canonicalOrder
    .map((key) => {
      const meta = STAT_META[key];
      const val = statTotals[key].total;
      return {
        stat_key: key,
        label: meta.label,
        value_pct: Number(
          val > 0
            ? val.toFixed(1)
            : key === "raid_xp"
              ? 4.2
              : key === "general_xp"
                ? 2.8
                : key === "luck"
                  ? 3.0
                  : 0,
        ),
        icon: meta.icon,
        items_contributing: statTotals[key].count || 1,
      };
    })
    .filter((s) => s.value_pct > 0);

  const equippedGearByStat: EquippedGearByStat[] = canonicalOrder.map((key) => {
    const meta = STAT_META[key];
    return {
      stat_key: key,
      stat_label: meta.label,
      label: meta.label,
      icon: meta.icon,
      value_pct: Number(statTotals[key].total.toFixed(2)),
      total_bonus_pct: Number(statTotals[key].total.toFixed(2)),
      items_contributing: statTotals[key].count,
    };
  });

  // Check 7/7 specialist set bonus
  let dominantSetId = "set_raid";
  let dominantCount = 0;
  for (const [sId, cnt] of Object.entries(setCounts)) {
    if (cnt > dominantCount) {
      dominantCount = cnt;
      dominantSetId = sId;
    }
  }

  if (dominantCount === 0 && equippedItems.length > 0) {
    dominantCount = Math.min(7, equippedItems.length);
  }

  const setMeta = SET_CATALOGUE_BIBLE[dominantSetId] || SET_CATALOGUE_BIBLE.set_raid;
  const isFullSet = dominantCount >= 7;
  const setMultiplierPct = isFullSet ? setMeta.bonus_pct : 0.0;

  // Dynamically resolve equipped title name and XP bonus
  const equippedTitleObj = player.equippedTitle || player.titles?.find((t) => t?.equipped);
  const titleName = equippedTitleObj?.name || "The Stinker";
  const titleBonusPct = equippedTitleObj?.bonusXP ?? 3.0;

  // Reputation Multiplier (0-1000 Score Model)
  const repTier = getReputationTier(player.reputation ?? 500, player.contributorRank);
  const currentRepXP = player.reputation ?? 500;
  const weeklyEarned = Math.min(WEEKLY_REP_XP_CAP, currentRepXP % WEEKLY_REP_XP_CAP || 4200);

  const combinedXpMultiplierPct = Number(
    (repTier.multiplierPct + titleBonusPct + setMultiplierPct + appliedCappedPct).toFixed(1),
  );

  const totalEffectiveMultiplier = Number((1.0 + combinedXpMultiplierPct / 100).toFixed(2));

  return {
    user_id: player.id || "discord_123456",
    combined_xp_multiplier_pct: combinedXpMultiplierPct,
    breakdown: {
      reputation: {
        current_tier_name: repTier.tierName,
        multiplier_pct: repTier.multiplierPct,
        current_rep_xp: currentRepXP,
        next_tier_rep_xp: repTier.nextTierRepXP,
        weekly_rep_xp_earned: weeklyEarned,
        weekly_rep_cap: WEEKLY_REP_XP_CAP,
        is_warbound: true,
      },
      title_boost: {
        active_title: titleName,
        multiplier_pct: titleBonusPct,
      },
      specialist_set: {
        active_set_name: setMeta.name,
        pieces_equipped: dominantCount,
        is_active: isFullSet,
        multiplier_pct: setMultiplierPct,
      },
      equipped_gear: {
        uncapped_sum_pct: Number(uncappedGearSum.toFixed(1)),
        applied_capped_pct: appliedCappedPct,
        cap_limit_pct: maxGearCapPct,
        by_stat_breakdown: byStatBreakdown,
      },
    },
    // Backward compatibility accessors
    total_effective_multiplier: totalEffectiveMultiplier,
    equipped_gear_passive_boost_pct: appliedCappedPct,
    gear_cap_applied: gearCapApplied,
    max_gear_cap_pct: maxGearCapPct,
    equipped_gear_by_stat: equippedGearByStat,
    specialist_set_bonus: {
      set_name: setMeta.name,
      is_active_7_of_7: isFullSet,
      bonus_pct: setMeta.bonus_pct,
    },
    seasonal_prestige_title_boost: {
      title: titleName,
      bonus_pct: titleBonusPct,
    },
    reputation_multiplier: {
      tier: repTier.tierName,
      multiplier: repTier.multiplier,
      multiplier_pct: repTier.multiplierPct,
    },
  };
}
