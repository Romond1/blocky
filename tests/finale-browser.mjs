import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await mkdir('output/finale',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/finale/${name}.png`});await writeFile(`output/finale/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){for(let i=0;i<90;i++){
 const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.09)return;
 const speed=(s.selectedHero==='mia'?7:3.5),key=axis==='x'?(d>0?'d':'a'):(d>0?'s':'w');
 await hold(key,Math.min(200,Math.abs(d)/speed*1000));const n=await state();
 if(n.room!==s.room)return;
 if(n.finale.assembly==='playing'){await shot('assembly');await step(6500);continue;}
 if(Math.abs(n.player[axis]-s.player[axis])<.001)throw Error(`blocked ${axis} -> ${target} at ${JSON.stringify(n.player)} carry ${n.carried} ${n.message}`);
}throw Error('move timed out');}
const to=async(x,z)=>{await move('x',x);await move('z',z);};
const select=async h=>{if((await state()).selectedHero!==h){await press('Tab');await step(500);}};
// Physical half-unit route planning for the language hall, avoiding words and pads.
async function hallRoute(x,z){const s=await state(),start=s.player;
 const safe=p=>p.x>-13.5&&p.x<13.5&&p.z>=-61.2&&p.z<=-40&&
  !s.obstacles.some(o=>Math.abs(p.x-o.x)<o.width/2+(s.carried?1.6:.4)&&Math.abs(p.z-o.z)<o.depth/2+(s.carried?1.6:.4))&&
  !s.sockets.some(q=>q.acceptedActivator!=='HERO'&&Math.abs(p.x-q.x)<.65+.39&&Math.abs(p.z-q.z)<.65+.39)&&
  !s.blocks.some(b=>b.state!=='carried'&&Math.abs((b.y??0))<.4&&Math.hypot(Math.max(0,Math.abs(p.x-b.x)-b.size/2),Math.max(0,Math.abs(p.z-b.z)-b.size/2))<(s.carried&&Math.hypot(p.x-x,p.z-z)>2?1.5:.4));
 const segment=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1);for(let i=1;i<=n;i++)if(!safe({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true;};
 const anchors=[];for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++)anchors.push({x:Math.round(start.x*2)/2+dx*.5,z:Math.round(start.z*2)/2+dz*.5});
 const origin=anchors.filter(p=>safe(p)&&segment(start,p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];assert.ok(origin);
 const key=p=>`${p.x},${p.z}`,queue=[origin],parents=new Map([[key(origin),null]]);let end;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(Math.hypot(p.x-x,p.z-z)<.4&&segment(p,{x,z})){end=p;break;}
 for(const [dx,dz]of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const q={x:p.x+dx,z:p.z+dz};if(!parents.has(key(q))&&safe(q)&&segment(p,q)){parents.set(key(q),p);queue.push(q);}}}
 assert.ok(end,`no hall route to ${x},${z}`);const path=[];for(let p=end;p;p=parents.get(key(p)))path.unshift(p);
 for(let i=0;i<path.length;i++){const p=path[i],next=path[i+1],prev=path[i-1];if(next&&prev&&next.x-p.x===p.x-prev.x&&next.z-p.z===p.z-prev.z)continue;await move('x',p.x);await move('z',p.z);}
 await move('x',x);await move('z',z);
}
async function placeWord(id){const q=(await state()).sockets[id];await hallRoute(q.x,q.z+1.35);await hold('w',20);await press('e');assert.equal((await state()).blocks[id].slot,id,`place word ${id}`);}
async function crossNorth(){await move('z',-41);await move('x',-7);await move('z',-21);await move('x',0);await move('z',-6);}
async function crossSouth(){await move('x',0);await move('z',-21);await move('x',-7);await move('z',-40);}
try{
 await page.goto('http://127.0.0.1:5188/?room=9&hero=mia');await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);await shot('09-video');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).finale.assembly==='complete',{},{timeout:20000});await step(0);await shot('09-entrance');
 await move('z',34);await select('yuki');await move('z',34);await step(6500);
 assert.equal((await state()).finale.assembly,'complete');await shot('heart-assembled');
 await select('mia');await to(0,33.3);await hold('w',100);await press('e');assert.equal((await state()).carried,'HEART OF THE FOREST');
 await select('yuki');await move('z',27);await move('x',-6);await select('mia');assert.equal((await state()).companion.state,'HOLD_POSITION');
 await to(0,26);await move('z',21);await move('x',6);await shot('gate-heart-crossed');
 await select('yuki');await move('x',0);await move('z',20);await select('mia');
 await move('z',8);await move('x',9);await move('z',0);await select('yuki');await to(5,3);await step(4200);
 assert.equal((await state()).finale.lift.y,5);await shot('heart-elevator');
 await select('mia');await move('z',-6);await move('x',0);await move('z',-21);await press('e');
 assert.equal((await state()).carried,null);await shot('heart-side-a');
 // Send the empty elevator down, board the other hero, then call it from above.
 await move('z',-6);await move('x',5);await move('z',-5);await step(4200);
 await select('yuki');await to(9,3);await move('z',0);await select('mia');await move('x',3);await move('x',5);await step(4200);
 assert.equal((await state()).finale.lift.y,5);await select('yuki');await move('z',-6);await move('x',0);await move('z',-21);
 // Leave Yuki on the bridge HOLD plate; Mia crosses the familiar temporary slabs.
 await move('x',-10);await select('mia');await move('x',0);await move('z',-21);await move('x',-7);
 for(let i=0;i<80&&(await state()).bridge.extension<.98;i++)await step(50);
 await move('z',-38);await move('x',5);await move('z',-39);await step(4200);await shot('ferry-called');
 assert.equal((await state()).finale.ferry.z,-21.5);
 await select('yuki');await move('x',0);await move('z',-20.5);await select('mia');await move('x',7);await move('x',5);await step(4200);
 assert.equal((await state()).finale.ferry.z,-38.5);await shot('heart-ferry-arrived');
 assert.ok((await state()).heroes.yuki.z<-36);assert.ok((await state()).blocks.find(b=>b.objective==='heart').z<-36);
 // Fetch the two upper-landing words via the now-stable bridge.
 for(const id of [2,3]){await crossNorth();const b=(await state()).blocks[id];await move('x',b.x);await move('z',b.z+1.35);await hold('w',20);await press('e');assert.equal((await state()).carried,b.text);await move('z',-6);await crossSouth();await placeWord(id);await hallRoute(0,-41);}
 // Upper hero operates the elevator while Mia retrieves the two lower-court words.
 await crossNorth();await to(3,-5);await select('yuki');await move('x',-7);await move('z',-21);await move('x',0);await move('z',-6);await to(9,0);
 for(const id of [0,1]){
  await select('mia');await move('x',3);await move('x',5);await step(4200);assert.equal((await state()).finale.lift.y,0);
  await select('yuki');await move('z',4);await move('x',-8);const b=(await state()).blocks[id];await move('z',b.z+1.35);await move('x',b.x);await hold('w',20);await press('e');assert.equal((await state()).carried,b.text);
  await move('x',0);await move('z',4);await move('x',9);await move('z',0);
  await select('mia');await move('x',3);await move('x',5);await step(4200);await select('yuki');await move('z',-6);await crossSouth();await placeWord(id);await hallRoute(0,-41);
  if(id===0){await crossNorth();await to(9,0);}
 }
 for(const id of [4,5,6,7,8,9,10,11]){const b=(await state()).blocks[id];await hallRoute(b.x,b.z+1.35);await hold('w',20);await press('e');assert.equal((await state()).carried,b.text);await placeWord(id);}
 assert.equal((await state()).solved,true);await shot('language-lock-solved');
 // Deliver the actual Heart to its pedestal and recover the upper controller hero.
 await hallRoute(0,-41);const heart=(await state()).blocks.find(b=>b.objective==='heart');await move('x',heart.x);await move('z',heart.z-1.35);await hold('s',20);await press('e');assert.equal((await state()).carried,'HEART OF THE FOREST');
 await move('z',-40);await hallRoute(0,-57.5);await press('e');await step(100);assert.equal((await state()).finale.heartArrived,true);await shot('heart-final-checkpoint');
 await select('mia');await move('x',0);await move('z',-21);await move('x',-7);await move('z',-40);await hallRoute(0,-58);
 await move('x',1.3);await move('z',-64.2);await step(2000);assert.equal((await state()).room,'dragon');await shot('09-to-10');
 await page.goto('http://127.0.0.1:5188/?room=10&hero=mia');await step(0);await shot('10-reveal');
 await to(0,30.3);await press('e');assert.equal((await state()).carried,'HEART OF THE FOREST');
 // Walk the whole outer ring using many small chords so no shortcut crosses lava.
 for(let i=1;i<=64;i++){const a=i*Math.PI*2/64,x=Math.sin(a)*31,z=Math.cos(a)*31;await move('x',x);await move('z',z);if(i===16||i===32||i===48)await shot(`10-ring-${i}`);}
 assert.equal((await state()).solved,false);assert.equal((await state()).escaped,false);await shot('10-ring-complete');
 await page.setViewportSize({width:900,height:650});await step(20);await shot('10-small');
 assert.deepEqual(errors,[]);console.log('Finale keyboard transport route, ring circuit, reset and browser errors passed');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
