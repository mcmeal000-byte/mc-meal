(() => {
const c=document.getElementById("game"),ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;
const W=c.width,H=c.height;
const C={bg:"#15141f",panel:"#0f1118",tile1:"#1a1620",tile2:"#241b28",floor:"#f0a63a",floorDark:"#8b4a22",text:"#fff3d0",muted:"#b9a88a",meal:"#ffce4a",green:"#67e89a",red:"#ff5d55",blue:"#36b6ff",cyan:"#52f0cf",purple:"#9d4dff",black:"#090b11",white:"#fff8df",foam:"#fff8df",cup:"#e9eef5",cupDark:"#9aa3ad",gold:"#ffd34d"};
const keys=Object.create(null);
const LV=[
 {name:"LEVEL 1",order:"CLASSIC SODA",duration:46,cups:4,speed:52,spawn:2.10,zone:50,sizes:["small"]},
 {name:"LEVEL 2",order:"DOUBLE POUR",duration:48,cups:5,speed:62,spawn:1.92,zone:46,sizes:["small","medium"]},
 {name:"LEVEL 3",order:"FIZZY RUSH",duration:50,cups:6,speed:72,spawn:1.72,zone:42,sizes:["small","medium"]},
 {name:"LEVEL 4",order:"LARGE CUP SHIFT",duration:52,cups:7,speed:84,spawn:1.52,zone:38,sizes:["small","medium","large"]},
 {name:"LEVEL 5",order:"GOLDEN SODA BAR",duration:54,cups:8,speed:98,spawn:1.35,zone:34,sizes:["small","medium","large"]},
 {name:"LEVEL 6",order:"ICE CUBE PANIC",duration:56,cups:9,speed:112,spawn:1.20,zone:32,sizes:["medium","large"]},
 {name:"LEVEL 7",order:"NEON FIZZ",duration:58,cups:10,speed:126,spawn:1.08,zone:30,sizes:["small","medium","large"]},
 {name:"LEVEL 8",order:"BUBBLE STORM",duration:60,cups:11,speed:140,spawn:.98,zone:28,sizes:["small","medium","large"]},
 {name:"LEVEL 9",order:"OVERFLOW RUSH",duration:62,cups:12,speed:154,spawn:.90,zone:26,sizes:["medium","large"]},
 {name:"LEVEL 10",order:"LEGENDARY SODA SHIFT",duration:66,cups:14,speed:172,spawn:.82,zone:24,sizes:["small","medium","large"]}
];
const CUP_SIZE={small:{w:48,h:68,label:"S",pour:.58},medium:{w:58,h:82,label:"M",pour:.48},large:{w:70,h:98,label:"L",pour:.39}};
const st={mode:"title",level:1,maxLevel:10,score:0,lives:4,combo:0,bestCombo:0,timer:50,lastTime:0,spawnTimer:0,message:"",result:null,runFinished:false,cupsServed:0,cupsGoal:6,daily:getDaily(),bubbles:[]};
const nozzle={x:370,y:118,w:64,h:28,speed:290};
const cups=[];
function getDaily(){return{today:new Date().toDateString(),last:localStorage.getItem("mcmeal_soda_last_play"),streak:Number(localStorage.getItem("mcmeal_soda_streak")||"0")}}
function updateStreak(){const today=new Date().toDateString(),last=localStorage.getItem("mcmeal_soda_last_play");let s=Number(localStorage.getItem("mcmeal_soda_streak")||"0");if(last!==today){if(last){const d=Math.round((new Date(today)-new Date(last))/(86400000));s=d===1?s+1:1}else s=1;localStorage.setItem("mcmeal_soda_last_play",today);localStorage.setItem("mcmeal_soda_streak",String(s))}st.daily=getDaily()}
function reset(){st.mode="play";st.level=1;st.score=0;st.lives=5;st.combo=0;st.bestCombo=0;st.result=null;st.runFinished=false;setupLevel(1)}
function setupLevel(n){const d=LV[n-1];st.timer=d.duration;st.spawnTimer=.45;st.cupsServed=0;st.cupsGoal=d.cups;st.message=d.name+" started";nozzle.x=W/2-nozzle.w/2;cups.length=0;st.bubbles.length=0;setTimeout(()=>{if(st.mode==="play")st.message=""},850)}
function update(dt){if(st.mode!=="play")return;st.timer-=dt;st.spawnTimer-=dt;move(dt);spawn();updateCups(dt);updateBubbles(dt);if(st.timer<=0||st.cupsServed>=st.cupsGoal)clearLevel()}
function move(dt){let dir=0;if(keys.ArrowLeft||keys.a)dir--;if(keys.ArrowRight||keys.d)dir++;nozzle.x+=dir*nozzle.speed*dt;nozzle.x=Math.max(30,Math.min(W-nozzle.w-30,nozzle.x));if(keys.Space||keys[" "])pour(dt)}
function randSize(){const arr=LV[st.level-1].sizes;return arr[Math.floor(Math.random()*arr.length)]}
function spawn(){const d=LV[st.level-1];if(st.spawnTimer>0||cups.length>3)return;const key=randSize(),sz=CUP_SIZE[key];const special=Math.random()<.07+st.level*.012;const target=.62+Math.random()*.18;cups.push({x:-85,y:430+Math.max(0,98-sz.h),w:sz.w,h:sz.h,size:key,label:sz.label,pour:sz.pour,fill:0,target,zone:d.zone,speed:d.speed+Math.random()*13,special,judged:false,foam:0});st.spawnTimer=d.spawn*(.78+Math.random()*.42)}
function pour(dt){const nx=nozzle.x+nozzle.w/2;for(const cup of cups){if(cup.judged)continue;if(nx>cup.x-24&&nx<cup.x+cup.w+24){cup.fill=Math.min(1.15,cup.fill+dt*cup.pour);cup.foam=Math.min(1,cup.foam+dt*1.2);spawnBubble(nx,158);break}}}
function spawnBubble(x,y){for(let i=0;i<2;i++)st.bubbles.push({x:x+(Math.random()-.5)*14,y:y+Math.random()*230,r:2+Math.random()*3,vy:-35-Math.random()*45,life:.7+Math.random()*.35})}
function updateBubbles(dt){for(let i=st.bubbles.length-1;i>=0;i--){const b=st.bubbles[i];b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)st.bubbles.splice(i,1)}}
function updateCups(dt){for(let i=cups.length-1;i>=0;i--){const cup=cups[i];cup.x+=cup.speed*dt;if(cup.x>W+60){judge(cup);cups.splice(i,1)}}}
function judge(cup){if(cup.judged)return;cup.judged=true;const diff=Math.abs(cup.fill-cup.target);const perfect=diff<cup.zone/540;const good=diff<cup.zone/230;const empty=cup.fill<.12;const over=cup.fill>cup.target+.22;if(empty||over||!good){st.lives--;st.combo=0;msg(over?"Overflow! -1 life":"Bad fill! -1 life");if(st.lives<=0)finish(false);return}let pts=good?170:90;if(perfect){pts=450;st.combo+=2;msg("Perfect pour!")}else{st.combo++;msg("Good pour!")}if(cup.special){pts+=360;msg("Golden cup!")}if(cup.size==="large")pts+=90;if(cup.size==="small"&&perfect)pts+=70;st.bestCombo=Math.max(st.bestCombo,st.combo);st.score+=pts+Math.min(850,st.combo*18);st.cupsServed++}
function msg(m){st.message=m;setTimeout(()=>{if(st.mode==="play"&&st.message===m)st.message=""},700)}
function clearLevel(){st.score+=st.level*700+st.combo*12;if(st.level<st.maxLevel){st.mode="levelclear";cups.length=0}else finish(true)}
function nextLevel(){st.level++;setupLevel(st.level);st.mode="play"}
function postMCMealReward(){try{const r=st.result;if(!r||r._postedToHub)return;r._postedToHub=true;if(window.parent&&window.parent!==window){window.parent.postMessage({type:"MCMEAL_GAME_RESULT",game:"Soda Sprint",score:r.score||st.score||0,won:!!r.won,levelsCleared:r.levelsCleared||st.level||1,rewards:r.rewards||{}},"*")}}catch(e){}}
function finish(won){if(st.runFinished)return;st.runFinished=true;updateStreak();st.result={won,score:st.score,levelsCleared:st.level,rewards:rewards(won)};st.mode="result";postMCMealReward();cups.length=0}
function rewards(won){let soda=1,sauce=0,xp=25,ticket=0,frag=0;if(st.score>=1500){soda=2;xp=55}if(st.score>=4000){soda=4;sauce=1;xp=110;ticket=5}if(st.score>=8500){soda=6;sauce=2;xp=185;ticket=10;frag=1}xp+=(st.level-1)*30;ticket+=(st.level-1)*2;if(won){xp+=100;ticket+=3}const drops=[];for(let i=0;i<soda;i++)drops.push("Soda");for(let i=0;i<sauce;i++)drops.push("Sauce");if(st.bestCombo>=18)drops.push("Fizz Combo");return{drops,xp,ticketChance:ticket,fragmentChance:frag,gotTicket:Math.random()*100<ticket,gotFragment:Math.random()*100<frag,streak:Number(localStorage.getItem("mcmeal_soda_streak")||"0"),bestCombo:st.bestCombo}}
function draw(){bg();if(st.mode==="title"){title();return}playfield();cups.forEach(drawCup);drawNozzle();drawBubbles();hud();orderZone();if(st.mode==="levelclear")levelClear();if(st.mode==="result")result()}
function bg(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#15243a");g.addColorStop(.5,"#10131d");g.addColorStop(1,"#0a090e");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66)}
function playfield(){ctx.fillStyle="#0e1017";ctx.fillRect(0,66,W,510);for(let y=80;y<570;y+=38)for(let x=0;x<W;x+=52){ctx.fillStyle=(x+y)%104===0?C.tile1:C.tile2;ctx.fillRect(x,y,48,34)}ctx.fillStyle="#1b2741";ctx.fillRect(0,150,W,6);for(let x=50;x<W;x+=90){ctx.fillStyle=C.cyan;ctx.fillRect(x,151,25,2)}ctx.fillStyle="#13202f";ctx.fillRect(36,504,W-72,3);for(let x=54;x<W-50;x+=64){ctx.fillStyle="#27445f";ctx.fillRect(x,505,26,2)}ctx.fillStyle=C.black;ctx.fillRect(0,575,W,85);ctx.fillStyle=C.floorDark;ctx.fillRect(0,575,W,8)}
function hud(){const d=LV[st.level-1];ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66);ctx.fillStyle=C.meal;ctx.font="22px Courier New";ctx.fillText("MC MEAL: SODA SPRINT",20,26);ctx.fillStyle=C.text;ctx.font="18px Courier New";ctx.fillText(`Score ${st.score}`,20,54);ctx.fillText(`Lives ${st.lives}`,150,54);ctx.fillText(`Level ${st.level}/${st.maxLevel}`,260,54);ctx.fillText(`Time ${Math.ceil(st.timer)}s`,410,54);ctx.fillText(`Cups ${st.cupsServed}/${st.cupsGoal}`,545,54);ctx.fillText(`Combo ${st.combo}`,680,54);if(st.message){ctx.fillStyle=C.green;ctx.font="16px Courier New";ctx.fillText(st.message,500,26)}ctx.fillStyle=C.white;ctx.font="13px Courier New";ctx.fillText(d.order,20,86)}
function title(){txt("MC MEAL",210,125,54,C.meal,"#74311f");txt("SODA SPRINT",178,198,40,C.white,"#74311f");drawBigCup(350,270,2.05);panel(135,374,530,176);drawWrapped(["Move the soda nozzle over each cup.","Hold FILL and stop inside the green target marker.","Small, medium and large cups appear across 10 levels.","Press ENTER or tap canvas to start"],172,416,440,24,18,C.text)}
function drawNozzle(){ctx.fillStyle="#1a6fff";ctx.fillRect(nozzle.x,nozzle.y,nozzle.w,nozzle.h);ctx.fillStyle=C.cyan;ctx.fillRect(nozzle.x+8,nozzle.y+5,nozzle.w-16,5);ctx.fillStyle=C.white;ctx.fillRect(nozzle.x+nozzle.w/2-5,nozzle.y+nozzle.h,10,18);ctx.fillStyle=C.purple;ctx.fillRect(nozzle.x+nozzle.w-13,nozzle.y+7,7,7)}
function drawCup(cup){ctx.fillStyle=cup.special?C.gold:C.cupDark;ctx.fillRect(cup.x,cup.y,cup.w,cup.h);ctx.fillStyle=C.cup;ctx.fillRect(cup.x+5,cup.y+4,cup.w-10,cup.h-8);ctx.fillStyle=cup.special?"#ffc64b":C.blue;const fy=cup.y+cup.h-8-(cup.h-16)*Math.min(1,cup.fill);ctx.fillRect(cup.x+8,fy,cup.w-16,cup.y+cup.h-8-fy);ctx.fillStyle=C.foam;ctx.fillRect(cup.x+9,fy-4,cup.w-18,4);const targetY=cup.y+cup.h-8-(cup.h-16)*cup.target;ctx.fillStyle=C.green;ctx.fillRect(cup.x+cup.w+4,targetY-3,16,6);ctx.fillStyle=C.red;ctx.fillRect(cup.x+cup.w+4,targetY-18,14,2);ctx.fillRect(cup.x+cup.w+4,targetY+18,14,2);ctx.fillStyle=C.black;ctx.font="13px Courier New";ctx.fillText(cup.label,cup.x+cup.w/2-4,cup.y+cup.h-12)}
function drawBubbles(){ctx.fillStyle=C.cyan;st.bubbles.forEach(b=>{ctx.globalAlpha=Math.max(0,b.life);ctx.fillRect(b.x,b.y,b.r,b.r);ctx.globalAlpha=1})}
function orderZone(){panel(214,582,372,74);ctx.fillStyle=C.meal;ctx.font="14px Courier New";centerText("ORDER TRAY",400,606);ctx.fillStyle=C.text;ctx.font="12px Courier New";centerText("Perfect fills = Soda + Sauce",400,628);centerText("Large cups score more",400,644)}
function drawBigCup(x,y,s){const u=4*s;ctx.fillStyle=C.cupDark;ctx.fillRect(x+2*u,y+2*u,14*u,20*u);ctx.fillStyle=C.cup;ctx.fillRect(x+3*u,y+3*u,12*u,18*u);ctx.fillStyle=C.blue;ctx.fillRect(x+4*u,y+9*u,10*u,11*u);ctx.fillStyle=C.white;ctx.fillRect(x+4*u,y+8*u,10*u,2*u);ctx.fillStyle=C.purple;ctx.fillRect(x+11*u,y+5*u,2*u,14*u)}
function levelClear(){const next=Math.min(st.level+1,st.maxLevel);panel(115,182,570,226);ctx.fillStyle=C.green;ctx.font="30px Courier New";centerText(`${LV[st.level-1].name} COMPLETE!`,400,230);ctx.fillStyle=C.text;ctx.font="18px Courier New";centerText(`Score Bonus Added: ${st.level*700}`,400,274);centerText(`Next Order: ${LV[next-1].order}`,400,304);centerText("New cup sizes, faster movement, tighter targets.",400,336);centerText("Press ENTER / Tap for next level",400,366)}
function result(){
panel(44,78,712,510);
const r=st.result;
ctx.fillStyle=r.won?C.green:C.red;
ctx.font="900 38px Arial";
centerText(r.won?"SODA SHIFT COMPLETE!":"KITCHEN CLOSED",400,138);
ctx.fillStyle=C.text;
ctx.font="900 22px Arial";
let x=112,y=192,gap=36;
ctx.fillText(`Final Score: ${r.score}`,x,y); y+=gap;
ctx.fillText(`Levels Cleared: ${r.levelsCleared}/${st.maxLevel}`,x,y); y+=gap;
ctx.fillText(`Best Combo: ${r.rewards.bestCombo}`,x,y); y+=gap;
ctx.fillText(`XP Earned: ${r.rewards.xp}`,x,y); y+=gap;
ctx.fillText(`Daily Streak: ${r.rewards.streak}`,x,y); y+=gap+10;
ctx.fillStyle=C.meal;
ctx.fillText("Ingredient Drops",x,y); y+=34;
ctx.fillStyle=C.text;
ctx.font="900 20px Arial";
const lines=wrap(r.rewards.drops.join(", "),560);
lines.slice(0,3).forEach(line=>{ctx.fillText(line,x,y);y+=28});
y+=8;
if(r.rewards.gotTicket){ctx.fillStyle=C.green;ctx.fillText("Bonus: Mystery Ticket",x,y);y+=30}else{ctx.fillStyle=C.muted;ctx.fillText(`Ticket chance rolled: ${r.rewards.ticketChance}%`,x,y);y+=30}
if(r.rewards.gotFragment){ctx.fillStyle=C.green;ctx.fillText("Ultra Bonus: Recipe Fragment",x,y);y+=30}
ctx.fillStyle=C.white;
ctx.font="900 22px Arial";
centerText("Return to Arcade to play again",400,548);
}
function panel(x,y,w,h){ctx.fillStyle=C.panel;ctx.fillRect(x,y,w,h);ctx.strokeStyle=C.floor;ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);ctx.strokeStyle=C.floorDark;ctx.lineWidth=2;ctx.strokeRect(x+8,y+8,w-16,h-16)}
function centerText(t,x,y){ctx.fillText(t,x-ctx.measureText(t).width/2,y)}
function wrap(text,max){const words=String(text||"").split(/\s+/),lines=[];let line="";for(const w of words){const t=line?line+" "+w:w;if(ctx.measureText(t).width<=max)line=t;else{if(line)lines.push(line);line=w}}if(line)lines.push(line);return lines}
function drawWrapped(lines,x,y,max,lineH,fontSize,col){ctx.fillStyle=col;ctx.font=`${fontSize}px Courier New`;let yy=y;lines.forEach(t=>{wrap(t,max).forEach(l=>{ctx.fillText(l,x,yy);yy+=lineH})})}
function txt(t,x,y,s,col,sh){ctx.font=`${s}px Courier New`;ctx.fillStyle=sh;ctx.fillText(t,x+4,y+4);ctx.fillStyle=col;ctx.fillText(t,x,y)}
function loop(t){const dt=Math.min(.033,(t-st.lastTime)/1000||0);st.lastTime=t;update(dt);draw();requestAnimationFrame(loop)}
function action(){if(st.mode==="title")reset();else if(st.mode==="result")return;else if(st.mode==="levelclear")nextLevel()}
window.addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;if(e.key==="Enter")action();if(["ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault()});
window.addEventListener("keyup",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false});
c.addEventListener("pointerdown",()=>action());
document.querySelectorAll("[data-key]").forEach(b=>{const k=b.getAttribute("data-key");const down=e=>{e.preventDefault();keys[k]=true;if(k==="Space")keys[" "]=true};const up=e=>{e.preventDefault();keys[k]=false;if(k==="Space")keys[" "]=false};b.addEventListener("pointerdown",down);b.addEventListener("pointerup",up);b.addEventListener("pointerleave",up);b.addEventListener("pointercancel",up)});
requestAnimationFrame(loop);
})();
