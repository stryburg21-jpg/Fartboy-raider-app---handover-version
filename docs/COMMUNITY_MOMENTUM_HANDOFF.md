# Community Momentum Features — Handoff Notes

Implements Feature 1 (Season Meter), Feature 2 (Rare-Drop Broadcasts), Feature 3
(Warchest Meter) from the Community Momentum Features spec v0.1.

## Files to copy into your live copy

**New files (copy as-is):**

```
src/config/communityMeters.ts
src/services/communityMeters.ts
src/services/discordWebhook.ts
src/components/game/CommunityMomentumMeters.tsx
```

**Modified files (merge these changes into your live versions — diffs below):**

```
src/services/xpEngine.ts       — Season Meter hook
src/services/missions.ts       — Warchest Meter hook
src/services/packs.ts          — Rare-Drop Broadcast hook
src/routes/hq.tsx              — mounts the meter widget
src/server/apiHandlers.ts      — two new mock API routes
```

If your live copy has diverged from this snapshot, don't overwrite these five files
wholesale — apply the same small diffs shown below by hand.

---

## Diffs for modified files

### `src/services/xpEngine.ts`

```diff
 import { syncPlayerLeaderboards } from "@/services/leaderboards";
+import { contributeToSeasonMeter } from "@/services/communityMeters";
 import type { EquipmentSlot, Item, Player } from "@/types/game";
```

```diff
   useGameStore.setState({
     player: updatedPlayer,
   });

+  // Feature 1: single additive hook — every XP award also feeds the shared
+  // weekly meter (scaled down; ignores this player's own daily decay).
+  if (netXPAwarded > 0) {
+    contributeToSeasonMeter(netXPAwarded).catch((e) =>
+      console.error("[Season Meter] contribution failed", e),
+    );
+  }
+
   return {
     success: true,
     transaction,
```

### `src/services/missions.ts`

```diff
 import { getCurrentPlayer } from "@/services/player";
 import { getInventory } from "@/services/inventory";
+import { contributeToWarchestMeter } from "@/services/communityMeters";
```

```diff
   const [player, inventory] = await Promise.all([getCurrentPlayer(), getInventory()]);

+  // Feature 3: single additive hook off the existing verified tracking events.
+  if (eventType === "external_boost_submitted" || eventType === "donation_contributed") {
+    contributeToWarchestMeter(count, player.username).catch((e) =>
+      console.error("[Warchest Meter] contribution failed", e),
+    );
+  }
+
   // Combine all active mission configs
```

### `src/services/packs.ts`

```diff
 import { trackMissionEvent } from "@/services/missions";
+import { broadcastRareDrop } from "@/services/discordWebhook";
 import type { Item, ItemSet, Pack, Player } from "@/types/game";
```

```diff
     trackMissionEvent("catalogue_unlocked", 0);
+
+    // Feature 2: reads the already-resolved rarity result, fire-and-forget.
+    for (const item of rolledItems) {
+      broadcastRareDrop(updatedPlayer, item).catch((e) =>
+        console.error("[Rare-Drop Broadcast] failed", e),
+      );
+    }
   }
```

### `src/routes/hq.tsx`

```diff
 import { DailyMissionMasteryConsole } from "@/components/game/DailyMissionMasteryConsole";
+import { CommunityMomentumMeters } from "@/components/game/CommunityMomentumMeters";
...
         <PageHeader title="CHARACTER HQ" />
+        <CommunityMomentumMeters />
         <CharacterPanel
```

This is the only _placement_ decision — move `<CommunityMomentumMeters />` to whatever
screen your team wants as the "highest-traffic real estate" (the spec calls for the
main dashboard). It's a self-contained widget, safe to drop in anywhere.

### `src/server/apiHandlers.ts`

Adds two new mock routes at the end of `handleApiV1Request`, before the 404 fallback
(see full contract below). Also update the "Available routes" string in the 404
message to list them.

---

## API placeholders for backend handover

Two mock endpoints are already live in the mock server, so the frontend contract is
locked before any real backend exists:

```
GET /api/v1/community/season-meter
GET /api/v1/community/warchest-meter
```

Response shape (`CommunityMeterState`, defined in `src/services/communityMeters.ts`):

```json
{
  "status": "success",
  "data": {
    "weekId": "2026-08-10",
    "currentValue": 128500,
    "goal": 500000,
    "unlockedMilestoneIds": ["season_meter_25"],
    "resetsAt": "2026-08-17T00:00:00.000Z",
    "playerIsActiveParticipant": true
  }
}
```

Milestone definitions (thresholds, labels, reward descriptions) live in
`src/config/communityMeters.ts` and are NOT part of the API response — they're static
config shipped with the client, same pattern as everything else in `src/config/`.

**What the real backend needs to do differently from the mock:**

- Aggregate `currentValue` across _all_ players for the current week, not one player's
  local counter.
- On milestone unlock, fan the reward out to every player who was active
  (≥1 XP this week) — the mock only grants it to the current session's player.
- `unlockedMilestoneIds` should be server-authoritative so it can't be spoofed client-side.

---

## Discord Activity / embed considerations

Two things specific to running this inside Discord (Activities / embedded app), flagged
because they're easy to miss during integration:

1. **State must be shared, not per-browser.** The current implementation persists both
   meters in `localStorage`, which is scoped per user/device. In a normal web session
   that's an acceptable placeholder; inside a Discord Activity, every participant in the
   same voice channel/instance needs to see the _same_ meter value in real time.
   `getSeasonMeter()` / `getWarchestMeter()` in `src/services/communityMeters.ts` are the
   only two functions that need to change — swap their localStorage read for a `fetch()`
   to the `/api/v1/community/*` routes above (or your real backend / Discord's Activity
   networking layer) once one exists. Everything else (hooks, UI, milestone logic) is
   already decoupled from the storage mechanism.

2. **Webhook URLs shouldn't ship in the client bundle.** `discordWebhook.ts` currently
   reads `VITE_DISCORD_RARE_DROP_WEBHOOK_URL` / `VITE_DISCORD_MILESTONE_WEBHOOK_URL` and
   posts to Discord directly from the browser. That's fine for local testing but not for
   a shipped build — a webhook URL baked into a client bundle (web or Discord Activity)
   can be extracted and used by anyone to post into your channel. Move
   `broadcastRareDrop()` and `postMeterMilestoneAnnouncement()` behind a small server
   route and call that route from the client instead; the function signatures don't need
   to change, just what's inside them.

3. **CSP / iframe sandboxing.** Discord Activities run in a sandboxed iframe with a
   restrictive Content-Security-Policy and typically require calls to go through
   Discord's proxy (`/.proxy/...`) rather than hitting arbitrary domains directly —
   this is another reason item 2 above (server-side webhook calls) is the right shape
   for the Discord build specifically, not just a nice-to-have.

Neither of these blocks testing the feature in a normal browser — the mock as shipped
works standalone. They're the two things to close out before this specific build target
(Discord) goes live.
