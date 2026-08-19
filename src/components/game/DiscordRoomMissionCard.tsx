import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Info,
  Clock,
  Send,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  executeDiscordRoomMission,
  getRoomMissionCompletedCount,
  getRoomMissionGreenTick,
  type DiscordRoomMissionDef,
} from "@/services/discordMissions";

interface DiscordRoomMissionCardProps {
  def: DiscordRoomMissionDef;
  onActionCompleted?: () => void;
}

export function DiscordRoomMissionCard({ def, onActionCompleted }: DiscordRoomMissionCardProps) {
  const [completedCount, setCompletedCount] = useState(() => getRoomMissionCompletedCount(def.id));
  const [hasGreenTick, setHasGreenTick] = useState(() => getRoomMissionGreenTick(def.id));
  const [isExecuting, setIsExecuting] = useState(false);
  const [submissionLink, setSubmissionLink] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isMaxCap = completedCount >= def.dailyCap;
  const progressPct = Math.min(100, Math.round((completedCount / def.dailyCap) * 100));

  const handleGoToDiscord = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(def.discordUrl, "_blank", "noopener,noreferrer");
  };

  const handleExecuteAction = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isExecuting || isMaxCap) return;

    setIsExecuting(true);
    setFeedbackMsg(null);

    try {
      const res = await executeDiscordRoomMission(def.id, submissionLink);
      setCompletedCount(res.newCount);
      if (res.newCount >= def.dailyCap || def.requiresModApproval) {
        setHasGreenTick(true);
      }
      setFeedbackMsg(res.message);

      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      console.error("Failed executing room action", err);
      setFeedbackMsg("Failed to process room action. Please try again.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Determine button text based on mission tab & type
  let primaryActionText = "CLAIM GREEN TICK";
  if (def.tab === "memes_video") {
    primaryActionText = "SUBMIT LINK";
  } else if (def.tab === "discord_chat") {
    primaryActionText = "LOG CHAT (+15 XP)";
  } else if (def.title.toLowerCase().includes("snipe")) {
    primaryActionText = "VERIFY SNIPE";
  } else if (def.title.toLowerCase().includes("raid") || def.title.toLowerCase().includes("post")) {
    primaryActionText = "VERIFY RAID";
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0E121A] p-3.5 sm:p-4 transition-all duration-200 hover:border-amber-500/50 hover:bg-[#121722] shadow-md space-y-3">
      {/* 1. TOP HEADER ROW: TITLE & ROOM TAG | XP REWARD BADGE */}
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 uppercase tracking-wider">
              <MessageSquare className="h-3 w-3 text-amber-400" />
              {def.roomTag}
            </span>

            {def.requiresModApproval && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 font-mono text-[10px] font-extrabold text-purple-300">
                🛡️ Mod Approval
              </span>
            )}

            {/* GREEN TICK STATUS BADGE */}
            {hasGreenTick || isMaxCap ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> GREEN TICK VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-400">
                ⏳ Pending ({completedCount}/{def.dailyCap})
              </span>
            )}
          </div>

          <h3 className="font-display font-black text-sm sm:text-base text-foreground tracking-tight group-hover:text-amber-300 transition-colors">
            {def.title}
          </h3>
        </div>

        {/* XP BADGE */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1 font-mono text-xs sm:text-sm font-black text-amber-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>+{def.baseRewardXP.toLocaleString()} XP</span>
          </div>
          {def.multiplierText && (
            <div className="text-[10px] font-mono font-bold text-amber-400/90 mt-0.5">
              {def.multiplierText}
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTION REQUIREMENTS SUMMARY */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5 text-xs font-mono text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-200">Requirements:</strong> {def.actionRequirements}
          </span>
        </div>

        <span className="text-[10px] text-amber-400 font-extrabold shrink-0">
          Cap: {def.dailyCap}/day
        </span>
      </div>

      {/* 3. PROGRESS BAR FOR DAILY CAP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
          <span>Daily Progress</span>
          <span className={isMaxCap ? "text-emerald-400" : "text-amber-300"}>
            {completedCount} / {def.dailyCap} completed
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isMaxCap
                ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                : "bg-gradient-to-r from-amber-400 to-amber-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 4. FEEDBACK TOAST / BANNER */}
      {feedbackMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
      )}

      {/* 5. PRIMARY ACTION BUTTONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* TAP-TO-EXPAND RULES TOGGLE */}
        <button
          type="button"
          onClick={() => setRulesOpen(!rulesOpen)}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-extrabold text-slate-400 hover:text-amber-300 transition-colors py-1 cursor-pointer"
        >
          <Info className="h-3.5 w-3.5 text-amber-400" />
          <span>{rulesOpen ? "Hide Rules" : "View Detailed Rules"}</span>
          {rulesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* BUTTON GROUP */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* GO TO DISCORD ROOM BUTTON */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleGoToDiscord}
            className="font-mono text-[11px] font-bold border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-amber-300 h-8 px-3 cursor-pointer"
          >
            <span>GO TO DISCORD ROOM</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>

          {/* CLAIM / VERIFY ACTION BUTTON */}
          {isMaxCap ? (
            <Button
              size="sm"
              disabled
              className="font-mono text-[11px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 h-8 px-3"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> CAP REACHED ✓
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                if (def.requiresModApproval || def.tab === "memes_video") {
                  setModalOpen(true);
                } else {
                  handleExecuteAction();
                }
              }}
              disabled={isExecuting}
              className="font-mono text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] h-8 px-3.5 cursor-pointer"
            >
              {isExecuting ? "Processing..." : primaryActionText}
            </Button>
          )}
        </div>
      </div>

      {/* 6. EXPANDABLE RULE BLOCK (TAP-TO-EXPAND DRAWER) */}
      {rulesOpen && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs font-mono space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Official Guidelines & Verification Rules:
          </div>
          <ul className="list-disc list-inside text-slate-300 space-y-1 leading-relaxed">
            {def.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. SUBMISSION MODAL FOR CONTENT / VIDEO / LINK SUBMISSIONS */}
      <Sheet open={modalOpen} onOpenChange={setModalOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto border-t-2 border-amber-500/50 bg-[#0B0E14] text-foreground p-5 space-y-4"
        >
          <SheetHeader className="text-left border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 uppercase">
                {def.roomTag}
              </span>
              {def.requiresModApproval && (
                <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 font-mono text-[10px] font-black text-purple-300 uppercase">
                  Green Tick Review
                </span>
              )}
            </div>
            <SheetTitle className="font-display font-black text-lg text-foreground mt-2">
              Submit Link for {def.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-300">
              Paste your Discord submission link, X post, TikTok, or video reel URL to receive a
              Green Tick verification badge and XP reward.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 font-mono text-xs">
            <label className="font-bold text-slate-200 block">Discord Message or Post URL:</label>
            <input
              type="url"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://discord.com/channels/... or https://x.com/..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-foreground focus:border-amber-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Submissions in {def.roomTag} earn +{def.baseRewardXP.toLocaleString()} base XP.
              Approved submissions will receive a Green Tick mark!
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="font-mono text-xs font-bold border-slate-800 text-slate-400 hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleExecuteAction();
                setModalOpen(false);
              }}
              disabled={isExecuting}
              className="font-mono text-xs font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 px-6"
            >
              {isExecuting ? "Submitting..." : "Submit for Green Tick"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
