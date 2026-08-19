# Fartboy Raid 2.0 — Season 1 Missions & Achievements System

## 1. System Overview & Season 1 Architecture

The **Missions & Achievements System** forms the primary retention and engagement flywheel of the **Fartboy Gamification Platform**. In **Season 1: Genesis Rising** (90-day seasonal timeline), players participate in daily bounties, weekly campaigns, and persistent seasonal milestones that reward **Spendable XP (SP-XP)**, **Collectible Supply Packs**, **Forge Materials**, and **Exclusive Cosmetic Titles / Discord Roles**.

```
+-----------------------------------------------------------------------------------+
|                           SEASON 1: GENESIS RISING (90 DAYS)                      |
+-----------------------------------------------------------------------------------+
|  DAILY MISSIONS (3 Active)   |  WEEKLY CAMPAIGNS (3 Active)  |  SEASON ACHIEVEMENTS|
|  - Resets: 00:00 UTC Daily   |  - Resets: Monday 00:00 UTC   |  - 10 Static Goals  |
|  - Reroll: 1 Free/Day        |  - High-XP Milestones         |  - Prestige Rewards |
|  - Mastery: +1,000 XP + Pack |  - Mastery: +5,000 XP + Pack  |  - Mastery: +25k XP |
+-----------------------------------------------------------------------------------+
```

---

## 2. The 9 Mission Categories

To cover the entire ecosystem lifecycle (on-chain activity, social raids, content creation, and in-game progression), missions are dynamically selected from 9 dedicated categories:

| Code           | Category Name                 | Primary Focus & Verification Channel                                                             | Example Objective                                                |
| :------------- | :---------------------------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **CTO**        | **CTO Ideation & Governance** | Community bounties, governance proposals, roadmap ideation (`#cto-official-post`)                | Trigger 3 verified CTO bounty raids or submit approved proposals |
| **SNIPER**     | **Sniper Raids**              | Rapid-response alerts, partner liquidity raids, sniping target engagement (`#cto-snipe-targets`) | Complete 1 priority partner sniper raid within 30m of alert      |
| **PERSONAL**   | **Personal Progression**      | Daily login streaks, profile customisations, leveling milestones (`#general-chat` / App)         | Maintain a 7-day unbroken login streak & equip cosmetic title    |
| **VIDEOS**     | **Video Creation**            | High-production TikToks, YouTube Shorts, X video clips (`#video-submissions`)                    | Submit 1 verified video clip or reel with >1,000 impressions     |
| **MEMES**      | **Meme Production**           | Original meme graphics, viral GIF reactions (`#memes-submission`)                                | Submit 2 community memes verified by bot reaction thresholds     |
| **DISCORD**    | **Discord Community**         | Chat activity, Technical Analysis (TA), voice events (`#general-chat`, `#ta-charts`)             | Reach Discord Activity Level 20 & post weekly chart analysis     |
| **EXTERNAL**   | **External Projects**         | DexScreener rocket boosts, CMC/CoinGecko watchlists (`#crypto-voting-boost`)                     | Cast 10 daily DexScreener rocket votes and submit proof          |
| **GAME_FORGE** | **Game & Forge Operations**   | Forge upgrades, rarity fusions, pack openings, set equipment (`#forge-showcase`)                 | Execute 3 Forge upgrades and open 5 supply packs in Vault        |
| **SOCIALS**    | **Social Engagement**         | X/Twitter raids, retweets, quote tweets, comments with green checkmark bot                       | Complete 3 verified X raids with green check verification        |

---

## 3. Rotation Mechanics & Reset Cadence

### 3.1 Daily Mission Rotation (3 Active Missions)

- **Cadence:** Resets automatically every 24 hours at **00:00:00 UTC**.
- **Active Slots:** Exactly 3 active daily missions are presented in the player's tactical console.
- **Daily Unboxing & Rerolls:** Players unseal their daily packet and receive **1 Free Reroll** per UTC day to substitute an uncompleted bounty with a fresh randomized task.
- **Completion Window:** Unclaimed completed daily missions expire at UTC midnight rollover.

### 3.2 Weekly Campaign Rotation (3 Active Missions)

- **Cadence:** Resets every **Monday at 00:00:00 UTC**.
- **Active Slots:** 3 high-yield weekly campaigns requiring cumulative gameplay across the 7-day window.
- **Persistence:** Progress persists throughout the week until the Monday midnight UTC cycle.

---

## 4. Mastery Bonuses & Grand Milestone Rewards

Mastery bonuses reward completion of all active tasks within a given cadence:

### 4.1 Daily Mastery Bonus

- **Condition:** Complete all **3 / 3** Daily Missions within the active UTC cycle.
- **Reward:**
  - `+1,000 Spendable XP (SP-XP)`
  - `1x Raider Supply Pack (PACK_RAIDER)`
- **Callout:** `✓ CLAIMED (+1,000 XP & 1 Raider Pack)`

### 4.2 Weekly Mastery Bonus

- **Condition:** Complete all **3 / 3** Weekly Campaigns before the Monday 00:00 UTC reset.
- **Reward:**
  - `+5,000 Spendable XP (SP-XP)`
  - `1x Specialist Supply Pack (PACK_SPECIALIST)`
- **Callout:** `✓ CLAIMED (+5,000 XP & 1 Specialist Pack)`

### 4.3 Seasonal Grand Mastery Bonus

- **Condition:** Unlock all **10 / 10** Season 1 Achievements.
- **Reward:**
  - `+25,000 Spendable XP (SP-XP)`
  - `1x Legendary Supply Pack (PACK_LEGENDARY)`
  - **Exclusive Title:** `"Prestige Veteran"` (Cosmetic Badge & Profile Flaunt)

---

## 5. Season 1 Achievement Catalog (All 10 Milestones)

Below is the complete specification for the 10 Season 1 Achievements ingestible via `GET /api/v1/achievements/season1`:

| ID          | Title                       | Category              | Tier        | Target     | Requirement Metric                                          | Reward Summary                                                                                    |
| :---------- | :-------------------------- | :-------------------- | :---------- | :--------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **ACH_001** | **Patron of the Empire**    | `WAR_CHEST_RANKINGS`  | `LEGENDARY` | 3          | Top 3 rank on War Chest Donation Leaderboard                | `+50,000 XP`, Title: _"War Chest Titan"_, Badge: `badge_gold_treasury`, `3x Legendary Packs`      |
| **ACH_002** | **Treasury Supporter**      | `WAR_CHEST_RANKINGS`  | `EPIC`      | 1.0 SOL    | Cumulative donation value of ≥ 1.0 SOL                      | `+15,000 XP`, Title: _"Treasury Guardian"_, Badge: `badge_silver_treasury`, `2x Specialist Packs` |
| **ACH_003** | **Armored & Dangerous**     | `SET_COLLECTION`      | `LEGENDARY` | 5 Sets     | Equip 5 full matching gear sets across loadouts             | `+25,000 XP`, Title: _"Set Master"_, Badge: `badge_full_set_completion`, `1x Legendary Pack`      |
| **ACH_004** | **Master Blacksmith**       | `FORGE_PROGRESSION`   | `RARE`      | 50 Actions | Execute 50 Forge operations (upgrades, fusions, rerolls)    | `+10,000 XP`, Title: _"Forge Lord"_, Badge: `badge_forge_hammer`, `500x Forge Dust`               |
| **ACH_005** | **Vault Breaker**           | `PACK_OPENINGS`       | `EPIC`      | 50 Packs   | Unbox 50 Supply Packs in the Raider Vault                   | `+20,000 XP`, Title: _"Vault Breaker"_, Badge: `badge_opened_chest`, `3x Specialist Packs`        |
| **ACH_006** | **Architect of the Meta**   | `CTO_IDEATION`        | `LEGENDARY` | 3 Bounties | Trigger 3 successful CTO bounty raids / initiatives         | `+35,000 XP`, Title: _"CTO Architect"_, Badge: `badge_cto_crown`, `2x Legendary Packs`            |
| **ACH_007** | **Voice of the Vault**      | `DISCORD_COMMUNITY`   | `RARE`      | Lvl 20     | Reach Discord Level 20 & submit verified Technical Analysis | `+12,000 XP`, Title: _"Chart Strategist"_, Badge: `badge_candlestick_hero`, `5x Raider Packs`     |
| **ACH_008** | **Vanguard Raid Commander** | `RAID_OPERATIONS`     | `EPIC`      | 100 Raids  | Execute 100 cumulative verified raids on X & partners       | `+20,000 XP`, Title: _"Raid Commander"_, Badge: `badge_crossed_swords`, `2x Specialist Packs`     |
| **ACH_009** | **Unwavering Loyalty**      | `WEB_APP_DAILY`       | `COMMON`    | 30 Days    | Log into the Fartboy Web App on 30 distinct days            | `+7,500 XP`, Title: _"Season Veteran"_, Badge: `badge_calendar_star`, `3x Raider Packs`           |
| **ACH_010** | **DexScreener Dominator**   | `EXTERNAL_VISIBILITY` | `RARE`      | 40 Boosts  | Submit 40 external platform boosts (DexScreener/CMC/CG)     | `+10,000 XP`, Title: _"Trendsetter"_, Badge: `badge_rocket_fire`, `1x Specialist Pack`            |
