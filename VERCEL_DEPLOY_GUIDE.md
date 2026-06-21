# MC Meal – Vercel Deploy Guide

This folder is ready to deploy as a static Vercel project.

## Fastest path

1. Unzip this folder.
2. Create a new GitHub repository.
3. Upload/push all files from this folder.
4. Go to Vercel and import the GitHub repository.
5. Framework preset: Other / Static
6. Build Command: leave empty
7. Output Directory: leave empty or `.`
8. Deploy.

The project uses plain HTML, CSS and JavaScript. No build step is required.

## Local test before deploy

From inside the folder:

```bash
python -m http.server 8000
```

Open:

```txt
http://localhost:8000
```

## Quick quality check

If Node is installed:

```bash
npm run check
```

This checks the JavaScript syntax for the hub, shared save and all four games.

## Wallet / $MEAL config

The launch alpha works without config.

For read-only $MEAL balance checks later:

1. Copy `config.example.json`
2. Rename the copy to `config.json`
3. Fill in:
   - Solana RPC
   - $MEAL mint address
   - treasury wallet

Do not commit private keys. This static alpha does not use private keys.

## Important launch wording

Use this wording publicly:

```txt
Playable Alpha Preview.
Demo economy.
Wallet read-only.
Real $MEAL transactions coming after backend verification.
```

## Files that matter

```txt
index.html
style.css
hub.js
shared/mcmeal-save.js
games/
assets/
config.example.json
vercel.json
```


## v2 hotfix

Arcade now opens the approved real game builds, not the simplified preview/demo modules.

Real games:
- Burger Stack v6
- Fry Rush v2
- Soda Sprint easier v2
- Mystery Order Rush v3


## v3 hotfix

- Craft House helper functions restored.
- Soda Sprint order tray text fixed.
- App UI remains English-only.
