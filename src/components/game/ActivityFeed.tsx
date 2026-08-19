import type { ActivityEntry } from "@/services/activity";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityEntry[] }) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-lg">
            {a.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-sm font-semibold">{a.title}</div>
              <div className="shrink-0 text-[10px] text-muted-foreground">
                {timeAgo(a.createdAt)}
              </div>
            </div>
            <div className="truncate text-xs text-muted-foreground">{a.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
