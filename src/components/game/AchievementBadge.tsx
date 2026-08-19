import type { Achievement } from "@/types/game";
import { Lock } from "lucide-react";

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const state = achievement.state ?? (achievement.unlocked ? "completed" : "locked");
  const isLocked = state === "locked";
  const isCompleted = state === "completed";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
        isCompleted
          ? "border-primary/50 bg-card"
          : isLocked
            ? "border-border bg-surface-1 opacity-60"
            : "border-accent/40 bg-card"
      }`}
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-3 text-2xl">
        {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : achievement.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-semibold">{achievement.name}</div>
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              isCompleted
                ? "bg-primary/20 text-primary"
                : isLocked
                  ? "bg-surface-3 text-muted-foreground"
                  : "bg-accent/20 text-accent"
            }`}
          >
            {state}
          </span>
        </div>
        <div className="truncate text-xs text-muted-foreground">{achievement.description}</div>
        {achievement.requirement && !isCompleted && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {achievement.progress ?? 0} / {achievement.requirement}
          </div>
        )}
      </div>
    </div>
  );
}
