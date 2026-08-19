export function ProgressBar({
  value,
  max,
  label,
  tone = "primary",
}: {
  value: number;
  max: number;
  label?: string;
  tone?: "primary" | "accent" | "success";
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar =
    tone === "accent" ? "bg-accent" : tone === "success" ? "bg-emerald-500" : "bg-primary";
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className={`h-full ${bar} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
