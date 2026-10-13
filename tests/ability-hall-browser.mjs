import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
const artifactDir=`output/sentence-carousel/${process.env.ABILITY_HERO??'mia'}`;
page.on('pageerror',e=>errors.push(String(e)));await mkdir(artifactDir,{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`${artifactDir}/${name}.png`});await writeFile(`${artifactDir}/${name}.json`,JSON.stringify(await state(),null,2));};
async function moveWorld(axis,target){let s=await state();for(let i=0;i<70&&Math.abs(s.player[axis]-target)>.035;i++){
 const d=target-s.player[axis],speed=s.motion[s.selectedHero].grounded?(s.selectedHero==='mia'?7:3.5):5;
 await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.min(300,Math.abs(d)/speed*1000));const n=await state();if(n.escaped)return;
 if(Math.abs(n.player[axis]-s.player[axis])<.001&&Math.abs(d)>.18)throw Error(`blocked ${axis} ${target}: ${JSON.stringify(n.player)} carry=${n.carried} hint=${n.message}`);s=n;
 }assert.ok(Math.abs(s.player[axis]-target)<.18);}
const move=(axis,target)=>moveWorld(axis,target*1.4);
const select=async hero=>{if((await state()).selectedHero!==hero){await press('Tab');await step(600);}};
// Navigate the switched hero around pads instead of assuming the NPC parked in an aisle.
async function routeTo(x,z){
 const s=await state(),start=s.player,r=.4,cargoMargin=s.carried?1.55:r;
 const safe=(p,footOnly=false)=>{
  const margin=footOnly?r:cargoMargin;
  const extra=s.bounds.optionalAreas.some(a=>p.x>=a.left+r&&p.x<=a.right-r&&p.z>=a.back+r&&p.z<=a.front-r);
  if(!extra&&(Math.abs(p.x)>s.bounds.halfWidth-r||p.z>s.bounds.halfDepth-r||p.z<s.bounds.exitZ+r))return false;
  if(s.ability.carousels.some(c=>Math.hypot(p.x-c.position.x,p.z-c.position.z)<c.fenceRadius+.439+(s.carried&&!footOnly?1.1:0)))return false;
  if(s.obstacles.some(o=>Math.abs(p.x-o.x)<o.width/2+margin&&Math.abs(p.z-o.z)<o.depth/2+margin))return false;
  if(s.sockets.some(q=>q.acceptedActivator!=='HERO'&&Math.abs(p.x-q.x)<(q.halfSize??1.05)+r&&Math.abs(p.z-q.z)<(q.halfSize??1.05)+r))return false;
  if(s.blocks.some(b=>b.state!=='carried'&&Math.abs(p.x-b.x)<b.size/2+margin&&Math.abs(p.z-b.z)<b.size/2+margin))return false;
  if(Math.abs(p.x-22*1.4)<1.4+margin&&[-4,-6].some(a=>Math.abs(p.z-a*1.4)<1.19+margin))return false;
  if(!s.ability.cornerOpen&&Math.abs(p.x)<1.12&&p.z>5.18&&p.z<14.42)return false;
  if(!s.ability.buildOpen&&p.z< -8.96&&p.z> -10.64&&p.x>4.2)return false;
  return true;
 };
 const segment=(a,b,footOnly=false)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.08);for(let i=0;i<=n;i++)if(!safe({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},footOnly))return false;return true;};
 const anchors=[];for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++)anchors.push({x:Math.round(start.x*2)/2+dx*.5,z:Math.round(start.z*2)/2+dz*.5});
 // A pickup can begin outside the conservative cargo margin. Bootstrap a clear
 // short hero route in either axis order, then use wide carrying clearance.
 const order=p=>segment(start,{x:p.x,z:start.z},true)&&segment({x:p.x,z:start.z},p,true)?'x':segment(start,{x:start.x,z:p.z},true)&&segment({x:start.x,z:p.z},p,true)?'z':null;
 const origin=anchors.filter(p=>safe(p)&&order(p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];assert.ok(origin,'route origin');
 const key=p=>`${p.x},${p.z}`,queue=[origin],parents=new Map([[key(origin),null]]);let end;
 for(let i=0;i<queue.length&&i<40000;i++){
  const p=queue[i];if(Math.hypot(p.x-x,p.z-z)<.5){end=p;break;}
  for(const [dx,dz]of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const q={x:p.x+dx,z:p.z+dz};if(!parents.has(key(q))&&safe(q)&&segment(p,q)){parents.set(key(q),p);queue.push(q);}}
 }
 assert.ok(end,`no route to ${x},${z}`);const path=[];for(let p=end;p;p=parents.get(key(p)))path.unshift(p);
 if(order(origin)==='x'){await moveWorld('x',origin.x);await moveWorld('z',origin.z);}else{await moveWorld('z',origin.z);await moveWorld('x',origin.x);}
 for(let i=1;i<path.length;i++){const p=path[i],next=path[i+1],prev=path[i-1];if(next&&(next.x-p.x===p.x-prev.x)&&(next.z-p.z===p.z-prev.z))continue;await moveWorld('x',p.x);await moveWorld('z',p.z);}
 await moveWorld('x',x);await moveWorld('z',z);
}
const brakeOperators=new Map();
async function alignWord(index,slot){
 let s=await state(),machineIndex=s.ability.carousels.findIndex(c=>c.trays.some(t=>t.blockId===index&&t.attached));
 if(machineIndex<0)return;
 const retriever=s.selectedHero,operator=brakeOperators.get(machineIndex);assert.ok(operator);
 await select(operator);s=await state();let c=s.ability.carousels[machineIndex];const q=s.sockets[c.brakeControlId];
 // Release the plate, watch the requested word approach its station-facing port,
 // then physically walk back onto the brake. No simulation state is modified.
 await routeTo(q.x,q.z+1.3);await step(400);s=await state();c=s.ability.carousels[machineIndex];
 const port=c.pickupPorts[s.sockets[slot].x<c.position.x?0:1],trayIndex=c.wordBlocks.indexOf(index),speed=s.selectedHero==='mia'?7:3.5;
 const lead=c.speed*((1.3-.93)/speed+.04+1/60+.15);
 const desired=port.angle-trayIndex*Math.PI*2/c.wordBlocks.length-c.direction*lead;
 const distance=((desired-c.angle)*c.direction%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
 await step(distance/c.speed*1000);await moveWorld('z',q.z);await step(400);
 c=(await state()).ability.carousels[machineIndex];assert.equal(c.stopped,true);assert.notEqual(c.trays.find(t=>t.blockId===index).alignedPort,null,`word ${index} missed opening`);
 await select(retriever);assert.equal((await state()).companion.state,'HOLD_POSITION');
 await shot(`timed-word-${index}`);
}
async function place(index,slot){
 await alignWord(index,slot);
 const s=await state(),b=s.blocks[index],q=s.sockets[slot];
 const c=s.ability.carousels.find(c=>c.trays.some(t=>t.blockId===index&&t.attached));
 let approach;if(c){assert.equal(c.stopped,true);const dx=b.x-c.position.x,dz=b.z-c.position.z,r=Math.hypot(dx,dz);approach={x:b.x+dx/r*1.45,z:b.z+dz/r*1.45};}
 else approach={x:b.x,z:b.z+1.4};
 await routeTo(approach.x,approach.z);
 // Tiny directional input aims the hands inward; it cannot enter the excluded ring.
 const dx=b.x-approach.x,dz=b.z-approach.z;
 const keys=[];if(Math.abs(dx)>.15)keys.push(dx>0?'d':'a');if(Math.abs(dz)>.15)keys.push(dz>0?'s':'w');
 for(const key of keys)await page.keyboard.down(key);await step(300);for(const key of keys)await page.keyboard.up(key);
 await press('e');if(b.weightClass==='heavy')await step(600);assert.equal((await state()).carried,b.text,`pickup ${index}: ${(await state()).message}`);
 if(c)assert.equal((await state()).ability.carousels.find(m=>m.id===c.id).trays.find(t=>t.blockId===index).attached,false);
 await routeTo(q.x,q.z+1.9);await hold('w',30);await press('e');assert.equal((await state()).placed[slot],b.text,`place ${slot}: ${(await state()).message}`);
 await moveWorld('z',q.z+3.6);
}
async function brake(machineIndex){
 const s=await state(),c=s.ability.carousels[machineIndex],q=s.sockets[c.brakeControlId];
 await routeTo(q.x,q.z);await step(400);assert.equal((await state()).ability.carousels[machineIndex].stopped,true);
 await shot(`brake-${machineIndex+1}`);
 if(machineIndex===0){await page.setViewportSize({width:960,height:640});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await step(0);await shot('brake-1-small-screen');await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await step(0);}
 const operator=(await state()).selectedHero;
 for(let i=0;i<6;i++){await press('Tab');await step(100);}if((await state()).selectedHero===operator)await press('Tab');await step(800);
 assert.equal((await state()).companion.state,'HOLD_POSITION');assert.equal((await state()).ability.carousels[machineIndex].stopped,true);
 brakeOperators.set(machineIndex,operator);return operator;
}
try{
 await page.goto('http://127.0.0.1:5188/?room=8&hero='+ (process.env.ABILITY_HERO??'mia'));await page.waitForFunction(()=>window.render_game_to_text);await step(0);await shot('01-entrance');
 assert.equal((await state()).room,'ability');
 await select('mia');await place(17,18);await place(18,19);await place(0,0);await step(2100);await shot('02-mia-can-run');
 await select('yuki');await place(19,20);await place(20,21);await place(1,1);
 await routeTo(-7,9.8);await step(800);assert.equal((await state()).ability.cornerOpen,true);
 await select('mia');await routeTo(-7,9.8);await move('x',1.5);await move('z',9.2);await move('x',5);await move('z',7);await step(800);
 assert.equal((await state()).ability.heroActive[1],true);await shot('03-far-hold');
 await select('yuki');await move('x',-7);await step(200);assert.equal((await state()).ability.cornerOpen,true); // far hero now holds
 await move('x',1.5);await move('z',9.2);await move('x',14.5);await move('z',7);await step(100);assert.equal((await state()).ability.cornerJoined,true);await shot('03-corner-reveal');await move('z',4.1);
 // Observe full speed and confirm E cannot pick up a moving word.
 let s=await state(),c=s.ability.carousels[0],b=s.blocks[2];
 await routeTo(25,8.3);await step(400);await shot('04-moving-reveal');
 // Exercise release before the cooperative retrieval run.
 await routeTo(25,11.5);await step(500);assert.ok((await state()).ability.carousels[0].velocity>0);
 await routeTo(25,6.8);await step(500);s=await state();assert.equal(s.hint,'');await press('e');assert.equal((await state()).carried,null);await shot('04-full-speed-no-pickup');
 await brake(0);
 for(const [b,slot] of [[3,5],[5,6],[8,7]])await place(b,slot);
 assert.equal((await state()).ability.completed[3],true);await shot('05-yuki-can-lift');
 for(const [b,slot] of [[4,2],[2,3],[6,4]])await place(b,slot);
 assert.equal((await state()).ability.completed[2],false);await shot('06-wrong-order');
 // Retrieve CAN then MIA and put them in safe floor staging, retaining RUN.
 for(const [slot,x,z] of [[2,10,9],[3,14,9]]){
  s=await state();const q=s.sockets[slot];await routeTo(q.x,q.z+1.7);await hold('w',30);await press('e');assert.ok((await state()).carried);
  await routeTo(x,z);await press('e');assert.equal((await state()).carried,null);
 }
 await place(2,2);await place(4,3);assert.equal((await state()).ability.buildOpen,true);await shot('07-gate-lifting');await step(2100);await shot('07-build-complete');
 // Let the unused decoy tray move again; solved words remain locked in their sockets.
 await select((await state()).controllers.companion);await routeTo(25,11.5);await step(500);s=await state();assert.ok(s.ability.carousels[0].velocity>0);assert.equal(s.ability.carousels[0].trays.filter(t=>t.attached).length,1);
 await routeTo(25,-13.3);await shot('08-second-machine');await brake(1);
 for(const [b,slot] of [[10,11],[12,12],[14,13],[9,8],[11,9],[13,10]])await place(b,slot);
 assert.equal((await state()).ability.carousels[1].trays.filter(t=>t.attached).length,2);assert.deepEqual((await state()).ability.completed,Array(6).fill(true));assert.equal((await state()).solved,true);await step(4500);await shot('09-both-can-jump');
 assert.notEqual((await state()).companion.state,'HOLD_POSITION');await shot('10-centered-exit');
 await routeTo(25,-32);await moveWorld('z',-36.68);await step(18000);assert.equal((await state()).escaped,true);await shot('11-team-complete');
 const coins=(await state()).economy.heroCoins;await press('r');assert.deepEqual((await state()).ability.completed,Array(6).fill(false));assert.equal((await state()).economy.heroCoins,coins);await shot('11-reset');
 await page.setViewportSize({width:960,height:640});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await step(0);await shot('12-small-screen');assert.deepEqual(errors,[]);
 console.log('Room 8 carousel real keyboard route, fixed CAN, cargo switching, reverse panel completion, wrong-order retrieval/correction, JUMP generalization, manual cooperation, team exit and persistent reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}

