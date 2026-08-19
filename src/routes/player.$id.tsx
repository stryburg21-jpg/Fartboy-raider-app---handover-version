import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { SupporterRankCard } from "@/components/game/SupporterRankCard";
import { StatCard } from "@/components/game/StatCard";
import { TitleBadge } from "@/components/game/TitleBadge";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { ActivityFeed } from "@/components/game/ActivityFeed";
import { ItemDetailsModal } from "@/components/game/ItemDetailsModal";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { getPlayerActivity, getPlayerEquipment, getPlayerProfile } from "@/services/publicProfile";
import { getAchievements } from "@/services/achievements";
import type { EquipmentSlot, Item, Title } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import {
  ArrowLeft,
  Flame,
  Gem,
  Image as ImageIcon,
  Package,
  Star,
  Swords,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/player/$id")({
  component: PlayerInspection,
  head: () => ({
    meta: [
      { title: "Player Profile — Fartboy Raid 2.0" },
      { name: "description", content: "Public profile of a Fartboy Raid raider." },
      { property: "og:title", content: "Player Profile — Fartboy Raid 2.0" },
      { property: "og:description", content: "Inspect a raider's gear, stats and achievements." },
    ],
  }),
});

const SLOTS: { key: EquipmentSlot; label: string; icon: string }[] = [
  { key: "head", label: "Hat", icon: "🎩" },
  { key: "body", label: "Top", icon: "👕" },
  { key: "shorts", label: "Shorts", icon: "🩳" },
  { key: "feet", label: "Boots", icon: "🥾" },
  { key: "back", label: "Cape", icon: "🦸" },
  { key: "pet", label: "Pet", icon: "🐾" },
  { key: "powerItem", label: "Power Item", icon: "⚡" },
];

function PlayerInspection() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [modalItem, setModalItem] = useState<Item | null>(null);

  const profile = useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => getPlayerProfile(id),
  });
  const equip = useQuery({
    queryKey: ["public-equipment", id],
    queryFn: () => getPlayerEquipment(id),
  });
  const activity = useQuery({
    queryKey: ["public-activity", id],
    queryFn: () => getPlayerActivity(id),
  });
  const allAchievements = useQuery({ queryKey: ["achievements"], queryFn: getAchievements });

  if (profile.isLoading || !profile.data) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Loading player…</p>
      </AppShell>
    );
  }

  const p = profile.data;
  const equippedTitle = (p?.titles ?? []).find((t) => t?.equipped);
  const unlockedTitles = (p?.titles ?? []).filter((t) => t?.unlocked && !t?.equipped);
  const xpPct = Math.min(100, Math.round((p.xp / p.xpToNext) * 100));
  const equipped = equip.data?.equipped ?? {};
  const itemsById = equip.data?.itemsById ?? {};
  const unlockedAchievements = (allAchievements.data ?? []).filter(
    (a) => a.state === "completed" || a.state === "unlocked" || a.unlocked,
  );
  const lockedAchievements = (allAchievements.data ?? []).filter(
    (a) => a.state === "locked" || (!a.unlocked && a.state !== "unlocked"),
  );

  return (
    <AppShell>
      <button
        onClick={() => router.history.back()}
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>
      <PageHeader title={p.username} subtitle="Public raider profile · Read-only" />

      {/* Player Header */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={p.avatar}
                alt={p.username}
                className="h-20 w-20 rounded-2xl border-2 border-primary bg-surface-3 object-cover"
              />
              <div className="absolute -bottom-2 -right-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                LV {p.level}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-bold">{p.username}</h2>
              {equippedTitle && (
                <p className="truncate text-xs text-primary">"{equippedTitle.name}"</p>
              )}
              <p className="text-xs text-muted-foreground">{p.contributorRank}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Level {p.level}</span>
              <span>
                {p.xp.toLocaleString()} / {p.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-primary" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat icon={<Swords className="h-3.5 w-3.5" />} label="Raids" value={p.raidCount} />
            <MiniStat
              icon={<Star className="h-3.5 w-3.5" />}
              label="Rep"
              value={p.reputation.toLocaleString()}
            />
            <MiniStat
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Streak"
              value={`${p.loginStreak}d`}
            />
          </div>
        </div>
        <SupporterRankCard rank={p.supporterRank} />
      </div>

      {/* Equipped Gear */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Equipped Gear</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SLOTS.map((s) => {
            const itemId = equipped[s.key];
            const item = itemId ? itemsById[itemId] : undefined;
            if (!item) {
              return (
                <div
                  key={s.key}
                  className="rounded-xl border border-border bg-surface-1 p-3 text-center opacity-60"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-1 grid h-14 place-items-center text-3xl opacity-40">
                    {s.icon}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Empty</div>
                </div>
              );
            }
            const mainStats = Object.entries({
              ...(item.stats ?? {}),
              ...(item.capeStats ?? {}),
            }).slice(0, 2);
            return (
              <button
                key={s.key}
                onClick={() => setModalItem(item)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 bg-surface-1 p-3 text-center transition-transform hover:-translate-y-0.5 ${rarityBorderClass[item.rarity]}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-surface-3 text-3xl">
                  {isImageUrl(item.image) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    item.image
                  )}
                </div>
                <div className="truncate text-xs font-semibold">{item.name}</div>
                <div
                  className={`text-[9px] uppercase tracking-wider ${rarityTextClass[item.rarity]}`}
                >
                  {rarityLabel[item.rarity]}
                </div>
                {mainStats.length > 0 && (
                  <div className="mt-1 flex flex-wrap justify-center gap-1 text-[9px]">
                    {mainStats.map(([k, v]) => (
                      <span key={k} className="rounded bg-surface-2 px-1 py-0.5 text-primary">
                        +{v} {k}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Sets */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Active Sets</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {p.activeSets.map((set) => {
            const owned = set.ownedItemIds.length;
            const total = set.requiredItemIds.length;
            const pct = Math.round((owned / total) * 100);
            const complete = owned === total;
            return (
              <div
                key={set.name}
                className={`rounded-xl border p-4 ${complete ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="font-display font-bold">{set.name}</div>
                    <div className="text-xs text-muted-foreground">{set.description}</div>
                  </div>
                  <div className="text-sm font-mono font-bold">
                    {owned}/{total}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className={complete ? "text-primary" : "text-muted-foreground"}>
                    {complete ? "✓ " : "🔒 "}
                    {set.bonusDescription}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Player Statistics */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Player Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Total Raids"
            value={p.lifetimeStats.raids}
            icon={<Swords className="h-4 w-4" />}
          />
          <StatCard
            label="Packs Opened"
            value={p.lifetimeStats.packsOpened}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            label="Legendaries"
            value={p.lifetimeStats.legendaryItemsFound ?? 0}
            icon={<Gem className="h-4 w-4" />}
          />
          <StatCard
            label="Memes"
            value={p.lifetimeStats.memes}
            icon={<ImageIcon className="h-4 w-4" />}
          />
          <StatCard
            label="Videos"
            value={p.lifetimeStats.videos}
            icon={<Video className="h-4 w-4" />}
          />
          <StatCard
            label="Login Streak"
            value={`${p.loginStreak}d`}
            icon={<Flame className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Titles (locked hidden) */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-4 font-display text-lg font-bold">Titles</h2>
        <TitleGroup
          label="Equipped"
          titles={equippedTitle ? [equippedTitle] : []}
          emptyText="No title equipped."
        />
        <div className="mt-4">
          <TitleGroup label="Unlocked" titles={unlockedTitles} emptyText="No unlocked titles." />
        </div>
      </section>

      {/* Achievements */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Achievements</h2>
          <Link to="/achievements" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unlockedAchievements.slice(0, 6).map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
          {lockedAchievements.slice(0, 3).map((a) => (
            <AchievementBadge key={a.id} achievement={{ ...a, state: "locked" }} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-8 mb-4">
        <h2 className="mb-3 font-display text-lg font-bold">Recent Activity</h2>
        {activity.data && <ActivityFeed items={activity.data} />}
      </section>

      {modalItem && <ItemDetailsModal item={modalItem} onClose={() => setModalItem(null)} />}
    </AppShell>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-display text-sm font-bold">{value}</div>
    </div>
  );
}

function TitleGroup({
  label,
  titles,
  emptyText,
}: {
  label: string;
  titles: Title[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {titles.length ? (
        <div className="flex flex-wrap gap-2">
          {titles.map((t) => (
            <TitleBadge key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}
