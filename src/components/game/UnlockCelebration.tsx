import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/game/RarityBadge";
import { RewardPipeline } from "@/components/game/RewardPipeline";
import { audio } from "@/services/audio";
import type { Rarity } from "@/types/game";

const RARITY_HEX: Record<Rarity, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

export interface CelebrationReward {
  label: string;
  amount?: number;
  kind?: "xp" | "reputation" | "item" | "pack";
  iconEmoji?: string;
  rarity?: Rarity;
}

export interface CelebrationPayload {
  kind: "mission" | "achievement";
  title: string;
  subtitle?: string;
  iconEmoji: string;
  rarity: Rarity;
  rewards?: CelebrationReward[];
  sourceLabel?: string;
}

export interface UnlockCelebrationProps {
  payload: CelebrationPayload | null;
  onClose: () => void;
}

export function UnlockCelebration({ payload, onClose }: UnlockCelebrationProps) {
  useEffect(() => {
    if (!payload) return;
    audio.play(payload.kind === "mission" ? "mission.complete" : "achievement.unlock");
    audio.play(`celebration.${payload.rarity}`);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payload, onClose]);

  if (!payload) return null;

  const hex = RARITY_HEX[payload.rarity];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${payload.title} claimed`}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Godrays */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 animate-godray-spin opacity-40"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, ${hex} 30%, transparent) 12deg, transparent 24deg, transparent 60deg, color-mix(in oklab, ${hex} 22%, transparent) 72deg, transparent 84deg)`,
        }}
      />

      {/* Impact rings */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 animate-ring-burst rounded-full border-2"
          style={{
            borderColor: `color-mix(in oklab, ${hex} 60%, transparent)`,
            animationDelay: `${i * 220}ms`,
          }}
        />
      ))}

      <div
        className="relative w-full max-w-md rounded-xl border bg-surface-1 p-6 text-center animate-scale-in"
        style={{
          borderColor: `color-mix(in oklab, ${hex} 60%, transparent)`,
          boxShadow: `0 0 90px -20px color-mix(in oklab, ${hex} 90%, transparent)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">
          {payload.kind === "mission" ? "Mission Complete" : "Achievement Unlocked"}
        </div>

        <div
          className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-xl text-4xl"
          style={{
            background: `color-mix(in oklab, ${hex} 22%, transparent)`,
            boxShadow: `0 0 44px -10px color-mix(in oklab, ${hex} 90%, transparent)`,
          }}
        >
          {payload.iconEmoji}
        </div>

        <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">{payload.title}</h3>
        {payload.subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{payload.subtitle}</p>
        ) : null}

        <div className="mt-3 flex items-center justify-center gap-2">
          <RarityBadge rarity={payload.rarity} />
          {payload.sourceLabel ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              ◈ {payload.sourceLabel}
            </span>
          ) : null}
        </div>

        {/* Rewards section */}
        {payload.rewards && payload.rewards.length > 0 ? (
          <div className="mt-5 space-y-2 text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Rewards
            </div>
            <div className="flex flex-wrap gap-2">
              {payload.rewards.map((r, i) => (
                <div
                  key={`${r.label}-${i}`}
                  className="flex items-center gap-2 rounded-sm border border-border/80 bg-black/30 px-3 py-1.5 font-mono text-xs"
                >
                  {r.iconEmoji ? <span className="text-base">{r.iconEmoji}</span> : null}
                  <span className="font-semibold text-foreground">
                    {r.amount && r.amount > 1 ? `${r.amount}x ` : ""}
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-md border border-border/60 bg-black/20 p-3 text-left">
          <RewardPipeline
            compact
            activeStage={
              payload.rewards?.some((r) => r.kind === "pack")
                ? ["pack-granted", "pack-vault"]
                : ["reward-eligible"]
            }
          />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={onClose}
            size="lg"
            className="min-w-32 font-bold uppercase tracking-wider"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
