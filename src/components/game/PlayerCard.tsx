import type { Player } from "@/types/game";
import { XPBar } from "./XPBar";
import { Flame, Zap } from "lucide-react";
import { getContributorTierByName } from "@/config/contributor";

export function PlayerCard({ player }: { player: Player }) {
  const equippedTitle = player?.titles?.find((t) => t?.equipped)?.name;
  const contributorTier = getContributorTierByName(player.contributorRank);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={player.avatar}
            alt={player.username}
            className="h-16 w-16 rounded-xl border-2 border-primary bg-surface-3 object-cover"
          />
          <div className="absolute -bottom-2 -right-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            LV {player.level}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold">{player.username}</h2>
          {equippedTitle && <p className="text-xs text-primary font-semibold">"{equippedTitle}"</p>}
          {player.contributorRank && contributorTier.id !== "unranked" && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${contributorTier.bgClass} ${contributorTier.colorClass} border ${contributorTier.borderClass}`}
              >
                {contributorTier.badge} {contributorTier.name}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <XPBar
          value={(player.lifetimeXP ?? player.xp) % player.xpToNext}
          max={player.xpToNext}
          label={`Level ${player.level}`}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat icon={<Zap className="h-3.5 w-3.5" />} label="Raids" value={player.raidCount} />
        <Stat
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Streak"
          value={`${player.loginStreak}d`}
        />
        <Stat label="Rep" value={player.reputation.toLocaleString()} />
      </div>
    </div>
  );
}

function Stat({
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
