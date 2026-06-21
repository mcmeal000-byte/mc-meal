
(() => {
const c=document.getElementById("game"),ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;
const W=c.width,H=c.height;
const C={bg:"#171923",wallA:"#1d1821",wallB:"#221b25",floor:"#f0a63a",floorDark:"#8b4a22",text:"#fff3d0",meal:"#ffce4a",green:"#67e89a",red:"#e95d45",blue:"#36b6ff",cyan:"#52f0cf",black:"#0d0f14",white:"#fff8df",soda:"#9d4dff",foam:"#fff8df",cup:"#e9eef5",cupDark:"#9aa3ad"};
const keys=Object.create(null);
const LV=[
 {name:"LEVEL 1",order:"CLASSIC SODA",duration:60,cups:4,speed:56,spawn:2.15,zone:46},
 {name:"LEVEL 2",order:"DOUBLE POUR",duration:60,cups:5,speed:66,spawn:1.95,zone:42},
 {name:"LEVEL 3",order:"FIZZY RUSH",duration:65,cups:6,speed:78,spawn:1.70,zone:38},
 {name:"LEVEL 4",order:"NIGHT REFILL",duration:65,cups:7,speed:92,spawn:1.48,zone:34},
 {name:"LEVEL 5",order:"GOLDEN SODA BAR",duration:70,cups:8,speed:108,spawn:1.30,zone:30}
];
const st={mode:"title",level:1,maxLevel:5,score:0,lives:3,combo:0,bestCombo:0,timer:50,lastTime:0,spawnTimer:0,message:"",result:null,runFinished:false,cupsServed:0,cupsGoal:6,daily:getDaily()};
const nozzle={x:370,y:125,w:60,h:26,speed:280};
const cups=[];
function getDaily(){return{today:new Date().toDateString(),last:localStorage.getItem("mcmeal_soda_last_play"),streak:Number(localStorage.getItem("mcmeal_soda_streak")||"0")}}
function updateStreak(){const today=new Date().toDateString(),last=localStorage.getItem("mcmeal_soda_last_play");let s=Number(localStorage.getItem("mcmeal_soda_streak")||"0");if(last!==today){if(last){const d=Math.round((new Date(today)-new Date(last))/(86400000));s=d===1?s+1:1}else s=1;localStorage.setItem("mcmeal_soda_last_play",today);localStorage.setItem("mcmeal_soda_streak",String(s))}st.daily=getDaily()}
function reset(){st.mode="play";st.level=1;st.score=0;st.lives=5;st.combo=0;st.bestCombo=0;st.result=null;st.runFinished=false;setupLevel(1)}
function setupLevel(n){const d=LV[n-1];st.timer=d.duration;st.spawnTimer=.5;st.cupsServed=0;st.cupsGoal=d.cups;st.message=d.name+" started";nozzle.x=W/2-nozzle.w/2;cups.length=0;setTimeout(()=>{if(st.mode==="play")st.message=""},850)}
function update(dt){if(st.mode!=="play")return;st.timer-=dt;st.spawnTimer-=dt;move(dt);spawn();updateCups(dt);if(st.timer<=0||st.cupsServed>=st.cupsGoal)clearLevel()}
function move(dt){let dir=0;if(keys.ArrowLeft||keys.a)dir--;if(keys.ArrowRight||keys.d)dir++;nozzle.x+=dir*nozzle.speed*dt;nozzle.x=Math.max(30,Math.min(W-nozzle.w-30,nozzle.x));if(keys.Space||keys[" "])pour(dt)}
function spawn(){const d=LV[st.level-1];if(st.spawnTimer>0||cups.length>3)return;const special=Math.random()<.08+st.level*.01; cups.push({x:-70,y:445,w:58,h:82,fill:0,target:.68+Math.random()*.10,zone:d.zone,speed:d.speed+Math.random()*12,special,judged:false});st.spawnTimer=d.spawn*(.8+Math.random()*.4)}
function pour(dt){const nx=nozzle.x+nozzle.w/2;for(const cup of cups){if(cup.judged)continue;if(nx>cup.x-22&&nx<cup.x+cup.w+22){cup.fill=Math.min(1.12,cup.fill+dt*.48);ctx.fillStyle=C.cyan;ctx.fillRect(nx-3,150,6,cup.y-150);break}}}
function updateCups(dt){for(let i=cups.length-1;i>=0;i--){const cup=cups[i];cup.x+=cup.speed*dt;if(cup.x>W+40){judge(cup);cups.splice(i,1)}}}
function judge(cup){if(cup.judged)return;cup.judged=true;const target=cup.target, diff=Math.abs(cup.fill-target);const perfect=diff<cup.zone/520;const good=diff<cup.zone/230;const empty=cup.fill<.12;const over=cup.fill>target+.22;if(empty||over||!good){st.lives--;st.combo=0;msg(over?"Overflow! -1 life":"Bad fill! -1 life");if(st.lives<=0)finish(false);return}let pts=good?160:80;if(perfect){pts=420;st.combo+=2;msg("Perfect pour!")}else{st.combo++;msg("Good pour!")}if(cup.special){pts+=350;msg("Golden cup!")}st.bestCombo=Math.max(st.bestCombo,st.combo);st.score+=pts+Math.min(800,st.combo*18);st.cupsServed++}
function msg(m){st.message=m;setTimeout(()=>{if(st.mode==="play")st.message=""},650)}
function clearLevel(){st.score+=st.level*700+st.combo*12;if(st.level<st.maxLevel){st.mode="levelclear";cups.length=0}else finish(true)}
function nextLevel(){st.level++;setupLevel(st.level);st.mode="play"}

  function postMCMealReward() {
    try {
      const result = st.result;
      if (!result || result._postedToHub) return;
      result._postedToHub = true;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "MCMEAL_GAME_RESULT",
          game: "Soda Sprint",
          score: result.score || st.score || 0,
          won: !!result.won,
          levelsCleared: result.levelsCleared || st.level || 1,
          rewards: result.rewards || {}
        }, "*");
      }
    } catch (err) {}
  }

function finish(won){if(st.runFinished)return;st.runFinished=true;updateStreak();st.result={won,score:st.score,levelsCleared:st.level,rewards:rewards(won)};st.mode="result";postMCMealReward();cups.length=0}
function rewards(won){let soda=1,sauce=0,xp=25,ticket=0,frag=0;if(st.score>=1500){soda=2;xp=55}if(st.score>=4000){soda=4;sauce=1;xp=110;ticket=5}if(st.score>=8500){soda=6;sauce=2;xp=185;ticket=10;frag=1}xp+=(st.level-1)*30;ticket+=(st.level-1)*2;if(won){xp+=100;ticket+=3}const drops=[];for(let i=0;i<soda;i++)drops.push("Soda");for(let i=0;i<sauce;i++)drops.push("Sauce");if(st.bestCombo>=18)drops.push("Fizz Combo");return{drops,xp,ticketChance:ticket,fragmentChance:frag,gotTicket:Math.random()*100<ticket,gotFragment:Math.random()*100<frag,streak:Number(localStorage.getItem("mcmeal_soda_streak")||"0"),bestCombo:st.bestCombo}}
function draw(){bg();if(st.mode==="title"){title();return}playfield();cups.forEach(drawCup);drawNozzle();hud();orderZone();if(st.mode==="levelclear")levelClear();if(st.mode==="result")result()}
function bg(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66)}
function playfield(){ctx.fillStyle="#0e1017";ctx.fillRect(0,66,W,510);for(let y=80;y<570;y+=38)for(let x=0;x<W;x+=52){ctx.fillStyle=(x+y)%104===0?"#1b1721":"#211923";ctx.fillRect(x,y,48,34)}ctx.fillStyle=C.floor;ctx.fillRect(70,430,W-140,14);ctx.fillStyle=C.floorDark;ctx.fillRect(70,444,W-140,8);for(let x=86;x<W-80;x+=42){ctx.fillStyle="#ffd066";ctx.fillRect(x,433,20,3)}ctx.fillStyle=C.blue;ctx.fillRect(0,150,W,4);ctx.fillStyle="#090b11";ctx.fillRect(0,575,W,85);ctx.fillStyle=C.floorDark;ctx.fillRect(0,575,W,8)}
function hud(){const d=LV[st.level-1];ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66);ctx.fillStyle=C.meal;ctx.font="22px Courier New";ctx.fillText("MC MEAL: SODA SPRINT",20,26);ctx.fillStyle=C.text;ctx.font="18px Courier New";ctx.fillText(`Score ${st.score}`,20,54);ctx.fillText(`Lives ${st.lives}`,165,54);ctx.fillText(`Level ${st.level}/${st.maxLevel}`,285,54);ctx.fillText(`Time ${Math.ceil(st.timer)}s`,455,54);ctx.fillText(`Cups ${st.cupsServed}/${st.cupsGoal}`,610,54);if(st.message){ctx.fillStyle=C.green;ctx.font="16px Courier New";ctx.fillText(st.message,470,26)}ctx.fillStyle=C.white;ctx.font="13px Courier New";ctx.fillText(d.order,20,82)}
function title(){txt("MC MEAL",210,140,54,C.meal,"#74311f");txt("SODA SPRINT",180,215,40,C.white,"#74311f");drawBigCup(350,285,2.1);panel(140,385,520,150);ctx.fillStyle=C.text;ctx.font="19px Courier New";ctx.fillText("Move the soda nozzle over each cup.",185,430);ctx.fillText("Hold FILL slowly and stop near the green marker.",170,462);ctx.fillText("Perfect pours build combos and rewards.",180,494);ctx.fillText("Press ENTER or tap canvas to start",210,524)}
function drawNozzle(){ctx.fillStyle=C.blue;ctx.fillRect(nozzle.x,nozzle.y,nozzle.w,nozzle.h);ctx.fillStyle=C.cyan;ctx.fillRect(nozzle.x+8,nozzle.y+5,nozzle.w-16,5);ctx.fillStyle=C.white;ctx.fillRect(nozzle.x+nozzle.w/2-5,nozzle.y+nozzle.h,10,18)}
function drawCup(cup){ctx.fillStyle=C.cupDark;ctx.fillRect(cup.x,cup.y,cup.w,cup.h);ctx.fillStyle=C.cup;ctx.fillRect(cup.x+5,cup.y+4,cup.w-10,cup.h-8);ctx.fillStyle=cup.special?C.gold:C.blue;const fy=cup.y+cup.h-8-(cup.h-16)*Math.min(1,cup.fill);ctx.fillRect(cup.x+8,fy,cup.w-16,cup.y+cup.h-8-fy);ctx.fillStyle=C.foam||C.white;ctx.fillRect(cup.x+9,fy-4,cup.w-18,4);const targetY=cup.y+cup.h-8-(cup.h-16)*cup.target;ctx.fillStyle=C.green;ctx.fillRect(cup.x+cup.w+4,targetY-2,12,4);ctx.fillStyle=C.red;ctx.fillRect(cup.x+cup.w+4,targetY-16,12,2);ctx.fillRect(cup.x+cup.w+4,targetY+16,12,2)}
function orderZone(){panel(206,586,388,66);ctx.fillStyle=C.meal;ctx.font="15px Courier New";const title="ORDER TRAY";ctx.fillText(title,400-ctx.measureText(title).width/2,608);ctx.fillStyle=C.text;ctx.font="12px Courier New";const line1="perfect fills = soda + sauce";const line2="+ fizz drops";ctx.fillText(line1,400-ctx.measureText(line1).width/2,632);ctx.fillText(line2,400-ctx.measureText(line2).width/2,648)}
function drawBigCup(x,y,s){const u=4*s;ctx.fillStyle=C.cupDark;ctx.fillRect(x+2*u,y+2*u,14*u,20*u);ctx.fillStyle=C.cup;ctx.fillRect(x+3*u,y+3*u,12*u,18*u);ctx.fillStyle=C.blue;ctx.fillRect(x+4*u,y+9*u,10*u,11*u);ctx.fillStyle=C.white;ctx.fillRect(x+4*u,y+8*u,10*u,2*u);ctx.fillStyle=C.red;ctx.font=`${9*s}px Courier New`;ctx.fillText("MC",x+6*u,y+16*u)}
function levelClear(){const next=Math.min(st.level+1,st.maxLevel);panel(150,190,500,200);ctx.fillStyle=C.green;ctx.font="30px Courier New";ctx.fillText(`${LV[st.level-1].name} COMPLETE!`,180,235);ctx.fillStyle=C.text;ctx.font="19px Courier New";ctx.fillText(`Score Bonus Added: ${st.level*700}`,210,280);ctx.fillText(`Next Order: ${LV[next-1].order}`,205,310);ctx.fillText("Slightly faster cups. Still forgiving.",205,342);ctx.fillText("Press ENTER / Tap for next level",205,370)}
function result(){panel(90,80,620,470);const r=st.result;ctx.fillStyle=r.won?C.green:C.red;ctx.font="34px Courier New";ctx.fillText(r.won?"SODA SHIFT COMPLETE!":"KITCHEN CLOSED!",118,132);ctx.fillStyle=C.text;ctx.font="20px Courier New";ctx.fillText(`Final Score: ${r.score}`,160,178);ctx.fillText(`Levels Cleared: ${r.levelsCleared}/${st.maxLevel}`,160,208);ctx.fillText(`Best Combo: ${r.rewards.bestCombo}`,160,238);ctx.fillText(`XP Earned: ${r.rewards.xp}`,160,268);ctx.fillText(`Daily Streak: ${r.rewards.streak}`,160,298);ctx.fillStyle=C.meal;ctx.fillText("Ingredient Drops:",160,340);ctx.fillStyle=C.text;ctx.font="18px Courier New";const lines=wrap(r.rewards.drops.join(", "),390);let y=370;lines.forEach(line=>{ctx.fillText(line,160,y);y+=24});y+=10;if(r.rewards.gotTicket){ctx.fillStyle=C.green;ctx.fillText("Bonus: Mystery Order Ticket!",160,y);y+=28}else{ctx.fillStyle="#b9a88a";ctx.fillText(`Ticket chance rolled: ${r.rewards.ticketChance}%`,160,y);y+=28}if(r.rewards.gotFragment){ctx.fillStyle=C.green;ctx.fillText("Ultra Bonus: Rare Recipe Fragment!",160,y);y+=28}ctx.fillStyle=C.white;ctx.font="18px Courier New";ctx.fillText("Press ENTER / Tap to play again",160,520)}
function wrap(text,max){const words=text.split(/\s+/),lines=[];let line="";for(const w of words){const t=line?line+" "+w:w;if(ctx.measureText(t).width<=max)line=t;else{if(line)lines.push(line);line=w}}if(line)lines.push(line);return lines}
function panel(x,y,w,h){ctx.fillStyle="#0f1118";ctx.fillRect(x,y,w,h);ctx.strokeStyle=C.floor;ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);ctx.strokeStyle=C.floorDark;ctx.lineWidth=2;ctx.strokeRect(x+8,y+8,w-16,h-16)}
function txt(t,x,y,s,col,sh){ctx.font=`${s}px Courier New`;ctx.fillStyle=sh;ctx.fillText(t,x+4,y+4);ctx.fillStyle=col;ctx.fillText(t,x,y)}
function loop(t){const dt=Math.min(.033,(t-st.lastTime)/1000||0);st.lastTime=t;update(dt);draw();requestAnimationFrame(loop)}
function action(){if(st.mode==="title"||st.mode==="result")reset();else if(st.mode==="levelclear")nextLevel()}
window.addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;if(e.key==="Enter")action();if(["ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault()});
window.addEventListener("keyup",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false});
c.addEventListener("pointerdown",()=>action());
document.querySelectorAll("[data-key]").forEach(b=>{const k=b.getAttribute("data-key");const down=e=>{e.preventDefault();keys[k]=true;if(k==="Space")keys[" "]=true};const up=e=>{e.preventDefault();keys[k]=false;if(k==="Space")keys[" "]=false};b.addEventListener("pointerdown",down);b.addEventListener("pointerup",up);b.addEventListener("pointerleave",up);b.addEventListener("pointercancel",up)});
requestAnimationFrame(loop);
})();
