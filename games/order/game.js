(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;

  const C = {
    bg:"#171018", black:"#0d0f14", ink:"#201318",
    wall:"#8e2a27", wall2:"#70201e", wallDark:"#4a1716",
    floor:"#d4b873", floor2:"#c7a762", grout:"#8f7242",
    steel:"#9da5ad", steel2:"#69717a", steel3:"#3f464d",
    paper:"#fff4d8", cream:"#fff3d0", gold:"#f3b63f", meal:"#ffce4a",
    red:"#e95d45", red2:"#a8322a", green:"#69d568", green2:"#3f9a3d",
    cyan:"#52f0cf", blue:"#36b6ff",
    wood:"#8a5a32", wood2:"#6b4423",
    bun:"#e2a545", bunLight:"#f3d17a",
    patty:"#6a3520", pattyCooked:"#8d512c", pattyBurnt:"#20110b",
    cheese:"#ffd74a", lettuce:"#69c94d", tomato:"#e45345",
    tomatoLight:"#ff8a80", fries:"#f4c34f", potato:"#dfc47b",
    shadow:"rgba(0,0,0,.30)"
  };

  const TILE = 58;
  const ORG = { x: 56, y: 214 };
  const COLS = 14;
  const ROWS = 8;

  const RECIPES = {
    burger: {
      title:"BURGER", score:150, time:82,
      needs:{ bun:"ready", cheese:"ready", tomato:"chopped", lettuce:"chopped", patty:"cooked" },
      order:["BUN","PATTY","LETT","TOM","CHEESE"]
    },
    fries: {
      title:"FRIES", score:80, time:55,
      needs:{ fries:"cooked" },
      order:["POTATO","FRY"]
    },
    salad: {
      title:"SALAD", score:95, time:65,
      needs:{ tomato:"chopped", lettuce:"chopped" },
      order:["PLATE","TOM","LETT"]
    }
  };

  const SOURCE_STATE = { bun:"ready", cheese:"ready", tomato:"raw", lettuce:"raw", patty:"raw", potato:"raw" };

  const state = {
    mode:"title", score:0, lives:3, timer:180, totalTime:180,
    orders:[], nextOrder:1, orderSeq:1, delivered:0, combo:0, bestCombo:0,
    message:"", messageTimer:0, angryTimer:0, angryText:"", runFinished:false, result:null, daily:getDaily()
  };

  const keys = Object.create(null);
  const player = {
    x: ORG.x + 8*TILE, y: ORG.y + 5*TILE,
    w:38, h:44, speed:150, dir:"down", step:0, stepTimer:0, carrying:null
  };

  const stations = [];
  const sparks = [];

  // v13 Restaurant Edition layout:
  // Wider, cleaner kitchen with real work zones.
  // Left = ingredient bank, center = prep island, right = service pass, bottom = cook line.
  add("source",1,1,{ingredient:"bun"});
  add("source",1,3,{ingredient:"tomato"});
  add("source",1,5,{ingredient:"patty"});
  add("source",3,1,{ingredient:"lettuce"});
  add("source",3,3,{ingredient:"cheese"});
  add("source",3,5,{ingredient:"potato"});

  add("prep",5,1);
  add("prep",7,1);
  add("prep",5,3);
  add("prep",7,3);
  add("plates",10,1);
  add("trash",11,1);
  add("serve",12,1);
  add("prep",11,3);
  add("prep",12,3);

  add("grill",6,6);
  add("grill",8,6);
  add("fryer",10,6);
  add("fryer",12,6);

  function add(type,col,row,extra={}) {
    stations.push({type,col,row,x:ORG.x+col*TILE,y:ORG.y+row*TILE,item:null,progress:0,cookItem:null,cookTime:0,...extra});
  }

  function getDaily() {
    return {
      today:new Date().toDateString(),
      last:localStorage.getItem("mcmeal_kitchen_rush_last_play"),
      streak:Number(localStorage.getItem("mcmeal_kitchen_rush_streak")||"0")
    };
  }
  function updateStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("mcmeal_kitchen_rush_last_play");
    let streak = Number(localStorage.getItem("mcmeal_kitchen_rush_streak")||"0");
    if (last !== today) {
      if (last) {
        const diff = Math.round((new Date(today)-new Date(last))/86400000);
        streak = diff===1 ? streak+1 : 1;
      } else streak = 1;
      localStorage.setItem("mcmeal_kitchen_rush_last_play", today);
      localStorage.setItem("mcmeal_kitchen_rush_streak", String(streak));
    }
    state.daily = getDaily();
  }

  function resetRun() {
    Object.assign(state, {
      mode:"play", score:0, lives:3, timer:state.totalTime, orders:[], nextOrder:.5,
      orderSeq:1, delivered:0, combo:0, bestCombo:0, message:"", messageTimer:0,
      angryTimer:0, angryText:"", runFinished:false, result:null
    });
    player.x = ORG.x + 8*TILE; player.y = ORG.y + 5*TILE; player.dir="down"; player.carrying=null;
    for (const s of stations) { s.item=null; s.progress=0; s.cookItem=null; s.cookTime=0; }
    spawnOrder("burger");
    spawnOrder(Math.random()<.55 ? "salad" : "fries");
    msg("Shift started");
  }

  function spawnOrder(forced=null) {
    if (state.orders.length >= 2) return;
    const pool = ["burger","fries","salad"];
    const key = forced || pool[Math.floor(Math.random()*pool.length)];
    const r = RECIPES[key];
    state.orders.push({id:state.orderSeq++, recipe:key, timeLeft:r.time, timeMax:r.time});
  }

  function update(dt) {
    if (state.mode !== "play") return;
    state.timer -= dt;
    state.nextOrder -= dt;
    if (state.messageTimer > 0) {
      state.messageTimer -= dt;
      if (state.messageTimer <= 0) state.message = "";
    }
    if (state.angryTimer > 0) {
      state.angryTimer -= dt;
      if (state.angryTimer <= 0) state.angryText = "";
    }
    if (state.nextOrder <= 0) { spawnOrder(); state.nextOrder = 13 + Math.random()*8; }

    for (let i=state.orders.length-1;i>=0;i--) {
      state.orders[i].timeLeft -= dt;
      if (state.orders[i].timeLeft <= 0) {
        state.orders.splice(i,1);
        state.lives--;
        state.combo=0;
        customerRage("HEY! WHERE IS MY MEAL?!");
        msg("Order missed! -1 life");
        if (state.lives <= 0) finishRun(false);
      }
    }

    updatePlayer(dt);
    updateStations(dt);
    for (let i=sparks.length-1;i>=0;i--) {
      sparks[i].t -= dt; sparks[i].y -= dt*18;
      if (sparks[i].t <= 0) sparks.splice(i,1);
    }
    if (state.timer <= 0) finishRun(state.delivered >= 7);
  }

  function updatePlayer(dt) {
    let dx=0,dy=0;
    if (keys.ArrowLeft||keys.a){dx--; player.dir="left";}
    if (keys.ArrowRight||keys.d){dx++; player.dir="right";}
    if (keys.ArrowUp||keys.w){dy--; player.dir="up";}
    if (keys.ArrowDown||keys.s){dy++; player.dir="down";}
    if (dx||dy) {
      const l = Math.hypot(dx,dy); dx/=l; dy/=l;
      const nx = player.x + dx*player.speed*dt;
      const ny = player.y + dy*player.speed*dt;
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
      player.stepTimer += dt;
      if (player.stepTimer > .14) { player.step=1-player.step; player.stepTimer=0; }
    } else { player.step=0; player.stepTimer=0; }
    player.x = clamp(player.x, ORG.x+4, ORG.x+COLS*TILE-player.w-4);
    player.y = clamp(player.y, ORG.y+4, ORG.y+ROWS*TILE-player.h-4);
  }

  function blocked(px,py) {
    const inset=6;
    const pts = [[px+inset,py+inset],[px+player.w-inset,py+inset],[px+inset,py+player.h-inset],[px+player.w-inset,py+player.h-inset]];
    for (const [x,y] of pts) {
      const c = Math.floor((x-ORG.x)/TILE), r = Math.floor((y-ORG.y)/TILE);
      if (c<0||r<0||c>=COLS||r>=ROWS) return true;
      if (stationAt(c,r)) return true;
    }
    return false;
  }

  function stationAt(c,r){ return stations.find(s=>s.col===c&&s.row===r); }

  function nearestStation() {
    const cx=player.x+player.w/2, cy=player.y+player.h/2;
    let best=null, bd=999;
    for (const s of stations) {
      const sx=s.x+TILE/2, sy=s.y+TILE/2;
      const d = Math.hypot(sx-cx,sy-cy);
      if (d > 68 || d >= bd) continue;
      const vx=sx-cx, vy=sy-cy;
      const forward =
        (player.dir==="up"&&vy<15)||(player.dir==="down"&&vy>-15)||
        (player.dir==="left"&&vx<15)||(player.dir==="right"&&vx>-15);
      if (forward) { best=s; bd=d; }
    }
    return best;
  }

  function action() {
    if (state.mode==="title"||state.mode==="result"){ resetRun(); return; }
    if (state.mode!=="play") return;
    const s = nearestStation();
    if (!s) return msg("Move closer");
    if (s.type==="source") handleSource(s);
    else if (s.type==="prep") handlePrep(s);
    else if (s.type==="plates") handlePlates(s);
    else if (s.type==="trash") handleTrash(s);
    else if (s.type==="serve") handleServe(s);
    else if (s.type==="grill") handleGrill(s);
    else if (s.type==="fryer") handleFryer(s);
  }

  function handleSource(s) {
    if (player.carrying) return msg("Hands full");
    player.carrying = item(s.ingredient);
    msg("Picked "+label(s.ingredient));
  }
  function item(kind,state=null){ return {kind,state:state||SOURCE_STATE[kind]||"ready",contents:null}; }

  function handlePrep(s) {
    if (s.item && isRawChop(s.item) && !player.carrying) {
      s.progress++; puff(s.x+TILE/2,s.y+9,C.meal);
      if (s.progress >= 3) { s.item.state="chopped"; s.progress=0; msg(label(s.item.kind)+" chopped"); }
      else msg("Chop "+s.progress+"/3");
      return;
    }
    if (player.carrying && !s.item) {
      s.item=player.carrying; s.progress=0; player.carrying=null;
      msg("Placed "+itemName(s.item)); return;
    }
    if (!player.carrying && s.item) {
      player.carrying=s.item; s.item=null; s.progress=0;
      msg("Picked "+itemName(player.carrying)); return;
    }
    if (player.carrying && s.item) {
      if (combinePlate(s)) return;
      const t=s.item; s.item=player.carrying; player.carrying=t; s.progress=0; msg("Swapped");
    }
  }
  function isRawChop(it){ return it && (it.kind==="tomato"||it.kind==="lettuce") && it.state==="raw"; }
  function isPlate(it){ return it && it.kind==="plate"; }

  function combinePlate(s) {
    const a=player.carrying,b=s.item;
    const plate = isPlate(a) ? a : (isPlate(b) ? b : null);
    const ing = plate===a ? b : a;
    if (!plate||!ing) return false;
    if (!canPlate(plate,ing)) { msg("Needs correct prep"); return false; }
    if (!plate.contents) plate.contents={};
    plate.contents[ing.kind]=ing.state;
    if (plate===a) { player.carrying=plate; s.item=null; }
    else { s.item=plate; player.carrying=null; }
    puff(s.x+TILE/2,s.y+8,C.green);
    msg("Added "+label(ing.kind));
    return true;
  }
  function canPlate(plate,ing) {
    if (!isPlate(plate)||!ing) return false;
    if (!plate.contents) plate.contents={};
    if (plate.contents[ing.kind]) return false;
    const needs = {bun:"ready",cheese:"ready",tomato:"chopped",lettuce:"chopped",patty:"cooked"};
    return needs[ing.kind] && ing.state === needs[ing.kind];
  }

  function handlePlates() {
    if (!player.carrying) { player.carrying={kind:"plate",state:"empty",contents:{}}; msg("Plate picked"); }
    else if (isPlate(player.carrying)&&Object.keys(player.carrying.contents||{}).length===0) { player.carrying=null; msg("Plate returned"); }
    else msg("Hands full");
  }
  function handleTrash() {
    if (player.carrying){ player.carrying=null; msg("Thrown away"); }
    else msg("Nothing to trash");
  }
  function handleGrill(s) {
    if (player.carrying && !s.cookItem) {
      if (player.carrying.kind==="patty" && player.carrying.state==="raw") {
        s.cookItem=player.carrying; s.cookTime=0; player.carrying=null; msg("Patty grilling");
      } else if (!s.item) { s.item=player.carrying; player.carrying=null; msg("Placed item"); }
      else msg("Grill busy");
      return;
    }
    if (!player.carrying && s.cookItem) { player.carrying=s.cookItem; s.cookItem=null; s.cookTime=0; msg("Picked "+itemName(player.carrying)); return; }
    if (player.carrying && s.cookItem && isPlate(player.carrying)) {
      const cooked=s.cookItem;
      if (canPlate(player.carrying,cooked)) {
        player.carrying.contents[cooked.kind]=cooked.state; s.cookItem=null; s.cookTime=0; msg("Patty added");
      } else msg("Patty not ready");
    }
  }
  function handleFryer(s) {
    if (player.carrying && !s.cookItem) {
      if (player.carrying.kind==="potato" && player.carrying.state==="raw") {
        s.cookItem={kind:"fries",state:"raw",contents:null}; s.cookTime=0; player.carrying=null; msg("Fries frying");
      } else if (!s.item) { s.item=player.carrying; player.carrying=null; msg("Placed item"); }
      else msg("Fryer busy");
      return;
    }
    if (!player.carrying && s.cookItem && s.cookItem.state!=="raw") {
      player.carrying=s.cookItem; s.cookItem=null; s.cookTime=0; msg("Picked fries");
    }
  }
  function handleServe() {
    if (!player.carrying) return msg("Nothing to serve");
    let idx=-1;
    for (let i=0;i<state.orders.length;i++) if (matches(player.carrying,state.orders[i].recipe)) { idx=i; break; }
    if (idx<0) { state.combo=0; return msg("Wrong dish"); }
    const o=state.orders[idx], r=RECIPES[o.recipe];
    const pts = r.score + Math.floor((o.timeLeft/o.timeMax)*45) + state.combo*18;
    state.score += pts; state.combo++; state.bestCombo=Math.max(state.bestCombo,state.combo);
    state.delivered++; state.orders.splice(idx,1); player.carrying=null;
    puff(ORG.x+12*TILE+TILE/2,ORG.y+2*TILE,C.green);
    msg("Served "+r.title+" +"+pts);
    if (state.orders.length<2) state.nextOrder=Math.min(state.nextOrder,1.0);
  }

  function matches(it,key) {
    if (key==="fries") return it && it.kind==="fries" && it.state==="cooked";
    if (!isPlate(it)) return false;
    const entries=Object.entries(RECIPES[key].needs);
    for (const [k,v] of entries) if (!it.contents || it.contents[k]!==v) return false;
    return Object.keys(it.contents||{}).length === entries.length;
  }

  function updateStations(dt) {
    for (const s of stations) {
      if ((s.type==="grill"||s.type==="fryer") && s.cookItem) {
        s.cookTime += dt;
        if (s.type==="grill") {
          if (s.cookItem.state==="raw" && s.cookTime>=5.0){ s.cookItem.state="cooked"; puff(s.x+TILE/2,s.y+5,C.meal); }
          if (s.cookItem.state==="cooked" && s.cookTime>=10.0){ s.cookItem.state="burnt"; puff(s.x+TILE/2,s.y+5,C.red); }
        } else {
          if (s.cookItem.state==="raw" && s.cookTime>=4.6){ s.cookItem.state="cooked"; puff(s.x+TILE/2,s.y+5,C.meal); }
          if (s.cookItem.state==="cooked" && s.cookTime>=9.2){ s.cookItem.state="burnt"; puff(s.x+TILE/2,s.y+5,C.red); }
        }
      }
    }
  }

  function finishRun(won) {
    if (state.runFinished) return;
    state.runFinished=true; updateStreak();
    state.result={won,score:state.score,levelsCleared:Math.max(1,Math.min(5,Math.ceil(state.delivered/2))),rewards:calcRewards(won)};
    state.mode="result"; postMCMealReward();
  }
  function calcRewards(won) {
    let xp=45,ticket=0,frag=0; const drops=["Mystery Ticket"];
    if (state.score>=500){xp=90;ticket=8;drops.push("Sauce");}
    if (state.score>=1100){xp=150;ticket=16;frag=1;drops.push("Recipe Fragment");}
    if (state.score>=1800){xp=240;ticket=25;frag=2;drops.push("Secret Receipt");}
    xp+=Math.min(220,state.delivered*18); ticket+=Math.min(16,state.delivered);
    if (won){xp+=140;ticket+=5;drops.push("Craft Entry");}
    if (state.bestCombo>=5)drops.push("Combo Stamp");
    return {drops,xp,ticketChance:ticket,fragmentChance:frag,gotTicket:Math.random()*100<ticket,gotFragment:Math.random()*100<frag,streak:Number(localStorage.getItem("mcmeal_kitchen_rush_streak")||"0"),bestCombo:state.bestCombo,ordersDelivered:state.delivered};
  }
  function postMCMealReward() {
    try {
      const r=state.result;
      if (!r || r._postedToHub) return;
      r._postedToHub=true;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({type:"MCMEAL_GAME_RESULT",game:"Mystery Order Rush",score:r.score||state.score||0,won:!!r.won,levelsCleared:r.levelsCleared||1,rewards:r.rewards||{}},"*");
      }
    } catch(e){}
  }

  function msg(t){ state.message=t; state.messageTimer=1.15; }
  function customerRage(text){ state.angryText=text; state.angryTimer=2.5; for(let i=0;i<18;i++) sparks.push({x:W-210+(Math.random()-.5)*140,y:145+(Math.random()-.5)*60,t:.65+Math.random()*.45,c:C.red}); }
  function puff(x,y,c){ for(let i=0;i<8;i++) sparks.push({x:x+(Math.random()-.5)*24,y:y+(Math.random()-.5)*14,t:.45+Math.random()*.25,c}); }

  function draw() {
    drawBackground();
    if (state.mode==="title"){ drawTitle(); return; }
    drawKitchen();
    drawOrders();
    drawStations();
    drawPlayer();
    drawSparks();
    drawHud();
    drawHint();
    if (state.mode==="result") drawResult();
  }

  function drawBackground() {
    ctx.fillStyle=C.bg;
    ctx.fillRect(0,0,W,H);

    // restaurant header wall with chunky readable layers
    ctx.fillStyle=C.wallDark;
    ctx.fillRect(0,0,W,190);
    for(let y=8;y<190;y+=18){
      ctx.fillStyle=y%36===8?C.wall:C.wall2;
      ctx.fillRect(0,y,W,12);
      ctx.fillStyle="rgba(0,0,0,.22)";
      ctx.fillRect(0,y+12,W,3);
    }

    // top restaurant details
    ctx.fillStyle="rgba(255,243,208,.13)";
    ctx.fillRect(36,118,180,30);
    ctx.fillStyle=C.meal;
    ctx.font="bold 18px Arial";
    ctx.fillText("OPEN KITCHEN",58,139);
    drawCustomerQueueTop();

    // lower vignette
    ctx.fillStyle="#100c10";
    ctx.fillRect(0,H-34,W,34);
  }


  function drawCustomerQueueTop() {
    const baseX = W - 306;
    const baseY = 116;
    const count = state.mode === "play" ? Math.max(2, Math.min(4, state.orders.length + 2)) : 3;

    // clean front counter strip in the wall area, not inside the work zone
    ctx.fillStyle="#3a2320";
    ctx.fillRect(baseX - 18, baseY + 56, 236, 26);
    ctx.fillStyle="#5e3528";
    ctx.fillRect(baseX - 18, baseY + 74, 236, 8);
    ctx.strokeStyle=C.gold;
    ctx.lineWidth=2;
    ctx.strokeRect(baseX - 18.5, baseY + 55.5, 235, 26);

    ctx.fillStyle="rgba(32,19,24,.96)";
    ctx.fillRect(baseX - 10, baseY + 84, 160, 24);
    ctx.strokeStyle=C.cream;
    ctx.lineWidth=2;
    ctx.strokeRect(baseX - 9.5, baseY + 84.5, 159, 23);
    ctx.fillStyle=C.meal;
    ctx.font="900 13px Arial";
    ctx.fillText("CUSTOMERS", baseX + 22, baseY + 101);

    for(let i=0;i<count;i++){
      const angry = state.angryTimer > 0 && i === 0;
      const wobble = angry ? Math.sin(Date.now()/45)*3 : 0;
      drawMiniCustomer(baseX + i*45 + wobble, baseY + (i%2)*4, i, angry);
    }

    if(state.angryTimer > 0){
      rounded(baseX - 38, baseY - 32, 252, 32, 8, C.paper, C.red, 3);
      ctx.fillStyle=C.red;
      ctx.font="900 14px Arial";
      ctx.fillText(state.angryText || "HEY!", baseX - 24, baseY - 11);
    } else if(state.mode === "play") {
      rounded(baseX + 6, baseY - 28, 150, 28, 7, C.paper, C.ink, 2);
      ctx.fillStyle=C.ink;
      ctx.font="900 12px Arial";
      ctx.fillText("Waiting orders...", baseX + 18, baseY - 10);
    }
  }

  function drawMiniCustomer(x,y,i,angry=false) {
    const shirts = ["#36b6ff","#69d568","#f3b63f","#e95d45"];
    ctx.fillStyle="rgba(0,0,0,.28)";
    ctx.beginPath(); ctx.ellipse(x+16,y+52,17,5,0,0,Math.PI*2); ctx.fill();

    ctx.fillStyle=shirts[i%shirts.length];
    ctx.fillRect(x+4,y+27,24,22);
    ctx.fillStyle="#0d0f14";
    ctx.fillRect(x+7,y+47,7,11);
    ctx.fillRect(x+18,y+47,7,11);

    ctx.fillStyle="#b87e5a";
    ctx.fillRect(x+8,y+13,16,16);
    ctx.fillStyle="#f3c9a5";
    ctx.fillRect(x+9,y+14,14,13);
    ctx.fillStyle="#201318";
    ctx.fillRect(x+7,y+10,18,6);

    ctx.fillStyle=C.black;
    ctx.fillRect(x+11,y+19,2,2);
    ctx.fillRect(x+20,y+19,2,2);

    if(angry){
      ctx.fillStyle=C.red;
      ctx.fillRect(x+10,y+25,12,3);
      ctx.fillRect(x+2,y+6,4,12);
      ctx.fillRect(x+28,y+6,4,12);
      ctx.fillStyle=C.meal;
      ctx.font="900 16px Arial";
      ctx.fillText("!",x+29,y+16);
    } else {
      ctx.fillStyle=C.ink;
      ctx.fillRect(x+13,y+25,8,2);
    }
  }

  function drawKitchen() {
    rounded(ORG.x-14,ORG.y-16,COLS*TILE+28,ROWS*TILE+30,10,C.floor,"#4d2b1c",5);

    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const x=ORG.x+c*TILE,y=ORG.y+r*TILE;
        ctx.fillStyle=(c+r)%2?C.floor:C.floor2;
        ctx.fillRect(x,y,TILE,TILE);
        ctx.strokeStyle=C.grout;
        ctx.lineWidth=1;
        ctx.strokeRect(x+.5,y+.5,TILE,TILE);
        ctx.fillStyle="rgba(75,45,20,.16)";
        if((c*7+r*3)%5===0)ctx.fillRect(x+12,y+9,5,3);
        if((c*5+r*2)%7===0)ctx.fillRect(x+37,y+33,6,2);
      }
    }

    // Work zones without hidden text blocks. Section labels are now clean floating signs.
    zoneBox(ORG.x+.10*TILE,ORG.y+.25*TILE,4.70*TILE,7.10*TILE,"rgba(60,64,68,.22)","#5d656d");
    zoneBox(ORG.x+4.75*TILE,ORG.y+.45*TILE,4.25*TILE,5.2*TILE,"rgba(255,243,208,.10)","#887753");
    zoneBox(ORG.x+9.55*TILE,ORG.y+.45*TILE,4.0*TILE,4.85*TILE,"rgba(255,206,74,.12)","#c47e00");
    zoneBox(ORG.x+4.65*TILE,ORG.y+5.45*TILE,8.95*TILE,2.35*TILE,"rgba(95,48,22,.20)","#6b4423");

    drawFloatingSign(ORG.x+0.45*TILE, ORG.y-0.02*TILE, "INGREDIENTS");
    drawFloatingSign(ORG.x+5.15*TILE, ORG.y+0.15*TILE, "PREP");
    drawFloatingSign(ORG.x+10.10*TILE, ORG.y-0.10*TILE, "SERVICE");
    drawFloatingSign(ORG.x+5.10*TILE, ORG.y+5.05*TILE, "COOK LINE");

    // Restaurant / kitchen decoration
    drawShelf(ORG.x+20,ORG.y+86,212);
    drawShelf(ORG.x+20,ORG.y+315,212);

    mat(ORG.x+4.9*TILE,ORG.y+1.35*TILE,4.0*TILE,3.95*TILE);
    mat(ORG.x+4.95*TILE,ORG.y+6.05*TILE,8.4*TILE,1.35*TILE);

    // pickup shelf
    drawPassShelf(ORG.x+9.85*TILE,ORG.y+1.05*TILE,198);
    ctx.fillStyle="rgba(255,206,74,.30)";
    ctx.fillRect(ORG.x+10.2*TILE,ORG.y+.65*TILE,2.8*TILE,10);

    // extra counters and shadows for less empty room
    ctx.fillStyle="rgba(0,0,0,.20)";
    ctx.fillRect(ORG.x+.6*TILE,ORG.y+7.2*TILE,4.3*TILE,10);
    ctx.fillRect(ORG.x+9.7*TILE,ORG.y+5.35*TILE,3.8*TILE,10);

    ctx.fillStyle="rgba(255,243,208,.10)";
    ctx.fillRect(ORG.x+5.2*TILE,ORG.y+.85*TILE,3.25*TILE,8);
    ctx.fillRect(ORG.x+10.0*TILE,ORG.y+4.9*TILE,3.25*TILE,8);
  }

  function zoneBox(x,y,w,h,fill,stroke) {
    ctx.fillStyle=fill;
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle=stroke;
    ctx.lineWidth=3;
    ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);
  }

  function drawFloatingSign(x,y,text) {
    ctx.fillStyle="rgba(32,19,24,.96)";
    ctx.fillRect(x,y,118,25);
    ctx.strokeStyle=C.cream;
    ctx.lineWidth=2;
    ctx.strokeRect(x+.5,y+.5,117,24);
    ctx.fillStyle=C.cream;
    ctx.font="900 13px Arial";
    ctx.fillText(text,x+10,y+18);
  }

  function zone(x,y,w,h,title,fill,stroke) { zoneBox(x,y,w,h,fill,stroke); }

  function drawShelf(x,y,w){ ctx.fillStyle=C.wood2; ctx.fillRect(x,y,w,8); ctx.fillStyle=C.wood; ctx.fillRect(x,y-7,w,7); for(let i=0;i<5;i++){ctx.fillStyle=i%2?C.steel:C.cream;ctx.fillRect(x+14+i*32,y-21,17,14);ctx.fillStyle="rgba(0,0,0,.18)";ctx.fillRect(x+14+i*32,y-7,17,3);} }
  function drawPassShelf(x,y,w){ ctx.fillStyle=C.steel;ctx.fillRect(x,y,w,9);ctx.fillStyle=C.steel3;ctx.fillRect(x,y+9,w,4);ctx.fillStyle=C.meal;ctx.fillRect(x+8,y-20,w-16,18);ctx.fillStyle=C.black;ctx.font="bold 11px Courier New";ctx.fillText("PICKUP",x+40,y-7);}
  function mat(x,y,w,h){ ctx.fillStyle="rgba(20,12,8,.27)"; ctx.fillRect(x,y,w,h); ctx.strokeStyle="rgba(255,255,255,.08)"; ctx.strokeRect(x+.5,y+.5,w-1,h-1); }

  function drawOrders() {
    const y=98, startX=312;
    for(let i=0;i<2;i++) drawTicket(startX+i*174,y,state.orders[i]);
  }

  function drawTicket(x,y,o) {
    if(!o){
      rounded(x,y,156,86,10,"rgba(255,243,208,.25)","rgba(32,19,24,.45)",3);
      return;
    }
    const r=RECIPES[o.recipe];
    rounded(x,y,158,88,10,C.paper,C.ink,4);
    ctx.fillStyle=C.ink;
    ctx.font="900 15px Arial";
    ctx.fillText(r.title,x+12,y+25);
    ctx.font="900 11px Arial";
    ctx.fillText(r.score+"pt",x+108,y+25);

    let ix=x+12,iy=y+40;
    for(const n of r.order){
      pill(ix,iy,n);
      ix += n==="POTATO"?56:46;
      if(ix>x+118){ix=x+12;iy+=20;}
    }

    const p=clamp(o.timeLeft/o.timeMax,0,1);
    ctx.fillStyle="#c7b890";
    ctx.fillRect(x+12,y+74,132,7);
    ctx.fillStyle=p>.35?C.meal:C.red;
    ctx.fillRect(x+12,y+74,132*p,7);
  }

  function pill(x,y,t){
    const w = t==="POTATO" ? 48 : 38;
    ctx.fillStyle="#fff9e8";
    ctx.fillRect(x,y,w,14);
    ctx.strokeStyle=C.ink;
    ctx.lineWidth=1;
    ctx.strokeRect(x+.5,y+.5,w-1,13);
    ctx.fillStyle=C.ink;
    ctx.font="900 8px Arial";
    ctx.fillText(t,x+4,y+10);
  }

  function drawStations() {
    for(const s of stations){ ctx.fillStyle=C.shadow; ctx.fillRect(s.x+5,s.y+8,TILE,TILE); }
    for(const s of stations) drawStation(s);
    for(const s of stations) drawStationLabel(s);
  }
  function drawStation(s) {
    const x=s.x,y=s.y;
    if(s.type==="source") drawSource(x,y,s.ingredient);
    else if(s.type==="prep") drawPrep(x,y);
    else if(s.type==="plates") drawPlates(x,y);
    else if(s.type==="trash") drawTrash(x,y);
    else if(s.type==="serve") drawServe(x,y);
    else if(s.type==="grill") drawGrill(x,y,s);
    else if(s.type==="fryer") drawFryer(x,y,s);
    if(s.item) drawItem(s.item,x+TILE/2-17,y+4,.76);
    if(s.cookItem){ drawItem(s.cookItem,x+TILE/2-17,y+2,.76); const max=s.type==="grill"?(s.cookItem.state==="raw"?5:10):(s.cookItem.state==="raw"?4.6:9.2); progress(x+7,y+TILE-9,TILE-14,5,clamp(s.cookTime/max,0,1),s.cookItem.state==="burnt"?C.black:(s.cookItem.state==="cooked"?C.meal:C.green)); }
    if(s.type==="prep"&&s.item&&s.progress>0) progress(x+7,y+TILE-9,TILE-14,5,s.progress/3,C.meal);
  }
  function base(x,y,top="#c2c8cc"){ ctx.fillStyle=C.steel3;ctx.fillRect(x+2,y+11,TILE-4,TILE-8);ctx.fillStyle=C.steel2;ctx.fillRect(x+5,y+19,TILE-10,TILE-20);ctx.fillStyle=top;ctx.fillRect(x+2,y+2,TILE-4,16);ctx.fillStyle="rgba(255,255,255,.28)";ctx.fillRect(x+7,y+6,TILE-14,4);ctx.strokeStyle=C.black;ctx.lineWidth=3;ctx.strokeRect(x+2.5,y+2.5,TILE-5,TILE-5);}
  function drawSource(x,y,k){ base(x,y,C.wood);ctx.fillStyle=C.wood2;ctx.fillRect(x+6,y+5,TILE-12,14);drawItem(item(k),x+TILE/2-18,y-8,.82); }
  function drawPrep(x,y){ base(x,y,"#d8d5c8");ctx.fillStyle=C.wood;ctx.fillRect(x+10,y+8,TILE-20,5);ctx.fillStyle="#f0e7ca";ctx.fillRect(x+11,y+5,TILE-22,5);ctx.fillStyle=C.steel3;ctx.fillRect(x+TILE-16,y+9,9,3);}
  function drawPlates(x,y){ base(x,y,"#dcdfe3");for(let i=0;i<3;i++){ellipse(x+TILE/2,y+15-i*4,19,7,C.steel);ellipse(x+TILE/2,y+12-i*4,16,5,C.cream);}}
  function drawTrash(x,y){ base(x,y,"#4f575e");ctx.fillStyle="#1f2429";ctx.fillRect(x+15,y+13,20,28);ctx.fillStyle="#596169";ctx.fillRect(x+11,y+9,28,7);ctx.strokeStyle=C.black;ctx.lineWidth=2;ctx.strokeRect(x+15.5,y+13.5,19,27);}
  function drawServe(x,y){ base(x,y,C.meal);ctx.fillStyle=C.cream;ellipse(x+TILE/2,y+34,17,8);ctx.fillStyle=C.steel3;ctx.fillRect(x+13,y+33,24,8);ctx.fillStyle="#fff7b0";ctx.fillRect(x+7,y+7,TILE-14,10);}
  function drawGrill(x,y,s){ base(x,y,"#24282d");ctx.fillStyle="#15181b";ctx.fillRect(x+10,y+7,TILE-20,15);for(let i=0;i<4;i++){ctx.fillStyle="#5c636a";ctx.fillRect(x+13+i*6,y+7,2,15);}ctx.fillStyle=s.cookItem&&s.cookItem.state!=="burnt"?C.red:"#4d2518";ellipse(x+TILE/2,y+14,13,8);ctx.fillStyle=C.meal;ellipse(x+TILE/2,y+13,6,4);}
  function drawFryer(x,y,s){ base(x,y,"#303840");ctx.fillStyle="#4a2d15";ctx.fillRect(x+10,y+8,TILE-20,13);ctx.fillStyle=s.cookItem?C.meal:C.wood;ctx.fillRect(x+12,y+10,TILE-24,5);ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.strokeRect(x+13,y+6,TILE-26,14);}

  function drawStationLabel(s){
    const t=name(s);
    const x=s.x+TILE/2,y=s.y-8;
    ctx.font="900 11px Arial";
    const w=Math.max(44,Math.min(78,ctx.measureText(t).width+14));
    ctx.fillStyle=C.paper;
    ctx.fillRect(x-w/2,y-9,w,18);
    ctx.strokeStyle=C.black;
    ctx.lineWidth=2;
    ctx.strokeRect(x-w/2+.5,y-8.5,w-1,17);
    ctx.fillStyle=C.ink;
    ctx.textAlign="center";
    ctx.fillText(t,x,y+4);
    ctx.textAlign="left";
  }
  function name(s){ if(s.type==="source")return label(s.ingredient).toUpperCase(); return ({prep:"PREP",plates:"PLATES",trash:"TRASH",serve:"SERVE",grill:"GRILL",fryer:"FRYER"})[s.type]||""; }

  function drawPlayer() {
    const x=Math.round(player.x),y=Math.round(player.y),bob=player.step?1:0;
    ellipse(x+player.w/2,y+player.h+5,25,6,C.shadow);
    ctx.fillStyle="#171a21";ctx.fillRect(x+7,y+27+bob,7,14);ctx.fillRect(x+20,y+27-bob,7,14);
    ctx.fillStyle="#07080b";ctx.fillRect(x+6,y+39+bob,10,4);ctx.fillRect(x+19,y+39-bob,10,4);
    ctx.fillStyle=C.red2;ctx.fillRect(x+2,y+12,player.w-4,22);
    ctx.fillStyle=C.red;ctx.fillRect(x+5,y+14,player.w-10,18);
    ctx.fillStyle=C.paper;ctx.fillRect(x+13,y+17,8,13);
    ctx.fillStyle=C.meal;ctx.fillRect(x+13,y+17,8,3);
    ctx.fillStyle="#b87e5a";ctx.fillRect(x+10,y+3,14,12);
    ctx.fillStyle="#f3c9a5";ctx.fillRect(x+11,y+4,12,10);
    ctx.fillStyle=C.black;if(player.dir!=="up"){ctx.fillRect(x+13,y+8,2,2);ctx.fillRect(x+20,y+8,2,2);}
    ctx.fillStyle="#d8d8d8";ctx.fillRect(x+8,y-4,18,6);
    ctx.fillStyle=C.paper;ctx.fillRect(x+9,y-7,16,7);
    ctx.strokeStyle=C.black;ctx.lineWidth=2;ctx.strokeRect(x+2.5,y+12.5,player.w-5,21);
    if(player.carrying) drawItem(player.carrying,x+player.w/2-18,y-30,.86);
  }

  function drawSparks(){ for(const p of sparks){ctx.globalAlpha=clamp(p.t/.55,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,4,4);ctx.globalAlpha=1;} }

  function drawHud() {
    // Big readable HUD with non-pixel Arial font where clarity matters.
    rounded(18,18,170,58,9,C.paper,C.ink,4);
    ctx.fillStyle=C.ink;
    ctx.font="900 22px Arial";
    ctx.fillText("SCORE",34,55);
    ctx.fillStyle=C.red;
    ctx.fillText(String(state.score),126,55);

    rounded(210,18,240,58,9,"rgba(32,19,24,.97)",C.gold,4);
    ctx.fillStyle=C.cream;
    ctx.font="900 14px Arial";
    ctx.fillText("ORDERS  "+state.delivered,232,43);
    ctx.fillText("LIVES  "+state.lives,340,43);
    ctx.fillText("COMBO  "+state.combo,232,62);

    rounded(W-250,18,224,58,9,C.paper,C.ink,4);
    ctx.fillStyle=C.ink;
    ctx.font="900 13px Arial";
    ctx.fillText("TIME",W-229,42);
    progress(W-229,50,180,12,clamp(state.timer/state.totalTime,0,1),state.timer>45?C.green:(state.timer>20?C.meal:C.red));

    if(state.message){
      rounded(476,26,228,38,9,"rgba(13,15,20,.92)",C.cyan,2);
      ctx.fillStyle=C.cyan;
      ctx.font="900 14px Arial";
      ctx.fillText(trim(state.message,24),492,50);
    }
  }

  function drawHint() {
    if(state.mode!=="play") return;
    const s=nearestStation(); if(!s) return;
    let t="";
    if(s.type==="source"&&!player.carrying)t="E: grab "+label(s.ingredient);
    else if(s.type==="prep"){
      if(s.item&&isRawChop(s.item)&&!player.carrying)t="E x3: chop";
      else if(player.carrying&&s.item&&(isPlate(player.carrying)||isPlate(s.item)))t="E: add to plate";
      else if(player.carrying&&!s.item)t="E: place";
      else if(!player.carrying&&s.item)t="E: pick up";
      else t="PREP";
    } else if(s.type==="plates"&&!player.carrying)t="E: take plate";
    else if(s.type==="grill")t=s.cookItem?(s.cookItem.state==="raw"?"Cooking...":"E: take/add patty"):"E: grill patty";
    else if(s.type==="fryer")t=s.cookItem?(s.cookItem.state==="raw"?"Frying...":"E: take fries"):"E: fry potato";
    else if(s.type==="serve")t="E: serve";
    else if(s.type==="trash")t="E: trash";
    if(t){const x=s.x+TILE/2,y=s.y-30;ctx.font="900 13px Arial";const w=ctx.measureText(t).width+18;rounded(x-w/2,y-21,w,24,6,"rgba(13,15,20,.90)",C.cream,2);ctx.fillStyle=C.cream;ctx.textAlign="center";ctx.fillText(t,x,y-5);ctx.textAlign="left";}
  }

  function drawTitle() {
    drawBackground();
    drawKitchen();
    drawStations();

    // v10.6: larger, darker, cleaner intro overlay for readability inside hub modal.
    rounded(112, 66, 736, 548, 18, "rgba(10,12,18,.96)", C.gold, 5);

    ctx.fillStyle = C.meal;
    ctx.font = "900 58px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MC MEAL", W / 2, 145);

    ctx.fillStyle = C.cream;
    ctx.font = "900 36px Arial";
    ctx.fillText("KITCHEN RUSH", W / 2, 190);

    ctx.textAlign = "left";
    ctx.fillStyle = C.cyan;
    ctx.font = "900 20px Arial";
    ctx.fillText("Your shift:", 190, 258);

    ctx.fillStyle = C.cream;
    ctx.font = "900 19px Arial";
    const lines = [
      "• Take customer orders",
      "• Prepare ingredients",
      "• Cook and serve meals",
      "• Keep the kitchen moving"
    ];
    lines.forEach((line, i) => ctx.fillText(line, 214, 298 + i * 34));

    rounded(188, 454, 584, 88, 10, "rgba(32,19,24,.92)", C.cyan, 3);
    ctx.fillStyle = C.cyan;
    ctx.font = "900 18px Arial";
    ctx.fillText("WASD / ARROWS = MOVE", 224, 489);
    ctx.fillText("E / ACTION = INTERACT", 510, 489);

    ctx.fillStyle = C.meal;
    ctx.font = "900 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PRESS ENTER OR TAP TO START", W / 2, 575);
    ctx.textAlign = "left";
  }

  function drawResult() {
    rounded(92,78,616,470,18,"rgba(13,15,20,.93)",state.result.won?C.green:C.red,4);
    ctx.fillStyle=state.result.won?C.green:C.red;ctx.font="bold 35px Courier New";ctx.fillText(state.result.won?"SHIFT COMPLETE!":"KITCHEN CLOSED",178,138);
    ctx.fillStyle=C.cream;ctx.font="19px Courier New";
    const r=state.result;
    ctx.fillText("Final Score: "+r.score,190,195);
    ctx.fillText("Orders Served: "+state.delivered,190,225);
    ctx.fillText("Best Combo: "+r.rewards.bestCombo,190,255);
    ctx.fillText("XP Earned: "+r.rewards.xp,190,285);
    ctx.fillText("Daily Streak: "+r.rewards.streak,190,315);
    ctx.fillStyle=C.meal;ctx.fillText("Drops: "+r.rewards.drops.join(", "),190,360);
    if(r.rewards.gotTicket){ctx.fillStyle=C.green;ctx.fillText("Bonus: Mystery Order Ticket!",190,400);}
    if(r.rewards.gotFragment){ctx.fillStyle=C.green;ctx.fillText("Ultra Bonus: Recipe Fragment!",190,430);}
    ctx.fillStyle=C.cyan;ctx.fillText("Press ENTER / Tap to play again",190,495);
  }

  function drawItem(it,x,y,s=1){
    if(!it)return;
    if(it.kind==="plate")return drawPlate(it,x,y,s);
    if(it.kind==="bun")return drawBun(x,y,s);
    if(it.kind==="patty")return drawPatty(x,y,s,it.state);
    if(it.kind==="cheese")return drawCheese(x,y,s);
    if(it.kind==="lettuce")return drawLettuce(x,y,s,it.state);
    if(it.kind==="tomato")return drawTomato(x,y,s,it.state);
    if(it.kind==="potato")return drawPotato(x,y,s);
    if(it.kind==="fries")return drawFries(x,y,s,it.state);
  }
  function drawPlate(it,x,y,s){ ellipse(x+20*s,y+30*s,25*s,10*s,C.steel2);ellipse(x+20*s,y+27*s,22*s,8*s,C.cream);const c=it.contents||{};let y0=y+20*s;if(c.lettuce){ctx.fillStyle=C.lettuce;ctx.fillRect(x+7*s,y0,27*s,4*s);y0-=4*s;}if(c.tomato){ctx.fillStyle=C.tomato;ctx.fillRect(x+8*s,y0,25*s,4*s);y0-=4*s;}if(c.patty){ctx.fillStyle=C.pattyCooked;ctx.fillRect(x+8*s,y0,25*s,5*s);y0-=5*s;}if(c.cheese){ctx.fillStyle=C.cheese;ctx.fillRect(x+9*s,y0,23*s,4*s);y0-=4*s;}if(c.bun)drawBun(x+5*s,y0-8*s,s*.75);}
  function drawBun(x,y,s){const u=4*s;ctx.fillStyle=C.bun;ctx.fillRect(x,y+5*u,10*u,4*u);ctx.fillStyle=C.bunLight;ctx.fillRect(x+u,y+2*u,8*u,4*u);ctx.fillStyle="#fff2a2";ctx.fillRect(x+3*u,y+3*u,u,u);ctx.fillRect(x+6*u,y+3*u,u,u);}
  function drawPatty(x,y,s,st="raw"){const u=4*s;ctx.fillStyle=st==="burnt"?C.pattyBurnt:(st==="cooked"?C.pattyCooked:C.patty);ctx.fillRect(x,y+4*u,10*u,4*u);ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(x+u,y+7*u,8*u,u);}
  function drawCheese(x,y,s){const u=4*s;ctx.fillStyle=C.cheese;ctx.fillRect(x,y+4*u,10*u,3*u);ctx.fillRect(x+2*u,y+7*u,2*u,2*u);}
  function drawLettuce(x,y,s,st="raw"){const u=4*s;ctx.fillStyle=st==="chopped"?"#8ff05d":C.lettuce;for(let i=0;i<10;i+=2)ctx.fillRect(x+i*u,y+(4+(i%4))*u,2*u,2*u);if(st==="chopped"){ctx.fillStyle=C.green2;ctx.fillRect(x+u,y+8*u,8*u,u);}}
  function drawTomato(x,y,s,st="raw"){const u=4*s;ctx.fillStyle=C.tomato;ctx.fillRect(x+u,y+4*u,8*u,3*u);ctx.fillStyle=C.tomatoLight;ctx.fillRect(x+3*u,y+5*u,u,u);if(st==="chopped"){ctx.fillStyle="#ffb3aa";ctx.fillRect(x+u,y+8*u,3*u,u);ctx.fillRect(x+6*u,y+8*u,3*u,u);}}
  function drawPotato(x,y,s){const u=4*s;ctx.fillStyle="#b58b45";ctx.fillRect(x+2*u,y+3*u,6*u,6*u);ctx.fillStyle=C.potato;ctx.fillRect(x+3*u,y+3*u,5*u,5*u);}
  function drawFries(x,y,s,st="cooked"){const u=4*s;ctx.fillStyle=st==="burnt"?"#3a2310":C.red;ctx.fillRect(x+2*u,y+6*u,7*u,5*u);ctx.fillStyle=st==="burnt"?"#4a2d15":C.fries;for(let i=0;i<5;i++)ctx.fillRect(x+(2+i*1.3)*u,y+(i%2)*u,u,7*u);}

  function progress(x,y,w,h,p,color){ctx.fillStyle="#2f261c";ctx.fillRect(x,y,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w*clamp(p,0,1),h);ctx.strokeStyle=C.black;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);}
  function rounded(x,y,w,h,r,fill,stroke=null,lw=2){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
  function ellipse(x,y,rx,ry,fill=null){if(fill)ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function itemName(it){if(!it)return"";if(it.kind==="plate"){if(matches(it,"burger"))return"Burger plate";if(matches(it,"salad"))return"Salad plate";return"Plate";}return label(it.kind)+(it.state&&it.state!=="ready"?" "+it.state:"");}
  function label(id){return({bun:"Bun",patty:"Patty",cheese:"Cheese",lettuce:"Lettuce",tomato:"Tomato",potato:"Potato",fries:"Fries",plate:"Plate"})[id]||id;}
  function trim(s,n){return s.length>n?s.slice(0,n-1)+"…":s;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  function loop(t){const dt=Math.min(.033,(t-(loop.last||t))/1000);loop.last=t;update(dt);draw();requestAnimationFrame(loop);}

  window.addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;if(e.key==="Enter")action();if(e.key.toLowerCase()==="e"||e.key===" "){e.preventDefault();action();}if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();});
  window.addEventListener("keyup",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;});
  canvas.addEventListener("pointerdown",()=>{if(state.mode==="title"||state.mode==="result")action();});
  document.querySelectorAll("[data-key]").forEach(btn=>{const key=btn.getAttribute("data-key");const down=e=>{e.preventDefault();keys[key]=true;if(key==="e")action();};const up=e=>{e.preventDefault();keys[key]=false;};btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointerleave",up);btn.addEventListener("pointercancel",up);});

  window.MCMEAL_KITCHEN_RUSH={state,player,stations,RECIPES,action};
  requestAnimationFrame(loop);
})();
