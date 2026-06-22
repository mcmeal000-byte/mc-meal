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
