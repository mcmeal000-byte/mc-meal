# MC Meal v10 — Real $MEAL Onchain Burn MVP

This build adds real wallet-confirmed $MEAL actions for:

- Extra Reward Run: 200 $MEAL burn + 50 $MEAL to Reward Vault
- Mystery Craft: 450 $MEAL burn + 50 $MEAL to Reward Vault

## 1) Run SQL in Supabase first

Open Supabase SQL Editor and run:

`backend/phaseA/02_onchain_payments.sql`

This creates `onchain_payments` and adds `onchain_signature` columns.

## 2) Set Supabase secrets

Required:

```txt
MEAL_MINT=EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump
REWARD_VAULT=FLEsGSAvXtiQLXMZwLs3995HPWixDYEAUA4roEsNb7nV
TOKEN_DECIMALS=6
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MIN_MEAL_BALANCE=10000
PROJECT_URL=https://pgublsfhmtjcqcvvgfko.supabase.co
SERVICE_ROLE_KEY=your_service_role_key
```

Keep existing allowlist if needed:

```txt
ALLOWED_TEST_WALLETS=3QXFLgzf3Cn7L2h4q7cg7UmqwrQNHXAFVq9zzyKkdS3n
```

## 3) Deploy Edge Functions

Replace these files in Supabase Edge Functions:

```txt
submit-run
→ backend/phaseA/submit-run-level10-run-economy.ts

craft
→ backend/phaseA/craft-mystery-limit-v1.ts
```

Verify JWT must stay OFF for browser-called functions.

## 4) Upload frontend

Upload everything except the `backend` folder to GitHub Pages.

Do upload:

```txt
index.html
style.css
hub.js
config.json
assets/
games/
shared/
```

Do not upload:

```txt
backend/
```

## 5) Test before announcement

1. Open https://mcmeal.xyz
2. Hard refresh: CTRL + SHIFT + R
3. Connect Phantom
4. Make sure wallet holds at least 10,000 $MEAL
5. Try Extra Reward Run
6. Phantom should show one transaction
7. After confirm, run should open
8. Try Mystery Craft only if the wallet has the ingredients + Mystery Ticket

## Important wording

You can say:

```txt
Extra Reward Runs and Mystery Crafts now use wallet-confirmed $MEAL actions.
```

Do not overclaim until tested live from the final domain.
