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
