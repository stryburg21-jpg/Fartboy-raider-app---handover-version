import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDailyMissionsStore } from "@/store/dailyMissionsStore";
import { useMissionsStore } from "@/services/missionsStore";
import { CompactMissionPacksRow } from "@/components/game/CompactMissionPacksRow";
import { ThreePacketUnboxingModal } from "@/components/game/ThreePacketUnboxingModal";
import { TacticalMissionBriefModal } from "@/components/game/TacticalMissionBriefModal";
import { Button } from "@/components/ui/button";
import { getTimeUntilUtcMidnight } from "@/services/missions";
import { audio } from "@/services/audio";
import { toast } from "sonner";
import {
  Trophy,
  Package,
  CheckCircle2,
  Sparkles,
  Dices,
  RefreshCw,
  Gift,
  Loader2,
  ArrowRight,
  RotateCcw,
  FlaskConical,
  Clock,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  BarChart2,
  Shield,
  Hammer,
} from "lucide-react";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";

export type DevDailyState = "auto" | "state1_unsealed" | "state2_active" | "state3_completed";

interface DailyMissionMasteryConsoleProps {
  variant?: "compact" | "full";
  className?: string;
  showDevToolbar?: boolean;
}

interface DirectiveItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BarChart2;
  progress: number;
  total: number;
  xpReward: number;
  isComplete: boolean;
  tag: string;
}

export function DailyMissionMasteryConsole({
  variant = "compact",
  className = "",
  showDevToolbar = true,
}: DailyMissionMasteryConsoleProps) {
  const navigate = useNavigate();
  const [resetTimer, setResetTimer] = useState<string>(() => getTimeUntilUtcMidnight());
  const [isDailyAccordionOpen, setIsDailyAccordionOpen] = useState<boolean>(true);
  const [viewTab, setViewTab] = useState<"cards" | "list">("cards");
  const [dailyUnboxingModalOpen, setDailyUnboxingModalOpen] = useState<boolean>(false);
  const [activeModalMission, setActiveModalMission] = useState<AutomatedMissionItem | null>(null);
  const [showDevTools, setShowDevTools] = useState<boolean>(false);
  const [devDailyState, setDevDailyState] = useState<DevDailyState>("auto");

  const {
    isDailyUnsealed,
    payload,
    fetchPayload,
    isRerolling,
    showGoldFlash,
    rerollsRemaining,
    claimingMastery,
    unsealDailyPacks,
    rerollFeatured,
    claimDailyMastery,
    devResetDailyState,
    devSetMasteryReady,
  } = useDailyMissionsStore();

  const { missions } = useMissionsStore();

  // Keep countdown timer synced
  useEffect(() => {
    if (!payload) {
      fetchPayload();
    }
    const interval = setInterval(() => {
      setResetTimer(getTimeUntilUtcMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, [payload, fetchPayload]);

  // Extract daily missions from payload or missionsStore
  const dailyCat = payload?.categories.find((c) => c.id === "daily");
  const dailyMissions: AutomatedMissionItem[] = useMemo(() => {
    if (dailyCat?.missions && dailyCat.missions.length > 0) {
      return dailyCat.missions;
    }
    const storeDaily = missions.filter((m) => m.category === "daily");
    if (storeDaily.length > 0) {
      return storeDaily.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.subtitle || m.description || "",
        baseRewardXP: m.xpReward || m.rewardXP || 500,
        xpReward: m.xpReward || m.rewardXP || 500,
        rarity: (m.tier || "epic").toLowerCase(),
        completedCount:
          m.completed || m.status === "claimed" ? m.maxProgress || 1 : m.progress || 0,
        totalRequired: m.maxProgress || m.total || 1,
        progress: m.progress || 0,
        requiredCount: m.maxProgress || m.total || 1,
        status: (m.status === "claimed"
          ? "claimed"
          : m.status === "verified"
            ? "verified"
            : (m.progress || 0) >= (m.maxProgress || 1)
              ? "claimable"
              : "unstarted") as AutomatedMissionItem["status"],
        isCompleted: m.completed || m.status === "claimed" || m.status === "verified",
        discordChannel: "#cto-official-post",
      }));
    }
    return [];
  }, [dailyCat, missions]);

  // Top 3 featured daily missions
  const featuredDailyMissions = useMemo(() => {
    return dailyMissions.slice(0, 3);
  }, [dailyMissions]);

  // Computed raw completion values
  const rawCompleted =
    payload?.dailyMastery?.completedCount ??
    dailyMissions.filter(
      (m) =>
        m.status === "verified" ||
        m.status === "claimed" ||
        m.status === "claimable" ||
        (m.completedCount !== undefined && m.completedCount >= (m.totalRequired || 1)) ||
        m.isCompleted,
    ).length;

  const totalDaily = payload?.dailyMastery?.totalRequired ?? 3;
  const rawRemaining = Math.max(0, totalDaily - rawCompleted);

  // Effective State calculation based on dev override or live store
  const effectiveIsUnsealed =
    devDailyState === "state1_unsealed"
      ? false
      : devDailyState === "state2_active" || devDailyState === "state3_completed"
        ? true
        : isDailyUnsealed;

  const dailyCompleted =
    devDailyState === "state1_unsealed"
      ? 0
      : devDailyState === "state2_active"
        ? 1
        : devDailyState === "state3_completed"
          ? 3
          : rawCompleted;

  const remainingDaily =
    devDailyState === "state1_unsealed"
      ? 3
      : devDailyState === "state2_active"
        ? 2
        : devDailyState === "state3_completed"
          ? 0
          : rawRemaining;

  const dailyPct = Math.min(100, Math.round((dailyCompleted / totalDaily) * 100));
  const dailyClaimed = !!payload?.dailyMastery?.claimed && devDailyState !== "state1_unsealed";
  const isDailyUnlocked = dailyCompleted >= totalDaily;

  // Active Directive Items Roster
  const activeDirectiveRows: DirectiveItem[] = useMemo(() => {
    return [
      {
        id: "dir_chart_breakdown",
        title: "CHART BREAKDOWN",
        subtitle: "Scout DexScreener / CoinGecko market charts & log breakout signals",
        icon: BarChart2,
        progress:
          devDailyState === "state3_completed" ? 3 : devDailyState === "state1_unsealed" ? 0 : 2,
        total: 3,
        xpReward: 500,
        isComplete: devDailyState === "state3_completed",
        tag: "#crypto-charts",
      },
      {
        id: "dir_shield_defend",
        title: "SHIELD & DEFEND",
        subtitle: "Engage in raid defense targets & verify reactions in Discord",
        icon: Shield,
        progress: devDailyState === "state1_unsealed" ? 0 : 1,
        total: 1,
        xpReward: 500,
        isComplete: devDailyState !== "state1_unsealed",
        tag: "#cto-official-post",
      },
      {
        id: "dir_forge_scrap",
        title: "FORGE SCRAP & TUNING",
        subtitle: "Execute 1 vault scrap transmutation or equipment tuning",
        icon: Hammer,
        progress: devDailyState === "state3_completed" ? 1 : 0,
        total: 1,
        xpReward: 500,
        isComplete: devDailyState === "state3_completed",
        tag: "#armory-forge",
      },
    ];
  }, [devDailyState]);

  const handleUnsealComplete = () => {
    unsealDailyPacks();
    toast.success("Daily Special Dossiers unsealed! Directives active in War Room.", {
      icon: "⚡",
    });
  };

  return (
    <div
      id="unified-daily-missions-master-container"
      className={`w-full max-w-full box-border overflow-hidden space-y-2 font-mono ${className}`}
    >
      {/* DEV STATE OVERRIDE TOOLBAR */}
      {showDevToolbar && (
        <div className="w-full max-w-full box-border overflow-hidden rounded-xl border border-dashed border-amber-500/40 bg-slate-950/80 p-2 text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-amber-300 font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
              <span>LIFECYCLE STATE SWITCHER (DEV OVERRIDE)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setDevDailyState("auto");
                toast.info("Dev state reset to live store sync.");
              }}
              className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-amber-300 font-bold cursor-pointer shrink-0 min-w-max text-xs px-2.5 py-1"
              title="Reset dev override to live store state"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>RESET TO AUTO</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setDevDailyState("auto");
                toast.info("State: Auto (Live Store Sync)");
              }}
              className={`px-2 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all cursor-pointer border shrink-0 ${
                devDailyState === "auto"
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60 hover:text-amber-300"
              }`}
            >
              AUTO (LIVE)
            </button>

            <button
              type="button"
              onClick={() => {
                setDevDailyState("state1_unsealed");
                toast.info("State 1: Unopened Daily Special Dossiers (Yellow Amber)");
              }}
              className={`px-2 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all cursor-pointer border shrink-0 ${
                devDailyState === "state1_unsealed"
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs animate-pulse"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60 hover:text-amber-300"
              }`}
            >
              STATE 1: SEALED
            </button>

            <button
              type="button"
              onClick={() => {
                setDevDailyState("state2_active");
                setIsDailyAccordionOpen(true);
                toast.info("State 2: Active / In-Progress (Daily Mission Master)");
              }}
              className={`px-2 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all cursor-pointer border shrink-0 ${
                devDailyState === "state2_active"
                  ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-xs"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-400/60 hover:text-emerald-300"
              }`}
            >
              STATE 2: ACTIVE ({remainingDaily}/{totalDaily})
            </button>

            <button
              type="button"
              onClick={() => {
                setDevDailyState("state3_completed");
                toast.info("State 3: All Completed (Gold Victory Box 🏆)");
              }}
              className={`px-2 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all cursor-pointer border shrink-0 ${
                devDailyState === "state3_completed"
                  ? "bg-teal-400 text-slate-950 border-teal-300 shadow-xs"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-teal-400/60 hover:text-teal-300"
              }`}
            >
              STATE 3: COMPLETED 🏆
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE 1: UNOPENED / SEALED (YELLOW AMBER BOX)
      ══════════════════════════════════════════════════════════════════════ */}
      {!effectiveIsUnsealed && (
        <div
          id="daily-dossiers-sealed-banner"
          onClick={() => {
            audio.play("button.click");
            setDailyUnboxingModalOpen(true);
          }}
          className="w-full max-w-full box-border overflow-hidden relative rounded-2xl sm:rounded-3xl border-2 sm:border-[2.5px] border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950/90 p-4 sm:p-5 shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:shadow-[0_0_55px_rgba(245,158,11,0.7)] hover:border-amber-300 transition-all cursor-pointer group active:scale-[0.99] touch-manipulation font-mono select-none animate-periodic-shake"
        >
          {/* Ambient pulsing background glow & shimmer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/30 via-amber-950/40 to-transparent animate-pulse" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent animate-[shimmer_2.5s_infinite] -skew-x-12" />

          {/* Corner HUD accents */}
          <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-amber-400" />
          <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-amber-400" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-amber-400" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-5 min-w-0">
            {/* Left Graphic & Callout text */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.9)] border border-amber-200 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-amber-300 font-mono text-[8px] sm:text-[8.5px] font-black shadow-md animate-bounce whitespace-nowrap">
                  3 DOSSIERS
                </span>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap pb-0.5 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5 shrink-0">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span>3 DAILY SPECIAL DOSSIERS</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
                    <Clock className="h-2.5 w-2.5 text-amber-400" />
                    <span>RESETS IN {resetTimer}</span>
                  </span>
                </div>

                <div className="text-xs sm:text-sm md:text-base font-black tracking-wide text-amber-100 uppercase group-hover:text-white transition-colors leading-snug truncate min-w-0">
                  3 UNOPENED DAILY SPECIAL DOSSIERS AVAILABLE — TAP TO UNSEAL NOW
                </div>

                <div className="text-[10px] sm:text-[11px] text-amber-200/90 font-sans font-normal mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Unseal today's 3 secret mission packets for instant XP drops, raid multipliers &
                  clan intel.
                </div>
              </div>
            </div>

            {/* Right Action Trigger: [⚡ UNSEAL 3 SPECIAL DOSSIERS] */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-0.5 sm:pt-0">
              <button
                type="button"
                id="btn-unseal-special-dossiers"
                onClick={(e) => {
                  e.stopPropagation();
                  audio.play("button.click");
                  setDailyUnboxingModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shrink-0 min-w-max text-xs px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-mono font-black uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.7)] cursor-pointer group-hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <Zap className="h-4 w-4 text-slate-950 fill-slate-950" />
                <span>⚡ UNSEAL 3 SPECIAL DOSSIERS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE 3: ALL COMPLETED (GOLD VICTORY BOX)
      ══════════════════════════════════════════════════════════════════════ */}
      {effectiveIsUnsealed && remainingDaily === 0 && (
        <div
          id="daily-dossiers-completed-card"
          className="w-full max-w-full box-border overflow-hidden min-h-[52px] font-mono text-xs font-black uppercase tracking-wider rounded-2xl p-3.5 sm:px-4 shadow-xl border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/80 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.4)] relative flex items-center justify-between flex-wrap sm:flex-nowrap gap-3"
        >
          {/* Celebratory ambient shimmer */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent animate-[shimmer_2.5s_infinite] -skew-x-12" />

          <div className="flex items-center gap-3 min-w-0 relative z-10 flex-1">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Trophy className="h-5 w-5 text-amber-400 animate-bounce" />
            </div>
            <div className="text-left font-mono min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black tracking-wide text-amber-200 flex items-center gap-2 flex-wrap">
                <span className="truncate min-w-0">🏆 ALL 3 DAILY MISSIONS CLEARED!</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full font-black shadow-xs whitespace-nowrap shrink-0">
                  3/3 VERIFIED 🏆
                </span>
              </div>
              <div className="text-[11px] text-amber-300/90 font-normal font-sans flex items-center gap-1.5 flex-wrap mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate min-w-0">
                  3/3 VERIFIED | PRIORITY MISSIONS RESET IN {resetTimer}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative z-10 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                audio.play("button.click");
                setDailyUnboxingModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/50 shrink-0 min-w-max text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-mono font-bold cursor-pointer transition-all shadow-xs"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>REVIEW DOSSIERS</span>
            </button>

            <Link to="/missions" className="shrink-0 min-w-max">
              <button
                type="button"
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 shrink-0 min-w-max text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-mono font-black cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <span>WAR ROOM ➔</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE 2: ACTIVE / IN-PROGRESS (UNIFIED DAILY MISSION MASTER VIEW)
      ══════════════════════════════════════════════════════════════════════ */}
      {effectiveIsUnsealed && remainingDaily > 0 && (
        <div
          id="unified-daily-mastery-console-active"
          className="w-full max-w-full box-border overflow-hidden rounded-2xl border border-amber-500/40 bg-zinc-950/95 p-3 sm:p-4 shadow-xl space-y-2.5 relative font-mono"
        >
          {/* GOLD FLASH EFFECT OVERLAY */}
          <AnimatePresence>
            {showGoldFlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-500/20 border-2 border-amber-400 z-30 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* ACCORDION HEADER BAR */}
          <div className="flex items-center justify-between gap-2.5 min-w-0 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shrink-0 border border-amber-300/40 shadow-xs">
                <Trophy className="h-4 w-4 fill-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-black text-xs sm:text-sm text-amber-200 tracking-wide uppercase truncate min-w-0 leading-tight flex items-center gap-1.5">
                  <span>🏆</span>
                  <span className="truncate min-w-0">DAILY MISSION MASTER</span>
                </h3>
              </div>
            </div>

            {/* STATUS PILL + VIEW TOGGLES + ACCORDION EXPAND */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="font-mono text-[10px] sm:text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap">
                <span className="text-amber-400 font-extrabold">{dailyCompleted}</span> /{" "}
                {totalDaily} Completed
              </span>

              {/* TOGGLE TAB PILLS (CARDS vs LIST) */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewTab("cards")}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-md transition-all cursor-pointer shrink-0 min-w-max ${
                    viewTab === "cards"
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎴 3D DOSSIERS
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("list")}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-md transition-all cursor-pointer shrink-0 min-w-max ${
                    viewTab === "list"
                      ? "bg-emerald-400 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📋 LIST
                </button>
              </div>

              {/* ACCORDION EXPAND/COLLAPSE TOGGLE */}
              <button
                type="button"
                onClick={() => setIsDailyAccordionOpen(!isDailyAccordionOpen)}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 shrink-0 min-w-max text-xs px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors shadow-xs"
                title="Toggle Daily Mission Master View"
              >
                <span className="hidden xs:inline text-[10px]">
                  {isDailyAccordionOpen ? "COLLAPSE" : "EXPAND"}
                </span>
                {isDailyAccordionOpen ? (
                  <ChevronUp className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* EXPLICIT STYLED PROGRESS BAR (6px height) */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyClaimed || isDailyUnlocked
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
              }`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>

          {/* ACCORDION EXPANDED BODY */}
          {isDailyAccordionOpen && (
            <div className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* TAB CONTENT: 3D DOSSIER CARDS (DEFAULT) */}
              {viewTab === "cards" && (
                <>
                  {featuredDailyMissions.length > 0 ? (
                    <CompactMissionPacksRow
                      featuredMissions={featuredDailyMissions}
                      isRerollingFeatured={isRerolling}
                    />
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-[#0E121A] p-4 text-center text-emerald-300 font-mono text-xs">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                      <p className="font-black">ALL FEATURED MASTERY MISSIONS COMPLETED!</p>
                    </div>
                  )}
                </>
              )}

              {/* TAB CONTENT: INLINE DIRECTIVES LIST VIEW */}
              {viewTab === "list" && (
                <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-slate-950/80 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-emerald-400" />
                      <span>ACTIVE DIRECTIVE ROSTER (INLINE VIEW)</span>
                    </span>
                    <span className="text-amber-400 font-bold">RESETS IN {resetTimer}</span>
                  </div>

                  <div className="space-y-1.5">
                    {activeDirectiveRows.map((dir, idx) => {
                      const Icon = dir.icon;
                      const pct = Math.min(
                        100,
                        Math.round((dir.progress / Math.max(1, dir.total)) * 100),
                      );

                      return (
                        <div
                          key={dir.id || `dir-${idx}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs gap-2 hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
                                dir.isComplete
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                  : "bg-slate-800 border-slate-700 text-slate-300"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0 flex-1 font-mono">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-black truncate ${
                                    dir.isComplete
                                      ? "text-emerald-300 line-through opacity-85"
                                      : "text-slate-100"
                                  }`}
                                >
                                  {dir.title}
                                </span>
                                <span className="text-[8px] bg-slate-950 px-1.5 py-0.2 rounded border border-slate-700 text-slate-400">
                                  {dir.tag}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans truncate">
                                {dir.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                            <div className="w-24 sm:w-28 space-y-0.5 font-mono text-right">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-slate-400">
                                  {dir.progress}/{dir.total}
                                </span>
                                <span className="text-amber-400 font-bold">+{dir.xpReward} XP</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    dir.isComplete
                                      ? "bg-emerald-400"
                                      : "bg-gradient-to-r from-amber-400 to-emerald-400"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-black border uppercase shrink-0 ${
                                dir.isComplete
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse"
                              }`}
                            >
                              {dir.isComplete ? "VERIFIED" : "ACTIVE"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ACTION FOOTER ROW (RE-ROLL / INSPECT) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => rerollFeatured()}
                    disabled={isRerolling || rerollsRemaining <= 0}
                    size="sm"
                    variant="outline"
                    className="h-7 sm:h-8 px-2.5 sm:px-3 font-mono text-[10px] sm:text-xs font-black uppercase text-amber-300 border border-amber-500/60 bg-amber-950/40 hover:bg-amber-500/20 gap-1.5 rounded-xl cursor-pointer disabled:opacity-50 shadow-xs active:scale-95 transition-all shrink-0 min-w-max text-xs px-2.5 py-1"
                  >
                    {isRerolling ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-300" />
                    ) : (
                      <Dices className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    )}
                    <span>🎲 RE-ROLL PACKS ({rerollsRemaining}/1)</span>
                  </Button>
                </div>

                <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                  {dailyClaimed ? (
                    <div className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-black text-amber-300 shadow-xs shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>✓ BONUS CLAIMED (+1,000 XP & PACK)</span>
                    </div>
                  ) : isDailyUnlocked ? (
                    <Button
                      type="button"
                      onClick={claimDailyMastery}
                      disabled={claimingMastery}
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border border-amber-300/50 cursor-pointer gap-1 shrink-0 min-w-max text-xs px-2.5 py-1 shadow-md animate-pulse"
                    >
                      {claimingMastery ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Gift className="h-3.5 w-3.5 fill-slate-950" />
                      )}
                      <span>CLAIM +1,000 XP & RAID PACK 🎉</span>
                    </Button>
                  ) : (
                    <Link to="/missions" className="shrink-0 min-w-max w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto h-7 sm:h-8 font-mono text-[10px] sm:text-xs font-black uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 border border-amber-300 gap-1.5 rounded-xl cursor-pointer shrink-0 min-w-max text-xs px-2.5 py-1 shadow-md active:scale-95 transition-all"
                      >
                        <span>INSPECT ALL MISSIONS</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNBOXING OVERLAY MODAL (TRIGGERED IN STATE 1 OR ON REVIEW) */}
      <ThreePacketUnboxingModal
        open={dailyUnboxingModalOpen}
        onClose={() => setDailyUnboxingModalOpen(false)}
        featuredMissions={featuredDailyMissions}
        onUnsealComplete={handleUnsealComplete}
      />

      {/* TACTICAL MISSION BRIEF MODAL */}
      {activeModalMission && (
        <TacticalMissionBriefModal
          mission={activeModalMission}
          open={!!activeModalMission}
          onClose={() => setActiveModalMission(null)}
        />
      )}
    </div>
  );
}
