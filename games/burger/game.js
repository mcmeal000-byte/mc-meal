(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;

  const COLORS = {
    bg: "#171923",
    wallA: "#1d1821",
    wallB: "#221b25",
    floor: "#f0a63a",
    floorDark: "#8b4a22",
    ladder: "#b06a32",
    ladderDark: "#6f351e",
    text: "#fff3d0",
    meal: "#ffce4a",
    green: "#67e89a",
    red: "#e95d45",
    blue: "#6bd0ff",
    black: "#0d0f14",
    white: "#fff8df",
    bun: "#d9903c",
    bunLight: "#f1be71",
    cheese: "#ffd74a",
    lettuce: "#69c94d",
    patty: "#6a3520",
    tomato: "#e45345",
    onion: "#d7d0ff",
    shadow: "rgba(0,0,0,0.18)"
  };

  const PLAY_TOP = 74;
  const PLAY_BOTTOM = 460;
  const TRAY_TOP = 490;
  const platforms = [130, 225, 320, 415];
  const ladders = [
    { x: 120, from: 0, to: 1 },
    { x: 315, from: 0, to: 2 },
    { x: 625, from: 0, to: 1 },
    { x: 190, from: 1, to: 3 },
    { x: 470, from: 1, to: 2 },
    { x: 705, from: 1, to: 3 },
    { x: 280, from: 2, to: 3 },
    { x: 560, from: 2, to: 3 }
  ];

  const LEVELS = [
    {
      title: "LEVEL 1",
      orderName: "CLASSIC BURGER",
      layers: ["topbun", "lettuce", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 225, 0],
        ["lettuce", 515, 1],
        ["cheese", 210, 2],
        ["patty", 490, 3],
        ["bottombun", 310, 3]
      ],
      enemies: [
        ["pickle", 150, 1, 72],
        ["fry", 635, 2, -88]
      ]
    },
    {
      title: "LEVEL 2",
      orderName: "CHEESE STACK",
      layers: ["topbun", "lettuce", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 500, 0],
        ["lettuce", 180, 1],
        ["cheese", 490, 1],
        ["patty", 245, 2],
        ["bottombun", 500, 3]
      ],
      enemies: [
        ["pickle", 145, 1, 90],
        ["fry", 630, 2, -104],
        ["pickle", 350, 3, 80]
      ]
    },
    {
      title: "LEVEL 3",
      orderName: "DELUXE TOMATO",
      layers: ["topbun", "lettuce", "tomato", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 160, 0],
        ["lettuce", 525, 0],
        ["tomato", 300, 1],
        ["cheese", 610, 2],
        ["patty", 210, 2],
        ["bottombun", 485, 3]
      ],
      enemies: [
        ["pickle", 130, 1, 106],
        ["fry", 625, 1, -118],
        ["pickle", 320, 2, 96],
        ["fry", 490, 3, -122]
      ]
    },
    {
      title: "LEVEL 4",
      orderName: "DOUBLE PATTY",
      layers: ["topbun", "lettuce", "cheese", "patty", "patty2", "bottombun"],
      placements: [
        ["topbun", 220, 0],
        ["lettuce", 505, 1],
        ["cheese", 200, 1],
        ["patty", 530, 2],
        ["patty2", 185, 3],
        ["bottombun", 470, 3]
      ],
      enemies: [
        ["pickle", 120, 1, 114],
        ["fry", 630, 1, -126],
        ["pickle", 285, 2, 104],
        ["fry", 520, 2, -132],
        ["pickle", 685, 3, -112]
      ]
    },
    {
      title: "LEVEL 5",
      orderName: "ULTIMATE MEAL",
      layers: ["topbun", "lettuce", "tomato", "onion", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 480, 0],
        ["lettuce", 150, 0],
        ["tomato", 360, 1],
        ["onion", 620, 1],
        ["cheese", 180, 2],
        ["patty", 505, 2],
        ["bottombun", 315, 3]
      ],
      enemies: [
        ["pickle", 125, 1, 120],
        ["fry", 645, 1, -136],
        ["pickle", 260, 2, 110],
        ["fry", 520, 2, -142],
        ["pickle", 160, 3, 116],
        ["fry", 690, 3, -124]
      ]
    }
    ,
    {
      title: "LEVEL 6",
      orderName: "MIDNIGHT DOUBLE",
      layers: ["topbun", "onion", "lettuce", "cheese", "patty", "patty2", "bottombun"],
      placements: [
        ["topbun", 125, 0],
        ["onion", 570, 0],
        ["lettuce", 250, 1],
        ["cheese", 640, 1],
        ["patty", 180, 2],
        ["patty2", 520, 2],
        ["bottombun", 355, 3]
      ],
      enemies: [
        ["pickle", 115, 1, 130],
        ["fry", 645, 1, -148],
        ["pickle", 275, 2, 122],
        ["fry", 530, 2, -152],
        ["pickle", 170, 3, 126],
        ["fry", 700, 3, -132]
      ]
    },
    {
      title: "LEVEL 7",
      orderName: "NEON CHEESE RUSH",
      layers: ["topbun", "cheese", "lettuce", "tomato", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 520, 0],
        ["cheese", 150, 0],
        ["lettuce", 360, 1],
        ["tomato", 620, 1],
        ["cheese", 210, 2],
        ["patty", 520, 3],
        ["bottombun", 300, 3]
      ],
      enemies: [
        ["pickle", 130, 1, 140],
        ["fry", 650, 1, -160],
        ["pickle", 305, 2, 136],
        ["fry", 505, 2, -160],
        ["pickle", 160, 3, 138],
        ["fry", 675, 3, -144]
      ]
    },
    {
      title: "LEVEL 8",
      orderName: "KITCHEN CHAOS",
      layers: ["topbun", "tomato", "onion", "lettuce", "cheese", "patty", "patty2", "bottombun"],
      placements: [
        ["topbun", 180, 0],
        ["tomato", 590, 0],
        ["onion", 315, 1],
        ["lettuce", 650, 1],
        ["cheese", 180, 2],
        ["patty", 480, 2],
        ["patty2", 230, 3],
        ["bottombun", 560, 3]
      ],
      enemies: [
        ["pickle", 110, 1, 150],
        ["fry", 670, 1, -170],
        ["pickle", 285, 2, 146],
        ["fry", 540, 2, -174],
        ["pickle", 135, 3, 148],
        ["fry", 700, 3, -152]
      ]
    },
    {
      title: "LEVEL 9",
      orderName: "GOLDEN GRILL",
      layers: ["topbun", "lettuce", "cheese", "tomato", "onion", "cheese", "patty", "bottombun"],
      placements: [
        ["topbun", 600, 0],
        ["lettuce", 150, 0],
        ["cheese", 380, 1],
        ["tomato", 655, 1],
        ["onion", 210, 2],
        ["cheese", 520, 2],
        ["patty", 160, 3],
        ["bottombun", 470, 3]
      ],
      enemies: [
        ["pickle", 105, 1, 160],
        ["fry", 680, 1, -182],
        ["pickle", 260, 2, 156],
        ["fry", 530, 2, -184],
        ["pickle", 150, 3, 158],
        ["fry", 710, 3, -164]
      ]
    },
    {
      title: "LEVEL 10",
      orderName: "LEGENDARY MC MEAL",
      layers: ["topbun", "lettuce", "tomato", "onion", "cheese", "patty", "patty2", "bottombun"],
      placements: [
        ["topbun", 140, 0],
        ["lettuce", 600, 0],
        ["tomato", 270, 1],
        ["onion", 520, 1],
        ["cheese", 160, 2],
        ["patty", 420, 2],
        ["patty2", 660, 3],
        ["bottombun", 300, 3]
      ],
      enemies: [
        ["pickle", 100, 1, 170],
        ["fry", 690, 1, -190],
        ["pickle", 275, 2, 166],
        ["fry", 535, 2, -196],
        ["pickle", 140, 3, 168],
        ["fry", 715, 3, -174]
      ]
    }

  ];

  const trayArea = {
    x: 220,
    y: 500,
    w: 360,
    h: 118,
    centerX: 400
  };

  const keys = Object.create(null);

  const state = {
    mode: "title",
    score: 0,
    lives: 3,
    timer: 0,
    lastTime: 0,
    result: null,
    daily: getDailyState(),
    message: "Press ENTER / Tap to start",
    sauceCooldown: 0,
    runFinished: false,
    level: 1,
    maxLevel: LEVELS.length
  };

  const player = {
    x: 384,
    y: platforms[3] - 34,
    w: 28,
    h: 34,
    speed: 170,
    level: 3,
    climbing: false,
    invincible: 0,
    dir: 1
  };

  const enemies = [];
  const ingredients = [];

  function getDailyState() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("mcmeal_last_play");
    const streak = Number(localStorage.getItem("mcmeal_streak") || "0");
    return { today, last, streak };
  }

  function updateDailyStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("mcmeal_last_play");
    let streak = Number(localStorage.getItem("mcmeal_streak") || "0");

    if (last !== today) {
      if (last) {
        const lastDate = new Date(last);
        const now = new Date(today);
        const diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
        streak = diffDays === 1 ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      localStorage.setItem("mcmeal_last_play", today);
      localStorage.setItem("mcmeal_streak", String(streak));
    }

    state.daily = getDailyState();
  }

  function makeEnemy(type, x, level, vx) {
    return {
      type,
      x,
      y: platforms[level] - 28,
      w: 26,
      h: 28,
      level,
      vx,
      stunned: 0,
      ladderCooldown: 0
    };
  }

  function displayName(kind) {
    const map = {
      topbun: "TOP BUN",
      bottombun: "BOTTOM BUN",
      lettuce: "LETTUCE",
      cheese: "CHEESE",
      patty: "PATTY",
      patty2: "PATTY",
      tomato: "TOMATO",
      onion: "ONION"
    };
    return map[kind] || kind.toUpperCase();
  }

  function makeIngredient(kind, x, level) {
    let width = 150;
    let height = 12;
    if (kind === "topbun" || kind === "bottombun") {
      width = 180;
      height = 18;
    } else if (kind === "patty" || kind === "patty2") {
      width = 150;
      height = 16;
    } else if (kind === "onion") {
      width = 145;
      height = 10;
    } else if (kind === "tomato") {
      width = 145;
      height = 10;
    }

    return {
      label: displayName(kind),
      kind,
      x,
      y: platforms[level] - height,
      w: width,
      h: height,
      level,
      segments: [false, false, false, false, false],
      falling: false,
      targetY: null,
      complete: false
    };
  }

  function resetRun() {
    state.score = 0;
    state.lives = 3;
    state.timer = 0;
    state.result = null;
    state.message = "";
    state.sauceCooldown = 0;
    state.runFinished = false;
    state.level = 1;
    setupLevel(1);
    state.mode = "play";
  }

  function setupLevel(levelNumber) {
    const lvl = LEVELS[levelNumber - 1];

    player.x = 384;
    player.level = 3;
    player.y = platforms[player.level] - player.h;
    player.climbing = false;
    player.invincible = 1.2;
    player.dir = 1;

    enemies.length = 0;
    lvl.enemies.forEach(e => enemies.push(makeEnemy(...e)));

    ingredients.length = 0;
    lvl.placements.forEach(([kind, x, level]) => ingredients.push(makeIngredient(kind, x, level)));

    state.message = `${lvl.title} started`;
    setTimeout(() => {
      if (state.mode === "play") state.message = "";
    }, 850);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function nearLadder() {
    return ladders.find(l => {
      const ladderTop = platforms[l.from] - 2;
      const ladderBottom = platforms[l.to] - 2;
      const px = player.x + player.w / 2;
      return Math.abs(px - l.x) < 24 && player.y + player.h > ladderTop - 16 && player.y < ladderBottom + 16;
    });
  }

  function nearestPlatformLevel(y) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < platforms.length; i++) {
      const d = Math.abs((platforms[i] - player.h) - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  function update(dt) {
    if (state.mode !== "play") return;

    state.timer += dt;
    state.sauceCooldown = Math.max(0, state.sauceCooldown - dt);
    player.invincible = Math.max(0, player.invincible - dt);

    updatePlayer(dt);
    updateIngredients(dt);
    updateEnemies(dt);
    checkLevelClear();
  }

  function updatePlayer(dt) {
    let moveX = 0;
    let moveY = 0;

    if (keys.ArrowLeft || keys.a) moveX -= 1;
    if (keys.ArrowRight || keys.d) moveX += 1;
    if (keys.ArrowUp || keys.w) moveY -= 1;
    if (keys.ArrowDown || keys.s) moveY += 1;

    if (moveX !== 0) player.dir = moveX;

    const ladder = nearLadder();
    if (ladder && moveY !== 0) {
      player.climbing = true;
      player.x += (ladder.x - (player.x + player.w / 2)) * Math.min(1, dt * 12);
    }

    if (player.climbing) {
      player.y += moveY * player.speed * dt;
      player.x += moveX * player.speed * 0.55 * dt;

      const topY = platforms[ladder ? ladder.from : 0] - player.h;
      const bottomY = platforms[ladder ? ladder.to : platforms.length - 1] - player.h;
      player.y = Math.max(topY, Math.min(bottomY, player.y));

      if (!ladder || (moveY === 0 && Math.abs((platforms[nearestPlatformLevel(player.y)] - player.h) - player.y) < 5)) {
        const lvl = nearestPlatformLevel(player.y);
        player.level = lvl;
        player.y = platforms[lvl] - player.h;
        player.climbing = false;
      }
    } else {
      player.x += moveX * player.speed * dt;
      player.y = platforms[player.level] - player.h;
    }

    player.x = Math.max(22, Math.min(W - player.w - 22, player.x));

    if ((keys.Space || keys[" "]) && state.sauceCooldown <= 0) {
      sauceThrow();
      state.sauceCooldown = 1.2;
    }
  }

  function sauceThrow() {
    const sauce = {
      x: player.dir > 0 ? player.x + player.w : player.x - 42,
      y: player.y + 10,
      w: 42,
      h: 16
    };

    let hit = false;
    enemies.forEach(e => {
      if (e.level === player.level && rectsOverlap(sauce, e)) {
        e.stunned = 2;
        state.score += 150;
        hit = true;
      }
    });

    if (hit) {
      state.message = "Sauce stun! +150";
      setTimeout(() => {
        if (state.mode === "play") state.message = "";
      }, 650);
    }
  }

  function updateIngredients(dt) {
    ingredients.forEach(ing => {
      if (ing.complete) return;

      if (ing.falling) {
        ing.y += 220 * dt;

        enemies.forEach(e => {
          if (e.stunned <= 0 && rectsOverlap(ing, e)) {
            e.stunned = 2.5;
            state.score += 250;
            state.message = "Enemy smashed! +250";
          }
        });

        if (ing.y >= ing.targetY) {
          ing.y = ing.targetY;
          ing.falling = false;
          ing.level += 1;

          if (ing.level >= platforms.length) {
            ing.complete = true;
            state.score += 300;
          } else {
            ing.segments = ing.segments.map(() => false);
          }
        }
        return;
      }

      if (player.level === ing.level && Math.abs(player.y + player.h - platforms[ing.level]) < 4) {
        const segW = ing.w / ing.segments.length;
        for (let i = 0; i < ing.segments.length; i++) {
          const seg = {
            x: ing.x + i * segW,
            y: ing.y - 4,
            w: segW,
            h: ing.h + 8
          };

          if (!ing.segments[i] && rectsOverlap(player, seg)) {
            ing.segments[i] = true;
            state.score += 10;
          }
        }

        if (ing.segments.every(Boolean)) {
          ing.falling = true;
          ing.targetY = ing.level + 1 >= platforms.length ? TRAY_TOP + 6 : platforms[ing.level + 1] - ing.h;
          state.score += 100;
          state.message = `${ing.label} dropped! +100`;
          setTimeout(() => {
            if (state.mode === "play") state.message = "";
          }, 650);
        }
      }
    });
  }

  function updateEnemies(dt) {
    enemies.forEach(e => {
      e.stunned = Math.max(0, e.stunned - dt);
      e.ladderCooldown = Math.max(0, e.ladderCooldown - dt);

      if (e.stunned <= 0) {
        e.x += e.vx * dt;

        if (e.x < 30 || e.x + e.w > W - 30) {
          e.vx *= -1;
          e.x = Math.max(30, Math.min(W - 30 - e.w, e.x));
        }

        const possible = ladders.filter(l => (l.from === e.level || l.to === e.level) && Math.abs((e.x + e.w / 2) - l.x) < 12);
        if (possible.length && e.ladderCooldown <= 0 && Math.random() < 0.018) {
          const l = possible[0];
          e.level = l.from === e.level ? l.to : l.from;
          e.y = platforms[e.level] - e.h;
          e.x = l.x - e.w / 2;
          e.ladderCooldown = 1.6;
          if (Math.random() < 0.45) e.vx *= -1;
        }
      }

      e.y = platforms[e.level] - e.h;

      if (player.invincible <= 0 && e.stunned <= 0 && rectsOverlap(player, e)) {
        loseLife();
      }
    });
  }

  function loseLife() {
    state.lives -= 1;
    player.invincible = 1.8;
    player.x = 384;
    player.level = 3;
    player.y = platforms[player.level] - player.h;
    player.climbing = false;

    if (state.lives <= 0) {
      finishRun(false);
    } else {
      state.message = `Ouch! Lives left: ${state.lives}`;
      setTimeout(() => {
        if (state.mode === "play") state.message = "";
      }, 800);
    }
  }

  function checkLevelClear() {
    if (!ingredients.every(i => i.complete)) return;

    state.score += 1000 * state.level;

    if (state.level < state.maxLevel) {
      state.mode = "levelclear";
    } else {
      finishRun(true);
    }
  }

  
  function postMCMealReward() {
    try {
      const result = state.result;
      if (!result || result._postedToHub) return;
      result._postedToHub = true;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "MCMEAL_GAME_RESULT",
          game: "Burger Stack",
          score: result.score || state.score || 0,
          won: !!result.won,
          levelsCleared: result.levelsCleared || state.level || 1,
          rewards: result.rewards || {}
        }, "*");
      }
    } catch (err) {}
  }

function finishRun(won) {
    if (state.runFinished) return;
    state.runFinished = true;
    updateDailyStreak();
    const rewards = calculateRewards(state.score, won);
    state.result = { won, score: state.score, rewards, levelsCleared: state.level };
    state.mode = "result";
    postMCMealReward();
  }

  function calculateRewards(score, won) {
    let dropCount = 1;
    let xp = 25;
    let ticketChance = 0;
    let fragmentChance = 0;

    if (score >= 1000) {
      dropCount = 2;
      xp = 50;
    }
    if (score >= 3000) {
      dropCount = 3;
      xp = 90;
      ticketChance = 5;
    }
    if (score >= 5000) {
      dropCount = 5;
      xp = 150;
      ticketChance = 10;
      fragmentChance = 1;
    }

    xp += (state.level - 1) * 35;
    ticketChance += (state.level - 1) * 2;
    fragmentChance += Math.max(0, state.level - 2) * 0.5;

    if (won) {
      xp += 100;
      ticketChance += 3;
    }

    const pool = ["Bun", "Patty", "Cheese", "Fries", "Soda", "Sauce"];
    const drops = [];
    for (let i = 0; i < dropCount; i++) drops.push(pool[Math.floor(Math.random() * pool.length)]);

    const gotTicket = Math.random() * 100 < ticketChance;
    const gotFragment = Math.random() * 100 < fragmentChance;

    return {
      drops,
      xp,
      ticketChance,
      fragmentChance,
      gotTicket,
      gotFragment,
      streak: Number(localStorage.getItem("mcmeal_streak") || "0")
    };
  }

  function nextLevel() {
    state.level += 1;
    setupLevel(state.level);
    state.mode = "play";
  }

  function draw() {
    drawBackground();

    if (state.mode === "title") {
      drawTitle();
      return;
    }

    drawKitchenWalls();
    drawLevel();
    drawIngredients();
    drawEnemies();
    drawTrayArea();
    drawBuiltBurger();
    drawOrderNameBelowTray();
    drawPlayer();
    drawHud();

    if (state.mode === "levelclear") drawLevelClear();
    if (state.mode === "result") drawResult();
  }

  function drawBackground() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#100d12";
    ctx.fillRect(0, 0, W, 66);
  }

  function drawKitchenWalls() {
    for (let y = PLAY_TOP; y < PLAY_BOTTOM; y += 34) {
      for (let x = 0; x < W; x += 52) {
        ctx.fillStyle = (x + y) % 104 === 0 ? COLORS.wallA : COLORS.wallB;
        ctx.fillRect(x, y, 48, 30);
      }
    }

    ctx.fillStyle = "#0a0b10";
    ctx.fillRect(0, PLAY_BOTTOM + 2, W, 8);
    ctx.fillRect(0, TRAY_TOP - 8, W, 8);
  }

  function drawTitle() {
    drawPixelText("MC MEAL", 210, 140, 54, COLORS.meal, "#74311f");
    drawPixelText("BURGER STACK", 170, 215, 34, COLORS.white, "#74311f");
    drawChefIcon(360, 290, 3);

    drawPanel(145, 378, 510, 162);
    ctx.fillStyle = COLORS.text;
    ctx.font = "18px Courier New";
    drawCenteredLines([
      "10 levels with increasing indie-kitchen chaos.",
      "New orders, faster enemies and bigger stacks.",
      "Order names now stay below the tray.",
      "Press ENTER or tap canvas to start"
    ], 400, 424, 28);
  }

  function drawLevel() {
    ladders.forEach(l => drawLadder(l.x, platforms[l.from], platforms[l.to]));

    platforms.forEach(y => {
      ctx.fillStyle = COLORS.floor;
      ctx.fillRect(22, y, W - 44, 10);
      ctx.fillStyle = COLORS.floorDark;
      ctx.fillRect(22, y + 10, W - 44, 8);

      for (let x = 22; x < W - 44; x += 34) {
        ctx.fillStyle = "#ffd066";
        ctx.fillRect(x, y, 18, 3);
      }
    });
  }

  function drawLadder(x, topPlatformY, bottomPlatformY) {
    ctx.fillStyle = COLORS.ladderDark;
    ctx.fillRect(x - 13, topPlatformY, 6, bottomPlatformY - topPlatformY);
    ctx.fillRect(x + 7, topPlatformY, 6, bottomPlatformY - topPlatformY);
    ctx.fillStyle = COLORS.ladder;
    for (let y = topPlatformY + 12; y < bottomPlatformY; y += 22) {
      ctx.fillRect(x - 13, y, 26, 5);
    }
  }

  function drawIngredients() {
    ingredients.forEach(ing => {
      if (ing.complete) return;
      const segW = ing.w / ing.segments.length;
      for (let i = 0; i < ing.segments.length; i++) {
        const x = ing.x + i * segW;
        drawBurgerLayer(ing.kind, x + 2, ing.y, segW - 4, ing.h, ing.segments[i]);
      }
    });
  }

  function drawTrayArea() {
    ctx.fillStyle = "#090b11";
    ctx.fillRect(0, TRAY_TOP, W, H - TRAY_TOP);

    drawPanel(trayArea.x, trayArea.y, trayArea.w, trayArea.h);

    ctx.fillStyle = COLORS.meal;
    ctx.font = "16px Courier New";
    const trayTitle = "ORDER TRAY";
    const titleW = ctx.measureText(trayTitle).width;
    ctx.fillText(trayTitle, trayArea.centerX - titleW / 2, trayArea.y + 20);

    ctx.fillStyle = "#c7c3b0";
    ctx.fillRect(trayArea.centerX - 88, trayArea.y + 84, 176, 8);
    ctx.fillStyle = "#77716a";
    ctx.fillRect(trayArea.centerX - 64, trayArea.y + 92, 128, 5);
  }

  function drawOrderNameBelowTray() {
    const levelData = LEVELS[state.level - 1];
    ctx.fillStyle = COLORS.white;
    ctx.font = "16px Courier New";
    const text = levelData.orderName;
    const metrics = ctx.measureText(text);
    ctx.fillText(text, trayArea.centerX - metrics.width / 2, trayArea.y + trayArea.h + 24);
  }

  function builtBurgerLayout() {
    const levelData = LEVELS[state.level - 1];
    const layers = levelData.layers;
    const baseY = trayArea.y + 92;
    const conf = [];
    let currentY = baseY;

    for (let i = layers.length - 1; i >= 0; i--) {
      const kind = layers[i];
      let h = 9;
      let w = 136;
      if (kind === "bottombun") { h = 16; w = 160; }
      else if (kind === "topbun") { h = 20; w = 160; }
      else if (kind === "patty" || kind === "patty2") { h = 12; w = 142; }
      else if (kind === "cheese") { h = 9; w = 132; }
      else if (kind === "lettuce") { h = 9; w = 146; }
      else if (kind === "tomato") { h = 8; w = 136; }
      else if (kind === "onion") { h = 7; w = 138; }
      currentY -= h;
      conf.unshift({ kind, x: trayArea.centerX - w / 2, y: currentY, w, h });
    }

    return conf;
  }

  function drawBuiltBurger() {
    const builtKinds = ingredients.filter(i => i.complete).map(i => i.kind);
    if (!builtKinds.length) return;

    const remaining = {};
    builtKinds.forEach(kind => {
      remaining[kind] = (remaining[kind] || 0) + 1;
    });

    builtBurgerLayout().forEach(layer => {
      const key = layer.kind;
      if ((remaining[key] || 0) > 0) {
        drawBurgerLayer(layer.kind, layer.x, layer.y, layer.w, layer.h, true);
        remaining[key] -= 1;
      }
    });
  }

  function drawBurgerLayer(kind, x, y, w, h, active = false) {
    if (kind === "topbun") {
      ctx.fillStyle = active ? COLORS.bunLight : COLORS.bun;
      ctx.fillRect(x, y + 4, w, h - 4);
      ctx.fillRect(x + 10, y, w - 20, 8);
      ctx.fillStyle = "#f9df94";
      for (let sx = x + 16; sx < x + w - 18; sx += 24) ctx.fillRect(sx, y + 5, 4, 2);
    } else if (kind === "bottombun") {
      ctx.fillStyle = active ? COLORS.bunLight : COLORS.bun;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#f9df94";
      ctx.fillRect(x + 12, y + 5, w - 24, 3);
    } else if (kind === "lettuce") {
      ctx.fillStyle = active ? "#92f06f" : COLORS.lettuce;
      for (let i = 0; i < w; i += 18) ctx.fillRect(x + i, y + ((i / 18) % 2 === 0 ? 2 : 0), 16, Math.max(6, h - 2));
    } else if (kind === "cheese") {
      ctx.fillStyle = active ? "#fff06d" : COLORS.cheese;
      ctx.fillRect(x, y, w, h);
      ctx.fillRect(x + 12, y + h - 1, 12, 4);
      ctx.fillRect(x + w - 24, y + h - 1, 12, 4);
    } else if (kind === "patty" || kind === "patty2") {
      ctx.fillStyle = active ? "#925234" : COLORS.patty;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#4b1f10";
      ctx.fillRect(x + 6, y + h - 3, w - 12, 3);
    } else if (kind === "tomato") {
      ctx.fillStyle = active ? "#ff726a" : COLORS.tomato;
      for (let i = 0; i < w; i += 20) ctx.fillRect(x + i, y, 16, h);
    } else if (kind === "onion") {
      ctx.fillStyle = active ? "#f0ebff" : COLORS.onion;
      for (let i = 0; i < w; i += 18) ctx.fillRect(x + i, y + (i % 36 === 0 ? 0 : 1), 14, h - 1);
    }
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(x, y + h, w, 2);
  }

  function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible * 12) % 2 === 0) return;
    drawChefIcon(player.x - 5, player.y - 4, 1);
  }

  function drawChefIcon(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(x + 2*u, y, 5*u, 2*u);
    ctx.fillRect(x + 1*u, y + 1*u, 7*u, 2*u);
    ctx.fillStyle = "#f0ad72";
    ctx.fillRect(x + 2*u, y + 3*u, 5*u, 4*u);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(x + 3*u, y + 4*u, u, u);
    ctx.fillRect(x + 6*u, y + 4*u, u, u);
    ctx.fillStyle = "#6a3520";
    ctx.fillRect(x + 4*u, y + 6*u, 2*u, u);
    ctx.fillStyle = "#2e9bff";
    ctx.fillRect(x + 2*u, y + 7*u, 5*u, 4*u);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(x + 4*u, y + 7*u, u, 4*u);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(x + 2*u, y + 11*u, 2*u, 2*u);
    ctx.fillRect(x + 5*u, y + 11*u, 2*u, 2*u);
  }

  function drawEnemies() {
    enemies.forEach(e => {
      ctx.fillStyle = e.stunned > 0 && Math.floor(e.stunned * 10) % 2 === 0 ? "#ffffff" : (e.type === "pickle" ? "#4ac85d" : "#f0c04a");
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = COLORS.black;
      ctx.fillRect(e.x + 6, e.y + 7, 5, 5);
      ctx.fillRect(e.x + 17, e.y + 7, 5, 5);
      ctx.fillRect(e.x + 7, e.y + 19, 14, 4);

      if (e.type === "fry") {
        ctx.fillStyle = "#c94832";
        ctx.fillRect(e.x + 2, e.y - 6, 5, 10);
        ctx.fillRect(e.x + 10, e.y - 10, 5, 12);
        ctx.fillRect(e.x + 18, e.y - 5, 5, 9);
      }
    });
  }

  function drawHud() {
    ctx.fillStyle = "#100d12";
    ctx.fillRect(0, 0, W, 66);
    ctx.fillStyle = COLORS.meal;
    ctx.font = "22px Courier New";
    ctx.fillText("MC MEAL: BURGER STACK", 20, 26);

    ctx.fillStyle = COLORS.text;
    ctx.font = "18px Courier New";
    ctx.fillText(`Score ${state.score}`, 20, 54);
    ctx.fillText(`Lives ${state.lives}`, 170, 54);
    ctx.fillText(`Level ${state.level}/${state.maxLevel}`, 300, 54);
    ctx.fillText(`Time ${Math.floor(state.timer)}s`, 470, 54);
    ctx.fillText(`Stack ${ingredients.filter(i => i.complete).length}/${ingredients.length}`, 620, 54);

    if (state.message) {
      ctx.fillStyle = COLORS.green;
      ctx.font = "16px Courier New";
      ctx.fillText(state.message, 470, 26);
    }

    if (state.sauceCooldown > 0) {
      ctx.fillStyle = "#e28b70";
      ctx.font = "14px Courier New";
      ctx.fillText(`Sauce ${state.sauceCooldown.toFixed(1)}`, 675, 26);
    }
  }

  function drawLevelClear() {
    const next = Math.min(state.level + 1, state.maxLevel);
    drawPanel(135, 168, 530, 214);
    ctx.fillStyle = COLORS.green;
    ctx.font = "30px Courier New";
    drawCenteredLines([`${LEVELS[state.level - 1].title} COMPLETE!`], 400, 222, 30);

    ctx.fillStyle = COLORS.text;
    ctx.font = "18px Courier New";
    drawCenteredLines([`Score Bonus Added: ${1000 * state.level}`], 400, 268, 26);
    const nextLines = wrapText(`Next Order: ${LEVELS[next - 1].orderName}`, 360);
    drawCenteredLines(nextLines, 400, 296, 24);
    drawCenteredLines([
      "Enemies get faster.",
      "New burger variation unlocked.",
      "Press ENTER / Tap for next level"
    ], 400, 324 + (nextLines.length - 1) * 22, 24);
  }

  function drawResult() {
    drawPanel(100, 90, 600, 420);
    const r = state.result;
    ctx.fillStyle = r.won ? COLORS.green : COLORS.red;
    ctx.font = "34px Courier New";
    ctx.fillText(r.won ? "SHIFT COMPLETE!" : "KITCHEN CLOSED!", 185, 140);

    ctx.fillStyle = COLORS.text;
    ctx.font = "20px Courier New";
    ctx.fillText(`Final Score: ${r.score}`, 170, 186);
    ctx.fillText(`Levels Cleared: ${r.levelsCleared}/${state.maxLevel}`, 170, 216);
    ctx.fillText(`XP Earned: ${r.rewards.xp}`, 170, 246);
    ctx.fillText(`Daily Streak: ${r.rewards.streak}`, 170, 276);

    ctx.fillStyle = COLORS.meal;
    ctx.fillText("Ingredient Drops:", 170, 320);
    ctx.fillStyle = COLORS.text;
    ctx.fillText(r.rewards.drops.join(", "), 170, 350);

    let y = 386;
    if (r.rewards.gotTicket) {
      ctx.fillStyle = COLORS.green;
      ctx.fillText("Bonus: Mystery Order Ticket!", 170, y);
      y += 28;
    } else {
      ctx.fillStyle = "#b9a88a";
      ctx.fillText(`Ticket chance rolled: ${r.rewards.ticketChance}%`, 170, y);
      y += 28;
    }

    if (r.rewards.gotFragment) {
      ctx.fillStyle = COLORS.green;
      ctx.fillText("Ultra Bonus: Rare Recipe Fragment!", 170, y);
      y += 28;
    }

    ctx.fillStyle = COLORS.white;
    ctx.font = "18px Courier New";
    ctx.fillText("Return to Arcade to play again", 170, 470);
  }

  function drawPanel(x, y, w, h) {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = COLORS.floor;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = COLORS.floorDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  }

  function drawPixelText(text, x, y, size, color, shadow) {
    ctx.font = `${size}px Courier New`;
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + 4, y + 4);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function wrapText(text, maxWidth) {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) line = test;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawCenteredLines(lines, centerX, startY, lineHeight) {
    lines.forEach((line, idx) => {
      const w = ctx.measureText(line).width;
      ctx.fillText(line, centerX - w / 2, startY + idx * lineHeight);
    });
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - state.lastTime) / 1000 || 0);
    state.lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function handlePrimaryAction() {
    if (state.mode === "title") {
      resetRun();
    } else if (state.mode === "result") {
      return;
    } else if (state.mode === "levelclear") {
      nextLevel();
    }
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = true;
    if (e.key === "Enter") handlePrimaryAction();
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = false;
  });

  canvas.addEventListener("pointerdown", () => handlePrimaryAction());

  document.querySelectorAll("[data-key]").forEach(btn => {
    const key = btn.getAttribute("data-key");
    const down = (e) => {
      e.preventDefault();
      keys[key] = true;
      if (key === "Space") keys[" "] = true;
    };
    const up = (e) => {
      e.preventDefault();
      keys[key] = false;
      if (key === "Space") keys[" "] = false;
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointerleave", up);
    btn.addEventListener("pointercancel", up);
  });

  requestAnimationFrame(loop);
})();
