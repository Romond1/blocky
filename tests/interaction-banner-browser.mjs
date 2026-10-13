import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
let page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];
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
 for(const locale of ['en-US','ja-JP']){
  await page.close();page=await browser.newPage({viewport:{width:1280,height:800},locale});
  page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5188/');await page.waitForFunction(()=>!!window.advanceTime);await step(0);
  const banner=page.locator('.interaction-banner');assert.equal(await banner.isVisible(),false);
  await press('w');await page.mouse.move(600,400);await page.mouse.down();await page.mouse.move(620,400);await page.mouse.move(600,400);await page.mouse.up();await step(3000);
  const wrong=(await state()).blocks[0];await go(wrong.x,wrong.z+1.1);assert.equal(await banner.getAttribute('data-kind'),'pickup');assert.equal(await banner.isVisible(),true);assert.match(await banner.innerText(),locale==='ja-JP'?/持ち上げる/:/Pick up/);await shot(`${locale}-floating-pickup`);
  await press('e');assert.equal((await state()).carried,'A');assert.equal(await banner.getAttribute('data-kind'),'drop');
  await go(0,1);assert.equal(await banner.isVisible(),true);assert.match(await banner.innerText(),locale==='ja-JP'?/台におく/:/Drop on the plate/);assert.equal(await banner.getAttribute('data-target'),'plate-0');await shot(`${locale}-floating-plate`);
  const before=await banner.boundingBox();await page.mouse.move(600,400);await page.mouse.down();await page.mouse.move(630,400);await page.mouse.up();await step(0);const after=await banner.boundingBox();assert.ok(Math.abs(before.x-after.x)>5,'banner follows world position during orbit');await page.mouse.down();await page.mouse.move(600,400);await page.mouse.up();await step(0);
  await plate(0);assert.equal((await state()).solved,false);assert.equal(await banner.getAttribute('data-kind'),'pickup');assert.equal(await banner.getAttribute('data-target'),'block-0');await press('e');await go(-1,2);await press('e');assert.notEqual(await banner.getAttribute('data-kind'),'drop');
  await pick(1);assert.equal(await banner.getAttribute('data-kind'),'drop');const selected=(await state()).selectedHero;await press('Tab');await step(500);assert.notEqual(await banner.getAttribute('data-kind'),'drop');await switchTo(selected);assert.equal(await banner.getAttribute('data-kind'),'drop');
  await plate(0);assert.equal((await state()).solved,true);assert.equal(await banner.getAttribute('data-kind'),'pickup');await press('r');assert.equal(await banner.isVisible(),false);
  await page.goto('http://127.0.0.1:5188/?room=2');await page.waitForFunction(()=>!!window.advanceTime);await step(0);await pick(0);assert.equal((await state()).carried,'A');assert.equal(await banner.isVisible(),false);assert.equal(await banner.getAttribute('data-kind'),null);
  await page.goto('http://127.0.0.1:5188/?room=3');await page.waitForFunction(()=>!!window.advanceTime);await step(0);assert.equal(await banner.isVisible(),false);
 }
 assert.deepEqual(errors,[]);console.log('PASS: floating Room 1 pickup/drop banners, wrong and correct blocks, camera tracking, ownership switches, reset, English/Japanese, Room 2 light-block and Room 3 exclusions.');
}finally{await browser.close();}
