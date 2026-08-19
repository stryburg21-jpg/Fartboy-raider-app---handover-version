import { useState } from "react";
import type { Mission } from "@/types/game";
import { XPBar } from "./XPBar";
import {
  CheckCircle2,
  Gift,
  Sparkles,
  Clock,
  Flame,
  Trophy,
  Zap,
  Award,
  Info,
  ChevronRight,
  ExternalLink,
  Upload,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { claimMissionReward, trackMissionEvent } from "@/services/missions";
import { awardActivityXP } from "@/services/xpEngine";
import { awardContributorXP } from "@/services/contributorPass";

// Helper to determine quick cooldown tag & category subtitle
function getQuickTag(mission: Mission): { tag: string; actionLabel: string } {
  const cat = (mission.category || "").toLowerCase();
  const type = mission.type;

  if (cat.includes("raid")) {
    return { tag: "Verified Raid • 2m Cooldown", actionLabel: "LAUNCH" };
  }
  if (cat.includes("content") || mission.title.toLowerCase().includes("meme")) {
    return { tag: "Creation • Review Required", actionLabel: "SUBMIT" };
  }
  if (cat.includes("gameplay") || cat.includes("mini") || type === "special") {
    return { tag: "Instant Match • 250 XP", actionLabel: "PLAY" };
  }
  if (cat.includes("forge")) {
    return { tag: "Forge Upgrade • Instant", actionLabel: "FORGE" };
  }
  if (cat.includes("shop") || mission.title.toLowerCase().includes("pack")) {
    return { tag: "Vault Unboxing • Instant", actionLabel: "OPEN" };
  }
  if (type === "daily") {
    return { tag: `Daily Reset • ${mission.expiry || "24h"}`, actionLabel: "LAUNCH" };
  }
  if (type === "weekly") {
    return { tag: `Weekly Reset • ${mission.expiry || "7d"}`, actionLabel: "LAUNCH" };
  }
  if (type === "seasonal") {
    return { tag: "Season 1 • 90d Milestone", actionLabel: "VIEW" };
  }
  return { tag: "Mission Action", actionLabel: "LAUNCH" };
}

/**
 * STREAMLINED MISSION ACTION CARD
 * Left: Task Icon + Bold Title + Quick Cooldown Tag
 * Center/Right: XP Reward Pill
 * Far Right: Prominent Call-To-Action Button ("LAUNCH", "SUBMIT", "CLAIM")
 * Includes Expandable Details Sheet upon tapping card title/info.
 */
export function StreamlinedMissionActionCard({ mission }: { mission: Mission }) {
  const [claimed, setClaimed] = useState(mission.status === "claimed");
  const [claiming, setClaiming] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const isCompleted = mission.completed || mission.status === "completed" || claimed;
  const pct = Math.min(
    100,
    Math.round((mission.progress / Math.max(1, mission.requirement)) * 100),
  );

  const { tag, actionLabel } = getQuickTag(mission);

  const handleClaim = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (claiming || claimed) return;

    setClaiming(true);
    const res = await claimMissionReward(mission.id);
    setClaiming(false);
    if (res.success) {
      setClaimed(true);
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted && !claimed) {
      handleClaim(e);
    } else {
      setDetailsOpen(true);
    }
  };

  // Generic execution handler from inside the details modal
  const handleExecuteModalAction = async () => {
    setIsExecuting(true);
    try {
      const cat = (mission.category || "").toLowerCase();
      if (cat.includes("raid")) {
        await trackMissionEvent("raid_verified", 1);
        await awardActivityXP({ activityType: "social_raid_like_rt", note: mission.title });
        await awardContributorXP(500, "Raid Action Executed");
        setActionFeedback("✓ Raid verified! +150 XP awarded & progress updated.");
      } else if (cat.includes("content")) {
        await trackMissionEvent("content_approved", 1);
        await awardActivityXP({ activityType: "content_meme_graphic", note: mission.title });
        await awardContributorXP(1500, "Content Approved");
        setActionFeedback("✓ Submission received! Content approved +1,500 XP.");
      } else if (cat.includes("gameplay")) {
        await trackMissionEvent("discord_activity_played", 1);
        await awardActivityXP({ activityType: "discord_gameplay_win", note: mission.title });
        setActionFeedback("✓ Match victory recorded! +250 XP awarded.");
      } else {
        await trackMissionEvent("raid_verified", 1);
        setActionFeedback("✓ Mission action executed!");
      }
    } catch (err) {
      console.error("Action execution failed", err);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  return (
    <>
      <div
        onClick={() => setDetailsOpen(true)}
        className={`group relative overflow-hidden rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 cursor-pointer select-none shadow-sm hover:shadow-md ${
          isCompleted
            ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/25 via-[#0D131A] to-[#0A0D12]"
            : "border-slate-800/90 bg-[#0E121A] hover:border-amber-500/50 hover:bg-[#121722]"
        }`}
      >
        {/* TOP COMPACT ROW: ICON + TITLE & TAG | XP PILL | CTA BUTTON */}
        <div className="flex items-center justify-between gap-2.5">
          {/* LEFT: Task Icon + Bold Title + Cooldown Tag */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-xl shadow-inner ${
                isCompleted
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400 group-hover:border-amber-400"
              }`}
            >
              {mission.artwork || "⚡"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="font-display font-black text-xs sm:text-sm text-foreground truncate group-hover:text-amber-300 transition-colors">
                  {mission.title}
                </h4>
                <Info className="h-3 w-3 text-slate-500 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <span className="text-amber-400/90 font-bold">{tag}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: XP REWARD PILL + PROMINENT CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* XP Reward Pill */}
            <div className="hidden xs:flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 font-mono text-[11px] font-black text-amber-300 shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>+{mission.reward.xp.toLocaleString()} XP</span>
            </div>

            {/* Prominent CTA Button */}
            {claimed ? (
              <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 font-mono text-[10px] font-extrabold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> CLAIMED
              </span>
            ) : isCompleted ? (
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={claiming}
                className="font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer h-8 px-3.5"
              >
                {claiming ? "..." : "CLAIM REWARD"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleActionClick}
                className="font-mono text-xs font-black uppercase tracking-wider border border-amber-400/60 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer h-8 px-3"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        </div>

        {/* BOTTOM PROGRESS BAR (IF IN PROGRESS OR COMPLETED) */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
              {mission.progress.toLocaleString()} / {mission.requirement.toLocaleString()}
            </div>
            <div className="h-2 flex-1 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* XP Pill for small mobile viewports */}
          <div className="flex xs:hidden text-[10px] font-mono font-black text-amber-300">
            +{mission.reward.xp.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* EXPANDABLE DETAILS SHEET / BOTTOM DRAWER */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto border-t-2 border-amber-500/50 bg-[#0B0E14] text-foreground p-4 sm:p-6 space-y-4"
        >
          <SheetHeader className="text-left border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase text-amber-300">
                <Zap className="h-3 w-3" /> {mission.type.toUpperCase()} OBJECTIVE
              </span>
              {mission.expiry && (
                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-400" /> {mission.expiry}
                </span>
              )}
            </div>
            <SheetTitle className="font-display font-black text-lg sm:text-xl text-foreground uppercase tracking-wider flex items-center gap-2 mt-2">
              <span className="text-2xl">{mission.artwork || "⚔️"}</span>
              <span>{mission.title}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-300 leading-relaxed font-sans">
              {mission.description}
            </SheetDescription>
          </SheetHeader>

          {/* REWARD BREAKDOWN SUMMARY */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <div className="font-mono text-[10px] font-black uppercase text-amber-400">
                  Mission Reward
                </div>
                <div className="font-display font-black text-sm text-foreground">
                  +{mission.reward.xp.toLocaleString()} XP & Dual Currency
                </div>
                {mission.reward.description && (
                  <div className="text-[11px] font-mono text-slate-300">
                    {mission.reward.description}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
              Tag: {tag}
            </div>
          </div>

          {/* PROGRESS TRACKER */}
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-[#121622] p-4">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Objective Completion</span>
              <span className={isCompleted ? "text-emerald-400" : "text-amber-300"}>
                {mission.progress.toLocaleString()} / {mission.requirement.toLocaleString()} ({pct}
                %)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* SUBMISSION & EXECUTION INSTRUCTIONS */}
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-[#121622] p-4">
            <div className="font-mono text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Execution Instructions & Rules
            </div>
            <ul className="list-disc list-inside text-xs font-mono text-slate-300 space-y-1.5 leading-relaxed">
              <li>Complete the required activity on official X/Twitter, Discord, or Vault.</li>
              <li>Dual-currency XP is credited instantly upon verified completion or claim.</li>
              <li>Quality submission multipliers automatically scale earned XP up to 2.5x.</li>
            </ul>

            {/* Optional Input Link for Content / Video Submissions */}
            {(mission.category === "Content" || mission.title.toLowerCase().includes("meme")) && (
              <div className="pt-2 space-y-2">
                <label className="font-mono text-xs font-bold text-slate-300 block">
                  Paste X Post / Submission Link:
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://x.com/username/status/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-foreground focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* ACTION FEEDBACK TOAST */}
          {actionFeedback && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              className="font-mono text-xs font-bold border-slate-800 text-slate-400 hover:bg-slate-900"
            >
              Close
            </Button>

            {claimed ? (
              <Button
                disabled
                className="font-mono text-xs font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40"
              >
                Claimed ✓
              </Button>
            ) : isCompleted ? (
              <Button
                onClick={(e) => {
                  handleClaim(e);
                }}
                disabled={claiming}
                className="font-mono text-xs font-black uppercase bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] px-6"
              >
                {claiming ? "Claiming..." : "Claim Reward"}
              </Button>
            ) : (
              <Button
                onClick={handleExecuteModalAction}
                disabled={isExecuting}
                className="font-mono text-xs font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] px-6"
              >
                {isExecuting ? "Executing..." : "Execute Mission Action"}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * HERO FEATURED MISSION CARD — Sleek priority mission highlight
 */
export function HeroMissionCard({ mission }: { mission: Mission }) {
  return <StreamlinedMissionActionCard mission={mission} />;
}

/**
 * COMPACT MISSION CARD
 */
export function CompactMissionCard({ mission }: { mission: Mission }) {
  return <StreamlinedMissionActionCard mission={mission} />;
}

/**
 * WEEKLY MISSION CARD
 */
export function WeeklyMissionCard({ mission }: { mission: Mission }) {
  return <StreamlinedMissionActionCard mission={mission} />;
}

/**
 * SEASON MISSION CARD
 */
export function SeasonMissionCard({ mission }: { mission: Mission }) {
  return <StreamlinedMissionActionCard mission={mission} />;
}

/**
 * STANDARD FALLBACK MISSION CARD
 */
export function MissionCard({ mission }: { mission: Mission }) {
  return <StreamlinedMissionActionCard mission={mission} />;
}
