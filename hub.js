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
      subtitle: "Wallet + tiers",
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
      log: ["Welcome to MC Meal Kitchen Street."]
    };

    if (!raw) return defaults;
    try {
      const parsed = JSON.parse(raw);
      parsed.inventory = { ...defaults.inventory, ...(parsed.inventory || {}) };
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

  function update(dt) {
    if (modalOpen) return;

    let dx = 0;
    let dy = 0;
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
    drawPixelText("MC MEAL KITCHEN STREET", 26, 32, 27, C.gold, "#74311f");

    ctx.fillStyle = C.cream;
    ctx.font = "15px Courier New";
    ctx.fillText("Walk around. ENTER opens a building.", 575, 31);

    ctx.fillStyle = C.green;
    ctx.font = "13px Courier New";
    ctx.fillText("Play → Collect → Craft → Sell → Repeat", 575, 54);
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
  
  function setupStartScreen() {
    const start = document.getElementById("startScreen");
    const enter = document.getElementById("enterKitchenBtn");
    const how = document.getElementById("howItWorksBtn");
    const howBox = document.getElementById("howItWorksBox");

    if (enter && start) {
      enter.addEventListener("click", () => {
        start.classList.add("hidden");
      });
    }

    if (how && howBox) {
      how.addEventListener("click", () => {
        howBox.classList.toggle("hidden");
      });
    }

    window.addEventListener("keydown", e => {
      if (!start || start.classList.contains("hidden")) return;
      if (e.key === "Enter") start.classList.add("hidden");
    });
  }


  setupStartScreen();
  requestAnimationFrame(loop);
  }

  function openStation(id) {
    modalOpen = true;
    const station = stations.find(s => s.id === id);
    setModalHeader(station.name, station.subtitle);

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

  function renderArcadeModal() {
    const games = [
      {
        icon: "🍔",
        name: "Burger Stack",
        subtitle: "Approved v6 · burger building game",
        src: "games/burger/index.html"
      },
      {
        icon: "🍟",
        name: "Fry Rush",
        subtitle: "Approved v2 · fry catching game",
        src: "games/fry/index.html"
      },
      {
        icon: "🥤",
        name: "Soda Sprint",
        subtitle: "Approved easier v2 · soda filling game",
        src: "games/soda/index.html"
      },
      {
        icon: "🧾",
        name: "Mystery Order Rush",
        subtitle: "Approved v3 · real hand picker",
        src: "games/order/index.html"
      }
    ];

    setContent(`
      <div class="modal-grid">
        ${games.map(g => `
          <div class="modal-panel">
            <div class="alpha-badge">REAL APPROVED GAME</div>
            <h3>${g.icon} ${g.name}</h3>
            <p>${g.subtitle}. Opens the exact approved standalone build inside the Hub.</p>
            <button class="action-btn" data-real-game="${g.src}" data-game-name="${g.name}">PLAY REAL GAME</button>
          </div>
        `).join("")}
      </div>

      <div class="modal-panel">
        <h3>Connected Rewards</h3>
        <p>These are not the simplified demo modules. These are the approved real mini-games. When a run reaches the result screen, rewards are sent back into the shared Hub profile.</p>
      </div>
    `);

    document.querySelectorAll("[data-real-game]").forEach(btn => {
      btn.addEventListener("click", () => openRealGame(btn.dataset.realGame, btn.dataset.gameName));
    });
  }

  function openRealGame(src, gameName) {
    setModalHeader(gameName, "Real approved mini-game · rewards connect back to Hub");

    setContent(`
      <div class="real-game-wrap">
        <div class="game-launch-note" id="realGameRewardNote">
          <strong>${gameName}</strong> is running inside MC Meal Hub. Play until the result screen. Rewards will save automatically.
        </div>

        <iframe class="real-game-frame" src="${src}" title="${gameName}" scrolling="no"></iframe>
        <div class="mobile-note"></div>

        <div class="game-actions">
          <button class="small-btn gold" id="backToArcadeReal">BACK TO ARCADE</button>
          <button class="small-btn" id="openGameNewTab">OPEN FULL SCREEN</button>
        </div>
      </div>
    `);

    document.getElementById("backToArcadeReal").addEventListener("click", renderArcadeModal);
    document.getElementById("openGameNewTab").addEventListener("click", () => window.open(src, "_blank"));
  }

  function applyRealGameReward(payload) {
    if (!payload || payload.type !== "MCMEAL_GAME_RESULT") return;

    const rewards = payload.rewards || {};
    const drops = Array.isArray(rewards.drops) ? rewards.drops.slice() : [];

    if (rewards.gotTicket) drops.push("Mystery Ticket");
    if (rewards.gotFragment) drops.push("Recipe Fragment");

    const dropObjects = drops.map(item => ({ item, qty: 1 }));
    const score = Number(payload.score || 0);
    const xp = Number(rewards.xp || 0);

    if (window.MCMealSave) {
      state = window.MCMealSave.submitRun(state, payload.game || "Mini Game", score, dropObjects);
      state.xp += xp;
      if (payload.levelsCleared) state.lastLevelsCleared = payload.levelsCleared;
      saveState();
    } else {
      state.miniRuns += 1;
      state.bestScore = Math.max(state.bestScore || 0, score);
      state.xp += xp;
      for (const d of dropObjects) give(d.item, d.qty);
      addLog(`${payload.game}: rewards saved.`);
      saveState();
    }

    const note = document.getElementById("realGameRewardNote");
    if (note) {
      note.innerHTML = `<strong>Rewards saved:</strong> ${payload.game || "Mini Game"} · Score ${score} · +${xp} XP · ${dropObjects.length ? dropObjects.map(d => d.item).join(", ") : "No item drops"}`;
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
        description: "Costs 500 $MEAL. Can roll Common, Rare, Supreme, Legendary or Golden Meal.",
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
          <div style="color:#b9a88a; margin-top:6px; margin-bottom:4px;">Possible results: Kitchen Scrap, Common, Rare, Supreme, Legendary, Golden</div>
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

  function craft(type) {
    if (type === "basic") {
      const req = [["Bun",1],["Patty",1],["Cheese",1],["Lettuce",1],["Sauce",1]];
      if (!req.every(([i,q]) => has(i,q))) return addLog("Craft failed: missing Basic Burger ingredients."), renderCraftModal();
      req.forEach(([i,q]) => take(i,q));
      give("Basic Burger");
      state.mealsCrafted += 1;
      state.xp += 25;
      addLog("Crafted Basic Burger. +25 XP.");
    }

    if (type === "classic") {
      const req = [["Basic Burger",1],["Fries",1],["Soda",1]];
      if (state.meal < 100 || !req.every(([i,q]) => has(i,q))) return addLog("Craft failed: missing Classic MC Meal requirements."), renderCraftModal();
      req.forEach(([i,q]) => take(i,q));
      spendMeal(100, 0.8);
      give("Classic MC Meal");
      state.mealsCrafted += 1;
      state.xp += 60;
      addLog("Crafted Classic MC Meal. 80 $MEAL burned, 20 to pool. +60 XP.");
    }

    if (type === "mystery") {
      const req = [["Bun",1],["Patty",1],["Cheese",1],["Fries",1],["Soda",1],["Sauce",1],["Mystery Ticket",1]];
      if (state.meal < 500 || !req.every(([i,q]) => has(i,q))) return addLog("Craft failed: missing Mystery Meal requirements."), renderCraftModal();
      req.forEach(([i,q]) => take(i,q));
      spendMeal(500, 0.9);
      const result = roll([
        ["Kitchen Scrap", 40],
        ["Common Meal", 35],
        ["Rare Meal", 18],
        ["Supreme Meal", 5.5],
        ["Legendary Meal", 1.25],
        ["Golden Meal", 0.25]
      ]);
      give(result);
      state.mealsCrafted += 1;
      state.xp += 120;
      addLog(`Mystery Meal crafted → ${result}. 450 $MEAL burned, 50 to pool. +120 XP.`);
    }

    saveState();
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
      ["Mystery Ticket", "Mystery Ticket", 1, 300, "Mystery Meal key"],
      ["Recipe Fragment", "Recipe Fragment", 1, 1000, "Rare recipe progress"],
      ["Secret Receipt", "Secret Receipt", 1, 3500, "Late-game key"],
      ["Craft Entry", "Craft Entry", 1, 750, "Future premium action"]
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
        <div class="alpha-badge">DEMO SHOP</div>
        <h3>Buy Materials</h3>
        <p>Use demo $MEAL to buy missing materials. 80% burn / 20% craft pool is displayed immediately.</p>
        <div class="action-list">
          ${shop.map(([label,item,qty,price,note]) => `
            <div class="action-row">
              <div class="pixel-icon">${icon(item)}</div>
              <div><strong>${label}</strong><span>${qty}x ${item} · ${price} $MEAL · ${note}</span></div>
              <button class="small-btn" data-buy="${item}" data-qty="${qty}" data-price="${price}">BUY</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const sellHtml = `
      <div class="modal-panel">
        <div class="alpha-badge">DEMO SELL COUNTER</div>
        <h3>Sell Crafted Meals</h3>
        <p>Sell crafted meals back to the Kitchen Buyer for demo $MEAL. Real payouts need backend protection.</p>
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
        <div class="alpha-badge">REAL MARKET PLAN</div>
        <h3>Market Logic</h3>
        <p>This is the exact flow before we activate real transactions.</p>
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
            <div class="item-row"><div class="pixel-icon">🍽️</div><div><strong>Demo $MEAL</strong><span>Preview balance</span></div><strong>${state.meal}</strong></div>
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>Burned</strong><span>Preview burn counter</span></div><strong>${state.burned}</strong></div>
            <div class="item-row"><div class="pixel-icon">🏦</div><div><strong>Craft Pool</strong><span>20% pool counter</span></div><strong>${state.rewardPool || 0}</strong></div>
          </div>
          <br />
          <div class="station-status"><strong>Alpha rule:</strong> Shop is playable with demo economy. Real $MEAL settlement only after backend verification.</div>
        </div>
        ${activeTab === "buy" ? buyHtml : activeTab === "sell" ? sellHtml : marketHtml}
      </div>
    `);

    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => renderShopModal(btn.dataset.tab));
    });

    document.querySelectorAll("[data-buy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.dataset.buy;
        const qty = Number(btn.dataset.qty);
        const price = Number(btn.dataset.price);
        if (window.MCMealSave) {
          window.MCMealSave.buyFromShop(state, item, qty, price);
          saveState();
        } else if (state.meal >= price) {
          spendMeal(price, 0.8);
          give(item, qty);
          addLog(`Bought ${qty}x ${item}.`);
        }
        renderShopModal("buy");
      });
    });

    document.querySelectorAll("[data-sell]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.dataset.sell;
        const price = Number(btn.dataset.price);
        if (window.MCMealSave) {
          window.MCMealSave.sellToShop(state, item, 1, price);
          saveState();
        } else if (has(item, 1)) {
          take(item, 1);
          state.meal += price;
          addLog(`Sold ${item} for ${price} $MEAL.`);
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
            <div><strong>Golden Meal</strong> · final chase item for seasons/onchain later.</div>
          </div>
        </div>
      </div>
    `);
  }

  function renderLeaderboardModal() {
    setContent(`
      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Local Kitchen Stats</h3>
          <div class="item-list">
            <div class="item-row"><div class="pixel-icon">⭐</div><div><strong>Chef XP</strong><span>Total local progress</span></div><strong>${state.xp}</strong></div>
            <div class="item-row"><div class="pixel-icon">🏆</div><div><strong>Best Score</strong><span>Best simulated run</span></div><strong>${state.bestScore}</strong></div>
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>$MEAL Burned</strong><span>Shop/craft burn</span></div><strong>${state.burned}</strong></div>
            <div class="item-row"><div class="pixel-icon">🍽️</div><div><strong>Meals Crafted</strong><span>Total crafted meals</span></div><strong>${state.mealsCrafted}</strong></div>
          </div>
        </div>
        <div class="modal-panel">
          <h3>Future Backend Leaderboards</h3>
          <div class="roadmap">
            <div>Daily high score per mini-game</div>
            <div>Most $MEAL burned this season</div>
            <div>Most Mystery Meals crafted</div>
            <div>Golden Meal holders / crafters</div>
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
          <div class="alpha-badge">DAILY RETENTION LOOP</div>
          <h3>🔥 Daily Kitchen Claim</h3>
          <p>Come back daily, build a streak, collect ingredients and unlock better craft chances. Backend version will be one claim per wallet per server day.</p>

          <div class="item-list">
            <div class="item-row"><div class="pixel-icon">🔥</div><div><strong>Current Streak</strong><span>Consecutive claims</span></div><strong>${current}</strong></div>
            <div class="item-row"><div class="pixel-icon">📅</div><div><strong>Today</strong><span>${already ? "Claim already used" : "Claim available"}</span></div><strong>${already ? "DONE" : "READY"}</strong></div>
            <div class="item-row"><div class="pixel-icon">✅</div><div><strong>Total Claims</strong><span>Lifetime preview claims</span></div><strong>${total}</strong></div>
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
      btn.addEventListener("click", () => {
        if (window.MCMealSave) {
          const result = window.MCMealSave.claimDaily(state);
          state = result.profile;
          saveState();
        } else {
          addLog("Daily claimed.");
        }
        renderDailyModal();
      });
    }
  }

  async function connectWalletReadOnly() {
    const resultEl = document.getElementById("walletResult");
    try {
      if (!window.solana || !window.solana.isPhantom) {
        resultEl.innerHTML = `<div class="warning-box">Phantom wallet not detected. Install Phantom or use a browser with Solana wallet support.</div>`;
        return;
      }

      const resp = await window.solana.connect({ onlyIfTrusted: false });
      const address = resp.publicKey.toString();
      let balance = null;
      let balanceText = "Balance check skipped. Add MEAL mint in config.example.json to activate RPC balance checks.";

      try {
        balance = await fetchMealBalance(address);
        if (balance !== null) balanceText = `$MEAL Balance found: ${balance}`;
      } catch (e) {
        balanceText = "Wallet connected. $MEAL balance check needs RPC/mint config.";
      }

      if (window.MCMealSave) {
        state = window.MCMealSave.setWallet(state, address, balance);
        saveState();
      } else {
        state.wallet = address;
        saveState();
      }

      resultEl.innerHTML = `
        <div class="wallet-card">
          <div class="wallet-row"><span>Wallet</span><strong>${address.slice(0, 6)}...${address.slice(-6)}</strong></div>
          <div class="wallet-row"><span>Access Tier</span><strong>${state.accessTier || "Visitor"}</strong></div>
          <div class="wallet-row"><span>Read-only Status</span><strong>${balanceText}</strong></div>
        </div>
      `;
    } catch (err) {
      resultEl.innerHTML = `<div class="warning-box">Wallet connection cancelled or failed.</div>`;
    }
  }

  async function fetchMealBalance(walletAddress) {
    const cfg = await loadConfig();
    if (!cfg || !cfg.MEAL_MINT || cfg.MEAL_MINT.includes("REPLACE")) return null;

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

    const res = await fetch(cfg.SOLANA_RPC || "https://api.mainnet-beta.solana.com", {
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
        <div>MC MEAL LAUNCH ALPHA</div>
        <div>Real mini-games · shared inventory · craft house · shop loop · daily streak · wallet read-only</div>
      </div>

      <div class="modal-grid">
        <div class="modal-panel">
          <div class="alpha-badge">NO SPENDING IN ALPHA</div>
          <h3>Wallet Connect Read-Only</h3>
          <p>Connect Phantom to prepare wallet identity and $MEAL tier display. This alpha does not send transactions.</p>

          <div class="wallet-card">
            <div class="wallet-row"><span>Wallet</span><strong>${walletText}</strong></div>
            <div class="wallet-row"><span>Access Tier</span><strong>${tier}</strong></div>
            <div class="wallet-row"><span>Transaction Mode</span><strong>Disabled / read-only</strong></div>
          </div>

          <br />
          <button class="action-btn" id="connectWalletBtn">CONNECT PHANTOM</button>
          <div id="walletResult" style="margin-top:12px;"></div>
        </div>

        <div class="modal-panel">
          <h3>$MEAL Access Tiers</h3>
          <div class="roadmap">
            <div><strong>Visitor</strong> Demo access</div>
            <div><strong>Basic Kitchen</strong> 10,000 $MEAL</div>
            <div><strong>Grill Access</strong> 50,000 $MEAL</div>
            <div><strong>Golden Kitchen</strong> 250,000 $MEAL</div>
            <div><strong>Legendary Kitchen</strong> 1,000,000 $MEAL</div>
          </div>
        </div>
      </div>

      <div class="modal-grid">
        <div class="modal-panel">
          <h3>Backend Next</h3>
          <div class="roadmap">
            <div>Server wallet profile</div>
            <div>Daily claim per wallet</div>
            <div>Run submit API with anti-spam</div>
            <div>Craft + shop verification</div>
          </div>
        </div>

        <div class="modal-panel">
          <h3>Launch Status</h3>
          <div class="roadmap">
            <div>Hub: ready</div>
            <div>4 real games: connected</div>
            <div>Shared save: ready</div>
            <div>Wallet: read-only prepared</div>
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

    if (enter && start) {
      enter.addEventListener("click", () => {
        start.classList.add("hidden");
      });
    }

    if (how && howBox) {
      how.addEventListener("click", () => {
        howBox.classList.toggle("hidden");
      });
    }

    window.addEventListener("keydown", e => {
      if (!start || start.classList.contains("hidden")) return;
      if (e.key === "Enter") start.classList.add("hidden");
    });
  }


  setupStartScreen();
  requestAnimationFrame(loop);
})();
