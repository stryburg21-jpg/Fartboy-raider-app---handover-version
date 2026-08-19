# Project Handover Documentation

## 1. Overview & Architecture

This application is a gamified web application featuring character customization, gear equipment, the Raider Forge, Season Pass progression, and community raids.

---

## 2. Season Pass UI Structure (`Missions` -> `Season Pass`)

- **50 Cosmetic Tiers**: The Season Pass features 50 unlocked tiers containing exclusive cosmetic rewards (titles, profile frames, character skins, animated auras, and custom emotes).
- **Streamlined Progression**: Removed legacy CP-XP and Community Warchest meters from the Season Pass view to focus purely on "Unlock Full Pass Access (50 Tiers)" and seamless tier progression.

---

## 3. System-Wide 6-Stat Standardized Schema

All equipment, items, modals, animations, toasts, and headers have been standardized to strictly use the **6-Stat Schema**, completely replacing legacy "Power" and "Raid Power" values.

### The 6 Standardized Stat Types:

1. **General XP**: Boosts overall XP earned across all activities.
2. **Raid XP**: Boosts XP earned from Raid activities only (snipes, posts, reposts).
3. **CTO XP**: Boosts XP earned from CTO-related tasks and platform contributions.
4. **Missions XP**: Boosts XP earned from Daily, Weekly, and Season Missions.
5. **Graphic XP**: Boosts XP earned from Video, Meme, and Graphic submission tasks.
6. **Luck**: Increases pack drop weight probabilities and Forge stat reroll potential.

### Slot & Stat Mapping:

- **Hat (`head`)**: Primary Raid XP & General XP.
- **Top (`body`)**: Primary CTO XP & General XP.
- **Shorts (`shorts`)**: Primary Missions XP & General XP.
- **Boots (`feet`)**: Primary Missions XP & Luck.
- **Cape (`back`)**: Primary Luck & General XP.
- **Pet (`pet`)**: Primary Graphic XP & Luck.
- **Specialist Item (`powerItem`)**: Universal boost across all 6 stats.

---

## 4. Raider Forge Mechanics & Workbench

The Raider Forge (`/forge`) is built around 4 core interactive systems:

1. **Level Up Matrix (Lv.1 to Lv.5)**: Upgrades item level to directly scale its 6-stat multipliers (+5% per level) without consuming permanent Lifetime XP.
2. **Stat Reroll Workbench**: Uses RNG dice rolls to re-randomize sub-stat multipliers within the 6-stat pool (5% to 25% ranges).
3. **Rarity Fusion Matrix**: Fuses matching duplicate items to evolve item rarity tier (Common → Rare → Legendary → Mythic), unlocking higher stat caps.
4. **Dismantle & Refund**: Scraps unwanted duplicate gear to recover SP-XP for future forge actions.

---

## 5. Onboarding & Tutorial Alignment

- **Quest Step 4 (The Raider Forge Workbench)**: Fully aligned with the live Forge interface (`/forge`).
- Uses the exact 4-tab workbench selector (Level Up Matrix, Stat Reroll, Fusion Matrix, Dismantle) and reflects the standardized 6-stat pool.
