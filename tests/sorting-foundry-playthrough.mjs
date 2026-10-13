import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/sorting-foundry',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/sorting-foundry/${name}.png`});await writeFile(`output/sorting-foundry/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify({player:n.player,motion:n.motion[n.selectedHero]})}`);}
const swap=async()=>{await press('Tab');await step(600);};
async function select(hero){if((await state()).selectedHero!==hero)await swap();}
function routeSafety(s,end){
 const start=s.player,height=s.motion[s.selectedHero].y,up=height>3;
 const cabin=p=>Math.abs(p.x-9)<=2.12&&p.z>=-2.88&&p.z<=2.12;
 return p=>{
  if(Math.abs(p.x)>15.6||p.z>27.6||p.z< -31.6||p.z< -27.62&&!(s.doorLift>2.8&&Math.abs(p.x+12)<1.4))return false;
  if(up){if(!(p.x>=3.38&&p.x<=15.12&&p.z>=-14.12&&p.z<=-2.5||cabin(p)&&s.elevator.state==='UP'))return false;}
  else{
   if(p.x> -9&&p.x<3&&p.z>8&&!(s.sorting.bridgeLocked&&p.z>=12&&p.z<=16))return false;
   if(p.x>=6.12&&p.x<=11.88&&p.z>=-2.88&&p.z<=2.88&&!(cabin(p)&&s.elevator.state==='DOWN'))return false;
   if(p.x>=11.5&&p.x<=13.5&&p.z>=-2.5&&p.z<2.5)return false;
  }
  if(s.obstacles.some(o=>Math.abs(o.x-p.x)<o.width/2+.39&&Math.abs(o.z-p.z)<o.depth/2+.39))return false;
  if(s.blocks.some(b=>b.state!=='carried'&&Math.abs((b.y??0)-height)<1.2&&Math.abs(b.x-p.x)<b.size/2+.39&&Math.abs(b.z-p.z)<b.size/2+.39))return false;
  if(s.sockets.some(q=>Math.abs((q.y??0)-height)<.5&&(q.acceptedActivator==='HERO'?
   Math.hypot(q.x-end.x,q.z-end.z)>1&&Math.hypot(q.x-start.x,q.z-start.z)>1.5&&Math.hypot(q.x-p.x,q.z-p.z)<1.5:
   Math.abs(q.x-p.x)<(q.halfSize??1.05)+.39&&Math.abs(q.z-p.z)<(q.halfSize??1.05)+.39)))return false;
  return true;
 };
}
async function go(x,z){
 const s=await state(),end={x,z},start=s.player,safe=routeSafety(s,end);
 const segment=(a,b)=>{const count=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1));for(let i=1;i<=count;i++)if(!safe({x:a.x+(b.x-a.x)*i/count,z:a.z+(b.z-a.z)*i/count}))return false;return true;};
 const key=p=>`${p.x},${p.z}`,anchors=[];
 for(let ax=Math.floor(start.x*2)/2-1;ax<=Math.ceil(start.x*2)/2+1;ax+=.5)for(let az=Math.floor(start.z*2)/2-1;az<=Math.ceil(start.z*2)/2+1;az+=.5)anchors.push({x:ax,z:az});
 const origin=anchors.filter(p=>safe(p)&&segment(start,{x:p.x,z:start.z})&&segment({x:p.x,z:start.z},p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];assert.ok(origin,'route origin');
 const queue=[origin],parents=new Map([[key(origin),null]]);let found;
 for(let i=0;i<queue.length&&i<17000;i++){
  const p=queue[i];if(segment(p,{x:end.x,z:p.z})&&segment({x:end.x,z:p.z},end)){found=p;break;}
  for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:p.x+dx,z:p.z+dz};if(!parents.has(key(n))&&safe(n)&&segment(p,n)){parents.set(key(n),p);queue.push(n);}}
 }
 assert.ok(found,`no route from ${JSON.stringify(start)} to ${x},${z}`);const route=[];while(found){route.unshift(found);found=parents.get(key(found));}route.push(end);
 // Merge collinear grid steps to keep the keyboard route compact.
 const corners=route.filter((p,i)=>i===0||i===route.length-1||!((route[i-1].x===p.x&&p.x===route[i+1].x)||(route[i-1].z===p.z&&p.z===route[i+1].z)));
 for(const p of corners){await move('x',p.x);await move('z',p.z);}
}
async function pickup(word){
 const s=await state(),b=s.blocks.find(b=>b.text===word),reach=b.size>1?2:1.55;
 const candidates=(b.state==='socket'?[[0,reach],[0,-reach],[reach,0],[-reach,0]]:[[0,-reach],[0,reach],[reach,0],[-reach,0]]).map(([dx,dz])=>({x:b.x+dx,z:b.z+dz}));
 for(const r of [1.15,1.65])for(let i=0;i<16;i++){const a=i*Math.PI/8;candidates.push({x:b.x+Math.sin(a)*r,z:b.z+Math.cos(a)*r});}
 let found=false;for(const p of candidates){if(routeSafety(s,p)(p)&&s.blocks.every(other=>other===b||other.state==='carried'||Math.abs((other.y??0)-(b.y??0))>.6||Math.hypot(other.x-p.x,other.z-p.z)>Math.hypot(b.x-p.x,b.z-p.z)+.02)){try{await go(p.x,p.z);found=true;break;}catch(e){if(!/no route|route origin/.test(e.message))throw e;}}}assert.ok(found,`pickup approach ${word}`);
 await press('e');if(word==='HEAVY')await step(600);const picked=await state();assert.equal(picked.carried,word);
 // Carry cargo out through the open rear before making a sideways turn by the rails.
 if(Math.abs(picked.player.x-9)<=2.12&&Math.abs(picked.player.z)<=2.12)await move('z',-4);
}
async function place(word,slot){await pickup(word);const q=(await state()).sockets[slot];await go(q.x,q.z+1.8);await press('e');assert.equal((await state()).placed[slot],word);}
async function freshBridge(){for(let i=0;i<120;i++){if((await state()).bridge.time%5.5<.05)break;await step(50);}await step(850);assert.ok((await state()).bridge.extension>.98);}

try{
 await page.goto('http://127.0.0.1:5188/?room=6&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);assert.equal((await state()).room,'sorting');await shot('01-entrance');
 await select('mia');await go(-13,20);await press('e');assert.equal((await state()).heavyAction.kind,'HEAVY_STRUGGLE');await step(3100);assert.equal((await state()).carried,null);
 await select('yuki');await pickup('HEAVY');await go(-13,15);await press('e');assert.equal((await state()).sorting.heavyActive,true);await shot('02-heavy-power');
 await go(-10,14);await freshBridge();await hold('d',2900);await press('Tab');await step(1200);assert.equal((await state()).motion.yuki.y,-3);await shot('03-safe-fall-handoff');
 await select('yuki');await move('z',25);await move('x',-4.1);await shot('03b-lower-recovery');await move('x',-9.8);await step(300);assert.equal((await state()).motion.yuki.y,0);await shot('04-recovery-stair');
 await select('mia');await go(-10,14);await freshBridge();await hold('d',2000);await step(50);assert.ok((await state()).player.x>3.5);assert.equal((await state()).motion.mia.y,0);await go(5,14);assert.equal((await state()).sorting.bridgeLocked,true);await shot('05-crossing-locked');
 await go(5,17);await select('yuki');await go(9,0);await select('mia');await go(5,1);await step(4400);assert.equal((await state()).motion.yuki.y,5);await shot('06-lift-ascent');
 await select('yuki');await go(9,-5);await shot('07-upper-words');
 for(const word of ['RED','PEAR','YELLOW']){await pickup(word);if(word==='PEAR')await move('z',-4.6);const lane=word==='RED'?8:word==='PEAR'?10:9;await go(lane,-4.6);await move('z',word==='YELLOW'?-1:0);await press('e');assert.equal((await state()).carried,null);assert.equal((await state()).blocks.find(b=>b.text===word).y,5);await go(9,-5);}
 await shot('08-three-word-cargo');await go(5,-5);await step(4400);assert.equal((await state()).elevator.state,'DOWN');await select('mia');await go(5,3.3);
 // Unload the nearest cabin cube first so the rear two have a clear carry path.
 await pickup('YELLOW');await go(0,-14);await press('e');assert.equal((await state()).carried,null);
 await place('GREEN',2);await place('PEAR',3);assert.equal((await state()).slotFeedback[2],'correct');await shot('09-green-pear');
 await place('APPLE',0);await place('RED',1);assert.equal((await state()).slotFeedback[0],'wrong');assert.equal((await state()).slotFeedback[2],'correct');await shot('10-reversed-pair');
 await pickup('RED');await go(-5,-14);await press('e');assert.equal((await state()).carried,null);await place('APPLE',1);await place('RED',0);assert.equal((await state()).slotFeedback[0],'correct');
 await place('BLUE',4);await place('BANANA',5);assert.equal((await state()).slotFeedback[4],'wrong');await pickup('BLUE');await go(2,-14);await press('e');await place('YELLOW',4);await step(5000);assert.equal((await state()).solved,true);assert.equal((await state()).escaped,false);await shot('11-sorting-complete');
 // A correct pair stays removable; its removal never clears another station.
 await pickup('GREEN');assert.equal((await state()).solved,false);assert.equal((await state()).slotFeedback[0],'correct');const green=(await state()).sockets[2];await go(green.x,green.z+1.8);await press('e');await step(5000);
 assert.equal((await state()).motion.yuki.y,5);await go(5,1);await step(4400);await select('yuki');await go(9,0);await select('mia');await go(5,3.3);await go(5,1);await step(4400);assert.equal((await state()).motion.yuki.y,0);await shot('12-team-retrieval');
 await go(5,3.3);await select('yuki');await go(9,-4);await go(-12,-30);await step(22000);assert.equal((await state()).room,'action');assert.equal((await state()).camera.distance,6);await shot('13-team-exit-default-zoom');
 await page.goto('http://127.0.0.1:5188/?room=6&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await press('r');assert.equal((await state()).elevator.state,'DOWN');assert.equal((await state()).solved,false);await shot('14-reset');
 await page.mouse.move(720,600);await page.mouse.wheel(0,5000);await step(1000);assert.equal((await state()).camera.targetDistance,9);await shot('15-zoom-out');await page.mouse.wheel(0,-10000);await step(1000);assert.equal((await state()).camera.targetDistance,4);await shot('16-zoom-in');await press('r');assert.equal((await state()).camera.distance,6);
 await page.setViewportSize({width:960,height:640});await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await step(0);await shot('17-small-window');assert.deepEqual(errors,[]);console.log('Room 6 complete keyboard route, safe fall, cargo, wrong/reversed/removed pairs, reunion, default zoom and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
