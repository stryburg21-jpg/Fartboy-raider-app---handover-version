import type { EquipmentSlot, Item } from "@/types/game";

export type XPActivityType =
  | "social_raid_like_rt"
  | "social_raid_comment"
  | "cto_raid"
  | "cto_snipe"
  | "suggested_cto_post"
  | "content_meme_graphic"
  | "content_short_video"
  | "crypto_platform_engagement"
  | "discord_messages"
  | "discord_gameplay_win"
  | "daily_mission"
  | "weekly_mission"
  | "seasonal_mission";

export type ActivityCategory = "raid" | "content" | "gameplay" | "mission";

export interface XPActivityConfig {
  type: XPActivityType;
  name: string;
  category: ActivityCategory;
  baseXP: number;
  cooldownSeconds: number;
  dailyLimit: number;
  maxDailyXP?: number;
  requiresModeration?: boolean;
  supportsQualityMultiplier?: boolean;
  exemptFromDecay?: boolean;
  description: string;
}

export const XP_ACTIVITIES: Record<XPActivityType, XPActivityConfig> = {
  social_raid_like_rt: {
    type: "social_raid_like_rt",
    name: "Personal Raid (Like + RT)",
    category: "raid",
    baseXP: 150,
    cooldownSeconds: 60,
    dailyLimit: 20,
    description: "Engage with official target posts by liking and retweeting.",
  },
  social_raid_comment: {
    type: "social_raid_comment",
    name: "Sniper Raid (Custom Comment)",
    category: "raid",
    baseXP: 300,
    cooldownSeconds: 180,
    dailyLimit: 10,
    description: "Post a high-value custom comment on active raid targets.",
  },
  cto_raid: {
    type: "cto_raid",
    name: "CTO Raid",
    category: "raid",
    baseXP: 500,
    cooldownSeconds: 180,
    dailyLimit: 10,
    description: "Participate in coordinated CTO raid target missions.",
  },
  cto_snipe: {
    type: "cto_snipe",
    name: "CTO Target Snipe",
    category: "raid",
    baseXP: 600,
    cooldownSeconds: 300,
    dailyLimit: 5,
    description: "High-priority target raid assigned by community leads.",
  },
  suggested_cto_post: {
    type: "suggested_cto_post",
    name: "Suggested CTO Post",
    category: "content",
    baseXP: 1500,
    cooldownSeconds: 600,
    dailyLimit: 1,
    requiresModeration: true,
    supportsQualityMultiplier: true,
    description: "Submit a high-impact suggested post for community CTO raids.",
  },
  content_meme_graphic: {
    type: "content_meme_graphic",
    name: "Approved Meme / Graphic",
    category: "content",
    baseXP: 2000,
    cooldownSeconds: 0,
    dailyLimit: 2,
    requiresModeration: true,
    supportsQualityMultiplier: true,
    description: "Create and publish viral memes or high-res artwork.",
  },
  content_short_video: {
    type: "content_short_video",
    name: "Approved Short Video / Reel",
    category: "content",
    baseXP: 5000,
    cooldownSeconds: 0,
    dailyLimit: 1,
    requiresModeration: true,
    supportsQualityMultiplier: true,
    description: "Produce short video clips, TikToks, or YouTube Reels.",
  },
  crypto_platform_engagement: {
    type: "crypto_platform_engagement",
    name: "Crypto Platform Engagement",
    category: "raid",
    baseXP: 100,
    cooldownSeconds: 30,
    dailyLimit: 4,
    maxDailyXP: 400,
    description: "Engage on DexScreener, CMC, CoinGecko, or GeckoTerminal.",
  },
  discord_messages: {
    type: "discord_messages",
    name: "Discord Messages",
    category: "gameplay",
    baseXP: 15,
    cooldownSeconds: 0,
    dailyLimit: 20,
    maxDailyXP: 300,
    description: "Positive Discord participation and community engagement.",
  },
  discord_gameplay_win: {
    type: "discord_gameplay_win",
    name: "Discord Match Win",
    category: "gameplay",
    baseXP: 250,
    cooldownSeconds: 0,
    dailyLimit: 10,
    maxDailyXP: 2500,
    description: "Win competitive games and mini-raids inside Discord.",
  },
  daily_mission: {
    type: "daily_mission",
    name: "Daily Mission Completion",
    category: "mission",
    baseXP: 500,
    cooldownSeconds: 0,
    dailyLimit: 10,
    supportsQualityMultiplier: false,
    exemptFromDecay: true,
    description:
      "Complete daily raider objectives (Flat Mission XP, exempt from multipliers & decay).",
  },
  weekly_mission: {
    type: "weekly_mission",
    name: "Weekly Mission Completion",
    category: "mission",
    baseXP: 1500,
    cooldownSeconds: 0,
    dailyLimit: 5,
    supportsQualityMultiplier: false,
    exemptFromDecay: true,
    description:
      "Complete weekly campaign challenges (Flat Mission XP, exempt from multipliers & decay).",
  },
  seasonal_mission: {
    type: "seasonal_mission",
    name: "Season 1 Milestone Completion",
    category: "mission",
    baseXP: 25000,
    cooldownSeconds: 0,
    dailyLimit: 10,
    supportsQualityMultiplier: false,
    exemptFromDecay: true,
    description:
      "Complete major Season 1 milestones (Flat Mission XP, exempt from multipliers & decay).",
  },
};

// --- QUALITY MULTIPLIER ENGINE ---
export type QualityTier = "standard" | "high_quality" | "masterpiece";

export interface QualityMultiplierConfig {
  tier: QualityTier;
  label: string;
  minMultiplier: number;
  maxMultiplier: number;
  defaultMultiplier: number;
  examples: string;
}

export const QUALITY_MULTIPLIERS: Record<QualityTier, QualityMultiplierConfig> = {
  standard: {
    tier: "standard",
    label: "Standard / Low",
    minMultiplier: 1.0,
    maxMultiplier: 1.2,
    defaultMultiplier: 1.0,
    examples: "Basic templates and quick edits",
  },
  high_quality: {
    tier: "high_quality",
    label: "High Quality",
    minMultiplier: 1.3,
    maxMultiplier: 1.8,
    defaultMultiplier: 1.5,
    examples: "Custom graphics, polished edits & original artwork",
  },
  masterpiece: {
    tier: "masterpiece",
    label: "Masterpiece",
    minMultiplier: 1.9,
    maxMultiplier: 2.5,
    defaultMultiplier: 2.0,
    examples: "Viral animations, high production value & premium content",
  },
};

// --- EQUIPMENT SET XP BONUSES ---
export interface SetBonusXPConfig {
  setName: string;
  bonusPercentage: number; // e.g. 0.15 for +15%
  applicableActivities: XPActivityType[];
  utilityBonus?: string;
  description: string;
}

export const EQUIPMENT_SET_XP_BONUSES: Record<string, SetBonusXPConfig> = {
  "Raid Specialist": {
    setName: "Raid Specialist",
    bonusPercentage: 0.15,
    applicableActivities: ["social_raid_like_rt", "social_raid_comment", "cto_raid", "cto_snipe"],
    description: "+15% XP on Raids & CTO Snipes",
  },
  "CTO Specialist": {
    setName: "CTO Specialist",
    bonusPercentage: 0.15,
    applicableActivities: ["cto_raid", "cto_snipe", "suggested_cto_post"],
    description: "+15% XP on CTO Raids, Snipes & Suggested Posts",
  },
  "Meme Specialist": {
    setName: "Meme Specialist",
    bonusPercentage: 0.15,
    applicableActivities: ["content_meme_graphic"],
    description: "+15% XP on Meme & Graphic submissions",
  },
  "Video Specialist": {
    setName: "Video Specialist",
    bonusPercentage: 0.15,
    applicableActivities: ["content_short_video"],
    description: "+15% XP on Video submissions",
  },
  "Mission Specialist": {
    setName: "Mission Specialist",
    bonusPercentage: 0.0, // Flat Mission XP enforced — non-XP utility perk
    applicableActivities: [],
    utilityBonus: "+1 Daily Mission Slot & 20% Mission Cooldown Reduction",
    description:
      "+1 Daily Mission Slot & 20% Mission Cooldown Reduction (Flat Mission XP enforced)",
  },
  "Season Specialist": {
    setName: "Season Specialist",
    bonusPercentage: 0.1,
    applicableActivities: [
      "social_raid_like_rt",
      "social_raid_comment",
      "cto_raid",
      "cto_snipe",
      "suggested_cto_post",
      "content_meme_graphic",
      "content_short_video",
      "crypto_platform_engagement",
      "discord_messages",
      "discord_gameplay_win",
    ],
    description: "+10% General XP across all social & gameplay activities (Missions excluded)",
  },
};

// --- DAILY XP DECAY SYSTEM (DIMINISHING RETURNS) ---
export interface XPDecayBracket {
  minXP: number;
  maxXP: number;
  multiplier: number;
  label: string;
  badge: string;
}

export const XP_DAILY_DECAY_BRACKETS: XPDecayBracket[] = [
  {
    minXP: 0,
    maxXP: 25000,
    multiplier: 1.0,
    label: "100% Efficiency",
    badge: "Full Gain (0 - 25,000 XP)",
  },
  {
    minXP: 25001,
    maxXP: 50000,
    multiplier: 0.75,
    label: "75% Efficiency",
    badge: "Diminishing (25,001 - 50,000 XP)",
  },
  {
    minXP: 50001,
    maxXP: 75000,
    multiplier: 0.5,
    label: "50% Efficiency",
    badge: "Half Rate (50,001 - 75,000 XP)",
  },
  {
    minXP: 75001,
    maxXP: 99999,
    multiplier: 0.25,
    label: "25% Efficiency",
    badge: "Low Rate (75,001 - 99,999 XP)",
  },
  {
    minXP: 100000,
    maxXP: Infinity,
    multiplier: 0.0,
    label: "0% Hard Cap",
    badge: "Daily Cap Reached (100,000+ XP)",
  },
];

export function getDailyDecayMultiplier(currentDailyXP: number): number {
  for (const bracket of XP_DAILY_DECAY_BRACKETS) {
    if (currentDailyXP >= bracket.minXP && currentDailyXP <= bracket.maxXP) {
      return bracket.multiplier;
    }
  }
  return currentDailyXP >= 100000 ? 0 : 1.0;
}
