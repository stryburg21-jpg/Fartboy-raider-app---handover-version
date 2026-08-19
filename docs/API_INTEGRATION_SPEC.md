# Fartboy Raid 2.0 — REST API Integration Specification

This document defines the REST API integration contracts for Missions, Mastery Claims, and Season 1 Achievements within the **Fartboy Gamification System**.

---

## 1. Global API Standards

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <session_or_wallet_jwt>`
- **Status Codes:**
  - `200 OK`: Request succeeded.
  - `400 Bad Request`: Validation failure, incomplete requirements, or mission already claimed.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `404 Not Found`: Target resource or mission ID does not exist.
  - `500 Internal Server Error`: Unhandled backend exception.

---

## 2. Endpoints Specification

### 2.1 `GET /api/v1/missions/active`

Retrieves the authenticated user's current 3 active daily missions and 3 active weekly campaigns along with UTC reset countdowns and mastery progress.

#### Request

- **Method:** `GET`
- **Path:** `/api/v1/missions/active`
- **Headers:**
  ```http
  Authorization: Bearer eyJhbGciOi...
  Accept: application/json
  ```

#### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "seasonId": "season_01",
    "seasonName": "Season 1: Genesis Rising",
    "resets": {
      "dailyUtcReset": "00:00:00Z",
      "weeklyUtcReset": "Monday 00:00:00Z",
      "nextDailyResetSeconds": 48290,
      "nextWeeklyResetSeconds": 307490
    },
    "masteryStatus": {
      "daily": {
        "completedCount": 3,
        "totalRequired": 3,
        "isUnlocked": true,
        "claimed": false,
        "reward": { "xp": 1000, "item": "PACK_RAIDER" }
      },
      "weekly": {
        "completedCount": 2,
        "totalRequired": 3,
        "isUnlocked": false,
        "claimed": false,
        "reward": { "xp": 5000, "item": "PACK_SPECIALIST" }
      },
      "seasonal": {
        "completedCount": 4,
        "totalRequired": 10,
        "isUnlocked": false,
        "claimed": false,
        "reward": { "xp": 25000, "item": "PACK_LEGENDARY", "title": "Prestige Veteran" }
      }
    },
    "dailyMissions": [
      {
        "id": "daily_001",
        "title": "Frontline Scout",
        "category": "SOCIALS",
        "description": "Execute 3 verified raids on X/Twitter and react with green checkmarks in #cto-official-post.",
        "requirement": 3,
        "progress": 3,
        "xpReward": 750,
        "status": "claimable",
        "verificationType": "DISCORD_EMOJI_CHECK",
        "discordChannel": "#cto-official-post"
      },
      {
        "id": "daily_002",
        "title": "Sniper Duty",
        "category": "SNIPER",
        "description": "Execute 1 priority Sniper Raid on partner alerts in #cto-snipe-targets.",
        "requirement": 1,
        "progress": 1,
        "xpReward": 500,
        "status": "claimable",
        "verificationType": "DISCORD_EMOJI_CHECK",
        "discordChannel": "#cto-snipe-targets"
      },
      {
        "id": "daily_003",
        "title": "Loud & Proud",
        "category": "MEMES",
        "description": "Submit 1 original community meme or reaction graphic in #memes-submission.",
        "requirement": 1,
        "progress": 1,
        "xpReward": 1000,
        "status": "claimed",
        "verificationType": "API_SYNC",
        "discordChannel": "#memes-submission"
      }
    ],
    "weeklyMissions": [
      {
        "id": "weekly_001",
        "title": "Raid Master Vanguard",
        "category": "SOCIALS",
        "description": "Execute 25 cumulative verified raids across all partner channels this week.",
        "requirement": 25,
        "progress": 25,
        "xpReward": 5000,
        "status": "claimable",
        "verificationType": "DISCORD_EMOJI_CHECK",
        "discordChannel": "#cto-official-post"
      },
      {
        "id": "weekly_002",
        "title": "Master Blacksmith",
        "category": "GAME_FORGE",
        "description": "Perform 3 Forge equipment level upgrades or rarity fusions.",
        "requirement": 3,
        "progress": 3,
        "xpReward": 5000,
        "status": "claimed",
        "verificationType": "LOCAL_GAMEPLAY_SYNC",
        "discordChannel": "#forge-showcase"
      },
      {
        "id": "weekly_003",
        "title": "DexScreener Vanguard",
        "category": "EXTERNAL",
        "description": "Submit 10 external rocket votes and watchlists on DexScreener.",
        "requirement": 10,
        "progress": 6,
        "xpReward": 3500,
        "status": "in_progress",
        "verificationType": "DISCORD_BOT_HOOK",
        "discordChannel": "#crypto-voting-boost"
      }
    ]
  }
}
```

---

### 2.2 `POST /api/v1/missions/claim-mastery`

Claims a Daily, Weekly, or Seasonal Mastery completion bonus. Validates that all constituent missions are completed and not previously claimed.

#### Request

- **Method:** `POST`
- **Path:** `/api/v1/missions/claim-mastery`
- **Headers:**
  ```http
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOi...
  ```
- **Payload:**
  ```json
  {
    "type": "daily",
    "userId": "raider_0x92f"
  }
  ```

#### Response (200 OK)

```json
{
  "status": "success",
  "message": "DAILY Mastery Bonus successfully claimed!",
  "data": {
    "type": "daily",
    "xpGranted": 1000,
    "itemGranted": "PACK_RAIDER",
    "titleGranted": null,
    "claimedAt": "2026-08-14T02:40:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request (Requirements Not Met):**
  ```json
  {
    "status": "error",
    "code": "MASTERY_REQUIREMENTS_NOT_MET",
    "message": "Cannot claim Daily Mastery: 2/3 daily missions completed."
  }
  ```
- **400 Bad Request (Already Claimed):**
  ```json
  {
    "status": "error",
    "code": "ALREADY_CLAIMED",
    "message": "Daily Mastery reward has already been claimed for this UTC cycle."
  }
  ```
- **401 Unauthorized:**
  ```json
  {
    "status": "error",
    "code": "UNAUTHORIZED",
    "message": "Valid player authorization token required."
  }
  ```

---

### 2.3 `GET /api/v1/achievements/season1`

Fetches the complete catalog of Season 1 achievements, user progression, unlocked timestamps, and associated reward objects.

#### Request

- **Method:** `GET`
- **Path:** `/api/v1/achievements/season1`
- **Headers:**
  ```http
  Authorization: Bearer eyJhbGciOi...
  Accept: application/json
  ```

#### Response (200 OK)

```json
{
  "status": "success",
  "seasonId": "season_01",
  "seasonName": "Season 1: Genesis Rising",
  "meta": {
    "totalAchievements": 10,
    "unlockedAchievements": 4,
    "completionPercentage": 40,
    "durationDays": 90
  },
  "data": [
    {
      "id": "ACH_001",
      "name": "Patron of the Empire",
      "title": "Patron of the Empire",
      "description": "Reach Top 3 rank on the War Chest Donation Leaderboard during Season 1.",
      "unlocked": false,
      "icon": "🏛️",
      "rarity": "legendary",
      "tier": "LEGENDARY",
      "category": "WAR CHEST RANKINGS",
      "type": "DONATION_LEADERBOARD_RANK",
      "targetValue": 3,
      "progress": 1,
      "requirement": 3,
      "state": "locked",
      "discordTag": "@War Chest Titan",
      "reward": {
        "xp": 50000,
        "title": "War Chest Titan",
        "badge": "badge_gold_treasury",
        "discordTag": "@War Chest Titan",
        "packs": [{ "type": "LEGENDARY_PACK", "qty": 3 }]
      }
    },
    {
      "id": "ACH_002",
      "name": "Treasury Supporter",
      "title": "Treasury Supporter",
      "description": "Contribute a cumulative total of 1.0 SOL or equivalent value to the War Chest.",
      "unlocked": true,
      "unlockedAt": "2026-07-28T14:30:00Z",
      "icon": "💰",
      "rarity": "epic",
      "tier": "EPIC",
      "category": "WAR CHEST RANKINGS",
      "type": "CUMULATIVE_DONATION_VAL",
      "targetValue": 1.0,
      "progress": 1.0,
      "requirement": 1.0,
      "state": "completed",
      "discordTag": "@Treasury Guardian",
      "reward": {
        "xp": 15000,
        "title": "Treasury Guardian",
        "badge": "badge_silver_treasury",
        "discordTag": "@Treasury Guardian",
        "packs": [{ "type": "SPECIALIST_PACK", "qty": 2 }]
      }
    },
    {
      "id": "ACH_004",
      "name": "Master Blacksmith",
      "title": "Master Blacksmith",
      "description": "Execute 50 Forge operations (level upgrades, fusions, or stat rerolls).",
      "unlocked": true,
      "unlockedAt": "2026-08-05T09:15:00Z",
      "icon": "🔨",
      "rarity": "rare",
      "tier": "RARE",
      "category": "FORGE PROGRESSION",
      "type": "FORGE_ACTIONS_COUNT",
      "targetValue": 50,
      "progress": 50,
      "requirement": 50,
      "state": "completed",
      "discordTag": "@Forge Lord",
      "reward": {
        "xp": 10000,
        "title": "Forge Lord",
        "badge": "badge_forge_hammer",
        "discordTag": "@Forge Lord",
        "materials": [{ "type": "FORGE_DUST", "qty": 500 }]
      }
    }
  ]
}
```
