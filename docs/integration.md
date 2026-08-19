# Fartboy Raid 2.0 — Integration Guide

This document is the handoff for the backend / integrations developer. The
frontend is a shell only — every dynamic value is currently served from
`src/services/*.ts` mock functions. Replace each function body with a real
network call and the UI will keep working unchanged.

## Architecture at a glance

```
UI (routes/*.tsx, components/game/*)
  ↓ calls
Services layer (src/services/*.ts)  ← replace this with real API calls
  ↓ (TODO)
Backend APIs → Database, Discord bot, Blockchain, Auth
```

Data shapes are in `src/types/game.ts`. Balancing constants are in
`src/config/balance.ts`. Do NOT hard-code XP, drop rates, mission rewards,
or season rewards in components — everything routes through these files.

## Services and their expected endpoints

| Service file                | Function                  | Suggested HTTP endpoint               | Purpose                       |
| --------------------------- | ------------------------- | ------------------------------------- | ----------------------------- |
| `services/player.ts`        | `getCurrentPlayer()`      | `GET /api/player/me`                  | Load the authenticated player |
| `services/items.ts`         | `getAllItems()`           | `GET /api/items`                      | Item catalog                  |
| `services/items.ts`         | `getItemById(id)`         | `GET /api/items/:id`                  | Single item                   |
| `services/inventory.ts`     | `getInventory()`          | `GET /api/inventory`                  | Owned items                   |
| `services/inventory.ts`     | `equipItem(id, slot)`     | `POST /api/inventory/equip`           | Equip                         |
| `services/inventory.ts`     | `unequipItem(slot)`       | `POST /api/inventory/unequip`         | Unequip                       |
| `services/packs.ts`         | `getAllPacks()`           | `GET /api/packs`                      | Pack catalog                  |
| `services/packs.ts`         | `getOwnedPacks()`         | `GET /api/user/packs`                 | Unopened packs                |
| `services/packs.ts`         | `openPack(id)`            | `POST /api/packs/open`                | Server rolls contents         |
| `services/shop.ts`          | `getShopListings()`       | `GET /api/shop/listings`              | Shop items                    |
| `services/missions.ts`      | `getMissions()`           | `GET /api/missions`                   | Player missions + progress    |
| `services/leaderboard.ts`   | `getLeaderboard()`        | `GET /api/leaderboard?season=current` | Ranked list                   |
| `services/season.ts`        | `getSeasonPass()`         | `GET /api/season/current`             | Season tier + rewards         |
| `services/collection.ts`    | `getCollectionProgress()` | `GET /api/collection`                 | All set progress              |
| `services/collection.ts`    | `getSetProgress(name)`    | `GET /api/collection/:name`           | One set                       |
| `services/notifications.ts` | `getNotifications()`      | `GET /api/notifications`              | Alerts                        |
| `services/notifications.ts` | `markRead(id)`            | `PATCH /api/notifications/:id`        | Mark read                     |
| `services/payments.ts`      | `createInvoice(amount)`   | `POST /api/payments/invoice`          | Start $FARTBOY payment        |
| `services/payments.ts`      | `checkPaymentStatus(id)`  | `GET /api/payments/invoice/:id`       | Poll status                   |

Every mock function contains `// TODO(backend)` comments marking the
replacement site.

## Data models (see `src/types/game.ts`)

- **Player** — id, username, avatar, level, xp, xpToNext, reputation,
  raidCount, equipped (slot → itemId map), contributorRank, supporterRank,
  achievements[], titles[], seasonProgress, lifetimeStats, loginStreak,
  notificationCount.
- **Item** — id, name, slot, rarity, image, description, stats OR
  capeStats, set, dropRate. Non-cape items may only carry
  `activity | consistency | streak` XP-output boosters. Cape items may
  only carry `packLuck | legendaryChance | rareChance | rerollChance`.
- **Pack** — id, name, rarity, description, image, contents pool,
  probabilities (rarity → weight, sums to 1).
- **ItemSet** — name, required 7 item ids, owned item ids, bonus
  description, completed flag.
- **Mission** — id, type (daily/weekly/seasonal/community), title,
  description, requirement, progress, reward (xp + optional reputation /
  itemId / packId), completed.
- **SeasonProgress / SeasonTier** — current tier, total tiers, xp into
  tier, xp per tier, per-tier free + premium reward.
- **LeaderboardEntry** — rank, playerId, username, avatar, xp,
  raidCount.
- **Invoice / PaymentState** — payment flow states:
  `idle | required | waiting | complete | failed`.
- **Notification** — id, title, message, createdAt, read, kind.

## Backend responsibilities

### Database (Postgres or equivalent)

Suggested tables:

- `players` — 1:1 with auth account
- `items` — canonical catalog
- `user_items` — inventory (player_id, item_id, acquired_at)
- `player_equipment` — slot → item_id
- `packs` — pack catalog
- `user_packs` — owned unopened packs
- `missions` and `mission_progress` (player_id, mission_id, progress)
- `achievements` and `player_achievements`
- `titles` and `player_titles`
- `seasons`, `season_tiers`, `player_season_progress`
- `sets` and `set_items`
- `invoices` (id, player_id, amount, currency, state)
- `notifications`

### Auth

Discord-only on the actual login screen (`src/routes/login.tsx`) — this game
loads inside Discord, so email/wallet login were intentionally dropped from
that screen (the underlying service still supports them for other routes).

All mock logic + the full handoff notes (which Discord auth pattern to use,
config placeholders, expected JSON shape) live in `src/services/auth.ts` —
read the comment block at the top of that file first. Short version:

- `loginWithDiscord()` is what the login button calls. Replace its body with
  either the Discord Embedded App SDK flow (if this ships as a Discord
  Activity) or a standard OAuth2 redirect + code exchange (if it's a
  standalone APK) — see `src/services/auth.ts` for links to both docs.
- `DISCORD_AUTH_CONFIG` holds placeholder `clientId` / `redirectUri` /
  `scopes` — fill in your real values (ideally from env/build config, not
  hardcoded).
- `exchangeDiscordCode(code)` is an extra placeholder for the OAuth2
  redirect-callback step specifically; delete it if you use the Embedded
  App SDK path instead.
- Whatever you build must resolve to the `Session` type already defined in
  that file — `getCurrentPlayer()` should then resolve to the authenticated
  user; unauth users should be redirected to `/login`.

### Discord bot

External. It should award XP by hitting internal endpoints, e.g.
`POST /internal/xp/grant` with an event kind (`raid | meme | video |
daily_login`) — kinds map to values in `src/config/balance.ts` server-side
too.

### Blockchain payments

Frontend never touches the chain. `services/payments.ts` describes the
required states. Wire `createInvoice()` to your token payment provider
and `checkPaymentStatus()` to on-chain confirmation. NFT ownership
verification is a separate backend concern surfaced through
`getInventory()` (mark NFT-backed items with a flag in a future revision).

### Rate limiting / anti-cheat

XP grants must originate from the Discord bot or verified server events —
never from the frontend. The client only reads state.

## How to swap mock → real

Example — `getCurrentPlayer()`:

```ts
// Before
export async function getCurrentPlayer(): Promise<Player> {
  return mockPlayer;
}

// After
export async function getCurrentPlayer(): Promise<Player> {
  const res = await fetch("/api/player/me", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load player");
  return res.json();
}
```

No UI change needed — TanStack Query in the routes handles caching and
refetch.

## Configuration

`src/config/balance.ts` mirrors what the server should authoritatively
own. Client copies are for optimistic UI only; the server is the source
of truth.
