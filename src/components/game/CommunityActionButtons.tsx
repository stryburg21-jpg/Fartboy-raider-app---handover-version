import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Flame,
  Sparkles,
  Video,
  BookOpen,
  MessageSquare,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCommunityLinks } from "@/services/communityLinks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  awardActivityXP,
  validateActivityAvailability,
  type AwardXPResult,
} from "@/services/xpEngine";
import { trackMissionEvent } from "@/services/missions";
import { awardContributorXP } from "@/services/contributorPass";
import {
  XP_ACTIVITIES,
  QUALITY_MULTIPLIERS,
  type XPActivityType,
  type QualityTier,
} from "@/config/xpConfig";
import { useGameStore } from "@/store/gameStore";

interface CommunityActionButtonsProps {
  layout?: "full" | "compact" | "cards";
  className?: string;
  title?: string;
  subtitle?: string;
}

export function CommunityActionButtons({
  layout = "full",
  className = "",
  title = "Community Activity Hub",
  subtitle = "Raid together, create viral content, and earn dual-currency XP.",
}: CommunityActionButtonsProps) {
  const { data: links } = useQuery({
    queryKey: ["community-links"],
    queryFn: getCommunityLinks,
  });

  const player = useGameStore((s) => s.player);

  const [activeModal, setActiveModal] = useState<{
    activityType: XPActivityType;
    title: string;
    description: string;
    steps: string[];
    buttonText: string;
    supportsQuality?: boolean;
    supportsImpressions?: boolean;
  } | null>(null);

  const [selectedQuality, setSelectedQuality] = useState<QualityTier>("standard");
  const [impressions, setImpressions] = useState<number>(0);
  const [submissionNote, setSubmissionNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AwardXPResult | null>(null);

  const openActionModal = (
    activityType: XPActivityType,
    titleText: string,
    descText: string,
    stepsList: string[],
    btnLabel: string,
    options?: { supportsQuality?: boolean; supportsImpressions?: boolean },
  ) => {
    setActiveModal({
      activityType,
      title: titleText,
      description: descText,
      steps: stepsList,
      buttonText: btnLabel,
      supportsQuality: options?.supportsQuality,
      supportsImpressions: options?.supportsImpressions,
    });
    setSelectedQuality("standard");
    setImpressions(0);
    setSubmissionNote("");
    setLastResult(null);
  };

  const handleExecuteActivity = async () => {
    if (!activeModal) return;

    setIsSubmitting(true);
    try {
      const res = await awardActivityXP({
        activityType: activeModal.activityType,
        qualityTier: activeModal.supportsQuality ? selectedQuality : undefined,
        impressions: activeModal.supportsImpressions ? impressions : 0,
        note: submissionNote || undefined,
      });

      if (res.success) {
        if (
          activeModal.activityType === "social_raid_like_rt" ||
          activeModal.activityType === "social_raid_comment"
        ) {
          trackMissionEvent("raid_verified", 1);
          awardContributorXP(500, "Social Raid Action");
        } else if (activeModal.activityType === "cto_snipe") {
          trackMissionEvent("cto_snipe", 1);
          awardContributorXP(1000, "CTO Snipe Action");
        } else if (activeModal.activityType === "content_meme_graphic") {
          trackMissionEvent("content_meme_approved", 1, { impressions });
          awardContributorXP(1500, "Meme Creation Approved");
        } else if (activeModal.activityType === "content_short_video") {
          trackMissionEvent("content_approved", 1, { impressions });
          awardContributorXP(2500, "Video Content Approved");
        } else if (activeModal.activityType === "discord_gameplay_win") {
          trackMissionEvent("discord_activity_played", 1);
          awardContributorXP(500, "Discord Activity Played");
        }
      }

      setLastResult(res);
    } catch (err) {
      setLastResult({
        success: false,
        error: err instanceof Error ? err.message : "Execution failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvailability = activeModal
    ? validateActivityAvailability(activeModal.activityType)
    : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* HEADER */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-extrabold text-amber-300 border border-amber-500/30 uppercase">
                ⚡ Earn Dual-Currency XP
              </span>
              <h3 className="font-display font-black text-lg text-foreground flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <span>{title}</span>
              </h3>
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>

          <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
            🔥 Season 1 XP Engine
          </span>
        </div>
      )}

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* CARD 1: LIKE + RT RAID */}
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-black shadow-lg">
              <Flame className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40">
              +150 XP (1:1 LT/SP)
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-amber-400">
              Social Raid
            </div>
            <h4 className="font-display font-black text-lg text-foreground">Verified Like + RT</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Like & Retweet active raid targets. 2m cooldown • 20 daily limit.
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "social_raid_like_rt",
                "🚀 Verified X/Twitter Like + RT",
                "Engage with official target tweets by liking and retweeting.",
                [
                  "Open active tweet on X/Twitter.",
                  "Like and Retweet the target post.",
                  "Execute raid action below to claim your 150 LT-XP & 150 SP-XP!",
                ],
                "Claim Raid XP (+150 XP)",
              )
            }
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Launch Like + RT Raid
          </Button>
        </div>

        {/* CARD 2: COMMENT RAID */}
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-black shadow-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/40">
              +300 XP
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-emerald-400">
              Custom Comment
            </div>
            <h4 className="font-display font-black text-lg text-foreground">Custom Comment Raid</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Post high-value raid comments. 5m cooldown • 10 daily limit.
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "social_raid_comment",
                "💬 Verified Custom Comment Raid",
                "Post a high-value custom comment on active X/Twitter targets.",
                [
                  "Find active raid post link.",
                  "Write a custom comment with #FartboyRaid2 tag.",
                  "Claim your 300 LT-XP & 300 SP-XP!",
                ],
                "Submit Comment (+300 XP)",
              )
            }
            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-black hover:from-emerald-300 hover:to-emerald-400 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Submit Comment Raid
          </Button>
        </div>

        {/* CARD 3: CTO TARGET SNIPE */}
        <div className="rounded-2xl border-2 border-rose-500/50 bg-gradient-to-b from-rose-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg">
              <Zap className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-400/40">
              +750 XP
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-rose-400">
              CTO Snipe
            </div>
            <h4 className="font-display font-black text-lg text-foreground">CTO Target Snipe</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Storm high priority CTO targets assigned by commanders. 3 daily limit.
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "cto_snipe",
                "🎯 CTO Target Snipe",
                "High priority target raid assigned by community leads.",
                [
                  "Locate active CTO target post.",
                  "Storm comment section and post raid graphic.",
                  "Claim your 750 LT-XP & 750 SP-XP!",
                ],
                "Execute CTO Snipe (+750 XP)",
              )
            }
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Execute CTO Snipe
          </Button>
        </div>

        {/* CARD 4: MEME / GRAPHIC */}
        <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-purple-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-400/40">
              +1,500 Base XP
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-purple-400">
              Content Creation
            </div>
            <h4 className="font-display font-black text-lg text-foreground">Meme / Graphic</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Supports Quality Multipliers (up to 2.5x) & Viral Impression Bonuses!
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "content_meme_graphic",
                "🎨 Meme / Graphic Submission",
                "Submit custom art or memes for community review and XP scaling.",
                [
                  "Create meme or graphic.",
                  "Select Quality Tier and enter verified X impressions.",
                  "Earn base XP x Quality Multiplier + Viral Bonus!",
                ],
                "Submit Meme for Review",
                { supportsQuality: true, supportsImpressions: true },
              )
            }
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Submit Meme Art
          </Button>
        </div>

        {/* CARD 5: SHORT VIDEO / REEL */}
        <div className="rounded-2xl border-2 border-sky-500/50 bg-gradient-to-b from-sky-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-black shadow-lg">
              <Video className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-full border border-sky-400/40">
              +3,500 Base XP
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-sky-400">Video Lab</div>
            <h4 className="font-display font-black text-lg text-foreground">Short Video / Reel</h4>
            <p className="text-xs text-muted-foreground mt-1">
              TikTok / Reels / Shorts creation. High XP payout + viral multipliers!
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "content_short_video",
                "🎬 Short Video / Reel Submission",
                "Produce short video clips showcasing pack openings or raid highlights.",
                [
                  "Record video clip.",
                  "Post on TikTok or YouTube Shorts with #FartboyRaid2.",
                  "Claim base 3,500 XP x Quality Tier + Viral Impression Bonus!",
                ],
                "Submit Video Clip",
                { supportsQuality: true, supportsImpressions: true },
              )
            }
            className="w-full bg-gradient-to-r from-sky-400 to-sky-500 text-black hover:from-sky-300 hover:to-sky-400 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Submit Short Video
          </Button>
        </div>

        {/* CARD 6: DISCORD GAMEPLAY WIN */}
        <div className="rounded-2xl border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/20 via-surface-1 to-card p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg">
              <Award className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs font-extrabold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-400/40">
              +250 XP
            </span>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black uppercase text-indigo-400">
              Discord Gameplay
            </div>
            <h4 className="font-display font-black text-lg text-foreground">Match Victory</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Win mini-games & match battles inside Discord. Max 2,500 XP daily cap.
            </p>
          </div>

          <Button
            onClick={() =>
              openActionModal(
                "discord_gameplay_win",
                "🎮 Discord Match Victory",
                "Win competitive mini-games and discord bot battles.",
                [
                  "Join Discord gameplay channel.",
                  "Win mini-game match against bot or raider.",
                  "Claim 250 LT-XP & 250 SP-XP per match victory!",
                ],
                "Claim Victory XP (+250 XP)",
              )
            }
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-400 hover:to-indigo-500 font-mono font-black text-xs uppercase h-10 rounded-xl"
          >
            Claim Match Win XP
          </Button>
        </div>
      </div>

      {/* INTERACTIVE ACTION MODAL */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-lg sm:max-w-xl border-border bg-card">
          {activeModal && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" /> {activeModal.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {activeModal.description}
                </DialogDescription>
              </DialogHeader>

              {/* STEPS */}
              <div className="rounded-xl border border-border/80 bg-surface-1 p-3 space-y-1.5">
                <span className="font-mono text-[10px] font-extrabold uppercase text-amber-400">
                  Instructions:
                </span>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {activeModal.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* QUALITY MULTIPLIER SELECTION */}
              {activeModal.supportsQuality && (
                <div className="space-y-2">
                  <label className="font-mono text-xs font-bold text-foreground block">
                    Select Content Quality Tier:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(QUALITY_MULTIPLIERS).map(([qKey, qCfg]) => (
                      <button
                        key={qKey}
                        type="button"
                        onClick={() => setSelectedQuality(qKey as QualityTier)}
                        className={`rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                          selectedQuality === qKey
                            ? "bg-primary/20 border-primary text-primary shadow-md font-bold"
                            : "bg-surface-2 border-border/60 text-muted-foreground hover:border-border"
                        }`}
                      >
                        <div className="font-mono text-xs font-extrabold">{qCfg.label}</div>
                        <div className="font-mono text-xs text-amber-400">
                          {qCfg.defaultMultiplier}x XP
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate mt-0.5">
                          {qCfg.examples}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* VIRAL IMPRESSIONS INPUT */}
              {activeModal.supportsImpressions && (
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-foreground block">
                    Verified X / Social Impressions:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={impressions}
                    onChange={(e) => setImpressions(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 10000"
                    className="w-full rounded-xl border border-border/80 bg-surface-2 px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Under 500: +0 XP • 1,000: +1,040 XP • 10,000: +4,490 XP • 100k+: +10,000 XP Max
                  </p>
                </div>
              )}

              {/* AVAILABILITY / LIMIT STATUS */}
              {currentAvailability && (
                <div
                  className={`rounded-xl border p-3 text-xs flex items-center justify-between font-mono ${
                    currentAvailability.available
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentAvailability.available ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span>
                      {currentAvailability.available
                        ? `Available! Remaining today: ${currentAvailability.remainingDailyLimit}`
                        : currentAvailability.reason}
                    </span>
                  </div>
                  <span>Rate: {(currentAvailability.decayMultiplier * 100).toFixed(0)}%</span>
                </div>
              )}

              {/* SUCCESS RESULT BANNER */}
              {lastResult && (
                <div
                  className={`rounded-xl border p-3 space-y-1 ${
                    lastResult.success
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                      : "border-destructive/40 bg-destructive/20 text-destructive"
                  }`}
                >
                  {lastResult.success ? (
                    <div>
                      <div className="font-display font-bold text-sm flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> XP Awarded
                        Successfully!
                      </div>
                      <div className="font-mono text-xs space-y-0.5 mt-1">
                        <div>LT-XP: +{lastResult.transaction?.netXPAwarded.toLocaleString()}</div>
                        <div>SP-XP: +{lastResult.transaction?.netXPAwarded.toLocaleString()}</div>
                        {lastResult.transaction?.setBonusName && (
                          <div className="text-amber-300 font-bold">
                            Set Bonus Applied: {lastResult.transaction.setBonusName} (+
                            {(lastResult.transaction.setBonusPct * 100).toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono font-bold text-destructive">
                      Error: {lastResult.error}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setActiveModal(null)}
                  className="font-mono text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={handleExecuteActivity}
                  disabled={isSubmitting || (currentAvailability && !currentAvailability.available)}
                  className="bg-primary text-primary-foreground font-mono font-bold text-xs uppercase"
                >
                  {isSubmitting ? "Awarding XP…" : activeModal.buttonText}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
