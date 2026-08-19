import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getContributorPassData, type UserContributorPassData } from "@/services/contributorPass";
import { safeStorage } from "@/lib/storage";
import {
  getCommunityContribution,
  getContributorRankLadder,
  getPlayerContributorProfile,
  type CommunityContribution,
  type ContributorRank,
  type PlayerContributorProfile,
} from "@/services/contributor";
import { DonateMoreModal } from "@/components/game/DonateMoreModal";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Sparkles,
  Trophy,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Droplets,
  Megaphone,
  Server,
  Compass,
  Users,
  Coins,
  Target,
  Sparkle,
  Zap,
  Gift,
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. WARCHEST 5 PILLARS (DIRECT COMMUNITY IMPACT)
// ----------------------------------------------------------------------
const WARCHEST_PILLARS = [
  {
    icon: Building2,
    color: "from-emerald-400 via-teal-400 to-cyan-500",
    border: "border-emerald-500/40",
    badge: "Ecosystem Pool",
    title: "Exchange Listings",
    description:
      "Funds CEX & DEX market-making pairing fees, Tier-1 exchange deposits, and liquidity provisioning to expand global token access.",
  },
  {
    icon: Droplets,
    color: "from-cyan-400 via-blue-400 to-indigo-500",
    border: "border-cyan-500/40",
    badge: "Protocol Security",
    title: "Liquidity Support",
    description:
      "Provides Protocol-Owned Liquidity (POL) depth across Automated Market Makers (AMMs) to minimize trading slippage and protect holders.",
  },
  {
    icon: Megaphone,
    color: "from-amber-400 via-orange-400 to-red-500",
    border: "border-amber-500/40",
    badge: "Viral Growth",
    title: "Marketing & Campaigns",
    description:
      "Powers community raid bounties, viral meme creator rewards, influencer partnerships, and global crypto media marketing blitzes.",
  },
  {
    icon: Server,
    color: "from-purple-400 via-fuchsia-400 to-pink-500",
    border: "border-purple-500/40",
    badge: "Core Stack",
    title: "Community Infrastructure",
    description:
      "Sustains high-speed Discord raid verification bots, automated CTO mission engines, dedicated cloud servers, and leaderboard APIs.",
  },
  {
    icon: Compass,
    color: "from-emerald-300 via-green-400 to-teal-400",
    border: "border-emerald-400/40",
    badge: "Long-Term Vision",
    title: "Strategic Growth Initiatives",
    description:
      "Finances ecosystem cross-chain bridge integrations, smart contract security audits, developer grants, and strategic partner pools.",
  },
];

// ----------------------------------------------------------------------
// 2. EXCLUSIVE MEMBER PERKS ("WHY UNLOCK THE CONTRIBUTOR PASS?")
// ----------------------------------------------------------------------
const CONTRIBUTOR_PERKS = [
  {
    icon: Zap,
    color: "from-emerald-400 to-teal-400",
    title: "50 Cosmetic Reward Tiers",
    description:
      "Progress through 50 tiers of exclusive emotes, banners, titles, and custom visual effects.",
  },
  {
    icon: Gift,
    color: "from-amber-400 to-yellow-500",
    title: "Exclusive Supporter Badges",
    description:
      "Display verified supporter rank badges on your profile card and in community chat rooms.",
  },
  {
    icon: Sparkles,
    color: "from-cyan-400 to-blue-500",
    title: "Custom Character Skins",
    description:
      "Unlock unique Fartboy character skin variants, golden vapor trails, and custom profile frames.",
  },
  {
    icon: Crown,
    color: "from-purple-400 to-fuchsia-500",
    title: "Warchest Ecosystem Growth",
    description:
      "Your contributions directly fund exchange listings, liquidity depth, and community marketing.",
  },
];

// ----------------------------------------------------------------------
// 3. CANONICAL SUPPORTER LADDER (EXACT 6 CANONICAL RANKS & THRESHOLDS)
// ----------------------------------------------------------------------
export interface SupporterRankInfo {
  id: string;
  name: string;
  minAmount: number;
  amountLabel: string;
  icon: string;
  color: string;
  borderColor: string;
  unlockHighlight: string;
  perks: string[];
}

const CANONICAL_SUPPORTER_RANKS: SupporterRankInfo[] = [
  {
    id: "tiny_tooter",
    name: "Tiny Tooter",
    minAmount: 50,
    amountLabel: "$50+",
    icon: "🎺",
    color: "from-emerald-500/20 to-teal-700/30",
    borderColor: "border-emerald-500/50",
    unlockHighlight: "Full 50-Tier Pass Access + Monthly Supporter Badge + Exclusive Profile Frame",
    perks: [
      "✓ Full 50-Tier Pass Access",
      "✓ Monthly Supporter Badge",
      "✓ Exclusive Profile Frame",
      "✓ Cosmetic-only identity prestige",
    ],
  },
  {
    id: "bubble_blaster",
    name: "Bubble Blaster",
    minAmount: 250,
    amountLabel: "$250+",
    icon: "🫧",
    color: "from-cyan-500/20 to-blue-700/30",
    borderColor: "border-cyan-400/60",
    unlockHighlight:
      "Tier 2 Supporter Cosmetic Set + Exclusive Supporter Discord Role + Pass Access",
    perks: [
      "✓ Tier 2 Supporter Cosmetic Set",
      "✓ Exclusive Supporter Discord Role",
      "✓ Full 50-Tier Pass Access",
      "✓ Cosmetic-only identity prestige",
    ],
  },
  {
    id: "reef_ripper",
    name: "Reef Ripper",
    minAmount: 500,
    amountLabel: "$500+",
    icon: "🌊",
    color: "from-teal-500/20 to-emerald-700/30",
    borderColor: "border-teal-400/60",
    unlockHighlight: "Animated Profile Background + Supporter Status Badge + All Tier 1-2 Perks",
    perks: [
      "✓ Animated Profile Background",
      "✓ Supporter Status Badge",
      "✓ All Tier 1-2 Perks Included",
      "✓ Cosmetic-only identity prestige",
    ],
  },
  {
    id: "dolphinately_gassy",
    name: "Dolphinately Gassy",
    minAmount: 1000,
    amountLabel: "$1,000+",
    icon: "🐬",
    color: "from-indigo-500/20 to-purple-700/30",
    borderColor: "border-indigo-400/70",
    unlockHighlight: "Exclusive Character Cosmetic Variant + Priority Discord Privileges",
    perks: [
      "✓ Exclusive Character Cosmetic Variant",
      "✓ Priority Discord Privileges",
      "✓ All Prior Supporter Perks",
      "✓ Cosmetic-only identity prestige",
    ],
  },
  {
    id: "whale_of_a_whiff",
    name: "Whale Of A Whiff",
    minAmount: 2500,
    amountLabel: "$2,500+",
    icon: "🐋",
    color: "from-fuchsia-500/20 to-pink-700/30",
    borderColor: "border-fuchsia-400/80",
    unlockHighlight: "Animated Glowing Profile Aura + VIP Discord Rank + All Prior Perks",
    perks: [
      "✓ Animated Glowing Profile Aura",
      "✓ VIP Discord Rank & Lounge",
      "✓ All Prior Supporter Perks",
      "✓ Cosmetic-only identity prestige",
    ],
  },
  {
    id: "apex_fartboy",
    name: "Apex Fartboy",
    minAmount: 5000,
    amountLabel: "$5,000+",
    icon: "👑",
    color: "from-amber-500/25 via-yellow-500/15 to-amber-700/30",
    borderColor: "border-amber-400",
    unlockHighlight:
      "Ultimate Animated Profile Aura + Exclusive Founder Cosmetic + Hall of Fame Founder Badge",
    perks: [
      "✓ Ultimate Animated Profile Aura",
      "✓ Exclusive Founder Cosmetic Skin",
      "✓ Hall of Fame Founder Badge",
      "✓ Permanent Cosmetic Supremacy",
    ],
  },
];

/**
 * Calculates current rank status and progress toward the next tier.
 */
function getSupporterProgression(donatedAmount: number) {
  let currentRank: SupporterRankInfo | null = null;
  let nextRank: SupporterRankInfo | null = CANONICAL_SUPPORTER_RANKS[0];

  for (let i = CANONICAL_SUPPORTER_RANKS.length - 1; i >= 0; i--) {
    if (donatedAmount >= CANONICAL_SUPPORTER_RANKS[i].minAmount) {
      currentRank = CANONICAL_SUPPORTER_RANKS[i];
      nextRank = CANONICAL_SUPPORTER_RANKS[i + 1] || null;
      break;
    }
  }

  if (!currentRank) {
    // Un-ranked
    const needed = 50 - donatedAmount;
    const percent = Math.min(100, Math.max(0, (donatedAmount / 50) * 100));
    return {
      isRanked: false,
      currentRank: null,
      nextRank: CANONICAL_SUPPORTER_RANKS[0],
      currentAmountUSD: donatedAmount,
      targetAmountUSD: 50,
      neededAmountUSD: needed,
      progressPercent: Math.round(percent),
      statusLabel: "Un-ranked Supporter",
      progressText: `Donate $50 to reach Tiny Tooter & unlock 50 Pass Tiers!`,
      bannerTitle: "ANY Supporter Rank = Full Pass Access Unlocked!",
    };
  }

  if (!nextRank) {
    // Max Rank (Apex Fartboy - $5,000+)
    return {
      isRanked: true,
      currentRank,
      nextRank: null,
      currentAmountUSD: donatedAmount,
      targetAmountUSD: 5000,
      neededAmountUSD: 0,
      progressPercent: 100,
      statusLabel: `Current Rank: ${currentRank.name} ($${donatedAmount.toLocaleString()})`,
      progressText: `Apex Rank Maxed ($5,000+) — Ultimate Founder Status Active!`,
      bannerTitle: "Full Pass Access Unlocked!",
    };
  }

  // Intermediate Rank
  const prevAmount = currentRank.minAmount;
  const targetAmount = nextRank.minAmount;
  const needed = targetAmount - donatedAmount;
  const range = targetAmount - prevAmount;
  const progressInRange = donatedAmount - prevAmount;
  const percent = Math.min(100, Math.max(0, (progressInRange / range) * 100));

  return {
    isRanked: true,
    currentRank,
    nextRank,
    currentAmountUSD: donatedAmount,
    targetAmountUSD: targetAmount,
    neededAmountUSD: needed,
    progressPercent: Math.round(percent),
    statusLabel: `Current Rank: ${currentRank.name} ($${donatedAmount.toLocaleString()})`,
    progressText: `$${donatedAmount.toLocaleString()} / $${targetAmount.toLocaleString()} to ${nextRank.name} — $${needed.toLocaleString()} away!`,
    bannerTitle: "Full Pass Access Unlocked!",
  };
}

// ----------------------------------------------------------------------
// ANIMATION VARIANTS
// ----------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ContributorPassHub() {
  const [showStateTester, setShowStateTester] = useState(false);
  const [passData, setPassData] = useState<UserContributorPassData>(getContributorPassData());
  const [community, setCommunity] = useState<CommunityContribution | null>(null);
  const [, setRankLadder] = useState<ContributorRank[]>([]);
  const [, setProfile] = useState<PlayerContributorProfile | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Dynamic user donation state for testing Un-ranked vs Ranked tiers
  const [donatedAmount, setDonatedAmount] = useState<number>(() => {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) return parseFloat(stored) || 0;
    return passData.hasContributorUnlock ? 50 : 0;
  });

  // Load auxiliary data
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getCommunityContribution(),
      getContributorRankLadder(passData.currentTier),
      getPlayerContributorProfile(passData.discordId),
    ]).then(([commData, ladderData, profData]) => {
      if (isMounted) {
        setCommunity(commData);
        setRankLadder(ladderData);
        setProfile(profData);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [passData.currentTier, passData.discordId]);

  const handleSetDonatedAmount = (amount: number) => {
    setDonatedAmount(amount);
    safeStorage.setItem("fartboy_user_donated_usd", amount.toString());

    const updated = getContributorPassData();
    updated.hasContributorUnlock = amount >= 50;
    safeStorage.setItem("fartboy_contributor_pass_s1", JSON.stringify(updated));
    setPassData({ ...updated });

    const progressionInfo = getSupporterProgression(amount);
    setFeedback(
      amount >= 50
        ? `🎉 Set state to ${progressionInfo.statusLabel}! Full Pass Access Unlocked.`
        : "Set state to Un-ranked ($0 Donated). Pass locked.",
    );
    setTimeout(() => setFeedback(null), 4000);
  };

  const totalRaised = community?.totalRaised ?? 48500;
  const milestoneTarget = community?.milestoneTarget ?? 50000;
  const warchestPercent = Math.min(100, Math.round((totalRaised / milestoneTarget) * 100));

  const isEligible = donatedAmount >= 50;
  const supporterProgression = getSupporterProgression(donatedAmount);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* FEEDBACK BANNER */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-amber-950/90 p-4 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between shadow-2xl backdrop-blur-xl"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>{feedback}</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFeedback(null)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEV TOGGLE BAR FOR TESTING USER STATES */}
      <div className="flex flex-col gap-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-3 sm:px-4 sm:py-2.5 text-xs font-mono shadow-lg">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-muted-foreground font-bold flex items-center gap-2 shrink-0">
            <Sparkle className="h-4 w-4 text-emerald-400" />
            <span>Interactive State Tester:</span>
            <span
              className={isEligible ? "text-emerald-400 font-black" : "text-amber-400 font-black"}
            >
              {supporterProgression.statusLabel}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowStateTester((prev) => !prev)}
            className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            {showStateTester ? "Hide Presets ▲" : "🧪 Tester Presets ▼"}
          </button>
        </div>

        {/* PRESET RANK STATE SWITCHERS */}
        {showStateTester && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
            {[
              { label: "$0 (Un-ranked)", val: 0 },
              { label: "$50 (Tiny Tooter)", val: 50 },
              { label: "$250 (Bubble Blaster)", val: 250 },
              { label: "$500 (Reef Ripper)", val: 500 },
              { label: "$1k (Dolphinately)", val: 1000 },
              { label: "$2.5k (Whale)", val: 2500 },
              { label: "$5k (Apex)", val: 5000 },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => handleSetDonatedAmount(preset.val)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  donatedAmount === preset.val
                    ? "bg-emerald-400 text-black shadow-md scale-105 font-black"
                    : "bg-slate-800 text-muted-foreground hover:bg-slate-700 hover:text-foreground border border-border/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: GLOBAL CONTRIBUTOR STATS OVERVIEW */}
      {/* ==================================================================== */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-950 via-zinc-950 to-emerald-950/50 p-6 sm:p-8 shadow-[0_0_90px_rgba(16,185,129,0.18)] backdrop-blur-2xl space-y-6">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

          {/* GLOBAL STATS HEADER */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800/80 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3.5 py-1 font-mono text-xs font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/40 shadow-sm">
                  <Users className="h-4 w-4 text-emerald-400 animate-pulse" />
                  GLOBAL COMMUNITY CONTRIBUTOR STATS
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-mono text-xs font-black text-amber-300 border border-amber-500/40">
                  <Coins className="h-4 w-4 text-amber-400" />
                  Season 1 Warchest Active
                </span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                Ecosystem Contributor Impact & Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                Real-time metrics tracking global backer contributions, community liquidity funding,
                and supporter milestone progress.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => setDonateModalOpen(true)}
              className="w-full lg:w-auto font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl h-14 px-8 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 hover:from-emerald-300 hover:to-amber-200 shadow-[0_0_35px_rgba(16,185,129,0.5)] cursor-pointer gap-2 shrink-0"
            >
              <HeartHandshake className="h-5 w-5" />
              <span>Become a Contributor</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* 4 GLOBAL METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* STAT 1: TOTAL CONTRIBUTORS */}
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-slate-400">
                  Total Contributors
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400">
                {(community?.contributorCount ?? 1420).toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-slate-400">Verified community backers</p>
            </div>

            {/* STAT 2: TOTAL FUNDS RAISED */}
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-slate-400">
                  Total Funds Raised
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-amber-300">
                ${totalRaised.toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-slate-400">Allocated to ecosystem pillars</p>
            </div>

            {/* STAT 3: MILESTONE GOAL */}
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-slate-400">
                  Warchest Goal
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-cyan-300">
                ${milestoneTarget.toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-emerald-400 font-bold">
                {warchestPercent}% Progress achieved
              </p>
            </div>

            {/* STAT 4: SUPPORTER RANKS */}
            <div className="rounded-2xl border border-purple-500/40 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-slate-400">
                  Active Ranks
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-purple-300">
                6 Canonical Tiers
              </div>
              <p className="text-[11px] font-mono text-slate-400">$50 to $5,000+ support levels</p>
            </div>
          </div>

          {/* WARCHEST FUNDING PROGRESS BAR */}
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-emerald-500/30 space-y-2 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono font-bold gap-1">
              <span className="text-emerald-300 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                Community Warchest Progress: ${totalRaised.toLocaleString()} / $
                {milestoneTarget.toLocaleString()}
              </span>
              <span className="text-amber-400 font-black">{warchestPercent}% Funded</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-black/80 border border-emerald-500/40 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-300 to-amber-300 shadow-[0_0_15px_rgba(16,185,129,0.9)] transition-all duration-500"
                style={{ width: `${warchestPercent}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* SECTION 2: "WHY UNLOCK THE CONTRIBUTOR PASS?" GRID */}
      {/* ==================================================================== */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-4 py-1 border border-emerald-400/40">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-300">
              100% Non-Pay-To-Win Guarantee
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground">
            Why Unlock the Contributor Pass?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Support ecosystem liquidity and project growth while claiming 50 tiers of exclusive
            visual cosmetics, profile badges, and custom skins. Zero combat advantages guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTRIBUTOR_PERKS.map((perk, i) => {
            const IconComp = perk.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${perk.color} text-black font-bold shadow-md shrink-0`}
                    >
                      <IconComp className="h-6 w-6 text-black" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Perk #{i + 1}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-base text-foreground leading-snug">
                    {perk.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* SECTION 3: "ASCEND THE SUPPORTER LADDER" (CANONICAL 6 TIER LADDER & SPEC PERKS) */}
      {/* ==================================================================== */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy className="h-4 w-4" /> Canonical Supporter Hierarchy (Section 11.2 & 11.3)
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground">
            Ascend the Supporter Ladder
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Achieving **ANY Supporter Rank ($50+)** instantly unlocks full access to all 50
            Contributor Pass tiers! Higher ranks unlock prestigious cosmetic badges, profile frames,
            and exclusive character skins.
          </p>
        </div>

        {/* EXPLICIT SECTION 11.1 NON-PAY-TO-WIN GAMEPLAY BOOST GUARANTEE BADGE */}
        <div className="rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-amber-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/20 text-emerald-400 border border-emerald-400/60 shrink-0 font-black text-2xl animate-pulse shadow-md">
            ⚡
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/40">
              SECTION 11.1 • GAMEPLAY PROGRESSION GUARANTEE
            </span>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-foreground leading-snug">
              ⚡ All Gameplay XP Boosts (+15% Specialist Set, +10% Equipment Cap, +5% Prestige) are
              earned purely through gameplay progression (Section 11.1).
            </p>
          </div>
        </div>

        {/* 6 CANONICAL SUPPORTER CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CANONICAL_SUPPORTER_RANKS.map((tier, idx) => {
            const isUserCurrentRank = supporterProgression.currentRank?.id === tier.id;
            const isUnlocked = donatedAmount >= tier.minAmount;

            return (
              <motion.div
                key={tier.id}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`rounded-2xl border-2 bg-gradient-to-b ${tier.color} p-6 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between relative ${
                  isUserCurrentRank
                    ? "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                    : tier.borderColor
                }`}
              >
                <div className="space-y-3">
                  {/* TOP HEADER */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tier.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black text-emerald-400">
                            TIER #{idx + 1}
                          </span>
                          {isUserCurrentRank && (
                            <span className="rounded bg-amber-400 text-black px-2 py-0.5 font-mono text-[9px] font-black uppercase shadow">
                              YOUR CURRENT RANK
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-black text-lg text-foreground">
                          {tier.name}
                        </h3>
                        <span className="font-mono text-xs font-black text-amber-300">
                          {tier.amountLabel} Contribution Threshold
                        </span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 font-mono text-[10px] font-black text-emerald-300 border border-emerald-400/40">
                        Unlocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800/80 px-2.5 py-1 font-mono text-[10px] font-black text-muted-foreground border border-border/40">
                        Locked
                      </span>
                    )}
                  </div>

                  {/* EXPLICIT UNLOCK HIGHLIGHT BOX */}
                  <div className="rounded-xl bg-slate-950/90 p-3.5 border border-emerald-400/50 space-y-1 shadow-inner">
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-400" /> Explicit Perk Unlocks
                    </span>
                    <div className="font-display font-black text-xs sm:text-sm text-foreground leading-snug">
                      {tier.unlockHighlight}
                    </div>
                  </div>

                  {/* DETAILED BENEFIT LIST */}
                  <div className="space-y-1.5 pt-1">
                    {tier.perks.map((perk, pIdx) => (
                      <div
                        key={pIdx}
                        className="text-xs font-mono text-slate-300 flex items-center gap-2"
                      >
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION UPGRADE BUTTON */}
                <div className="pt-3 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => setDonateModalOpen(true)}
                    className={`w-full font-mono text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer gap-1.5 ${
                      isUnlocked
                        ? "bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40"
                        : "bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-black hover:from-emerald-300 hover:to-amber-200 shadow-md"
                    }`}
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>
                      {isUnlocked ? `Rank Achieved (${tier.name})` : `Donate to Reach ${tier.name}`}
                    </span>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* SECTION 4: "WHAT THE WARCHEST SUPPORTS" (5 PILLARS) */}
      {/* ==================================================================== */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
            <Target className="h-4 w-4" /> Direct Community Impact
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground">
            What the Warchest Supports
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Every dollar contributed is transparently allocated across five strategic pillars to
            build lasting ecosystem depth.
          </p>
        </div>

        {/* 5 PILLARS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WARCHEST_PILLARS.map((pillar, i) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`relative overflow-hidden rounded-2xl border ${pillar.border} bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${pillar.color} text-black font-bold shadow-md`}
                    >
                      <IconComp className="h-6 w-6 text-black" />
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-foreground leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400/90 font-bold">
                  <span>Pillar #{i + 1}</span>
                  <span className="flex items-center gap-1">
                    Direct Funding <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* DONATE MORE MODAL */}
      <DonateMoreModal open={donateModalOpen} onOpenChange={setDonateModalOpen} />
    </motion.div>
  );
}
