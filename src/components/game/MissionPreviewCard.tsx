import type { Mission } from "@/types/game";
import { XPBar } from "./XPBar";

const badgeClass: Record<Mission["type"], string> = {
  daily: "bg-primary/20 text-primary",
  weekly: "bg-accent/20 text-accent",
  seasonal: "bg-rarity-legendary/20 text-rarity-legendary",
  community: "bg-rarity-rare/20 text-rarity-rare",
};

export function MissionPreviewCard({ mission }: { mission: Mission }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass[mission.type]}`}
          >
            {mission.type}
          </span>
          <h4 className="mt-1 truncate font-semibold">{mission.title}</h4>
          <p className="line-clamp-2 text-xs text-muted-foreground">{mission.description}</p>
        </div>
        <div className="shrink-0 text-right text-xs">
          <div className="font-display font-bold text-primary">+{mission.reward.xp} XP</div>
          {mission.completed ? (
            <div className="text-[10px] font-bold text-primary">✓ Complete</div>
          ) : (
            <div className="text-[10px] text-muted-foreground">In progress</div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <XPBar value={mission.progress} max={mission.requirement} />
        <div className="mt-1 text-right text-[10px] text-muted-foreground">
          {mission.progress} / {mission.requirement}
        </div>
      </div>
    </div>
  );
}
