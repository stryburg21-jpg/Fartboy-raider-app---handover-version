import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { AutomatedMissionCard } from "@/components/game/AutomatedMissionCard";
import { BubbleBlasterExpeditionTrack } from "@/components/game/BubbleBlasterExpeditionTrack";
import { FutureIdeasView } from "@/components/game/FutureIdeasView";
import { ContributorTierStatusHeader } from "@/components/game/ContributorTierStatusHeader";
import { FlyingParticlesOverlay } from "@/components/game/FlyingParticlesOverlay";
import { DailyMissionMasteryConsole } from "@/components/game/DailyMissionMasteryConsole";
import { useMissionsStore } from "@/services/missionsStore";
import { MISSION_PILLARS } from "@/utils/missionPillars";
import {
  Radio,
  Target,
  Sparkles,
  Ticket,
  CheckCircle2,
  Gift,
  Zap,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/missions")({ component: MissionsPage });

type MissionsTab = "daily" | "weekly" | "seasonal" | "pass" | "completed";

interface RewardModalState {
  open: boolean;
  title: string;
  xpEarned: number;
  packGranted?: string;
}

export function MissionsPage() {
  const location = useRouterState({ select: (s) => s.location });
  const [activeTab, setActiveTab] = useState<MissionsTab>("daily");
  const [showFutureIdeasView, setShowFutureIdeasView] = useState<boolean>(false);
  const [seasonalPillarFilter, setSeasonalPillarFilter] = useState<string>("ALL");
  const [completedPillarFilter, setCompletedPillarFilter] = useState<string>("ALL");
  const [rewardModal, setRewardModal] = useState<RewardModalState | null>(null);

  // Connect to reactive Missions State Store (Developer Ready)
  const {
    missions,
    rerollsLeft,
    claimMission,
    claimAllCompleted,
    deployMission,
    rerollMission,
    resetToDefaults,
  } = useMissionsStore();

  // Sync URL search params with active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    const viewParam = searchParams.get("view");

    if (viewParam === "roadmap" || tabParam === "ideas") {
      setShowFutureIdeasView(true);
      setActiveTab("pass");
    } else if (tabParam === "pass") {
      setActiveTab("pass");
      setShowFutureIdeasView(false);
    } else if (tabParam === "weekly") {
      setActiveTab("weekly");
    } else if (
      tabParam === "seasonal" ||
      tabParam === "pillars" ||
      tabParam === "squad" ||
      tabParam === "directives"
    ) {
      setActiveTab("seasonal");
    } else if (tabParam === "completed") {
      setActiveTab("completed");
    } else if (tabParam === "daily") {
      setActiveTab("daily");
    }
  }, [location.search]);

  // Derived Filtered Mission Lists
  const dailyMissions = useMemo(
    () => missions.filter((m) => m.category === "daily" && m.status !== "claimed"),
    [missions],
  );

  const weeklyMissions = useMemo(
    () => missions.filter((m) => m.category === "weekly" && m.status !== "claimed"),
    [missions],
  );

  const seasonalMissions = useMemo(() => {
    const list = missions.filter(
      (m) =>
        (m.category === "seasonal" || m.category === ("milestones" as unknown)) &&
        m.status !== "claimed",
    );
    if (seasonalPillarFilter === "ALL") return list;
    return list.filter((m) => (m as { pillar?: string }).pillar === seasonalPillarFilter);
  }, [missions, seasonalPillarFilter]);

  const completedMissions = useMemo(() => {
    const list = missions.filter((m) => m.status === "claimed" || m.status === "verified");
    if (completedPillarFilter === "ALL") return list;
    return list.filter((m) => (m as { pillar?: string }).pillar === completedPillarFilter);
  }, [missions, completedPillarFilter]);

  // All Claimable Missions across active sets
  const claimableMissions = useMemo(() => {
    return missions.filter((m) => {
      const total = m.maxProgress || m.totalRequired || 1;
      const count = m.progress !== undefined ? m.progress : m.completedCount || 0;
      return (
        m.status === "claimable" ||
        (count >= total && m.status !== "claimed" && m.status !== "verified")
      );
    });
  }, [missions]);

  const totalClaimableXP = useMemo(() => {
    return claimableMissions.reduce(
      (sum, m) => sum + (m.xpReward || m.baseRewardXP || m.xpBounty || 500),
      0,
    );
  }, [claimableMissions]);

  // Handle Individual Card Claim
  const handleCardClaim = async (id: string) => {
    const res = await claimMission(id);
    if (res.success) {
      setRewardModal({
        open: true,
        title: res.title,
        xpEarned: res.xpEarned,
        packGranted: res.packGranted,
      });
    }
  };

  // Handle Bulk Claim All
  const handleClaimAll = async () => {
    const res = await claimAllCompleted();
    if (res.success) {
      setRewardModal({
        open: true,
        title: `CLAIMED ${res.totalClaimed} DIRECTIVES`,
        xpEarned: res.totalXpEarned,
        packGranted:
          res.packsGranted.length > 0 ? `${res.packsGranted.length}x Bonus Pack` : undefined,
      });
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 font-mono">
        {/* ══════════════════════════════════════════════════════════════════════
            1. PAGE TITLE & CLEAN HEADER (NO HERO BLOAT OR UNBOX BUTTONS)
        ══════════════════════════════════════════════════════════════════════ */}
        <PageHeader
          title="MISSIONS"
          subtitle="Complete tactical directives, earn spendable XP, and unlock tier rewards."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-slate-500 hover:text-slate-300 border border-slate-800 bg-slate-900/40 text-[11px] font-bold gap-1.5 cursor-pointer"
              title="Reset mock missions state"
            >
              <RotateCcw className="h-3 w-3" />
              <span>RESET DEMO</span>
            </Button>
          }
        />

        {/* ══════════════════════════════════════════════════════════════════════
            2. DAILY MISSION MASTER HERO BANNER & DOSSIER GRID
        ══════════════════════════════════════════════════════════════════════ */}
        <DailyMissionMasteryConsole variant="compact" />

        {/* ══════════════════════════════════════════════════════════════════════
            3. CLEAN 5-TAB BAR NAVIGATION
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs scrollbar-none">
          {/* TAB 1: DAILY BOUNTIES */}
          <button
            type="button"
            id="tab-daily-bounties"
            onClick={() => {
              setActiveTab("daily");
              setShowFutureIdeasView(false);
            }}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "daily"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <Radio className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>DAILY BOUNTIES</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === "daily"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {dailyMissions.length}
            </span>
            {dailyMissions.some(
              (m) =>
                m.status === "claimable" ||
                ((m.progress || 0) >= (m.maxProgress || 1) && m.status !== "claimed"),
            ) && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />}
          </button>

          {/* TAB 2: WEEKLY CAMPAIGNS */}
          <button
            type="button"
            id="tab-weekly-campaigns"
            onClick={() => {
              setActiveTab("weekly");
              setShowFutureIdeasView(false);
            }}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "weekly"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <Target className="h-4 w-4 text-sky-400 shrink-0" />
            <span>WEEKLY CAMPAIGNS</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === "weekly"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {weeklyMissions.length}
            </span>
            {weeklyMissions.some(
              (m) =>
                m.status === "claimable" ||
                ((m.progress || 0) >= (m.maxProgress || 1) && m.status !== "claimed"),
            ) && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />}
          </button>

          {/* TAB 3: SEASONAL DIRECTIVES */}
          <button
            type="button"
            id="tab-seasonal-directives"
            onClick={() => {
              setActiveTab("seasonal");
              setShowFutureIdeasView(false);
            }}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "seasonal"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
            <span>SEASONAL DIRECTIVES</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === "seasonal"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {seasonalMissions.length}
            </span>
          </button>

          {/* TAB 4: SEASON PASS */}
          <button
            type="button"
            id="tab-season-pass"
            onClick={() => {
              setActiveTab("pass");
              setShowFutureIdeasView(false);
            }}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "pass"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <Ticket className="h-4 w-4 text-amber-300 shrink-0" />
            <span>SEASON PASS</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === "pass" ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-400"
              }`}
            >
              50 TIERS
            </span>
          </button>

          {/* TAB 5: COMPLETED */}
          <button
            type="button"
            id="tab-completed-archive"
            onClick={() => {
              setActiveTab("completed");
              setShowFutureIdeasView(false);
            }}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "completed"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>COMPLETED</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === "completed"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {completedMissions.length}
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STICKY CLAIM ALL REWARDS BAR (WHEN OBJECTIVES ARE READY)
        ══════════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {claimableMissions.length > 0 && activeTab !== "pass" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full bg-gradient-to-r from-amber-950/90 via-slate-950 to-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-md">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm text-white">
                      {claimableMissions.length} DIRECTIVE
                      {claimableMissions.length > 1 ? "S" : ""} READY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      +{totalClaimableXP.toLocaleString()} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Click to claim all completed mission bounties simultaneously.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleClaimAll}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg cursor-pointer animate-pulse shrink-0 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>CLAIM ALL ({claimableMissions.length})</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: [DAILY BOUNTIES] VIEW (UNIFORM CARD SYSTEM)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "daily" && (
          <motion.div
            key="tab-daily"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {dailyMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyMissions.map((item, idx) => (
                  <AutomatedMissionCard
                    key={item.id}
                    item={item}
                    missionNumber={idx + 1}
                    canReroll={rerollsLeft > 0}
                    rerollsLeft={rerollsLeft}
                    onClaim={handleCardClaim}
                    onDeploy={deployMission}
                    onReroll={rerollMission}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-400 font-mono space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="font-display font-black text-base text-white">
                  ALL DAILY BOUNTIES COMPLETED!
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You have cleared all active daily bounties. View your verified accomplishments in
                  the Completed tab.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: [WEEKLY CAMPAIGNS] VIEW (UNIFORM CARD SYSTEM)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "weekly" && (
          <motion.div
            key="tab-weekly"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {weeklyMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyMissions.map((item, idx) => (
                  <AutomatedMissionCard
                    key={item.id}
                    item={item}
                    missionNumber={idx + 1}
                    onClaim={handleCardClaim}
                    onDeploy={deployMission}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-400 font-mono space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="font-display font-black text-base text-white">
                  ALL WEEKLY CAMPAIGNS COMPLETED!
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You have cleared all active weekly campaigns. Check the Completed tab for your
                  achievements.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: [SEASONAL DIRECTIVES] VIEW (UNIFORM CARD SYSTEM)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "seasonal" && (
          <motion.div
            key="tab-seasonal"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* PILLAR FILTER CHIPS */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
                <Filter className="h-3.5 w-3.5 text-amber-400" />
                <span>Pillar:</span>
              </div>
              <button
                type="button"
                onClick={() => setSeasonalPillarFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer border ${
                  seasonalPillarFilter === "ALL"
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                ALL PILLARS (
                {missions.filter((m) => m.category === "seasonal" && m.status !== "claimed").length}
                )
              </button>
              {Object.values(MISSION_PILLARS).map((p) => {
                const count = missions.filter(
                  (m) =>
                    m.category === "seasonal" &&
                    (m as { pillar?: string }).pillar === p.id &&
                    m.status !== "claimed",
                ).length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSeasonalPillarFilter(p.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                      seasonalPillarFilter === p.id
                        ? "bg-slate-800 text-white border-amber-400/60 shadow-xs"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>

            {seasonalMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonalMissions.map((item, idx) => (
                  <AutomatedMissionCard
                    key={item.id}
                    item={item}
                    missionNumber={idx + 1}
                    onClaim={handleCardClaim}
                    onDeploy={deployMission}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-400 font-mono space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="font-display font-black text-base text-white">
                  ALL SEASONAL DIRECTIVES CLEARED!
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All active seasonal directives in this pillar have been accomplished.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: [SEASON PASS] VIEW (50-TIER EXPEDITION TRACK & CONTRIBUTOR PASS)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "pass" && (
          <motion.div
            key="tab-pass"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* $50 CONTRIBUTOR PASS STATUS & UNLOCK HERO BANNER */}
            <ContributorTierStatusHeader />

            {/* 50-TIER EXPEDITION TRACK */}
            {showFutureIdeasView ? (
              <FutureIdeasView onBack={() => setShowFutureIdeasView(false)} />
            ) : (
              <BubbleBlasterExpeditionTrack />
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: [COMPLETED] VIEW (UNIFORM CARD SYSTEM + GREEN OVERLAY)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "completed" && (
          <motion.div
            key="tab-completed"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* STATS & PILLAR FILTER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-display font-black text-sm text-white">
                  ARCHIVED DIRECTIVES ({completedMissions.length})
                </span>
              </div>

              {/* PILLAR FILTER CHIPS */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompletedPillarFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                    completedPillarFilter === "ALL"
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  ALL (
                  {missions.filter((m) => m.status === "claimed" || m.status === "verified").length}
                  )
                </button>
                {Object.values(MISSION_PILLARS).map((p) => {
                  const count = missions.filter(
                    (m) =>
                      (m.status === "claimed" || m.status === "verified") &&
                      (m as { pillar?: string }).pillar === p.id,
                  ).length;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCompletedPillarFilter(p.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                        completedPillarFilter === p.id
                          ? "bg-slate-800 text-white border-amber-400/50 shadow-xs"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
                      }`}
                    >
                      <span>[{p.shortLabel}]</span>
                      <span className="text-[9px] text-slate-500 font-normal">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UNIFORM COMPLETED CARDS GRID */}
            {completedMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMissions.map((item, idx) => (
                  <AutomatedMissionCard
                    key={item.id}
                    item={item}
                    missionNumber={idx + 1}
                    showCompletedOverlay={true}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-400 font-mono space-y-2">
                <CheckCircle2 className="h-10 w-10 text-slate-600 mx-auto" />
                <h4 className="font-display font-black text-base text-slate-300">
                  NO COMPLETED MISSIONS YET
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Complete and claim objectives from the Daily Bounties, Weekly Campaigns, or
                  Seasonal Directives tabs to populate your archive.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* FLYING REWARD PARTICLES OVERLAY */}
      <FlyingParticlesOverlay />

      {/* REWARD CELEBRATION MODAL */}
      {rewardModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center font-mono space-y-5">
            <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-bounce">
              <Gift className="h-9 w-9" />
            </div>

            <div>
              <span className="text-[11px] font-black text-amber-400 tracking-widest uppercase">
                DIRECTIVE ACCOMPLISHED
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                {rewardModal.title}
              </h2>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Experience Credited:</span>
                <span className="font-black text-amber-300 flex items-center gap-1">
                  <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />+
                  {rewardModal.xpEarned.toLocaleString()} XP
                </span>
              </div>
              {rewardModal.packGranted && (
                <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-2">
                  <span className="text-slate-400 font-medium">Bonus Reward:</span>
                  <span className="font-black text-emerald-400">🎁 {rewardModal.packGranted}</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setRewardModal(null)}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg cursor-pointer"
            >
              CONTINUE OPERATIONS →
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
