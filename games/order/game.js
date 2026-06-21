(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;

  const C = {
    bg: "#171923",
    panel: "#0f1118",
    wallA: "#1b1721",
    wallB: "#211923",
    floor: "#f0a63a",
    floorDark: "#8b4a22",
    text: "#fff3d0",
    meal: "#ffce4a",
    green: "#67e89a",
    red: "#e95d45",
    blue: "#36b6ff",
    cyan: "#52f0cf",
    black: "#0d0f14",
    white: "#fff8df",
    bun: "#d9903c",
    lettuce: "#69c94d",
    cheese: "#ffd74a",
    patty: "#6a3520",
    tomato: "#e45345",
    fries: "#f4c34f",
    soda: "#9d4dff",
    sauce: "#e45345",
    skin: "#f3c9a5",
    skinDark: "#b87e5a"
  };

  const ITEMS = [
    { id: "bun", name: "Bun" },
    { id: "patty", name: "Patty" },
    { id: "cheese", name: "Cheese" },
    { id: "lettuce", name: "Lettuce" },
    { id: "tomato", name: "Tomato" },
    { id: "fries", name: "Fries" },
    { id: "soda", name: "Soda" },
    { id: "sauce", name: "Sauce" }
  ];

  const LEVELS = [
    { name: "LEVEL 1", order: "CLASSIC ORDER", time: 55, goal: 3, speed: 72, spawn: 1.50, min: 3, max: 4 },
    { name: "LEVEL 2", order: "LUNCH RUSH", time: 55, goal: 4, speed: 88, spawn: 1.25, min: 4, max: 5 },
    { name: "LEVEL 3", order: "DELUXE BAG", time: 60, goal: 5, speed: 104, spawn: 1.05, min: 4, max: 6 },
    { name: "LEVEL 4", order: "NIGHT COMBO", time: 60, goal: 6, speed: 122, spawn: 0.92, min: 5, max: 7 },
    { name: "LEVEL 5", order: "SECRET MENU", time: 65, goal: 7, speed: 140, spawn: 0.82, min: 6, max: 8 }
  ];

  const RECIPES = [
    ["bun", "patty", "cheese"],
    ["bun", "patty", "lettuce", "sauce"],
    ["fries", "sauce", "soda"],
    ["bun", "patty", "tomato", "cheese"],
    ["bun", "patty", "cheese", "fries", "soda"],
    ["bun", "patty", "lettuce", "tomato", "soda"],
    ["fries", "soda", "sauce", "sauce"]
  ];

  const keys = Object.create(null);
  const beltY = 334;
  const beltItems = [];
  const trayItems = [];

  const hand = {
    x: W / 2,
    y: 258,
    speed: 300,
    grabCooldown: 0,
    flash: 0
  };

  const state = {
    mode: "title",
    level: 1,
    maxLevel: LEVELS.length,
    score: 0,
    lives: 4,
    combo: 0,
    bestCombo: 0,
    timer: 55,
    spawnTimer: 0,
    ordersDone: 0,
    current: null,
    lastTime: 0,
    message: "",
    runFinished: false,
    result: null,
    daily: getDaily()
  };

  function getDaily() {
    return {
      today: new Date().toDateString(),
      last: localStorage.getItem("mcmeal_order_rush_last_play"),
      streak: Number(localStorage.getItem("mcmeal_order_rush_streak") || "0")
    };
  }

  function updateStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("mcmeal_order_rush_last_play");
    let streak = Number(localStorage.getItem("mcmeal_order_rush_streak") || "0");
    if (last !== today) {
      if (last) {
        const diff = Math.round((new Date(today) - new Date(last)) / 86400000);
        streak = diff === 1 ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      localStorage.setItem("mcmeal_order_rush_last_play", today);
      localStorage.setItem("mcmeal_order_rush_streak", String(streak));
    }
    state.daily = getDaily();
  }

  function resetRun() {
    state.mode = "play";
    state.level = 1;
    state.score = 0;
    state.lives = 4;
    state.combo = 0;
    state.bestCombo = 0;
    state.result = null;
    state.runFinished = false;
    setupLevel(1);
  }

  function setupLevel(n) {
    const lv = LEVELS[n - 1];
    state.timer = lv.time;
    state.spawnTimer = 0.5;
    state.ordersDone = 0;
    state.message = lv.name + " started";
    hand.x = W / 2;
    hand.grabCooldown = 0;
    hand.flash = 0;
    beltItems.length = 0;
    trayItems.length = 0;
    newOrder();
    setTimeout(() => {
      if (state.mode === "play") state.message = "";
    }, 900);
  }

  function newOrder() {
    const lv = LEVELS[state.level - 1];
    const count = lv.min + Math.floor(Math.random() * (lv.max - lv.min + 1));
    let req = RECIPES[Math.floor(Math.random() * Math.min(RECIPES.length, state.level + 2))].slice();
    const pool = ITEMS.map(i => i.id);
    while (req.length < count) {
      req.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    req = req.slice(0, count);
    state.current = { required: req, index: 0 };
    trayItems.length = 0;
  }

  function update(dt) {
    if (state.mode !== "play") return;

    state.timer -= dt;
    state.spawnTimer -= dt;
    hand.grabCooldown = Math.max(0, hand.grabCooldown - dt);
    hand.flash = Math.max(0, hand.flash - dt);

    moveHand(dt);
    spawnBeltItem();
    updateBelt(dt);

    if (state.timer <= 0) finishRun(false);
  }

  function moveHand(dt) {
    let dir = 0;
    if (keys.ArrowLeft || keys.a) dir -= 1;
    if (keys.ArrowRight || keys.d) dir += 1;
    hand.x += dir * hand.speed * dt;
    hand.x = Math.max(55, Math.min(W - 55, hand.x));

    if ((keys.Space || keys[" "]) && hand.grabCooldown <= 0) {
      pickItem();
      hand.grabCooldown = 0.22;
    }
  }

  function spawnBeltItem() {
    const lv = LEVELS[state.level - 1];
    if (state.spawnTimer > 0 || beltItems.length > 8) return;

    const needed = state.current.required[state.current.index];
    let id;
    const shouldSpawnNeeded = Math.random() < 0.48 + state.level * 0.02;
    if (shouldSpawnNeeded) {
      id = needed;
    } else {
      id = ITEMS[Math.floor(Math.random() * ITEMS.length)].id;
    }

    beltItems.push({
      id,
      x: W + 40,
      y: beltY,
      w: 44,
      h: 44,
      speed: lv.speed + Math.random() * 28
    });

    state.spawnTimer = lv.spawn * (0.75 + Math.random() * 0.60);
  }

  function updateBelt(dt) {
    for (let i = beltItems.length - 1; i >= 0; i--) {
      const item = beltItems[i];
      item.x -= item.speed * dt;
      if (item.x < -70) beltItems.splice(i, 1);
    }
  }

  function pickItem() {
    let best = null;
    let bestDist = Infinity;

    for (const item of beltItems) {
      const center = item.x + item.w / 2;
      const dist = Math.abs(center - hand.x);
      if (dist < bestDist && dist < 42) {
        best = item;
        bestDist = dist;
      }
    }

    if (!best) {
      hand.flash = 0.18;
      msg("Miss!");
      return;
    }

    const idx = beltItems.indexOf(best);
    if (idx >= 0) beltItems.splice(idx, 1);

    const need = state.current.required[state.current.index];
    if (best.id === need) {
      state.current.index++;
      state.combo++;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.score += 140 + Math.min(600, state.combo * 20);
      trayItems.push({ id: best.id, good: true });
      hand.flash = 0.18;

      if (state.current.index >= state.current.required.length) {
        completeOrder();
      } else {
        msg("Good pick!");
      }
    } else {
      state.lives--;
      state.combo = 0;
      trayItems.push({ id: best.id, good: false });
      hand.flash = 0.18;
      msg("Wrong item! -1 life");
      if (state.lives <= 0) finishRun(false);
    }
  }

  function completeOrder() {
    state.ordersDone++;
    state.score += 700 + state.level * 140 + state.combo * 20;
    msg("Order complete!");
    if (state.ordersDone >= LEVELS[state.level - 1].goal) {
      clearLevel();
    } else {
      setTimeout(() => {
        if (state.mode === "play") newOrder();
      }, 500);
    }
  }

  function clearLevel() {
    state.score += state.level * 900;
    if (state.level < state.maxLevel) {
      state.mode = "levelclear";
      beltItems.length = 0;
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
          game: "Mystery Order Rush",
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
    updateStreak();
    state.result = {
      won,
      score: state.score,
      levelsCleared: state.level,
      rewards: calcRewards(won)
    };
    state.mode = "result";
    postMCMealReward();
    beltItems.length = 0;
  }

  function calcRewards(won) {
    let xp = 40, ticket = 0, frag = 0;
    const drops = ["Mystery Ticket"];

    if (state.score >= 2500) {
      xp = 85;
      ticket = 8;
      drops.push("Sauce");
    }
    if (state.score >= 6000) {
      xp = 150;
      ticket = 16;
      frag = 1;
      drops.push("Recipe Fragment");
    }
    if (state.score >= 10000) {
      xp = 240;
      ticket = 25;
      frag = 2;
      drops.push("Secret Receipt");
    }
    xp += (state.level - 1) * 45;
    ticket += (state.level - 1) * 2;
    if (won) {
      xp += 140;
      ticket += 5;
      drops.push("Craft Entry");
    }
    if (state.bestCombo >= 12) drops.push("Combo Stamp");

    return {
      drops,
      xp,
      ticketChance: ticket,
      fragmentChance: frag,
      gotTicket: Math.random() * 100 < ticket,
      gotFragment: Math.random() * 100 < frag,
      streak: Number(localStorage.getItem("mcmeal_order_rush_streak") || "0"),
      bestCombo: state.bestCombo
    };
  }

  function msg(text) {
    state.message = text;
    setTimeout(() => {
      if (state.mode === "play") state.message = "";
    }, 650);
  }

  function draw() {
    drawBackground();
    if (state.mode === "title") {
      drawTitle();
      return;
    }
    drawKitchen();
    drawOrderTicket();
    drawConveyor();
    drawBeltItems();
    drawHand();
    drawTray();
    drawHud();
    if (state.mode === "levelclear") drawLevelClear();
    if (state.mode === "result") drawResult();
  }

  function drawBackground() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#100d12";
    ctx.fillRect(0, 0, W, 66);
  }

  function drawKitchen() {
    ctx.fillStyle = "#0e1017";
    ctx.fillRect(0, 66, W, 510);
    for (let y = 80; y < 570; y += 38) {
      for (let x = 0; x < W; x += 52) {
        ctx.fillStyle = (x + y) % 104 === 0 ? C.wallA : C.wallB;
        ctx.fillRect(x, y, 48, 34);
      }
    }
    ctx.fillStyle = "#090b11";
    ctx.fillRect(0, 575, W, 85);
    ctx.fillStyle = C.floorDark;
    ctx.fillRect(0, 575, W, 8);
  }

  function drawHud() {
    const lv = LEVELS[state.level - 1];
    ctx.fillStyle = "#100d12";
    ctx.fillRect(0, 0, W, 66);
    ctx.fillStyle = C.meal;
    ctx.font = "22px Courier New";
    ctx.fillText("MC MEAL: MYSTERY ORDER RUSH", 20, 26);
    ctx.fillStyle = C.text;
    ctx.font = "18px Courier New";
    ctx.fillText(`Score ${state.score}`, 20, 54);
    ctx.fillText(`Lives ${state.lives}`, 165, 54);
    ctx.fillText(`Level ${state.level}/${state.maxLevel}`, 285, 54);
    ctx.fillText(`Time ${Math.ceil(state.timer)}s`, 455, 54);
    ctx.fillText(`Orders ${state.ordersDone}/${lv.goal}`, 610, 54);
    if (state.message) {
      ctx.fillStyle = C.green;
      ctx.font = "16px Courier New";
      ctx.fillText(state.message, 455, 26);
    }
    ctx.fillStyle = C.white;
    ctx.font = "13px Courier New";
    ctx.fillText(lv.order, 20, 82);
  }

  function drawTitle() {
    drawPixelText("MC MEAL", 210, 140, 54, C.meal, "#74311f");
    drawPixelText("MYSTERY ORDER", 150, 215, 38, C.white, "#74311f");
    drawMysteryBox(354, 285, 2.2);
    drawPanel(120, 385, 560, 150);
    ctx.fillStyle = C.text;
    ctx.font = "19px Courier New";
    ctx.fillText("Ingredients move on the conveyor belt.", 180, 430);
    ctx.fillText("Move the hand and PICK the correct sequence.", 155, 462);
    ctx.fillText("Wrong items hit the tray and cost lives.", 190, 494);
    ctx.fillText("Press ENTER or tap canvas to start", 210, 524);
  }

  function drawOrderTicket() {
    drawPanel(70, 96, 660, 130);
    ctx.fillStyle = C.meal;
    ctx.font = "20px Courier New";
    ctx.fillText("CUSTOMER ORDER TICKET", 250, 128);
    const req = state.current.required;
    const startX = 115;
    for (let i = 0; i < req.length; i++) {
      const x = startX + i * 70;
      const y = 154;
      drawIcon(req[i], x, y, 1.08);
      if (i < state.current.index) {
        ctx.strokeStyle = C.green;
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 5, y - 5, 48, 48);
      } else if (i === state.current.index) {
        ctx.strokeStyle = C.meal;
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 6, y - 6, 50, 50);
      }
    }
    ctx.fillStyle = C.text;
    ctx.font = "16px Courier New";
    ctx.fillText(`Step ${Math.min(state.current.index + 1, req.length)} / ${req.length}`, 340, 213);
  }

  function drawConveyor() {
    ctx.fillStyle = C.floor;
    ctx.fillRect(60, 330, W - 120, 18);
    ctx.fillStyle = C.floorDark;
    ctx.fillRect(60, 348, W - 120, 12);
    for (let x = 74; x < W - 80; x += 46) {
      ctx.fillStyle = "#ffd066";
      ctx.fillRect(x, 334, 22, 3);
    }
    ctx.fillStyle = C.text;
    ctx.font = "14px Courier New";
    ctx.fillText("MOVING INGREDIENT BELT", 285, 315);
  }

  function drawBeltItems() {
    for (const item of beltItems) {
      drawIcon(item.id, item.x, item.y - 24, 1.15);
    }
  }

  function drawHand() {
    const x = Math.round(hand.x);
    const y = hand.y;
    ctx.strokeStyle = hand.flash > 0 ? C.green : C.cyan;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 228);
    ctx.lineTo(x, y - 6);
    ctx.stroke();

    // wrist cuff
    ctx.fillStyle = C.white;
    ctx.fillRect(x - 18, y - 8, 36, 14);
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(x - 18, y + 2, 36, 4);

    // palm
    ctx.fillStyle = C.skin;
    ctx.fillRect(x - 14, y + 6, 28, 22);
    ctx.fillStyle = C.skinDark;
    ctx.fillRect(x - 14, y + 24, 28, 4);

    // fingers down (grabbing feel)
    ctx.fillStyle = C.skin;
    ctx.fillRect(x - 12, y + 28, 6, 18);
    ctx.fillRect(x - 3, y + 28, 6, 16);
    ctx.fillRect(x + 6, y + 28, 6, 14);

    // thumb
    ctx.fillRect(x - 19, y + 16, 7, 16);
    ctx.fillStyle = C.skinDark;
    ctx.fillRect(x - 19, y + 28, 7, 4);

    // finger shading
    ctx.fillStyle = C.skinDark;
    ctx.fillRect(x - 12, y + 42, 6, 4);
    ctx.fillRect(x - 3, y + 40, 6, 4);
    ctx.fillRect(x + 6, y + 38, 6, 4);
  }

  function drawTray() {
    drawPanel(80, 430, 640, 125);
    ctx.fillStyle = C.meal;
    ctx.font = "17px Courier New";
    ctx.fillText("YOUR ORDER TRAY", 315, 458);
    const startX = 105;
    for (let i = 0; i < trayItems.length; i++) {
      const item = trayItems[i];
      const x = startX + i * 58;
      const y = 485;
      drawIcon(item.id, x, y, 0.95);
      ctx.strokeStyle = item.good ? C.green : C.red;
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 4, y - 4, 43, 43);
    }
    ctx.fillStyle = C.text;
    ctx.font = "13px Courier New";
    ctx.fillText("Correct picks build combo. Wrong picks stay red and cost lives.", 175, 542);
  }

  function drawLevelClear() {
    const next = Math.min(state.level + 1, state.maxLevel);
    drawPanel(150, 190, 500, 200);
    ctx.fillStyle = C.green;
    ctx.font = "30px Courier New";
    ctx.fillText(`${LEVELS[state.level - 1].name} COMPLETE!`, 180, 235);
    ctx.fillStyle = C.text;
    ctx.font = "19px Courier New";
    ctx.fillText(`Score Bonus Added: ${state.level * 900}`, 210, 280);
    ctx.fillText(`Next Order: ${LEVELS[next - 1].order}`, 205, 310);
    ctx.fillText("Faster belt. Longer orders. More pressure.", 185, 342);
    ctx.fillText("Press ENTER / Tap for next level", 205, 370);
  }

  function drawResult() {
    drawPanel(90, 80, 620, 470);
    const r = state.result;
    ctx.fillStyle = r.won ? C.green : C.red;
    ctx.font = "34px Courier New";
    ctx.fillText(r.won ? "ORDER SHIFT COMPLETE!" : "KITCHEN CLOSED!", 118, 132);
    ctx.fillStyle = C.text;
    ctx.font = "20px Courier New";
    ctx.fillText(`Final Score: ${r.score}`, 160, 178);
    ctx.fillText(`Levels Cleared: ${r.levelsCleared}/${state.maxLevel}`, 160, 208);
    ctx.fillText(`Best Combo: ${r.rewards.bestCombo}`, 160, 238);
    ctx.fillText(`XP Earned: ${r.rewards.xp}`, 160, 268);
    ctx.fillText(`Daily Streak: ${r.rewards.streak}`, 160, 298);
    ctx.fillStyle = C.meal;
    ctx.fillText("Reward Drops:", 160, 340);
    ctx.fillStyle = C.text;
    ctx.font = "18px Courier New";
    const lines = wrapLines(r.rewards.drops.join(", "), 390);
    let y = 370;
    lines.forEach(line => { ctx.fillText(line, 160, y); y += 24; });
    y += 10;
    if (r.rewards.gotTicket) {
      ctx.fillStyle = C.green;
      ctx.fillText("Bonus: Mystery Order Ticket!", 160, y);
      y += 28;
    } else {
      ctx.fillStyle = "#b9a88a";
      ctx.fillText(`Ticket chance rolled: ${r.rewards.ticketChance}%`, 160, y);
      y += 28;
    }
    if (r.rewards.gotFragment) {
      ctx.fillStyle = C.green;
      ctx.fillText("Ultra Bonus: Rare Recipe Fragment!", 160, y);
      y += 28;
    }
    ctx.fillStyle = C.white;
    ctx.font = "18px Courier New";
    ctx.fillText("Press ENTER / Tap to play again", 160, 520);
  }

  function drawPanel(x, y, w, h) {
    ctx.fillStyle = C.panel;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.floor;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = C.floorDark;
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

  function wrapLines(text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) line = test;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawIcon(id, x, y, s) {
    if (id === "bun") drawBun(x, y, s);
    else if (id === "patty") drawPatty(x, y, s);
    else if (id === "cheese") drawCheese(x, y, s);
    else if (id === "lettuce") drawLettuce(x, y, s);
    else if (id === "tomato") drawTomato(x, y, s);
    else if (id === "fries") drawFries(x, y, s);
    else if (id === "soda") drawSoda(x, y, s);
    else drawSauce(x, y, s);
  }

  function drawBun(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.bun;
    ctx.fillRect(x, y + 4 * u, 10 * u, 5 * u);
    ctx.fillRect(x + u, y + 2 * u, 8 * u, 4 * u);
    ctx.fillStyle = "#f9df94";
    ctx.fillRect(x + 2 * u, y + 4 * u, u, u);
    ctx.fillRect(x + 6 * u, y + 3 * u, u, u);
  }
  function drawPatty(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.patty;
    ctx.fillRect(x, y + 4 * u, 10 * u, 4 * u);
    ctx.fillStyle = "#4b1f10";
    ctx.fillRect(x + u, y + 7 * u, 8 * u, u);
  }
  function drawCheese(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.cheese;
    ctx.fillRect(x, y + 4 * u, 10 * u, 3 * u);
    ctx.fillRect(x + 2 * u, y + 7 * u, 2 * u, 2 * u);
    ctx.fillRect(x + 7 * u, y + 7 * u, 2 * u, 2 * u);
  }
  function drawLettuce(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.lettuce;
    for (let i = 0; i < 10; i += 2) ctx.fillRect(x + i * u, y + (4 + (i % 4)) * u, 2 * u, 2 * u);
  }
  function drawTomato(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.tomato;
    ctx.fillRect(x + u, y + 4 * u, 8 * u, 3 * u);
    ctx.fillStyle = "#ff8a80";
    ctx.fillRect(x + 3 * u, y + 5 * u, u, u);
    ctx.fillRect(x + 6 * u, y + 5 * u, u, u);
  }
  function drawFries(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.red;
    ctx.fillRect(x + 2 * u, y + 6 * u, 7 * u, 5 * u);
    ctx.fillStyle = C.fries;
    for (let i = 0; i < 5; i++) ctx.fillRect(x + (2 + i * 1.3) * u, y + (i % 2) * u, u, 7 * u);
  }
  function drawSoda(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.white;
    ctx.fillRect(x + 2 * u, y + 2 * u, 7 * u, 10 * u);
    ctx.fillStyle = C.blue;
    ctx.fillRect(x + 3 * u, y + 6 * u, 5 * u, 5 * u);
    ctx.fillStyle = C.red;
    ctx.fillRect(x + 4 * u, y + 4 * u, 3 * u, u);
  }
  function drawSauce(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.sauce;
    ctx.fillRect(x + 2 * u, y + 3 * u, 6 * u, 7 * u);
    ctx.fillStyle = C.white;
    ctx.fillRect(x + 3 * u, y + 2 * u, 4 * u, 2 * u);
  }
  function drawMysteryBox(x, y, s) {
    const u = 4 * s;
    ctx.fillStyle = C.floor;
    ctx.fillRect(x, y + 4 * u, 16 * u, 14 * u);
    ctx.fillStyle = C.floorDark;
    ctx.fillRect(x + u, y + 6 * u, 14 * u, 11 * u);
    ctx.fillStyle = C.meal;
    ctx.font = `${16 * s}px Courier New`;
    ctx.fillText("?", x + 6 * u, y + 15 * u);
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - state.lastTime) / 1000 || 0);
    state.lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function action() {
    if (state.mode === "title" || state.mode === "result") resetRun();
    else if (state.mode === "levelclear") { state.level++; setupLevel(state.level); state.mode = "play"; }
  }

  window.addEventListener("keydown", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = true;
    if (e.key === "Enter") action();
    if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  });

  window.addEventListener("keyup", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = false;
  });

  canvas.addEventListener("pointerdown", () => action());

  document.querySelectorAll("[data-key]").forEach(btn => {
    const key = btn.getAttribute("data-key");
    const down = e => { e.preventDefault(); keys[key] = true; if (key === "Space") keys[" "] = true; };
    const up = e => { e.preventDefault(); keys[key] = false; if (key === "Space") keys[" "] = false; };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointerleave", up);
    btn.addEventListener("pointercancel", up);
  });

  requestAnimationFrame(loop);
})();