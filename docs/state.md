# Global Game State

Fartboy Raid 2.0 uses a single Zustand store as the source of truth for
player-scoped data. Every page and component reads from this store instead
of calling services directly.

## Files

- `src/store/gameStore.ts` — the store definition, slices, and actions.
- `src/store/GameStateProvider.tsx` — hydrates the store from mock services
  once the user is authenticated. Mounted in `src/routes/__root.tsx` so it
  runs above every route.

## Slices

| Slice           | Type              | Source (mock)               |
| --------------- | ----------------- | --------------------------- |
| `player`        | `Player \| null`  | `services/player.ts`        |
| `inventory`     | `Item[]`          | `services/inventory.ts`     |
| `packs`         | `Pack[]`          | `services/packs.ts` (owned) |
| `missions`      | `Mission[]`       | `services/missions.ts`      |
| `notifications` | `Notification[]`  | `services/notifications.ts` |
| `season`        | `SeasonTier[]`    | `services/season.ts`        |
| `achievements`  | `Achievement[]`   | `services/achievements.ts`  |
| `collection`    | `ItemSet[]`       | `services/collection.ts`    |
| `activity`      | `ActivityEntry[]` | `services/activity.ts`      |
| `rewards`       | `RewardEntry[]`   | `services/rewards.ts`       |
| `settings`      | `GameSettings`    | (client only)               |

Equipped items live on `player.equipped` — do not duplicate them elsewhere.

## Reading from the store

Use selectors so components only re-render when their slice changes:

```tsx
import { useGameStore } from "@/store/gameStore";

function MyComponent() {
  const player = useGameStore((s) => s.player);
  const missions = useGameStore((s) => s.missions);
  // ...
}
```

Never call `getCurrentPlayer()` (or any of the listed services) from a
component. Add a slice or a selector instead.

## Mutating the store

Domain actions are exposed on the store so cross-page updates stay
consistent:

- `equipItem(slot, itemId)` / `unequipSlot(slot)` — updates
  `player.equipped`. Dashboard, Profile, Inventory, and Player Inspection
  all read from the same field, so a single call is enough.
- `consumePack(packId)` + `addItemsToInventory(items)` — pack open flow.
  Vault, Inventory, and Collection all rerender.
- `addXp(amount)` — bumps `player.xp` after mission/raid rewards.
- `markNotificationRead(id)` — updates the bell across the app.

## Adding a new slice

1. Add the field, default, and setter to `GameState` in
   `src/store/gameStore.ts`.
2. Fetch the initial value inside `GameStateProvider.tsx`'s
   `Promise.all([...])`.
3. Read it in components with `useGameStore((s) => s.mySlice)`.

## Swapping mocks for a real backend

The store shape is the contract components rely on — keep it stable.

1. In `GameStateProvider.tsx`, replace each service call with the real
   API request. The `TODO(backend)` comments mark the swap points.
2. For per-slice revalidation (WebSocket pushes, refetch after mutation),
   call the exposed setters (`useGameStore.getState().setMissions(...)`)
   from wherever the update arrives.
3. For mutations, wrap the domain actions so they call the API first and
   then update the store (or optimistically update the store and reconcile
   on response).

Because every component consumes the store, no UI code needs to change
when the backend is wired in.
