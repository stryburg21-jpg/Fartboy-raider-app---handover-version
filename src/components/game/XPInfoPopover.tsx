import { useState } from "react";
import { Info, X } from "lucide-react";
import { XP_ACTIVITIES } from "@/config/xpConfig";

const DISPLAY_ACTIVITIES = [
  XP_ACTIVITIES.social_raid_like_rt,
  XP_ACTIVITIES.social_raid_comment,
  XP_ACTIVITIES.cto_raid,
  XP_ACTIVITIES.cto_snipe,
  XP_ACTIVITIES.content_meme_graphic,
  XP_ACTIVITIES.content_short_video,
  XP_ACTIVITIES.crypto_platform_engagement,
  XP_ACTIVITIES.discord_messages,
];

export function XPInfoPopover() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="How to earn XP"
        className="rounded-full p-1 text-muted-foreground hover:bg-surface-2 hover:text-primary transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">How to Earn XP</h3>
                <p className="text-xs text-muted-foreground">
                  All XP is granted automatically after verification.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-surface-2"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1">
              {DISPLAY_ACTIVITIES.map((r) => (
                <li
                  key={r.type}
                  className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </div>
                  <div className="font-display font-bold text-primary">+{r.baseXP} XP</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
