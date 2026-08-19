import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Trophy,
  Clock,
  ArrowRight,
  Package,
  Star,
  ShoppingBag,
  Zap,
  Crown,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerHeaderSummary, type PlayerHeaderSummary } from "@/services/season";
import { useGameStore } from "@/store/gameStore";
import { DailyXpCapCard } from "./DailyXpCapCard";
import { XPTransactionHistoryList } from "./XPTransactionHistoryList";

/**
 * Winged Crest Icon component representing AAA Web3 League/Raid crest aesthetic.
 */
function WingedCrestIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M32 4L12 16V30C12 43 21 54 32 60C43 54 52 43 52 30V16L32 4Z"
        fill="url(#crest-bg)"
        stroke="#F59E0B"
        strokeWidth="2.5"
      />
      {/* Wing accents */}
      <path
        d="M8 20C2 12 4 4 16 8C20 18 16 26 8 20Z"
        fill="url(#wing-grad-l)"
        stroke="#FBBF24"
        strokeWidth="1.5"
      />
      <path
        d="M56 20C62 12 60 4 48 8C44 18 48 26 56 20Z"
        fill="url(#wing-grad-r)"
        stroke="#FBBF24"
        strokeWidth="1.5"
      />
      {/* Crown Skull Emblem */}
      <path d="M26 22L32 18L38 22L40 16L32 12L24 16L26 22Z" fill="#FDE047" />
      <path
        d="M24 28C24 24 28 22 32 22C36 22 40 24 40 28V36C40 40 36 42 32 42C28 42 24 40 24 36V28Z"
        fill="#1E293B"
        stroke="#F59E0B"
        strokeWidth="1.5"
      />
      {/* Glowing Eyes */}
      <circle cx="28.5" cy="30" r="2" fill="#34D399" className="animate-pulse" />
      <circle cx="35.5" cy="30" r="2" fill="#34D399" className="animate-pulse" />
      <path d="M28 36H36V39H28V36Z" fill="#F59E0B" />
      <defs>
        <linearGradient id="crest-bg" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#451A03" />
          <stop offset="0.5" stopColor="#18181B" />
          <stop offset="1" stopColor="#09090B" />
        </linearGradient>
        <linearGradient
          id="wing-grad-l"
          x1="8"
          y1="4"
          x2="16"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
        <linearGradient
          id="wing-grad-r"
          x1="56"
          y1="4"
          x2="48"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * AAA Web3 Gaming HUD Control Deck Header
 * Sourced from single API contract & real-time Zustand store.
 */
export function SeasonGlobalBanner() {
  const [headerData, setHeaderData] = useState<PlayerHeaderSummary | null>(null);

  // Real-time reactive updates from gameStore
  const packs = useGameStore((s) => s.packs);
  const player = useGameStore((s) => s.player);

  useEffect(() => {
    let isMounted = true;
    getPlayerHeaderSummary().then((data) => {
      if (isMounted) setHeaderData(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time reactive fallbacks from store
  const unopenedPacksCount = packs ? packs.length : (headerData?.unopenedPacksCount ?? 3);
  const spendableXP = player
    ? (player.spendableXP ?? player.xp)
    : (headerData?.spendableXP ?? 2890);

  const currentTier = 18;
  const totalTiers = 50; // Fixed 50 tiers to match Bible spec
  const progressPct = Math.min(100, Math.round((currentTier / totalTiers) * 100));

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-950 via-zinc-950 to-amber-950/30 p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-xl">
      {/* TOP GLOW ACCENT BAR */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 -bottom-16 h-40 w-64 rounded-full bg-purple-600/10 blur-3xl" />

      {/* ==================================================================== */}
      {/* TOP ROW: SEASON & PASS TRACKING BANNER */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-amber-500/25">
        {/* LEFT: ILLUMINATED BADGE & METADATA */}
        <div className="flex items-center gap-4 min-w-0">
          {/* ILLUMINATED CREST / BADGE FRAME */}
          <div className="relative grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-black to-amber-900/40 p-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <WingedCrestIcon className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-slate-950 border-2 border-amber-400 font-mono text-[10px] font-black text-amber-300 shadow">
              S1
            </span>
          </div>

          {/* BADGES & PROGRESS */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* ACTIVE SEASON BADGE */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />⚡ ACTIVE SEASON 1
              </span>

              {/* COUNTDOWN TIMER */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 font-mono text-xs font-bold text-amber-300 border border-amber-500/30 shadow-inner">
                <Clock className="h-3.5 w-3.5 text-amber-400" />⏳ 12 DAYS REMAINING
              </span>

              {/* PASS LEVEL PILL (FIXED 50 TIERS) */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 font-mono text-xs font-extrabold text-amber-200 border border-amber-500/30">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                PASS TIER {currentTier} / {totalTiers}
              </span>
            </div>

            {/* MAIN TITLE */}
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] leading-tight">
              Season 1: Rise of the Raider
            </h2>

            {/* SLEEK GLOWING DUAL-LAYER PROGRESS BAR */}
            <div className="max-w-lg space-y-1 pt-0.5">
              <div className="flex justify-between text-[11px] font-mono font-bold text-muted-foreground">
                <span className="text-amber-300/90">Season Progression</span>
                <span className="text-emerald-400 font-black">{progressPct}% Complete</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-black/80 border border-amber-500/40 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CTA ACTIONS */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          {/* LEADERBOARD BUTTON */}
          <Link to="/leaderboard" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/40 font-mono text-xs font-extrabold shadow-md h-11 px-4 gap-2 hover:border-amber-400 cursor-pointer"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </Button>
          </Link>

          {/* PULSING GOLD PASS REWARDS BUTTON */}
          <Link to="/season-pass" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] border-2 border-amber-300 hover:border-amber-100 hover:from-amber-300 hover:to-yellow-300 animate-pulse h-11 px-5 gap-2 cursor-pointer"
            >
              <span>PASS REWARDS</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BOTTOM ROW: RESOURCE & DIRECT ACTION DECK */}
      {/* ==================================================================== */}
      <div className="relative z-10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. LEFT CARD: VAULT PACKS */}
        <Link
          to="/packs"
          className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 to-amber-950/30 p-3.5 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-400 border border-amber-500/50 shadow-inner group-hover:scale-105 transition-transform">
              <Package className="h-6 w-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
                VAULT PACKS
              </span>
              <div className="font-display font-extrabold text-sm text-foreground truncate flex items-center gap-2">
                <span>Unopened Packs:</span>
                <span className="font-mono text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-400/50 font-black">
                  {unopenedPacksCount}
                </span>
              </div>
            </div>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors shrink-0">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        {/* 2. MIDDLE CARD: SPENDABLE BALANCE */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 to-amber-950/30 p-3.5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-black border border-amber-300 font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <Star className="h-6 w-6 fill-black" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
                SPENDABLE BALANCE
              </span>
              <div className="font-mono font-black text-base text-amber-300 truncate">
                ⭐ {spendableXP.toLocaleString()}{" "}
                <span className="text-xs text-amber-400/80 font-bold">SP-XP</span>
              </div>
            </div>
          </div>

          <Link to="/shop" className="shrink-0">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-mono text-xs font-black uppercase tracking-wider shadow-md h-9 px-3.5 cursor-pointer flex items-center gap-1.5 border border-amber-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>SHOP</span>
            </Button>
          </Link>
        </div>

        {/* 3. RIGHT CARD: ACTIVE RAID MISSIONS */}
        <Link
          to="/missions"
          className="group relative overflow-hidden rounded-xl border border-purple-500/40 bg-gradient-to-br from-slate-900/90 to-purple-950/40 p-3.5 hover:border-purple-400/70 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-inner group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-6 w-6 text-purple-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300 block">
                ACTIVE RAID MISSIONS
              </span>
              <h4 className="font-display font-extrabold text-xs text-foreground truncate group-hover:text-purple-300 transition-colors">
                🏆 Earn Bonus Packs & Badges
              </h4>
            </div>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-300 group-hover:bg-purple-400 group-hover:text-black transition-colors shrink-0">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* MERGED DAILY XP EFFICIENCY TRACKER & XP ACTIVITY LOG                 */}
      {/* ==================================================================== */}
      <div className="relative z-10 pt-4 border-t border-amber-500/20 mt-4 space-y-4">
        <DailyXpCapCard className="border-amber-500/30 bg-slate-950/80" />
        <XPTransactionHistoryList limit={5} />
      </div>
    </div>
  );
}
