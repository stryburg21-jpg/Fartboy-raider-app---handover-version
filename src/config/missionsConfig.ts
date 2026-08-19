export type MissionCategory =
  | "CTO" // CTO Ideation & Governance
  | "SNIPER" // Sniper Raids
  | "PERSONAL" // Personal Progression
  | "VIDEOS" // Video Creation
  | "MEMES" // Meme Production
  | "DISCORD" // Discord Community
  | "EXTERNAL" // External Projects
  | "GAME_FORGE" // Game & Forge Operations
  | "SOCIALS"; // Social Engagement

export type MissionType = "daily" | "weekly" | "seasonal" | "special";

export type MissionTrackingEvent =
  | "raid_verified"
  | "cto_snipe"
  | "pack_opened"
  | "item_dismantled"
  | "content_meme_approved"
  | "content_approved"
  | "discord_activity_played"
  | "forge_upgrade"
  | "set_equipped"
  | "full_set_equipped"
  | "catalogue_unlocked"
  | "viral_impression_reached"
  | "mythic_item_acquired"
  | "alliance_post_verified"
  | "cto_suggestion_submitted"
  | "personal_share_posted"
  | "asset_match_submitted"
  | "community_help_sent"
  | "chart_analysis_shared"
  | "external_boost_submitted"
  | "web_app_login"
  | "donation_contributed"
  | "affiliate_post_published"
  | "cto_asset_used"
  | "chat_messages_sent"
  | "chat_rank_reached";

export interface MissionBonusReward {
  packId?: string;
  packName?: string;
  titleId?: string;
  titleName?: string;
  badgeId?: string;
  badgeName?: string;
  xp?: number;
  description?: string;
}

export interface MissionConfig {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  category: MissionCategory;
  requirement: number;
  xpReward: number;
  trackingEvent: MissionTrackingEvent;
  resetPeriod: "daily" | "weekly" | "seasonal" | "none";
  completionLimit: number;
  artwork: string;
  discordChannel?: string;
  bonusReward?: MissionBonusReward;
}

export interface CompletionBonusConfig {
  id: string;
  type: "daily" | "weekly";
  title: string;
  description: string;
  requiredCount: number;
  xpReward: number;
  packId: string;
  packName: string;
  artwork: string;
}

// ============================================================================
// Full mission catalog, reconciled from docs/MISSIONS_AND_ACHIEVEMENTS.md
// (9 official categories) and the richer mockMissionsData.json pool that was
// previously only wired into the demo (automatedMissionsApi.ts) and never
// migrated into the live mission engine (services/missions.ts).
// ============================================================================

// --- DAILY MISSIONS POOL (14 total, 3 randomly active each 24h) ---
export const DAILY_MISSION_POOL: MissionConfig[] = [
  {
    id: "frontline_scout",
    type: "daily",
    title: "CTO Main Raid",
    description: "Like, comment, retweet, and save the pinned official post in #cto-official-post.",
    category: "CTO",
    requirement: 3,
    xpReward: 500,
    trackingEvent: "raid_verified",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "⚔️",
    discordChannel: "#cto-official-post",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "alliance_welcome",
    type: "daily",
    title: "Alliance Welcome",
    description: "Welcome new partner projects in alliance threads in #cto-alliances.",
    category: "CTO",
    requirement: 1,
    xpReward: 500,
    trackingEvent: "alliance_post_verified",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🤝",
    discordChannel: "#cto-alliances",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "cto_post_architect",
    type: "daily",
    title: "CTO Post Architect",
    description: "Submit a high-effort raid template or post idea in #cto-suggestions.",
    category: "CTO",
    requirement: 1,
    xpReward: 1000,
    trackingEvent: "cto_suggestion_submitted",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "📐",
    discordChannel: "#cto-suggestions",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "precision_strike",
    type: "daily",
    title: "Precision Strike",
    description:
      "Raid a high-priority partner target within 5 minutes of alert in #sniper-targets.",
    category: "SNIPER",
    requirement: 1,
    xpReward: 300,
    trackingEvent: "cto_snipe",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🎯",
    discordChannel: "#sniper-targets",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "grassroots_raid",
    type: "daily",
    title: "Grassroots Raid",
    description: "Post a personal X/TikTok link sharing $FARTBOY in #personal-shares.",
    category: "SOCIALS",
    requirement: 1,
    xpReward: 150,
    trackingEvent: "personal_share_posted",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "📣",
    discordChannel: "#personal-shares",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "loud_and_proud",
    type: "daily",
    title: "Content Creator",
    description: "Upload 1 original meme, GIF, or graphic in #content-creation.",
    category: "MEMES",
    requirement: 1,
    xpReward: 1000,
    trackingEvent: "content_meme_approved",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🎨",
    discordChannel: "#content-creation",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "cto_asset_matchmaker",
    type: "daily",
    title: "CTO Asset Matchmaker",
    description: "Match an existing meme template to a trending crypto narrative in #asset-match.",
    category: "MEMES",
    requirement: 1,
    xpReward: 1200,
    trackingEvent: "asset_match_submitted",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🧩",
    discordChannel: "#asset-match",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "community_ambassador",
    type: "daily",
    title: "Community Ambassador",
    description: "Send 10 positive messages helping new community members in #general-chat.",
    category: "DISCORD",
    requirement: 10,
    xpReward: 300,
    trackingEvent: "community_help_sent",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "💬",
    discordChannel: "#general-chat",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "chart_breakdown",
    type: "daily",
    title: "Chart Breakdown",
    description: "Share a technical analysis or bullish chart screenshot in #charts.",
    category: "DISCORD",
    requirement: 1,
    xpReward: 600,
    trackingEvent: "chart_analysis_shared",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "📈",
    discordChannel: "#charts",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "crypto_platform_daily_boost",
    type: "daily",
    title: "DexScreener Boost",
    description: "Cast DexScreener, CoinMarketCap, or CoinGecko rocket votes in #external-proof.",
    category: "EXTERNAL",
    requirement: 4,
    xpReward: 150,
    trackingEvent: "external_boost_submitted",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🚀",
    discordChannel: "#external-proof",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "shield_and_defend",
    type: "daily",
    title: "Shield & Defend",
    description: "Vote positive on CoinMarketCap/CoinGecko and share proof in #external-proof.",
    category: "EXTERNAL",
    requirement: 1,
    xpReward: 300,
    trackingEvent: "external_boost_submitted",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🛡️",
    discordChannel: "#external-proof",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "web_app_checkin",
    type: "daily",
    title: "Web App Check-In",
    description: "Log into the $FARTBOY Web App daily console and sync your profile.",
    category: "PERSONAL",
    requirement: 1,
    xpReward: 250,
    trackingEvent: "web_app_login",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "📲",
    discordChannel: "#app-game",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "forge_scrap_tuning",
    type: "daily",
    title: "Forge Scrap & Tuning",
    description: "Perform 1 Forge upgrade or scrap action in the Armory.",
    category: "GAME_FORGE",
    requirement: 1,
    xpReward: 500,
    trackingEvent: "forge_upgrade",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🔨",
    discordChannel: "#forge",
    bonusReward: {
      packId: "pack_raider",
      packName: "1x Raider Pack",
      description: "1x Raider Pack",
    },
  },
  {
    id: "war_chest_patron",
    type: "daily",
    title: "War Chest Patron",
    description: "Contribute SOL or $FARTBOY to the community marketing fund in #war-chest.",
    // NOTE: "War Chest" contributions aren't covered by any of the 9 official
    // categories in the design doc either — closest fit is Personal Progression.
    // Flag for design review if a dedicated category is wanted.
    category: "PERSONAL",
    requirement: 1,
    xpReward: 1000,
    trackingEvent: "donation_contributed",
    resetPeriod: "daily",
    completionLimit: 1,
    artwork: "🏦",
    discordChannel: "#war-chest",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
];

// --- DAILY COMPLETION BONUS ---
export const DAILY_COMPLETION_BONUS: CompletionBonusConfig = {
  id: "bonus_daily_completion",
  type: "daily",
  title: "Daily Raider Mastery",
  description: "Complete all 3 active daily missions.",
  requiredCount: 3,
  xpReward: 1000,
  packId: "pack_raider",
  packName: "1x Raider Pack",
  artwork: "🌟",
};

// --- WEEKLY MISSIONS POOL (7 total, 3 active objectives reset Mondays 00:00 UTC) ---
export const WEEKLY_MISSION_POOL: MissionConfig[] = [
  {
    id: "raid_master",
    type: "weekly",
    title: "CTO Vanguard",
    description: "Execute 25 verified raids across community targets in #cto-official-post.",
    category: "CTO",
    requirement: 25,
    xpReward: 3500,
    trackingEvent: "raid_verified",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "🔥",
    discordChannel: "#cto-official-post",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "affiliate_machine",
    type: "weekly",
    title: "Affiliate Machine",
    description: "Publish 2 dedicated off-platform articles or YouTube shorts.",
    category: "SOCIALS",
    requirement: 2,
    xpReward: 4500,
    trackingEvent: "affiliate_post_published",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "📡",
    discordChannel: "#personal-shares",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "cto_content_supplier",
    type: "weekly",
    title: "CTO Content Supplier",
    description: "Get 1 suggested asset officially used by the CTO lead account.",
    category: "MEMES",
    requirement: 1,
    xpReward: 6000,
    trackingEvent: "cto_asset_used",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "🖼️",
    discordChannel: "#content-creation",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "community_anchor",
    type: "weekly",
    title: "Community Anchor",
    description: "Send 70+ chat messages and share 2 TA breakdowns in #charts.",
    category: "DISCORD",
    requirement: 70,
    xpReward: 3000,
    trackingEvent: "chat_messages_sent",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "⚓",
    discordChannel: "#general-chat",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "external_trend_setter",
    type: "weekly",
    title: "External Trend Setter",
    description: "Log 10 DexScreener boosts and 5 CMC votes in 1 week.",
    category: "EXTERNAL",
    requirement: 10,
    xpReward: 4000,
    trackingEvent: "external_boost_submitted",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "📊",
    discordChannel: "#external-proof",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
  {
    id: "war_chest_guardian",
    type: "weekly",
    title: "War Chest Guardian",
    // Same category caveat as war_chest_patron above.
    category: "PERSONAL",
    description: "Contribute cumulatively to the community War Chest across the week.",
    requirement: 1,
    xpReward: 5000,
    trackingEvent: "donation_contributed",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "🏦",
    discordChannel: "#war-chest",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "master_blacksmith",
    type: "weekly",
    title: "Master Forge Crafter",
    description: "Perform 3 Forge upgrades in the Forge.",
    category: "GAME_FORGE",
    requirement: 3,
    xpReward: 4500,
    trackingEvent: "forge_upgrade",
    resetPeriod: "weekly",
    completionLimit: 1,
    artwork: "⚒️",
    discordChannel: "#forge",
    bonusReward: {
      packId: "pack_specialist",
      packName: "1x Specialist Pack",
      description: "1x Specialist Pack",
    },
  },
];

// --- WEEKLY COMPLETION BONUS ---
export const WEEKLY_COMPLETION_BONUS: CompletionBonusConfig = {
  id: "bonus_weekly_completion",
  type: "weekly",
  title: "Weekly Grand Campaign",
  description: "Complete all 3 active weekly campaigns.",
  requiredCount: 3,
  xpReward: 5000,
  packId: "pack_specialist",
  packName: "1x Specialist Pack",
  artwork: "🏆",
};

// --- SEASONAL MILESTONES (8 total, 90-Day Season 1, all active simultaneously) ---
export const SEASONAL_MILESTONES: MissionConfig[] = [
  {
    id: "warlord_of_the_stench",
    type: "seasonal",
    title: "Season Raid Commander",
    description: "Complete 150 total verified raids across community channels during Season 1.",
    category: "SOCIALS",
    requirement: 150,
    xpReward: 20000,
    trackingEvent: "raid_verified",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "👑",
    discordChannel: "#cto-official-post",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      titleId: "t_raid_warlord",
      titleName: "Raid Warlord",
      description: "1x Legendary Pack & Title: Raid Warlord",
    },
  },
  {
    id: "cto_media_mogul",
    type: "seasonal",
    title: "CTO Media Mogul",
    description: "Have 5 approved CTO assets used across Season 1.",
    category: "MEMES",
    requirement: 5,
    xpReward: 35000,
    trackingEvent: "cto_asset_used",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "🎬",
    discordChannel: "#content-creation",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "affiliate_empire_builder",
    type: "seasonal",
    title: "Affiliate Empire Builder",
    description: "Accumulate 10 verified affiliate posts across social channels.",
    category: "SOCIALS",
    requirement: 10,
    xpReward: 25000,
    trackingEvent: "affiliate_post_published",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "🌍",
    discordChannel: "#personal-shares",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "war_chest_titan",
    type: "seasonal",
    title: "War Chest Titan",
    description: "Rank among the Top 10 cumulative donors during Season 1.",
    category: "PERSONAL",
    requirement: 1,
    xpReward: 50000,
    trackingEvent: "donation_contributed",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "🏆",
    discordChannel: "#war-chest",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      titleId: "t_war_chest_titan",
      titleName: "War Chest Titan",
      description: "1x Legendary Pack & Title: War Chest Titan",
    },
  },
  {
    id: "ecosystem_pillar",
    type: "seasonal",
    title: "Ecosystem Pillar",
    description: "Reach Level 20 Chat Rank plus 45 App daily logins.",
    category: "DISCORD",
    requirement: 20,
    xpReward: 30000,
    trackingEvent: "chat_rank_reached",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "🏛️",
    discordChannel: "#general-chat",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "master_collector",
    type: "seasonal",
    title: "Master Collector",
    description: "Complete and equip 3 full gear sets in the Armory.",
    category: "GAME_FORGE",
    requirement: 3,
    xpReward: 35000,
    trackingEvent: "full_set_equipped",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "🛡️",
    discordChannel: "#app-game",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "vault_curator",
    type: "seasonal",
    title: "Vault Breaker",
    description: "Open 50 packs in the Store / Vault during Season 1.",
    category: "GAME_FORGE",
    requirement: 50,
    xpReward: 40000,
    trackingEvent: "pack_opened",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "📦",
    discordChannel: "#app-game",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
  {
    id: "mythic_forge_master",
    type: "seasonal",
    title: "Legendary Forge Master",
    description: "Perform 50 Forge actions (fusions/upgrades) during Season 1.",
    category: "GAME_FORGE",
    requirement: 50,
    xpReward: 30000,
    trackingEvent: "forge_upgrade",
    resetPeriod: "seasonal",
    completionLimit: 1,
    artwork: "⚡",
    discordChannel: "#forge",
    bonusReward: {
      packId: "pack_legendary_raider",
      packName: "1x Legendary Pack",
      description: "1x Legendary Pack",
    },
  },
];
