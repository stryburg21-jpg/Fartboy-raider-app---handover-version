/**
 * Contributor Pass Service Layer — Backend API Ready
 *
 * All contribution calculations, rank thresholds, reward claims, and community totals
 * are fetched from the backend API.
 */

export interface ContributorRewardItem {
  id: string;
  name: string;
  icon: string;
  type: "title" | "pack" | "badge" | "perk";
  quantity?: number;
}

export interface ContributorRewardData {
  titleReward: string;
  packRewardName: string;
  packCount: number;
  perks: string[];
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  rewards: ContributorRewardItem[];
}

export interface ContributorRank {
  id: string;
  name: string;
  tier: number;
  icon: string;
  description: string;
  requiredAmount: number;
  unlocked: boolean;
  isCurrent: boolean;
  title: string;
  packRewards: string[];
  rewardData: ContributorRewardData;
}

export interface PlayerContributorProfile {
  playerId: string;
  currentContributionAmount: number; // e.g., $250 or 250 points
  currentRankId: string;
  currentRankTier: number;
  currentRankName: string;
  currentRankIcon: string;
  currentRankDescription: string;
  currentTitle: string;

  nextRankId?: string;
  nextRankTier?: number;
  nextRankName?: string;
  nextRankIcon?: string;
  nextRankDescription?: string;
  nextRankRequiredAmount?: number;
  nextTitle?: string;
  nextUnlockPreview?: string[];

  amountToNextRank?: number;
  progressPercent?: number;
}

export interface ContributorRewards {
  tier: number;
  rankName: string;
  rankIcon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  description: string;
  unlocked: boolean;
  isCurrent: boolean;
  rewards: ContributorRewardItem[];
}

export interface CommunityContribution {
  totalRaised: number;
  contributorCount: number;
  lastUpdated: string;
  supportingCause: string;
  recentMilestone: string;
  milestoneTarget: number;
}

export interface PlayerContributorProgress {
  playerId: string;
  isContributor: boolean;
  currentRankId: string;
  currentRankTier: number;
  currentRankName: string;
  currentRankIcon: string;
  currentRankDescription: string;
  progressPercent: number;

  nextRankName?: string;
  nextRankIcon?: string;
  nextUnlockPreview?: string[];

  seasonName: string;
  seasonGoalName: string;
  seasonLevel: number;
  maxSeasonLevel: number;
  seasonProgressPercent: number;
  seasonGoalRewardPreview: string;

  benefitsSummary: Array<{ title: string; icon: string }>;
}

/**
 * Service Contract: GET /api/player/contributor-progress
 * TODO(backend): Endpoint returning unified contributor tier & season goal progression.
 */
export async function getPlayerContributorProgress(
  playerId: string,
  playerTier?: string,
  playerLevel: number = 1,
): Promise<PlayerContributorProgress> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const isContributor = Boolean(playerTier && playerTier !== "free");

  const benefitsSummary = [
    { title: "Monthly Packs", icon: "📦" },
    { title: "Exclusive Cosmetics", icon: "🎨" },
    { title: "Prestige Titles", icon: "🏷️" },
    { title: "XP Multipliers", icon: "⚡" },
    { title: "Community Roles", icon: "👑" },
  ];

  if (!isContributor) {
    return {
      playerId,
      isContributor: false,
      currentRankId: "free",
      currentRankTier: 0,
      currentRankName: "Free Tier",
      currentRankIcon: "🛡️",
      currentRankDescription:
        "Join the Contributor Pass to support community infrastructure and unlock monthly rewards.",
      progressPercent: 0,
      seasonName: "Season 1: Rise of the Raider",
      seasonGoalName: "Season 1 Goal",
      seasonLevel: playerLevel,
      maxSeasonLevel: 50,
      seasonProgressPercent: Math.min(100, Math.round((playerLevel / 50) * 100)),
      seasonGoalRewardPreview:
        "Become a Contributor to start earning tier rewards and monthly vault pack drops.",
      benefitsSummary,
    };
  }

  return {
    playerId,
    isContributor: true,
    currentRankId: "bubble_blaster",
    currentRankTier: 2,
    currentRankName: "Bubble Blaster",
    currentRankIcon: "🟣",
    currentRankDescription: "Tier 2 Supporter — Active in Community Raids",
    progressPercent: 50,
    nextRankName: "Reef Ripper",
    nextRankIcon: "🟡",
    nextUnlockPreview: [
      "Reef Ripper Unique Title 🟡",
      "2x Free Rare Supporter Packs",
      "Specialist Set XP Boost +10%",
    ],
    seasonName: "Season 1: Rise of the Raider",
    seasonGoalName: "Season 1 Contributor Goal",
    seasonLevel: playerLevel,
    maxSeasonLevel: 50,
    seasonProgressPercent: Math.min(100, Math.round((playerLevel / 50) * 100)),
    seasonGoalRewardPreview:
      "Exclusive Season 1 Raider Emblem, Prestige Title & Monthly Pack Allocation",
    benefitsSummary,
  };
}

// TODO(backend): GET /api/contributor/profile?playerId={id}
export async function getPlayerContributorProfile(
  playerId: string,
  playerRankName?: string,
): Promise<PlayerContributorProfile> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Determine current rank based on provided player state or mock default
  const rank = playerRankName || "Bubble Blaster";

  if (rank.toLowerCase().includes("apex") || rank.toLowerCase().includes("fartboy")) {
    return {
      playerId,
      currentContributionAmount: 5000,
      currentRankId: "apex_fartboy",
      currentRankTier: 6,
      currentRankName: "Apex Fartboy",
      currentRankIcon: "⚪",
      currentRankDescription: "Top-tier contributor",
      currentTitle: "Apex Fartboy",
      amountToNextRank: 0,
      progressPercent: 100,
    };
  }

  if (rank.toLowerCase().includes("whale")) {
    return {
      playerId,
      currentContributionAmount: 2200,
      currentRankId: "whale_of_a_whiff",
      currentRankTier: 5,
      currentRankName: "Whale Of A Whiff",
      currentRankIcon: "⚫",
      currentRankDescription: "Major supporter",
      currentTitle: "Whale Of A Whiff",
      nextRankId: "apex_fartboy",
      nextRankTier: 6,
      nextRankName: "Apex Fartboy",
      nextRankIcon: "⚪",
      nextRankDescription: "Top-tier contributor",
      nextRankRequiredAmount: 5000,
      nextTitle: "Apex Fartboy",
      nextUnlockPreview: [
        "Apex Contributor Title 👑",
        "5x Mythic Supporter Packs",
        "Hall of Fame Discord Role",
        "Custom Animated Avatar Frame",
      ],
      amountToNextRank: 2800,
      progressPercent: 44,
    };
  }

  if (rank.toLowerCase().includes("dolphinately")) {
    return {
      playerId,
      currentContributionAmount: 1100,
      currentRankId: "dolphinately_gassy",
      currentRankTier: 4,
      currentRankName: "Dolphinately Gassy",
      currentRankIcon: "🔴",
      currentRankDescription: "High-value contributor",
      currentTitle: "Dolphinately Gassy",
      nextRankId: "whale_of_a_whiff",
      nextRankTier: 5,
      nextRankName: "Whale Of A Whiff",
      nextRankIcon: "⚫",
      nextRankDescription: "Major supporter",
      nextRankRequiredAmount: 2500,
      nextTitle: "Whale Of A Whiff",
      nextUnlockPreview: [
        "Whale Contributor Title 🔴",
        "3x Legendary Supporter Packs",
        "Exclusive Discord Supporter Rank",
      ],
      amountToNextRank: 1400,
      progressPercent: 44,
    };
  }

  if (rank.toLowerCase().includes("reef")) {
    return {
      playerId,
      currentContributionAmount: 600,
      currentRankId: "reef_ripper",
      currentRankTier: 3,
      currentRankName: "Reef Ripper",
      currentRankIcon: "🟡",
      currentRankDescription: "Strong community contributor",
      currentTitle: "Reef Ripper",
      nextRankId: "dolphinately_gassy",
      nextRankTier: 4,
      nextRankName: "Dolphinately Gassy",
      nextRankIcon: "🔴",
      nextRankDescription: "High-value contributor",
      nextRankRequiredAmount: 1000,
      nextTitle: "Dolphinately Gassy",
      nextUnlockPreview: [
        "Dolphinately Gassy Title 🔴",
        "2x Epic Supporter Packs",
        "CTO Contributor Discord Badge",
      ],
      amountToNextRank: 400,
      progressPercent: 60,
    };
  }

  // Default to Tier 2: Bubble Blaster
  return {
    playerId,
    currentContributionAmount: 250,
    currentRankId: "bubble_blaster",
    currentRankTier: 2,
    currentRankName: "Bubble Blaster",
    currentRankIcon: "🟣",
    currentRankDescription: "Regular supporter/contributor",
    currentTitle: "Bubble Blaster",
    nextRankId: "reef_ripper",
    nextRankTier: 3,
    nextRankName: "Reef Ripper",
    nextRankIcon: "🟡",
    nextRankDescription: "Strong community contributor",
    nextRankRequiredAmount: 500,
    nextTitle: "Reef Ripper",
    nextUnlockPreview: [
      "Reef Ripper Unique Title 🟡",
      "2x Free Rare Supporter Packs",
      "Contributor Pass Tier 3 Status",
      "Exclusive Discord Supporter Role",
    ],
    amountToNextRank: 250,
    progressPercent: 50,
  };
}

// TODO(backend): GET /api/contributor/ladder
export async function getContributorRankLadder(
  currentRankTier: number = 2,
): Promise<ContributorRank[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return [
    {
      id: "tiny_tooter",
      name: "Tiny Tooter",
      tier: 1,
      icon: "🔵",
      description: "Entry-level contributor recognition",
      requiredAmount: 50,
      unlocked: currentRankTier >= 1,
      isCurrent: currentRankTier === 1,
      title: "Tiny Tooter",
      packRewards: ["1x Starter Supporter Pack"],
      rewardData: {
        titleReward: "Tiny Tooter Title 🔵",
        packRewardName: "Starter Supporter Pack",
        packCount: 1,
        perks: ["Contributor Pass Access", "Community Supporter Role"],
        rarity: "common",
        rewards: [
          { id: "r1_title", name: "Tiny Tooter Title", icon: "🏷️", type: "title" },
          { id: "r1_pack", name: "Starter Supporter Pack", icon: "📦", type: "pack", quantity: 1 },
          { id: "r1_badge", name: "Tiny Tooter Badge", icon: "🔵", type: "badge" },
        ],
      },
    },
    {
      id: "bubble_blaster",
      name: "Bubble Blaster",
      tier: 2,
      icon: "🟣",
      description: "Regular supporter/contributor",
      requiredAmount: 250,
      unlocked: currentRankTier >= 2,
      isCurrent: currentRankTier === 2,
      title: "Bubble Blaster",
      packRewards: ["1x Rare Supporter Pack"],
      rewardData: {
        titleReward: "Bubble Blaster Title 🟣",
        packRewardName: "Rare Supporter Pack",
        packCount: 1,
        perks: ["Specialist Set XP Boost +5%", "Bubble Blaster Discord Role"],
        rarity: "uncommon",
        rewards: [
          { id: "r2_title", name: "Bubble Blaster Title", icon: "🏷️", type: "title" },
          { id: "r2_pack", name: "Rare Supporter Pack", icon: "🎁", type: "pack", quantity: 1 },
          { id: "r2_perk", name: "+5% XP Multiplier", icon: "⚡", type: "perk" },
        ],
      },
    },
    {
      id: "reef_ripper",
      name: "Reef Ripper",
      tier: 3,
      icon: "🟡",
      description: "Strong community contributor",
      requiredAmount: 500,
      unlocked: currentRankTier >= 3,
      isCurrent: currentRankTier === 3,
      title: "Reef Ripper",
      packRewards: ["2x Rare Supporter Packs"],
      rewardData: {
        titleReward: "Reef Ripper Title 🟡",
        packRewardName: "Rare Supporter Pack",
        packCount: 2,
        perks: ["Reef Ripper Unique Title", "Free Pack Allocation", "Future Exclusive Rewards"],
        rarity: "rare",
        rewards: [
          { id: "r3_title", name: "Reef Ripper Title", icon: "🏷️", type: "title" },
          { id: "r3_pack", name: "Rare Supporter Packs", icon: "🎁", type: "pack", quantity: 2 },
          { id: "r3_badge", name: "Reef Ripper Badge", icon: "🟡", type: "badge" },
        ],
      },
    },
    {
      id: "dolphinately_gassy",
      name: "Dolphinately Gassy",
      tier: 4,
      icon: "🔴",
      description: "High-value contributor",
      requiredAmount: 1000,
      unlocked: currentRankTier >= 4,
      isCurrent: currentRankTier === 4,
      title: "Dolphinately Gassy",
      packRewards: ["2x Epic Supporter Packs"],
      rewardData: {
        titleReward: "Dolphinately Gassy Title 🔴",
        packRewardName: "Epic Supporter Pack",
        packCount: 2,
        perks: [
          "High-Value Supporter Status",
          "Exclusive Discord Channel Access",
          "Vault Pack Drop Luck +10%",
        ],
        rarity: "epic",
        rewards: [
          { id: "r4_title", name: "Dolphinately Gassy Title", icon: "🏷️", type: "title" },
          { id: "r4_pack", name: "Epic Supporter Packs", icon: "✨", type: "pack", quantity: 2 },
          { id: "r4_perk", name: "+10% Rare Pack Luck", icon: "🍀", type: "perk" },
        ],
      },
    },
    {
      id: "whale_of_a_whiff",
      name: "Whale Of A Whiff",
      tier: 5,
      icon: "⚫",
      description: "Major supporter",
      requiredAmount: 2500,
      unlocked: currentRankTier >= 5,
      isCurrent: currentRankTier === 5,
      title: "Whale Of A Whiff",
      packRewards: ["3x Legendary Supporter Packs"],
      rewardData: {
        titleReward: "Whale Of A Whiff Title ⚫",
        packRewardName: "Legendary Supporter Pack",
        packCount: 3,
        perks: [
          "Major Supporter Recognition",
          "Custom Profile Glow Effect",
          "Priority CTO Raid Rewards",
        ],
        rarity: "legendary",
        rewards: [
          { id: "r5_title", name: "Whale Of A Whiff Title", icon: "👑", type: "title" },
          {
            id: "r5_pack",
            name: "Legendary Supporter Packs",
            icon: "💎",
            type: "pack",
            quantity: 3,
          },
          { id: "r5_perk", name: "Golden Profile Aura", icon: "✨", type: "perk" },
        ],
      },
    },
    {
      id: "apex_fartboy",
      name: "Apex Fartboy",
      tier: 6,
      icon: "⚪",
      description: "Top-tier contributor",
      requiredAmount: 5000,
      unlocked: currentRankTier >= 6,
      isCurrent: currentRankTier === 6,
      title: "Apex Fartboy",
      packRewards: ["5x Mythic Supporter Packs"],
      rewardData: {
        titleReward: "Apex Fartboy Sovereign Title ⚪",
        packRewardName: "Mythic Supporter Pack",
        packCount: 5,
        perks: [
          "Hall of Fame Sovereign Badge",
          "Unlimited Contributor Vault Access",
          "Personalized In-Game Title & Frame",
        ],
        rarity: "mythic",
        rewards: [
          { id: "r6_title", name: "Apex Fartboy Title", icon: "👑", type: "title" },
          { id: "r6_pack", name: "Mythic Supporter Packs", icon: "🔥", type: "pack", quantity: 5 },
          { id: "r6_badge", name: "Hall of Fame Crest", icon: "🏆", type: "badge" },
        ],
      },
    },
  ];
}

// TODO(backend): GET /api/contributor/rewards
export async function getContributorPassRewards(
  currentRankTier: number = 2,
): Promise<ContributorRewards[]> {
  const ladder = await getContributorRankLadder(currentRankTier);
  return ladder.map((rank) => ({
    tier: rank.tier,
    rankName: rank.name,
    rankIcon: rank.icon,
    rarity: rank.rewardData.rarity,
    description: rank.description,
    unlocked: rank.unlocked,
    isCurrent: rank.isCurrent,
    rewards: rank.rewardData.rewards,
  }));
}

// TODO(backend): GET /api/contributor/community-total
export async function getCommunityContribution(): Promise<CommunityContribution> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return {
    totalRaised: 48500,
    contributorCount: 1420,
    lastUpdated: "Just now",
    supportingCause: "Community Growth, CTO Raids, Meme Contests & Ecosystem Initiatives",
    recentMilestone: "$50,000 Ecosystem Goal",
    milestoneTarget: 50000,
  };
}

// TODO(backend): POST /api/contributor/donate
export async function submitDonationIntent(
  amount: number,
  category: string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    success: true,
    message: `Thank you for supporting with $${amount} in ${category}! Your contributor progress will sync with your Raider profile upon confirmation.`,
  };
}
