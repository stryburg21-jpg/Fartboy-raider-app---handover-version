# Fartboy Raid 2.0 - HUD & Economy API Specification

**Specification Standard:** Economy Design Bible v3.1  
**Base URL:** `https://api.fartboyraid.com/api/v1`

---

## 1. GET `/api/v1/player/hud-stats`

Retrieves the player's current HUD statistics, recalculated multipliers, active set status, power ratings, and caps according to Economy Bible v3.1 rules.

### Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "playerId": "raider_007",
    "level": 42,
    "reputationScore": 850,
    "reputationTier": "Trusted Raider",
    "multipliers": {
      "equipmentXpRawPct": 18.5,
      "equipmentXpCappedPct": 10.0,
      "equipmentCapLimitPct": 10.0,
      "isEquipmentCapped": true,
      "specialistSetXpPct": 15.0,
      "activeSet": "Raid Specialist Set",
      "is7of7SetComplete": true,
      "seasonalTitleXpPct": 3.0,
      "priorSeasonDivision": "Gold",
      "reputationMultiplier": 1.25,
      "dailyDecayRate": 0.75,
      "dailyDecayTier": "Tier 2 (25,001 - 50,000 XP)",
      "effectiveXpMultiplier": 1.2
    },
    "economyLuck": {
      "packLuckPct": 24.5,
      "collectionLuckPct": 12.0,
      "forgeEfficiencyPct": 18.0
    },
    "activityPowerRatings": {
      "raidPower": 24850,
      "ctoPower": 18400,
      "memePower": 15200,
      "videoPower": 16900,
      "missionPower": 21500,
      "grandTotalPower": 96850
    }
  }
}
```

---

## 2. GET `/api/v1/player/career-stats`

Returns lifetime engagement metrics, activity totals, and currency summaries.

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "playerId": "raider_007",
    "username": "FartboyMaster",
    "currencies": {
      "lifetimeXP": 482950,
      "spendableXP": 34820,
      "currentDailyXP": 4120
    },
    "engagementTotals": {
      "verifiedRaids": 428,
      "approvedMemes": 89,
      "approvedVideos": 34,
      "completedMissions": 215,
      "packsOpened": 142,
      "forgeUpgrades": 78,
      "itemsDismantled": 52,
      "highestRaidStreak": 21
    }
  }
}
```

---

## 3. POST `/api/v1/player/equip-item`

Swaps an item into an equipment slot, triggers server-side recalculation of caps and 7/7 set bonuses, and returns the updated state.

### Payload

```json
{
  "slot": "head",
  "itemId": "item_hat_epic_02"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Item equipped successfully",
  "data": {
    "slotEquipped": "head",
    "equippedItemId": "item_hat_epic_02",
    "recalculatedMultipliers": {
      "equipmentXpRawPct": 19.0,
      "equipmentXpCappedPct": 10.0,
      "specialistSetXpPct": 15.0,
      "effectiveXpMultiplier": 1.2
    }
  }
}
```
