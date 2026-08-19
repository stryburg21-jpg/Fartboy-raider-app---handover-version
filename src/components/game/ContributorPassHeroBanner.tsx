import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Crown,
  Sparkles,
  ArrowRight,
  Gift,
  Lock,
  CheckCircle2,
  Trophy,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonateMoreModal } from "@/components/game/DonateMoreModal";
import {
  getContributorPassData,
  getContributorProgress,
  type UserContributorPassData,
} from "@/services/contributorPass";
import { SEASON_1_CONTRIBUTOR_PASS_CONFIG } from "@/config/contributorPassConfig";
import { safeStorage } from "@/lib/storage";

interface ContributorPassHeroBannerProps {
  onViewSeasonPass?: () => void;
  className?: string;
}

export function ContributorPassHeroBanner({
  onViewSeasonPass,
  className = "",
}: ContributorPassHeroBannerProps) {
  const [donateOpen, setDonateOpen] = useState(false);
  const [passData, setPassData] = useState<UserContributorPassData>(getContributorPassData());
  const progress = getContributorProgress();

  const [donatedAmount, setDonatedAmount] = useState<number>(() => {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) return parseFloat(stored) || 0;
    return passData.hasContributorUnlock ? 50 : 0;
  });

  const refreshPassState = () => {
    const data = getContributorPassData();
    setPassData(data);
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) {
      setDonatedAmount(parseFloat(stored) || 0);
    }
  };

  useEffect(() => {
    refreshPassState();
    const handleStorageChange = () => refreshPassState();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isUnlocked = donatedAmount >= 50 || passData.hasContributorUnlock;

  // Calculate claimable rewards count
  const claimableCount = SEASON_1_CONTRIBUTOR_PASS_CONFIG.tiers.filter((t) => {
    const isReached = progress.currentTier >= t.tier;
    return isReached && isUnlocked && !passData.claimedContributorRewards.includes(t.tier);
  }).length;

  const currentTier = progress.currentTier || 1;
  const maxTier = SEASON_1_CONTRIBUTOR_PASS_CONFIG.totalTiers || 50;

  return (
    <>
      <div
        id="contributor-pass-hero-banner"
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 p-4 sm:p-5 shadow-[0_0_40px_rgba(16,185,129,0.18)] font-mono ${className}`}
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />

        {/* Ornate corner tech trims */}
        <span className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 border-l-2 border-t-2 border-emerald-400/60 rounded-tl-xs" />
        <span className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-xs" />
        <span className="pointer-events-none absolute left-2.5 bottom-2.5 h-3.5 w-3.5 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-xs" />
        <span className="pointer-events-none absolute right-2.5 bottom-2.5 h-3.5 w-3.5 border-r-2 border-b-2 border-emerald-400/60 rounded-br-xs" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* LEFT: STATUS, TITLE & HIGHLIGHTS */}
          <div className="space-y-2 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 font-mono text-[11px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/50 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                SEASON 1 CONTRIBUTOR PASS
              </span>

              {/* TIER STATUS BADGE */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-0.5 font-mono text-[11px] font-black text-amber-300 border border-amber-500/40">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                Tier {currentTier} / {maxTier} Reached
              </span>

              {/* CLAIMABLE PROGRESS INDICATOR */}
              {isUnlocked && claimableCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 font-mono text-[11px] font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse">
                  <Gift className="h-3.5 w-3.5" />
                  {claimableCount} Claimable Reward{claimableCount > 1 ? "s" : ""}
                </span>
              ) : isUnlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-[10px] font-bold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Pass Active • Rewards Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold">
                  <Lock className="h-3 w-3 text-amber-400" />
                  Pass Locked (50 Tiers Available)
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-black text-lg sm:text-xl lg:text-2xl text-white tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                <span>Unlock 50 Exclusive Seasonal Rewards</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                  100% Cosmetic
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Progress through 50 tiers of exclusive animated titles, mythical profile frames,
                auras, and seasonal emotes while funding decentralized ecosystem liquidity.
              </p>
            </div>

            {/* MINI PROGRESS BAR */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-2 flex-1 max-w-md bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                  style={{ width: `${Math.min(100, Math.round((currentTier / maxTier) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                {Math.round((currentTier / maxTier) * 100)}% Complete
              </span>
            </div>
          </div>

          {/* RIGHT: HIGH VISIBILITY UNLOCK CTA & FAST ACTIONS */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 pt-2 lg:pt-0">
            {!isUnlocked ? (
              <Button
                size="lg"
                onClick={() => setDonateOpen(true)}
                className="relative overflow-hidden group font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl h-12 px-6 sm:px-8 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer transition-all active:scale-95"
              >
                {/* Subtle animated sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 animate-sheen-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]"
                />
                <div className="relative z-10 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">UNLOCK PASS - $50</span>
                  <ArrowRight className="h-4 w-4 text-slate-950 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setDonateOpen(true)}
                className="relative overflow-hidden group font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl h-12 px-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">UPGRADE SUPPORTER RANK</span>
                  <ArrowRight className="h-4 w-4 text-slate-950 shrink-0" />
                </div>
              </Button>
            )}

            {onViewSeasonPass && (
              <button
                type="button"
                onClick={onViewSeasonPass}
                className="text-xs font-mono font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-400 flex items-center justify-center gap-1 transition-colors cursor-pointer py-1"
              >
                <span>View Full 50-Tier Track</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <DonateMoreModal
        open={donateOpen}
        onOpenChange={(open) => {
          setDonateOpen(open);
          if (!open) refreshPassState();
        }}
      />
    </>
  );
}
