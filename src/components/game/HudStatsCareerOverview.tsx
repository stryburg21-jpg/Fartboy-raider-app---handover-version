import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Award,
  Flame,
  Sparkles,
  Layers,
  Crown,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  BarChart3,
  Sliders,
  Terminal,
  Trophy,
  History,
  Info,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Item, Player } from "@/types/game";
import { calculateFullEconomy } from "@/services/economyEngine";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { StatInfoTooltip } from "./StatInfoTooltip";

interface HudStatsCareerOverviewProps {
  player: Player;
  itemsById?: Record<string, Item>;
  className?: string;
}

export function HudStatsCareerOverview({
  player,
  itemsById = {},
  className = "",
}: HudStatsCareerOverviewProps) {
  const inventory = useGameStore((s) => s.inventory);

  // Active Tab: "overview" | "career" | "simulator" | "dev_handover"
  const [activeTab, setActiveTab] = useState<"overview" | "career" | "simulator" | "dev_handover">(
    "overview",
  );

  // Live Simulator State Overrides
  const [simReputation, setSimReputation] = useState<number>(player.reputation ?? 850);
  const [simDailyXP, setSimDailyXP] = useState<number>(4120);
  const [simDivision, setSimDivision] = useState<string>("Gold");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Perform calculation via Economy Engine v3.1
  const econ = calculateFullEconomy(player, inventory, itemsById, {
    reputationScore: simReputation,
    dailyXP: simDailyXP,
    seasonalPrestigeDivision: simDivision,
  });

  const lifetimeStats = player.lifetimeStats ?? {
    raids: 428,
    memes: 89,
    videos: 34,
    packsOpened: 142,
    itemsCollected: 52,
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-[#0d0f12] p-4 sm:p-6 lg:p-7 shadow-2xl space-y-6 text-foreground font-sans ${className}`}
    >
      {/* HUD CHAMFERED ACCENTS */}
      <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-amber-400" />
      <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-amber-400" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-amber-400" />

      {/* HEADER BAR & TAB SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl shadow-lg border border-amber-300">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-black tracking-wider uppercase text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                HUD STATS & CAREER OVERVIEW
              </h2>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-black text-amber-300 border border-amber-500/40">
                BIBLE v3.1
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Dynamic Economy Engine • Dynamic Gear Multipliers & Career Totals
            </p>
          </div>
        </div>

        {/* HUD TABS */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#161920] p-1 border border-amber-500/30">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition-all ${
              activeTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> HUD Stats
          </button>

          <button
            onClick={() => setActiveTab("career")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition-all ${
              activeTab === "career"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" /> Career Totals
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition-all ${
              activeTab === "simulator"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" /> Live Simulator
          </button>

          <button
            onClick={() => setActiveTab("dev_handover")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition-all ${
              activeTab === "dev_handover"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60"
            }`}
          >
            <Code className="h-3.5 w-3.5" /> API Spec / JSON
          </button>
        </div>
      </div>

      {/* SECTION 1: HEADER CARD (ALWAYS VISIBLE SUMMARY HEADER) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#161920] via-[#11141a] to-[#0d0f12] p-4 shadow-xl">
        {/* PLAYER IDENTITY & BADGE */}
        <div className="md:col-span-5 flex items-center gap-3">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/30 via-slate-900 to-amber-950 border-2 border-amber-400 shadow-inner text-2xl">
            🦅
            <span className="absolute -top-1.5 -right-1.5 rounded bg-amber-400 px-1.5 py-0.2 font-mono text-[9px] font-black text-slate-950 shadow">
              LVL {player.level}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black text-amber-200 truncate">
                {player.username}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> VERIFIED
              </span>
            </div>

            <div className="font-mono text-xs text-amber-400/90 font-bold flex items-center gap-1 mt-0.5">
              <span>{econ.reputation.badgeEmoji}</span>
              <span>{econ.reputation.tierName}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{econ.reputation.multiplier}x XP</span>
            </div>

            <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              Specialist: {econ.specialistSet.activeCategory ?? "Raid Specialist"}
            </p>
          </div>
        </div>

        {/* GRAND TOTAL XP BOOST DISPLAY */}
        <div className="md:col-span-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> TOTAL ACTIVE XP BOOST
            </span>
            <div className="font-display text-2xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] mt-0.5">
              +{econ.effectiveMultiplier.toFixed(1)}% Boost
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5">
            <div className="text-amber-200 font-bold">6-Stat Standard Schema</div>
            <div className="text-emerald-400">Gear & Stats Active</div>
          </div>
        </div>

        {/* EFFECTIVE MULTIPLIER summary CHIP */}
        <div className="md:col-span-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> NET XP MULTIPLIER
              <StatInfoTooltip stat="xp_boost" size="xs" />
            </span>
            <div className="font-display text-2xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] mt-0.5">
              {econ.effectiveMultiplier.toFixed(2)}x
            </div>
          </div>
          <div className="text-right font-mono text-[9px] text-slate-400">
            <div className="text-emerald-300 font-bold">
              +{((econ.effectiveMultiplier - 1) * 100).toFixed(0)}% Boost
            </div>
            <div className="text-slate-400">Bible v3.1 Rule</div>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW (MAIN HUD STATS BREAKDOWN) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* SECTION 2: ACTIVE XP & MULTIPLIERS BREAKDOWN (ECONOMY BIBLE V3.1 RULES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3 className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                ACTIVE XP MULTIPLIERS (ECONOMY DESIGN BIBLE V3.1 VALIDATION)
              </h3>
              <span className="font-mono text-[10px] text-slate-400">
                Formula: (Base + Caps) × Rep × Decay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. EQUIPMENT XP BONUS (WITH +10.0% CAP VISUAL) */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 relative ${
                  econ.equipmentCap.isCapped
                    ? "border-amber-400/80 bg-gradient-to-b from-amber-950/30 to-[#161920]"
                    : "border-amber-500/30 bg-[#161920]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-amber-400" /> Equipment XP
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 font-mono text-[8px] font-black uppercase ${
                      econ.equipmentCap.isCapped
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {econ.equipmentCap.isCapped ? "CAP REACHED" : "+10% CAP"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-display text-xl font-black text-amber-300">
                    +{econ.equipmentCap.cappedBonusXP.toFixed(1)}%
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Raw: +{econ.equipmentCap.rawBonusXP.toFixed(1)}%
                  </div>
                </div>

                {/* VISUAL CAP PROGRESS BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span>Progress to Cap</span>
                    <span className="font-bold text-amber-300">
                      +{econ.equipmentCap.cappedBonusXP.toFixed(1)}% / +10.0% MAX
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 border border-amber-500/30 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        econ.equipmentCap.isCapped
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${econ.equipmentCap.capProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. SPECIALIST SET BONUS (+15% 7/7 EXCLUSIVITY) */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 ${
                  econ.specialistSet.is7of7Complete
                    ? "border-emerald-500/60 bg-gradient-to-b from-emerald-950/30 to-[#161920]"
                    : "border-amber-500/30 bg-[#161920]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" /> 7/7 Set Bonus
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 font-mono text-[8px] font-black uppercase ${
                      econ.specialistSet.is7of7Complete
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {econ.specialistSet.is7of7Complete ? "ACTIVE 7/7" : "INCOMPLETE"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-display text-xl font-black text-emerald-300">
                    +{econ.specialistSet.bonusXP.toFixed(1)}%
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    {econ.specialistSet.piecesEquipped}/7 Pieces
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-300 truncate">
                  {econ.specialistSet.bonusDescription}
                </p>
              </div>

              {/* 3. SEASONAL TITLE XP (+1% - +5% PRESTIGE DIVISION) */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 text-amber-400" /> Seasonal Title
                  </span>
                  <span className="font-mono text-[10px] text-amber-300 font-bold">
                    {econ.seasonalTitle.badgeEmoji} {econ.seasonalTitle.prestigeDivision}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-display text-xl font-black text-amber-300">
                    +{econ.seasonalTitle.bonusXP.toFixed(1)}%
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">Outside +10% Cap</div>
                </div>

                <p className="text-[10px] font-mono text-slate-400">
                  Earned via prior season Prestige division placement.
                </p>
              </div>

              {/* 4. REPUTATION MULTIPLIER (x0.5 - x1.5 TIER) */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-emerald-400" /> Reputation
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-300">
                    Score: {econ.reputation.score}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-display text-xl font-black text-emerald-300">
                    {econ.reputation.multiplier}x
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    {econ.reputation.tierName}
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-400">
                  Activity XP raw multiplier from score {econ.reputation.score}.
                </p>
              </div>
            </div>

            {/* DAILY DECAY CEILING MARGINAL RATE BANNER */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-[#161920] to-slate-950 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-amber-300">
                      DAILY XP DECAY CEILING (MARGINAL EARN RATE)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Today's Earned: {econ.decayCeiling.dailyXPEarned.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                <span className="rounded-lg bg-amber-500/20 px-3 py-1 font-mono text-xs font-black text-amber-300 border border-amber-500/40">
                  Current Earn Rate: {(econ.decayCeiling.marginalRate * 100).toFixed(0)}%
                </span>
              </div>

              {/* 5-TIER MARGINAL DECAY VISUAL */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { tier: 1, label: "0-2.5k", rate: "100%" },
                  { tier: 2, label: "2.5k-5k", rate: "75%" },
                  { tier: 3, label: "5k-7.5k", rate: "50%" },
                  { tier: 4, label: "7.5k-10k", rate: "25%" },
                  { tier: 5, label: "10k+", rate: "0%" },
                ].map((item) => {
                  const isActive = econ.decayCeiling.decayTier === item.tier;
                  return (
                    <div
                      key={item.tier}
                      className={`rounded-lg p-2 text-center border transition-all ${
                        isActive
                          ? "bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-md scale-[1.02]"
                          : "bg-slate-950/60 border-slate-800 text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="font-mono text-[9px] uppercase font-bold">{item.label}</div>
                      <div className="font-mono text-xs font-black text-amber-300">{item.rate}</div>
                      <div className="text-[8px] font-mono mt-0.5">
                        {isActive ? "ACTIVE TIER" : `Tier ${item.tier}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: ECONOMY & DROP LUCK SECTION */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              ECONOMY & DROP LUCK METRICS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PACK LUCK */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400">
                    📦 Pack Luck
                  </span>
                  <div className="font-display text-2xl font-black text-amber-300 mt-1">
                    +{econ.luck.packLuckPct.toFixed(1)}%
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Rare/Epic/Legendary/Mythic boost
                  </p>
                </div>
              </div>

              {/* COLLECTION LUCK */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400">
                    🏆 Collection Luck
                  </span>
                  <div className="font-display text-2xl font-black text-amber-300 mt-1">
                    +{econ.luck.collectionLuckPct.toFixed(1)}%
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Unique item drop rate multiplier
                  </p>
                </div>
              </div>

              {/* FORGE EFFICIENCY */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400">
                    🔨 Forge Efficiency
                  </span>
                  <div className="font-display text-2xl font-black text-amber-300 mt-1">
                    +{econ.luck.forgeEfficiencyPct.toFixed(1)}%
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Success chance & cost discount
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: 6-STAT MULTIPLIER BOOSTS */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              6-STAT MULTIPLIER BOOSTS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {[
                {
                  label: "GENERAL XP",
                  value: "+18%",
                  icon: "🚀",
                  color: "text-amber-400",
                },
                {
                  label: "RAID XP",
                  value: "+24%",
                  icon: "⚔️",
                  color: "text-red-400",
                },
                {
                  label: "CTO XP",
                  value: "+15%",
                  icon: "💻",
                  color: "text-sky-400",
                },
                {
                  label: "MISSIONS XP",
                  value: "+20%",
                  icon: "🎯",
                  color: "text-emerald-400",
                },
                {
                  label: "GRAPHIC XP",
                  value: "+12%",
                  icon: "🎨",
                  color: "text-purple-400",
                },
                {
                  label: "LUCK",
                  value: "+14%",
                  icon: "🍀",
                  color: "text-yellow-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-amber-500/20 bg-[#161920] p-3 text-center space-y-1 hover:border-amber-400 transition-colors"
                >
                  <div className="text-xl">{item.icon}</div>
                  <div className="font-mono text-[9px] font-black uppercase text-slate-400">
                    {item.label}
                  </div>
                  <div className={`font-display text-base font-black ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAREER & LIFETIME ENGAGEMENT */}
      {activeTab === "career" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              CAREER & LIFETIME ENGAGEMENT METRICS
            </h3>
            <span className="font-mono text-[10px] text-slate-400">Verifiable On-Chain Record</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                ⚔️ Verified Raids
              </div>
              <div className="font-display text-2xl font-black text-amber-300">
                {lifetimeStats.raids.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">100% Social Compliance</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                🐸 Approved Memes
              </div>
              <div className="font-display text-2xl font-black text-emerald-300">
                {lifetimeStats.memes.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">Community Approved</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                🎬 Approved Videos
              </div>
              <div className="font-display text-2xl font-black text-purple-300">
                {lifetimeStats.videos.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">Studio Certified</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                🎯 Completed Missions
              </div>
              <div className="font-display text-2xl font-black text-rose-300">215</div>
              <div className="text-[10px] font-mono text-slate-400">Daily/Weekly/Seasonal</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                📦 Vault Packs Opened
              </div>
              <div className="font-display text-2xl font-black text-cyan-300">
                {lifetimeStats.packsOpened.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">14 Legendary Pulls</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400">
                🔨 Anvil Forge Upgrades
              </div>
              <div className="font-display text-2xl font-black text-amber-300">78</div>
              <div className="text-[10px] font-mono text-slate-400">Item Level Enhancements</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400 flex items-center justify-between">
                <span>🏆 Lifetime XP Earned</span>
                <StatInfoTooltip stat="level" size="xs" />
              </div>
              <div className="font-display text-2xl font-black text-emerald-400">
                {(player.lifetimeXP ?? 482950).toLocaleString()} LT-XP
              </div>
              <div className="text-[10px] font-mono text-slate-400">Leaderboards & Prestige</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-1">
              <div className="font-mono text-[10px] uppercase font-black text-slate-400 flex items-center justify-between">
                <span>⚡ Spendable XP Balance</span>
                <StatInfoTooltip stat="spendable_xp" size="xs" />
              </div>
              <div className="font-display text-2xl font-black text-amber-400">
                {(player.spendableXP ?? 34820).toLocaleString()} SP-XP
              </div>
              <div className="text-[10px] font-mono text-slate-400">Vault & Upgrades</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-6 rounded-2xl border border-amber-500/30 bg-[#161920] p-5">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              LIVE ECONOMY SIMULATOR & VARIABLE TESTER
            </h3>
            <span className="font-mono text-[10px] text-slate-400">
              Test Bible v3.1 Recalculations In Real-Time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* REPUTATION SCORE SLIDER */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-black text-slate-300">Reputation Score</span>
                <span className="text-amber-400 font-bold">{simReputation} Score</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="25"
                value={simReputation}
                onChange={(e) => setSimReputation(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="font-mono text-[10px] text-slate-400 flex justify-between">
                <span>&lt;300 (0.5x)</span>
                <span>500 (1.0x)</span>
                <span>700 (1.25x)</span>
                <span>1000+ (1.5x)</span>
              </div>
            </div>

            {/* DAILY XP SLIDER */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-black text-slate-300">Daily XP Earned</span>
                <span className="text-amber-400 font-bold">{simDailyXP.toLocaleString()} XP</span>
              </div>
              <input
                type="range"
                min="0"
                max="12000"
                step="250"
                value={simDailyXP}
                onChange={(e) => setSimDailyXP(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="font-mono text-[10px] text-slate-400 flex justify-between">
                <span>0-2.5k (100%)</span>
                <span>5k (75%)</span>
                <span>7.5k (50%)</span>
                <span>10k+ (0%)</span>
              </div>
            </div>

            {/* PRIOR SEASON DIVISION SELECTOR */}
            <div className="space-y-2">
              <div className="font-mono text-xs font-black text-slate-300">
                Prior Season Prestige Division
              </div>
              <select
                value={simDivision}
                onChange={(e) => setSimDivision(e.target.value)}
                className="w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2 font-mono text-xs font-bold text-amber-300"
              >
                <option value="Bronze">Bronze Tier (+1.0% Seasonal XP)</option>
                <option value="Silver">Silver Tier (+2.0% Seasonal XP)</option>
                <option value="Gold">Gold Tier (+3.0% Seasonal XP)</option>
                <option value="Diamond">Diamond Tier (+4.0% Seasonal XP)</option>
                <option value="Master">Master / Prestige Tier (+5.0% Seasonal XP)</option>
              </select>
            </div>
          </div>

          {/* SIMULATED RESULT CARD */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-wider">
                ⚡ Recalculated Output
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSimReputation(player.reputation ?? 850);
                  setSimDailyXP(4120);
                  setSimDivision("Gold");
                }}
                className="font-mono text-[10px] border-amber-500/30 text-amber-300 bg-slate-900"
              >
                <RefreshCw className="mr-1 h-3 w-3" /> Reset to Defaults
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Capped Gear XP</span>
                <span className="font-black text-amber-300">
                  +{econ.equipmentCap.cappedBonusXP.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Specialist Set XP</span>
                <span className="font-black text-emerald-300">
                  +{econ.specialistSet.bonusXP.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reputation Mult</span>
                <span className="font-black text-amber-300">{econ.reputation.multiplier}x</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Net Effective Mult</span>
                <span className="font-black text-emerald-400">
                  {econ.effectiveMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEVELOPER HANDOVER HUB */}
      {activeTab === "dev_handover" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-400" />
              BACKEND DEVELOPER HANDOVER HUB
            </h3>
            <span className="font-mono text-[10px] text-slate-400">
              Ready-to-use JSON Schema & API Spec
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* JSON STRUCTURE BOX */}
            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-amber-400" /> mockPlayerData.json
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(JSON.stringify(econ, null, 2), "json")}
                  className="font-mono text-[10px] border-amber-500/30 text-amber-300 bg-slate-900"
                >
                  {copiedType === "json" ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" /> Copy JSON
                    </>
                  )}
                </Button>
              </div>

              <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-[10px] text-emerald-400 leading-relaxed border border-slate-800">
                {JSON.stringify(
                  {
                    spec: "Economy Design Bible v3.1",
                    playerId: player.id,
                    username: player.username,
                    reputation: econ.reputation,
                    equipmentCap: econ.equipmentCap,
                    specialistSet: econ.specialistSet,
                    seasonalTitle: econ.seasonalTitle,
                    decayCeiling: econ.decayCeiling,
                    powerRatings: econ.power,
                    effectiveMultiplier: econ.effectiveMultiplier,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            {/* API ENDPOINT SPECIFICATION BOX */}
            <div className="rounded-2xl border border-amber-500/30 bg-[#161920] p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-amber-400" /> API Endpoint Docs
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  3 Endpoints Defined
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400">
                      GET
                    </span>
                    /api/v1/player/hud-stats
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Fetches recalculated HUD stats, multipliers, active 7/7 sets & caps.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400">
                      GET
                    </span>
                    /api/v1/player/career-stats
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Returns lifetime verified raids, memes, videos, and currency totals.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] text-purple-400">
                      POST
                    </span>
                    /api/v1/player/equip-item
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Equips gear into slot and triggers instant server-side recalculation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
