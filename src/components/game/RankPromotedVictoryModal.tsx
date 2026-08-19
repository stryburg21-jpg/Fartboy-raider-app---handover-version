import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Award,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Share2,
  X,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { audio } from "@/services/audio";

export interface RankPromotionDetails {
  open: boolean;
  oldRank: number | string;
  newRank: number | string;
  title: string;
  level: number;
  totalXP: number;
  unlockedPerks: string[];
}

interface RankPromotedVictoryModalProps {
  details: RankPromotionDetails | null;
  onClose: () => void;
}

export function RankPromotedVictoryModal({ details, onClose }: RankPromotedVictoryModalProps) {
  useEffect(() => {
    if (details?.open) {
      audio.play("rank.promote");
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#FEF08A"],
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [details?.open]);

  if (!details?.open) return null;

  const handleShareToX = () => {
    const text = `🎖️ Just promoted to Rank #${details.newRank} "${details.title}" (Level ${details.level}) in FartBoy Tactical Ops! 🔥\n\nFarmed over ${details.totalXP.toLocaleString()} XP across combat operations. Join the raid:\nhttps://fartboy.io`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening X to flex your rank promotion! 🚀");
  };

  const handleCopyDiscordBrag = () => {
    const text = `**🎖️ PROMOTION ALERT!** Just hit **Rank #${details.newRank} "${details.title}"** (Level ${details.level}) with **${details.totalXP.toLocaleString()} XP** in FartBoy Tactical Ops! 🔥`;
    navigator.clipboard.writeText(text);
    toast.success("📋 Discord flex snippet copied to clipboard!");
  };

  return (
    <div
      id="rank-promotion-victory-modal"
      className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-[#24131b] via-[#0F131D] to-[#0A0D14] p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.6)] text-center space-y-6">
        {/* ROTATING HOLOGRAPHIC LIGHT BEAMS BEHIND BADGE */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/30 via-red-500/25 to-yellow-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 3D FLOATING HOLOGRAPHIC BADGE */}
        <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 150 }}
            className="relative grid h-full w-full place-items-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.9)] border-4 border-amber-200 animate-periodic-shake"
          >
            <Trophy className="h-16 w-16 sm:h-20 sm:w-20 fill-slate-950 text-slate-950" />
            <div className="absolute -bottom-2.5 bg-slate-950 border-2 border-amber-400 px-3 py-0.5 rounded-full font-mono text-xs font-black text-amber-300 shadow-md">
              RANK #{details.newRank}
            </div>
          </motion.div>
        </div>

        {/* PROMOTION HEADLINE */}
        <div className="space-y-1.5 relative z-10 font-mono">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/60 px-3 py-1 text-xs font-black text-amber-300 uppercase tracking-widest animate-pulse">
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            RANK PROMOTED!
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            "{details.title}"
          </h2>

          <p className="text-xs text-amber-200/80 font-bold">
            Tactical Clearance Upgraded • Clearance Level {details.level}
          </p>
        </div>

        {/* UNLOCKED PERKS LIST */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-amber-500/30 text-left font-mono space-y-2 relative z-10">
          <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            UNLOCKED COMBAT PERKS & PRIVILEGES:
          </div>

          <div className="grid gap-1.5 pt-1">
            {details.unlockedPerks.map((perk, i) => (
              <div
                key={`perk-${i}`}
                className="flex items-center gap-2 text-xs font-bold text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-amber-500/20"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA ACTIONS (SHARE TO X, DISCORD BRAG, DISMISS) */}
        <div className="space-y-2.5 relative z-10 font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleShareToX}
              className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4 fill-slate-950" />
              <span>FLEX ON X (TWITTER) 🚀</span>
            </Button>

            <Button
              type="button"
              onClick={handleCopyDiscordBrag}
              className="bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 font-bold text-xs h-10 rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <span>COPY DISCORD BRAG 💬</span>
            </Button>
          </div>

          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>RETURN TO WAR ROOM</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
