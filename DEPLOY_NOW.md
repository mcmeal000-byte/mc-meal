# Deploy Quick Start

## Option A: Vercel / Netlify

Upload this folder as a static site.

Required entry:
```txt
index.html
```

No build command is required.

## Option B: local test

```bash
python -m http.server 8000
```

Open:
```txt
http://localhost:8000
```

## Wallet config

For real read-only $MEAL balance check, copy:

```txt
config.example.json
```

to:

```txt
config.json
```

and add:
- Helius or Solana RPC
- $MEAL token mint
- treasury wallet

Real transactions are intentionally disabled in this alpha.
