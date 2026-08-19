/**
 * Fartboy Raid 2.0 — Season 1 Contributor Pass Configuration
 *
 * 50-Tier Progression System for Community Contributors
 * 100% Non-Pay-to-Win: Exclusively cosmetic, identity, and commemorative rewards.
 */

export interface ContributorPassReward {
  id: string;
  name: string;
  type: "title" | "badge" | "cosmetic" | "pack" | "frame" | "theme" | "spendable_xp";
  description: string;
  icon?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  titleId?: string;
  cosmeticId?: string;
  packTier?: "specialist" | "celestial" | "mythic";
  amount?: number;
}

export interface ContributorTierConfig {
  tier: number;
  xpRequired: number;
  isMilestone?: boolean;
  freeReward: ContributorPassReward;
  contributorReward: ContributorPassReward;
}

export interface SeasonContributorPassConfig {
  seasonId: number;
  seasonName: string;
  subtitle: string;
  totalTiers: number;
  xpPerTier: number;
  tiers: ContributorTierConfig[];
}

// Helper to generate the 50 tiers with thematic names and milestone rewards
function generateSeason1Tiers(): ContributorTierConfig[] {
  const tiers: ContributorTierConfig[] = [];
  const xpPerTier = 1000;

  for (let t = 1; t <= 50; t++) {
    const isMilestone = t === 1 || t % 5 === 0;

    let freeReward: ContributorPassReward;
    let contributorReward: ContributorPassReward;

    if (t === 1) {
      freeReward = {
        id: "s1_free_t1",
        name: "Cadet Supporter Badge",
        type: "badge",
        description: "Official Season 1 Supporter participant badge.",
        icon: "🎖️",
        rarity: "common",
      };
      contributorReward = {
        id: "s1_contrib_t1",
        name: "Title: Early Believer",
        type: "title",
        titleId: "title_early_believer",
        description: "Equippable raider title honoring early CTO champions.",
        icon: "👑",
        rarity: "rare",
      };
    } else if (t === 5) {
      freeReward = {
        id: "s1_free_t5",
        name: "500 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 500,
        rarity: "common",
      };
      contributorReward = {
        id: "s1_contrib_t5",
        name: "Specialist Supply Pack",
        type: "pack",
        packTier: "specialist",
        description: "Loot cache containing tactical loadout cosmetics.",
        icon: "📦",
        rarity: "epic",
      };
    } else if (t === 10) {
      freeReward = {
        id: "s1_free_t10",
        name: "1,000 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 1000,
        rarity: "uncommon",
      };
      contributorReward = {
        id: "s1_contrib_t10",
        name: "Frame: Bronze Vanguard",
        type: "frame",
        cosmeticId: "frame_bronze_vanguard",
        description: "Metallic animated pedestal border for your Raider avatar.",
        icon: "🖼️",
        rarity: "epic",
      };
    } else if (t === 20) {
      freeReward = {
        id: "s1_free_t20",
        name: "2,000 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 2000,
        rarity: "rare",
      };
      contributorReward = {
        id: "s1_contrib_t20",
        name: "Theme: Neon Cyber-Stench",
        type: "theme",
        cosmeticId: "theme_neon_cyber",
        description: "Futuristic neon background & video loop for HQ Stage.",
        icon: "🌌",
        rarity: "legendary",
      };
    } else if (t === 25) {
      freeReward = {
        id: "s1_free_t25",
        name: "2,500 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 2500,
        rarity: "rare",
      };
      contributorReward = {
        id: "s1_contrib_t25",
        name: "Title: Bubble Blaster Elite",
        type: "title",
        titleId: "title_bubble_blaster_elite",
        description: "Prestige title unlocked at the Expedition mid-point.",
        icon: "💎",
        rarity: "legendary",
      };
    } else if (t === 30) {
      freeReward = {
        id: "s1_free_t30",
        name: "3,000 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 3000,
        rarity: "rare",
      };
      contributorReward = {
        id: "s1_contrib_t30",
        name: "Frame: Silver Sentinel",
        type: "frame",
        cosmeticId: "frame_silver_sentinel",
        description: "Shimmering chrome animated stage frame.",
        icon: "🖼️",
        rarity: "legendary",
      };
    } else if (t === 40) {
      freeReward = {
        id: "s1_free_t40",
        name: "4,000 Spendable XP",
        type: "spendable_xp",
        description: "Bonus spendable XP for vault crafting & scrap.",
        icon: "⚡",
        amount: 4000,
        rarity: "epic",
      };
      contributorReward = {
        id: "s1_contrib_t40",
        name: "Mythic Apex Raider Crate",
        type: "pack",
        packTier: "mythic",
        description: "Mythic loot container with guaranteed high-tier gear.",
        icon: "🎁",
        rarity: "mythic",
      };
    } else if (t === 50) {
      freeReward = {
        id: "s1_free_t50",
        name: "Commemorative S1 Trophy Badge",
        type: "badge",
        description: "Season 1 Master Raider Completionist Badge.",
        icon: "🏆",
        rarity: "epic",
      };
      contributorReward = {
        id: "s1_contrib_t50",
        name: "Title: Mythic Architect + Gold Crown Frame",
        type: "title",
        titleId: "title_mythic_architect",
        description: "Apex prestige title & animated Gold Crown Frame.",
        icon: "👑",
        rarity: "mythic",
      };
    } else if (t % 5 === 0) {
      freeReward = {
        id: `s1_free_t${t}`,
        name: `${t * 100} Spendable XP`,
        type: "spendable_xp",
        description: "Bonus spendable XP.",
        icon: "⚡",
        amount: t * 100,
        rarity: "common",
      };
      contributorReward = {
        id: `s1_contrib_t${t}`,
        name: `Specialist Supply Cache (Tier ${t})`,
        type: "pack",
        packTier: "specialist",
        description: `Tier ${t} loot crate containing cosmetic items.`,
        icon: "📦",
        rarity: "rare",
      };
    } else {
      freeReward = {
        id: `s1_free_t${t}`,
        name: `${t * 50} Spendable XP`,
        type: "spendable_xp",
        description: "Bonus spendable XP.",
        icon: "⚡",
        amount: t * 50,
        rarity: "common",
      };
      contributorReward = {
        id: `s1_contrib_t${t}`,
        name: `${t * 150} Spendable XP + Contributor Crest`,
        type: "spendable_xp",
        description: `Tier ${t} Contributor XP Grant.`,
        icon: "✨",
        amount: t * 150,
        rarity: "uncommon",
      };
    }

    tiers.push({
      tier: t,
      xpRequired: t * xpPerTier,
      isMilestone,
      freeReward,
      contributorReward,
    });
  }

  return tiers;
}

export const SEASON_1_CONTRIBUTOR_PASS_CONFIG: SeasonContributorPassConfig = {
  seasonId: 1,
  seasonName: "Season 1: Bubble Blaster Expedition",
  subtitle: "50-Tier Contributor Track & Social Prestige Roadmap",
  totalTiers: 50,
  xpPerTier: 1000,
  tiers: generateSeason1Tiers(),
};

// Re-export services for backwards compatibility with any component imports
export {
  calculateContributorTier,
  getContributorPassData,
  saveContributorPassData,
  toggleContributorPassUnlock,
  getContributorProgress,
  awardContributorXP,
  claimContributorReward,
  awardSeasonPassXP,
  type UserContributorPassData,
} from "@/services/contributorPass";
