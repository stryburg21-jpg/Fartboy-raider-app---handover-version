import { createFileRoute } from "@tanstack/react-router";
import { CharacterHQPage } from "./hq";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raider HQ — Fartboy Raid 2.0" },
      {
        name: "description",
        content: "Your Raider HQ: customise loadout, equipped items, and specialist identity.",
      },
      { property: "og:title", content: "Raider HQ — Fartboy Raid 2.0" },
      {
        property: "og:description",
        content: "Your Raider HQ: customise loadout, equipped items, and specialist identity.",
      },
    ],
  }),
  component: CharacterHQPage,
});
