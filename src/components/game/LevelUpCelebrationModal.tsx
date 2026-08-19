import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Sparkles, Check, X } from "lucide-react";
import { audio } from "@/services/audio";
import { useGameStore } from "@/store/gameStore";

export function LevelUpCelebrationModal() {
  const pendingLevelUp = useGameStore((s) => s.pendingLevelUp);
  const clearLevelUp = useGameStore((s) => s.clearLevelUp);

  useEffect(() => {
    if (pendingLevelUp) {
      audio.play("achievement.unlock");
      audio.play("celebration.legendary");
    }
  }, [pendingLevelUp]);

  if (!pendingLevelUp) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Raider Level Up"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-[4px] animate-fade-in"
      onClick={clearLevelUp}
    >
      {/* Animated Godray Effect */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 animate-godray-spin opacity-40"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, #eab308 35%, transparent) 15deg, transparent 30deg, transparent 60deg, color-mix(in oklab, #22c55e 30%, transparent) 75deg, transparent 90deg)`,
        }}
      />

      {/* Impact Ring Animations */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-ring-burst rounded-full border-2 border-amber-400/60"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}

      <div
        style={{ paddingTop: "16px" }}
        className="relative w-full max-w-md rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-surface-1 to-surface-2 p-6 pt-4 text-center shadow-[0_0_90px_-20px_rgba(234,179,8,0.6)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute Top-Right Close Button */}
        <button
          type="button"
          onClick={clearLevelUp}
          style={{ position: "absolute", top: "12px", right: "12px" }}
          className="absolute top-3 right-3 z-30 rounded-full bg-slate-900/90 border border-slate-700 p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95 shadow-md"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 text-3xl shadow-[0_0_24px_rgba(234,179,8,0.4)]">
          👑
        </div>

        <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400">
          Milestone Reached
        </div>

        <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-foreground">
          RAIDER LEVEL UP!
        </h2>

        <div className="mt-2 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-sm font-bold text-amber-300">
          Level {pendingLevelUp} Reached
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Your community contributions have elevated your Raider status. New tier rewards and stat
          multipliers are now active!
        </p>

        {/* Rewards Unlocked Summary */}
        <div className="mt-4 space-y-2 text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Unlocked Rewards & Boosts
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">Level Milestone Bonus</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">+100 Spendable XP</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-foreground">
                Specialist Stat Multipliers
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
              +5% All XP Earnings
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-semibold text-foreground">Leaderboard Badge</span>
            </div>
            <span className="font-mono text-xs font-bold text-sky-400">
              Level {pendingLevelUp} Tag
            </span>
          </div>
        </div>

        <Button
          onClick={clearLevelUp}
          className="mt-6 w-full bg-amber-400 font-bold text-amber-950 shadow-[0_0_24px_rgba(234,179,8,0.4)] hover:bg-amber-300"
        >
          <Check className="mr-2 h-4 w-4" /> Claim & Continue
        </Button>
      </div>
    </div>
  );
}
