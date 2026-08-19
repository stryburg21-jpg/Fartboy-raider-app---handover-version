# Fartboy Raid 2.0 - Character HQ API Specification

**Specification Standard:** Economy Design Bible v3.1
**Base URL:** `https://api.fartboyraid.com/api/v1`

---

## 1. GET `/api/v1/player/hq`

Retrieves full Character HQ state including player profile, equipped gear across all 7 slots, active boosts & economy perks, active set bonus calculations, and visible lifetime career stats.

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
    "player": {
      "id": "raider_007",
      "username": "FartboyMaster",
      "level": 27,
      "currentXP": 6430,
      "xpToNextLevel": 8500,
      "title": "BUBBLE BLASTER",
      "reputationTier": "Trusted Raider"
    },
    "equippedSlots": {
      "head": "item_hat_rare_01",
      "body": "item_top_epic_01",
      "shorts": "item_shorts_uncommon_01",
      "feet": "item_boots_rare_01",
      "back": "item_cape_legendary_01",
      "pet": "item_pet_epic_01",
      "powerItem": "item_power_mythic_01"
    },
    "activeBoostsAndPerks": {
      "equipmentXpBoost": "+8.0% / +10.0% MAX",
      "activeSetXpBoost": "+15.0%",
      "seasonalTitleXpBoost": "+3.0%",
      "reputationMultiplier": "1.25x",
      "categoryXpPerks": {
        "memeXpBoost": "+0%",
        "ctoXpBoost": "+0%",
        "videoXpBoost": "+0%"
      },
      "luckAndEconomyPerks": {
        "packLuck": "+24.5%",
        "collectionLuck": "+12.0%",
        "forgeDiscount": "-15%"
      }
    },
    "activeSetBonus": {
      "setName": "RAID SPECIALIST SET",
      "piecesEquipped": 7,
      "piecesRequired": 7,
      "is7of7Complete": true,
      "effect": "+15.0% Raid XP"
    },
    "lifetimeCareerStats": {
      "verifiedRaids": 1420,
      "approvedMemes": 88,
      "approvedVideos": 14,
      "completedMissions": 312,
      "lifetimeXpEarned": 1850000,
      "vaultPacksOpened": 74
    }
  }
}
```

---

## 2. POST `/api/v1/player/equip`

Equips an item into a target gear slot, recalculates active set bonus exclusivity (7/7 check), equipment cap progress (+10% max), and active perks server-side.

### Request Payload

```json
{
  "slot": "head",
  "itemId": "item_hat_rare_01"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Equipment updated successfully",
  "data": {
    "slot": "head",
    "equippedItemId": "item_hat_rare_01",
    "recalculatedSetBonus": {
      "setName": "RAID SPECIALIST SET",
      "piecesEquipped": 7,
      "is7of7Complete": true,
      "effect": "+15.0% Raid XP"
    },
    "recalculatedBoosts": {
      "equipmentXpBoost": "+8.0% / +10.0% MAX",
      "activeSetXpBoost": "+15.0%"
    }
  }
}
```

---

## 3. POST `/api/v1/player/auto-equip-set`

Smart Set Assistant route that scans player inventory for matching set pieces (e.g. Raid Specialist Set) and auto-equips missing slots to fulfill the 7/7 set requirement for the +15% XP multiplier.

### Request Payload

```json
{
  "setName": "Raid Specialist Set"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Successfully auto-equipped 7/7 set pieces!",
  "data": {
    "setName": "RAID SPECIALIST SET",
    "piecesEquipped": 7,
    "is7of7Complete": true,
    "unlockedSetBonus": "+15.0% Raid XP",
    "equippedSlots": {
      "head": "item_hat_rare_01",
      "body": "item_top_epic_01",
      "shorts": "item_shorts_uncommon_01",
      "feet": "item_boots_rare_01",
      "back": "item_cape_legendary_01",
      "pet": "item_pet_epic_01",
      "powerItem": "item_power_mythic_01"
    }
  }
}
```
