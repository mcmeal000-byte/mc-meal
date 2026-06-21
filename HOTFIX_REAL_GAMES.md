# Hotfix – Real Games Fixed

The previous Vercel-ready package accidentally used the simplified connected arcade modules.

This package fixes the Arcade flow:

- Burger Stack opens `games/burger/index.html`
- Fry Rush opens `games/fry/index.html`
- Soda Sprint opens `games/soda/index.html`
- Mystery Order Rush opens `games/order/index.html`

Each real game posts rewards back to the Hub through `MCMEAL_GAME_RESULT`.
