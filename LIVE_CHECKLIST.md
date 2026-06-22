# MC Meal Season 0 Live Checklist

## Before upload

- Supabase functions deployed:
  - profile-connect
  - daily-claim
  - submit-run
  - craft
  - shop-buy-demo
  - shop-sell-demo
- Supabase secrets set:
  - PROJECT_URL
  - SERVICE_ROLE_KEY
- Tables created:
  - profiles
  - inventory_items
  - daily_streaks
  - game_runs
  - craft_actions
  - shop_transactions

## After upload

1. Open the GitHub Pages URL.
2. Click ENTER KITCHEN.
3. Walk to LAUNCH.
4. Connect Phantom.
5. Confirm Backend shows Synced.
6. Open DAILY and claim once.
7. Open CRAFT HOUSE and test Basic Burger if ingredients exist.
8. Open SHOP and buy one small pack.
9. Open ARCADE, play one short run, confirm backend saved message.
10. Open FRIDGE and confirm inventory updated.


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
