import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ExternalLink,
  Sparkles,
  Trophy,
  MessageSquare,
  CheckCircle2,
  Lock,
  Play,
  Tv,
} from "lucide-react";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { audio } from "@/services/audio";
import { toast } from "sonner";

interface TacticalMissionBriefModalProps {
  open: boolean;
  onClose: () => void;
  mission: AutomatedMissionItem | null;
  missionNumber?: number;
}

export function TacticalMissionBriefModal({
  open,
  onClose,
  mission,
  missionNumber = 1,
}: TacticalMissionBriefModalProps) {
  const [tapeTorn, setTapeTorn] = useState(false);

  useEffect(() => {
    if (open) {
      setTapeTorn(false);
      audio.play("mission.unseal");
      // Play unsealing sound and animate tape tear / wax seal pop
      const timer = setTimeout(() => {
        setTapeTorn(true);
        audio.play("foil.tear");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mission) return null;

  const dossier = mission.dossier;
  const xpVal =
    dossier?.xpBounty ?? mission.xpBounty ?? mission.xpReward ?? mission.baseRewardXP ?? 500;
  const packReward =
    dossier?.itemReward ?? mission.itemReward ?? mission.rewardText ?? "1x Raider Pack";
  const rarity = (dossier?.rarity ?? mission.rarity ?? "EPIC").toUpperCase();
  const channel =
    dossier?.targetChannel ??
    mission.targetChannel ??
    mission.discordChannel ??
    mission.roomTag ??
    "#cto-official-post";
  const dossierNum =
    dossier?.dossierNumber ?? mission.dossierNumber ?? `DOSSIER #${missionNumber || 1}`;
  const dept = dossier?.dept ?? mission.dept ?? "DEPT OF RAID";
  const targetUrl =
    dossier?.externalUrl ??
    mission.externalUrl ??
    mission.discordUrl ??
    "https://discord.gg/cto-official-post";
  const actionText =
    dossier?.actionButtonText ?? mission.actionButtonText ?? `GO TO DISCORD (${channel})`;
  const verificationType =
    dossier?.verificationType ?? mission.verificationType ?? "AUTOMATED RAID BOT VERIFICATION";
  const verificationNote =
    dossier?.verificationNote ??
    mission.verificationNote ??
    "Continuously syncing with official Discord servers. Once verified, reward XP is credited instantly.";
  const brief = dossier?.brief ??
    mission.brief ?? {
      step1: `Access designated channel ${channel} on Discord.`,
      step2: `Participate in active raid posts, share updates, or react as instructed.`,
      step3: `Automated Discord Bot will verify completion and award +${xpVal} POWER / SP-XP to your profile.`,
    };

  const handleGoToDiscord = () => {
    audio.play("button.click");
    toast.info(`Simulated: Navigating to ${channel} in Discord Webview`);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg border-2 border-amber-500/50 bg-slate-950/95 text-slate-100 p-5 sm:p-6 max-h-[90vh] overflow-y-auto z-[100] shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-xl rounded-2xl relative font-mono select-none">
        {/* TAMPER-EVIDENT RED TAPE UNSEALING ANIMATION AT TOP */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-sm z-30 pointer-events-none overflow-hidden h-6">
          <AnimatePresence>
            {!tapeTorn && (
              <motion.div
                initial={{ scaleX: 1, opacity: 1 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-amber-100 font-mono font-extrabold text-[9px] uppercase tracking-widest flex items-center justify-center border-b-2 border-red-950 shadow-md"
              >
                <span>[ TAMPER-EVIDENT SEAL // UNSEALED ]</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FADED CLASSIFIED FILE COPY WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
          <div className="text-amber-400 font-mono font-black text-6xl sm:text-7xl rotate-[-25deg] uppercase tracking-widest text-center whitespace-nowrap">
            CLASSIFIED FILE
            <br />
            TOP SECRET
          </div>
        </div>

        {/* TOP DOSSIER HEADER */}
        <DialogHeader className="space-y-3 border-b border-amber-500/30 pb-4 relative z-10 text-left">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* DEPARTMENT HEADER WITH REDACTED MARKERS */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded bg-slate-900 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-mono font-extrabold text-amber-300 tracking-wider uppercase">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {dept} // {dossierNum}
                </span>
              </div>
              {/* REDACTED MARKER BARS */}
              <span className="bg-amber-400/20 text-amber-400 px-2 text-[10px] select-none rounded-xs font-mono font-black border border-amber-400/30">
                ████████
              </span>
            </div>

            {/* RED TOP SECRET RUBBER STAMP */}
            <div className="border-2 border-red-500/90 text-red-400 font-mono font-black text-[10px] uppercase px-2 py-0.5 rotate-[-5deg] tracking-widest bg-red-950/40 inline-block shadow-xs">
              CLASSIFIED DOSSIER
            </div>
          </div>

          <DialogTitle className="font-display font-black text-xl sm:text-2xl text-white tracking-tight pt-1 leading-snug uppercase">
            {mission.title}
          </DialogTitle>

          <div className="text-xs text-slate-300 font-mono font-bold flex items-center gap-2 flex-wrap">
            <span>TARGET CHANNEL:</span>
            <span className="text-amber-300 bg-slate-900 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono font-extrabold">
              <MessageSquare className="h-3 w-3 text-amber-400" />
              {channel}
            </span>
          </div>
        </DialogHeader>

        {/* DOSSIER BODY SHEET */}
        <div className="space-y-4 py-3 relative z-10">
          {/* REWARD BADGES ROW */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/50 px-3 py-1 font-mono text-xs font-black shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>+{xpVal.toLocaleString()} POWER BOUNTY</span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-3 py-1 font-mono text-xs font-black shadow-xs">
              <Trophy className="h-3.5 w-3.5 text-emerald-400" />
              <span>{packReward}</span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/50 px-3 py-1 font-mono text-xs font-black">
              <Lock className="h-3.5 w-3.5 text-purple-400" />
              <span>RARITY: {rarity}</span>
            </div>
          </div>

          {/* STREAMLINED BULLET POINT INSTRUCTION BOX */}
          <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-4 space-y-3 shadow-inner">
            <h4 className="font-mono text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <span>📋 MISSION BRIEF & EXECUTION INSTRUCTIONS</span>
            </h4>
            <ul className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono font-medium space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Step 1:</strong> {brief.step1}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Step 2:</strong> {brief.step2}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Step 3:</strong> {brief.step3}
                </span>
              </li>
            </ul>
          </div>

          {/* TACTICAL VIDEO BRIEFING PREVIEW FRAME */}
          <div className="rounded-xl border border-cyan-500/40 bg-slate-950/90 p-3 space-y-2 relative overflow-hidden group shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-black">REC // TACTICAL FEED</span>
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Tv className="h-3 w-3 text-cyan-400" /> CH: {channel}
              </span>
            </div>

            <div
              className="relative aspect-video w-full rounded-lg bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-400/60 transition-colors"
              onClick={handleGoToDiscord}
            >
              {/* Tactical scanline grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334420_1px,transparent_1px),linear-gradient(to_bottom,#08334420_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />

              {/* Center Animated Play Button Overlay */}
              <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 fill-cyan-400 text-cyan-400 ml-0.5" />
              </div>

              <div className="absolute bottom-2 left-3 z-10 font-mono text-[9.5px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                <span>▶ RAID DIRECTIVE BRIEF // 00:48</span>
                <span className="text-emerald-400 font-bold">• 1080P HD</span>
              </div>
            </div>
          </div>

          {/* AUTO-VERIFICATION REQUIREMENTS */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-xs text-emerald-200 font-mono space-y-1 shadow-xs">
            <div className="font-black flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{verificationType.toUpperCase()}:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal pl-5 font-medium">
              {verificationNote}
            </p>
          </div>
        </div>

        {/* MODAL FOOTER WITH FULL-WIDTH CTA */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5 relative z-10 border-t border-amber-500/30">
          <Button
            type="button"
            onClick={handleGoToDiscord}
            className="w-full sm:flex-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs sm:text-sm font-black py-3 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
            <span>{actionText}</span>
            <ExternalLink className="h-4 w-4 text-slate-950 stroke-[2.5]" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
