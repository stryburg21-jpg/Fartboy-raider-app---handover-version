# Fartboy Raid 2.0: Economy Design Bible v3.1 & Item Architecture Engine

**Version:** 3.1 (Season 1 Production Ready)  
**Target Roles:** Economy Architects, Game Designers, Frontend & Backend Engineers, Data Engineers  
**System Scope:** Item Architecture, 84-Base Item Catalogue, 6-Stat Standardized Matrix, Equipment Passive Capping, 7/7 Specialist Set Bonuses, Forge Mechanics, and REST API Endpoints.

---

## 1. CORE ECONOMY & STAT RULES

### 1.1 Equipment Capping & Scaling Directives

1. **Equipment Cap**: The total passive XP bonus accumulated across all **7 equipped gear slots** (`HAT`, `TOP`, `SHORTS`, `BOOTS`, `CAPE`, `PET`, `POWER`) must **NEVER exceed +10.0% total**.
2. **Set Bonuses (7/7 Equipped Pieces)**:
   - Equipping a complete 7/7 Specialist Set unlocks an independent **+15.0% Category XP Bonus** (`set_raid`, `set_cto`, `set_meme`, `set_video`, `set_mission`).
   - Equipping the complete 7/7 Season Specialist Set (`set_season`) unlocks an independent **+10.0% General XP Bonus**.
   - **Crucial Rule:** Set bonuses operate independently and do **NOT** count toward the +10.0% equipment passive gear cap.

### 1.2 The 6 Standardized Core Stats:

| Stat Key     | Name              | Symbol | Purpose / Description                                                                     |
| :----------- | :---------------- | :----: | :---------------------------------------------------------------------------------------- |
| `general_xp` | General XP        |   🚀   | Boosts overall XP earned across every in-game action, raid, and platform task.            |
| `raid_xp`    | Raid XP           |   ⚔️   | Boosts XP earned from Raid activities (snipes, posts, thread blitzes, reposts).           |
| `cto_xp`     | CTO XP            |   💻   | Boosts XP earned from Community Takeover initiatives, dev bounties, and leadership tasks. |
| `mission_xp` | Mission XP        |   🎯   | Boosts XP rewarded upon completing Daily, Weekly, and Seasonal milestones.                |
| `meme_xp`    | Meme & Graphic XP |   🎨   | Boosts XP earned from creative image memes, short video edits, and graphic submissions.   |
| `luck`       | Luck              |   🍀   | Global utility stat for Pack RNG unboxing drop rates and Forge Stat Reroll boundaries.    |

---

## 2. STAT MATRIX BY RARITY & LEVEL (1 → 10)

Stat ranges scale linearly by Item Level (1–10) within the fixed boundaries of an item's Rarity Tier. Stat Rerolls in the Forge randomize between **80% and 100%** of the active level range.

### Primary Stat Range Matrix:

| Rarity Tier   | Lvl 1 (Base) |  Lvl 3   | Lvl 5 (Mid) |  Lvl 8   | Lvl 10 (Max) | Secondary Slots |
| :------------ | :----------: | :------: | :---------: | :------: | :----------: | :-------------: |
| **Common**    |   `+0.05%`   | `+0.10%` |  `+0.15%`   | `+0.22%` |   `+0.30%`   |      **0**      |
| **Uncommon**  |   `+0.10%`   | `+0.20%` |  `+0.30%`   | `+0.42%` |   `+0.50%`   |      **1**      |
| **Rare**      |   `+0.20%`   | `+0.35%` |  `+0.50%`   | `+0.68%` |   `+0.80%`   |      **1**      |
| **Epic**      |   `+0.35%`   | `+0.55%` |  `+0.75%`   | `+0.95%` |   `+1.10%`   |      **2**      |
| **Legendary** |   `+0.50%`   | `+0.75%` |  `+1.00%`   | `+1.25%` |   `+1.40%`   |      **2**      |
| **Mythic**    |   `+0.70%`   | `+1.00%` |  `+1.30%`   | `+1.60%` |   `+1.80%`   |      **3**      |

_Note: Secondary stats follow 50% of the primary stat value for that tier._

---

## 3. SET CATALOGUE & COMPLETE 84-ITEM MAP

All 84 items are organized under their respective 7/7 Specialist Sets across the 7 gear slots:

### Set 1: Raid Specialist (`set_raid`) — `+15% Raid XP Bonus`

- **HAT**: Raid Helmet of the Frontline (`raid_hat_01`), Tactical Raid Visor (`raid_hat_02`)
- **TOP**: Armored Raid Vest (`raid_top_01`), Commando Tactical Hoodie (`raid_top_02`)
- **SHORTS**: Combat Raid Cargo Shorts (`raid_shorts_01`), Reinforced Raid Pants (`raid_shorts_02`)
- **BOOTS**: Heavy Assault Boots (`raid_boots_01`), Stench-Runner Sneakers (`raid_boots_02`)
- **CAPE**: Tattered Raid Banner (`raid_cape_01`), Cloak of the Raid Captain (`raid_cape_02`)
- **PET**: Attack Fart-Bot (`raid_pet_01`), War Carrier Pigeon (`raid_pet_02`)
- **POWER**: Signal Amplifier Beacon (`raid_power_01`), Overclocked Raid Transceiver (`raid_power_02`)

### Set 2: CTO Specialist (`set_cto`) — `+15% CTO XP Bonus`

- **HAT**: CTO Command Headset (`cto_hat_01`), Chart-Sniffing Monocle (`cto_hat_02`)
- **TOP**: Beans & Balance Sheet Suit (`cto_top_01`), Strategic Command Blazer (`cto_top_02`)
- **SHORTS**: Formal CTO Trousers (`cto_shorts_01`), Tactical Dev Chinos (`cto_shorts_02`)
- **BOOTS**: Polished Executive Shoes (`cto_boots_01`), Cyber-Strider Boots (`cto_boots_02`)
- **CAPE**: Blockchain Tapestry (`cto_cape_01`), Network Protocol Cape (`cto_cape_02`)
- **PET**: Autonomous Code Drone (`cto_pet_01`), Cyber-Chihuahua Companion (`cto_pet_02`)
- **POWER**: Methane Terminal (`cto_power_01`), High-Frequency Router (`cto_power_02`)

### Set 3: Meme Specialist (`set_meme`) — `+15% Meme XP Bonus`

- **HAT**: Jester Crown of Memes (`meme_hat_01`), Pixel Art Bucket Hat (`meme_hat_02`)
- **TOP**: Shitposter Hoodie (`meme_top_01`), Canvas-Print Sweater (`meme_top_02`)
- **SHORTS**: Rainbow Gradient Shorts (`meme_shorts_01`), Paint-Spattered Joggers (`meme_shorts_02`)
- **BOOTS**: Oversized Clown Kicks (`meme_boots_01`), Light-Up Meme High-Tops (`meme_boots_02`)
- **CAPE**: Cape of Infinite GIF Loops (`meme_cape_01`), Viral Trend Mantle (`meme_cape_02`)
- **PET**: Flying Pepe-Gecko (`meme_pet_01`), Sentient Meme Toad (`meme_pet_02`)
- **POWER**: Golden Stylus Pen (`meme_power_01`), Viral Content Generator (`meme_power_02`)

### Set 4: Video Specialist (`set_video`) — `+15% Video XP Bonus`

- **HAT**: Director's Beret (`video_hat_01`), Streamer Ring Light Cap (`video_hat_02`)
- **TOP**: Production Crew Jacket (`video_top_01`), Green Screen Bodysuit Top (`video_top_02`)
- **SHORTS**: Cinematographer Cargo Shorts (`video_shorts_01`), Motion Capture Trousers (`video_shorts_02`)
- **BOOTS**: Studio Production Boots (`video_boots_01`), High-Key LED Sneakers (`video_boots_02`)
- **CAPE**: Velvet Red Carpet Cape (`video_cape_01`), Film Strip Trail Cloak (`video_cape_02`)
- **PET**: Flying Camera Drone (`video_pet_01`), Clapperboard Monkey (`video_pet_02`)
- **POWER**: 4K Cinema Lens (`video_power_01`), Broadcast Transmitter Box (`video_power_02`)

### Set 5: Mission Specialist (`set_mission`) — `+15% Mission XP Bonus`

- **HAT**: Scout Patrol Cap (`mission_hat_01`), Completionist Helmet (`mission_hat_02`)
- **TOP**: Field Agent Utility Vest (`mission_top_01`), Daily Streak Windbreaker (`mission_top_02`)
- **SHORTS**: Endurance Runner Shorts (`mission_shorts_01`), Tactical Duty Pants (`mission_shorts_02`)
- **BOOTS**: Marathon Scout Boots (`mission_boots_01`), Terrain Trailblazer Shoes (`mission_boots_02`)
- **CAPE**: Cloak of the Tracker (`mission_cape_01`), Merit Badge Tapestry (`mission_cape_02`)
- **PET**: Loyal Recon Falcon (`mission_pet_01`), Objective-Seeking Hound (`mission_pet_02`)
- **POWER**: Tactical Compass Device (`mission_power_01`), Questmaster Tracker (`mission_power_02`)

### Set 6: Season Specialist (`set_season`) — `+10% General XP Bonus`

- **HAT**: Crown of Eternal Stench (`season_hat_01`), Veteran Raider Helmet (`season_hat_02`)
- **TOP**: Season 1 Champion Armor (`season_top_01`), Prestige Leader Tunic (`season_top_02`)
- **SHORTS**: Golden Season Greaves (`season_shorts_01`), Eternal Fart Leggings (`season_shorts_02`)
- **BOOTS**: Tread of the Warlord (`season_boots_01`), Seasoned Wanderer Boots (`season_boots_02`)
- **CAPE**: Mantle of Eternal Fart Legend (`season_cape_01`), Season 1 Hero Banner (`season_cape_02`)
- **PET**: Phoenix Fart-Sprite (`season_pet_01`), Golden Methane Dragon (`season_pet_02`)
- **POWER**: Aura of Methane Annihilation (`season_power_01`), Seasonal Orb of Destiny (`season_power_02`)

---

## 4. DEVELOPER HANDOVER & API DOCUMENTATION SECTION

### 4.1 REST API Endpoint Contracts

#### 1. `GET /api/v1/items/catalogue`

- **Description:** Fetches full item catalogue grouped by sets and slots.
- **Response Format:**

```json
{
  "status": "success",
  "data": {
    "total_sets": 6,
    "total_base_items": 84,
    "sets": {
      "set_season": {
        "name": "Season Specialist",
        "bonus_description": "+10% General XP Bonus",
        "slots": {
          "POWER": [
            {
              "item_id": "season_power_01",
              "base_name": "Aura of Methane Annihilation",
              "slot": "POWER",
              "rarity": "Mythic",
              "level": 10
            }
          ]
        }
      }
    }
  }
}
```

#### 2. `POST /api/v1/forge/upgrade-level`

- **Description:** Upgrades item level (1-10) using Spendable XP.
- **Request Body:**

```json
{
  "item_id": "season_power_01",
  "target_level": 10
}
```

- **Response Format:**

```json
{
  "status": "success",
  "message": "Item upgraded to Level 10",
  "data": {
    "item_id": "season_power_01",
    "previous_level": 9,
    "new_level": 10,
    "cost_sp_xp": 157000,
    "remaining_player_sp_xp": 284500,
    "updated_stats": {
      "primary": {
        "key": "general_xp",
        "value_pct": 1.71,
        "formatted": "+1.71%"
      }
    }
  }
}
```

#### 3. `POST /api/v1/forge/upgrade-rarity`

- **Description:** Upgrades item rarity tier using duplicate items + Spendable XP.
- **Request Body:**

```json
{
  "base_item_id": "raid_hat_01_inst_1",
  "duplicate_item_ids": ["raid_hat_01_inst_2", "raid_hat_01_inst_3"]
}
```

- **Response Format:**

```json
{
  "status": "success",
  "message": "Fusion successful: Rarity upgraded to Uncommon",
  "data": {
    "item_id": "raid_hat_01_inst_1",
    "new_rarity": "Uncommon",
    "unlocked_secondary_slots": 1,
    "cost_sp_xp": 2500
  }
}
```

#### 4. `POST /api/v1/forge/reroll-stats`

- **Description:** Rerolls stat values between 80% and 100% of current rarity bracket for 5,000 SP-XP.
- **Request Body:**

```json
{
  "item_id": "season_power_01"
}
```

- **Response Format:**

```json
{
  "status": "success",
  "message": "Stats successfully rerolled",
  "data": {
    "item_id": "season_power_01",
    "reroll_cost_sp_xp": 5000,
    "new_quality_pct": 0.965,
    "stats": {
      "primary": {
        "key": "general_xp",
        "value_pct": 1.74,
        "formatted": "+1.74%"
      },
      "secondaries": [
        {
          "key": "raid_xp",
          "value_pct": 1.45,
          "formatted": "+1.45%"
        },
        {
          "key": "luck",
          "value_pct": 1.45,
          "formatted": "+1.45%"
        }
      ]
    }
  }
}
```

---

### 4.2 Standardized Item JSON Object Schema

```json
{
  "item_id": "season_power_01",
  "base_name": "Aura of Methane Annihilation",
  "set_id": "set_season",
  "slot": "POWER",
  "rarity": "Mythic",
  "level": 10,
  "max_level": 10,
  "is_equipped": true,
  "reroll_quality_pct": 0.95,
  "upgrade_costs": {
    "next_level_cost_sp_xp": 0,
    "cumulative_spent_sp_xp": 447500
  },
  "stats": {
    "primary": {
      "key": "general_xp",
      "label": "General XP",
      "icon": "🚀",
      "value_pct": 1.71,
      "formatted": "+1.71%"
    },
    "secondaries": [
      {
        "key": "raid_xp",
        "label": "Raid XP",
        "icon": "⚔️",
        "value_pct": 1.42,
        "formatted": "+1.42%"
      },
      {
        "key": "luck",
        "label": "Luck",
        "icon": "🍀",
        "value_pct": 1.42,
        "formatted": "+1.42%"
      }
    ]
  }
}
```
