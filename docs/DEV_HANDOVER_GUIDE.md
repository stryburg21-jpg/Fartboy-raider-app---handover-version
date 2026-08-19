# Fartboy Raid 2.0 — Developer Handover & Integration Guide

## 1. Executive Summary & Purpose

This handover guide provides backend engineers, Discord bot developers, and smart contract integrators with the instructions required to transition the **Fartboy Gamification System** from its current high-fidelity mock/client architecture to a production-grade live backend.

---

## 2. Frontend State Architecture & Component Binding

The frontend application uses a decoupled service layer interfacing with **Zustand (`useGameStore`)**, **TanStack React Query**, and local storage caching:

```
[UI Components (missions.tsx, achievements.tsx)]
                     │
                     ▼
[Service Layer (src/services/automatedMissionsApi.ts, achievements.ts)]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[src/lib/api/missionsApi.ts]  [Zustand GameStore (src/store/gameStore.ts)]
         │
         ▼
[REST Endpoints / Backend Microservice]
  ├── GET  /api/v1/missions/active
  ├── POST /api/v1/missions/claim-mastery
  └── GET  /api/v1/achievements/season1
```

### Component Binding Matrix

| UI Component / Route                                 | Consumed Data Hook                                                          | Action Handlers                                                                                               |
| :--------------------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `src/routes/missions.tsx`                            | `fetchMissionsPayload()`, `useGameStore`                                    | `completeAutomatedMission()`, `claimDailyMasteryBonus()`, `claimWeeklyMasteryBonus()`, `rerollDailyMission()` |
| `src/components/game/DailyMissionMasteryConsole.tsx` | `payload.dailyMastery`, `featuredDailyMissions`                             | `onClaimMastery()`, `onRerollFeatured()`                                                                      |
| `src/components/game/AutomatedMissionCard.tsx`       | `AutomatedMissionItem`                                                      | `onVerify()` (Discord Green Check), `onClaim()`                                                               |
| `src/routes/achievements.tsx`                        | `useQuery({ queryKey: ["all-achievements"], queryFn: getAllAchievements })` | Category filters, status filters, Discord role claim preview                                                  |
| `src/components/game/AchievementCatalogueCard.tsx`   | `Achievement` object (XP, Badge, Title, Packs, Materials)                   | Progress bars, unlock timestamps, reward pills                                                                |

---

## 3. Verification Triggers & Event Pipelines

Missions and achievements are verified through 4 distinct event triggers:

```
+-----------------------------------------------------------------------------------+
|                           VERIFICATION TRIGGER MATRIX                             |
+-----------------------------------------------------------------------------------+
| Trigger Type           | Origin Service        | Target Mission / Achievement     |
+------------------------+-----------------------+----------------------------------+
| 1. Discord Green Tick  | Discord Bot (Webhooks)| SOCIALS, SNIPER, MEMES (Daily/Wk)|
| 2. Activity Level / TA | Discord Bot (XP Sync) | ACH_007 (Voice of the Vault)     |
| 3. On-Chain Donation   | Solana RPC Listener   | ACH_001, ACH_002 (War Chest)     |
| 4. In-App Game Events  | Game Engine / Forge   | ACH_003, ACH_004, ACH_005        |
+------------------------+-----------------------+----------------------------------+
```

### 3.1 Discord Bot Green Checkmark Triggers

- **Channels:** `#cto-official-post`, `#cto-snipe-targets`, `#memes-submission`
- **Mechanism:** When a raid target is published, the Discord bot monitors player reactions or retweets with green check emojis (`✅`).
- **Backend Hook:** Bot issues an internal webhook `POST /api/v1/internal/missions/progress` with payload:
  ```json
  {
    "userId": "discord_id_12345",
    "missionId": "daily_001",
    "increment": 1,
    "sourceEvent": "DISCORD_EMOJI_CHECK"
  }
  ```

### 3.2 On-Chain Solana War Chest Donations

- **Mechanism:** The backend Solana RPC indexer watches the War Chest multi-sig treasury wallet for incoming SOL/token transfers.
- **Backend Hook:** Matches donor wallet address to Fartboy Raider ID, adds to cumulative donation tally, and automatically marks `ACH_002` (Treasury Supporter) or updates leaderboard position for `ACH_001`.

### 3.3 In-App Game & Forge Triggers

- **Level Upgrades & Fusions:** Calling `upgradeForgeItem()` or `fuseForgeItems()` publishes an internal event incrementing `ACH_004` (Master Blacksmith) target counters.
- **Pack Openings:** Calling `openVaultPack()` in `src/services/packs.ts` increments `ACH_005` (Vault Breaker).
- **Gear Set Equipping:** Equipping loadouts in `src/services/player.ts` validates set bonuses and increments `ACH_003` (Armored & Dangerous).

---

## 4. Backend Database Migration Roadmap

To transition from the current mock/local storage implementation to a persistent SQL database (e.g. PostgreSQL with Prisma / Drizzle):

### 4.1 Recommended Relational Schema

```sql
-- 1. Player Missions Table
CREATE TABLE user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    mission_id VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    target_required INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'unstarted', -- 'unstarted' | 'in_progress' | 'claimable' | 'claimed'
    utc_assigned_date DATE NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mission_id, utc_assigned_date)
);

-- 2. Daily / Weekly Mastery Logs
CREATE TABLE user_mastery_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    mastery_type VARCHAR(20) NOT NULL, -- 'daily' | 'weekly' | 'seasonal'
    utc_cycle_key VARCHAR(32) NOT NULL, -- '2026-08-14' or '2026-W33'
    xp_granted INT NOT NULL,
    item_granted VARCHAR(64),
    title_granted VARCHAR(64),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mastery_type, utc_cycle_key)
);

-- 3. Season 1 Achievement Progress
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    achievement_id VARCHAR(32) NOT NULL,
    progress NUMERIC(10,2) NOT NULL DEFAULT 0,
    target_value NUMERIC(10,2) NOT NULL,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);
```

---

## 5. Security, Idempotency & Anti-Exploit Rules

1. **Mastery Claim Idempotency:** The database `UNIQUE(user_id, mastery_type, utc_cycle_key)` constraint prevents double-claim exploits across concurrent browser tabs or replay requests.
2. **Authoritative Server Verification:** The client UI only requests claims; the backend must verify all mission progress totals against server records before modifying user XP or granting packs.
3. **Fixed Dismantle Yields:** As specified in the Forge System rules, dismantling duplicate items returns fixed baseline SP-XP and is strictly isolated from Luck or Forge Efficiency stat multipliers.
4. **JWT Verification:** All API endpoints must extract and verify the Raider's authenticated wallet/session JWT before processing claims or progress queries.

---

## 6. How to Switch from Mock to Live API

1. In `src/lib/api/missionsApi.ts`, set `USE_MOCK_DATA = false`.
2. Configure your backend API server URL in `.env` (e.g. `VITE_API_BASE_URL=https://api.fartboy.io`).
3. Ensure backend routes strictly match `/docs/API_INTEGRATION_SPEC.md`.
4. Deploy the Discord bot webhook service pointing to `/api/v1/internal/missions/progress`.
