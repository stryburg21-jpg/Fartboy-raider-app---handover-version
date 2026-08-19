import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/game/AppShell";
import { SeasonGlobalBanner } from "@/components/game/SeasonGlobalBanner";
import { PageHeader } from "@/components/game/PageHeader";
import { CharacterPanel } from "@/components/game/CharacterPanel";
import { useGameStore } from "@/store/gameStore";
import { getAllItems } from "@/services/items";
import type { Item } from "@/types/game";

export const Route = createFileRoute("/character")({
  head: () => ({
    meta: [
      { title: "My Raider — Fartboy Raid 2.0" },
      {
        name: "description",
        content: "Your Raider HQ: customise appearance, loadout, and specialist identity.",
      },
      { property: "og:title", content: "My Raider — Fartboy Raid 2.0" },
      {
        property: "og:description",
        content: "Your Raider HQ: customise appearance, loadout, and specialist identity.",
      },
    ],
  }),
  component: CharacterPage,
});

function CharacterPage() {
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
      <SeasonGlobalBanner />
      <PageHeader
        title="My Raider"
        subtitle="Customise your Raider appearance, loadout, and specialist identity."
      />

      <CharacterPanel player={player} itemsById={itemsById} />
    </AppShell>
  );
}
