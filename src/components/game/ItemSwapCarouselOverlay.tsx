import { useState, useEffect } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { RarityBadge } from "@/components/game/RarityBadge";
import { audio } from "@/services/audio";
import type { Item } from "@/types/game";

export interface ItemSwapCarouselOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  candidateItems: Item[];
  finalItem: Item | null;
  onAnimationComplete?: (newItem: Item) => void;
}

export function ItemSwapCarouselOverlay({
  isOpen,
  onClose,
  candidateItems,
  finalItem,
  onAnimationComplete,
}: ItemSwapCarouselOverlayProps) {
  const [phase, setPhase] = useState<"spinning" | "landed" | "reveal">("spinning");
  const [spinIndex, setSpinIndex] = useState(0);

  // Generate carousel items array (at least 8 items for a juicy spin sequence)
  const pool = candidateItems.length > 0 ? candidateItems : finalItem ? [finalItem] : [];

  useEffect(() => {
    if (!isOpen || !finalItem) return;

    setPhase("spinning");
    setSpinIndex(0);
    audio.play("card.flip");

    // Fast rapid ticks
    let count = 0;
    const maxTicks = 18;
    let delay = 60;

    const runTicks = () => {
      count++;
      setSpinIndex((prev) => (prev + 1) % (pool.length || 1));
      if (count % 3 === 0) {
        audio.play("card.flip");
      }

      if (count < maxTicks) {
        // Progressive easing slowdown
        if (count > maxTicks - 8) {
          delay += 35;
        } else if (count > maxTicks - 12) {
          delay += 15;
        }
        setTimeout(runTicks, delay);
      } else {
        // Landing phase
        setPhase("landed");
        audio.play("card.land");
        audio.play("card.reveal.legendary");

        // Explosive particle burst & confetti
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.5 },
          colors: ["#38bdf8", "#818cf8", "#c084fc", "#f59e0b", "#10b981"],
        });

        setTimeout(() => {
          setPhase("reveal");
          if (onAnimationComplete && finalItem) {
            onAnimationComplete(finalItem);
          }
        }, 1200);

        setTimeout(() => {
          onClose();
        }, 2200);
      }
    };

    const timer = setTimeout(runTicks, delay);
    return () => clearTimeout(timer);
  }, [isOpen, finalItem]);

  if (!isOpen || !finalItem) return null;

  const currentDisplayedItem =
    phase === "landed" || phase === "reveal"
      ? finalItem
      : pool[spinIndex % pool.length] || finalItem;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-3 overflow-hidden rounded-lg bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Radiant Glow Behind Spinner */}
      <motion.div
        animate={
          phase === "landed" || phase === "reveal"
            ? { scale: [1, 1.4, 1.2], opacity: [0.6, 1, 0.8] }
            : { scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }
        }
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-52 w-52 rounded-full bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-amber-500/40 blur-2xl pointer-events-none"
      />

      {/* Screen Flash on Impact */}
      {phase === "landed" && (
        <motion.div
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 z-50 bg-gradient-to-tr from-cyan-300 via-white to-amber-300 pointer-events-none"
        />
      )}

      {/* Header Label */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 mb-2 flex flex-col items-center text-center"
      >
        <span className="font-display font-black text-xs sm:text-sm text-cyan-300 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          {phase === "spinning" ? "🎲 TRANSMUTING IDENTITY..." : "✨ NEW FORM MATERIALIZED!"}
        </span>
        <span className="font-mono text-[8px] sm:text-[9px] text-slate-300">
          {phase === "spinning"
            ? "Cycling through Season 1 Gear..."
            : `Transmuted to ${finalItem.name}`}
        </span>
      </motion.div>

      {/* 3D Carousel Stage */}
      <div className="relative z-10 flex items-center justify-center gap-2 my-auto w-full max-w-[280px]">
        {/* Left Ghost Item Card */}
        {phase === "spinning" && pool.length > 1 && (
          <motion.div
            animate={{ scale: [0.75, 0.8, 0.75], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="h-16 w-14 rounded-lg border border-slate-700/60 bg-slate-900/70 p-1 flex flex-col items-center justify-center blur-[1px] opacity-40 shrink-0 select-none"
          >
            <span className="text-xl">
              {pool[(spinIndex + pool.length - 1) % pool.length]?.icon || "⚔️"}
            </span>
          </motion.div>
        )}

        {/* Center Spotlight Card */}
        <motion.div
          key={phase === "spinning" ? spinIndex : "final-card"}
          initial={
            phase === "spinning"
              ? { scale: 0.9, y: 5, rotateY: -15 }
              : { scale: 1.25, rotateY: 0, y: 0 }
          }
          animate={{
            scale: phase === "landed" || phase === "reveal" ? [1.25, 1.1, 1.15] : 1.05,
            y: 0,
            rotateY: 0,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 shadow-2xl backdrop-blur-lg min-w-[140px] max-w-[160px] ${
            phase === "landed" || phase === "reveal"
              ? "border-cyan-400 bg-gradient-to-b from-cyan-950/90 via-slate-950 to-purple-950/90 shadow-[0_0_35px_rgba(6,182,212,0.6)]"
              : "border-slate-700 bg-slate-950/90 shadow-xl"
          }`}
        >
          {/* Item Icon */}
          <div className="relative flex items-center justify-center h-16 w-16 mb-2 rounded-xl bg-black/60 border border-slate-700/60 shadow-inner">
            {isImageUrl(currentDisplayedItem.icon) ? (
              <img
                src={currentDisplayedItem.icon}
                alt={currentDisplayedItem.name}
                className="h-12 w-12 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <span className="text-3xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {currentDisplayedItem.icon || "⚔️"}
              </span>
            )}

            {/* Level Badge */}
            <div className="absolute -top-1.5 -right-1.5 flex items-center bg-gradient-to-r from-amber-500 to-orange-600 px-1.5 py-0.2 rounded-full border border-yellow-300 text-[8px] font-mono font-black text-black shadow-md">
              LV {currentDisplayedItem.level ?? 1}
            </div>
          </div>

          {/* Item Name */}
          <span className="font-display font-black text-[10px] sm:text-xs text-white uppercase text-center truncate w-full px-1">
            {currentDisplayedItem.name}
          </span>

          {/* Rarity & Slot */}
          <div className="mt-1 flex items-center gap-1">
            <RarityBadge rarity={currentDisplayedItem.rarity} size="xs" />
            <span className="text-[7.5px] font-mono uppercase text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
              {currentDisplayedItem.slot}
            </span>
          </div>
        </motion.div>

        {/* Right Ghost Item Card */}
        {phase === "spinning" && pool.length > 1 && (
          <motion.div
            animate={{ scale: [0.75, 0.8, 0.75], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="h-16 w-14 rounded-lg border border-slate-700/60 bg-slate-900/70 p-1 flex flex-col items-center justify-center blur-[1px] opacity-40 shrink-0 select-none"
          >
            <span className="text-xl">{pool[(spinIndex + 1) % pool.length]?.icon || "⚔️"}</span>
          </motion.div>
        )}
      </div>

      {/* Floating XP/Stat Recovery Tag */}
      {phase === "reveal" && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-10 mt-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 font-mono font-black text-[9px] shadow-[0_0_15px_rgba(52,211,153,0.4)] flex items-center gap-1"
        >
          <span>🔥 STAT MATRIX RE-ALIGNED!</span>
        </motion.div>
      )}
    </div>
  );
}
