/**
 * Fartboy Raid 2.0 — Contributor Rank System Configuration
 *
 * Contributor Ranks recognize players who contribute to the community through
 * CTO Support Raids, Video Content Creation, Meme Creation, and Personal Raids.
 *
 * RULES:
 * - 100% Non-Pay-to-Win: Contributor rank offers ZERO combat or gameplay stat power advantages.
 * - Completely separate from Raider Level, Lifetime XP, and Specialist Sets.
 * - Earned purely through community participation & contribution.
 */

import { XP_ACTIVITIES } from "./xpConfig";

export interface ContributorTierInfo {
  tier: number;
  id?: string;
  name: string;
  badge: string; // Emoji badge
  colorClass: string;
  bgClass: string;
  borderClass: string;
  purpose: string;
}

export const UNRANKED_CONTRIBUTOR: ContributorTierInfo = {
  tier: 0,
  id: "unranked",
  name: "Unranked",
  badge: "⚪",
  colorClass: "text-muted-foreground",
  bgClass: "bg-surface-2",
  borderClass: "border-border",
  purpose: "No contributor rank earned yet",
};

export const CONTRIBUTOR_TIERS: ContributorTierInfo[] = [
  {
    tier: 1,
    id: "tiny_tooter",
    name: "Tiny Tooter",
    badge: "🔵",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/30",
    purpose: "Entry-level contributor recognition",
  },
  {
    tier: 2,
    id: "bubble_blaster",
    name: "Bubble Blaster",
    badge: "🟣",
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    purpose: "Regular supporter/contributor",
  },
  {
    tier: 3,
    id: "reef_ripper",
    name: "Reef Ripper",
    badge: "🟡",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    purpose: "Strong community contributor",
  },
  {
    tier: 4,
    id: "dolphinately_gassy",
    name: "Dolphinately Gassy",
    badge: "🔴",
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    purpose: "High-value contributor",
  },
  {
    tier: 5,
    id: "whale_of_a_whiff",
    name: "Whale Of A Whiff",
    badge: "⚫",
    colorClass: "text-zinc-300",
    bgClass: "bg-zinc-800/80",
    borderClass: "border-zinc-700",
    purpose: "Major supporter",
  },
  {
    tier: 6,
    id: "apex_fartboy",
    name: "Apex Fartboy",
    badge: "⚪",
    colorClass: "text-amber-300 font-extrabold",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-400/60",
    purpose: "Top-tier contributor",
  },
];

export interface ContributionCategory {
  id: string;
  title: string;
  icon: string;
  baseXp: number;
  valueTier: "Highest Value" | "High Value" | "Medium Value" | "Base Contribution";
  description: string;
  examples: string[];
}

export const CONTRIBUTION_CATEGORIES: ContributionCategory[] = [
  {
    id: "cto_raid",
    title: "CTO Raid",
    icon: "🚀",
    baseXp: XP_ACTIVITIES.cto_raid.baseXP,
    valueTier: "Highest Value",
    description: XP_ACTIVITIES.cto_raid.description,
    examples: ["Retweeting official CTO posts", "Amplifying major community milestones"],
  },
  {
    id: "personal_raid",
    title: "Personal Raid",
    icon: "📢",
    baseXp: XP_ACTIVITIES.social_raid_like_rt.baseXP,
    valueTier: "Base Contribution",
    description: XP_ACTIVITIES.social_raid_like_rt.description,
    examples: ["Completing daily raid targets", "Sharing posts & participating in Discord"],
  },
  {
    id: "video_content",
    title: "Video Content",
    icon: "🎥",
    baseXp: XP_ACTIVITIES.content_short_video.baseXP,
    valueTier: "High Value",
    description: XP_ACTIVITIES.content_short_video.description,
    examples: ["Fartboy lore & meme videos", "Raid highlights & recap edits"],
  },
  {
    id: "meme_creation",
    title: "Meme Creation",
    icon: "😂",
    baseXp: XP_ACTIVITIES.content_meme_graphic.baseXP,
    valueTier: "Medium Value",
    description: XP_ACTIVITIES.content_meme_graphic.description,
    examples: ["Original meme templates", "Community art & fan creations"],
  },
];

export function getContributorTierByName(rankName?: string): ContributorTierInfo {
  if (!rankName || rankName.trim() === "" || rankName.toLowerCase() === "unranked") {
    return UNRANKED_CONTRIBUTOR;
  }
  const found = CONTRIBUTOR_TIERS.find((t) => t.name.toLowerCase() === rankName.toLowerCase());
  return (
    found ||
    CONTRIBUTOR_TIERS.find((t) => t.name.includes(rankName)) || {
      tier: 0,
      id: "unranked",
      name: rankName,
      badge: "⚪",
      colorClass: "text-muted-foreground",
      bgClass: "bg-surface-2",
      borderClass: "border-border",
      purpose: "Community Contributor",
    }
  );
}

// Backend Handover Markers Documentation:
// TODO(backend): Contribution Score calculation engine
// TODO(backend): Contribution History audit log (CTO support, video submissions, meme uploads)
// TODO(backend): Dynamic Contributor Tier Calculation & Rank Decay/Upgrades
// TODO(backend): Monthly Contributor Pack Allocation (free cosmetic drops based on tier)
// TODO(backend): War Chest Tracking (Community chest allocations & supporter recognition)
