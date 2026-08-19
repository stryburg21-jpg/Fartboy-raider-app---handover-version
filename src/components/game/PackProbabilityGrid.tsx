import React from "react";
import type { Rarity } from "@/types/game";
import { Sparkles } from "lucide-react";

export interface PackProbabilities {
  common?: number;
  uncommon?: number;
  rare?: number;
  epic?: number;
  legendary?: number;
  mythic?: number;
}

const RARITY_GRID_THEME: Record<
  Rarity,
  {
    border: string;
    bg: string;
    text: string;
    bar: string;
    label: string;
  }
> = {
  common: {
    label: "Common",
    border: "border-blue-500/35",
    bg: "bg-blue-950/40",
    text: "text-blue-300",
    bar: "bg-blue-500",
  },
  uncommon: {
    label: "Uncommon",
    border: "border-teal-500/35",
    bg: "bg-teal-950/40",
    text: "text-teal-300",
    bar: "bg-teal-400",
  },
  rare: {
    label: "Rare",
    border: "border-cyan-500/35",
    bg: "bg-cyan-950/40",
    text: "text-cyan-300",
    bar: "bg-cyan-400",
  },
  epic: {
    label: "Epic",
    border: "border-purple-500/35",
    bg: "bg-purple-950/40",
    text: "text-purple-300",
    bar: "bg-purple-400",
  },
  legendary: {
    label: "Legendary",
    border: "border-amber-500/35",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    bar: "bg-amber-400",
  },
  mythic: {
    label: "Mythic",
    border: "border-pink-500/35",
    bg: "bg-pink-950/40",
    text: "text-pink-300",
    bar: "bg-pink-400",
  },
};

const ORDERED_RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

export function PackProbabilityGrid({
  probabilities,
  accentColor,
  title = "PACK DROP PROBABILITIES",
  subtitle = "3 Items per Pack",
}: {
  probabilities: PackProbabilities;
  accentColor?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-xl border bg-black/50 p-3 space-y-2.5 shadow-inner"
      style={{
        borderColor: accentColor
          ? `color-mix(in oklab, ${accentColor} 35%, transparent)`
          : "rgba(6, 182, 212, 0.3)",
      }}
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
        <span className="flex items-center gap-1.5" style={{ color: accentColor || "#22d3ee" }}>
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>{title}</span>
        </span>
        {subtitle && <span className="text-[9px] text-slate-500 font-normal">{subtitle}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {ORDERED_RARITIES.map((r) => {
          const raw = probabilities[r] ?? 0;
          const pct = raw * 100;
          const displayPct =
            pct === 0 ? "0%" : pct < 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(0)}%`;
          const theme = RARITY_GRID_THEME[r];

          return (
            <div
              key={r}
              className={`flex flex-col justify-between rounded-xl border p-2 text-left shadow-sm transition-colors ${theme.border} ${theme.bg}`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="text-slate-300">{theme.label}</span>
                <span className={`font-black ${theme.text}`}>{displayPct}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${theme.bar} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(raw > 0 ? 6 : 0, pct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
