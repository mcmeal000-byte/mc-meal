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

## Phase A/B Test

1. Run Supabase SQL: `backend/phaseA/01_daily_game_runs.sql`.
2. Replace `submit-run` with `backend/phaseA/submit-run-level10-run-economy.ts`.
3. Upload frontend.
4. Connect allowlisted wallet.
5. Start Burger Stack with Daily Free Reward Run.
6. Finish result screen and confirm backend saved.
7. Start Burger Stack again with Daily Free Reward Run.
8. Expected: `free_run_already_used`.
9. Start Burger Stack with Extra Reward Run.
10. Expected: 500 $MEAL deducted, 400 burned, 100 reward pool.
11. Start Practice mode.
12. Expected: result does not submit rewards.
