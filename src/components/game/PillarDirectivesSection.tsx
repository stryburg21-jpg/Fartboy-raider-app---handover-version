import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Radio,
  Zap,
  Target,
  Gift,
  ExternalLink,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
  Sparkles,
  Hammer,
  Video,
  Flame,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { audio } from "@/services/audio";
import { MISSION_PILLARS, type MissionPillar } from "@/utils/missionPillars";
import { AutomatedMissionCard } from "@/components/game/AutomatedMissionCard";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";

interface RaidMilestone {
  pct: number;
  reward: string;
  unlocked: boolean;
}

interface CommunityRaidGoal {
  id: string;
  title: string;
  codename: string;
  pillar: MissionPillar;
  description: string;
  current: number;
  target: number;
  unit: string;
  actionUrl: string;
  actionButtonLabel: string;
  milestones: RaidMilestone[];
}

interface PillarDirectivesSectionProps {
  allMissions?: AutomatedMissionItem[];
  onRefresh?: () => void;
  onClaimSuccess?: (info: { title: string; xpEarned: number; packGranted?: string }) => void;
}

export function PillarDirectivesSection({
  allMissions = [],
  onRefresh,
  onClaimSuccess,
}: PillarDirectivesSectionProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>("ALL");

  const [raidGoals, setRaidGoals] = useState<CommunityRaidGoal[]>([
    {
      id: "raid_armory_forge",
      title: "ARMORY FORGE CALIBRATION",
      codename: "OP: COMBAT RECON",
      pillar: "FORGE_ARMORY",
      description: "Forge item upgrades, pack openings, and battle equipment calibrations.",
      current: 460,
      target: 500,
      unit: "Calibrations",
      actionUrl: "/armory",
      actionButtonLabel: "OPEN ARMORY FORGE",
      milestones: [
        { pct: 25, reward: "+500 Armory XP", unlocked: true },
        { pct: 50, reward: "+2,500 Server Multiplier", unlocked: true },
        { pct: 75, reward: "Rare Scrap Cache", unlocked: true },
        { pct: 100, reward: "🎁 'System Vanguard' Title", unlocked: false },
      ],
    },
    {
      id: "raid_retweet_storm",
      title: "TACTICAL DISCORD RAID SQUAD",
      codename: "OP: INTEL AMPLIFIER",
      pillar: "TACTICAL_RAIDS",
      description:
        "Amplify official announcements across #cto-official-post and partner sniper channels.",
      current: 780,
      target: 1000,
      unit: "Raids",
      actionUrl: "https://discord.com/channels/fartboy/cto-official-post",
      actionButtonLabel: "JOIN RAID SQUAD",
      milestones: [
        { pct: 25, reward: "+1,000 Global XP", unlocked: true },
        { pct: 50, reward: "Supply Pack Airdrop", unlocked: true },
        { pct: 75, reward: "2x XP Happy Hour", unlocked: true },
        { pct: 100, reward: "🎁 Specialist Pack to All", unlocked: false },
      ],
    },
    {
      id: "raid_meme_warfare",
      title: "PSY-OP MEMETIC DOMINANCE",
      codename: "OP: PSY-OP PROPAGANDA",
      pillar: "PSYOP_CONTENT",
      description:
        "Syndicate original memes, viral clips, and graphics in #content-creation & #memes.",
      current: 88,
      target: 100,
      unit: "Assets",
      actionUrl: "https://discord.com/channels/fartboy/content-creation",
      actionButtonLabel: "DEPLOY CONTENT",
      milestones: [
        { pct: 25, reward: "500 XP Boost", unlocked: true },
        { pct: 50, reward: "Exclusive Frame", unlocked: true },
        { pct: 75, reward: "Community Badge", unlocked: true },
        { pct: 100, reward: "🎁 5,000 XP Treasury Drop", unlocked: false },
      ],
    },
    {
      id: "raid_warchest_surge",
      title: "WAR CHEST & BOOST FORTIFICATION",
      codename: "OP: TREASURY FORTIFICATION",
      pillar: "WARCHEST_BOOSTS",
      description:
        "Amplify community marketing treasury, DexScreener rocket boosts, and platform upvotes.",
      current: 342,
      target: 400,
      unit: "Boosts",
      actionUrl: "https://discord.com/channels/fartboy/war-chest",
      actionButtonLabel: "CONTRIBUTE BOOST",
      milestones: [
        { pct: 25, reward: "+5% Multiplier", unlocked: true },
        { pct: 50, reward: "+10% Multiplier", unlocked: true },
        { pct: 75, reward: "Specialist Pack Drop", unlocked: true },
        { pct: 100, reward: "🎁 24H Raid Frenzy Mode", unlocked: false },
      ],
    },
  ]);

  const handleContribute = (goal: CommunityRaidGoal) => {
    audio.play("mission.complete");
    if (goal.actionUrl.startsWith("/")) {
      window.location.href = goal.actionUrl;
    } else {
      window.open(goal.actionUrl, "_blank", "noopener,noreferrer");
    }
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-bold text-cyan-300 font-display">
          📡 Directive Link Active: {goal.title}
        </span>
        <span className="text-xs text-slate-300 font-mono">
          Redirecting to operational channel. Your progress syncs automatically.
        </span>
      </div>,
    );
  };

  const filteredGoals =
    selectedPillar === "ALL" ? raidGoals : raidGoals.filter((g) => g.pillar === selectedPillar);

  return (
    <div id="pillar-directives-section" className="space-y-4 font-mono">
      {/* 4 PILLARS FILTER / OVERVIEW HEADER */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-base sm:text-lg text-white tracking-tight">
                  FOUR PILLAR DIRECTIVES
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 text-[9px] font-black uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  LIVE CTO SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Standardized operations aligned strictly with the 4 core ecosystem pillars.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-300 shrink-0">
            <Users className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Active Squad: <span className="text-white font-black">1,482 Raiders</span>
            </span>
          </div>
        </div>

        {/* 4 PILLAR SELECTOR CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setSelectedPillar("ALL")}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
              selectedPillar === "ALL"
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>ALL PILLARS</span>
          </button>

          {Object.values(MISSION_PILLARS).map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = selectedPillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillar(pillar.id)}
                className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 truncate ${
                  isSelected
                    ? `${pillar.badgeClass} ring-2 ring-amber-400 font-black shadow-md`
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">[{pillar.shortLabel}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PILLAR CO-OP GOALS LIST */}
      <div className="grid gap-3.5">
        {filteredGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const pillarInfo = MISSION_PILLARS[goal.pillar];
          const PillarIcon = pillarInfo.icon;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-800/90 bg-slate-950/90 hover:border-cyan-500/40 p-4 transition-all shadow-md space-y-3"
            >
              {/* ROW 1: HEADER & STATS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                    <PillarIcon className="h-4.5 w-4.5 text-cyan-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[8.5px] font-black rounded-md border uppercase ${pillarInfo.badgeClass}`}
                      >
                        [{pillarInfo.shortLabel}]
                      </span>
                      <h3 className="font-display font-black text-sm sm:text-base text-white tracking-tight truncate">
                        {goal.title}
                      </h3>
                      <span className="hidden sm:inline text-[10px] text-cyan-400/80 font-extrabold">
                        [{goal.codename}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-xl">{goal.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs font-black text-white">
                      <span className="text-cyan-300 font-extrabold">
                        {goal.current.toLocaleString()}
                      </span>{" "}
                      / {goal.target.toLocaleString()} {goal.unit}
                    </div>
                    <div className="text-[10px] text-cyan-400/80 font-bold">{pct}% COMPLETE</div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleContribute(goal)}
                    className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer gap-1.5"
                  >
                    <span>{goal.actionButtonLabel}</span>
                    <ExternalLink className="h-3 w-3 stroke-[2.5]" />
                  </Button>
                </div>
              </div>

              {/* ROW 2: PROGRESS BAR WITH MILESTONE TICK-MARKS */}
              <div className="space-y-1.5">
                <div className="relative h-2.5 w-full bg-slate-900 rounded-full border border-slate-800 overflow-visible">
                  {/* Progress Fill */}
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-300 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />

                  {/* Milestone Tick Marks */}
                  {[25, 50, 75, 100].map((tick) => {
                    const isReached = pct >= tick;
                    return (
                      <div
                        key={`tick-${tick}`}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                        style={{ left: `${tick}%` }}
                      >
                        <div
                          className={`h-3 w-3 rounded-full border-2 transition-all ${
                            isReached
                              ? "bg-amber-400 border-white scale-110 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                              : "bg-slate-800 border-slate-600"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Milestone Reward Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {goal.milestones.map((m) => (
                    <div
                      key={m.pct}
                      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold border transition-all ${
                        m.unlocked
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900/60 border-slate-800 text-slate-500"
                      }`}
                    >
                      {m.unlocked ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="h-3 w-3 text-slate-600 shrink-0" />
                      )}
                      <span className="font-extrabold">{m.pct}%:</span>
                      <span className="truncate">{m.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
