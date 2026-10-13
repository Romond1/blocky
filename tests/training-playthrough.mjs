import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800},locale:process.env.GAME_LOCALE??'en-US'}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async k=>{await page.keyboard.press(k);await step(0);};
await mkdir('output/training',{recursive:true});
const shot=async name=>{await page.waitForTimeout(320);return page.screenshot({path:`output/training/${process.env.GAME_LOCALE??'en-US'}-${name}.png`});};
async function axis(axis,target){const s=await state(),delta=target-s.player[axis];if(Math.abs(delta)<.015)return;
 const key=axis==='x'?delta>0?'d':'a':delta>0?'s':'w';await page.keyboard.down(key);await step(Math.abs(delta)/(3.5*s.abilities[s.selectedHero].speedMultiplier)*1000);await page.keyboard.up(key);
 if((await state()).room!==s.room)return;
 assert.ok(Math.abs((await state()).player[axis]-target)<.08,`blocked ${axis} -> ${target}: ${JSON.stringify((await state()).player)}`);
}
async function go(x,z){
 const s=await state(),start=s.player,end={x,z};
 const safe=p=>Math.abs(p.x)<s.bounds.halfWidth-.39&&p.z<s.bounds.halfDepth-.39&&p.z>(s.solved?-s.bounds.halfDepth-3.6:-s.bounds.halfDepth+.39)&&(p.z>=-s.bounds.halfDepth+.38||Math.abs(p.x-(s.bounds.exitCenterX??0))<s.bounds.exitHalfWidth-.4)&&s.blocks.every(b=>b.state==='carried'||Math.abs(b.x-p.x)>b.size/2+.39||Math.abs(b.z-p.z)>b.size/2+.39)&&s.obstacles.every(o=>Math.abs(o.x-p.x)>o.width/2+.39||Math.abs(o.z-p.z)>o.depth/2+.39)&&s.sockets.every(q=>Math.abs(q.x-p.x)>(q.halfSize??.7)+.39||Math.abs(q.z-p.z)>(q.halfSize??.7)+.39);
 const segment=(a,b)=>{const d=Math.hypot(a.x-b.x,a.z-b.z);for(let i=1;i<=Math.ceil(d/.08);i++){const t=i/Math.ceil(d/.08);if(!safe({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t}))return false;}return true;};
 // Orthogonal routes preserve the game's normalized speed and make collision assertions precise.
 const anchors=[];for(let x=-Math.floor(s.bounds.halfWidth);x<=Math.floor(s.bounds.halfWidth);x+=.5)for(let z=-Math.floor(s.bounds.halfDepth)-3;z<=Math.floor(s.bounds.halfDepth);z+=.5)anchors.push({x,z});
 const near=anchors.filter(p=>safe(p)&&segment(start,{x:p.x,z:start.z})&&segment({x:p.x,z:start.z},p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];
 assert.ok(near,'reachable route anchor');const key=p=>`${p.x},${p.z}`,queue=[near],parents=new Map([[key(near),null]]);let found;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(segment(p,{x:end.x,z:p.z})&&segment({x:end.x,z:p.z},end)){found=p;break;}
 for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:p.x+dx,z:p.z+dz};if(!parents.has(key(n))&&safe(n)&&segment(p,n)){parents.set(key(n),p);queue.push(n);}}}
 assert.ok(found,'route exists');const route=[];while(found){route.unshift(found);found=parents.get(key(found));}route.push(end);
 for(const p of route){if((await state()).room!==s.room)return;await axis('x',p.x);if((await state()).room!==s.room)return;await axis('z',p.z);}
}
async function switchTo(hero){if((await state()).selectedHero!==hero)await press('Tab');await step(500);}
async function pick(id){const b=(await state()).blocks[id];await go(b.x-(id===3?1.5:0),b.z+(id===3?0:1.1));await press('e');}
async function plate(id){const p=(await state()).sockets[id];await go(p.x,p.z+1.6);await press('e');}
try{
 await page.goto('http://127.0.0.1:5188/');await page.waitForFunction(()=>!!window.advanceTime);await page.locator(".welcome-play").click();await step(0);assert.equal((await state()).selectedHero,'mia');assert.equal((await state()).started,true);assert.equal(await page.locator('.hero-picker').isVisible(),false);assert.ok(await page.locator('#switch-hero').isVisible());await shot('default-mia');
 // Complete onboarding without changing the camera orientation used by route helpers.
 await press('w');await page.mouse.move(600,400);await page.mouse.down();await page.mouse.move(620,400);await page.mouse.move(600,400);await page.mouse.up();await step(3000);assert.ok((await state()).training.docked);
 // Room 1: freely pick up any letter, then watch energy arrive before the gate moves.
 await pick(0);await plate(0);assert.equal((await state()).solved,false);await press('e');await go(-2,3);await press('e');
 await pick(1);await plate(0);assert.equal((await state()).solved,true);assert.equal((await state()).doorLift,0);await step(260);await shot('room1-plate-burst');await step(340);assert.ok((await state()).conduitProgress[0]>0);assert.equal((await state()).doorLift,0);await shot('room1-energy-travel');await step(1300);assert.ok((await state()).doorCharge>0);assert.equal((await state()).doorLift,0);await shot('room1-door-charging');await step(2700);assert.ok((await state()).doorLift>2.8);await shot('room1-powered');assert.equal(await page.locator('.tutorial-checklist li[data-complete=true]').count(),3);
 const firstDepth=(await state()).bounds.halfDepth;await go(2,-4);await go(2,-8.5);await shot('room1-shard-visible');await go(0,-firstDepth+1.1);assert.equal((await state()).economy.heartShards,1);assert.equal(await page.locator('.shard-found').isVisible(),true);await shot('room1-shard-found');await go(0,-firstDepth-1.9);await step(20000);assert.equal((await state()).room,'memory');
 for(const initial of ['mia','yuki']){
 await page.goto(`http://127.0.0.1:5188/?room=2&hero=${initial}`);await page.waitForFunction(()=>!!window.advanceTime);await page.locator(".welcome-play").click();await step(0);
 await pick(3);assert.equal((await state()).heavyAction.kind,initial==='mia'?'HEAVY_STRUGGLE':'HEAVY_LIFT');
 if(initial==='mia'){await step(500);if(process.env.GAME_LOCALE==='ja-JP'){assert.match(await page.locator('.training-prompt').innerText(),/ミアには重すぎる/);assert.match(await page.locator('.training-prompt').innerText(),/ユキに交代/);assert.equal(await page.locator('html').getAttribute('lang'),'ja');}await shot('early-mia-struggle');await page.keyboard.down('a');await step(100);await page.keyboard.up('a');await step(300);assert.equal((await state()).carried,null);await switchTo('yuki');await pick(3);}
 await step(500);assert.equal((await state()).carried,'HEAVY');
 // Place HEAVY on the wrong plate, then recover it, without any tutorial prerequisites.
 await plate(0);assert.equal((await state()).placed[0],'HEAVY');assert.equal((await state()).solved,false);await press('e');await step(500);assert.equal((await state()).carried,'HEAVY');
 await plate(1);assert.equal((await state()).training.heavyActivated,true);assert.equal((await state()).training.heroSolved,false);assert.equal((await state()).doorLift,0);await shot(`${initial}-heavy-first`);
 await pick(0);await plate(0);assert.equal((await state()).placed[0],'A');await press('e');await go(-2,3);await press('e');assert.equal((await state()).carried,null);
 await pick(1);await plate(0);assert.equal((await state()).solved,true);await step(2000);await shot(`${initial}-both-plates`);
 // Correct placements are still removable; the gate reflects current plate contents.
 await press('e');assert.equal((await state()).carried,'E');assert.equal((await state()).solved,false);await step(1000);assert.ok((await state()).doorLift<4);await press('e');assert.equal((await state()).solved,true);await step(4200);
 const depth=(await state()).bounds.halfDepth,exitX=(await state()).bounds.exitCenterX;await go(0,-6.3);await go(exitX,-depth-1.9);await step(20000);await writeFile('output/training/exit-debug.json',JSON.stringify(await state(),null,2));await shot('room2-exit-debug');assert.equal((await state()).room,'power');assert.ok((await state()).economy.collected.some(c=>c.id==='room2_heart_shard'));assert.ok((await state()).economy.collected.some(c=>c.id==='room1_heart_shard'));
 }
 assert.deepEqual(errors,[]);await writeFile('output/training/free-room-result.json',JSON.stringify({passed:true,errors,checks:'Mia default; immediate heavy interactions; heavy first without tutorial; wrong plate recovery; removable correct blocks; live gate; team exit; both heroes'},null,2));console.log('PASS: Room 1 letter circuit and transition; Room 2 both heroes, wrong plates, heavy-first, rearrangement and team exit');
}finally{await browser.close();}
