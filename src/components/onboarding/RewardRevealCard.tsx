import type { ReactNode } from "react";

export function RewardRevealCard({
  icon,
  label,
  value,
  delayMs = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delayMs?: number;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/5 p-4 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-forwards shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-bold">{value}</div>
      </div>
      <div className="text-xs font-semibold text-primary">+CLAIM</div>
    </div>
  );
}
