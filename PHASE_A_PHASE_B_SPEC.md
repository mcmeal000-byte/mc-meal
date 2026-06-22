# MC Meal Phase A + Phase B Upgrade Spec

## Phase A — Holder Run Economy

Final rule:

- Only verified $MEAL holders may enter/play after token launch.
- Prelaunch remains private-test locked through `ALLOWED_TEST_WALLETS`.
- Each holder gets **1 free rewarded run per mini-game per day**.
- After the daily free run is used for that specific game, every extra rewarded run costs **250 $MEAL**.
- Practice mode stays playable for holders, but gives no backend XP or ingredients.

### Extra Run Split v1

For each 250 $MEAL extra rewarded run:

- 400 $MEAL burned/tracked as burned
- 100 $MEAL added to reward pool
- Treasury split can be added later after real token settlement is active

## Phase B — Game Upgrade

All four current mini-games have been upgraded to a minimum 10-level run:

- Burger Stack: 10 levels
- Fry Rush: 10 levels
- Soda Sprint: 10 levels
- Mystery Order Rush: 10 levels

Frontend Arcade now shows:

- Daily Free Reward Run
- Extra Reward Run — 250 $MEAL
- Practice — No Rewards

## Backend Deployment Order

1. Run `backend/phaseA/01_daily_game_runs.sql` in Supabase SQL Editor.
2. Replace Supabase Edge Function `submit-run` with `backend/phaseA/submit-run-level10-run-economy.ts`.
3. Keep JWT verification OFF for browser-called functions.
4. Upload frontend files to GitHub Pages.
5. Test one free run, then another free run for same game should return `free_run_already_used`.
6. Test extra paid run; it should deduct 500 demo $MEAL in prelaunch.

## Post pump.fun Launch

After $MEAL mint exists:

- Replace allowlist gate with signature + holder balance check.
- Keep the same run economy logic.
- `250 $MEAL` extra run becomes real token utility after transaction verification is wired.


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
