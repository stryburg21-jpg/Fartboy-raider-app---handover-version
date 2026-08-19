# Fartboy Raid 2.0 — Frontend Foundation Plan

A frontend-only shell. No backend, no auth, no blockchain. All data comes from mock services with `TODO` markers where a developer will wire real APIs later.

## Scope (this generation)

Build the **foundation only**:

1. Design system (dark gaming theme, tokens in `src/styles.css`)
2. Routes (all 11 pages scaffolded — Dashboard rich, others minimal but functional shells)
3. Mock data + service layer
4. Core reusable components
5. Shared app layout (header + nav)

Deep feature polish per page (drag/drop inventory, pack-opening animations, real leaderboard sorting UI, etc.) is intentionally deferred to future iterations.

## Design direction

- Dark, modern gaming console feel — think Discord-meets-arcade.
- Accent: neon lime/yellow (fart-humor forward but tasteful), deep charcoal surfaces, subtle glow shadows.
- Rarity color system: common / uncommon / rare / epic / legendary / mythic tokens.
- Mobile-first (current viewport is 390px). Bottom tab nav on mobile, sidebar on desktop.

## Routes

```
/               Dashboard (player summary, active missions, quick actions)
/profile        Player profile + titles + achievements preview
/inventory      Equipment slots + grid of owned items
/shop           Shop listings (packs + cosmetics)
/packs          Owned unopened packs
/collection     Sets progress (7-item sets)
/missions       Active + available missions
/leaderboard    Top raiders table
/season-pass    Tiered season progress
/achievements   Achievements grid
/settings       Preferences shell
```

## Data models (TypeScript)

`src/types/game.ts` — `Player`, `Item`, `Pack`, `ItemSet`, `Mission`, `EquipmentSlot`, `Rarity`, `ItemStat`, `CapeStat`.

Equipment slots: `hat | shirt | trousers | shoes | socks | cape | accessory`.  
Item stats (non-cape): `activity | consistency | streak` (XP boosters only).  
Cape stats: `packLuck | legendaryChance | rareChance | rerollChance`.

## Mock services

`src/services/*.ts` — each exports async functions returning mock JSON with `// TODO: replace with API call` comments:

- `player.ts` — `getCurrentPlayer()`
- `items.ts` — `getAllItems()`, `getItemById()`
- `inventory.ts` — `getInventory()`, `equipItem()`, `unequipItem()`
- `packs.ts` — `getOwnedPacks()`, `openPack()`
- `shop.ts` — `getShopListings()`
- `missions.ts` — `getMissions()`
- `leaderboard.ts` — `getLeaderboard()`
- `season.ts` — `getSeasonPass()`

## Components

`src/components/game/`:

- `AppShell` (header + nav wrapper)
- `Header`
- `PlayerCard`, `XPBar`
- `InventoryGrid`, `ItemCard`, `EquipmentSlots`
- `PackCard`, `RewardCard`
- `MissionCard`
- `LeaderboardTable`
- `SeasonTier`
- `Modal`, `Notification` (thin wrappers over shadcn dialog / toast)

## File layout

```
src/
  types/game.ts
  services/{player,items,inventory,packs,shop,missions,leaderboard,season}.ts
  components/game/*.tsx
  routes/
    __root.tsx (updated meta)
    index.tsx (Dashboard)
    profile.tsx
    inventory.tsx
    shop.tsx
    packs.tsx
    collection.tsx
    missions.tsx
    leaderboard.tsx
    season-pass.tsx
    achievements.tsx
    settings.tsx
  styles.css (dark gaming theme + rarity tokens)
```

## Out of scope (explicitly)

- Real auth, wallet connect, Discord OAuth
- Pack-opening animations / gacha logic
- Drag-and-drop equipping (buttons only for now)
- SEO sitemap (single-app game, not content site)

Ready to implement on approval.

&nbsp;

&nbsp;

The foundation plan is approved.

&nbsp;

Before implementation, please add the following:

&nbsp;

1. Create /docs/integration.md documenting:

- data models

- service functions

- expected backend API connections

- future database requirements

&nbsp;

2. Add payment service placeholders:

services/payments.ts

&nbsp;

Functions:

- createInvoice()

- checkPaymentStatus()

&nbsp;

Frontend states only:

Payment Required

Waiting Payment

Payment Complete

Payment Failed

&nbsp;

No blockchain implementation.

&nbsp;

3. Expand Player model with:

&nbsp;

- reputation

- supporterRank

- titles

- lifetimeStats

- loginStreak

- notificationCount

&nbsp;

4. Create collection service:

&nbsp;

services/collection.ts

&nbsp;

Functions:

- getCollectionProgress()

- getSetProgress()

&nbsp;

5. Create notification service:

&nbsp;

services/notifications.ts

&nbsp;

6. Ensure all balancing values are configuration-driven placeholders:

- XP rewards

- drop rates

- mission rewards

- pack contents

- season rewards

&nbsp;

Do not hardcode these values inside components.

&nbsp;

Then proceed with implementation of the foundation.
