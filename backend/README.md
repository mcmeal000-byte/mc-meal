# MC Meal Backend API Plan

This folder contains the backend skeleton for the next phase.

## Do not expose service role keys in frontend

All important writes must go through API routes:

- daily claim
- inventory updates
- crafting
- shop buy/sell
- transaction verification

## API routes to build

```txt
POST /api/profile/connect
GET  /api/profile/:wallet
POST /api/daily/claim
POST /api/runs/submit
POST /api/craft
POST /api/shop/buy
POST /api/shop/sell
POST /api/tx/verify
```

## Launch-safe order

1. Frontend demo + shared save
2. Read-only wallet connect
3. Server profile + daily streak
4. Run submit API with rate limit
5. Craft API
6. Real $MEAL buy
7. Sell/withdraw only after anti-exploit review
