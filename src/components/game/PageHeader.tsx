import type { ReactNode } from "react";

export function PageHeader({
  title,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h1 className="text-[20px] font-semibold uppercase tracking-wider text-[#FFC700] text-left">
        {title}
      </h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
