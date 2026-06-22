# MC Meal Phase A + Phase B Upgrade Spec

## Phase A — Holder Run Economy

Final rule:

- Only verified $MEAL holders may enter/play after token launch.
- Prelaunch remains private-test locked through `ALLOWED_TEST_WALLETS`.
- Each holder gets **1 free rewarded run per mini-game per day**.
- After the daily free run is used for that specific game, every extra rewarded run costs **500 $MEAL**.
- Practice mode stays playable for holders, but gives no backend XP or ingredients.

### Extra Run Split v1

For each 500 $MEAL extra rewarded run:

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
- Extra Reward Run — 500 $MEAL
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
- `500 $MEAL` extra run becomes real token utility after transaction verification is wired.


## Games Polish v2 Hotfix
- Arcade menu now shows only rewarded run options: Daily Free Reward Run and Extra Reward Run — 500 $MEAL.
- Practice mode removed from the public UI.
- Fry Rush upgraded for readability: clearer good/bad object silhouettes, red X danger objects, safer order tray text, clearer level-clear panel.
- Soda Sprint upgraded with small / medium / large cup sizes, tighter target rules, fixed title/instruction text box and safer order tray text.
- Mystery Meal odds shown in Craft House UI.

## Current Mystery Meal Odds
- Kitchen Scrap: 40%
- Common Meal: 35%
- Rare Meal: 18%
- Supreme Meal: 5.5%
- Legendary Meal: 1.25%
- Golden Meal: 0.25%
