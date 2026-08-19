export function ProgressIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active
                ? "w-8 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                : done
                  ? "w-4 bg-primary/60"
                  : "w-4 bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}
