import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
  Gift,
  Lock,
  CheckCircle2,
  Shield,
  Star,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonateMoreModal } from "./DonateMoreModal";
import { useGameStore } from "@/store/gameStore";
import { checkIsContributor } from "@/utils/contributorGating";
import { getContributorPassData, getContributorProgress } from "@/services/contributorPass";
import { safeStorage } from "@/lib/storage";

interface SupporterTierDef {
  tier: number;
  id: string;
  name: string;
  minAmount: number;
  icon: string;
  xpBoost: number;
  vaultBoost: number;
  tagline: string;
  perks: string[];
}

const SUPPORTER_TIERS: SupporterTierDef[] = [
  {
    tier: 1,
    id: "tiny_tooter",
    name: "Tiny Tooter",
    minAmount: 50,
    icon: "🎺",
    xpBoost: 10,
    vaultBoost: 5,
    tagline: "Standard Contributor Access",
    perks: [
      "Full 50-Tier Seasonal Pass Unlocked",
      "Exclusive Bronze Contributor Profile Frame",
      "+10% Global Ecosystem XP Multiplier",
      "+5% Vault Drop Luck Rate",
    ],
  },
  {
    tier: 2,
    id: "bubble_blaster",
    name: "Bubble Blaster",
    minAmount: 250,
    icon: "🫧",
    xpBoost: 15,
    vaultBoost: 10,
    tagline: "Enhanced Tactical Supporter",
    perks: [
      "Custom 3D Viewport Media Mode Access",
      "Exclusive Bubble Blaster Animated Skin",
      "+15% Global Ecosystem XP Multiplier",
      "+10% Vault Drop Luck Rate",
      "Supporter Discord Role & Lounge Access",
    ],
  },
  {
    tier: 3,
    id: "reef_ripper",
    name: "Reef Ripper",
    minAmount: 500,
    icon: "🌊",
    xpBoost: 20,
    vaultBoost: 15,
    tagline: "Elite Liquidity Commander",
    perks: [
      "Animated Profile Background & Hologram Aura",
      "Reef Ripper Mythic Cosmetic Pet Skin",
      "+20% Global Ecosystem XP Multiplier",
      "+15% Vault Drop Luck Rate",
      "Priority Raid Queue Privileges",
    ],
  },
  {
    tier: 4,
    id: "dolphinately_gassy",
    name: "Dolphinately Gassy",
    minAmount: 1000,
    icon: "🐬",
    xpBoost: 25,
    vaultBoost: 20,
    tagline: "Ecosystem Champion",
    perks: [
      "Exclusive Dolphinately Character Variant",
      "High-Frequency Forge Cost Discount (-15%)",
      "+25% Global Ecosystem XP Multiplier",
      "+20% Vault Drop Luck Rate",
      "Hall of Fame Contributor Pin",
    ],
  },
  {
    tier: 5,
    id: "whale_of_a_whiff",
    name: "Whale Of A Whiff",
    minAmount: 2500,
    icon: "🐋",
    xpBoost: 35,
    vaultBoost: 30,
    tagline: "Titan Supporter",
    perks: [
      "Glowing Cosmic Aura & Profile Banner",
      "+35% Global Ecosystem XP Multiplier",
      "+30% Vault Drop Luck Rate",
      "VIP Discord Access & Direct Feedback Council",
    ],
  },
  {
    tier: 6,
    id: "apex_fartboy",
    name: "Apex Fartboy",
    minAmount: 5000,
    icon: "👑",
    xpBoost: 50,
    vaultBoost: 50,
    tagline: "Ultimate Founder Rank",
    perks: [
      "Immortal Golden Avatar Aura & Title",
      "+50% Global Ecosystem XP Multiplier",
      "+50% Vault Drop Luck Rate",
      "Permanent Founder Status in Ecosystem Credits",
    ],
  },
];

interface ContributorTierStatusHeaderProps {
  className?: string;
}

export function ContributorTierStatusHeader({ className = "" }: ContributorTierStatusHeaderProps) {
  const player = useGameStore((s) => s.player);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState<number>(() => {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) return parseFloat(stored) || 0;
    const isPlayerContrib = checkIsContributor(player);
    return isPlayerContrib ? 50 : 0;
  });

  const refreshDonation = useCallback(() => {
    const stored = safeStorage.getItem("fartboy_user_donated_usd");
    if (stored !== null) {
      setDonatedAmount(parseFloat(stored) || 0);
    } else {
      setDonatedAmount(checkIsContributor(player) ? 50 : 0);
    }
  }, [player]);

  useEffect(() => {
    refreshDonation();
    const handleStorageChange = () => refreshDonation();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshDonation]);

  const isContributor = donatedAmount >= 50 || checkIsContributor(player);

  // Determine current tier
  let currentTier: SupporterTierDef | null = null;
  let nextTier: SupporterTierDef | null = SUPPORTER_TIERS[0];

  for (let i = SUPPORTER_TIERS.length - 1; i >= 0; i--) {
    if (donatedAmount >= SUPPORTER_TIERS[i].minAmount) {
      currentTier = SUPPORTER_TIERS[i];
      nextTier = SUPPORTER_TIERS[i + 1] || null;
      break;
    }
  }

  // Calculate progress toward next tier
  const baseAmount = currentTier ? currentTier.minAmount : 0;
  const targetAmount = nextTier ? nextTier.minAmount : currentTier?.minAmount || 50;
  const neededAmount = Math.max(0, targetAmount - donatedAmount);
  const progressPercent = nextTier
    ? Math.min(
        100,
        Math.max(0, Math.round(((donatedAmount - baseAmount) / (targetAmount - baseAmount)) * 100)),
      )
    : 100;

  const currentXpBoost = currentTier ? currentTier.xpBoost : 0;
  const currentVaultBoost = currentTier ? currentTier.vaultBoost : 0;

  return (
    <>
      <div
        id="contributor-tier-status-header"
        className={`relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 p-3.5 sm:p-4 shadow-xl font-mono ${className}`}
      >
        {/* Ambient subtle glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* LEFT: CURRENT PERK LEVEL & MULTIPLIERS */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300 border border-emerald-400/50">
                <Crown className="h-3 w-3 text-emerald-400" />
                CONTRIBUTOR STATUS HUD
              </span>

              {isContributor && currentTier ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black shadow-xs">
                  <span>{currentTier.icon}</span>
                  <span>
                    {currentTier.name} (Tier {currentTier.tier})
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold">
                  <Lock className="h-2.5 w-2.5 text-amber-400" />
                  UN-RANKED CONTRIBUTOR ($0)
                </span>
              )}
            </div>

            {/* BOOST MULTIPLIERS ROW */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-400 text-[11px]">XP Multiplier:</span>
                <span className="font-black text-emerald-300 text-xs">
                  +{currentXpBoost}% {currentXpBoost === 0 && "(Base)"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-sky-500/30 px-2.5 py-1 rounded-lg">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-slate-400 text-[11px]">Vault Luck:</span>
                <span className="font-black text-sky-300 text-xs">
                  +{currentVaultBoost}% {currentVaultBoost === 0 && "(Base)"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-slate-400 text-[11px]">Cosmetics:</span>
                <span className="font-black text-amber-300 text-xs">
                  {isContributor ? "Full 3D / Frames Enabled" : "Gated"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: NEXT TIER PREVIEW & PROGRESS */}
          {nextTier ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 min-w-[280px] lg:max-w-md shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  NEXT TIER: {nextTier.name} (${nextTier.minAmount})
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ${donatedAmount} / ${nextTier.minAmount}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Next Tier Specific Perk Unlock */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <p
                  className="text-[10px] text-slate-300 truncate max-w-[200px]"
                  title={nextTier.perks[0]}
                >
                  🎁 <span className="text-emerald-300 font-bold">{nextTier.perks[0]}</span>
                </p>
                <Button
                  size="sm"
                  onClick={() => setDonateOpen(true)}
                  className="h-6 px-2.5 text-[9.5px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-lg cursor-pointer shrink-0 shadow-xs"
                >
                  UPGRADE (${neededAmount})
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-3 text-center min-w-[240px] shrink-0">
              <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-400" />
                MAX SUPPORTER TIER ACHIEVED!
              </span>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Permanent Founder Status & Maximum Multipliers Active.
              </p>
            </div>
          )}
        </div>
      </div>

      <DonateMoreModal open={donateOpen} onOpenChange={setDonateOpen} />
    </>
  );
}
