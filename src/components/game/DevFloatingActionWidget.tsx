import { useState } from "react";
import {
  FlaskConical,
  X,
  Zap,
  RefreshCw,
  Package,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDailyMissionsStore } from "@/store/dailyMissionsStore";
import { useGameStore } from "@/store/gameStore";
import { recordCustomXPTransaction } from "@/services/xpEngine";
import { setMockPlayer } from "@/services/player";
import { safeStorage } from "@/lib/storage";

export function DevFloatingActionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { devSetMasteryReady, devResetDailyState, unsealDailyPacks } = useDailyMissionsStore();
  const player = useGameStore((s) => s.player);
  const addPack = useGameStore((s) => s.addPack);

  const handleQuickUnsealAndMastery = () => {
    unsealDailyPacks();
    devSetMasteryReady();
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      safeStorage.setItem("fartboy_daily_bounty_unsealed_date", todayStr);
    } catch (_err) {
      // ignore
    }
    toast.success("⚡ Dev Action: Daily Packs Unsealed & Mastery set to 3/3 Ready!");
  };

  const handleResetDaily = () => {
    devResetDailyState();
    try {
      safeStorage.removeItem("fartboy_daily_bounty_unsealed_date");
    } catch (_err) {
      // ignore
    }
    toast.success("🔄 Dev Action: Daily unboxing & missions reset to initial state!");
  };

  const handleAddSpendableXP = () => {
    if (!player) return;
    const addedAmount = 50000;
    const newXP = (player.spendableXP ?? player.xp) + addedAmount;
    recordCustomXPTransaction(addedAmount, "Dev Cheat: Added Spendable XP");
    setMockPlayer({
      ...player,
      spendableXP: newXP,
      xp: (player.xp ?? 0) + addedAmount,
      lifetimeXP: (player.lifetimeXP ?? player.xp) + addedAmount,
    });
    toast.success("💰 Dev Action: Added +50,000 Spendable XP to Raider wallet!");
  };

  const handleGrantTestPack = () => {
    addPack({
      id: `dev_pack_${Date.now()}`,
      name: "Raider Specialist Supply Pack",
      tier: "specialist",
      rarity: "epic",
      itemCount: 4,
      image: "🎁",
    });
    toast.success("🎁 Dev Action: Added 1x Specialist Pack to Vault Stash!");
  };

  return (
    <div className="fixed bottom-20 right-3 sm:right-5 z-[300] font-mono text-xs select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className="mb-2 w-72 rounded-2xl border-2 border-cyan-500/50 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl space-y-2.5 text-slate-200"
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-1.5 font-black text-cyan-300">
                <FlaskConical className="h-4 w-4 text-cyan-400" />
                <span className="uppercase tracking-wider">DEV DEBUG CONTROLS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Dev Controls"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleQuickUnsealAndMastery}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60 hover:border-cyan-400 font-bold transition-all text-[11px] cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>DEV QUICK UNSEAL &amp; 3/3</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-black bg-cyan-900/50 px-1.5 py-0.5 rounded">
                  ⚡
                </span>
              </button>

              <button
                type="button"
                onClick={handleResetDaily}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500 font-bold transition-all text-[11px] cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>DEV RESET DAILY BOUNTIES</span>
                </span>
                <span className="text-[10px] text-slate-400 font-black bg-slate-800 px-1.5 py-0.5 rounded">
                  🔄
                </span>
              </button>

              <button
                type="button"
                onClick={handleAddSpendableXP}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 font-bold transition-all text-[11px] cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>+50,000 SPENDABLE XP</span>
                </span>
                <span className="text-[10px] text-amber-400 font-black bg-amber-900/50 px-1.5 py-0.5 rounded">
                  💰
                </span>
              </button>

              <button
                type="button"
                onClick={handleGrantTestPack}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 font-bold transition-all text-[11px] cursor-pointer text-left"
              >
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>+1 SPECIALIST PACK</span>
                </span>
                <span className="text-[10px] text-purple-400 font-black bg-purple-900/50 px-1.5 py-0.5 rounded">
                  🎁
                </span>
              </button>
            </div>

            <div className="pt-1 text-[9px] text-slate-400 text-center font-sans">
              Collapsible debug overlay for developer testing.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border-2 border-cyan-500/60 px-3 py-1.5 text-cyan-300 shadow-xl hover:bg-cyan-950/80 hover:border-cyan-400 hover:text-cyan-200 transition-all cursor-pointer backdrop-blur-md active:scale-95"
        title="Developer Testing Sandbox"
      >
        <FlaskConical className="h-4 w-4 text-cyan-400 animate-pulse" />
        <span className="font-mono text-[10px] font-black tracking-wider uppercase">DEV TOOLS</span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-cyan-400" />
        )}
      </button>
    </div>
  );
}
