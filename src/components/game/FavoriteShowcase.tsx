import type { Achievement, Item, Title } from "@/types/game";
import { RarityBadge } from "./RarityBadge";
import { isImageUrl } from "./RaiderAvatar";

/**
 * Player-curated showcase: favourite item, title, and achievement.
 * All three are optional — the panel gracefully renders empty slots
 * so the UI works before the player has picked favourites.
 */
export function FavoriteShowcase({
  item,
  title,
  achievement,
}: {
  item?: Item;
  title?: Title;
  achievement?: Achievement;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">Showcase</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <ShowcaseSlot label="Favourite Item">
          {item ? (
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-3 text-3xl overflow-hidden">
                {isImageUrl(item.image) ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  item.image
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{item.name}</div>
                <div className="mt-1">
                  <RarityBadge rarity={item.rarity} />
                </div>
              </div>
            </div>
          ) : (
            <EmptySlot text="Pick a favourite item" />
          )}
        </ShowcaseSlot>

        <ShowcaseSlot label="Favourite Title">
          {title ? (
            <div>
              <div className="font-display text-base font-bold text-accent">{title.name}</div>
              {title.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {title.description}
                </p>
              )}
            </div>
          ) : (
            <EmptySlot text="Equip a title to showcase" />
          )}
        </ShowcaseSlot>

        <ShowcaseSlot label="Favourite Achievement">
          {achievement ? (
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-3 text-2xl">
                {achievement.icon}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{achievement.name}</div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          ) : (
            <EmptySlot text="Pin an achievement" />
          )}
        </ShowcaseSlot>
      </div>
    </section>
  );
}

function ShowcaseSlot({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function EmptySlot({ text }: { text: string }) {
  return (
    <div className="grid h-14 place-items-center rounded-lg border border-dashed border-border text-[11px] text-muted-foreground">
      {text}
    </div>
  );
}
