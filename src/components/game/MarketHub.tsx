import { useState, useEffect, useRef } from "react";
import { Hammer, ShoppingBag, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/store/gameStore";

export type MarketTab = "forge" | "shop";

export function MarketHeaderControl({
  activeTab,
  onTabChange,
}: {
  activeTab: MarketTab;
  onTabChange: (tab: MarketTab) => void;
}) {
  const player = useGameStore((s) => s.player);
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;

  // Animated Delta State
  const prevXPRef = useRef<number>(spendableXP);
  const [xpDelta, setXpDelta] = useState<{ amount: number; id: number } | null>(null);

  useEffect(() => {
    const prev = prevXPRef.current;
    if (prev !== spendableXP) {
      const diff = spendableXP - prev;
      if (Math.abs(diff) > 0) {
        setXpDelta({ amount: diff, id: Date.now() });
      }
      prevXPRef.current = spendableXP;
    }
  }, [spendableXP]);

  return (
    <div className="w-full space-y-1 sm:space-y-1.5 font-mono">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
        {/* STANDARDIZED EQUAL-WIDTH SUB-NAV PILLS (THE FORGE vs RAID SHOP) */}
        <div className="flex items-center p-0.5 sm:p-1 bg-slate-950/95 border border-slate-800 rounded-xl gap-1 flex-1 min-w-0 shadow-lg">
          <button
            type="button"
            onClick={() => onTabChange("forge")}
            className={`flex-1 shrink min-w-0 h-8 sm:h-9 flex items-center justify-center gap-1.5 px-2 rounded-lg font-mono text-[11px] min-[400px]:text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
              activeTab === "forge"
                ? "bg-[#FFC700] text-black border border-[#FFC700] shadow-[0_0_12px_rgba(255,199,0,0.4)] font-black"
                : "bg-slate-900 border border-slate-800 text-white hover:bg-slate-800/80"
            }`}
          >
            <Hammer
              className={`h-3.5 w-3.5 shrink-0 ${activeTab === "forge" ? "text-black" : "text-amber-400"}`}
            />
            <span className="truncate">THE FORGE</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("shop")}
            className={`flex-1 shrink min-w-0 h-8 sm:h-9 flex items-center justify-center gap-1.5 px-2 rounded-lg font-mono text-[11px] min-[400px]:text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
              activeTab === "shop"
                ? "bg-[#FFC700] text-black border border-[#FFC700] shadow-[0_0_12px_rgba(255,199,0,0.4)] font-black"
                : "bg-slate-900 border border-slate-800 text-white hover:bg-slate-800/80"
            }`}
          >
            <ShoppingBag
              className={`h-3.5 w-3.5 shrink-0 ${activeTab === "shop" ? "text-black" : "text-amber-400"}`}
            />
            <span className="truncate">RAID SHOP</span>
          </button>
        </div>

        {/* RIGHT: COMPACT SPENDABLE XP PILL */}
        <div className="relative flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-slate-950/95 border border-amber-500/30 rounded-xl px-2.5 py-1.5 sm:py-2 shadow-md shrink-0 overflow-visible">
          {/* Animated Delta Float Badge */}
          <AnimatePresence>
            {xpDelta && (
              <motion.div
                key={xpDelta.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -22, scale: 1.05 }}
                exit={{ opacity: 0, y: -32, scale: 0.9 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                onAnimationComplete={() => setXpDelta(null)}
                className={`absolute right-2 top-0 pointer-events-none font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full border shadow-lg z-30 whitespace-nowrap ${
                  xpDelta.amount > 0
                    ? "bg-emerald-500 text-black border-emerald-300 shadow-emerald-500/50"
                    : "bg-rose-500 text-white border-rose-300 shadow-rose-500/50"
                }`}
              >
                {xpDelta.amount > 0
                  ? `+${xpDelta.amount.toLocaleString()}`
                  : `${xpDelta.amount.toLocaleString()}`}{" "}
                XP
              </motion.div>
            )}
          </AnimatePresence>

          <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase text-amber-300/80 tracking-wider">
            Spendable XP:
          </span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
            <motion.span
              key={spendableXP}
              initial={{ scale: 1.15, color: "#fef08a" }}
              animate={{ scale: 1, color: "#fde047" }}
              transition={{ duration: 0.3 }}
              className="font-mono font-black text-xs sm:text-sm text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] whitespace-nowrap"
            >
              {spendableXP.toLocaleString()} XP
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}
