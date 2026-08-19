import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      {icon && (
        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
      )}
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}
