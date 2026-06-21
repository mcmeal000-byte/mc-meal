# MC Meal – Launch Alpha Vercel Ready

This is the Vercel-ready launch package.

Open `VERCEL_DEPLOY_GUIDE.md` first.

# MC Meal – Kitchen Hub Launch MVP v2 Street Town

## Changes from v1

- Top-left brand now uses the created MC Meal logo file.
- Hub layout changed from simple station panels to a street/town layout.
- Buildings now look more like houses/shops on a small Kitchen Street.
- Road, sidewalks, crosswalks, lamps, planters and street details added.
- Same simple playable pixel chef.
- Same launch-preview logic: Arcade, Craft, Shop, Inventory, Leaderboard and Launch Door.

## Controls

- WASD / Arrow Keys: move
- Enter / Space: open building
- Escape: close modal

## Launch use

This version is better for a preview post because it looks more like a small playable MC Meal town instead of only a UI station map.


## v3 changes
- Removed crosswalks.
- Removed street lamps.
- Brightened the overall street palette.
- Street and sidewalks use more natural town-like colors.


## Phase 1 + Backend Starter v1

Added:

- shared/mcmeal-save.js
- Daily Claim station
- shared local profile shape for mini-games / crafting / shop
- backend/supabase/schema.sql
- backend API route examples
- .env.example
- launch plan document

The frontend is still static and launch-safe. Backend files are ready as the next implementation base.


## v2 Craft House upgrade

- Craft House now shows recipe requirements dynamically.
- Each recipe shows:
  - what you currently own
  - what ingredients are still missing
  - whether enough $MEAL is available
  - clear Ready to craft / Missing status
- Added a small Recipe Book summary panel.


## v3 All-in-One

Added all three requested next steps in one build:

1. Connected mini-games
   - Burger Stack
   - Fry Rush
   - Soda Sprint
   - Mystery Order Rush
   - Rewards save into `shared/mcmeal-save.js`.

2. Wallet Connect Read-Only
   - Phantom connect in Launch Door.
   - Reads wallet address.
   - Prepared $MEAL balance check through `config.json`.

3. Better Shop / Market Logic
   - Buy Shop tab
   - Sell Counter tab
   - Market Logic tab
   - Demo burn/pool logic still active.
   - Backend examples prepared for real verification.


## v4 Real Games + Layout Fix

This build fixes the bottom building layout and replaces the simplified connected arcade previews with the approved real game builds:

- Burger Stack v6
- Fry Rush v2
- Soda Sprint easier v2
- Mystery Order Rush v3

Arcade now opens the real game inside the Hub.
Each real game posts rewards back to the Hub when the run result is reached.

Layout fixes:
- Bottom buildings resized and spaced evenly.
- Daily / Launch / Score / Fridge text stays inside buildings.
- Shorter building labels for cleaner readability.


## v5 Launch Alpha Mobile + Polish Build

Added in this build:

- Startscreen with Enter Kitchen and How It Works.
- Mobile-friendly shell and sticky mobile controls.
- Modal/iframe mobile improvements.
- Daily Claim final polish.
- Launch Door / Wallet Read-Only final polish.
- Shop tabs polished: Buy / Sell / Market Plan.
- All 4 approved real games remain connected to Hub rewards.
- Alpha labels added so demo economy is clear.


## v2 hotfix

Arcade now opens the approved real game builds, not the simplified preview/demo modules.

Real games:
- Burger Stack v6
- Fry Rush v2
- Soda Sprint easier v2
- Mystery Order Rush v3


## v3 hotfix

- Craft House helper functions restored.
- Soda Sprint order tray text fixed.
- App UI remains English-only.
