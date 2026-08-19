import type { EquipmentSlot, Item, ItemSet, Player, Title } from "@/types/game";
import type { ActivityEntry } from "@/services/activity";
import { getAllItems } from "./items";

// TODO(backend): GET /api/players/:id (public profile)
// TODO(backend): GET /api/players/:id/equipment
// TODO(backend): GET /api/players/:id/activity

export interface PublicPlayerProfile extends Omit<Player, "notificationCount"> {
  activeSets: ItemSet[];
}

const mockProfiles: Record<string, PublicPlayerProfile> = {
  p_01: buildProfile({
    id: "p_01",
    username: "SBD_Supreme",
    avatarSeed: "supreme",
    level: 42,
    xp: 1200,
    xpToNext: 2000,
    reputation: 1000,
    raidCount: 1204,
    supporterRank: "Apex Fartboy",
    contributorRank: "Apex Fartboy",
    streak: 34,
  }),
  p_02: buildProfile({
    id: "p_02",
    username: "MethaneMike",
    avatarSeed: "mike",
    level: 39,
    xp: 400,
    xpToNext: 1800,
    reputation: 880,
    raidCount: 1102,
    supporterRank: "Whale Of A Whiff",
    contributorRank: "Whale Of A Whiff",
    streak: 21,
  }),
  p_03: buildProfile({
    id: "p_03",
    username: "SilentButDeadly",
    avatarSeed: "silent",
    level: 36,
    xp: 900,
    xpToNext: 1700,
    reputation: 750,
    raidCount: 998,
    supporterRank: "Dolphinately Gassy",
    contributorRank: "Dolphinately Gassy",
    streak: 14,
  }),
  p_04: buildProfile({
    id: "p_04",
    username: "GassyGoblin",
    avatarSeed: "fartboy",
    level: 27,
    xp: 890,
    xpToNext: 1500,
    reputation: 540,
    raidCount: 312,
    supporterRank: "Whale Of A Whiff",
    contributorRank: "Whale Of A Whiff",
    streak: 12,
  }),
  p_05: buildProfile({
    id: "p_05",
    username: "VaporBaron",
    avatarSeed: "vapor",
    level: 31,
    xp: 250,
    xpToNext: 1600,
    reputation: 680,
    raidCount: 812,
    supporterRank: "Reef Ripper",
    contributorRank: "Reef Ripper",
    streak: 8,
  }),
};

function buildProfile(opts: {
  id: string;
  username: string;
  avatarSeed: string;
  level: number;
  xp: number;
  xpToNext: number;
  reputation: number;
  raidCount: number;
  supporterRank: string;
  contributorRank: string;
  streak: number;
}): PublicPlayerProfile {
  const titles: Title[] = [
    {
      id: "t_stinker",
      name: "The Stinker",
      equipped: true,
      unlocked: true,
      description: "Legendary drop.",
    },
    {
      id: "t_rookie",
      name: "Rookie Raider",
      equipped: false,
      unlocked: true,
      description: "First raid.",
    },
    {
      id: "t_meme",
      name: "Meme Machine",
      equipped: false,
      unlocked: true,
      description: "50 memes.",
    },
    // locked titles intentionally omitted from public view — handled by consumers.
    {
      id: "t_terror",
      name: "Toilet Terror",
      equipped: false,
      unlocked: false,
      description: "Hidden.",
    },
  ];
  return {
    id: opts.id,
    username: opts.username,
    avatar: "/assets/avatar/base/fartboy-3d-raider.png",
    level: opts.level,
    xp: opts.xp,
    xpToNext: opts.xpToNext,
    reputation: opts.reputation,
    raidCount: opts.raidCount,
    equipped: {
      head: "s1_raid_specialist_head_epic",
      body: "s1_raid_specialist_body_rare",
      shorts: "s1_raid_specialist_shorts_uncommon",
      feet: "s1_raid_specialist_feet_common",
      back: "s1_raid_specialist_back_legendary",
      pet: "s1_raid_specialist_pet_epic",
      powerItem: "s1_raid_specialist_powerItem_rare",
    },
    contributorRank: opts.contributorRank,
    supporterRank: opts.supporterRank,
    achievements: ["ach_first_raid", "ach_meme_lord", "ach_streak_7"],
    titles,
    seasonProgress: {
      seasonId: "s2",
      seasonName: "Season 2: Toxic Bloom",
      currentTier: Math.min(50, Math.floor(opts.level / 2) + 5),
      totalTiers: 50,
      xpIntoTier: 500,
      xpPerTier: 1000,
      premium: false,
    },
    lifetimeStats: {
      raids: opts.raidCount,
      memes: Math.floor(opts.raidCount / 4),
      videos: Math.floor(opts.raidCount / 30),
      packsOpened: Math.floor(opts.raidCount / 8),
      itemsCollected: Math.floor(opts.raidCount / 5),
      legendaryItemsFound: Math.floor(opts.level / 6),
    },
    loginStreak: opts.streak,
    activeSets: [
      {
        name: "Raid Specialist Set",
        description: "Tactical gear for high-intensity community raids.",
        bonusDescription: "+15% Activity XP when full set is equipped.",
        requiredItemIds: [
          "s1_raid_specialist_head_common",
          "s1_raid_specialist_body_common",
          "s1_raid_specialist_shorts_common",
          "s1_raid_specialist_feet_common",
          "s1_raid_specialist_back_common",
          "s1_raid_specialist_pet_common",
          "s1_raid_specialist_powerItem_common",
        ],
        ownedItemIds: [
          "s1_raid_specialist_head_common",
          "s1_raid_specialist_body_common",
          "s1_raid_specialist_shorts_common",
          "s1_raid_specialist_feet_common",
        ],
        completed: false,
      },
    ],
  };
}

export async function getPlayerProfile(id: string): Promise<PublicPlayerProfile | undefined> {
  // TODO(backend): fetch from /api/players/:id
  return mockProfiles[id] ?? mockProfiles["p_04"];
}

export async function getPlayerEquipment(
  id: string,
): Promise<{ equipped: Partial<Record<EquipmentSlot, string>>; itemsById: Record<string, Item> }> {
  // TODO(backend): fetch equipped items from /api/players/:id/equipment
  const profile = await getPlayerProfile(id);
  const all = await getAllItems();
  const itemsById: Record<string, Item> = {};
  for (const it of all) itemsById[it.id] = it;
  return { equipped: profile?.equipped ?? {}, itemsById };
}

export async function getPlayerActivity(_id: string): Promise<ActivityEntry[]> {
  // TODO(backend): GET /api/players/:id/activity
  const now = Date.now();
  return [
    {
      id: "pa1",
      kind: "pack",
      title: "Opened Legendary Pack",
      detail: "Pulled Stinky Veil",
      icon: "🎁",
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
    },
    {
      id: "pa2",
      kind: "mission",
      title: "Completed Weekly Mission",
      detail: "5 raids in a week",
      icon: "🎯",
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "pa3",
      kind: "level",
      title: "Reached Level 18",
      detail: "Unlocked new title",
      icon: "⬆️",
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "pa4",
      kind: "item",
      title: "Completed Toilet Terror Set",
      detail: "Full 7-item collection",
      icon: "👑",
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "pa5",
      kind: "raid",
      title: "Joined Season 2",
      detail: "Toxic Bloom launched",
      icon: "🌸",
      createdAt: new Date(now - 1000 * 60 * 60 * 96).toISOString(),
    },
  ];
}
