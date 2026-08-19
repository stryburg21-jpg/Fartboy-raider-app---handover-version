import type { Title } from "@/types/game";
import { Lock } from "lucide-react";

export function TitleBadge({ title }: { title: Title }) {
  const locked = title.unlocked === false;
  if (locked) {
    return (
      <span
        title={title.description}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground/60"
      >
        <Lock className="h-3 w-3" />
        {title.name}
      </span>
    );
  }
  return (
    <span
      title={title.description}
      className={`rounded-full border px-3 py-1 text-xs ${
        title.equipped
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-foreground"
      }`}
    >
      {title.equipped && <span className="mr-1">★</span>}
      {title.name}
    </span>
  );
}
