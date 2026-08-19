import React from "react";
import { Gift, Award, Zap, ShieldCheck, Trophy, Crown, Sparkles } from "lucide-react";
import type { PlacementRewardBracket } from "@/types/game";

interface PlacementRewardBracketsProps {
  brackets: PlacementRewardBracket[];
  mode: "season" | "lifetime";
  isLoading?: boolean;
}

export function PlacementRewardBrackets({
  brackets,
  mode,
  isLoading,
}: PlacementRewardBracketsProps) {
  // Dynamic style calculator driven entirely by bracket tierColor or highlighted flag from backend
  const getBracketCardStyle = (bracket: PlacementRewardBracket) => {
    switch (bracket.tierColor) {
      case "gold":
        return "border-2 border-amber-400 bg-gradient-to-br from-amber-950/60 via-surface-1 to-card text-amber-200 shadow-xl shadow-amber-500/15 ring-1 ring-amber-400/20";
      case "silver":
        return "border-2 border-slate-300 bg-gradient-to-br from-slate-900/60 via-surface-1 to-card text-slate-100 shadow-xl shadow-slate-400/15 ring-1 ring-slate-300/20";
      case "bronze":
        return "border-2 border-amber-700/80 bg-gradient-to-br from-amber-950/40 via-surface-1 to-card text-amber-200 shadow-lg shadow-amber-700/15";
      case "purple":
        return "border-2 border-purple-500/70 bg-gradient-to-br from-purple-950/40 via-surface-1 to-card text-purple-200 shadow-lg shadow-purple-500/15";
      case "cyan":
        return "border border-cyan-500/50 bg-gradient-to-br from-cyan-950/30 via-surface-2/80 to-card text-cyan-200";
      case "emerald":
        return "border border-emerald-500/50 bg-surface-2/80 text-emerald-200";
      case "amber":
        return "border border-amber-500/50 bg-surface-2/80 text-amber-200";
      case "slate":
        return "border border-slate-400/50 bg-surface-2/70 text-slate-300";
      default:
        return bracket.highlighted
          ? "border-2 border-primary/60 bg-gradient-to-br from-surface-1 via-card to-surface-2 text-foreground shadow-lg"
          : "border border-border/80 bg-surface-2/60 text-foreground hover:border-border";
    }
  };

  const getBadgeBg = (bracket: PlacementRewardBracket) => {
    switch (bracket.tierColor) {
      case "gold":
        return "bg-amber-400 text-black font-extrabold";
      case "silver":
        return "bg-slate-300 text-black font-extrabold";
      case "bronze":
        return "bg-amber-700 text-white font-extrabold";
      case "purple":
        return "bg-purple-500 text-white font-extrabold";
      case "cyan":
        return "bg-cyan-500 text-black font-extrabold";
      case "emerald":
        return "bg-emerald-500 text-black font-extrabold";
      default:
        return "bg-surface-3 text-foreground border border-border/80";
    }
  };

  return (
    <section className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Gift className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Placement Reward Brackets
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              {mode === "season"
                ? "Season 3 Placement Prize Pool & Multipliers"
                : "All-Time Hall of Fame Placement Rewards"}
            </p>
          </div>
        </div>

        {/* ACTIVE MODE STATUS BADGE */}
        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
          <span
            className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-sm border ${
              mode === "season"
                ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
                : "bg-purple-500/15 text-purple-300 border-purple-500/30"
            }`}
          >
            {mode === "season" ? (
              <>
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Season 3 Rewards</span>
              </>
            ) : (
              <>
                <Crown className="h-3.5 w-3.5 text-purple-400" />
                <span>Lifetime Rewards</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* DYNAMIC BRACKETS GRID */}
      {!brackets || brackets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
          <p className="font-mono text-xs text-muted-foreground">
            No placement brackets configured for this mode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {brackets.map((bracket) => (
            <div
              key={bracket.id}
              className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between space-y-3.5 ${getBracketCardStyle(
                bracket,
              )}`}
            >
              {/* Top row: Badge Emoji + Placement Label + XP Boost */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform">
                      {bracket.badge}
                    </span>
                    <span className="font-display text-sm sm:text-base font-extrabold truncate">
                      {bracket.placementLabel}
                    </span>
                  </div>

                  {bracket.nextSeasonXPBoostPct ? (
                    <span
                      className={`font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getBadgeBg(
                        bracket,
                      )}`}
                    >
                      +{bracket.nextSeasonXPBoostPct}% XP BOOST
                    </span>
                  ) : null}
                </div>

                {/* Title & Rewards */}
                <div className="space-y-2 text-xs">
                  {bracket.titleReward && (
                    <div className="flex items-center gap-1.5 text-amber-300 font-extrabold font-display">
                      <Award className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">Title: "{bracket.titleReward}"</span>
                    </div>
                  )}

                  {bracket.packReward && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs text-foreground/90 font-semibold">
                      <Gift className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{bracket.packReward}</span>
                    </div>
                  )}

                  {bracket.xpBonus && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold">
                      <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400 fill-amber-400/30" />
                      <span>+{bracket.xpBonus.toLocaleString()} XP Bonus</span>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground line-clamp-2 pt-0.5 font-normal leading-relaxed">
                    {bracket.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata indicator */}
              <div className="pt-2 border-t border-white/5 font-mono text-[9px] text-muted-foreground/70 flex items-center justify-between">
                <span>{mode === "season" ? "Season 3 Placement" : "Lifetime Placement"}</span>
                <ShieldCheck className="h-3 w-3 opacity-60" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
