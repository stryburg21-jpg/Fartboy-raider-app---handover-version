import type { Achievement, MissionDossier } from "@/types/game";

export interface SeasonMasteryReward {
  xp: number;
  item?: string;
  title?: string;
  badge?: string;
}

export interface Season1MockDataset {
  seasonId: string;
  seasonName: string;
  durationDays: number;
  masteryRewards: {
    daily: SeasonMasteryReward;
    weekly: SeasonMasteryReward;
    seasonal: SeasonMasteryReward;
  };
  achievements: Array<{
    id: string;
    category: string;
    title: string;
    tier: string;
    targetValue: number;
    type: string;
    rewards: {
      xp: number;
      title?: string;
      badge?: string;
      packs?: Array<{ type: string; qty: number }>;
      materials?: Array<{ type: string; qty: number }>;
    };
  }>;
}

export const SEASON_1_DATASET: Season1MockDataset = {
  seasonId: "season_01",
  seasonName: "Season 1: Genesis Rising",
  durationDays: 90,
  masteryRewards: {
    daily: { xp: 1000, item: "PACK_RAIDER" },
    weekly: { xp: 5000, item: "PACK_SPECIALIST" },
    seasonal: { xp: 25000, item: "PACK_LEGENDARY", title: "Prestige Veteran" },
  },
  achievements: [
    {
      id: "ACH_001",
      category: "WAR_CHEST_RANKINGS",
      title: "Patron of the Empire",
      tier: "LEGENDARY",
      targetValue: 3,
      type: "DONATION_LEADERBOARD_RANK",
      rewards: {
        xp: 50000,
        title: "War Chest Titan",
        badge: "badge_gold_treasury",
        packs: [{ type: "LEGENDARY_PACK", qty: 3 }],
      },
    },
    {
      id: "ACH_002",
      category: "WAR_CHEST_RANKINGS",
      title: "Treasury Supporter",
      tier: "EPIC",
      targetValue: 1.0,
      type: "CUMULATIVE_DONATION_VAL",
      rewards: {
        xp: 15000,
        title: "Treasury Guardian",
        badge: "badge_silver_treasury",
        packs: [{ type: "SPECIALIST_PACK", qty: 2 }],
      },
    },
    {
      id: "ACH_003",
      category: "SET_COLLECTION",
      title: "Armored & Dangerous",
      tier: "LEGENDARY",
      targetValue: 5,
      type: "EQUIP_FULL_SET",
      rewards: {
        xp: 25000,
        title: "Set Master",
        badge: "badge_full_set_completion",
        packs: [{ type: "LEGENDARY_PACK", qty: 1 }],
      },
    },
    {
      id: "ACH_004",
      category: "FORGE_PROGRESSION",
      title: "Master Blacksmith",
      tier: "RARE",
      targetValue: 50,
      type: "FORGE_ACTIONS_COUNT",
      rewards: {
        xp: 10000,
        title: "Forge Lord",
        badge: "badge_forge_hammer",
        materials: [{ type: "FORGE_DUST", qty: 500 }],
      },
    },
    {
      id: "ACH_005",
      category: "PACK_OPENINGS",
      title: "Vault Breaker",
      tier: "EPIC",
      targetValue: 50,
      type: "PACKS_OPENED_COUNT",
      rewards: {
        xp: 20000,
        title: "Vault Breaker",
        badge: "badge_opened_chest",
        packs: [{ type: "SPECIALIST_PACK", qty: 3 }],
      },
    },
    {
      id: "ACH_006",
      category: "CTO_IDEATION",
      title: "Architect of the Meta",
      tier: "LEGENDARY",
      targetValue: 3,
      type: "CTO_BOUNTY_TRIGGERED_COUNT",
      rewards: {
        xp: 35000,
        title: "CTO Architect",
        badge: "badge_cto_crown",
        packs: [{ type: "LEGENDARY_PACK", qty: 2 }],
      },
    },
    {
      id: "ACH_007",
      category: "DISCORD_COMMUNITY",
      title: "Voice of the Vault",
      tier: "RARE",
      targetValue: 20,
      type: "DISCORD_LEVEL_AND_TA",
      rewards: {
        xp: 12000,
        title: "Chart Strategist",
        badge: "badge_candlestick_hero",
        packs: [{ type: "RAIDER_PACK", qty: 5 }],
      },
    },
    {
      id: "ACH_008",
      category: "RAID_OPERATIONS",
      title: "Vanguard Raid Commander",
      tier: "EPIC",
      targetValue: 100,
      type: "CUMULATIVE_RAIDS_COUNT",
      rewards: {
        xp: 20000,
        title: "Raid Commander",
        badge: "badge_crossed_swords",
        packs: [{ type: "SPECIALIST_PACK", qty: 2 }],
      },
    },
    {
      id: "ACH_009",
      category: "WEB_APP_DAILY",
      title: "Unwavering Loyalty",
      tier: "COMMON",
      targetValue: 30,
      type: "DAILY_LOGIN_COUNT",
      rewards: {
        xp: 7500,
        title: "Season Veteran",
        badge: "badge_calendar_star",
        packs: [{ type: "RAIDER_PACK", qty: 3 }],
      },
    },
    {
      id: "ACH_010",
      category: "EXTERNAL_VISIBILITY",
      title: "DexScreener Dominator",
      tier: "RARE",
      targetValue: 40,
      type: "EXTERNAL_BOOSTS_COUNT",
      rewards: {
        xp: 10000,
        title: "Trendsetter",
        badge: "badge_rocket_fire",
        packs: [{ type: "SPECIALIST_PACK", qty: 1 }],
      },
    },
  ],
};

/**
 * 9 Formal Mission Categories for Season 1
 */
export const NINE_MISSION_CATEGORIES = [
  {
    id: "cto_ideation",
    name: "CTO Ideation",
    code: "CTO",
    description: "Bounties, proposal submissions, governance ideation, and roadmap initiatives.",
    icon: "👑",
    discordChannel: "#cto-official-post",
  },
  {
    id: "sniper",
    name: "Sniper Raids",
    code: "SNIPER",
    description:
      "High-priority partner targets, rapid response raids, and targeted precision actions.",
    icon: "🎯",
    discordChannel: "#cto-snipe-targets",
  },
  {
    id: "personal",
    name: "Personal Progression",
    code: "PERSONAL",
    description: "Daily login streaks, player leveling milestones, and character HQ customization.",
    icon: "⚡",
    discordChannel: "#general-chat",
  },
  {
    id: "videos",
    name: "Video Creation",
    code: "VIDEOS",
    description: "TikToks, YouTube Shorts, X video clips, and high-production community content.",
    icon: "🎬",
    discordChannel: "#video-submissions",
  },
  {
    id: "memes",
    name: "Meme Production",
    code: "MEMES",
    description: "Original memes, graphics, GIF submissions, and viral social media assets.",
    icon: "🃏",
    discordChannel: "#memes-submission",
  },
  {
    id: "discord_community",
    name: "Discord Community",
    code: "DISCORD",
    description: "Chat activity, Technical Analysis (TA), voice attendance, and helper roles.",
    icon: "💬",
    discordChannel: "#general-chat",
  },
  {
    id: "external_projects",
    name: "External Projects",
    code: "EXTERNAL",
    description: "DexScreener rocket votes, CoinMarketCap & CoinGecko watchlists and boosts.",
    icon: "🚀",
    discordChannel: "#crypto-voting-boost",
  },
  {
    id: "game_forge",
    name: "Game & Forge Operations",
    code: "GAME_FORGE",
    description:
      "Forge level upgrades, rarity fusions, duplicate dismantling, pack openings, and set gear.",
    icon: "🔨",
    discordChannel: "#forge-showcase",
  },
  {
    id: "socials",
    name: "Social Engagement",
    code: "SOCIALS",
    description: "Verified X/Twitter raids, retweets, likes, bookmarking, and community comments.",
    icon: "⚔️",
    discordChannel: "#cto-official-post",
  },
] as const;

/**
 * Maps Season 1 raw achievements to the UI Achievement schema with rich icons, progress, and descriptions
 */
export function getSeason1MappedAchievements(
  userProgressMap?: Record<string, number>,
): Achievement[] {
  const defaultProgress: Record<
    string,
    { progress: number; unlocked: boolean; unlockedAt?: string }
  > = {
    ACH_001: { progress: 1, unlocked: false },
    ACH_002: { progress: 1.0, unlocked: true, unlockedAt: "2026-07-28T14:30:00Z" },
    ACH_003: { progress: 3, unlocked: false },
    ACH_004: { progress: 50, unlocked: true, unlockedAt: "2026-08-05T09:15:00Z" },
    ACH_005: { progress: 28, unlocked: false },
    ACH_006: { progress: 2, unlocked: false },
    ACH_007: { progress: 20, unlocked: true, unlockedAt: "2026-08-08T18:45:00Z" },
    ACH_008: { progress: 74, unlocked: false },
    ACH_009: { progress: 19, unlocked: false },
    ACH_010: { progress: 40, unlocked: true, unlockedAt: "2026-08-11T12:00:00Z" },
  };

  const iconMap: Record<string, string> = {
    ACH_001: "🏛️",
    ACH_002: "💰",
    ACH_003: "🛡️",
    ACH_004: "🔨",
    ACH_005: "📦",
    ACH_006: "👑",
    ACH_007: "📊",
    ACH_008: "⚔️",
    ACH_009: "📅",
    ACH_010: "🚀",
  };

  const descriptions: Record<string, string> = {
    ACH_001: "Reach Top 3 rank on the War Chest Donation Leaderboard during Season 1.",
    ACH_002: "Contribute a cumulative total of 1.0 SOL or equivalent value to the War Chest.",
    ACH_003: "Equip 5 complete full equipment sets across your raider loadouts.",
    ACH_004: "Execute 50 Forge operations (level upgrades, fusions, or stat rerolls).",
    ACH_005: "Unbox 50 gear vaults or supply packs in the Raider Vault.",
    ACH_006: "Trigger 3 successful CTO bounty raids or community ideation campaigns.",
    ACH_007: "Reach Discord Activity Level 20 and submit verified Technical Analysis.",
    ACH_008: "Execute 100 cumulative verified raids on X and partner channels.",
    ACH_009: "Log in to the Fartboy Web App for 30 distinct days during Season 1.",
    ACH_010: "Submit 40 external platform boosts on DexScreener, CMC, or CoinGecko.",
  };

  const achievementDossiers: Record<string, MissionDossier> = {
    ACH_001: {
      dossierNumber: "DOSSIER #ACH-01",
      dept: "DEPT OF WAR CHEST",
      title: "Patron of the Empire",
      targetChannel: "#war-chest-donations",
      externalUrl: "https://discord.com/channels/fartboy/war-chest",
      actionButtonText: "GO TO WAR CHEST (#war-chest-donations)",
      xpBounty: 50000,
      itemReward: "3x Legendary Packs",
      rarity: "LEGENDARY",
      brief: {
        step1: "Contribute to the Fartboy War Chest treasury during Season 1.",
        step2: "Achieve a Top 3 placement on the donor leaderboard.",
        step3:
          "Automated Treasury Bot will verify leaderboard rank and award +50,000 XP & 'War Chest Titan' title.",
      },
      verificationType: "AUTOMATED TREASURY BOT VERIFICATION",
      verificationNote: "Leaderboard rankings synced directly from blockchain transaction records.",
    },
    ACH_002: {
      dossierNumber: "DOSSIER #ACH-02",
      dept: "DEPT OF WAR CHEST",
      title: "Treasury Supporter",
      targetChannel: "#war-chest-donations",
      externalUrl: "https://discord.com/channels/fartboy/war-chest",
      actionButtonText: "DONATE SOL TO WAR CHEST",
      xpBounty: 15000,
      itemReward: "2x Specialist Packs",
      rarity: "EPIC",
      brief: {
        step1: "Send a total of 1.0+ SOL or equivalent token contribution to the War Chest.",
        step2: "Verify wallet signature or transaction hash in Discord.",
        step3: "Receive +15,000 XP, 'Treasury Guardian' title, and 2x Specialist Packs.",
      },
      verificationType: "AUTOMATED TREASURY BOT VERIFICATION",
      verificationNote: "On-chain transaction signatures are parsed and credited automatically.",
    },
    ACH_003: {
      dossierNumber: "DOSSIER #ACH-03",
      dept: "DEPT OF QUARTERMASTER",
      title: "Armored & Dangerous",
      targetChannel: "#armory-loadouts",
      externalUrl: "/armory",
      actionButtonText: "OPEN ARMORY LOADOUTS",
      xpBounty: 25000,
      itemReward: "1x Legendary Pack",
      rarity: "LEGENDARY",
      brief: {
        step1: "Collect gear items in the Raider Vault across all 5 equipment slots.",
        step2: "Equip a full matching 5-piece armor set on your active raider loadout.",
        step3: "System validates loadout synergy and grants +25,000 XP & 'Set Master' title.",
      },
      verificationType: "AUTOMATED ARMORY LOADOUT CHECK",
      verificationNote: "Armory equipment status is verified continuously upon equipment changes.",
    },
    ACH_004: {
      dossierNumber: "DOSSIER #ACH-04",
      dept: "DEPT OF FORGE",
      title: "Master Blacksmith",
      targetChannel: "#forge-crafting",
      externalUrl: "/forge",
      actionButtonText: "ENTER THE FORGE",
      xpBounty: 10000,
      itemReward: "500 Forge Dust",
      rarity: "RARE",
      brief: {
        step1: "Access the Forge section in the Fartboy Web App.",
        step2:
          "Perform 50 forge operations including item level upgrades, fusions, or stat rerolls.",
        step3:
          "Automated Forge Engine confirms 50 actions and awards +10,000 XP & 'Forge Lord' title.",
      },
      verificationType: "AUTOMATED FORGE ACTION COUNTER",
      verificationNote:
        "Forge transaction logs track every successful upgrade and fusion in real time.",
    },
    ACH_005: {
      dossierNumber: "DOSSIER #ACH-05",
      dept: "DEPT OF QUARTERMASTER",
      title: "Vault Breaker",
      targetChannel: "#store-vault",
      externalUrl: "/packs",
      actionButtonText: "OPEN RAIDER VAULT",
      xpBounty: 20000,
      itemReward: "3x Specialist Packs",
      rarity: "EPIC",
      brief: {
        step1: "Acquire supply packs and gear crates in the Raider Store.",
        step2: "Unbox and open 50 total supply packs or gear vaults during Season 1.",
        step3: "Receive +20,000 XP, 'Vault Breaker' title, and 3x Specialist Packs.",
      },
      verificationType: "AUTOMATED VAULT OPENING TRACKER",
      verificationNote: "Pack opening events are recorded in your account inventory history.",
    },
    ACH_006: {
      dossierNumber: "DOSSIER #ACH-06",
      dept: "DEPT OF CTO",
      title: "Architect of the Meta",
      targetChannel: "#cto-bounties",
      externalUrl: "https://discord.com/channels/fartboy/cto-bounties",
      actionButtonText: "VIEW CTO BOUNTIES (#cto-bounties)",
      xpBounty: 35000,
      itemReward: "2x Legendary Packs",
      rarity: "LEGENDARY",
      brief: {
        step1: "Submit CTO bounty proposals or community roadmap initiatives in #cto-bounties.",
        step2: "Get 3 CTO proposals approved and deployed by the core team.",
        step3: "Earn +35,000 XP, 'CTO Architect' title, and 2x Legendary Packs.",
      },
      verificationType: "CTO GOVERNANCE BOT VERIFICATION",
      verificationNote: "Verified upon official deployment confirmation in Discord CTO channels.",
    },
    ACH_007: {
      dossierNumber: "DOSSIER #ACH-07",
      dept: "DEPT OF INTELLIGENCE",
      title: "Voice of the Vault",
      targetChannel: "#general-chat-charts",
      externalUrl: "https://discord.com/channels/fartboy/charts",
      actionButtonText: "GO TO DISCORD (#charts)",
      xpBounty: 12000,
      itemReward: "5x Raider Packs",
      rarity: "RARE",
      brief: {
        step1: "Reach Discord Activity Level 20 through active community participation.",
        step2: "Post 5 Technical Analysis chart breakdowns in #charts.",
        step3:
          "Discord Bot verifies level and chart submissions to award +12,000 XP & 'Chart Strategist' title.",
      },
      verificationType: "AUTOMATED DISCORD LEVEL & BOT CHECK",
      verificationNote: "Discord XP level and chart post tags are checked hourly by the Bot.",
    },
    ACH_008: {
      dossierNumber: "DOSSIER #ACH-08",
      dept: "DEPT OF RAID",
      title: "Vanguard Raid Commander",
      targetChannel: "#raid-ops",
      externalUrl: "https://discord.com/channels/fartboy/raid-ops",
      actionButtonText: "GO TO DISCORD (#raid-ops)",
      xpBounty: 20000,
      itemReward: "2x Specialist Packs",
      rarity: "EPIC",
      brief: {
        step1: "Participate in official X raid posts announced in #raid-ops.",
        step2: "Accumulate 100 verified raid completions via Discord Raid Bot.",
        step3: "Earn +20,000 XP, 'Raid Commander' title, and 2x Specialist Packs.",
      },
      verificationType: "AUTOMATED RAID BOT VERIFICATION",
      verificationNote:
        "Raid count increments automatically whenever green ticks are logged by the bot.",
    },
    ACH_009: {
      dossierNumber: "DOSSIER #ACH-09",
      dept: "DEPT OF INTELLIGENCE",
      title: "Unwavering Loyalty",
      targetChannel: "#app-daily-logins",
      externalUrl: "/",
      actionButtonText: "CHECK-IN TO APP",
      xpBounty: 7500,
      itemReward: "3x Raider Packs",
      rarity: "COMMON",
      brief: {
        step1: "Log in to the Fartboy Web App regularly during Season 1.",
        step2: "Log in on 30 distinct calendar days during the season duration.",
        step3: "Receive +7,500 XP, 'Season Veteran' title, and 3x Raider Packs.",
      },
      verificationType: "AUTOMATED DAILY CHECK-IN TRACKER",
      verificationNote:
        "Daily login streaks and total active days are stored in user session profiles.",
    },
    ACH_010: {
      dossierNumber: "DOSSIER #ACH-10",
      dept: "DEPT OF EXTERNAL OPS",
      title: "DexScreener Dominator",
      targetChannel: "#external-proof",
      externalUrl: "https://dexscreener.com",
      actionButtonText: "SUBMIT EXTERNAL BOOST",
      xpBounty: 10000,
      itemReward: "1x Specialist Pack",
      rarity: "RARE",
      brief: {
        step1: "Execute external boosts or upvotes on DexScreener, CoinMarketCap, or CoinGecko.",
        step2: "Post proof screenshots in #external-proof or submit via verification link.",
        step3:
          "Bot validates 40 total external boosts and grants +10,000 XP & 'Trendsetter' title.",
      },
      verificationType: "AUTOMATED EXTERNAL PROOF BOT",
      verificationNote:
        "External platform API and screenshot verification bot validates boost entries.",
    },
  };

  return SEASON_1_DATASET.achievements.map((item) => {
    const override = defaultProgress[item.id] || { progress: 0, unlocked: false };
    const userProgress = userProgressMap?.[item.id] ?? override.progress;
    const isUnlocked = userProgress >= item.targetValue || override.unlocked;
    const rarity = item.tier.toLowerCase() as "common" | "rare" | "epic" | "legendary";
    const dossier = achievementDossiers[item.id];

    return {
      id: item.id,
      name: item.title,
      title: item.title,
      description:
        descriptions[item.id] || `Complete ${item.type} requirement of ${item.targetValue}.`,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? override.unlockedAt || new Date().toISOString() : undefined,
      icon: iconMap[item.id] || "🏆",
      rarity,
      tier: item.tier,
      category: item.category.replace(/_/g, " "),
      type: item.type,
      targetValue: item.targetValue,
      progress: userProgress,
      requirement: item.targetValue,
      state: isUnlocked ? "completed" : "locked",
      discordTag: item.rewards.title ? `@${item.rewards.title}` : undefined,
      reward: {
        xp: item.rewards.xp,
        title: item.rewards.title,
        badge: item.rewards.badge,
        discordTag: item.rewards.title ? `@${item.rewards.title}` : undefined,
        packs: item.rewards.packs,
        materials: item.rewards.materials,
      },
      rewards: {
        xp: item.rewards.xp,
        title: item.rewards.title,
        badge: item.rewards.badge,
        discordTag: item.rewards.title ? `@${item.rewards.title}` : undefined,
        packs: item.rewards.packs,
        materials: item.rewards.materials,
      },
      dossier,
      dossierNumber: dossier?.dossierNumber,
      dept: dossier?.dept,
      targetChannel: dossier?.targetChannel,
      externalUrl: dossier?.externalUrl,
      actionButtonText: dossier?.actionButtonText,
      xpBounty: dossier?.xpBounty,
      itemReward: dossier?.itemReward,
      brief: dossier?.brief,
      verificationType: dossier?.verificationType,
      verificationNote: dossier?.verificationNote,
    };
  });
}

export interface ActiveMissionsResponse {
  seasonId: string;
  seasonName: string;
  resets: {
    dailyUtcReset: string;
    weeklyUtcReset: string;
    nextDailyResetSeconds: number;
    nextWeeklyResetSeconds: number;
  };
  masteryStatus: {
    daily: {
      completedCount: number;
      totalRequired: number;
      isUnlocked: boolean;
      claimed: boolean;
      reward: { xp: number; item: string };
    };
    weekly: {
      completedCount: number;
      totalRequired: number;
      isUnlocked: boolean;
      claimed: boolean;
      reward: { xp: number; item: string };
    };
    seasonal: {
      completedCount: number;
      totalRequired: number;
      isUnlocked: boolean;
      claimed: boolean;
      reward: { xp: number; item: string; title: string };
    };
  };
  dailyMissions: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    requirement: number;
    progress: number;
    xpReward: number;
    status: "unstarted" | "in_progress" | "claimable" | "claimed";
    verificationType: string;
    discordChannel: string;
  }>;
  weeklyMissions: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    requirement: number;
    progress: number;
    xpReward: number;
    status: "unstarted" | "in_progress" | "claimable" | "claimed";
    verificationType: string;
    discordChannel: string;
  }>;
}

export function getMockActiveMissions(): ActiveMissionsResponse {
  const now = new Date();
  const tomorrowMidnightUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const nextDailyResetSeconds = Math.max(
    0,
    Math.floor((tomorrowMidnightUtc.getTime() - now.getTime()) / 1000),
  );

  const dayOfWeek = now.getUTCDay();
  const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
  const nextMondayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilNextMonday),
  );
  const nextWeeklyResetSeconds = Math.max(
    0,
    Math.floor((nextMondayUtc.getTime() - now.getTime()) / 1000),
  );

  return {
    seasonId: SEASON_1_DATASET.seasonId,
    seasonName: SEASON_1_DATASET.seasonName,
    resets: {
      dailyUtcReset: "00:00:00Z",
      weeklyUtcReset: "Monday 00:00:00Z",
      nextDailyResetSeconds,
      nextWeeklyResetSeconds,
    },
    masteryStatus: {
      daily: {
        completedCount: 3,
        totalRequired: 3,
        isUnlocked: true,
        claimed: false,
        reward: {
          xp: SEASON_1_DATASET.masteryRewards.daily.xp,
          item: SEASON_1_DATASET.masteryRewards.daily.item || "PACK_RAIDER",
        },
      },
      weekly: {
        completedCount: 2,
        totalRequired: 3,
        isUnlocked: false,
        claimed: false,
        reward: {
          xp: SEASON_1_DATASET.masteryRewards.weekly.xp,
          item: SEASON_1_DATASET.masteryRewards.weekly.item || "PACK_SPECIALIST",
        },
      },
      seasonal: {
        completedCount: 4,
        totalRequired: 10,
        isUnlocked: false,
        claimed: false,
        reward: {
          xp: SEASON_1_DATASET.masteryRewards.seasonal.xp,
          item: SEASON_1_DATASET.masteryRewards.seasonal.item || "PACK_LEGENDARY",
          title: SEASON_1_DATASET.masteryRewards.seasonal.title || "Prestige Veteran",
        },
      },
    },
    dailyMissions: [
      {
        id: "daily_001",
        title: "Frontline Scout",
        category: "SOCIALS",
        description:
          "Execute 3 verified raids on X/Twitter and react with green checkmarks in #cto-official-post.",
        requirement: 3,
        progress: 3,
        xpReward: 750,
        status: "claimable",
        verificationType: "DISCORD_EMOJI_CHECK",
        discordChannel: "#cto-official-post",
      },
      {
        id: "daily_002",
        title: "Sniper Duty",
        category: "SNIPER",
        description: "Execute 1 priority Sniper Raid on partner alerts in #cto-snipe-targets.",
        requirement: 1,
        progress: 1,
        xpReward: 500,
        status: "claimable",
        verificationType: "DISCORD_EMOJI_CHECK",
        discordChannel: "#cto-snipe-targets",
      },
      {
        id: "daily_003",
        title: "Loud & Proud",
        category: "MEMES",
        description: "Submit 1 original community meme or reaction graphic in #memes-submission.",
        requirement: 1,
        progress: 1,
        xpReward: 1000,
        status: "claimed",
        verificationType: "API_SYNC",
        discordChannel: "#memes-submission",
      },
    ],
    weeklyMissions: [
      {
        id: "weekly_001",
        title: "Raid Master Vanguard",
        category: "SOCIALS",
        description: "Execute 25 cumulative verified raids across all partner channels this week.",
        requirement: 25,
        progress: 25,
        xpReward: 5000,
        status: "claimable",
        verificationType: "DISCORD_EMOJI_CHECK",
        discordChannel: "#cto-official-post",
      },
      {
        id: "weekly_002",
        title: "Master Blacksmith",
        category: "GAME_FORGE",
        description: "Perform 3 Forge equipment level upgrades or rarity fusions.",
        requirement: 3,
        progress: 3,
        xpReward: 5000,
        status: "claimed",
        verificationType: "LOCAL_GAMEPLAY_SYNC",
        discordChannel: "#forge-showcase",
      },
      {
        id: "weekly_003",
        title: "DexScreener Vanguard",
        category: "EXTERNAL",
        description: "Submit 10 external rocket votes and watchlists on DexScreener.",
        requirement: 10,
        progress: 6,
        xpReward: 3500,
        status: "in_progress",
        verificationType: "DISCORD_BOT_HOOK",
        discordChannel: "#crypto-voting-boost",
      },
    ],
  };
}
