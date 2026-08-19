import React from "react";
import { ShieldCheck, Sparkles, Clover, Target, HelpCircle } from "lucide-react";
import { getPackPityCounters } from "@/services/pityService";
import { useGameStore } from "@/store/gameStore";
import { calculateActive6Stats } from "@/utils/itemStats";

export interface PackPityProgressSectionProps {
  packId: string;
  isSpecialist?: boolean;
  accentColor?: string;
}

export function PackPityProgressSection({
  packId,
  isSpecialist = false,
  accentColor,
}: PackPityProgressSectionProps) {
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory || []);

  const equippedItems = Object.values(player?.equipped || {})
    .map((id) => inventory.find((i) => i.id === id))
    .filter(Boolean);

  const activeStats = calculateActive6Stats(equippedItems);
  const luckActivePct = Math.max(1.3, Number((activeStats.luck || 0).toFixed(1)));

  const pity = getPackPityCounters(player?.pityState, packId);
  const epicRem = Math.max(0, pity.epicThreshold - pity.epicPityCounter);
  const legRem = Math.max(0, pity.legendaryThreshold - pity.legendaryPityCounter);
  const epicPct = Math.min(100, Math.round((pity.epicPityCounter / pity.epicThreshold) * 100));
  const legPct = Math.min(
    100,
    Math.round((pity.legendaryPityCounter / pity.legendaryThreshold) * 100),
  );

  return (
    <div
      className="rounded-xl border bg-slate-900/90 p-3 space-y-2.5 shadow-inner"
      style={{
        borderColor: accentColor
          ? `color-mix(in oklab, ${accentColor} 30%, transparent)`
          : "rgba(245, 158, 11, 0.25)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono">
        <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          <span>PITY PROGRESSION & SYSTEM GUARANTEES</span>
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <Clover className="h-3 w-3 fill-emerald-400 text-emerald-400" />
          <span>+{luckActivePct}% LUCK ACTIVE</span>
        </span>
      </div>

      {/* EPIC GUARANTEE */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-purple-300 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            {epicRem === 0 ? "EPIC GUARANTEED NOW!" : `GUARANTEED EPIC IN ${epicRem} PACKS`}
          </span>
          <span className="text-slate-400 text-[10px]">
            {pity.epicPityCounter} / {pity.epicThreshold}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-purple-500/30">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${epicPct}%` }}
          />
        </div>
      </div>

      {/* LEGENDARY GUARANTEE */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            {legRem === 0 ? "LEGENDARY GUARANTEED NOW!" : `GUARANTEED LEGENDARY IN ${legRem} PACKS`}
          </span>
          <span className="text-slate-400 text-[10px]">
            {pity.legendaryPityCounter} / {pity.legendaryThreshold}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-amber-500/30">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${legPct}%` }}
          />
        </div>
      </div>

      {/* Targeted Set Bonus if Specialist */}
      {(isSpecialist || packId.includes("specialist")) && (
        <div className="pt-1 border-t border-slate-800 text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>+150% Drop Weight Boost active for missing targeted set items</span>
        </div>
      )}

      {/* Explicit Info Tooltip Banner */}
      <div className="mt-1 flex items-start gap-1.5 rounded-lg bg-black/50 p-2 border border-slate-800 text-[10px] text-slate-400 leading-tight">
        <HelpCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          Opening packs without a high-tier drop builds your pity counter. Reaching max guarantees
          the item! Anti-clustering prevents 3 identical slots per roll.
        </span>
      </div>
    </div>
  );
}
