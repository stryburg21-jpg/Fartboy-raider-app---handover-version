import React from "react";
import { UserCheck, TrendingUp, Trophy, Crown, Gift, Award, Zap, ShieldCheck } from "lucide-react";
import { RaiderAvatar } from "@/components/game/RaiderAvatar";
import type { PlayerPositionData, LeaderboardEntry } from "@/types/game";

interface UserRankSectionProps {
  position: PlayerPositionData | undefined;
  mode: "season" | "lifetime";
  playerEntry?: LeaderboardEntry;
  isLoading?: boolean;
}

export function UserRankSection({ position, mode, playerEntry, isLoading }: UserRankSectionProps) {
  const currentRank = position?.rank ?? playerEntry?.rank ?? 4;
  const username = playerEntry?.username ?? "GassyGoblin";
  const avatar = playerEntry?.avatar ?? "/assets/avatar/base/fartboy-3d-raider.png";
  const level = playerEntry?.level ?? 31;
  const specialist =
    position?.specialistIdentity ?? playerEntry?.specialistIdentity ?? "Methane Sorcerer";
  const currentTitle =
    position?.currentTitle ?? playerEntry?.contributorTitle ?? "Season 3 Meme Legend";

  return (
    <section className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <UserCheck className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Your Rank Status
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              {position?.modeDescription ??
                (mode === "season"
                  ? "Season 3 Competitive Standings"
                  : "All-Time Hall of Fame Ranking")}
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
                <span>Season Rank</span>
              </>
            ) : (
              <>
                <Crown className="h-3.5 w-3.5 text-purple-400" />
                <span>Lifetime Rank</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* YOUR RANK CARD */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-5 md:p-6 shadow-2xl transition-all duration-300 ${
          mode === "season"
            ? "border-amber-400/80 bg-gradient-to-r from-amber-950/40 via-surface-1 to-card"
            : "border-purple-400/80 bg-gradient-to-r from-purple-950/40 via-surface-1 to-card"
        }`}
      >
        {/* Glow accent */}
        <div
          className={`absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full blur-3xl opacity-30 pointer-events-none ${
            mode === "season" ? "bg-amber-400" : "bg-purple-500"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* LEFT: AVATAR & PLAYER DETAILS */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              <RaiderAvatar
                avatar={avatar}
                username={username}
                sizeClassName="h-14 w-14 sm:h-16 sm:w-16 text-3xl sm:text-4xl"
                className={`border-2 shadow-xl ${
                  mode === "season" ? "border-amber-400" : "border-purple-400"
                }`}
              />
              <span
                className={`absolute -bottom-1 -right-1 rounded px-1.5 py-0.2 font-mono text-[9px] font-extrabold shadow ${
                  mode === "season" ? "bg-amber-400 text-black" : "bg-purple-500 text-white"
                }`}
              >
                LV {level}
              </span>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow shrink-0 ${
                    mode === "season" ? "bg-amber-400 text-black" : "bg-purple-500 text-white"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  RANK #{currentRank} {mode === "season" ? "SEASON" : "LIFETIME"}
                </span>

                {position?.currentBracketLabel && (
                  <span className="font-mono text-[10px] sm:text-xs font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 truncate">
                    Bracket: {position.currentBracketLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 min-w-0 flex-wrap pt-0.5">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground truncate max-w-[180px] sm:max-w-none">
                  {username}
                </h3>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono text-xs font-bold text-amber-400 truncate">
                  "{currentTitle}"
                </span>
              </div>

              <div className="font-mono text-[11px] text-muted-foreground truncate">
                Specialist: <span className="text-foreground font-medium">{specialist}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: XP SCORE & TIER PROGRESS (API-DRIVEN) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 shrink-0">
            {/* XP Box */}
            <div className="bg-surface-2/80 p-2.5 sm:p-3 rounded-2xl border border-border/80 flex flex-col justify-center min-w-[130px]">
              <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase text-muted-foreground block">
                {mode === "season" ? "Season 3 XP Score" : "All-Time XP Score"}
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-amber-400 whitespace-nowrap flex items-center gap-1 mt-0.5">
                <Zap className="h-4 w-4 text-amber-400 shrink-0 fill-amber-400" />
                {(mode === "season"
                  ? (position?.seasonXP ?? playerEntry?.seasonXP ?? 38900)
                  : (position?.lifetimeXP ?? playerEntry?.lifetimeXP ?? 98900)
                ).toLocaleString()}{" "}
                XP
              </span>
            </div>

            {/* Next Tier Progress Box */}
            {position && (
              <div className="bg-amber-500/10 p-2.5 sm:p-3 rounded-2xl border border-amber-500/30 flex flex-col justify-center min-w-[180px]">
                <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  Next Bracket Goal
                </span>
                <span className="font-mono text-xs font-extrabold text-amber-200 mt-0.5 truncate">
                  {position.nextTierName}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {position.placesAwayFromNextTier} place away (
                  {position.xpNeededForNextTier.toLocaleString()} XP needed)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE BRACKET REWARDS BANNER (API DATA) */}
        {position?.activeRewards && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Current Bracket Rewards:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {position.activeRewards.badge && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] font-bold">
                  {position.activeRewards.badge} {position.activeRewards.titleReward}
                </span>
              )}
              {position.activeRewards.packReward && (
                <span className="bg-surface-3 text-foreground px-2 py-0.5 rounded text-[11px] font-semibold border border-border flex items-center gap-1">
                  <Gift className="h-3 w-3 text-primary shrink-0" />
                  {position.activeRewards.packReward}
                </span>
              )}
              {position.activeRewards.xpBoostPct && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                  +{position.activeRewards.xpBoostPct}% XP Boost
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
