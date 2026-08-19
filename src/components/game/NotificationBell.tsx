import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useGameStore((s) => s.notifications);
  const markRead = useGameStore((s) => s.markNotificationRead);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 hover:bg-surface-2"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-xl">
          <div className="border-b border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notifications
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markRead(n.id)}
                className="flex cursor-pointer gap-2 border-b border-border/60 px-3 py-2 last:border-0 hover:bg-surface-2"
              >
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.message}</div>
                </div>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
