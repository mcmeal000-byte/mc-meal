
(() => {
const c=document.getElementById("game"),ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;
const W=c.width,H=c.height;
const C={bg:"#171923",wallA:"#1d1821",wallB:"#221b25",floor:"#f0a63a",floorDark:"#8b4a22",text:"#fff3d0",meal:"#ffce4a",green:"#67e89a",red:"#e95d45",black:"#0d0f14",white:"#fff8df",fry:"#f4c34f",fryDark:"#b86b20",sauce:"#e45345",gold:"#ffd34d",bad:"#4b3328",cyan:"#52f0cf"};
const keys=Object.create(null);
const LV=[
 {name:"LEVEL 1",order:"FRY STARTER",duration:45,spawn:.82,speed:125,bad:.18,gold:.03},
 {name:"LEVEL 2",order:"SAUCE RUSH",duration:45,spawn:.68,speed:145,bad:.22,gold:.04},
 {name:"LEVEL 3",order:"DOUBLE FRY",duration:50,spawn:.55,speed:170,bad:.25,gold:.05},
 {name:"LEVEL 4",order:"NIGHT SHIFT",duration:50,spawn:.44,speed:195,bad:.30,gold:.06},
 {name:"LEVEL 5",order:"GOLDEN FRY WAR",duration:55,spawn:.34,speed:225,bad:.34,gold:.08}
];
const st={mode:"title",level:1,maxLevel:5,score:0,lives:3,combo:0,bestCombo:0,timer:45,lastTime:0,spawnTimer:0,boostCooldown:0,boostTime:0,message:"",result:null,runFinished:false,daily:getDaily()};
const p={x:370,y:555,w:72,h:22,speed:310};
const items=[];
function getDaily(){return{today:new Date().toDateString(),last:localStorage.getItem("mcmeal_fry_last_play"),streak:Number(localStorage.getItem("mcmeal_fry_streak")||"0")}}
function updateStreak(){const today=new Date().toDateString(),last=localStorage.getItem("mcmeal_fry_last_play");let s=Number(localStorage.getItem("mcmeal_fry_streak")||"0");if(last!==today){if(last){const d=Math.round((new Date(today)-new Date(last))/(86400000));s=d===1?s+1:1}else s=1;localStorage.setItem("mcmeal_fry_last_play",today);localStorage.setItem("mcmeal_fry_streak",String(s))}st.daily=getDaily()}
function reset(){st.mode="play";st.level=1;st.score=0;st.lives=3;st.combo=0;st.bestCombo=0;st.timer=LV[0].duration;st.spawnTimer=.5;st.boostCooldown=0;st.boostTime=0;st.message="Level 1 started";st.result=null;st.runFinished=false;p.x=W/2-p.w/2;items.length=0;setTimeout(()=>{if(st.mode==="play")st.message=""},850)}
function setupLevel(n){const d=LV[n-1];st.timer=d.duration;st.spawnTimer=.6;st.boostTime=0;st.message=d.name+" started";items.length=0;p.x=W/2-p.w/2;setTimeout(()=>{if(st.mode==="play")st.message=""},850)}
function update(dt){if(st.mode!=="play")return;st.timer-=dt;st.spawnTimer-=dt;st.boostCooldown=Math.max(0,st.boostCooldown-dt);st.boostTime=Math.max(0,st.boostTime-dt);move(dt);spawn();updateItems(dt);if(st.timer<=0)clearLevel()}
function move(dt){let dir=0;if(keys.ArrowLeft||keys.a)dir--;if(keys.ArrowRight||keys.d)dir++;const boost=st.boostTime>0?1.55:1;p.x+=dir*p.speed*boost*dt;p.x=Math.max(28,Math.min(W-p.w-28,p.x));if((keys.Space||keys[" "])&&st.boostCooldown<=0){st.boostTime=.65;st.boostCooldown=4;st.message="Tray boost!";setTimeout(()=>{if(st.mode==="play"&&st.message==="Tray boost!")st.message=""},500)}}
function spawn(){const d=LV[st.level-1];if(st.spawnTimer>0)return;let type="fry",r=Math.random();if(r<d.gold)type="golden";else if(r<d.gold+d.bad)type=Math.random()<.5?"burnt":"rat";else if(r<.55)type="fry";else if(r<.78)type="sauce";else type="nugget";const size=type==="rat"?30:26;items.push({type,x:40+Math.random()*(W-80-size),y:78,w:size,h:size,vy:d.speed+Math.random()*60+st.level*6,wobble:Math.random()*6.28});st.spawnTimer=d.spawn*(.75+Math.random()*.55)}
function isGood(t){return["fry","sauce","nugget","golden"].includes(t)}
function updateItems(dt){for(let i=items.length-1;i>=0;i--){const it=items[i];it.y+=it.vy*dt;it.x+=Math.sin(it.y*.02+it.wobble)*.35;if(hit(it,p)){collect(it);items.splice(i,1);continue}if(it.y>H-74){if(isGood(it.type)){st.combo=0;msg("Missed order!")}items.splice(i,1)}}}
function collect(it){if(isGood(it.type)){const pts=it.type==="golden"?500:it.type==="sauce"?160:it.type==="nugget"?130:100;st.combo++;st.bestCombo=Math.max(st.bestCombo,st.combo);st.score+=pts+Math.min(500,st.combo*12);if(it.type==="golden")msg("Golden fry! +500");else if(st.combo%10===0)msg(st.combo+" combo!")}else{st.lives--;st.combo=0;msg(it.type==="rat"?"Kitchen rat! -1 life":"Burnt food! -1 life");if(st.lives<=0)finish(false)}}
function msg(m){st.message=m;setTimeout(()=>{if(st.mode==="play")st.message=""},650)}
function clearLevel(){st.score+=st.level*650+st.combo*10;if(st.level<st.maxLevel){st.mode="levelclear";items.length=0}else finish(true)}
function nextLevel(){st.level++;setupLevel(st.level);st.mode="play"}

  function postMCMealReward() {
    try {
      const result = st.result;
      if (!result || result._postedToHub) return;
      result._postedToHub = true;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "MCMEAL_GAME_RESULT",
          game: "Fry Rush",
          score: result.score || st.score || 0,
          won: !!result.won,
          levelsCleared: result.levelsCleared || st.level || 1,
          rewards: result.rewards || {}
        }, "*");
      }
    } catch (err) {}
  }

function finish(won){if(st.runFinished)return;st.runFinished=true;updateStreak();st.result={won,score:st.score,levelsCleared:st.level,rewards:rewards(won)};st.mode="result";postMCMealReward();items.length=0}
function rewards(won){let fries=1,sauce=0,xp=25,ticket=0,frag=0;if(st.score>=1500){fries=2;xp=55}if(st.score>=4000){fries=4;sauce=1;xp=110;ticket=5}if(st.score>=8000){fries=6;sauce=2;xp=180;ticket=10;frag=1}xp+=(st.level-1)*30;ticket+=(st.level-1)*2;if(won){xp+=100;ticket+=3}const drops=[];for(let i=0;i<fries;i++)drops.push("Fries");for(let i=0;i<sauce;i++)drops.push("Sauce");if(st.bestCombo>=20)drops.push("Combo Spice");return{drops,xp,ticketChance:ticket,fragmentChance:frag,gotTicket:Math.random()*100<ticket,gotFragment:Math.random()*100<frag,streak:Number(localStorage.getItem("mcmeal_fry_streak")||"0"),bestCombo:st.bestCombo}}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function draw(){bg();if(st.mode==="title"){title();return}playfield();items.forEach(drawItem);drawPlayer();hud();orderZone();if(st.mode==="levelclear")levelClear();if(st.mode==="result")result()}
function bg(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66)}
function playfield(){ctx.fillStyle="#0e1017";ctx.fillRect(0,66,W,510);for(let y=80;y<570;y+=38)for(let x=0;x<W;x+=52){ctx.fillStyle=(x+y)%104===0?"#1b1721":"#211923";ctx.fillRect(x,y,48,34)}ctx.fillStyle=C.floor;ctx.fillRect(70,98,W-140,14);ctx.fillStyle=C.floorDark;ctx.fillRect(70,112,W-140,8);for(let x=86;x<W-80;x+=42){ctx.fillStyle="#ffd066";ctx.fillRect(x,101,20,3)}ctx.fillStyle="#090b11";ctx.fillRect(0,575,W,85);ctx.fillStyle=C.floorDark;ctx.fillRect(0,575,W,8)}
function hud(){const d=LV[st.level-1];ctx.fillStyle="#100d12";ctx.fillRect(0,0,W,66);ctx.fillStyle=C.meal;ctx.font="22px Courier New";ctx.fillText("MC MEAL: FRY RUSH",20,26);ctx.fillStyle=C.text;ctx.font="18px Courier New";ctx.fillText(`Score ${st.score}`,20,54);ctx.fillText(`Lives ${st.lives}`,165,54);ctx.fillText(`Level ${st.level}/${st.maxLevel}`,285,54);ctx.fillText(`Time ${Math.ceil(st.timer)}s`,455,54);ctx.fillText(`Combo ${st.combo}`,610,54);if(st.message){ctx.fillStyle=C.green;ctx.font="16px Courier New";ctx.fillText(st.message,470,26)}ctx.fillStyle=C.white;ctx.font="13px Courier New";ctx.fillText(d.order,20,82)}
function title(){txt("MC MEAL",210,140,54,C.meal,"#74311f");txt("FRY RUSH",225,215,40,C.white,"#74311f");fryBox(355,285,2.2);panel(150,385,500,150);ctx.fillStyle=C.text;ctx.font="19px Courier New";ctx.fillText("Catch fries, sauce and golden drops.",185,430);ctx.fillText("Avoid burnt food and kitchen rats.",205,462);ctx.fillText("Build combo streaks for better rewards.",185,494);ctx.fillText("Press ENTER or tap canvas to start",210,524)}
function orderZone(){panel(248,590,304,58);ctx.fillStyle=C.meal;ctx.font="15px Courier New";ctx.fillText("ORDER TRAY",354,612);ctx.fillStyle=C.text;ctx.font="13px Courier New";ctx.fillText("fries + sauce + combo = better craft drops",265,636)}
function drawPlayer(){ctx.fillStyle=st.boostTime>0?C.cyan:C.floor;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle=C.floorDark;ctx.fillRect(p.x+6,p.y+p.h-6,p.w-12,6);ctx.fillStyle=C.white;ctx.fillRect(p.x+10,p.y+4,p.w-20,4);ctx.fillStyle="#6f351e";ctx.fillRect(p.x+p.w/2-5,p.y+p.h,10,20)}
function drawItem(it){if(it.type==="fry")fry(it.x,it.y,1);else if(it.type==="golden"){fry(it.x,it.y,1);ctx.fillStyle=C.gold;ctx.fillRect(it.x-2,it.y-2,6,6);ctx.fillStyle=C.white;ctx.fillRect(it.x+2,it.y+2,5,3)}else if(it.type==="sauce")sauce(it.x,it.y,1);else if(it.type==="nugget")nugget(it.x,it.y,1);else if(it.type==="burnt")burnt(it.x,it.y,1);else rat(it.x,it.y,1)}
function fry(x,y,s){const u=4*s;ctx.fillStyle=C.fry;ctx.fillRect(x+2*u,y,3*u,7*u);ctx.fillRect(x+5*u,y+u,3*u,7*u);ctx.fillRect(x+8*u,y-u,3*u,8*u);ctx.fillStyle=C.fryDark;ctx.fillRect(x+2*u,y+6*u,9*u,2*u)}
function sauce(x,y,s){const u=4*s;ctx.fillStyle=C.sauce;ctx.fillRect(x+u,y+2*u,6*u,6*u);ctx.fillStyle=C.white;ctx.fillRect(x+2*u,y+u,4*u,2*u);ctx.fillStyle=C.black;ctx.fillRect(x+3*u,y+4*u,2*u,u)}
function nugget(x,y,s){const u=4*s;ctx.fillStyle="#d98b3a";ctx.fillRect(x+u,y+2*u,7*u,5*u);ctx.fillStyle="#f2bc62";ctx.fillRect(x+2*u,y+2*u,4*u,2*u)}
function burnt(x,y,s){const u=4*s;ctx.fillStyle=C.bad;ctx.fillRect(x+u,y+2*u,7*u,5*u);ctx.fillStyle="#1c1110";ctx.fillRect(x+2*u,y+4*u,4*u,2*u);ctx.fillStyle=C.red;ctx.fillRect(x+6*u,y+u,2*u,2*u)}
function rat(x,y,s){const u=4*s;ctx.fillStyle="#9a8f86";ctx.fillRect(x+u,y+3*u,7*u,4*u);ctx.fillRect(x+6*u,y+2*u,3*u,3*u);ctx.fillStyle=C.black;ctx.fillRect(x+8*u,y+3*u,u,u);ctx.fillStyle="#d8b0a4";ctx.fillRect(x-2*u,y+5*u,3*u,u)}
function fryBox(x,y,s){const u=4*s;ctx.fillStyle=C.red;ctx.fillRect(x+2*u,y+8*u,14*u,12*u);ctx.fillStyle="#b82725";ctx.fillRect(x+3*u,y+10*u,12*u,10*u);ctx.fillStyle=C.meal;ctx.font=`${10*s}px Courier New`;ctx.fillText("MC",x+6*u,y+16*u);for(let i=0;i<8;i++){ctx.fillStyle=C.fry;ctx.fillRect(x+(3+i*1.4)*u,y+(i%3)*u,0.9*u,10*u)}}
function levelClear(){const next=Math.min(st.level+1,st.maxLevel);panel(150,190,500,200);ctx.fillStyle=C.green;ctx.font="30px Courier New";ctx.fillText(`${LV[st.level-1].name} COMPLETE!`,180,235);ctx.fillStyle=C.text;ctx.font="19px Courier New";ctx.fillText(`Score Bonus Added: ${st.level*650}`,210,280);ctx.fillText(`Next Order: ${LV[next-1].order}`,205,310);ctx.fillText("More drops. More bad food. Faster kitchen.",175,342);ctx.fillText("Press ENTER / Tap for next level",205,370)}
function result(){panel(80,74,640,486);const r=st.result;ctx.fillStyle=r.won?C.green:C.red;ctx.font="32px Courier New";ctx.fillText(r.won?"FRY SHIFT COMPLETE!":"KITCHEN CLOSED!",120,126);ctx.fillStyle=C.text;ctx.font="18px Courier New";ctx.fillText(`Final Score: ${r.score}`,150,172);ctx.fillText(`Levels Cleared: ${r.levelsCleared}/${st.maxLevel}`,150,200);ctx.fillText(`Best Combo: ${r.rewards.bestCombo}`,150,228);ctx.fillText(`XP Earned: ${r.rewards.xp}`,150,256);ctx.fillText(`Daily Streak: ${r.rewards.streak}`,150,284);ctx.fillStyle=C.meal;ctx.fillText("Ingredient Drops:",150,326);ctx.fillStyle=C.text;ctx.font="17px Courier New";const dropLines=wrapLines(r.rewards.drops.join(", "),360);let y=356;dropLines.forEach(line=>{ctx.fillText(line,150,y);y+=22});y+=8;if(r.rewards.gotTicket){ctx.fillStyle=C.green;ctx.fillText("Bonus: Mystery Order Ticket!",150,y);y+=26}else{ctx.fillStyle="#b9a88a";ctx.fillText(`Ticket chance rolled: ${r.rewards.ticketChance}%`,150,y);y+=26}if(r.rewards.gotFragment){ctx.fillStyle=C.green;ctx.fillText("Ultra Bonus: Rare Recipe Fragment!",150,y);y+=26}ctx.fillStyle=C.white;ctx.font="18px Courier New";ctx.fillText("Press ENTER / Tap to play again",150,528)}
function wrapLines(text,maxWidth){const words=text.split(/\s+/);const lines=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width<=maxWidth)line=test;else{if(line)lines.push(line);line=word}}if(line)lines.push(line);return lines}
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
