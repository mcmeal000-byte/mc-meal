# MC Meal – Season 0 Live

Backend-synced Season 0 build for MC Meal.

## Active

- Wallet-linked profile sync
- Supabase inventory
- Daily claim
- Mini-game reward submit
- Crafting
- Shop buy
- Shop sell
- Secret Receipt visible as COMING SOON / locked future utility
- XP, burn counter, reward pool and market volume

## Backend endpoints

This frontend is connected to:

- profile-connect
- daily-claim
- submit-run
- craft
- shop-buy-demo
- shop-sell-demo

## Upload to GitHub Pages

Upload the extracted files and folders to the repository root. Do not upload the ZIP itself.

Required folders:

- assets
- games
- shared

Required files:

- index.html
- style.css
- hub.js
- config.example.json

## Token settlement

Season 0 progression is backend-synced. Real $MEAL settlement should only be activated after wallet signature verification and Solana transaction verification.


## v3 cache fix
Secret Receipt is visible as COMING SOON and disabled in the shop. index.html uses cache-busted script/style URLs so GitHub Pages does not keep the old hub.js.


## Economy safety limits v5

- Free Reward Runs: 1 per game per wallet per day.
- Paid Extra Reward Runs: max 20 per wallet per day.
- Extra Reward Run cost: 250 $MEAL.
- Extra Reward Run split: 200 burn / 50 reward pool.
- Mystery Meal Attempts: max 3 per wallet per day.
- Daily Claim: 1 per wallet per day.
- Mystery odds unchanged: Scrap 40%, Common 35%, Rare 18%, Supreme 5.5%, Legendary 1.25%, Golden 0.25%.


## Fry Rush Balance v6

Fry Rush was made harder before go-live:
- Lives reduced to 3.
- Tray gets smaller across levels.
- Spawn speed and falling speed increased.
- Bad item rate increased on higher levels.
- Missing 3 good orders costs 1 life.
- Level goals increased so Fry Rush is no longer the easiest farming route.


## Final UI clean v7

Removed public-facing test/prelaunch/season wording from the interface:
- Private Test Kitchen -> Kitchen Economy
- Private Test Access -> Kitchen Access
- Solana $MEAL Prelaunch -> Solana $MEAL
- Launch/Access modals now use final wallet / holder access language
- Arcade/Craft/Shop/Daily copy cleaned for final surface


## Launch Page Clean v8

Cleaned the Launch / Wallet page:
- Access Tier no longer exposes backend/private-test wording.
- Internal `Private Test Access` is displayed as `Kitchen Access`.
- Launch modal wording changed to final wallet/access language.


## v10.2 Sync Fix
- Stale local wallet cache no longer opens Kitchen access.
- Start screen remains until check-access + profile-connect successfully sync.
- Prevents LOCAL VIEW gameplay from appearing as connected.
