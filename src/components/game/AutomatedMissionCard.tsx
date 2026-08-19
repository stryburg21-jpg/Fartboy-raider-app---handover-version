import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  ExternalLink,
  Zap,
  Sparkles,
  Loader2,
  Gift,
  RefreshCw,
  FileText,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { TacticalMissionBriefModal } from "@/components/game/TacticalMissionBriefModal";
import { getMissionPillar, MISSION_PILLARS } from "@/utils/missionPillars";

interface AutomatedMissionCardProps {
  item: AutomatedMissionItem;
  onClaim?: (id: string) => void | Promise<unknown>;
  onDeploy?: (id: string) => void;
  onReroll?: (id: string) => void | Promise<boolean>;
  isProcessing?: boolean;
  canReroll?: boolean;
  rerollsLeft?: number;
  missionNumber?: number;
  showCompletedOverlay?: boolean;
}

export function AutomatedMissionCard({
  item,
  onClaim,
  onDeploy,
  onReroll,
  isProcessing = false,
  canReroll = false,
  rerollsLeft = 1,
  missionNumber = 1,
  showCompletedOverlay = true,
}: AutomatedMissionCardProps) {
  const [loading, setLoading] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalCap = item.maxProgress || item.totalRequired || item.dailyCap || 1;
  const count = item.progress !== undefined ? item.progress : item.completedCount || 0;

  const isClaimed = item.status === "claimed" || item.status === "verified";
  const isClaimable = item.status === "claimable" || (count >= totalCap && !isClaimed);
  const isPendingSync = item.status === "pending_bot_sync" || item.status === "verifying";
  const isUnstarted = item.status === "unstarted" || item.status === "not_started" || count === 0;

  const progressPct = Math.min(100, Math.round((count / totalCap) * 100));

  // Determine Progression Pillar and styling
  const pillarKey = getMissionPillar(item.id, item.category, item.roomTag);
  const pillarInfo = MISSION_PILLARS[pillarKey];
  const PillarIcon = pillarInfo.icon;

  const xpAmount = item.xpReward || item.baseRewardXP || item.xpBounty || 500;
  const categoryLabel =
    (item as unknown as { categoryLabel?: string }).categoryLabel || pillarInfo.label;

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || isProcessing || isClaimed) return;
    setLoading(true);
    try {
      if (onClaim) {
        await onClaim(item.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeployAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeploy) {
      onDeploy(item.id);
    } else {
      const url = item.externalUrl || item.discordUrl;
      if (url && url.startsWith("http")) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleRerollClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRerolling || isClaimed || isClaimable || rerollsLeft <= 0 || !onReroll) return;
    setIsRerolling(true);
    try {
      await onReroll(item.id);
    } finally {
      setIsRerolling(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      onClick={() => setInspectOpen(true)}
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 font-mono transition-all duration-300 border cursor-pointer flex flex-col justify-between min-h-[220px] ${
        isClaimed
          ? "bg-slate-950/80 border-slate-800/90 text-slate-400 shadow-none"
          : isClaimable
            ? "bg-gradient-to-b from-amber-950/30 via-slate-900/95 to-slate-950 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400"
            : "bg-slate-950/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80 shadow-lg hover:shadow-xl"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          FULL-CARD HORIZONTAL GREEN SUCCESS BANNER OVERLAY
      ───────────────────────────────────────────────────────────── */}
      {showCompletedOverlay && isClaimed && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center py-2 bg-gradient-to-r from-emerald-950/90 via-emerald-900/95 to-emerald-950/90 border-y-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] backdrop-blur-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-display font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>MISSION ACCOMPLISHED • VERIFIED & COMPLETED</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER: CATEGORY TAG + TASK TITLE
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div
                className={`grid h-5 w-5 place-items-center rounded shrink-0 border ${
                  isClaimed
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                <PillarIcon className="h-3 w-3" />
              </div>
              <span
                className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${pillarInfo.badgeClass}`}
              >
                {categoryLabel}
              </span>
            </div>

            {(item.discordChannel || item.targetChannel || item.roomTag) && (
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 text-slate-500" />
                <span>{item.discordChannel || item.targetChannel || item.roomTag}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isPendingSync ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                VERIFYING
              </span>
            ) : isClaimable ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                <Sparkles className="h-2.5 w-2.5" />
                READY TO CLAIM
              </span>
            ) : isClaimed ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="h-2.5 w-2.5" />
                COMPLETED
              </span>
            ) : null}

            {canReroll && isUnstarted && !isClaimed && onReroll && (
              <button
                type="button"
                onClick={handleRerollClick}
                disabled={isRerolling || rerollsLeft <= 0}
                className="text-[9px] font-bold text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded px-1.5 py-0.5 transition-all cursor-pointer flex items-center gap-1 bg-slate-900/60"
                title="Reroll this bounty"
              >
                <RefreshCw
                  className={`h-2.5 w-2.5 ${isRerolling ? "animate-spin text-amber-400" : ""}`}
                />
                <span>REROLL</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display font-black text-sm sm:text-base text-white tracking-tight group-hover:text-amber-300 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">
            {item.description || item.actionRequirements}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BODY: PROGRESS BAR + XP REWARD BADGE
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">Progress</span>
            <span
              className={
                isClaimed ? "text-emerald-400" : isClaimable ? "text-amber-300" : "text-slate-200"
              }
            >
              {count} / {totalCap}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isClaimed
                  ? "bg-emerald-500"
                  : isClaimable
                    ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    : "bg-gradient-to-r from-cyan-500 to-amber-400"
              }`}
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. FOOTER ACTION: [DOSSIER] AND PRIMARY ACTION BUTTON
        ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
          {/* XP Reward Badge */}
          <div className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-black text-amber-300">
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>+{xpAmount.toLocaleString()} XP</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dossier Detail Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInspectOpen(true);
              }}
              className="h-8 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              title="Inspect Mission Dossier"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>DOSSIER</span>
            </button>

            {/* Primary Action Button */}
            {isClaimed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>COMPLETED</span>
              </span>
            ) : isClaimable ? (
              <Button
                type="button"
                size="sm"
                disabled={loading || isProcessing}
                onClick={handleClaim}
                className="h-8 px-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse cursor-pointer gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Gift className="h-3.5 w-3.5" />
                )}
                <span>CLAIM BOUNTY</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handleDeployAction}
                className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold text-xs rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer gap-1.5"
              >
                <span>DEPLOY</span>
                <ExternalLink className="h-3 w-3 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* CLASSIFIED DOSSIER DETAILS MODAL */}
      <TacticalMissionBriefModal
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        mission={item}
        missionNumber={missionNumber}
      />
    </motion.div>
  );
}
