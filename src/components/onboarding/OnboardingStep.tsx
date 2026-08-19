import type { ReactNode } from "react";

export function OnboardingStep({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 text-center">
        {eyebrow && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
      {footer && <div className="mt-8 flex flex-col gap-3">{footer}</div>}
    </div>
  );
}
