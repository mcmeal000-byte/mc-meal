# MC Meal — After $MEAL Launch Deploy

Official $MEAL mint:
`EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump`

Official pump.fun link:
`https://pump.fun/coin/EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump`

## 1) Supabase Secrets
Set these in Supabase Edge Function secrets:

```txt
MEAL_MINT=EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MIN_MEAL_BALANCE=10000
PROJECT_URL=https://pgublsfhmtjcqcvvgfko.supabase.co
SERVICE_ROLE_KEY=<your service role key>
ALLOWED_TEST_WALLETS=3QXFLgzf3Cn7L2h4q7cg7UmqwrQNHXAFVq9zzyKkdS3n
```

## 2) Update Edge Functions

- `check-access` → paste `backend/phaseA/check-access-meal-holder.ts` into `index.ts` → Deploy
- `submit-run` → paste `backend/phaseA/submit-run-level10-run-economy.ts` into `index.ts` → Deploy
- `craft` → paste `backend/phaseA/craft-mystery-limit-v1.ts` into `index.ts` → Deploy

Verify JWT must be OFF for browser-called functions.

## 3) GitHub Pages
Upload everything from this ZIP except the `backend` folder.

Required files include:
- `index.html`
- `style.css`
- `hub.js`
- `config.json`
- `assets/`
- `games/`
- `shared/`

Then commit and hard refresh with Ctrl + Shift + R.
