import { cn } from "@/lib/utils";
import type { Rarity } from "@/types/game";

export interface ProgressionReward {
  kind: "xp" | "reputation" | "item" | "pack" | "title" | "custom";
  label: string;
  amount?: number;
  rarity?: Rarity;
  iconEmoji?: string;
  deterministicType?: string;
}

export const PROGRESSION_RARITY_HEX: Record<Rarity, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

const DETERMINISTIC_LABEL: Record<string, string> = {
  title: "Title",
  badge: "Badge",
  cosmetic: "Cosmetic",
  "profile-cosmetic": "Profile Cosmetic",
};

export function RewardChip({ reward }: { reward: ProgressionReward }) {
  const rarity = reward.rarity || "common";
  const hex = PROGRESSION_RARITY_HEX[rarity];
  const kindLabel =
    reward.kind === "xp"
      ? "Spendable XP"
      : reward.kind === "pack"
        ? "Pack → Vault"
        : (DETERMINISTIC_LABEL[reward.deterministicType ?? ""] ?? "Direct");

  const amount = reward.amount ?? 1;

  return (
    <div
      className="flex items-center gap-2 rounded-sm border px-2 py-1.5"
      style={{
        borderColor: `color-mix(in oklab, ${hex} 55%, transparent)`,
        background: `color-mix(in oklab, ${hex} 10%, transparent)`,
      }}
      title={`${kindLabel} · ${reward.label}`}
    >
      {reward.iconEmoji ? <span className="text-base leading-none">{reward.iconEmoji}</span> : null}
      <div className="min-w-0 leading-tight">
        <div className="truncate font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {reward.kind === "xp"
            ? `+${amount.toLocaleString()} XP`
            : amount > 1
              ? `${amount}× ${reward.label}`
              : reward.label}
        </div>
        <div
          className="font-mono text-[9px] uppercase tracking-widest"
          style={{ color: `color-mix(in oklab, ${hex} 85%, white)` }}
        >
          {kindLabel}
        </div>
      </div>
    </div>
  );
}

export function RewardList({
  rewards,
  className,
}: {
  rewards: ProgressionReward[];
  className?: string;
}) {
  const hasPack = rewards.some((r) => r.kind === "pack");
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-wrap gap-1.5">
        {rewards.map((r, i) => (
          <RewardChip key={`${r.kind}-${r.label}-${i}`} reward={r} />
        ))}
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {hasPack
          ? "🗄️ Pack Earned → Pack Vault → Pack Opening → Inventory"
          : "⚡ Direct grant · deterministic, never randomised"}
      </p>
    </div>
  );
}

export function RaritySpine({ rarity }: { rarity: Rarity }) {
  const hex = PROGRESSION_RARITY_HEX[rarity];
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 left-0 w-1 rounded-l-md"
      style={{
        background: `linear-gradient(180deg, ${hex}, transparent)`,
      }}
    />
  );
}

export function ClaimStatusPill({
  status,
}: {
  status: "locked" | "active" | "completed" | "unlocked" | "claimed";
}) {
  const map = {
    locked: { label: "Locked", cls: "border-border text-muted-foreground" },
    active: { label: "In progress", cls: "border-border text-muted-foreground" },
    completed: {
      label: "Ready to claim",
      cls: "border-primary/60 text-primary bg-primary/10",
    },
    unlocked: {
      label: "Ready to claim",
      cls: "border-primary/60 text-primary bg-primary/10",
    },
    claimed: {
      label: "✓ Claimed",
      cls: "border-emerald-500/60 text-emerald-400 bg-emerald-500/10",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

export function SourceLabel({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
      ◈ {label}
    </span>
  );
}
