# Character Experience

The `/character` route is the player-facing showcase — the hub that ties
progression (XP/level from Discord) → rewards → equipment → collection →
social showcase.

## Composition

- `CharacterPanel` — avatar stage, level, equipped title, XP + season
  progress, and the full 7-slot equipped gear grid. Reused on `/character`
  and available for public profiles (`/player/$id`).
- `FavoriteShowcase` — three curated slots: favourite Item, Title, and
  Achievement. Empty slots render placeholders so the UI works before the
  player picks favourites.
- Reusable primitives added this pass: `RarityBadge`, `ProgressBar`,
  `Modal`.

## Data contract

All character data lives in the global game store (`src/store/gameStore.ts`)
and is hydrated by mock services in `src/services/`. Backend integration
only needs to replace those services — the components consume the store.

Player fields that back the showcase (all optional):

- `favoriteItemId` → resolved against the items catalog.
- `favoriteTitleId` → resolved against `player.titles`.
- `favoriteAchievementId` → resolved against the achievements slice.

## Integration points

- Player + XP + level: `services/player.ts` → replace with the Discord/
  backend feed.
- Equipped items: `player.equipped` (slot → itemId).
- Favourite selections: future `PATCH /api/player/me/favorites` — wire the
  same shape back into the store via the existing setters.
