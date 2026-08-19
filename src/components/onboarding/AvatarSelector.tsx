import { Check } from "lucide-react";
import { STARTER_AVATARS } from "@/services/onboarding";

export function AvatarSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STARTER_AVATARS.map((a) => {
        const selected = value === a.id;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-xl border bg-gradient-to-br ${a.gradient} p-3 text-left transition-all ${
              selected
                ? "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.5)] scale-[1.02] ring-2 ring-primary/40"
                : "border-border hover:border-primary/60 hover:bg-surface-2/60"
            }`}
            aria-pressed={selected}
          >
            <div className="relative mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <img
                src={a.imageUrl}
                alt={a.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-xs drop-shadow">
                {a.emoji}
              </span>
            </div>

            <div className="w-full text-center">
              <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                {a.name}
              </span>
              <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground leading-tight">
                {a.tagline}
              </p>
            </div>

            {selected && (
              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shadow">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
