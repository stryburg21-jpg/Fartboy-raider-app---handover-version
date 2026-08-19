import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SEASON_1_CONTRIBUTOR_PASS_CONFIG,
  type ContributorTierConfig,
} from "@/config/contributorPassConfig";
import {
  getContributorPassData,
  getContributorProgress,
  claimContributorReward,
  awardContributorXP,
  type UserContributorPassData,
} from "@/services/contributorPass";
import { DonateMoreModal } from "@/components/game/DonateMoreModal";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { checkIsContributor } from "@/utils/contributorGating";
import { safeStorage } from "@/lib/storage";
import {
  Crown,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Gift,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Star,
  Sparkle,
  SlidersHorizontal,
  LayoutGrid,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

export interface SupporterRankInfo {
  id: string;
  name: string;
  minAmount: number;
  amountLabel: string;
  icon: string;
  color: string;
  borderColor: string;
  unlockHighlight: string;
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
    unlockHighlight: "Full 50-Tier Pass Access + Supporter Badge + Profile Frame",
  },
  {
    id: "bubble_blaster",
    name: "Bubble Blaster",
    minAmount: 250,
    amountLabel: "$250+",
    icon: "🫧",
    color: "from-cyan-500/20 to-blue-700/30",
    borderColor: "border-cyan-400/60",
    unlockHighlight: "Tier 2 Supporter Cosmetic Set + Exclusive Discord Role",
  },
  {
    id: "reef_ripper",
    name: "Reef Ripper",
    minAmount: 500,
    amountLabel: "$500+",
    icon: "🌊",
    color: "from-teal-500/20 to-emerald-700/30",
    borderColor: "border-teal-400/60",
    unlockHighlight: "Animated Profile Background + Supporter Badge",
  },
  {
    id: "dolphinately_gassy",
    name: "Dolphinately Gassy",
    minAmount: 1000,
    amountLabel: "$1,000+",
    icon: "🐬",
    color: "from-indigo-500/20 to-purple-700/30",
    borderColor: "border-indigo-400/70",
    unlockHighlight: "Exclusive Character Cosmetic Variant + Discord Privileges",
  },
  {
    id: "whale_of_a_whiff",
    name: "Whale Of A Whiff",
    minAmount: 2500,
    amountLabel: "$2,500+",
    icon: "🐋",
    color: "from-fuchsia-500/20 to-pink-700/30",
    borderColor: "border-fuchsia-400/80",
    unlockHighlight: "Animated Glowing Profile Aura + VIP Discord Rank",
  },
  {
    id: "apex_fartboy",
    name: "Apex Fartboy",
    minAmount: 5000,
    amountLabel: "$5,000+",
    icon: "👑",
    color: "from-amber-500/25 via-yellow-500/15 to-amber-700/30",
    borderColor: "border-amber-400",
    unlockHighlight: "Ultimate Animated Profile Aura + Hall of Fame Founder Badge",
  },
];

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
      progressText: "Unlock $50 Tiny Tooter to access 50 Pass Tiers!",
      bannerTitle: "Unlock Full Pass Access (50 Tiers)",
    };
  }

  if (!nextRank) {
    return {
      isRanked: true,
      currentRank,
      nextRank: null,
      currentAmountUSD: donatedAmount,
      targetAmountUSD: 5000,
      neededAmountUSD: 0,
      progressPercent: 100,
      statusLabel: `Current Rank: ${currentRank.name} ($${donatedAmount.toLocaleString()})`,
      progressText: "Apex Rank Maxed ($5,000+) — Ultimate Founder Status Active!",
      bannerTitle: "Full Pass Access Unlocked!",
    };
  }

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

function getRewardRarity(tier: number) {
  if (tier === 50)
    return {
      name: "MYTHIC",
      color: "from-amber-400 via-orange-500 to-red-600",
      text: "text-amber-300",
      border: "border-amber-400",
      glowClass: "shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-400",
    };
  if (tier % 10 === 0)
    return {
      name: "LEGENDARY",
      color: "from-purple-400 via-fuchsia-500 to-pink-500",
      text: "text-purple-300",
      border: "border-purple-400",
      glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-400",
    };
  if (tier % 5 === 0)
    return {
      name: "EPIC",
      color: "from-yellow-400 via-amber-500 to-orange-500",
      text: "text-amber-300",
      border: "border-amber-400/80",
      glowClass: "shadow-[0_0_15px_rgba(245,158,11,0.35)] border-amber-400/80",
    };
  return {
    name: "RARE",
    color: "from-emerald-400 to-teal-500",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    glowClass: "border-emerald-500/40",
  };
}

export function BubbleBlasterExpeditionTrack() {
  const player = useGameStore((s) => s.player);
  const [passData, setPassData] = useState<UserContributorPassData>(getContributorPassData());
  const [filterMode, setFilterMode] = useState<"all" | "milestones" | "claimable" | "unlocked">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"horizontal" | "grid">("horizontal");
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Dynamic user donation state
  const [donatedAmount, setDonatedAmount] = useState<number>(() => {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) return parseFloat(stored) || 0;
    return passData.hasContributorUnlock ? 50 : 0;
  });

  const progress = getContributorProgress();
  const [selectedTierNumber, setSelectedTierNumber] = useState<number>(() => {
    return Math.min(50, Math.max(1, progress.currentTier || 1));
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const refreshPassData = () => {
    const updated = getContributorPassData();
    setPassData(updated);
  };

  const handleSetDonatedAmount = (amount: number) => {
    setDonatedAmount(amount);
    safeStorage.setItem("fartboy_user_donated_usd", amount.toString());

    const updated = getContributorPassData();
    updated.hasContributorUnlock = amount >= 50;
    safeStorage.setItem("fartboy_contributor_pass_s1", JSON.stringify(updated));
    setPassData({ ...updated });

    const progressionInfo = getSupporterProgression(amount);
    const msg =
      amount >= 50
        ? `🎉 Set state to ${progressionInfo.statusLabel}! Full Pass Access Unlocked.`
        : "Set state to Un-ranked ($0 Donated). Pass locked.";
    setFeedback(msg);
    toast.success(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleClaimReward = async (tier: number) => {
    const key = `contributor_${tier}`;
    setClaimingKey(key);
    const res = await claimContributorReward(tier, "contributor");
    setClaimingKey(null);
    setFeedback(res.message);
    toast.success(res.message);
    refreshPassData();
    setTimeout(() => setFeedback(null), 4000);
  };

  const isContributor =
    checkIsContributor(player) || donatedAmount >= 50 || passData.hasContributorUnlock;
  const supporterProgression = getSupporterProgression(donatedAmount);

  // Filter 50 tiers
  let tiersToDisplay = SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers;
  if (filterMode === "milestones") {
    tiersToDisplay = tiersToDisplay.filter((t) => t.tier % 5 === 0 || t.tier === 1);
  } else if (filterMode === "claimable") {
    tiersToDisplay = tiersToDisplay.filter((t) => {
      const isReached = passData.currentTier >= t.tier;
      return isReached && isContributor && !passData.claimedContributorRewards.includes(t.tier);
    });
  } else if (filterMode === "unlocked") {
    tiersToDisplay = tiersToDisplay.filter((t) => passData.currentTier >= t.tier);
  }

  const claimableCount = SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers.filter((t) => {
    const isReached = passData.currentTier >= t.tier;
    return isReached && isContributor && !passData.claimedContributorRewards.includes(t.tier);
  }).length;

  const selectedTierConfig =
    SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers.find((t) => t.tier === selectedTierNumber) ||
    SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers[0];

  const scrollToTier = (tier: number) => {
    setSelectedTierNumber(tier);
    if (!scrollContainerRef.current) return;
    const node = document.getElementById(`tier-node-${tier}`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const handleScrollStep = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const delta = direction === "left" ? -350 : 350;
    scrollContainerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div id="battle-pass-tiers-tracker" className="space-y-6 font-mono">
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

      {/* ══════════════════════════════════════════════════════════════════════
          NON-CONTRIBUTOR FULL LOCKOUT OVERLAY BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      {!isContributor && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border-2 border-amber-400/60 text-2xl shrink-0 shadow-lg animate-pulse">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase text-amber-300 bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-400/50">
                    <Lock className="h-3 w-3" />
                    CONTRIBUTOR ONLY ACCESS
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    50 TIERS PREVIEW ACTIVE
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-black text-white">
                  Season 1 Contributor Pass Locked
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Support the decentralized ecosystem to unlock claimable access across all 50
                  reward tiers, exclusive 3D loadouts, and global XP multipliers.
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setDonateModalOpen(true)}
              className="w-full md:w-auto font-mono text-xs font-black uppercase tracking-wider rounded-xl h-11 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer shrink-0 flex items-center justify-center gap-2"
            >
              <Crown className="h-4 w-4" />
              <span>UNLOCK PASS - $50</span>
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          COMPACT HORIZONTAL BATTLE PASS TIERS TRACKER (TIERS 1 TO 50)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border-2 border-amber-500/30 bg-slate-950/95 p-4 sm:p-6 shadow-2xl space-y-5">
        {/* HEADER CONTROLS BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Crown className="h-3 w-3" />
                SEASON 1 EXPEDITION TRACK
              </span>
              {isContributor ? (
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> TIER {progress.currentTier} / 50 REACHED
                </span>
              ) : (
                <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> UN-RANKED PLAYER (TIER {progress.currentTier}{" "}
                  REACHED)
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <span>🫧 50-TIER HORIZONTAL PROGRESSION TRACK</span>
            </h2>
          </div>

          {/* VIEW MODE & FILTER CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("horizontal")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "horizontal"
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Horizontal Progression Bar"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Track</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Grid Catalog"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {/* Filter Buttons */}
            {[
              { id: "all", label: "All 50", count: 50 },
              { id: "milestones", label: "Milestones", count: 11 },
              { id: "claimable", label: "Claimable", count: claimableCount },
              { id: "unlocked", label: "Unlocked", count: progress.currentTier },
            ].map((tab) => {
              const active = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id as typeof filterMode)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    active
                      ? "bg-amber-400 text-slate-950 shadow-md"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-black/20 px-1 py-0.2 text-[9px] font-mono">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* QUICK JUMP SEGMENT BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Quick Jump:</span>
            <button
              type="button"
              onClick={() => scrollToTier(Math.min(50, Math.max(1, progress.currentTier || 1)))}
              className="px-2 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-black hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer flex items-center gap-1"
            >
              <Star className="h-3 w-3 fill-amber-400" />
              <span>Current (T{progress.currentTier})</span>
            </button>
            {[
              { label: "T1-10", tier: 1 },
              { label: "T11-20", tier: 11 },
              { label: "T21-30", tier: 21 },
              { label: "T31-40", tier: 31 },
              { label: "T41-50", tier: 41 },
            ].map((seg) => (
              <button
                key={seg.label}
                type="button"
                onClick={() => scrollToTier(seg.tier)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedTierNumber >= seg.tier && selectedTierNumber < seg.tier + 10
                    ? "bg-slate-800 text-white border border-amber-500/40 font-black"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {/* Stepper buttons for horizontal track */}
          {viewMode === "horizontal" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScrollStep("left")}
                className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white grid place-items-center cursor-pointer transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScrollStep("right")}
                className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white grid place-items-center cursor-pointer transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MODE 1: HORIZONTAL TIER PROGRESSION RAIL (TIERS 1 TO 50)
        ══════════════════════════════════════════════════════════════════════ */}
        {viewMode === "horizontal" ? (
          <div className="relative py-2">
            {/* HORIZONTAL SCROLL CONTAINER */}
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-3 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
            >
              {tiersToDisplay.map((t) => {
                const isReached = progress.currentTier >= t.tier;
                const isClaimed = passData.claimedContributorRewards.includes(t.tier);
                const canClaim = isReached && isContributor && !isClaimed;
                const isSelected = selectedTierNumber === t.tier;
                const reward = t.contributorReward;
                const isMilestone = t.tier % 5 === 0 || t.tier === 1;
                const rarity = getRewardRarity(t.tier);
                const isPassLocked = !isContributor;
                const isXpLocked = isContributor && !isReached;

                return (
                  <div
                    key={`tier-track-${t.tier}`}
                    id={`tier-node-${t.tier}`}
                    onClick={() => setSelectedTierNumber(t.tier)}
                    className={`shrink-0 w-36 sm:w-40 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 relative select-none font-mono ${
                      isSelected
                        ? "ring-2 ring-amber-400 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-102 z-10"
                        : isMilestone
                          ? `bg-slate-900/90 ${rarity.glowClass} hover:bg-slate-800`
                          : isClaimed
                            ? "border border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-400"
                            : canClaim
                              ? "border-2 border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
                              : "border border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    {/* NODE TOP: TIER & MILESTONE BADGE */}
                    <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded">
                        T{t.tier}
                      </span>
                      {isMilestone ? (
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                            t.tier === 50
                              ? "bg-amber-400/20 text-amber-300 border-amber-400"
                              : t.tier % 10 === 0
                                ? "bg-purple-500/20 text-purple-300 border-purple-400"
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-400"
                          }`}
                        >
                          {t.tier === 50 ? "MYTHIC" : "MILESTONE"}
                        </span>
                      ) : (
                        <span
                          className={`text-[8px] font-black uppercase px-1 py-0.2 rounded border ${rarity.border} ${rarity.text}`}
                        >
                          {rarity.name}
                        </span>
                      )}
                    </div>

                    {/* NODE MIDDLE: REWARD ICON & NAME */}
                    <div className="py-2.5 text-center space-y-1.5">
                      <div
                        className={`mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-2xl border ${
                          isSelected
                            ? "border-amber-400"
                            : isMilestone
                              ? rarity.border
                              : "border-slate-800"
                        } shadow-inner relative`}
                      >
                        {reward.icon}
                        {(isPassLocked || isXpLocked) && !isClaimed && (
                          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                            <Lock
                              className={`h-4 w-4 ${isPassLocked ? "text-amber-400" : "text-slate-400"}`}
                            />
                          </div>
                        )}
                      </div>

                      <h4 className="font-display font-black text-xs text-white truncate px-1">
                        {reward.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 uppercase font-bold truncate">
                        {reward.type}
                      </p>
                    </div>

                    {/* NODE FOOTER: STATUS / ACTION */}
                    <div className="pt-1.5 border-t border-slate-800 mt-auto text-center">
                      {isClaimed ? (
                        <span className="text-[9px] font-black text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> CLAIMED
                        </span>
                      ) : canClaim ? (
                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/60 rounded px-1.5 py-0.5 animate-pulse flex items-center justify-center gap-1">
                          <Gift className="h-3 w-3" /> CLAIMABLE
                        </span>
                      ) : isPassLocked ? (
                        <span className="text-[9px] font-bold text-amber-400/80 flex items-center justify-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> PASS LOCKED
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 flex items-center justify-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> {t.requiredCPXP.toLocaleString()} XP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              MODE 2: COMPACT 50-TIER GRID VIEW
          ══════════════════════════════════════════════════════════════════ */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {tiersToDisplay.map((t) => {
              const isReached = progress.currentTier >= t.tier;
              const isClaimed = passData.claimedContributorRewards.includes(t.tier);
              const canClaim = isReached && isContributor && !isClaimed;
              const isSelected = selectedTierNumber === t.tier;
              const reward = t.contributorReward;
              const isMilestone = t.tier % 5 === 0 || t.tier === 1;
              const rarity = getRewardRarity(t.tier);

              return (
                <div
                  key={`tier-grid-${t.tier}`}
                  onClick={() => setSelectedTierNumber(t.tier)}
                  className={`rounded-xl p-3 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-amber-400 bg-slate-900 shadow-lg"
                      : isMilestone
                        ? `bg-slate-900/80 ${rarity.glowClass}`
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold pb-1 border-b border-slate-800">
                    <span className="text-amber-400 font-black">T{t.tier}</span>
                    {isMilestone && (
                      <span className="text-[8px] font-black text-amber-300 bg-amber-400/20 px-1 rounded">
                        GOLD
                      </span>
                    )}
                  </div>
                  <div className="py-2 text-center space-y-1">
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="text-xs font-black text-white truncate">{reward.name}</div>
                  </div>
                  <div className="text-center text-[9px] font-bold">
                    {isClaimed ? (
                      <span className="text-emerald-400">✓ CLAIMED</span>
                    ) : canClaim ? (
                      <span className="text-amber-300 font-black">CLAIMABLE</span>
                    ) : (
                      <span className="text-slate-500">LOCKED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SELECTED TIER SPOTLIGHT INSPECTOR CARD
        ══════════════════════════════════════════════════════════════════════ */}
        {selectedTierConfig && (
          <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-3xl border-2 ${
                    getRewardRarity(selectedTierConfig.tier).border
                  } shadow-lg shrink-0`}
                >
                  {selectedTierConfig.contributorReward.icon}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                      TIER {selectedTierConfig.tier} REWARD
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        getRewardRarity(selectedTierConfig.tier).border
                      } ${getRewardRarity(selectedTierConfig.tier).text}`}
                    >
                      {getRewardRarity(selectedTierConfig.tier).name}
                    </span>
                    {(selectedTierConfig.tier % 5 === 0 || selectedTierConfig.tier === 1) && (
                      <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                        ⭐ GOLD MILESTONE
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-base sm:text-lg text-white">
                    {selectedTierConfig.contributorReward.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedTierConfig.contributorReward.description}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    Requirement: {selectedTierConfig.requiredCPXP.toLocaleString()} CP-XP
                  </p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="shrink-0 w-full md:w-auto">
                {passData.claimedContributorRewards.includes(selectedTierConfig.tier) ? (
                  <div className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>REWARD CLAIMED</span>
                  </div>
                ) : progress.currentTier >= selectedTierConfig.tier && isContributor ? (
                  <Button
                    size="lg"
                    disabled={claimingKey === `contributor_${selectedTierConfig.tier}`}
                    onClick={() => handleClaimReward(selectedTierConfig.tier)}
                    className="w-full md:w-auto font-mono text-xs font-black uppercase tracking-wider rounded-xl h-11 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer gap-2"
                  >
                    <Gift className="h-4 w-4" />
                    <span>
                      {claimingKey === `contributor_${selectedTierConfig.tier}`
                        ? "CLAIMING..."
                        : "CLAIM TIER REWARD 🎁"}
                    </span>
                  </Button>
                ) : !isContributor ? (
                  <Button
                    size="lg"
                    onClick={() => setDonateModalOpen(true)}
                    className="w-full md:w-auto font-mono text-xs font-black uppercase tracking-wider rounded-xl h-11 px-6 bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 text-slate-950 hover:from-amber-300 hover:to-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    <span>UNLOCK PASS ($50)</span>
                  </Button>
                ) : (
                  <div className="px-6 py-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span>
                      REQUIRES{" "}
                      {(
                        selectedTierConfig.requiredCPXP - (progress.totalCPXP || 0)
                      ).toLocaleString()}{" "}
                      MORE CP-XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INLINE DEV TESTING PRESETS (NON-BLOCKING) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkle className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>TEST SUPPORTER RANK:</span>
          </span>
          {[
            { label: "$0 (Un-ranked)", val: 0 },
            { label: "$50 (Tiny Tooter)", val: 50 },
            { label: "$250 (Bubble Blaster)", val: 250 },
            { label: "$500 (Reef Ripper)", val: 500 },
            { label: "$1,000 (Dolphinately)", val: 1000 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleSetDonatedAmount(preset.val)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                donatedAmount === preset.val
                  ? "bg-emerald-400 text-black font-black shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* DONATE / PASS SIGN UP MODAL */}
      <DonateMoreModal open={donateModalOpen} onOpenChange={setDonateModalOpen} />
    </div>
  );
}
