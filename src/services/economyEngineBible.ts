/**
 * Fartboy Raid 2.0 - Economy Design Bible v3.1 Specification Engine & Item Architecture
 *
 * Provides full statutory calculations, 84-item set map definitions,
 * level/rarity scaling matrices, and developer API contracts.
 */

import type { Rarity } from "@/types/game";

export type BibleSlot = "HAT" | "TOP" | "SHORTS" | "BOOTS" | "CAPE" | "PET" | "POWER";
export type BibleStatKey = "general_xp" | "raid_xp" | "cto_xp" | "mission_xp" | "meme_xp" | "luck";

export interface BibleStatDisplay {
  key: BibleStatKey;
  label: string;
  icon: string;
  value_pct: number;
  formatted: string;
}

export interface BibleItemStats {
  primary: BibleStatDisplay;
  secondaries: BibleStatDisplay[];
}

export interface BibleUpgradeCosts {
  next_level_cost_sp_xp: number;
  cumulative_spent_sp_xp: number;
}

export interface BibleItemJSON {
  item_id: string;
  base_name: string;
  set_id: string;
  slot: BibleSlot;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  level: number;
  max_level: number;
  is_equipped: boolean;
  reroll_quality_pct: number;
  upgrade_costs: BibleUpgradeCosts;
  stats: BibleItemStats;
}

export interface SetDefinitionBible {
  set_id: string;
  name: string;
  bonus_category: string;
  bonus_pct: number;
  description: string;
  target_stat_key: BibleStatKey;
}

export const SET_CATALOGUE_BIBLE: Record<string, SetDefinitionBible> = {
  set_raid: {
    set_id: "set_raid",
    name: "Raid Specialist",
    bonus_category: "Raid XP",
    bonus_pct: 15.0,
    description: "+15% Raid XP bonus when all 7 pieces are equipped.",
    target_stat_key: "raid_xp",
  },
  set_cto: {
    set_id: "set_cto",
    name: "CTO Specialist",
    bonus_category: "CTO XP",
    bonus_pct: 15.0,
    description: "+15% CTO XP bonus when all 7 pieces are equipped.",
    target_stat_key: "cto_xp",
  },
  set_meme: {
    set_id: "set_meme",
    name: "Meme Specialist",
    bonus_category: "Meme XP",
    bonus_pct: 15.0,
    description: "+15% Meme XP bonus when all 7 pieces are equipped.",
    target_stat_key: "meme_xp",
  },
  set_video: {
    set_id: "set_video",
    name: "Video Specialist",
    bonus_category: "Video XP",
    bonus_pct: 15.0,
    description: "+15% Video XP bonus when all 7 pieces are equipped.",
    target_stat_key: "meme_xp",
  },
  set_mission: {
    set_id: "set_mission",
    name: "Mission Specialist",
    bonus_category: "Mission Perk",
    bonus_pct: 0.0,
    description:
      "+1 Daily Mission Slot & 20% Mission Cooldown Reduction when all 7 pieces are equipped.",
    target_stat_key: "mission_xp",
  },
  set_season: {
    set_id: "set_season",
    name: "Season Specialist",
    bonus_category: "General XP",
    bonus_pct: 10.0,
    description: "+10% General XP bonus across all activities when all 7 pieces are equipped.",
    target_stat_key: "general_xp",
  },
};

export const STAT_META: Record<BibleStatKey, { label: string; icon: string }> = {
  general_xp: { label: "General XP", icon: "🚀" },
  raid_xp: { label: "Raid XP", icon: "⚔️" },
  cto_xp: { label: "CTO XP", icon: "💻" },
  mission_xp: { label: "Mission XP", icon: "🎯" },
  meme_xp: { label: "Meme & Graphic XP", icon: "🎨" },
  luck: { label: "Luck", icon: "🍀" },
};

/**
 * 84 BASE ITEMS CATALOGUE (6 Sets x 7 Slots x 2 Base Items per Slot)
 */
export interface BaseItemMetadata {
  item_id: string;
  base_name: string;
  set_id: string;
  slot: BibleSlot;
  primary_stat: BibleStatKey;
  secondary_stats_pool: BibleStatKey[];
}

export const BASE_84_ITEMS: BaseItemMetadata[] = [
  // --- SET 1: RAID SPECIALIST (set_raid) ---
  {
    item_id: "raid_hat_01",
    base_name: "Raid Helmet of the Frontline",
    set_id: "set_raid",
    slot: "HAT",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "raid_hat_02",
    base_name: "Tactical Raid Visor",
    set_id: "set_raid",
    slot: "HAT",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "luck", "mission_xp"],
  },
  {
    item_id: "raid_top_01",
    base_name: "Armored Raid Vest",
    set_id: "set_raid",
    slot: "TOP",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "cto_xp", "luck"],
  },
  {
    item_id: "raid_top_02",
    base_name: "Commando Tactical Hoodie",
    set_id: "set_raid",
    slot: "TOP",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "meme_xp", "luck"],
  },
  {
    item_id: "raid_shorts_01",
    base_name: "Combat Raid Cargo Shorts",
    set_id: "set_raid",
    slot: "SHORTS",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["mission_xp", "general_xp", "luck"],
  },
  {
    item_id: "raid_shorts_02",
    base_name: "Reinforced Raid Pants",
    set_id: "set_raid",
    slot: "SHORTS",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "cto_xp", "luck"],
  },
  {
    item_id: "raid_boots_01",
    base_name: "Heavy Assault Boots",
    set_id: "set_raid",
    slot: "BOOTS",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "raid_boots_02",
    base_name: "Stench-Runner Sneakers",
    set_id: "set_raid",
    slot: "BOOTS",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["luck", "general_xp", "meme_xp"],
  },
  {
    item_id: "raid_cape_01",
    base_name: "Tattered Raid Banner",
    set_id: "set_raid",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["raid_xp", "general_xp", "mission_xp"],
  },
  {
    item_id: "raid_cape_02",
    base_name: "Cloak of the Raid Captain",
    set_id: "set_raid",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["raid_xp", "general_xp", "cto_xp"],
  },
  {
    item_id: "raid_pet_01",
    base_name: "Attack Fart-Bot",
    set_id: "set_raid",
    slot: "PET",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["meme_xp", "luck", "general_xp"],
  },
  {
    item_id: "raid_pet_02",
    base_name: "War Carrier Pigeon",
    set_id: "set_raid",
    slot: "PET",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "raid_power_01",
    base_name: "Signal Amplifier Beacon",
    set_id: "set_raid",
    slot: "POWER",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "raid_power_02",
    base_name: "Overclocked Raid Transceiver",
    set_id: "set_raid",
    slot: "POWER",
    primary_stat: "raid_xp",
    secondary_stats_pool: ["general_xp", "luck", "meme_xp"],
  },

  // --- SET 2: CTO SPECIALIST (set_cto) ---
  {
    item_id: "cto_hat_01",
    base_name: "CTO Command Headset",
    set_id: "set_cto",
    slot: "HAT",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "cto_hat_02",
    base_name: "Chart-Sniffing Monocle",
    set_id: "set_cto",
    slot: "HAT",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "cto_top_01",
    base_name: "Beans & Balance Sheet Suit",
    set_id: "set_cto",
    slot: "TOP",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "cto_top_02",
    base_name: "Strategic Command Blazer",
    set_id: "set_cto",
    slot: "TOP",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "mission_xp", "luck"],
  },
  {
    item_id: "cto_shorts_01",
    base_name: "Formal CTO Trousers",
    set_id: "set_cto",
    slot: "SHORTS",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "luck", "mission_xp"],
  },
  {
    item_id: "cto_shorts_02",
    base_name: "Tactical Dev Chinos",
    set_id: "set_cto",
    slot: "SHORTS",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["mission_xp", "general_xp", "luck"],
  },
  {
    item_id: "cto_boots_01",
    base_name: "Polished Executive Shoes",
    set_id: "set_cto",
    slot: "BOOTS",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "cto_boots_02",
    base_name: "Cyber-Strider Boots",
    set_id: "set_cto",
    slot: "BOOTS",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "cto_cape_01",
    base_name: "Blockchain Tapestry",
    set_id: "set_cto",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["cto_xp", "general_xp", "raid_xp"],
  },
  {
    item_id: "cto_cape_02",
    base_name: "Network Protocol Cape",
    set_id: "set_cto",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["cto_xp", "general_xp", "mission_xp"],
  },
  {
    item_id: "cto_pet_01",
    base_name: "Autonomous Code Drone",
    set_id: "set_cto",
    slot: "PET",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["meme_xp", "luck", "general_xp"],
  },
  {
    item_id: "cto_pet_02",
    base_name: "Cyber-Chihuahua Companion",
    set_id: "set_cto",
    slot: "PET",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "cto_power_01",
    base_name: "Methane Terminal",
    set_id: "set_cto",
    slot: "POWER",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "cto_power_02",
    base_name: "High-Frequency Router",
    set_id: "set_cto",
    slot: "POWER",
    primary_stat: "cto_xp",
    secondary_stats_pool: ["general_xp", "luck", "mission_xp"],
  },

  // --- SET 3: MEME SPECIALIST (set_meme) ---
  {
    item_id: "meme_hat_01",
    base_name: "Jester Crown of Memes",
    set_id: "set_meme",
    slot: "HAT",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "meme_hat_02",
    base_name: "Pixel Art Bucket Hat",
    set_id: "set_meme",
    slot: "HAT",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "meme_top_01",
    base_name: "Shitposter Hoodie",
    set_id: "set_meme",
    slot: "TOP",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "meme_top_02",
    base_name: "Canvas-Print Sweater",
    set_id: "set_meme",
    slot: "TOP",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "meme_shorts_01",
    base_name: "Rainbow Gradient Shorts",
    set_id: "set_meme",
    slot: "SHORTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "mission_xp"],
  },
  {
    item_id: "meme_shorts_02",
    base_name: "Paint-Spattered Joggers",
    set_id: "set_meme",
    slot: "SHORTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["mission_xp", "general_xp", "luck"],
  },
  {
    item_id: "meme_boots_01",
    base_name: "Oversized Clown Kicks",
    set_id: "set_meme",
    slot: "BOOTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "meme_boots_02",
    base_name: "Light-Up Meme High-Tops",
    set_id: "set_meme",
    slot: "BOOTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "meme_cape_01",
    base_name: "Cape of Infinite GIF Loops",
    set_id: "set_meme",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["meme_xp", "general_xp", "raid_xp"],
  },
  {
    item_id: "meme_cape_02",
    base_name: "Viral Trend Mantle",
    set_id: "set_meme",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["meme_xp", "general_xp", "cto_xp"],
  },
  {
    item_id: "meme_pet_01",
    base_name: "Flying Pepe-Gecko",
    set_id: "set_meme",
    slot: "PET",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "meme_pet_02",
    base_name: "Sentient Meme Toad",
    set_id: "set_meme",
    slot: "PET",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "meme_power_01",
    base_name: "Golden Stylus Pen",
    set_id: "set_meme",
    slot: "POWER",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "meme_power_02",
    base_name: "Viral Content Generator",
    set_id: "set_meme",
    slot: "POWER",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },

  // --- SET 4: VIDEO SPECIALIST (set_video) ---
  {
    item_id: "video_hat_01",
    base_name: "Director's Beret",
    set_id: "set_video",
    slot: "HAT",
    primary_stat: "meme_xp", // Video shares Graphic & Video XP pool
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "video_hat_02",
    base_name: "Streamer Ring Light Cap",
    set_id: "set_video",
    slot: "HAT",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "video_top_01",
    base_name: "Production Crew Jacket",
    set_id: "set_video",
    slot: "TOP",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "video_top_02",
    base_name: "Green Screen Bodysuit Top",
    set_id: "set_video",
    slot: "TOP",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "video_shorts_01",
    base_name: "Cinematographer Cargo Shorts",
    set_id: "set_video",
    slot: "SHORTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["mission_xp", "general_xp", "luck"],
  },
  {
    item_id: "video_shorts_02",
    base_name: "Motion Capture Trousers",
    set_id: "set_video",
    slot: "SHORTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "video_boots_01",
    base_name: "Studio Production Boots",
    set_id: "set_video",
    slot: "BOOTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "mission_xp"],
  },
  {
    item_id: "video_boots_02",
    base_name: "High-Key LED Sneakers",
    set_id: "set_video",
    slot: "BOOTS",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "video_cape_01",
    base_name: "Velvet Red Carpet Cape",
    set_id: "set_video",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["meme_xp", "general_xp", "raid_xp"],
  },
  {
    item_id: "video_cape_02",
    base_name: "Film Strip Trail Cloak",
    set_id: "set_video",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["meme_xp", "general_xp", "cto_xp"],
  },
  {
    item_id: "video_pet_01",
    base_name: "Flying Camera Drone",
    set_id: "set_video",
    slot: "PET",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "cto_xp"],
  },
  {
    item_id: "video_pet_02",
    base_name: "Clapperboard Monkey",
    set_id: "set_video",
    slot: "PET",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "video_power_01",
    base_name: "4K Cinema Lens",
    set_id: "set_video",
    slot: "POWER",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "video_power_02",
    base_name: "Broadcast Transmitter Box",
    set_id: "set_video",
    slot: "POWER",
    primary_stat: "meme_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },

  // --- SET 5: MISSION SPECIALIST (set_mission) ---
  {
    item_id: "mission_hat_01",
    base_name: "Scout Patrol Cap",
    set_id: "set_mission",
    slot: "HAT",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "mission_hat_02",
    base_name: "Completionist Helmet",
    set_id: "set_mission",
    slot: "HAT",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["luck", "general_xp", "cto_xp"],
  },
  {
    item_id: "mission_top_01",
    base_name: "Field Agent Utility Vest",
    set_id: "set_mission",
    slot: "TOP",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "mission_top_02",
    base_name: "Daily Streak Windbreaker",
    set_id: "set_mission",
    slot: "TOP",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "meme_xp"],
  },
  {
    item_id: "mission_shorts_01",
    base_name: "Endurance Runner Shorts",
    set_id: "set_mission",
    slot: "SHORTS",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "mission_shorts_02",
    base_name: "Tactical Duty Pants",
    set_id: "set_mission",
    slot: "SHORTS",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "cto_xp"],
  },
  {
    item_id: "mission_boots_01",
    base_name: "Marathon Scout Boots",
    set_id: "set_mission",
    slot: "BOOTS",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "mission_boots_02",
    base_name: "Terrain Trailblazer Shoes",
    set_id: "set_mission",
    slot: "BOOTS",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["luck", "general_xp", "cto_xp"],
  },
  {
    item_id: "mission_cape_01",
    base_name: "Cloak of the Tracker",
    set_id: "set_mission",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["mission_xp", "general_xp", "raid_xp"],
  },
  {
    item_id: "mission_cape_02",
    base_name: "Merit Badge Tapestry",
    set_id: "set_mission",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["mission_xp", "general_xp", "cto_xp"],
  },
  {
    item_id: "mission_pet_01",
    base_name: "Loyal Recon Falcon",
    set_id: "set_mission",
    slot: "PET",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["luck", "general_xp", "raid_xp"],
  },
  {
    item_id: "mission_pet_02",
    base_name: "Objective-Seeking Hound",
    set_id: "set_mission",
    slot: "PET",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["luck", "general_xp", "cto_xp"],
  },
  {
    item_id: "mission_power_01",
    base_name: "Tactical Compass Device",
    set_id: "set_mission",
    slot: "POWER",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "raid_xp"],
  },
  {
    item_id: "mission_power_02",
    base_name: "Questmaster Tracker",
    set_id: "set_mission",
    slot: "POWER",
    primary_stat: "mission_xp",
    secondary_stats_pool: ["general_xp", "luck", "meme_xp"],
  },

  // --- SET 6: SEASON SPECIALIST (set_season) ---
  {
    item_id: "season_hat_01",
    base_name: "Crown of Eternal Stench",
    set_id: "set_season",
    slot: "HAT",
    primary_stat: "general_xp",
    secondary_stats_pool: ["raid_xp", "luck", "cto_xp"],
  },
  {
    item_id: "season_hat_02",
    base_name: "Veteran Raider Helmet",
    set_id: "set_season",
    slot: "HAT",
    primary_stat: "general_xp",
    secondary_stats_pool: ["mission_xp", "luck", "raid_xp"],
  },
  {
    item_id: "season_top_01",
    base_name: "Season 1 Champion Armor",
    set_id: "set_season",
    slot: "TOP",
    primary_stat: "general_xp",
    secondary_stats_pool: ["raid_xp", "cto_xp", "luck"],
  },
  {
    item_id: "season_top_02",
    base_name: "Prestige Leader Tunic",
    set_id: "set_season",
    slot: "TOP",
    primary_stat: "general_xp",
    secondary_stats_pool: ["meme_xp", "luck", "mission_xp"],
  },
  {
    item_id: "season_shorts_01",
    base_name: "Golden Season Greaves",
    set_id: "set_season",
    slot: "SHORTS",
    primary_stat: "general_xp",
    secondary_stats_pool: ["mission_xp", "luck", "raid_xp"],
  },
  {
    item_id: "season_shorts_02",
    base_name: "Eternal Fart Leggings",
    set_id: "set_season",
    slot: "SHORTS",
    primary_stat: "general_xp",
    secondary_stats_pool: ["cto_xp", "luck", "meme_xp"],
  },
  {
    item_id: "season_boots_01",
    base_name: "Tread of the Warlord",
    set_id: "set_season",
    slot: "BOOTS",
    primary_stat: "general_xp",
    secondary_stats_pool: ["luck", "raid_xp", "mission_xp"],
  },
  {
    item_id: "season_boots_02",
    base_name: "Seasoned Wanderer Boots",
    set_id: "set_season",
    slot: "BOOTS",
    primary_stat: "general_xp",
    secondary_stats_pool: ["luck", "cto_xp", "meme_xp"],
  },
  {
    item_id: "season_cape_01",
    base_name: "Mantle of Eternal Fart Legend",
    set_id: "set_season",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["general_xp", "raid_xp", "mission_xp"],
  },
  {
    item_id: "season_cape_02",
    base_name: "Season 1 Hero Banner",
    set_id: "set_season",
    slot: "CAPE",
    primary_stat: "luck",
    secondary_stats_pool: ["general_xp", "cto_xp", "meme_xp"],
  },
  {
    item_id: "season_pet_01",
    base_name: "Phoenix Fart-Sprite",
    set_id: "set_season",
    slot: "PET",
    primary_stat: "general_xp",
    secondary_stats_pool: ["luck", "meme_xp", "raid_xp"],
  },
  {
    item_id: "season_pet_02",
    base_name: "Golden Methane Dragon",
    set_id: "set_season",
    slot: "PET",
    primary_stat: "general_xp",
    secondary_stats_pool: ["luck", "cto_xp", "mission_xp"],
  },
  {
    item_id: "season_power_01",
    base_name: "Aura of Methane Annihilation",
    set_id: "set_season",
    slot: "POWER",
    primary_stat: "general_xp",
    secondary_stats_pool: ["raid_xp", "luck", "cto_xp"],
  },
  {
    item_id: "season_power_02",
    base_name: "Seasonal Orb of Destiny",
    set_id: "set_season",
    slot: "POWER",
    primary_stat: "general_xp",
    secondary_stats_pool: ["mission_xp", "luck", "meme_xp"],
  },
];

/**
 * PRIMARY STAT RANGE MATRIX
 * Defines base (Lvl 1) to max (Lvl 10) ranges and secondary stat slot count
 */
export interface RarityStatMatrixConfig {
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  lvl1_base: number;
  lvl3: number;
  lvl5_mid: number;
  lvl8: number;
  lvl10_max: number;
  secondary_slots: number;
}

export const STAT_RANGE_MATRIX: Record<string, RarityStatMatrixConfig> = {
  Common: {
    rarity: "Common",
    lvl1_base: 0.05,
    lvl3: 0.1,
    lvl5_mid: 0.15,
    lvl8: 0.22,
    lvl10_max: 0.3,
    secondary_slots: 0,
  },
  Uncommon: {
    rarity: "Uncommon",
    lvl1_base: 0.1,
    lvl3: 0.2,
    lvl5_mid: 0.3,
    lvl8: 0.42,
    lvl10_max: 0.5,
    secondary_slots: 1,
  },
  Rare: {
    rarity: "Rare",
    lvl1_base: 0.2,
    lvl3: 0.35,
    lvl5_mid: 0.5,
    lvl8: 0.68,
    lvl10_max: 0.8,
    secondary_slots: 1,
  },
  Epic: {
    rarity: "Epic",
    lvl1_base: 0.35,
    lvl3: 0.55,
    lvl5_mid: 0.75,
    lvl8: 0.95,
    lvl10_max: 1.1,
    secondary_slots: 2,
  },
  Legendary: {
    rarity: "Legendary",
    lvl1_base: 0.5,
    lvl3: 0.75,
    lvl5_mid: 1.0,
    lvl8: 1.25,
    lvl10_max: 1.4,
    secondary_slots: 2,
  },
  Mythic: {
    rarity: "Mythic",
    lvl1_base: 0.7,
    lvl3: 1.0,
    lvl5_mid: 1.3,
    lvl8: 1.6,
    lvl10_max: 1.8,
    secondary_slots: 3,
  },
};

/**
 * Calculates level upgrade costs for levels 1 to 10
 */
export function getLevelUpgradeCosts(level: number, rarity: string): BibleUpgradeCosts {
  if (level >= 10) {
    return {
      next_level_cost_sp_xp: 0,
      cumulative_spent_sp_xp: 447500,
    };
  }

  const baseCostPerLevel = [
    0, // 0 -> 1
    2500, // 1 -> 2
    5000, // 2 -> 3
    10000, // 3 -> 4
    20000, // 4 -> 5
    35000, // 5 -> 6
    50000, // 6 -> 7
    75000, // 7 -> 8
    100000, // 8 -> 9
    150000, // 9 -> 10
  ];

  let cumulative = 0;
  for (let i = 1; i <= level; i++) {
    cumulative += baseCostPerLevel[i] || 0;
  }

  const nextCost = baseCostPerLevel[level] || 0;

  return {
    next_level_cost_sp_xp: nextCost,
    cumulative_spent_sp_xp: cumulative,
  };
}

/**
 * EXACT LEVEL BASE STAT MATRIX (Levels 1 to 10)
 */
export const BASE_LEVEL_STAT_TABLE: Record<string, number[]> = {
  Common: [0.05, 0.07, 0.1, 0.12, 0.15, 0.17, 0.2, 0.22, 0.26, 0.3],
  Uncommon: [0.1, 0.15, 0.2, 0.25, 0.3, 0.34, 0.38, 0.42, 0.46, 0.5],
  Rare: [0.2, 0.23, 0.35, 0.42, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8],
  Epic: [0.35, 0.45, 0.55, 0.65, 0.75, 0.82, 0.88, 0.95, 1.02, 1.1],
  Legendary: [0.5, 0.62, 0.75, 0.88, 1.0, 1.08, 1.16, 1.25, 1.32, 1.4],
  Mythic: [0.7, 0.85, 1.0, 1.15, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8],
};

export function getBaseLevelStat(rarity: string, level: number): number {
  const norm = rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase() : "Common";
  const table = BASE_LEVEL_STAT_TABLE[norm] || BASE_LEVEL_STAT_TABLE.Common;
  const clampedLevel = Math.max(1, Math.min(10, level));
  return table[clampedLevel - 1];
}

/**
 * Calculates stat value for a given rarity, level (1-10), and reroll quality (0.80 to 1.00)
 * Formula: Final_Stat_Value = Base_Level_Stat * (0.80 + (0.20 * Quality_Roll_Pct))
 */
export function computeStatValue(
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | string,
  level: number,
  isSecondary: boolean,
  qualityPct = 0.95,
): number {
  const clampedQuality = Math.max(
    0.8,
    Math.min(1.0, qualityPct > 1 ? qualityPct / 100 : qualityPct),
  );
  const baseLevelStat = getBaseLevelStat(rarity, level);

  // Standard v3.2 Stat Reroll Formula:
  // Final_Stat_Value = Base_Level_Stat * (0.80 + (0.20 * Quality_Roll_Pct))
  const multiplier = 0.8 + 0.2 * clampedQuality;
  const primaryVal = baseLevelStat * multiplier;

  // Secondary stats follow 50% of the primary stat value
  const adjusted = isSecondary ? primaryVal * 0.5 : primaryVal;

  return Number(adjusted.toFixed(2));
}

/**
 * Universal ClampStatToMatrix method for all Modals, Toasts, and UI Cards
 * Enforces strict clamping of stats to the Rarity/Level matrix before rendering.
 */
export function ClampStatToMatrix(
  item:
    | {
        rarity?: string;
        level?: number;
        metadata?: Record<string, unknown>;
        stats?: Record<string, unknown>;
      }
    | null
    | undefined,
  stat?: BibleStatKey | { key?: BibleStatKey; isSecondary?: boolean; type?: string } | string,
  isSecondary = false,
): { value_pct: number; formatted: string } {
  if (!item) {
    return { value_pct: 0.05, formatted: "+0.05%" };
  }

  const rarity = item.rarity || "Common";
  const level = Math.max(1, Math.min(10, item.level ?? 1));

  const rawMeta = item.metadata as Record<string, unknown> | undefined;
  const rawStats = item.stats as Record<string, unknown> | undefined;
  const qualityRollRaw =
    (typeof rawMeta?.quality_roll_pct === "number" && rawMeta.quality_roll_pct) ||
    (typeof rawMeta?.reroll_quality_pct === "number" && rawMeta.reroll_quality_pct) ||
    (typeof rawStats?.qualityRoll === "number" && rawStats.qualityRoll) ||
    0.95;

  const qualityPct = Math.max(
    0.8,
    Math.min(1.0, qualityRollRaw > 1 ? qualityRollRaw / 100 : qualityRollRaw),
  );

  let secondaryFlag = isSecondary;
  if (typeof stat === "object" && stat !== null) {
    if (stat.isSecondary !== undefined) secondaryFlag = stat.isSecondary;
    else if (stat.type === "SECONDARY") secondaryFlag = true;
  }

  const val = computeStatValue(rarity, level, secondaryFlag, qualityPct);
  return {
    value_pct: val,
    formatted: `+${val.toFixed(2)}%`,
  };
}

/**
 * Generate standard compliant BibleItemJSON object
 */
export function generateBibleItem(
  baseItem: BaseItemMetadata,
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Mythic",
  level = 10,
  isEquipped = true,
  rerollQualityPct = 0.95,
): BibleItemJSON {
  const matrix = STAT_RANGE_MATRIX[rarity];
  const primaryVal = computeStatValue(rarity, level, false, rerollQualityPct);
  const primaryMeta = STAT_META[baseItem.primary_stat];

  const secondarySlotsCount = matrix.secondary_slots;
  const secondaries: BibleStatDisplay[] = [];

  for (let i = 0; i < secondarySlotsCount; i++) {
    const secKey = baseItem.secondary_stats_pool[i] || "luck";
    const secMeta = STAT_META[secKey];
    const secVal = computeStatValue(rarity, level, true, rerollQualityPct);
    secondaries.push({
      key: secKey,
      label: secMeta.label,
      icon: secMeta.icon,
      value_pct: secVal,
      formatted: `+${secVal.toFixed(2)}%`,
    });
  }

  const upgradeCosts = getLevelUpgradeCosts(level, rarity);

  return {
    item_id: baseItem.item_id,
    base_name: baseItem.base_name,
    set_id: baseItem.set_id,
    slot: baseItem.slot,
    rarity: rarity,
    level: level,
    max_level: 10,
    is_equipped: isEquipped,
    reroll_quality_pct: rerollQualityPct,
    upgrade_costs: upgradeCosts,
    stats: {
      primary: {
        key: baseItem.primary_stat,
        label: primaryMeta.label,
        icon: primaryMeta.icon,
        value_pct: primaryVal,
        formatted: `+${primaryVal.toFixed(2)}%`,
      },
      secondaries: secondaries,
    },
  };
}

/**
 * Generates the complete 84-item catalogue grouped by Sets and Slots
 */
export function generateComplete84Catalogue(): Record<string, Record<BibleSlot, BibleItemJSON[]>> {
  const catalogue: Record<string, Record<BibleSlot, BibleItemJSON[]>> = {};

  for (const baseItem of BASE_84_ITEMS) {
    if (!catalogue[baseItem.set_id]) {
      catalogue[baseItem.set_id] = {
        HAT: [],
        TOP: [],
        SHORTS: [],
        BOOTS: [],
        CAPE: [],
        PET: [],
        POWER: [],
      };
    }
    const itemObj = generateBibleItem(baseItem, "Legendary", 5, false, 0.9);
    catalogue[baseItem.set_id][baseItem.slot].push(itemObj);
  }

  return catalogue;
}

/**
 * Calculates total passive equipment cap & set bonus summary
 */
export function evaluateBibleLoadout(equippedItems: BibleItemJSON[]): {
  total_passive_equipment_xp: number;
  equipment_cap_limit: number;
  is_equipment_capped: boolean;
  active_set_bonuses: Array<{
    set_id: string;
    name: string;
    bonus_category: string;
    bonus_pct: number;
  }>;
  net_xp_boost_by_stat: Record<BibleStatKey, number>;
} {
  const statTotals: Record<BibleStatKey, number> = {
    general_xp: 0,
    raid_xp: 0,
    cto_xp: 0,
    mission_xp: 0,
    meme_xp: 0,
    luck: 0,
  };

  const setCount: Record<string, number> = {};

  for (const item of equippedItems) {
    if (!item.is_equipped) continue;

    // Add primary stat
    statTotals[item.stats.primary.key] += item.stats.primary.value_pct;

    // Add secondary stats
    for (const sec of item.stats.secondaries) {
      statTotals[sec.key] += sec.value_pct;
    }

    setCount[item.set_id] = (setCount[item.set_id] || 0) + 1;
  }

  // Sum total equipment passive XP bonus
  let totalRawEquipmentXP = 0;
  for (const key of Object.keys(statTotals) as BibleStatKey[]) {
    totalRawEquipmentXP += statTotals[key];
  }

  // Rule 1: Equipment Cap is strictly +10.0% max across all 7 slots
  const capLimit = 10.0;
  const isCapped = totalRawEquipmentXP > capLimit;
  const effectivePassiveXP = Math.min(capLimit, totalRawEquipmentXP);

  // Rule 2: Set Bonuses (7/7 pieces equipped)
  const activeSetBonuses: Array<{
    set_id: string;
    name: string;
    bonus_category: string;
    bonus_pct: number;
  }> = [];

  for (const [setId, count] of Object.entries(setCount)) {
    if (count >= 7 && SET_CATALOGUE_BIBLE[setId]) {
      const setDef = SET_CATALOGUE_BIBLE[setId];
      activeSetBonuses.push({
        set_id: setDef.set_id,
        name: setDef.name,
        bonus_category: setDef.bonus_category,
        bonus_pct: setDef.bonus_pct,
      });
      // Independent set bonus added directly to category
      statTotals[setDef.target_stat_key] += setDef.bonus_pct;
    }
  }

  return {
    total_passive_equipment_xp: Number(effectivePassiveXP.toFixed(2)),
    equipment_cap_limit: capLimit,
    is_equipment_capped: isCapped,
    active_set_bonuses: activeSetBonuses,
    net_xp_boost_by_stat: statTotals,
  };
}
