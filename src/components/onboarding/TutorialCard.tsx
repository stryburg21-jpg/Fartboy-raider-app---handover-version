import type { ReactNode } from "react";

export function TutorialCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="font-display text-base font-bold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
