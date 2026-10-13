import { chromium } from 'playwright';import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1100,height:760}});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await mkdir('output/team',{recursive:true});
try{
 const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
 for(const room of [1,2,3])for(const hero of ['yuki','mia']){
  await page.goto(`http://127.0.0.1:5188/?room=${room}&hero=${hero}`);await page.waitForFunction(()=>window.advanceTime);await step(0);
  const initial=await state();assert.equal(Object.keys(initial.heroes).length,2);
  await step(9000);const exploring=await state();assert.notDeepEqual(exploring.heroes[initial.companion.hero],initial.heroes[initial.companion.hero]);
  assert.deepEqual(exploring.blocks,initial.blocks);assert.equal(exploring.attempts,0);
  const paused=await state(),next=paused.companion.hero,expected=paused.heroes[next],cameraBefore=paused.camera.position;
  await page.keyboard.press('Tab');await step(0);const switched=await state();
  assert.equal(switched.selectedHero,next);assert.equal(switched.player.x,expected.x);assert.equal(switched.player.z,expected.z);assert.deepEqual(switched.blocks,paused.blocks);assert.deepEqual(switched.camera.position,cameraBefore);
  await step(300);const middle=await state();assert.notDeepEqual(middle.camera.position,cameraBefore);assert.equal(middle.player.x,expected.x);assert.equal(middle.player.z,expected.z);
  await step(500);await page.click('#debug-toggle');await step(0);await page.screenshot({path:`output/team/room-${room}-${hero}-switched.png`});
  await page.keyboard.press('r');await step(0);const reset=await state();assert.equal(reset.selectedHero,next);assert.ok(Math.hypot(reset.heroes.yuki.x-reset.heroes.mia.x,reset.heroes.yuki.z-reset.heroes.mia.z)>=1.5);
 }
 // A carried answer stays attached to its hero across repeated ownership changes.
 await page.goto('http://127.0.0.1:5188/?hero=yuki');await page.waitForFunction(()=>window.advanceTime);await step(0);
 const move=async(axis,target)=>{const current=(await state()).player[axis],delta=target-current;const key=axis==='x'?delta>0?'d':'a':delta>0?'s':'w';await page.keyboard.down(key);await step(Math.abs(delta)/3.5*1000);await page.keyboard.up(key);};
 const letter=(await state()).blocks[1];await move('x',letter.x);await move('z',letter.z);await page.keyboard.press('e');await step(0);assert.equal((await state()).carried,'E');
 const blocks=(await state()).blocks;await page.keyboard.press('Tab');await step(500);assert.equal((await state()).carried,null);assert.deepEqual((await state()).blocks,blocks);
 await page.keyboard.press('Tab');await step(0);assert.equal((await state()).carried,'E');
 // Complete a real puzzle, then verify switching preserves progress.
 await step(500);
 const plate=(await state()).sockets[0];await move('x',plate.x);await move('z',plate.z+1.6);await page.keyboard.press('e');await step(0);assert.equal((await state()).training.heroSolved,true);
 await page.keyboard.press('Tab');const progress=await state();await step(3000);assert.ok((await state()).doorLift>=progress.doorLift);
 await step(0);assert.equal((await state()).training.heroSolved,true);assert.deepEqual((await state()).placed,progress.placed);assert.deepEqual((await state()).blocks,progress.blocks);
 assert.deepEqual(errors,[]);await writeFile('output/team/switching-result.json',JSON.stringify({passed:true,errors,checks:['6 room/hero configurations','both persistent heroes','independent exploration','no puzzle writes','instant handoff','position-preserving switch','camera blend','reset','carried ownership']},null,2));console.log('PASS: team switching, camera, carry and autonomy across both heroes / three rooms');
}finally{await browser.close()}
