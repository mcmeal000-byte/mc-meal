// MC Meal Live v9 - $MEAL live holder access + buy links
(() => {
  const canvas = document.getElementById("hub");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;

  const C = {
    bg: "#17161b",
    wallA: "#2c2830",
    wallB: "#342d35",
    gold: "#ffce4a",
    goldDark: "#8b4a22",
    cream: "#fff3d0",
    muted: "#b9a88a",
    green: "#52f0cf",
    red: "#e95d45",
    blue: "#36b6ff",
    purple: "#9d4dff",
    panel: "#12141a",
    dark: "#0b0d11",
    asphalt: "#6a6763",
    asphalt2: "#7a7671",
    curb: "#f0a63a",
    skin: "#f0ad72",
    brown: "#6a3520",
    white: "#fff8df",
    roofRed: "#91514a",
    roofBlue: "#55779e",
    roofGreen: "#4c8d7e"
  };

  const keys = Object.create(null);
  const mobileStick = { active: false, pointerId: null, dx: 0, dy: 0, max: 38 };
  let lastTime = 0;
  let hoveredStation = null;
  let modalOpen = false;

  const player = {
    x: W / 2 - 16,
    y: 405,
    w: 32,
    h: 42,
    speed: 190,
    dir: "down",
    step: 0
  };

  const stations = [
    {
      id: "arcade",
      name: "ARCADE",
      subtitle: "Real mini-games",
      x: 74,
      y: 138,
      w: 214,
      h: 162,
      color: C.blue,
      icon: "arcade",
      house: "arcade",
      roof: C.roofBlue
    },
    {
      id: "craft",
      name: "CRAFT HOUSE",
      subtitle: "Recipes + meals",
      x: 374,
      y: 120,
      w: 214,
      h: 180,
      color: C.gold,
      icon: "craft",
      house: "craft",
      roof: C.roofRed
    },
    {
      id: "shop",
      name: "SHOP",
      subtitle: "Buy + sell",
      x: 672,
      y: 138,
      w: 214,
      h: 162,
      color: C.green,
      icon: "shop",
      house: "shop",
      roof: C.roofGreen
    },
    {
      id: "fridge",
      name: "FRIDGE",
      subtitle: "Inventory + vault",
      x: 48,
      y: 430,
      w: 185,
      h: 138,
      color: C.purple,
      icon: "fridge",
      house: "fridge",
      roof: "#5d2c84"
    },
    {
      id: "leaderboard",
      name: "SCORE",
      subtitle: "Ranks + burns",
      x: 270,
      y: 430,
      w: 185,
      h: 138,
      color: C.red,
      icon: "board",
      house: "board",
      roof: "#88422a"
    },
    {
      id: "daily",
      name: "DAILY",
      subtitle: "Streak rewards",
      x: 492,
      y: 430,
      w: 185,
      h: 138,
      color: C.green,
      icon: "daily",
      house: "daily",
      roof: "#4c8d7e"
    },
    {
      id: "launch",
      name: "LAUNCH",
      subtitle: "Wallet + Access",
      x: 714,
      y: 430,
      w: 185,
      h: 138,
      color: C.gold,
      icon: "door",
      house: "door",
      roof: "#766018"
    }
  ];

  let state = window.MCMealSave ? window.MCMealSave.load() : loadState();

  const BACKEND = {
    baseUrl: "https://pgublsfhmtjcqcvvgfko.supabase.co/functions/v1",
    endpoints: {
      checkAccess: "/check-access",
      profileConnect: "/profile-connect",
      dailyClaim: "/daily-claim",
      submitRun: "/submit-run",
      craft: "/craft",
      shopBuy: "/shop-buy-demo",
      shopSell: "/shop-sell-demo"
    }
  };

  const EXTRA_REWARDED_RUN_COST = 250;
  const OFFICIAL_MEAL_MINT = "EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump";
  const OFFICIAL_BUY_MEAL_URL = "https://pump.fun/coin/EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump";
  const REWARD_VAULT_WALLET = "FLEsGSAvXtiQLXMZwLs3995HPWixDYEAUA4roEsNb7nV";
  const TREASURY_WALLET = "DwPT7VNgG9uZEEK8xD4CMTQJv2BFpxhQPCQaGXooQ2jR";
  const MIN_MEAL_BALANCE = 10000;
  const TOKEN_DECIMALS = 6;
  const EXTRA_RUN_BURN_MEAL = 200;
  const EXTRA_RUN_POOL_MEAL = 50;
  const MYSTERY_CRAFT_COST_MEAL = 500;
  const MYSTERY_CRAFT_BURN_MEAL = 450;
  const MYSTERY_CRAFT_POOL_MEAL = 50;
  const SOLANA_RPC_URL = "https://solana-rpc.publicnode.com";
  let activeGameRun = null;

  const SHOP_ITEM_IDS = {
    Bun: "bun-pack",
    Patty: "patty-pack",
    Fries: "fries-pack",
    Soda: "soda-pack",
    Sauce: "sauce-pack",
    "Mystery Ticket": "mystery-ticket",
    "Recipe Fragment": "recipe-fragment",
    "Secret Receipt": "secret-receipt",
    "Craft Entry": "craft-entry"
  };

  function shortWallet(address) {
    return address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "Not connected";
  }

  async function backendCall(endpoint, payload) {
    const res = await fetch(`${BACKEND.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    let data = null;
    try { data = await res.json(); } catch { data = { ok: false, error: await res.text() }; }
    if (!res.ok || !data.ok) {
      const error = data?.error || `backend_${res.status}`;
      const e = new Error(error);
      e.status = res.status;
      e.data = data;
      throw e;
    }
    return data;
  }


  function requireSolanaWeb3() {
    if (!window.solanaWeb3) throw new Error("solana_web3_not_loaded");
    return window.solanaWeb3;
  }

  function getPhantomProvider() {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) throw new Error("phantom_not_found");
    return provider;
  }

  function amountToRaw(amountMeal) {
    return BigInt(Math.round(Number(amountMeal) * Math.pow(10, TOKEN_DECIMALS)));
  }

  function u64LeBytes(value) {
    let n = BigInt(value);
    const out = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      out[i] = Number(n & 255n);
      n >>= 8n;
    }
    return out;
  }

  function buildCheckedTokenData(instructionIndex, amountMeal) {
    const amount = amountToRaw(amountMeal);
    const out = new Uint8Array(10);
    out[0] = instructionIndex;
    out.set(u64LeBytes(amount), 1);
    out[9] = TOKEN_DECIMALS;
    return out;
  }

  async function getAssociatedTokenAddress(owner, mint) {
    const web3 = requireSolanaWeb3();
    const TOKEN_PROGRAM_ID = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    const [ata] = await web3.PublicKey.findProgramAddress(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return ata;
  }

  function createAssociatedTokenAccountInstruction(payer, ata, owner, mint) {
    const web3 = requireSolanaWeb3();
    const TOKEN_PROGRAM_ID = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    const SYSVAR_RENT_PUBKEY = new web3.PublicKey("SysvarRent111111111111111111111111111111111");
    return new web3.TransactionInstruction({
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: ata, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      data: new Uint8Array([])
    });
  }

  function createBurnCheckedInstruction(sourceTokenAccount, mint, owner, amountMeal) {
    const web3 = requireSolanaWeb3();
    const TOKEN_PROGRAM_ID = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    return new web3.TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      keys: [
        { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false }
      ],
      data: buildCheckedTokenData(15, amountMeal)
    });
  }

  function createTransferCheckedInstruction(sourceTokenAccount, mint, destinationTokenAccount, owner, amountMeal) {
    const web3 = requireSolanaWeb3();
    const TOKEN_PROGRAM_ID = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    return new web3.TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      keys: [
        { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: destinationTokenAccount, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false }
      ],
      data: buildCheckedTokenData(12, amountMeal)
    });
  }

  async function findUserMealTokenAccount(connection, owner, mint) {
    const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint });
    if (!accounts.value.length) throw new Error("meal_token_account_not_found");
    let best = null;
    let bestAmount = 0;
    for (const row of accounts.value) {
      const uiAmount = Number(row.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0);
      if (!best || uiAmount > bestAmount) {
        best = row.pubkey;
        bestAmount = uiAmount;
      }
    }
    return best;
  }

  async function payMealOnchain(actionType) {
    const web3 = requireSolanaWeb3();
    const provider = getPhantomProvider();
    if (!state.wallet) throw new Error("wallet_not_connected");
    if (!provider.publicKey || provider.publicKey.toBase58() !== state.wallet) {
      await provider.connect({ onlyIfTrusted: false });
    }

    const payer = new web3.PublicKey(state.wallet);
    const mint = new web3.PublicKey(OFFICIAL_MEAL_MINT);
    const rewardOwner = new web3.PublicKey(REWARD_VAULT_WALLET);
    const connection = new web3.Connection(SOLANA_RPC_URL, "confirmed");

    const plan = actionType === "mystery_craft"
      ? { burnMeal: MYSTERY_CRAFT_BURN_MEAL, rewardMeal: MYSTERY_CRAFT_POOL_MEAL, totalMeal: MYSTERY_CRAFT_COST_MEAL, label: "Mystery Craft" }
      : { burnMeal: EXTRA_RUN_BURN_MEAL, rewardMeal: EXTRA_RUN_POOL_MEAL, totalMeal: EXTRA_REWARDED_RUN_COST, label: "Extra Reward Run" };

    addLog(`${plan.label}: opening Phantom for ${plan.burnMeal} $MEAL burn + ${plan.rewardMeal} $MEAL Reward Vault.`);

    const sourceTokenAccount = await findUserMealTokenAccount(connection, payer, mint);
    const rewardAta = await getAssociatedTokenAddress(rewardOwner, mint);
    const tx = new web3.Transaction();

    const rewardAtaInfo = await connection.getAccountInfo(rewardAta, "confirmed");
    if (!rewardAtaInfo) {
      tx.add(createAssociatedTokenAccountInstruction(payer, rewardAta, rewardOwner, mint));
    }

    tx.add(createBurnCheckedInstruction(sourceTokenAccount, mint, payer, plan.burnMeal));
    tx.add(createTransferCheckedInstruction(sourceTokenAccount, mint, rewardAta, payer, plan.rewardMeal));

    const latest = await connection.getLatestBlockhash("confirmed");
    tx.feePayer = payer;
    tx.recentBlockhash = latest.blockhash;

    const response = await provider.signAndSendTransaction(tx);
    const signature = typeof response === "string" ? response : response.signature;
    if (!signature) throw new Error("missing_transaction_signature");

    await connection.confirmTransaction({
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight
    }, "confirmed");

    addLog(`${plan.label}: onchain transaction confirmed.`);
    return signature;
  }

  function syncBackendState(data) {
    if (!data) return;
    const profile = data.profile || null;
    if (profile) {
      state.wallet = profile.wallet_address || state.wallet || null;
      state.accessTier = profile.access_tier || state.accessTier || "Visitor";
      state.xp = Number(profile.xp || 0);
      state.meal = Number(profile.meal_balance || 0);
      state.burned = Number(profile.meal_burned || 0);
      state.rewardPool = Number(profile.reward_pool || 0);
      state.bestScore = Number(profile.best_score || 0);
      state.miniRuns = Number(profile.mini_runs || 0);
      state.mealsCrafted = Number(profile.meals_crafted || 0);
      state.marketVolume = Number(profile.market_volume || 0);
    }

    if (Array.isArray(data.inventory)) {
      const nextInventory = { ...(state.inventory || {}) };
      for (const key of Object.keys(nextInventory)) nextInventory[key] = 0;
      for (const row of data.inventory) nextInventory[row.item_name] = Number(row.qty || 0);
      state.inventory = nextInventory;
    }

    const streak = data.dailyStreak || data.streak || null;
    if (streak) {
      state.streak = {
        current: Number(streak.current_streak || 0),
        lastClaimDate: streak.last_claim_date || null,
        totalClaims: Number(streak.total_claims || 0)
      };
    }

    if (data.allowed === true || data.mode === "prelaunch_private_test") state.prelaunchAccess = true;
    state.backendSynced = true;
    state.lastSync = new Date().toISOString();
    saveState();
  }

  function hasPrivateAccess() {
    return Boolean(state.wallet && state.prelaunchAccess === true);
  }

  function publicAccessTierLabel(rawTier) {
    const tier = String(rawTier || "");
    if (!tier || tier === "Visitor" || tier.toLowerCase().includes("private") || tier.toLowerCase().includes("test")) {
      return hasPrivateAccess() ? "Kitchen Access" : "Wallet Required";
    }
    return tier;
  }

  function requireWallet(actionLabel = "this action") {
    if (hasPrivateAccess()) return true;
    addLog(`Kitchen access required to use ${actionLabel}. Connect your Phantom wallet first.`);
    return false;
  }

  function lockedAccessHtml() {
    return `
      <div class="modal-panel">
        <div class="season-badge">KITCHEN ACCESS LOCKED</div>
        <h3>Connect wallet to enter the Kitchen</h3>
        <p>The Kitchen uses $MEAL holder access. Connect Phantom to sync your profile, runs, rewards and crafting. Minimum holder access: 10,000 $MEAL.</p>
        <div class="roadmap">
          <div><strong>Access:</strong> 10,000 $MEAL required</div>
          <div class="official-link-box"><strong>Official $MEAL:</strong><br />EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump<br /><br /><a href="https://pump.fun/coin/EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump" target="_blank" rel="noopener noreferrer">BUY $MEAL</a></div>
          <div><strong>Token:</strong> $MEAL economy</div>
          <div><strong>Holder gate:</strong> minimum $MEAL balance</div>
        </div>
        <br />
        <button class="action-btn" id="lockedConnectBtn">CONNECT WALLET</button>
        <div id="lockedAccessResult" style="margin-top:12px;"></div>
      </div>
    `;
  }

  function normalizeDrops(dropList) {
    const counts = Object.create(null);
    for (const d of dropList || []) {
      const item = typeof d === "string" ? d : d?.item;
      const qty = typeof d === "string" ? 1 : Number(d?.qty || 1);
      if (!item) continue;
      counts[item] = (counts[item] || 0) + Math.max(1, Math.min(qty, 25));
    }
    return Object.entries(counts).map(([item, qty]) => ({ item, qty }));
  }

  function loadState() {
    const raw = localStorage.getItem("mcmeal_hub_launch_v2_street");
    const defaults = {
      xp: 420,
      meal: 10000,
      burned: 0,
      rewardPool: 0,
      bestScore: 0,
      mealsCrafted: 0,
      miniRuns: 0,
      inventory: {
        Bun: 6,
        Patty: 5,
        Cheese: 4,
        Lettuce: 4,
        Fries: 5,
        Soda: 5,
        Sauce: 4,
        "Mystery Ticket": 2,
        "Recipe Fragment": 1,
        "Common Meal": 1,
        "Rare Meal": 0,
        "Supreme Meal": 0,
        "Legendary Meal": 0,
        "Golden Meal": 0
      },
      rewardedRuns: {
        day: null,
        freeUsed: {}
      },
      log: ["Welcome to MC Meal Kitchen Street."]
    };

    if (!raw) return defaults;
    try {
      const parsed = JSON.parse(raw);
      parsed.inventory = { ...defaults.inventory, ...(parsed.inventory || {}) };
      parsed.rewardedRuns = {
        day: parsed.rewardedRuns?.day || defaults.rewardedRuns.day,
        freeUsed: { ...(parsed.rewardedRuns?.freeUsed || {}) }
      };
      parsed.log = parsed.log || defaults.log;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  }

  function saveState() {
    if (window.MCMealSave) state = window.MCMealSave.save(state);
    else localStorage.setItem("mcmeal_hub_launch_v2_street", JSON.stringify(state));
  }

  function addLog(text) {
    if (window.MCMealSave) window.MCMealSave.addLog(state, text);
    else {
      state.log.push(text);
      if (state.log.length > 8) state.log = state.log.slice(-8);
    }
    saveState();
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureRewardedRunState() {
    state.rewardedRuns = state.rewardedRuns || { day: null, freeUsed: {} };
    if (state.rewardedRuns.day !== todayKey()) {
      state.rewardedRuns.day = todayKey();
      state.rewardedRuns.freeUsed = {};
      saveState();
    }
    return state.rewardedRuns;
  }

  function gameRunKey(name) {
    return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function isFreeRunUsed(gameName) {
    const rr = ensureRewardedRunState();
    return rr.freeUsed[gameRunKey(gameName)] === true;
  }

  function markFreeRunUsed(gameName) {
    const rr = ensureRewardedRunState();
    rr.freeUsed[gameRunKey(gameName)] = true;
    saveState();
  }

  function update(dt) {
    if (modalOpen) return;

    let dx = mobileStick.dx || 0;
    let dy = mobileStick.dy || 0;
    if (keys.ArrowLeft || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;
    if (keys.ArrowUp || keys.w) dy -= 1;
    if (keys.ArrowDown || keys.s) dy += 1;

    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      player.x += dx * player.speed * dt;
      player.y += dy * player.speed * dt;
      player.step += dt * 10;
      if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? "right" : "left";
      else player.dir = dy > 0 ? "down" : "up";
    }

    player.x = Math.max(38, Math.min(W - player.w - 38, player.x));
    player.y = Math.max(84, Math.min(H - player.h - 44, player.y));

    resolveStationCollision();
    hoveredStation = getNearbyStation();

    if ((keys.Enter || keys[" "]) && hoveredStation && !keys._enterLock) {
      keys._enterLock = true;
      openStation(hoveredStation.id);
    }
    if (!keys.Enter && !keys[" "]) keys._enterLock = false;
  }

  function resolveStationCollision() {
    const p = playerRect();
    for (const s of stations) {
      const r = { x: s.x - 8, y: s.y - 8, w: s.w + 16, h: s.h + 16 };
      if (!overlap(p, r)) continue;

      const left = p.x + p.w - r.x;
      const right = r.x + r.w - p.x;
      const top = p.y + p.h - r.y;
      const bottom = r.y + r.h - p.y;
      const min = Math.min(left, right, top, bottom);

      if (min === left) player.x -= left;
      else if (min === right) player.x += right;
      else if (min === top) player.y -= top;
      else player.y += bottom;
    }
  }

  function playerRect() {
    return { x: player.x + 5, y: player.y + 24, w: player.w - 10, h: 18 };
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function getNearbyStation() {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    for (const s of stations) {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist < 150) return s;
    }
    return null;
  }

  function draw() {
    drawBackground();
    drawHeader();
    drawStreet();
    drawStreetDecor();
    drawStations();
    drawPlayer();
    drawInteractionHint();
    drawMiniHud();
  }

  function drawBackground() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // dark city tiles behind the street
    for (let y = 74; y < H - 34; y += 40) {
      for (let x = 0; x < W; x += 50) {
        ctx.fillStyle = (x + y) % 100 === 0 ? C.wallA : C.wallB;
        ctx.fillRect(x, y, 46, 36);
        ctx.fillStyle = "rgba(255,255,255,.05)";
        ctx.fillRect(x + 5, y + 5, 3, 3);
      }
    }

    ctx.fillStyle = C.dark;
    ctx.fillRect(0, 0, W, 74);
    ctx.fillRect(0, H - 35, W, 35);
  }

  function drawHeader() {
    drawPixelText("MC MEAL", 26, 32, 27, C.gold, "#74311f");

    ctx.fillStyle = C.cream;
    ctx.font = "15px Courier New";
    ctx.fillText("Live Kitchen · ENTER opens a building.", 575, 31);

    ctx.fillStyle = state.backendSynced ? C.green : C.gold;
    ctx.font = "13px Courier New";
    ctx.fillText(state.backendSynced ? "Backend synced · Wallet-linked economy" : "Connect wallet to sync profile", 575, 54);
  }

  function drawStreet() {
    // main horizontal road
    ctx.fillStyle = C.asphalt;
    ctx.fillRect(46, 322, W - 92, 88);
    ctx.fillStyle = C.asphalt2;
    ctx.fillRect(46, 322, W - 92, 4);
    ctx.fillRect(46, 406, W - 92, 4);

    // vertical street
    ctx.fillStyle = C.asphalt;
    ctx.fillRect(448, 284, 80, 180);
    ctx.fillStyle = C.asphalt2;
    ctx.fillRect(448, 284, 4, 180);
    ctx.fillRect(524, 284, 4, 180);

    // sidewalks / curbs
    ctx.fillStyle = "#b89d84";
    ctx.fillRect(46, 302, W - 92, 20);
    ctx.fillRect(46, 410, W - 92, 20);
    ctx.fillRect(428, 284, 20, 180);
    ctx.fillRect(528, 284, 20, 180);
    ctx.fillStyle = "#d1b497";
    ctx.fillRect(46, 318, W - 92, 4);
    ctx.fillRect(46, 410, W - 92, 4);

    // road lane marks
    ctx.fillStyle = "#ead7b0";
    for (let x = 72; x < W - 80; x += 62) ctx.fillRect(x, 363, 28, 5);
    for (let y = 300; y < 462; y += 48) ctx.fillRect(485, y, 5, 27);

  }


  function drawStreetDecor() {
    // small planters / bins
    drawPlanter(318, 283);
    drawPlanter(610, 283);
    drawPlanter(320, 435);
    drawPlanter(610, 435);

    // tiny parked delivery scooter
    ctx.fillStyle = C.red;
    ctx.fillRect(750, 333, 34, 12);
    ctx.fillStyle = C.dark;
    ctx.fillRect(754, 344, 8, 8);
    ctx.fillRect(778, 344, 8, 8);
    ctx.fillStyle = C.gold;
    ctx.fillRect(782, 322, 12, 12);
  }


  function drawPlanter(x, y) {
    ctx.fillStyle = "#8b5f46";
    ctx.fillRect(x, y + 14, 38, 18);
    ctx.fillStyle = C.green;
    ctx.fillRect(x + 6, y + 8, 7, 8);
    ctx.fillRect(x + 17, y + 4, 7, 12);
    ctx.fillRect(x + 28, y + 9, 7, 7);
  }

  function drawStations() {
    for (const s of stations) drawBuilding(s);
  }

  function drawBuilding(s) {
    const active = hoveredStation && hoveredStation.id === s.id;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(s.x + 10, s.y + 12, s.w, s.h + 8);

    // roof
    ctx.fillStyle = s.roof;
    ctx.fillRect(s.x - 10, s.y - 18, s.w + 20, 28);
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.fillRect(s.x - 4, s.y - 13, s.w + 8, 5);
    ctx.fillStyle = C.dark;
    ctx.fillRect(s.x - 14, s.y + 8, s.w + 28, 8);

    // body
    ctx.fillStyle = C.panel;
    ctx.fillRect(s.x, s.y, s.w, s.h);

    ctx.strokeStyle = active ? C.green : s.color;
    ctx.lineWidth = active ? 5 : 4;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = C.goldDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 8, s.y + 8, s.w - 16, s.h - 16);

    // shop windows / sign
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x + 18, s.y + 24, 50, 50);
    ctx.fillStyle = "#101820";
    ctx.fillRect(s.x + 26, s.y + 32, 34, 34);
    drawStationIcon(s.icon, s.x + 31, s.y + 36, s.color);

    // door
    ctx.fillStyle = "#2a1818";
    ctx.fillRect(s.x + s.w - 48, s.y + s.h - 62, 28, 54);
    ctx.fillStyle = active ? C.green : C.gold;
    ctx.fillRect(s.x + s.w - 31, s.y + s.h - 34, 4, 4);

    // sign text, kept inside every building
    const textX = s.x + 82;
    const maxTextW = Math.max(70, s.w - 104);
    ctx.fillStyle = C.gold;
    ctx.font = s.w < 195 ? "13px Courier New" : "17px Courier New";
    wrapText(s.name, textX, s.y + 42, maxTextW, 15);

    ctx.fillStyle = C.cream;
    ctx.font = s.w < 195 ? "11px Courier New" : "12px Courier New";
    wrapText(s.subtitle, textX, s.y + 70, maxTextW, 14);

    // small awning
    ctx.fillStyle = s.color;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(s.x + 18 + i * 22, s.y + s.h - 10, 16, 10);
    }

    if (active) {
      ctx.fillStyle = C.green;
      ctx.font = "13px Courier New";
      ctx.fillText("ENTER", s.x + s.w - 74, s.y + s.h - 18);
    }
  }

  function drawStationIcon(type, x, y, color) {
    ctx.fillStyle = color;

    if (type === "arcade") {
      ctx.fillRect(x, y + 8, 30, 34);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 6, y + 14, 18, 12);
      ctx.fillStyle = C.green;
      ctx.fillRect(x + 9, y + 17, 12, 6);
      ctx.fillStyle = C.red;
      ctx.fillRect(x + 7, y + 32, 6, 6);
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + 18, y + 32, 6, 6);
    } else if (type === "craft") {
      ctx.fillRect(x + 2, y + 24, 34, 16);
      ctx.fillStyle = C.red;
      ctx.fillRect(x + 9, y + 12, 20, 14);
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + 12, y + 15, 14, 8);
    } else if (type === "shop") {
      ctx.fillRect(x + 2, y + 18, 34, 22);
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + 6, y + 11, 26, 8);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 10, y + 25, 18, 10);
    } else if (type === "fridge") {
      ctx.fillRect(x + 6, y + 4, 26, 40);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 10, y + 10, 18, 12);
      ctx.fillStyle = C.white;
      ctx.fillRect(x + 26, y + 25, 3, 8);
    } else if (type === "board") {
      ctx.fillRect(x, y + 8, 38, 28);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 5, y + 13, 28, 18);
      ctx.fillStyle = C.green;
      ctx.fillRect(x + 9, y + 17, 20, 3);
      ctx.fillRect(x + 9, y + 24, 14, 3);
    } else if (type === "daily") {
      ctx.fillRect(x + 4, y + 8, 32, 30);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 9, y + 14, 22, 18);
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + 13, y + 18, 14, 4);
      ctx.fillRect(x + 13, y + 25, 10, 4);
    } else if (type === "door") {
      ctx.fillRect(x + 7, y + 2, 26, 42);
      ctx.fillStyle = C.dark;
      ctx.fillRect(x + 12, y + 8, 16, 28);
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + 24, y + 22, 4, 4);
    }
  }

  function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const walk = Math.floor(player.step) % 2;

    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(x + 3, y + 37, 30, 6);

    ctx.fillStyle = C.white;
    ctx.fillRect(x + 7, y, 20, 8);
    ctx.fillRect(x + 3, y + 6, 28, 8);
    ctx.fillStyle = "#e7dfca";
    ctx.fillRect(x + 5, y + 12, 24, 4);

    ctx.fillStyle = C.skin;
    ctx.fillRect(x + 8, y + 16, 18, 14);

    ctx.fillStyle = C.dark;
    if (player.dir === "left") {
      ctx.fillRect(x + 10, y + 21, 3, 3);
      ctx.fillRect(x + 17, y + 21, 3, 3);
    } else if (player.dir === "right") {
      ctx.fillRect(x + 15, y + 21, 3, 3);
      ctx.fillRect(x + 22, y + 21, 3, 3);
    } else {
      ctx.fillRect(x + 12, y + 21, 3, 3);
      ctx.fillRect(x + 21, y + 21, 3, 3);
    }

    ctx.fillStyle = C.blue;
    ctx.fillRect(x + 7, y + 30, 20, 14);
    ctx.fillStyle = C.white;
    ctx.fillRect(x + 15, y + 30, 4, 14);

    ctx.fillStyle = C.dark;
    ctx.fillRect(x + 7, y + 44, 8, 4 + walk);
    ctx.fillRect(x + 20, y + 44, 8, 5 - walk);
  }

  function drawInteractionHint() {
    if (!hoveredStation) return;

    const boxW = 455;
    const boxH = 58;
    const x = W / 2 - boxW / 2;
    const y = H - 113;

    ctx.fillStyle = C.panel;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxW, boxH);

    ctx.fillStyle = C.green;
    ctx.font = "17px Courier New";
    ctx.fillText(`ENTER: ${hoveredStation.name}`, x + 22, y + 25);

    ctx.fillStyle = C.cream;
    ctx.font = "13px Courier New";
    ctx.fillText(hoveredStation.subtitle, x + 22, y + 45);
  }

  function drawMiniHud() {
    const y = H - 27;
    ctx.fillStyle = C.cream;
    ctx.font = "13px Courier New";
    ctx.fillText(`XP ${state.xp}`, 22, y);
    ctx.fillText(`$MEAL ${state.meal}`, 112, y);
    ctx.fillText(`Burned ${state.burned}`, 238, y);
    ctx.fillText(`Runs ${state.miniRuns}`, 380, y);
    ctx.fillText(`Meals ${state.mealsCrafted}`, 475, y);
    ctx.fillText(`${state.wallet ? shortWallet(state.wallet) : "Wallet: Connect"}`, 600, y);
    ctx.fillStyle = state.backendSynced ? C.green : C.gold;
    ctx.fillText(state.backendSynced ? "LIVE SYNC" : "LOCAL VIEW", 810, y);
  }

  function drawPixelText(text, x, y, size, color, shadow) {
    ctx.font = `${size}px Courier New`;
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + 3, y + 3);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - lastTime) / 1000 || 0);
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function setupMobileJoystick() {
    const area = document.getElementById("mobileStickArea");
    const knob = document.getElementById("mobileStickKnob");
    if (!area || !knob) return;

    function resetStick() {
      mobileStick.active = false;
      mobileStick.pointerId = null;
      mobileStick.dx = 0;
      mobileStick.dy = 0;
      knob.style.transform = "translate(0px, 0px)";
    }

    function updateStick(e) {
      const rect = area.querySelector(".mobile-stick-base").getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let px = e.clientX - centerX;
      let py = e.clientY - centerY;
      const dist = Math.hypot(px, py);
      const max = Math.min(mobileStick.max, rect.width * 0.32);

      if (dist > max) {
        px = (px / dist) * max;
        py = (py / dist) * max;
      }

      mobileStick.dx = px / max;
      mobileStick.dy = py / max;
      knob.style.transform = `translate(${px}px, ${py}px)`;
    }

    area.addEventListener("pointerdown", e => {
      e.preventDefault();
      mobileStick.active = true;
      mobileStick.pointerId = e.pointerId;
      area.setPointerCapture(e.pointerId);
      updateStick(e);
    });

    area.addEventListener("pointermove", e => {
      if (!mobileStick.active || e.pointerId !== mobileStick.pointerId) return;
      e.preventDefault();
      updateStick(e);
    });

    area.addEventListener("pointerup", e => {
      if (e.pointerId === mobileStick.pointerId) resetStick();
    });

    area.addEventListener("pointercancel", resetStick);
    area.addEventListener("lostpointercapture", resetStick);
  }

  function openStation(id) {
    modalOpen = true;
    const station = stations.find(s => s.id === id);
    setModalHeader(station.name, station.subtitle);

    if (id !== "launch" && !hasPrivateAccess()) {
      setModalHeader("ACCESS LOCKED", "Wallet access required");
      setContent(lockedAccessHtml());
      document.getElementById("modal").classList.remove("hidden");
      const lockedBtn = document.getElementById("lockedConnectBtn");
      if (lockedBtn) lockedBtn.addEventListener("click", () => connectWalletAndSync(document.getElementById("lockedAccessResult"), false));
      return;
    }

    if (id === "arcade") renderArcadeModal();
    else if (id === "craft") renderCraftModal();
    else if (id === "shop") renderShopModal();
    else if (id === "fridge") renderInventoryModal();
    else if (id === "leaderboard") renderLeaderboardModal();
    else if (id === "daily") renderDailyModal();
    else if (id === "launch") renderLaunchModal();

    document.getElementById("modal").classList.remove("hidden");
  }

  function setModalHeader(title, subtitle) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalSubtitle").textContent = subtitle;
  }

  function closeModal() {
    modalOpen = false;
    document.getElementById("modal").classList.add("hidden");
  }

  function renderArcadeModal(extraMessage = "") {
    const games = [
      {
        icon: "🍔",
        name: "Burger Stack",
        subtitle: "10-level burger building run",
        src: "games/burger/index.html"
      },
      {
        icon: "🍟",
        name: "Fry Rush",
        subtitle: "10-level crispy arcade shift",
        src: "games/fry/index.html"
      },
      {
        icon: "🥤",
        name: "Soda Sprint",
        subtitle: "10-level fizzy pour challenge",
        src: "games/soda/index.html"
      },
      {
        icon: "🧾",
        name: "Mystery Order Rush",
        subtitle: "10-level ticket chaos run",
        src: "games/order/index.html"
      }
    ];

    const noticeHtml = extraMessage ? `
      <div class="modal-panel" style="border-color:#52f0cf;">
        <div class="season-badge">KITCHEN NOTICE</div>
        <p>${extraMessage}</p>
      </div>
    ` : "";

    setContent(`
      <div class="modal-panel">
        <div class="season-badge">RUN ECONOMY</div>
        <h3>Daily Rewarded Runs</h3>
        <p>Each verified holder gets <strong>1 free rewarded run per mini-game per day</strong>. After the daily free run is used, every extra rewarded run costs <strong>${EXTRA_REWARDED_RUN_COST} $MEAL</strong>. Extra rewarded runs use a real onchain action: <strong>200 $MEAL burn + 50 $MEAL Reward Vault</strong>. Capped at <strong>20 per wallet/day</strong>.</p>
      </div>

      ${noticeHtml}

      <div class="modal-grid">
        ${games.map(g => {
          const freeUsed = isFreeRunUsed(g.name);
          return `
            <div class="modal-panel">
              <div class="season-badge">LEVEL 10 MINI-GAME</div>
              <h3>${g.icon} ${g.name}</h3>
              <p>${g.subtitle}. Rewards are only submitted after a rewarded run.</p>
              <div style="display:grid; gap:8px; margin-top:12px;">
                <button class="action-btn ${freeUsed ? 'disabled-like' : ''}" ${freeUsed ? 'disabled' : ''} data-real-game="${g.src}" data-game-name="${g.name}" data-run-mode="free">${freeUsed ? 'DAILY FREE RUN USED TODAY' : 'DAILY FREE REWARD RUN'}</button>
                <button class="small-btn gold" data-real-game="${g.src}" data-game-name="${g.name}" data-run-mode="paid">EXTRA REWARD RUN — ${EXTRA_REWARDED_RUN_COST} $MEAL</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `);

    document.querySelectorAll("[data-real-game]").forEach(btn => {
      btn.addEventListener("click", () => openRealGame(btn.dataset.realGame, btn.dataset.gameName, btn.dataset.runMode));
    });
  }

  function runModeLabel(mode) {
    if (mode === "paid") return `Extra Reward Run · ${EXTRA_REWARDED_RUN_COST} $MEAL`;
    return "Daily Free Reward Run";
  }

  async function openRealGame(src, gameName, runMode = "free") {
    if (!requireWallet("mini-games")) return;

    if (runMode === "free" && isFreeRunUsed(gameName)) {
      addLog(`${gameName}: daily free rewarded run already used today.`);
      renderArcadeModal(`The free rewarded run for <strong>${gameName}</strong> was already used today. Start the <strong>Extra Reward Run</strong> for ${EXTRA_REWARDED_RUN_COST} $MEAL to keep earning rewards.`);
      return;
    }

    let paymentSignature = null;
    if (runMode === "paid") {
      const preflightId = `preflight-${gameName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      try {
        await backendCall(BACKEND.endpoints.submitRun, {
          walletAddress: state.wallet,
          gameKey: gameName,
          clientRunId: preflightId,
          runMode: "paid",
          preflight: true
        });
        paymentSignature = await payMealOnchain("extra_run");
      } catch (err) {
        const msg = err?.message || "payment_failed";
        addLog(`Extra Reward Run not started: ${msg}.`);
        renderArcadeModal(`<strong>Extra Reward Run failed:</strong> ${msg}. No game started.`);
        return;
      }
    }

    activeGameRun = {
      gameName,
      runMode,
      startedAt: Date.now(),
      paymentSignature
    };

    setModalHeader(gameName, runModeLabel(runMode));

    const noteText = runMode === "paid"
      ? `Extra rewarded run active. Onchain payment confirmed: ${EXTRA_RUN_BURN_MEAL} $MEAL burned + ${EXTRA_RUN_POOL_MEAL} $MEAL sent to Reward Vault.`
      : "Daily free rewarded run active. This game can reward only once for free today.";

    setContent(`
      <div class="real-game-wrap">
        <div class="game-launch-note" id="realGameRewardNote">
          <strong>${gameName}</strong> · ${noteText}
        </div>

        <iframe class="real-game-frame" src="${src}?v=live-v10-onchain-burn" title="${gameName}" scrolling="no"></iframe>
        <div class="mobile-note"></div>

        <div class="game-actions">
          <button class="small-btn gold" id="backToArcadeReal">BACK TO ARCADE</button>
          <button class="small-btn" id="openGameNewTab">OPEN FULL SCREEN</button>
          <button class="small-btn red" id="closeArcadeGame">CLOSE</button>
        </div>
      </div>
    `);

    document.getElementById("backToArcadeReal").addEventListener("click", () => renderArcadeModal());
    document.getElementById("openGameNewTab").addEventListener("click", () => window.open(`${src}?v=live-v10-onchain-burn`, "_blank"));
    document.getElementById("closeArcadeGame").addEventListener("click", closeModal);
  }

  async function applyRealGameReward(payload) {
    if (!payload || payload.type !== "MCMEAL_GAME_RESULT") return;

    const note = document.getElementById("realGameRewardNote");
    const runInfo = activeGameRun || { runMode: "free", gameName: payload.game || "Mini Game" };

    if (!requireWallet("game rewards")) {
      if (note) note.innerHTML = `<strong>Wallet required:</strong> Connect Phantom in the Launch building, then play again to save rewards on the backend.`;
      renderArcadeModal();
      return;
    }

    const rewards = payload.rewards || {};
    const rawDrops = Array.isArray(rewards.drops) ? rewards.drops.slice() : [];

    if (rewards.gotTicket) rawDrops.push("Mystery Ticket");
    if (rewards.gotFragment) rawDrops.push("Recipe Fragment");

    const dropObjects = normalizeDrops(rawDrops);
    const score = Number(payload.score || 0);
    const gameKey = payload.game || "Mini Game";
    const clientRunId = `${gameKey.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const result = await backendCall(BACKEND.endpoints.submitRun, {
        walletAddress: state.wallet,
        gameKey,
        score,
        durationMs: Number(payload.durationMs || 0),
        clientRunId,
        runMode: runInfo.runMode === "paid" ? "paid" : "free",
        entryCostMeal: runInfo.runMode === "paid" ? EXTRA_REWARDED_RUN_COST : 0,
        paymentSignature: runInfo.paymentSignature || null,
        drops: dropObjects
      });

      syncBackendState(result);
      if (result.runType !== "paid") markFreeRunUsed(gameKey);
      const runTypeText = result.runType === "paid" ? `Extra run onchain: ${result.burnedMeal || EXTRA_RUN_BURN_MEAL} burned + ${result.poolMeal || EXTRA_RUN_POOL_MEAL} to Reward Vault` : "Daily free run used";
      addLog(`${gameKey}: ${runTypeText}. Backend saved score ${result.score}, +${result.xpEarned} XP.`);

      if (note) {
        note.innerHTML = `<strong>Backend saved:</strong> ${gameKey} · ${runTypeText} · Score ${result.score} · +${result.xpEarned} XP · ${result.drops.length ? result.drops.map(d => `${d.item} x${d.qty}`).join(", ") : "No item drops"}`;
      }
    } catch (err) {
      const msg = err?.message || "submit_failed";
      addLog(`${gameKey}: backend save failed (${msg}).`);
      let extra = msg === "free_run_already_used" ? ` Daily free run already used. Start an Extra Reward Run for ${EXTRA_REWARDED_RUN_COST} $MEAL.` : "";
      if (msg === "paid_run_daily_limit_reached") extra = " Daily extra rewarded run limit reached. Come back tomorrow.";
      if (msg === "free_run_already_used") {
        markFreeRunUsed(gameKey);
        renderArcadeModal(`The free rewarded run for <strong>${gameKey}</strong> is already used today. Use the <strong>Extra Reward Run</strong> button for ${EXTRA_REWARDED_RUN_COST} $MEAL.`);
      }
      if (msg === "paid_run_daily_limit_reached") {
        renderArcadeModal(`<strong>Daily limit reached.</strong> You used the maximum 20 extra rewarded runs for today. Come back tomorrow.`);
      }
      if (note) note.innerHTML = `<strong>Backend save failed:</strong> ${msg}.${extra}`;
    }
  }

  window.addEventListener("message", event => {
    if (event && event.data && event.data.type === "MCMEAL_GAME_RESULT") {
      applyRealGameReward(event.data);
    }
  });


  function getRecipeDefinitions() {
    return {
      basic: {
        id: "basic",
        icon: "🍔",
        name: "Basic Burger",
        resultItem: "Basic Burger",
        description: "Creates the first real food base.",
        costMeal: 0,
        burnRate: 0,
        requirements: [["Bun",1],["Patty",1],["Cheese",1],["Lettuce",1],["Sauce",1]]
      },
      classic: {
        id: "classic",
        icon: "🍱",
        name: "Classic MC Meal",
        resultItem: "Classic MC Meal",
        description: "Costs 100 $MEAL. 80% burn / 20% pool.",
        costMeal: 100,
        burnRate: 0.8,
        requirements: [["Basic Burger",1],["Fries",1],["Soda",1]]
      },
      mystery: {
        id: "mystery",
        icon: "🎁",
        name: "Mystery Meal Attempt",
        resultItem: "Mystery Meal",
        description: "Onchain cost: 450 $MEAL burned + 50 $MEAL to Reward Vault. Max 3 Mystery Meal attempts per wallet/day. Odds: Scrap 40%, Common 35%, Rare 18%, Supreme 5.5%, Legendary 1.25%, Golden 0.25%.",
        costMeal: 500,
        burnRate: 0.9,
        requirements: [["Bun",1],["Patty",1],["Cheese",1],["Fries",1],["Soda",1],["Sauce",1],["Mystery Ticket",1]]
      }
    };
  }

  function getRecipeStatus(recipe) {
    const reqStatus = recipe.requirements.map(([item, qty]) => {
      const owned = state.inventory[item] || 0;
      return {
        item,
        qty,
        owned,
        missing: Math.max(0, qty - owned),
        ok: owned >= qty
      };
    });

    const missingItems = reqStatus.filter(r => !r.ok);
    const mealMissing = Math.max(0, (recipe.costMeal || 0) - (state.meal || 0));
    const canCraft = missingItems.length === 0 && mealMissing === 0;

    return {
      reqStatus,
      missingItems,
      mealMissing,
      canCraft
    };
  }

  function recipeStatusLabel(status) {
    if (status.canCraft) {
      return `<div style="color:#52f0cf; margin:8px 0 10px;"><strong>Status:</strong> Ready to craft</div>`;
    }

    const missingParts = [];
    if (status.missingItems.length) missingParts.push("Ingredients missing");
    if (status.mealMissing > 0) missingParts.push(`${status.mealMissing} $MEAL missing`);

    return `<div style="color:#ff8f75; margin:8px 0 10px;"><strong>Status:</strong> ${missingParts.join(" · ")}</div>`;
  }

  function renderRecipeRequirements(status, costMeal) {
    const rows = status.reqStatus.map(r => `
      <div style="display:flex; justify-content:space-between; gap:12px; padding:4px 0; border-bottom:1px solid rgba(255,206,74,.08);">
        <span style="color:${r.ok ? '#fff3d0' : '#ff8f75'};">${r.item}</span>
        <span style="color:${r.ok ? '#52f0cf' : '#ff8f75'};">${r.owned}/${r.qty}</span>
      </div>
    `).join("");

    const mealRow = costMeal > 0 ? `
      <div style="display:flex; justify-content:space-between; gap:12px; padding:4px 0; border-bottom:1px solid rgba(255,206,74,.08);">
        <span style="color:${state.meal >= costMeal ? '#fff3d0' : '#ff8f75'};">$MEAL Cost</span>
        <span style="color:${state.meal >= costMeal ? '#52f0cf' : '#ff8f75'};">${state.meal}/${costMeal}</span>
      </div>
    ` : "";

    return `<div style="margin-top:8px; margin-bottom:10px;">
      <div style="color:#ffce4a; margin-bottom:5px;"><strong>Recipe Requirements</strong></div>
      ${rows}
      ${mealRow}
    </div>`;
  }

  function renderRecipeOwns(recipe) {
    const ownQty = state.inventory[recipe.resultItem] || 0;
    return `<div style="color:#b9a88a; margin-top:6px; margin-bottom:4px;">You own: ${ownQty}x ${recipe.resultItem}</div>`;
  }


  function renderCraftModal() {
    const recipes = getRecipeDefinitions();
    const basicStatus = getRecipeStatus(recipes.basic);
    const classicStatus = getRecipeStatus(recipes.classic);
    const mysteryStatus = getRecipeStatus(recipes.mystery);

    const availableNow = [
      basicStatus.canCraft ? "Basic Burger" : null,
      classicStatus.canCraft ? "Classic MC Meal" : null,
      mysteryStatus.canCraft ? "Mystery Meal Attempt" : null
    ].filter(Boolean);

    setContent(`
      <div class="modal-grid">
        <div class="modal-panel">
          <h3>${recipes.basic.icon} ${recipes.basic.name}</h3>
          <p>${recipes.basic.description}</p>
          ${renderRecipeOwns(recipes.basic)}
          ${recipeStatusLabel(basicStatus)}
          ${renderRecipeRequirements(basicStatus, recipes.basic.costMeal)}
          <button class="action-btn" data-craft="basic" ${basicStatus.canCraft ? "" : "disabled"}>CRAFT BASIC</button>
        </div>

        <div class="modal-panel">
          <h3>${recipes.classic.icon} ${recipes.classic.name}</h3>
          <p>${recipes.classic.description}</p>
          ${renderRecipeOwns(recipes.classic)}
          ${recipeStatusLabel(classicStatus)}
          ${renderRecipeRequirements(classicStatus, recipes.classic.costMeal)}
          <button class="action-btn" data-craft="classic" ${classicStatus.canCraft ? "" : "disabled"}>CRAFT CLASSIC</button>
        </div>

        <div class="modal-panel">
          <h3>${recipes.mystery.icon} ${recipes.mystery.name}</h3>
          <p>${recipes.mystery.description}</p>
          <div style="color:#b9a88a; margin-top:6px; margin-bottom:4px;">Odds: Scrap 40% · Common 35% · Rare 18% · Supreme 5.5% · Legendary 1.25% · Golden 0.25%</div>
          ${recipeStatusLabel(mysteryStatus)}
          ${renderRecipeRequirements(mysteryStatus, recipes.mystery.costMeal)}
          <button class="action-btn" data-craft="mystery" ${mysteryStatus.canCraft ? "" : "disabled"}>CRAFT MYSTERY</button>
        </div>

        <div class="modal-panel">
          <h3>📖 Recipe Book</h3>
          <p>All known recipes are shown here. Green means you can craft it right now.</p>
          <div class="roadmap">
            <div><strong>Craftable now:</strong> ${availableNow.length ? availableNow.join(", ") : "No recipe craftable yet."}</div>
            <div><strong>Tip:</strong> If a recipe is red, the missing ingredients or missing $MEAL are shown directly in the recipe card.</div>
            <div><strong>Loop:</strong> Play mini-games → collect items → craft meals → sell / upgrade / repeat.</div>
          </div>
        </div>
      </div>

      <div class="modal-panel">
        <h3>Kitchen Log</h3>
        <div class="roadmap">${state.log.slice(-5).reverse().map(l => `<div>${l}</div>`).join("")}</div>
      </div>
    `);

    document.querySelectorAll("[data-craft]").forEach(btn => {
      btn.addEventListener("click", () => craft(btn.dataset.craft));
    });
  }

  function has(item, qty) {
    return (state.inventory[item] || 0) >= qty;
  }

  function take(item, qty) {
    state.inventory[item] = Math.max(0, (state.inventory[item] || 0) - qty);
  }

  function give(item, qty = 1) {
    state.inventory[item] = (state.inventory[item] || 0) + qty;
  }

  async function craft(type) {
    if (!requireWallet("crafting")) {
      renderCraftModal();
      return;
    }

    let paymentSignature = null;

    try {
      if (type === "mystery") {
        await backendCall(BACKEND.endpoints.craft, {
          walletAddress: state.wallet,
          recipeId: type,
          preflight: true
        });
        paymentSignature = await payMealOnchain("mystery_craft");
      }

      const result = await backendCall(BACKEND.endpoints.craft, {
        walletAddress: state.wallet,
        recipeId: type,
        paymentSignature
      });
      syncBackendState(result);
      const craftedName = result.recipeName || type;
      const craftedXp = result.xpEarned ?? result.xp ?? 0;
      const onchainText = result.onchainVerified ? ` · Onchain: ${result.burned || 0} burned + ${result.pool || 0} to Reward Vault` : "";
      addLog(`Crafted ${craftedName} → ${result.resultItem}. +${craftedXp} XP.${onchainText}`);
    } catch (err) {
      const msg = err?.message || "craft_failed";
      if (msg === "missing_ingredients") addLog("Craft failed: missing ingredients.");
      else if (msg === "not_enough_meal") addLog("Craft failed: not enough $MEAL.");
      else if (msg === "mystery_craft_daily_limit_reached") addLog("Craft failed: daily Mystery Meal limit reached. Come back tomorrow.");
      else addLog(`Craft failed: ${msg}.`);
    }

    renderCraftModal();
  }

  function spendMeal(amount, burnRate) {
    const burn = Math.floor(amount * burnRate);
    const pool = amount - burn;
    state.meal -= amount;
    state.burned += burn;
    state.rewardPool = (state.rewardPool || 0) + pool;
  }

  function roll(table) {
    const total = table.reduce((s, [,w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [item, weight] of table) {
      r -= weight;
      if (r <= 0) return item;
    }
    return table[table.length - 1][0];
  }

  function renderShopModal(activeTab = "buy") {
    const shop = [
      ["Bun Pack", "Bun", 3, 60, "Basic recipe base"],
      ["Patty Pack", "Patty", 3, 90, "Burger stack material"],
      ["Fries Pack", "Fries", 3, 75, "Classic meal side"],
      ["Soda Pack", "Soda", 3, 75, "Classic meal drink"],
      ["Sauce Pack", "Sauce", 3, 120, "Important craft bottleneck"],
      ["Mystery Ticket", "Mystery Ticket", 1, 300, "Mystery Meal key", false],
      ["Recipe Fragment", "Recipe Fragment", 1, 1000, "Rare recipe progress", false],
      ["Secret Receipt", "Secret Receipt", 1, 3500, "Hidden Menu utility", true],
      ["Craft Entry", "Craft Entry", 1, 750, "Future premium action", false]
    ];

    const sell = [
      ["Basic Burger", 40, "Base food"],
      ["Classic MC Meal", 160, "Full meal"],
      ["Kitchen Scrap", 25, "Fail material"],
      ["Common Meal", 180, "Entry rarity"],
      ["Rare Meal", 900, "First value layer"],
      ["Supreme Meal", 4500, "High-tier meal"],
      ["Legendary Meal", 22000, "Premium craft"],
      ["Golden Meal", 120000, "Final chase"]
    ];

    const buyHtml = `
      <div class="modal-panel">
        <div class="season-badge">KITCHEN SHOP</div>
        <h3>Buy Materials</h3>
        <p>Use $MEAL balance to buy missing materials. Actions are saved on the backend.</p>
        <div class="action-list">
          ${shop.map(([label,item,qty,price,note,locked]) => `
            <div class="action-row ${locked ? "locked-row" : ""}">
              <div class="pixel-icon">${icon(item)}</div>
              <div><strong>${label}</strong><span>${locked ? `COMING SOON · ${note}` : `${qty}x ${item} · ${price} $MEAL · ${note}`}</span></div>
              <button class="small-btn ${locked ? "locked-btn" : ""}" ${locked ? "disabled" : `data-buy="${item}" data-qty="${qty}" data-price="${price}"`}>${locked ? "COMING SOON" : "BUY"}</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const sellHtml = `
      <div class="modal-panel">
        <div class="season-badge">SELL COUNTER</div>
        <h3>Sell Crafted Meals</h3>
        <p>Sell crafted meals back to the Kitchen Buyer. Actions are saved on the backend.</p>
        <div class="action-list">
          ${sell.map(([item, price, note]) => `
            <div class="action-row">
              <div class="pixel-icon">${icon(item)}</div>
              <div><strong>${item}</strong><span>Own x${state.inventory[item] || 0} · Sell ${price} $MEAL · ${note}</span></div>
              <button class="small-btn gold" data-sell="${item}" data-price="${price}" ${(state.inventory[item] || 0) ? "" : "disabled"}>SELL</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const marketHtml = `
      <div class="modal-panel">
        <div class="season-badge">TOKEN SETTLEMENT</div>
        <h3>Market Logic</h3>
        <p>$MEAL actions are backend-synced. Real token settlement activates with wallet signatures and transaction checks.</p>
        <div class="roadmap">
          <div><strong>Buy real:</strong> wallet signs $MEAL payment → backend verifies tx → item delivered</div>
          <div><strong>Sell real:</strong> backend removes meal → creates payout or claim credit</div>
          <div><strong>Replay protection:</strong> every Solana signature is stored once</div>
          <div><strong>Safety:</strong> daily limits, rate limits and suspicious action logs</div>
        </div>
      </div>
    `;

    setContent(`
      <div class="market-tabs">
        <button class="market-tab ${activeTab === "buy" ? "active" : ""}" data-tab="buy">BUY</button>
        <button class="market-tab ${activeTab === "sell" ? "active" : ""}" data-tab="sell">SELL</button>
        <button class="market-tab ${activeTab === "market" ? "active" : ""}" data-tab="market">MARKET PLAN</button>
      </div>

      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Shop Balance</h3>
          <div class="item-list">
            <div class="item-row"><div class="pixel-icon">🍽️</div><div><strong>$MEAL Balance</strong><span>$MEAL kitchen balance</span></div><strong>${state.meal}</strong></div>
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>Burned</strong><span>Backend burn counter</span></div><strong>${state.burned}</strong></div>
            <div class="item-row"><div class="pixel-icon">🏦</div><div><strong>Craft Pool</strong><span>20% pool counter</span></div><strong>${state.rewardPool || 0}</strong></div>
          </div>
          <br />
          <div class="station-status"><strong>Kitchen:</strong> Shop actions are backend-synced. Real $MEAL settlement comes after wallet signatures and tx checks.</div>
        </div>
        ${activeTab === "buy" ? buyHtml : activeTab === "sell" ? sellHtml : marketHtml}
      </div>
    `);

    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => renderShopModal(btn.dataset.tab));
    });

    document.querySelectorAll("[data-buy]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const item = btn.dataset.buy;
        if (!requireWallet("shop buys")) return renderShopModal("buy");
        try {
          const result = await backendCall(BACKEND.endpoints.shopBuy, {
            walletAddress: state.wallet,
            shopItemId: SHOP_ITEM_IDS[item]
          });
          syncBackendState(result);
          addLog(`Bought ${result.qty}x ${result.item}. ${result.burned} $MEAL burned, ${result.pool} to pool.`);
        } catch (err) {
          const msg = err?.message || "shop_buy_failed";
          addLog(
            msg === "not_enough_meal"
              ? `Shop buy failed: not enough $MEAL for ${item}.`
              : msg === "item_locked_coming_soon"
                ? `${item} is coming soon. Hidden Menu utility is not active yet.`
                : `Shop buy failed: ${msg}.`
          );
        }
        renderShopModal("buy");
      });
    });

    document.querySelectorAll("[data-sell]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const item = btn.dataset.sell;
        if (!requireWallet("shop sells")) return renderShopModal("sell");
        try {
          const result = await backendCall(BACKEND.endpoints.shopSell, {
            walletAddress: state.wallet,
            itemName: item,
            qty: 1
          });
          syncBackendState(result);
          addLog(`Sold ${result.qty}x ${result.itemName} for ${result.mealAmount} $MEAL.`);
        } catch (err) {
          const msg = err?.message || "shop_sell_failed";
          addLog(msg === "missing_item" ? `Sell failed: missing ${item}.` : `Sell failed: ${msg}.`);
        }
        renderShopModal("sell");
      });
    });
  }

  function renderInventoryModal() {
    const entries = Object.entries(state.inventory)
      .filter(([, qty]) => qty > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));

    setContent(`
      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Inventory Fridge</h3>
          <p>Everything farmed and crafted ends up here.</p>
          <div class="item-list">
            ${entries.map(([item, qty]) => `
              <div class="item-row">
                <div class="pixel-icon">${icon(item)}</div>
                <div><strong>${item}</strong><span>Stored item</span></div>
                <strong>x${qty}</strong>
              </div>
            `).join("") || `<div class="item-row"><div></div><div><strong>Empty</strong><span>Play arcade games to collect items.</span></div><div></div></div>`}
          </div>
        </div>
        <div class="modal-panel">
          <h3>Meal Vault</h3>
          <p>Crafted meals are the value layer.</p>
          <div class="roadmap">
            <div><strong>Common Meal</strong> · sell, use, upgrade to Rare.</div>
            <div><strong>Rare Meal</strong> · stronger sell value and upgrade path.</div>
            <div><strong>Supreme / Legendary</strong> · premium value layer.</div>
            <div><strong>Golden Meal</strong> · final chase item for the MC Meal economy.</div>
          </div>
        </div>
      </div>
    `);
  }

  function renderLeaderboardModal() {
    setContent(`
      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Live Kitchen Stats</h3>
          <div class="item-list">
            <div class="item-row"><div class="pixel-icon">⭐</div><div><strong>Chef XP</strong><span>Backend XP</span></div><strong>${state.xp}</strong></div>
            <div class="item-row"><div class="pixel-icon">🏆</div><div><strong>Best Score</strong><span>Best backend saved run</span></div><strong>${state.bestScore}</strong></div>
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>$MEAL Burned</strong><span>Onchain/game burn</span></div><strong>${state.burned}</strong></div>
            <div class="item-row"><div class="pixel-icon">🍽️</div><div><strong>Meals Crafted</strong><span>Total crafted meals</span></div><strong>${state.mealsCrafted}</strong></div>
          </div>
        </div>
        <div class="modal-panel">
          <h3>Kitchen Leaderboards</h3>
          <div class="roadmap">
            <div>Daily high score per mini-game: next leaderboard view</div>
            <div>Most $MEAL burned: tracked</div>
            <div>Most Mystery Meals crafted: tracked now</div>
            <div>Golden Meal holders / crafters: tracked</div>
          </div>
        </div>
      </div>
    `);
  }


  function renderDailyModal() {
    const today = window.MCMealSave ? window.MCMealSave.todayKey() : new Date().toISOString().slice(0, 10);
    const already = state.streak && state.streak.lastClaimDate === today;
    const current = state.streak ? state.streak.current : 0;
    const total = state.streak ? state.streak.totalClaims : 0;
    const nextDay = current + (already ? 0 : 1);

    setContent(`
      <div class="modal-grid">
        <div class="modal-panel">
          <div class="season-badge">DAILY KITCHEN LOOP</div>
          <h3>🔥 Daily Kitchen Claim</h3>
          <p>Come back daily, build a server-side streak, collect ingredients and unlock better craft chances. One claim per wallet per server day.</p>

          <div class="item-list">
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>Current Streak</strong><span>Consecutive claims</span></div><strong>${current}</strong></div>
            <div class="item-row"><div class="pixel-icon">📅</div><div><strong>Today</strong><span>${already ? "Claim already used" : "Claim available"}</span></div><strong>${already ? "DONE" : "READY"}</strong></div>
            <div class="item-row"><div class="pixel-icon">✅</div><div><strong>Total Claims</strong><span>Lifetime server claims</span></div><strong>${total}</strong></div>
          </div>

          <br />
          <button class="action-btn" id="claimDailyBtn" ${already ? "disabled" : ""}>${already ? "CLAIMED TODAY" : "CLAIM DAILY BONUS"}</button>
        </div>

        <div class="modal-panel">
          <h3>🎁 Reward Ladder</h3>
          <div class="roadmap">
            <div><strong>Day 1+</strong> Bun + Fries + Soda + XP</div>
            <div><strong>Day 3+</strong> Mystery Ticket bonus</div>
            <div><strong>Day 5+</strong> Recipe Fragment bonus</div>
            <div><strong>Day 7+</strong> Craft Entry bonus</div>
            <div><strong>Next Claim</strong> would count as streak day ${nextDay}</div>
          </div>
        </div>
      </div>

      <div class="modal-panel">
        <h3>Kitchen Log</h3>
        <div class="roadmap">${state.log.slice(-5).reverse().map(l => `<div>${l}</div>`).join("")}</div>
      </div>
    `);

    const btn = document.getElementById("claimDailyBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        if (!requireWallet("daily claim")) return renderDailyModal();
        try {
          const result = await backendCall(BACKEND.endpoints.dailyClaim, {
            walletAddress: state.wallet
          });
          syncBackendState(result);
          addLog(`Daily claimed: streak ${result.streak}. +${result.xpEarned} XP.`);
        } catch (err) {
          const msg = err?.message || "daily_claim_failed";
          addLog(msg === "already_claimed_today" ? "Daily already claimed today." : `Daily claim failed: ${msg}.`);
        }
        renderDailyModal();
      });
    }
  }

  function accessDeniedMessage(address) {
    return `
      <div class="warning-box">
        <strong>Access locked.</strong><br />
        Wallet ${shortWallet(address)} does not have Kitchen access yet.<br />
        Holder access will unlock through $MEAL.
      </div>
    `;
  }

  async function connectWalletAndSync(resultEl, hideStartAfterSuccess = false) {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        if (resultEl) resultEl.innerHTML = `<div class="warning-box">Phantom wallet not detected. Install Phantom or use a browser with Solana wallet support.</div>`;
        return false;
      }

      if (resultEl) resultEl.innerHTML = `<div class="station-status">Connecting Phantom and checking Kitchen access...</div>`;

      const resp = await window.solana.connect({ onlyIfTrusted: false });
      const address = resp.publicKey.toString();

      const access = await backendCall(BACKEND.endpoints.checkAccess, {
        walletAddress: address
      });

      if (!access.allowed) {
        state.wallet = null;
        state.prelaunchAccess = false;
        state.backendSynced = false;
        saveState();
        if (resultEl) resultEl.innerHTML = accessDeniedMessage(address);
        return false;
      }

      let balance = null;
      let balanceText = "Kitchen access granted. $MEAL holder access is active.";

      try {
        balance = await fetchMealBalance(address);
        if (balance !== null) balanceText = `$MEAL balance found: ${balance}`;
      } catch (e) {
        balanceText = "Kitchen access granted. $MEAL economy is live.";
      }

      state.wallet = address;
      state.prelaunchAccess = true;
      saveState();

      const profile = await backendCall(BACKEND.endpoints.profileConnect, {
        walletAddress: address,
        mealBalance: balance !== null ? balance : 10000
      });
      syncBackendState(profile);
      state.prelaunchAccess = true;
      saveState();

      if (resultEl) {
        resultEl.innerHTML = `
          <div class="wallet-card">
            <div class="wallet-row"><span>Wallet</span><strong>${shortWallet(address)}</strong></div>
            <div class="wallet-row"><span>Access</span><strong>Kitchen Access</strong></div>
            <div class="wallet-row"><span>Backend</span><strong>Synced</strong></div>
            <div class="wallet-row"><span>Status</span><strong>${balanceText}</strong></div>
          </div>
        `;
      }

      if (hideStartAfterSuccess) {
        const start = document.getElementById("startScreen");
        if (start) start.classList.add("hidden");
      }

      addLog(`Wallet synced: ${shortWallet(address)}.`);
      return true;
    } catch (err) {
      const msg = err?.message || "wallet_connection_failed";
      if (resultEl) {
        if (msg === "access_locked_prelaunch" || err?.status === 403) {
          resultEl.innerHTML = `<div class="warning-box"><strong>Access locked.</strong><br />This wallet does not have Kitchen access yet. Hold at least 10,000 $MEAL.<br /><br /><a href="https://pump.fun/coin/EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump" target="_blank" rel="noopener noreferrer">BUY $MEAL</a></div>`;
        } else {
          resultEl.innerHTML = `<div class="warning-box">Wallet connection or backend sync failed: ${msg}</div>`;
        }
      }
      return false;
    }
  }

  async function connectWalletReadOnly() {
    await connectWalletAndSync(document.getElementById("walletResult"), false);
  }

  async function fetchMealBalance(walletAddress) {
    const cfg = await loadConfig();
    if (!cfg || !cfg.MEAL_MINT || cfg.MEAL_MINT.includes("REPLACE")) cfg = { MEAL_MINT: OFFICIAL_MEAL_MINT, SOLANA_RPC: "https://solana-rpc.publicnode.com" };

    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { mint: cfg.MEAL_MINT },
        { encoding: "jsonParsed" }
      ]
    };

    const res = await fetch(cfg.SOLANA_RPC || "https://solana-rpc.publicnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const accounts = data?.result?.value || [];
    let total = 0;
    for (const acc of accounts) {
      const ui = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      total += Number(ui);
    }
    return total;
  }

  async function loadConfig() {
    try {
      const res = await fetch("config.json", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    try {
      const res = await fetch("config.example.json", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }


  function renderLaunchModal() {
    const walletText = state.wallet ? `${state.wallet.slice(0, 6)}...${state.wallet.slice(-6)}` : "Not connected";
    const tier = state.accessTier || "Visitor";

    setContent(`
      <div class="big-cta">
        <div>MC MEAL KITCHEN</div>
        <div>Backend-synced kitchen economy · $MEAL live</div>
      </div>

      <div class="modal-grid">
        <div class="modal-panel">
          <div class="season-badge">KITCHEN ACCESS</div>
          <h3>Wallet Connect</h3>
          <p>Connect Phantom to open the Kitchen. Holder access starts at <strong>10,000 $MEAL</strong>. Use the official $MEAL link below.</p>

          <div class="wallet-card">
            <div class="wallet-row"><span>Wallet</span><strong>${walletText}</strong></div>
            <div class="wallet-row"><span>Access Tier</span><strong>${tier}</strong></div>
            <div class="wallet-row"><span>Backend Sync</span><strong>Active after connect</strong></div>
            <div class="wallet-row"><span>Official Mint</span><strong style="overflow-wrap:anywhere;">EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump</strong></div>
          </div>

          <br />
          <button class="action-btn" id="connectWalletBtn">CONNECT PHANTOM</button>
          <a class="small-btn gold" href="https://pump.fun/coin/EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;margin-top:10px;">BUY $MEAL</a>
          <div id="walletResult" style="margin-top:12px;"></div>
        </div>

        <div class="modal-panel">
          <h3>Kitchen Access Tiers</h3>
          <div class="roadmap">
            <div><strong>Access</strong> 10,000 $MEAL required</div>
            <div><strong>Basic Kitchen</strong> 10,000 $MEAL</div>
            <div><strong>Grill Access</strong> 50,000 $MEAL</div>
            <div><strong>Golden Kitchen</strong> 250,000 $MEAL</div>
            <div><strong>Legendary Kitchen</strong> 1,000,000 $MEAL</div>
          </div>
        </div>
      </div>

      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Backend Status</h3>
          <div class="roadmap">
            <div>Wallet profile sync: live</div>
            <div>Official $MEAL mint: EP5KFRnhXfrqGuZAmogpsQ88q2xHdBnLnAhwGRKspump</div>
            <div>Daily claim per wallet: live</div>
            <div>Run submit API with duplicate protection: live</div>
            <div>Craft + shop verification: live</div>
          </div>
        </div>

        <div class="modal-panel">
          <h3>Kitchen Status</h3>
          <div class="roadmap">
            <div>Kitchen hub: live</div>
            <div>4 real games: rewards connected</div>
            <div>Supabase save: active</div>
            <div>Wallet profile: active</div>
          </div>
        </div>
      </div>
    `);

    document.getElementById("connectWalletBtn").addEventListener("click", connectWalletReadOnly);
  }

  function icon(item) {
    const map = {
      Bun: "🍞", Patty: "🥩", Cheese: "🧀", Lettuce: "🥬", Fries: "🍟", Soda: "🥤", Sauce: "🧂",
      "Mystery Ticket": "🎫", "Recipe Fragment": "📜", "Craft Entry": "🔑",
      "Basic Burger": "🍔", "Classic MC Meal": "🍱", "Kitchen Scrap": "🧱",
      "Common Meal": "🍽️", "Rare Meal": "💎", "Supreme Meal": "👑", "Legendary Meal": "🔥", "Golden Meal": "🏆"
    };
    return map[item] || "◼";
  }

  function setContent(html) {
    document.getElementById("modalContent").innerHTML = html;
  }

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", e => {
    if (e.target.id === "modal") closeModal();
  });

  window.addEventListener("keydown", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = true;
    if (e.key === "Escape" && modalOpen) closeModal();
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  });

  window.addEventListener("keyup", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = false;
  });

  document.querySelectorAll("[data-key]").forEach(btn => {
    const key = btn.getAttribute("data-key");
    const down = e => { e.preventDefault(); keys[key] = true; };
    const up = e => { e.preventDefault(); keys[key] = false; };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointerleave", up);
    btn.addEventListener("pointercancel", up);
  });


  function setupStartScreen() {
    const start = document.getElementById("startScreen");
    const enter = document.getElementById("enterKitchenBtn");
    const how = document.getElementById("howItWorksBtn");
    const howBox = document.getElementById("howItWorksBox");
    const result = document.getElementById("accessResult");

    if (enter && start) {
      enter.addEventListener("click", async () => {
        await connectWalletAndSync(result, true);
      });
    }

    if (how && howBox) {
      how.addEventListener("click", () => {
        howBox.classList.toggle("hidden");
      });
    }

    window.addEventListener("keydown", async e => {
      if (!start || start.classList.contains("hidden")) return;
      if (e.key === "Enter") {
        e.preventDefault();
        await connectWalletAndSync(result, true);
      }
    });

    if (hasPrivateAccess() && start) {
      start.classList.add("hidden");
    }
  }


  setupMobileJoystick();
  setupStartScreen();
  requestAnimationFrame(loop);
})();
