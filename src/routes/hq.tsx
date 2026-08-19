import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { CharacterPanel } from "@/components/game/CharacterPanel";
import { useGameStore } from "@/store/gameStore";
import { getAllItems } from "@/services/items";
import type { Item } from "@/types/game";

export const Route = createFileRoute("/hq")({
  head: () => ({
    meta: [
      { title: "Raider HQ — Fartboy Raid 2.0" },
      {
        name: "description",
        content: "Your Raider HQ: customise loadout, equipped items, and specialist identity.",
      },
    ],
  }),
  component: CharacterHQPage,
});

export function CharacterHQPage() {
  const player = useGameStore((s) => s.player);
  const [itemsById, setItemsById] = useState<Record<string, Item>>({});

  useEffect(() => {
    getAllItems().then((items) => {
      const map: Record<string, Item> = {};
      for (const it of items) map[it.id] = it;
      setItemsById(map);
    });
  }, []);

  if (!player) {
    return (
      <AppShell>
        <div className="text-muted-foreground p-6">Loading Raider HQ…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 max-w-7xl mx-auto pb-[90px]">
        <PageHeader
          title="CHARACTER HQ"
          subtitle="Raider loadout, equipped gear & specialist identity."
        />

        <CharacterPanel player={player} itemsById={itemsById} />
      </div>
    </AppShell>
  );
}
