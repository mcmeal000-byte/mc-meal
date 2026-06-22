# MC Meal Private Test Checklist

1. Upload the extracted files to GitHub Pages.
2. Open the live page and hard refresh with CTRL+F5.
3. The start screen must show CONNECT WALLET.
4. Connect the allowlisted Phantom wallet.
5. Kitchen opens only after backend check-access + profile-connect succeeds.
6. Try a non-allowlisted wallet: it must stay locked.
7. Test Daily, Arcade reward save, Craft, Shop Buy, Shop Sell.
8. Secret Receipt must show as COMING SOON and must not be buyable.

Current mode: prelaunch_private_test.
After $MEAL pump.fun launch, replace allowlist access with real token-holder check.


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
