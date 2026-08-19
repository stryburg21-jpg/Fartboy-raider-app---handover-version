import type { Player } from "@/types/game";
import { Flame, Zap, Star } from "lucide-react";
import { XPInfoPopover } from "./XPInfoPopover";
import { getContributorTierByName } from "@/config/contributor";

export function PlayerSummaryCard({ player }: { player: Player }) {
  const equippedTitle = player?.titles?.find((t) => t?.equipped)?.name;
  const pct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));
  const contributorTier = getContributorTierByName(player.contributorRank);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img
            src={player.avatar}
            alt={player.username}
            className="h-20 w-20 rounded-2xl border-2 border-primary bg-surface-3 object-cover"
          />
          <div className="absolute -bottom-2 -right-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            LV {player.level}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-bold">{player.username}</h2>
          {equippedTitle && (
            <p className="truncate text-xs font-semibold text-primary">"{equippedTitle}"</p>
          )}
          {player.contributorRank && contributorTier.id !== "unranked" && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${contributorTier.bgClass} ${contributorTier.colorClass} border ${contributorTier.borderClass}`}
              >
                {contributorTier.badge} Contributor: {contributorTier.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            Level {player.level}
            <XPInfoPopover />
          </span>
          <span>{(player.lifetimeXP ?? player.xp).toLocaleString()} Lifetime XP</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat icon={<Zap className="h-3.5 w-3.5" />} label="Raids" value={player.raidCount} />
        <MiniStat
          icon={<Star className="h-3.5 w-3.5" />}
          label="Rep"
          value={player.reputation.toLocaleString()}
        />
        <MiniStat
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Streak"
          value={`${player.loginStreak}d`}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-display text-sm font-bold">{value}</div>
    </div>
  );
}
