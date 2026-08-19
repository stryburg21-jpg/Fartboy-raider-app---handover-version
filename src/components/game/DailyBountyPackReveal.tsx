import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Sparkles, Lock, Unlock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface DailyBountyPackRevealProps {
  isUnsealed: boolean;
  onUnseal: () => void;
  completedCount: number;
  totalRequired: number;
}

export function DailyBountyPackReveal({ isUnsealed, onUnseal }: DailyBountyPackRevealProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

  const handleUnsealClick = () => {
    if (isFlipping || isBursting) return;
    setIsBursting(true);
    setIsFlipping(true);

    // Stage 1: Burst confetti and screen shake
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#F59E0B", "#EAB308", "#06B6D4", "#3B82F6", "#10B981"],
    });

    // Stage 2: Secondary side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#F59E0B", "#06B6D4"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#F59E0B", "#06B6D4"],
      });
    }, 200);

    // Stage 3: Reveal cards on board
    setTimeout(() => {
      onUnseal();
      setIsFlipping(false);
      setIsBursting(false);
    }, 700);
  };

  if (isUnsealed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: isBursting ? [1, 1.08, 0.95, 1.02, 1] : 1,
          rotateZ: isBursting ? [0, -3, 3, -2, 2, 0] : 0,
          rotateY: isFlipping ? 180 : 0,
        }}
        exit={{ opacity: 0, scale: 0.85, rotateY: 90 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-3xl border-2 border-amber-400/90 bg-gradient-to-b from-[#1e1730] via-[#0f131d] to-[#0a0d14] p-6 sm:p-10 text-center shadow-[0_0_40px_rgba(245,158,11,0.4)] space-y-6"
      >
        {/* Pulsing Gold & Cyan Aura Glow Backgrounds */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-400/25 blur-3xl pointer-events-none animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 right-1/4 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none animate-pulse" />

        {/* SEALED PACK ARTWORK GRAPHIC WITH DUAL GOLD/CYAN PULSE */}
        <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 grid place-items-center">
          {/* Outer Cyan/Amber Energy Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-[spin_10s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="relative grid h-32 w-32 sm:h-36 sm:w-36 place-items-center rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.7)] border-2 border-amber-200 cursor-pointer group hover:scale-105 transition-transform"
            onClick={handleUnsealClick}
          >
            <Package className="h-18 w-18 text-slate-950 fill-slate-950/20 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />

            {/* SEAL LOCK BADGE */}
            <div className="absolute -top-2.5 -right-2.5 rounded-full bg-slate-950 p-2 border-2 border-amber-400 shadow-xl text-amber-300">
              <Lock className="h-5 w-5 animate-pulse" />
            </div>

            {/* CYAN ENERGY SPARK BADGE */}
            <div className="absolute -bottom-2 -left-2 rounded-full bg-cyan-950 p-1.5 border border-cyan-400/80 shadow-md text-cyan-300">
              <Zap className="h-4 w-4 animate-bounce" />
            </div>

            {/* GOLD RIBBON DECORATION */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-amber-200/40 border-y border-amber-300/80 pointer-events-none" />
          </motion.div>
        </div>

        {/* TITLE & CALLOUT */}
        <div className="space-y-2 max-w-md mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 font-mono text-xs font-black text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            DAILY MISSION PACK SEALED
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight">
            UNSEAL YOUR DAILY MISSIONS
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Break the seal to reveal 3 active daily raid missions. Complete them to maintain your
            streak & unlock the <span className="text-amber-300 font-bold">Daily Mastery Pack</span>
            !
          </p>
        </div>

        {/* UNSEAL BUTTON */}
        <div className="pt-2 relative z-10">
          <Button
            type="button"
            onClick={handleUnsealClick}
            disabled={isFlipping || isBursting}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs sm:text-sm font-black px-8 sm:px-10 py-4 shadow-[0_0_30px_rgba(245,158,11,0.7)] cursor-pointer gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-amber-200/80 rounded-2xl"
          >
            <Unlock className="h-5 w-5 fill-slate-950 text-slate-950 animate-bounce" />
            <span>UNSEAL TODAY'S MISSIONS ⚡</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
