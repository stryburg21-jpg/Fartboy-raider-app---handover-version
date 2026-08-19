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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { audio } from "@/services/audio";
import { getMissionPillar, MISSION_PILLARS } from "@/utils/missionPillars";

interface RaidMilestone {
  pct: number;
  reward: string;
  unlocked: boolean;
}

interface CommunityRaidGoal {
  id: string;
  title: string;
  codename: string;
  pillar: "TACTICAL_RAIDS" | "PSYOP_CONTENT" | "WARCHEST_BOOSTS" | "FORGE_ARMORY";
  description: string;
  current: number;
  target: number;
  unit: string;
  actionUrl: string;
  actionButtonLabel: string;
  milestones: RaidMilestone[];
}

export function CommunityCoopRaidSection() {
  const [raidGoals, setRaidGoals] = useState<CommunityRaidGoal[]>([
    {
      id: "raid_retweet_storm",
      title: "OPERATION MEGAPHONE",
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
      title: "MEMETIC FIREWALL",
      codename: "OP: PSY-OP PROPAGANDA",
      pillar: "PSYOP_CONTENT",
      description:
        "Syndicate original memes, viral clips, and graphics to break through crypto algorithmic siloes.",
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
      title: "WAR CHEST CATALYST",
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
    {
      id: "raid_system_recon",
      title: "ARMORY PEN-TEST VANGUARD",
      codename: "OP: COMBAT RECON",
      pillar: "FORGE_ARMORY",
      description:
        "Perform Forge calibrations, gear upgrades, and battle equipment stress-testing.",
      current: 460,
      target: 500,
      unit: "Calibrations",
      actionUrl: "https://discord.com/channels/fartboy/cto-alliances",
      actionButtonLabel: "TRANSMIT LOGS",
      milestones: [
        { pct: 25, reward: "+500 Armory XP", unlocked: true },
        { pct: 50, reward: "+2,500 Server Multiplier", unlocked: true },
        { pct: 75, reward: "Rare Scrap Cache", unlocked: true },
        { pct: 100, reward: "🎁 'System Vanguard' Title", unlocked: false },
      ],
    },
  ]);

  const handleContribute = (goal: CommunityRaidGoal) => {
    audio.play("mission.complete");
    window.open(goal.actionUrl, "_blank", "noopener,noreferrer");
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-bold text-cyan-300 font-display">
          📡 Squad Uplink Established: {goal.title}
        </span>
        <span className="text-xs text-slate-300 font-mono">
          Redirecting to operational channel. Your telemetry will be synced by bot.
        </span>
      </div>,
    );
  };

  return (
    <div id="community-coop-raids-section" className="space-y-4 font-mono">
      {/* SQUAD OVERVIEW BANNER */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-base sm:text-lg text-white tracking-tight">
                GLOBAL CO-OP SQUAD RAIDS
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 text-[9px] font-black uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Collaborative community milestones. Every operative contributes toward unlocking
              server-wide rewards.
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

      {/* SLEEK HORIZONTAL PROGRESS METERS LIST */}
      <div className="grid gap-3.5">
        {raidGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const pillarInfo = MISSION_PILLARS[goal.pillar];
          const PillarIcon = pillarInfo.icon;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-800/90 bg-slate-950/90 hover:border-cyan-500/40 p-3.5 sm:p-4 transition-all shadow-md space-y-3"
            >
              {/* ROW 1: HEADER & STATS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                    <PillarIcon className="h-4 w-4 text-cyan-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 text-[8.5px] font-black rounded border ${pillarInfo.badgeClass}`}
                      >
                        {pillarInfo.shortLabel}
                      </span>
                      <h3 className="font-display font-black text-sm text-white tracking-tight truncate">
                        {goal.title}
                      </h3>
                      <span className="hidden xs:inline text-[10px] text-cyan-400/80 font-extrabold">
                        [{goal.codename}]
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-xl">
                      {goal.description}
                    </p>
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
                    className="h-7 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] sm:text-xs rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer gap-1"
                  >
                    <span>{goal.actionButtonLabel}</span>
                    <ExternalLink className="h-3 w-3 stroke-[2.5]" />
                  </Button>
                </div>
              </div>

              {/* ROW 2: SLEEK PROGRESS BAR WITH MILESTONE TICK-MARKS */}
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
                          className={`h-4 w-1 rounded-full border ${
                            isReached
                              ? "bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                              : "bg-slate-700 border-slate-600"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Milestone Reward Labels */}
                <div className="grid grid-cols-4 gap-1 text-[9.5px] sm:text-[10px] text-slate-400 font-mono pt-1">
                  {goal.milestones.map((m, idx) => (
                    <div
                      key={`milestone-${idx}`}
                      className={`flex items-center gap-1 truncate ${
                        m.unlocked ? "text-cyan-300 font-bold" : "text-slate-500"
                      }`}
                    >
                      {m.unlocked ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Lock className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                      )}
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
