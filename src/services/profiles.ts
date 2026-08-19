import type { Achievement, Item, Mission, Pack, Player } from "@/types/game";
import type { RewardEntry } from "./rewards";
import {
  SEASON_1_CATALOG,
  SEASON_1_CATALOG_MAP,
  EXAMPLE_THEME_ITEM,
  THEME_FARTBOY_DEFAULT_ITEM,
  PET_DOG_EXAMPLE_ITEM,
  POWER_LIGHTNING_EXAMPLE_ITEM,
  FRAME_DRAGON_ITEM,
  FRAME_CYBER_ITEM,
  FRAME_GOLDEN_ITEM,
} from "@/config/masterCatalog";

export type ProfileId = "active" | "new" | "endgame" | "contributor";

export interface DemoProfile {
  id: ProfileId;
  name: string;
  badge: string;
  description: string;
  player: Player;
  inventory: Item[];
  packs: Pack[];
  missions: Mission[];
  achievements: Achievement[];
  rewards: RewardEntry[];
}

function createInventoryItem(canonicalId: string, instanceSuffix = "1", level = 1): Item {
  const base = SEASON_1_CATALOG_MAP[canonicalId] || SEASON_1_CATALOG[0];
  return {
    ...base,
    id: `${canonicalId}_${instanceSuffix}`,
    templateId: canonicalId,
    level,
  };
}

// Global active profile ID in memory
let activeProfileId: ProfileId = "active";

// Listeners for profile changes
type Listener = () => void;
const listeners: Listener[] = [];

export function subscribeToProfileChanges(fn: Listener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function getActiveProfileId(): ProfileId {
  return activeProfileId;
}

export function setActiveProfileId(id: ProfileId) {
  activeProfileId = id;
  notifyListeners();
}

// --- DEMO PROFILES DEFINITIONS ---

export const DEMO_PROFILES: Record<ProfileId, DemoProfile> = {
  active: {
    id: "active",
    name: "Active Raider",
    badge: "⚡ Mid-Game",
    description:
      "Level 27 raider with rich duplicate inventory for Forge fusion testing, active missions, and unopened packs.",
    player: {
      id: "player_active",
      username: "GassyGoblin",
      avatar: "/assets/avatar/base/fartboy-3d-raider.png",
      level: 27,
      lifetimeXP: 27890,
      spendableXP: 2890,
      xp: 2890,
      xpToNext: 1500,
      reputation: 620,
      raidCount: 312,
      equipped: {
        head: "s1_raid_specialist_head_epic_e1",
        body: "s1_raid_specialist_body_rare_r1",
        back: "s1_raid_specialist_back_legendary_l1",
        frame: FRAME_DRAGON_ITEM.id,
        cosmeticTheme: THEME_FARTBOY_DEFAULT_ITEM.id,
        pet: PET_DOG_EXAMPLE_ITEM.id,
        powerItem: POWER_LIGHTNING_EXAMPLE_ITEM.id,
      },
      // "Bubble Blaster" is a real recognized tier in CONTRIBUTOR_TIERS (config/contributor.ts) —
      // "Supporter" isn't, so it fell back to a generic unnamed badge instead of a proper
      // contributor tier display. This profile should read as a genuine Contributor.
      contributorRank: "Bubble Blaster",
      supporterRank: "Silver Raider",
      achievements: ["ach_first_raid", "ach_meme_lord", "ach_streak_7", "ach_vault_architect"],
      titles: [
        {
          id: "title_stinker",
          name: "The Stinker",
          equipped: true,
          unlocked: true,
          description: "Awarded for your first legendary drop.",
        },
        {
          id: "title_rookie",
          name: "Rookie Raider",
          equipped: false,
          unlocked: true,
          description: "Completed your first raid.",
        },
        {
          id: "title_meme_machine",
          name: "Meme Machine",
          equipped: false,
          unlocked: true,
          description: "Posted 50 memes.",
        },
      ],
      seasonProgress: {
        seasonId: "s2",
        seasonName: "Season 2: Toxic Bloom",
        currentTier: 18,
        totalTiers: 50,
        xpIntoTier: 640,
        xpPerTier: 1000,
        premium: false,
      },
      lifetimeStats: {
        raids: 312,
        memes: 87,
        videos: 12,
        packsOpened: 43,
        itemsCollected: 96,
        legendaryItemsFound: 4,
      },
      loginStreak: 12,
      notificationCount: 3,
      favoriteItemId: "s1_raid_specialist_back_legendary_l1",
      favoriteTitleId: "title_stinker",
      favoriteAchievementId: "ach_meme_lord",
    },
    inventory: [
      createInventoryItem("s1_meme_specialist_body_common", "c1"),
      createInventoryItem("s1_meme_specialist_body_common", "c2"),
      createInventoryItem("s1_meme_specialist_body_common", "c3"),

      createInventoryItem("s1_cto_specialist_feet_common", "c1"),
      createInventoryItem("s1_cto_specialist_feet_common", "c2"),

      createInventoryItem("s1_raid_specialist_shorts_uncommon", "u1"),
      createInventoryItem("s1_raid_specialist_shorts_uncommon", "u2"),
      createInventoryItem("s1_raid_specialist_shorts_uncommon", "u3"),

      createInventoryItem("s1_raid_specialist_body_rare", "r1", 2),
      createInventoryItem("s1_raid_specialist_body_rare", "r2"),
      createInventoryItem("s1_raid_specialist_body_rare", "r3"),

      createInventoryItem("s1_raid_specialist_head_epic", "e1", 3),
      createInventoryItem("s1_raid_specialist_head_epic", "e2"),
      createInventoryItem("s1_raid_specialist_head_epic", "e3"),

      createInventoryItem("s1_raid_specialist_back_legendary", "l1", 2),
      createInventoryItem("s1_raid_specialist_back_legendary", "l2"),

      createInventoryItem("s1_raid_specialist_feet_uncommon", "s1"),
      createInventoryItem("s1_raid_specialist_pet_epic", "s1"),
      createInventoryItem("s1_raid_specialist_powerItem_rare", "s1"),
      EXAMPLE_THEME_ITEM,
      THEME_FARTBOY_DEFAULT_ITEM,
      PET_DOG_EXAMPLE_ITEM,
      POWER_LIGHTNING_EXAMPLE_ITEM,
      FRAME_DRAGON_ITEM,
      FRAME_CYBER_ITEM,
      FRAME_GOLDEN_ITEM,
    ],
    packs: [
      {
        id: "pack_raider_1",
        configId: "pack_raider",
        name: "Raider Pack",
        rarity: "common",
        description: "Standard Season 1 supply pack for early-game progression.",
        image: "📦",
        contents: [],
      },
      {
        id: "pack_specialist_1",
        configId: "pack_specialist",
        name: "Specialist Pack",
        rarity: "epic",
        description: "Targeted set completion pack with +150% boost for missing set items.",
        image: "🎯",
        contents: [],
      },
      {
        id: "pack_legendary_1",
        configId: "pack_legendary_raider",
        name: "Legendary Pack",
        rarity: "legendary",
        description: "End-game chase pack with zero common drops and guaranteed Rare+ drops.",
        image: "👑",
        contents: [],
      },
    ],
    missions: [
      {
        id: "m_daily_raid",
        type: "daily",
        category: "daily",
        title: "Execute 5 Channel Raids",
        description: "Drop the raid message in five separate target channels today.",
        requirement: 5,
        progress: 3,
        reward: { description: "+150 XP & 15 Rep", reputation: 15 },
        artwork: "🚀",
        status: "in_progress",
        expiry: "Resets in 18h",
        completed: false,
      },
    ],
    achievements: [
      {
        id: "ach_first_raid",
        name: "First Whiff",
        description: "Complete your first raid in Fartboy Raid 2.0.",
        icon: "💨",
        unlocked: true,
        state: "completed",
        rarity: "common",
        category: "Raid",
        unlockedAt: new Date().toISOString(),
      },
    ],
    rewards: [],
  },

  new: {
    id: "new",
    name: "Rookie Raider",
    badge: "🌱 Level 1",
    description: "Brand new player with starter items and 1 unopened Raider Pack.",
    player: {
      id: "player_new",
      username: "NewbieStinker",
      avatar: "/assets/avatar/base/fartboy-3d-raider.png",
      level: 1,
      lifetimeXP: 180,
      spendableXP: 180,
      xp: 180,
      xpToNext: 500,
      reputation: 500,
      raidCount: 3,
      equipped: {
        head: "s1_meme_specialist_head_rare_new",
        body: "s1_meme_specialist_body_common_new",
        cosmeticTheme: THEME_FARTBOY_DEFAULT_ITEM.id,
      },
      contributorRank: "",
      supporterRank: "Unranked",
      achievements: ["ach_first_raid"],
      titles: [
        {
          id: "title_rookie",
          name: "Rookie Raider",
          equipped: true,
          unlocked: true,
          description: "Completed your first raid.",
        },
      ],
      seasonProgress: {
        seasonId: "s2",
        seasonName: "Season 2: Toxic Bloom",
        currentTier: 1,
        totalTiers: 50,
        xpIntoTier: 180,
        xpPerTier: 1000,
        premium: false,
      },
      lifetimeStats: {
        raids: 3,
        memes: 1,
        videos: 0,
        packsOpened: 1,
        itemsCollected: 4,
        legendaryItemsFound: 0,
      },
      loginStreak: 1,
      notificationCount: 1,
      favoriteItemId: "s1_meme_specialist_head_rare_new",
      favoriteTitleId: "title_rookie",
    },
    inventory: [
      createInventoryItem("s1_meme_specialist_head_rare", "new"),
      createInventoryItem("s1_meme_specialist_body_common", "new"),
      createInventoryItem("s1_cto_specialist_feet_common", "new"),
      createInventoryItem("s1_meme_specialist_shorts_uncommon", "new"),
      THEME_FARTBOY_DEFAULT_ITEM,
    ],
    packs: [
      {
        id: "pack_raider_new",
        configId: "pack_raider",
        name: "Raider Pack",
        rarity: "common",
        description: "Standard Season 1 supply pack for early-game progression.",
        image: "📦",
        contents: [],
      },
    ],
    missions: [
      {
        id: "m_first_raid",
        type: "daily",
        category: "daily",
        title: "Complete First Channel Raid",
        description: "Join your first Discord or X channel raid.",
        requirement: 1,
        progress: 0,
        reward: { description: "+100 XP & Rookie Badge" },
        artwork: "🚀",
        status: "in_progress",
        expiry: "Resets in 20h",
        completed: false,
      },
    ],
    achievements: [
      {
        id: "ach_first_raid",
        name: "First Whiff",
        description: "Complete your first raid in Fartboy Raid 2.0.",
        icon: "💨",
        unlocked: true,
        state: "completed",
        rarity: "common",
        category: "Raid",
        unlockedAt: new Date().toISOString(),
      },
    ],
    rewards: [],
  },

  endgame: {
    id: "endgame",
    name: "End Game Veteran",
    badge: "👑 Level 85",
    description:
      "Level 85 endgame player with full Mythic & Legendary gear, completed sets, max level items, and 18/20 achievements.",
    player: {
      id: "player_endgame",
      username: "OmegaRaidGod",
      avatar: "/assets/avatar/base/fartboy-3d-raider.png",
      level: 85,
      lifetimeXP: 185000,
      spendableXP: 18500,
      xp: 18500,
      xpToNext: 5000,
      reputation: 1000,
      raidCount: 1420,
      equipped: {
        head: "s1_raid_specialist_head_mythic_end",
        body: "s1_raid_specialist_body_mythic_end",
        shorts: "s1_raid_specialist_shorts_mythic_end",
        feet: "s1_raid_specialist_feet_mythic_end",
        back: "s1_raid_specialist_back_mythic_end",
        pet: "s1_raid_specialist_pet_mythic_end",
        powerItem: "s1_raid_specialist_powerItem_mythic_end",
        cosmeticTheme: THEME_FARTBOY_DEFAULT_ITEM.id,
      },
      contributorRank: "Gold Contributor",
      supporterRank: "Diamond Supporter",
      achievements: [
        "ach_first_raid",
        "ach_meme_lord",
        "ach_streak_7",
        "ach_vault_architect",
        "ach_sorcerer_supreme",
        "ach_streak_30",
        "ach_full_set",
        "ach_legendary_pull",
        "ach_raid_centurion",
        "ach_content_creator",
        "ach_mythic_paragon",
        "ach_toxic_alchemist",
      ],
      titles: [
        {
          id: "title_flatulence_king",
          name: "Flatulence King",
          equipped: true,
          unlocked: true,
          description: "Reach endgame completion of all 7-item specialist sets.",
        },
        {
          id: "title_mythic_archon",
          name: "Mythic Archon",
          equipped: false,
          unlocked: true,
          description: "Unearth 5 Mythic rarity gear pieces.",
        },
      ],
      seasonProgress: {
        seasonId: "s2",
        seasonName: "Season 2: Toxic Bloom",
        currentTier: 50,
        totalTiers: 50,
        xpIntoTier: 1000,
        xpPerTier: 1000,
        premium: true,
      },
      lifetimeStats: {
        raids: 1420,
        memes: 340,
        videos: 85,
        packsOpened: 210,
        itemsCollected: 310,
        legendaryItemsFound: 28,
      },
      loginStreak: 45,
      notificationCount: 5,
      favoriteItemId: "s1_raid_specialist_back_mythic_end",
      favoriteTitleId: "title_flatulence_king",
    },
    inventory: [
      createInventoryItem("s1_raid_specialist_head_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_body_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_shorts_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_feet_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_back_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_pet_mythic", "end", 5),
      createInventoryItem("s1_raid_specialist_powerItem_mythic", "end", 5),
      THEME_FARTBOY_DEFAULT_ITEM,
    ],
    packs: [
      {
        id: "pack_legendary_endgame1",
        configId: "pack_legendary_raider",
        name: "Legendary Pack",
        rarity: "legendary",
        description: "End-game chase pack with zero common drops and guaranteed Rare+ drops.",
        image: "💎",
        contents: [],
      },
      {
        id: "pack_legendary_endgame2",
        configId: "pack_specialist",
        name: "Specialist Pack",
        rarity: "epic",
        description: "Targeted set completion pack with +150% boost for missing set items.",
        image: "🎯",
        contents: [],
      },
    ],
    missions: [
      {
        id: "m_endgame_daily",
        type: "daily",
        category: "daily",
        title: "Execute 10 High Tier Raids",
        description: "Lead 10 raids in top priority channels.",
        requirement: 10,
        progress: 10,
        reward: { description: "+1,000 XP & 50 Rep" },
        artwork: "⚡",
        status: "completed",
        expiry: "Resets in 10h",
        completed: true,
      },
    ],
    achievements: [
      {
        id: "ach_mythic_paragon",
        name: "Mythic Paragon",
        description: "Unearth a Mythic rarity item from any specialized pack.",
        icon: "🌟",
        unlocked: true,
        state: "completed",
        rarity: "mythic",
        category: "Collection",
        unlockedAt: new Date().toISOString(),
      },
    ],
    rewards: [],
  },

  contributor: {
    id: "contributor",
    name: "Platinum Contributor",
    badge: "🏆 Contributor",
    description:
      "Platinum Contributor profile with high reputation, CTO specialist set, custom titles, and Contributor Vault access.",
    player: {
      id: "player_contributor",
      username: "CTO_Architect",
      avatar: "/assets/avatar/base/fartboy-3d-raider.png",
      level: 52,
      lifetimeXP: 78000,
      spendableXP: 9400,
      xp: 9400,
      xpToNext: 2500,
      reputation: 850,
      raidCount: 680,
      equipped: {
        head: "s1_cto_specialist_head_epic_c",
        body: "s1_cto_specialist_body_rare_c",
        shorts: "s1_cto_specialist_shorts_uncommon_c",
        feet: "s1_cto_specialist_feet_common_c",
        back: "s1_cto_specialist_back_rare_c",
        pet: "s1_cto_specialist_pet_uncommon_c",
        powerItem: "s1_cto_specialist_powerItem_epic_c",
        cosmeticTheme: THEME_FARTBOY_DEFAULT_ITEM.id,
      },
      contributorRank: "Platinum Contributor",
      supporterRank: "Platinum Contributor",
      achievements: [
        "ach_first_raid",
        "ach_meme_lord",
        "ach_streak_7",
        "ach_vault_architect",
        "ach_sorcerer_supreme",
      ],
      titles: [
        {
          id: "title_community_pillar",
          name: "Community Pillar",
          equipped: true,
          unlocked: true,
          description: "Recognized as a top Platinum Contributor in Discord.",
        },
        {
          id: "title_cto_architect",
          name: "CTO Architect",
          equipped: false,
          unlocked: true,
          description: "Led 50 community technical contributions.",
        },
      ],
      seasonProgress: {
        seasonId: "s2",
        seasonName: "Season 2: Toxic Bloom",
        currentTier: 35,
        totalTiers: 50,
        xpIntoTier: 850,
        xpPerTier: 1000,
        premium: true,
      },
      lifetimeStats: {
        raids: 680,
        memes: 120,
        videos: 40,
        packsOpened: 95,
        itemsCollected: 140,
        legendaryItemsFound: 12,
      },
      loginStreak: 30,
      notificationCount: 2,
      favoriteItemId: "s1_cto_specialist_back_rare_c",
      favoriteTitleId: "title_community_pillar",
    },
    inventory: [
      createInventoryItem("s1_cto_specialist_head_epic", "c", 3),
      createInventoryItem("s1_cto_specialist_body_rare", "c", 3),
      createInventoryItem("s1_cto_specialist_shorts_uncommon", "c", 2),
      createInventoryItem("s1_cto_specialist_feet_common", "c", 2),
      createInventoryItem("s1_cto_specialist_back_rare", "c", 4),
      createInventoryItem("s1_cto_specialist_pet_uncommon", "c", 3),
      createInventoryItem("s1_cto_specialist_powerItem_epic", "c", 3),
      THEME_FARTBOY_DEFAULT_ITEM,
    ],
    packs: [
      {
        id: "pack_contributor_c1",
        configId: "pack_legendary_raider",
        name: "Legendary Pack",
        rarity: "legendary",
        description: "End-game chase pack with zero common drops and guaranteed Rare+ drops.",
        image: "🏆",
        contents: [],
      },
    ],
    missions: [
      {
        id: "m_contributor_daily",
        type: "daily",
        category: "daily",
        title: "Review 3 Contributor Submissions",
        description: "Audit community raid submissions on Discord.",
        requirement: 3,
        progress: 2,
        reward: { description: "+300 XP & 30 Contributor Rep" },
        artwork: "📜",
        status: "in_progress",
        expiry: "Resets in 12h",
        completed: false,
      },
    ],
    achievements: [
      {
        id: "ach_sorcerer_supreme",
        name: "Methane Sorcerer",
        description: "Equip a full 7-piece Methane Sorcerer specialist set.",
        icon: "🧙‍♂️",
        unlocked: true,
        state: "completed",
        rarity: "legendary",
        category: "Specialist",
        unlockedAt: new Date().toISOString(),
      },
    ],
    rewards: [],
  },
};

export function getActiveProfileData(): DemoProfile {
  return DEMO_PROFILES[activeProfileId] || DEMO_PROFILES.active;
}

export function updateActiveProfileState(updatedPlayer?: Player, updatedInventory?: Item[]) {
  const pid = activeProfileId;
  const prof = DEMO_PROFILES[pid];
  if (prof) {
    if (updatedPlayer) {
      prof.player = { ...updatedPlayer };
    }
    if (updatedInventory) {
      prof.inventory = [...updatedInventory];
    }
    notifyListeners();
  }
}
