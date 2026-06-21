# MC Meal Launch Plan – Today

## Goal

Launch a playable Phase 1 preview that shows the full product loop:

```txt
Kitchen Street Hub
→ mini-games
→ ingredients
→ craft meals
→ buy/sell shop
→ daily streak
→ backend/wallet coming next
```

## Today: Phase 1 Public Preview

Ship:

- Kitchen Street Hub
- Shared local profile save
- Arcade station with reward simulation
- Craft station
- Shop buy/sell station
- Inventory fridge
- Daily streak station
- Leaderboard/stats station
- Launch Door explaining $MEAL access

Do not ship real buy/sell with live $MEAL until transaction verification is ready.

## Next: Backend Sprint

Build:

1. Supabase schema
2. Wallet profile table
3. Daily claim API
4. Submit run API
5. Craft API
6. Shop API in demo mode
7. Wallet connect read-only
8. Real $MEAL buy transaction
9. Sell/withdraw only after exploit review

## Viral Safety

If traffic spikes:

- Static frontend can handle it on Vercel/Netlify.
- Avoid backend writes on every game tick.
- Only write at run-end, craft, shop action, daily claim.
- Add rate limit before live rewards.
- Cache leaderboard.
- Store every tx signature once.
- Keep sell/withdraw limits.


## v3 All-in-One additions

- Four connected mini-game modules in Arcade.
- Each mini-game saves rewards to shared profile.
- Wallet Connect Read-Only via Phantom prepared in Launch Door.
- $MEAL balance check prepared with config.json and token mint.
- Shop upgraded with tabs:
  - Buy Shop
  - Sell Counter
  - Market Logic
- Backend API examples expanded for wallet connect and shop sell.

## To activate real $MEAL balance check

Create `config.json` next to `index.html`:

```json
{
  "SOLANA_RPC": "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  "MEAL_MINT": "YOUR_MEAL_TOKEN_MINT_ADDRESS",
  "TREASURY_WALLET": "YOUR_TREASURY_PUBLIC_KEY",
  "NETWORK": "mainnet-beta",
  "TOKEN_DECIMALS": 6
}
```
