import { useState } from "react";
import {
  FlaskConical,
  Zap,
  RefreshCw,
  Package,
  Sparkles,
  UserCheck,
  Check,
  X,
  Award,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDailyMissionsStore } from "@/store/dailyMissionsStore";
import { useGameStore } from "@/store/gameStore";
import { recordCustomXPTransaction } from "@/services/xpEngine";
import { setMockPlayer } from "@/services/player";
import { DemoProfileSwitcher } from "./DemoProfileSwitcher";
import { safeStorage } from "@/lib/storage";

interface DevToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevToolsModal({ open, onOpenChange }: DevToolsModalProps) {
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
    toast.success("⚡ Daily Packs Unsealed & Mastery set to 3/3 Ready!");
  };

  const handleResetDaily = () => {
    devResetDailyState();
    try {
      safeStorage.removeItem("fartboy_daily_bounty_unsealed_date");
    } catch (_err) {
      // ignore
    }
    toast.success("🔄 Daily unboxing & missions reset to fresh initial state!");
  };

  const handleAddSpendableXP = (amount = 50000) => {
    if (!player) return;
    const newXP = (player.spendableXP ?? player.xp) + amount;
    recordCustomXPTransaction(amount, "Dev Cheat: Added Spendable XP");
    setMockPlayer({
      ...player,
      spendableXP: newXP,
      xp: (player.xp ?? 0) + amount,
      lifetimeXP: (player.lifetimeXP ?? player.xp) + amount,
    });
    toast.success(`💰 Added +${amount.toLocaleString()} Spendable XP to Raider wallet!`);
  };

  const handleGrantTestPack = (tier: "specialist" | "celestial" | "mythic" = "specialist") => {
    addPack({
      id: `dev_pack_${Date.now()}`,
      name:
        tier === "celestial"
          ? "Celestial Overlord Loot Cache"
          : tier === "mythic"
            ? "Mythic Apex Raider Crate"
            : "Raider Specialist Supply Pack",
      tier: tier,
      rarity: tier === "celestial" ? "legendary" : tier === "mythic" ? "rare" : "epic",
      itemCount: 4,
      image: tier === "celestial" ? "💎" : "🎁",
    });
    toast.success(`🎁 Added 1x ${tier.toUpperCase()} Pack to Vault Stash!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border border-cyan-500/50 text-foreground p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
        <DialogHeader className="border-b border-cyan-500/30 pb-3">
          <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl font-black text-cyan-300">
            <FlaskConical className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span>DEVELOPER DEBUG TOOLS</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-sans">
            Instant debugging sandboxes, state overrides, and currency grants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 text-xs py-1">
          {/* PROFILE SWITCHER BAR */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Switch Demo Raider Persona</span>
            </span>
            <div className="pt-1">
              <DemoProfileSwitcher />
            </div>
          </div>

          {/* CONTRIBUTOR STATUS INSTANT TOGGLE */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <span>🤝</span>
                <span>Contributor Access Mode</span>
              </span>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                  player?.contributorRank &&
                  player.contributorRank !== "none" &&
                  player.contributorRank !== "free"
                    ? "bg-yellow-400 text-slate-950 shadow-xs"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {player?.contributorRank &&
                player.contributorRank !== "none" &&
                player.contributorRank !== "free"
                  ? "ACTIVE (PASS S1)"
                  : "FREE USER (LOCKED)"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!player) return;
                const isCurrentlyContrib =
                  player.contributorRank &&
                  player.contributorRank !== "none" &&
                  player.contributorRank !== "free";
                const newRank = isCurrentlyContrib ? "none" : "bubble_blaster";

                try {
                  if (isCurrentlyContrib) {
                    localStorage.removeItem("fartboy_user_donated_usd");
                    localStorage.removeItem("fartboy_contributor_pass_s1");
                  } else {
                    localStorage.setItem("fartboy_user_donated_usd", "50");
                    localStorage.setItem(
                      "fartboy_contributor_pass_s1",
                      JSON.stringify({ hasContributorUnlock: true, tier: "bubble_blaster" }),
                    );
                  }
                } catch (_e) {
                  // ignore
                }

                setMockPlayer({
                  ...player,
                  contributorRank: newRank,
                });

                if (isCurrentlyContrib) {
                  toast.info("🔒 Contributor perks disabled (Now Free Raider)");
                } else {
                  toast.success(
                    "✨ Contributor Pass unlocked! (3D Video, Custom Artwork & Frames)",
                  );
                }
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-yellow-950/60 hover:bg-yellow-900/60 border border-yellow-500/40 text-yellow-200 font-bold transition-all text-xs cursor-pointer text-left shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Award className="h-4 w-4 text-yellow-400 shrink-0" />
                <span className="truncate">
                  {player?.contributorRank &&
                  player.contributorRank !== "none" &&
                  player.contributorRank !== "free"
                    ? "Switch to Free Raider (Lock Perks)"
                    : "Unlock Contributor Pass (All Perks Active)"}
                </span>
              </div>
              <span className="text-[10px] font-black text-yellow-300 bg-yellow-900/80 px-2 py-0.5 rounded shrink-0">
                TOGGLE ⚡
              </span>
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={handleQuickUnsealAndMastery}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60 hover:border-cyan-400 font-bold transition-all text-xs cursor-pointer text-left shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="truncate">Unseal Daily Bounty & 3/3 Mastery</span>
              </div>
              <span className="text-[10px] font-black text-cyan-300 bg-cyan-900/80 px-2 py-0.5 rounded shrink-0">
                ⚡ UNSEAL
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAddSpendableXP(50000)}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 font-bold transition-all text-xs cursor-pointer text-left shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="truncate">+50,000 Spendable XP</span>
              </div>
              <span className="text-[10px] font-black text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded shrink-0">
                💰 +50K
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleGrantTestPack("celestial")}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 font-bold transition-all text-xs cursor-pointer text-left shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="truncate">+1 Celestial Overlord Pack</span>
              </div>
              <span className="text-[10px] font-black text-purple-300 bg-purple-900/80 px-2 py-0.5 rounded shrink-0">
                💎 CRATE
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetDaily}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500 font-bold transition-all text-xs cursor-pointer text-left shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 min-w-0">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Reset Daily Bounties & Unseal Status</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
                🔄 RESET
              </span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-black px-5 py-2 rounded-xl"
          >
            CLOSE TOOLS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
