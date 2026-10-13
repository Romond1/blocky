import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
await mkdir('output/hero-switch',{recursive:true});
try{
 for(const room of [1,2,3])for(const initial of ['yuki','mia']){
  await page.goto(`http://127.0.0.1:5188/?room=${room}&choose=1`);await page.waitForFunction(()=>!!window.advanceTime);await step(0);
  await page.locator(`[data-hero="${initial}"]`).click();await step(0);
  assert.equal((await state()).selectedHero,initial);assert.equal((await state()).tutorial.switchCount,0);
  await step(3000);const before=await state();await page.keyboard.press('Tab');await step(0);let after=await state();
  assert.notEqual(after.selectedHero,initial);assert.ok(after.started&&after.switching&&after.ownershipValid);assert.deepEqual(after.heroes,before.heroes);assert.deepEqual(after.blocks,before.blocks);assert.deepEqual(after.camera.position,before.camera.position);
  assert.equal(await page.locator('.hero-picker').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.tagName),'CANVAS');
  await page.keyboard.down('w');await step(200);await page.keyboard.up('w');after=await state();assert.deepEqual(after.player,before.heroes[after.selectedHero]);assert.notDeepEqual(after.camera.position,before.camera.position);
  await step(300);assert.equal((await state()).switching,false);
  if(room===1)await page.keyboard.press('Tab');else await page.click('#switch-hero');await step(0);assert.equal((await state()).selectedHero,initial);assert.ok((await state()).ownershipValid);
  for(let i=0;i<20;i++){await page.keyboard.press('Tab');await step(20);assert.ok((await state()).ownershipValid);}
  await step(500);assert.equal((await state()).switching,false);assert.equal((await state()).tutorial.switchCount,22);
  await page.screenshot({path:`output/hero-switch/room-${room}-${initial}.png`});
 }
 const speeds={};for(const id of ['yuki','mia']){await page.goto(`http://127.0.0.1:5188/?hero=${id}`);await page.waitForFunction(()=>!!window.advanceTime);await step(0);const before=await state();await page.keyboard.down('d');await step(200);await page.keyboard.up('d');speeds[id]=(await state()).player.x-before.player.x;}
 assert.ok(Math.abs(speeds.mia/speeds.yuki-2)<1e-8);
 await page.goto('http://127.0.0.1:5188/?hero=yuki');await page.waitForFunction(()=>!!window.advanceTime);await step(0);
 const letter=(await state()).blocks[1],pos=(await state()).player;
 for(const [axis,target] of [['x',letter.x],['z',letter.z]]){const current=(await state()).player[axis],delta=target-current;const key=axis==='x'?delta>0?'d':'a':delta>0?'s':'w';await page.keyboard.down(key);await step(Math.abs(delta)/3.5*1000);await page.keyboard.up(key);}
 await page.keyboard.press('e');await step(0);assert.equal((await state()).carried,'E');
 const carried=await state();await page.keyboard.press('Tab');await step(6000);let s=await state();assert.deepEqual(s.heroes.yuki,carried.heroes.yuki);assert.deepEqual(s.blocks,carried.blocks);assert.equal(s.companion.state,'HOLDING_OBJECT');
 await page.keyboard.press('Tab');await step(500);assert.equal((await state()).carried,'E');
 assert.deepEqual(errors,[]);await writeFile('output/hero-switch/result.json',JSON.stringify({passed:true,speeds,errors},null,2));console.log('PASS: six room/start configurations, Tab/button, camera, focus, rapid switches, speed and carried hold');
}finally{await browser.close();}
