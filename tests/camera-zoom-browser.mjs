import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/camera-zoom',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
try{
 for(let room=1;room<=6;room++){
  await page.goto(`http://127.0.0.1:5188/?room=${room}&hero=yuki`);await page.waitForFunction(()=>window.render_game_to_text);await step(0);const initial=await state();
  await page.mouse.move(700,500);await page.mouse.wheel(0,4000);await step(1000);let s=await state();assert.equal(s.camera.targetDistance,9);assert.ok(s.camera.distance>8.99);assert.equal(s.solved,false);assert.deepEqual(s.blocks,initial.blocks);
  await page.screenshot({path:`output/camera-zoom/room-${room}-far.png`});
  await page.mouse.wheel(0,-8000);await step(1000);s=await state();assert.equal(s.camera.targetDistance,4);assert.ok(s.camera.distance<4.01);assert.equal(s.solved,false);
  await page.mouse.down();await page.mouse.move(950,450,{steps:10});await page.mouse.up();await step(0);assert.ok(Math.abs((await state()).camera.yaw)>1);
  await page.mouse.wheel(0,4000);await step(1000);assert.ok((await state()).camera.distance>8.99);
  await page.keyboard.press('r');await step(0);assert.equal((await state()).camera.distance,6);
 }
 assert.deepEqual(errors,[]);console.log('Real mouse-wheel zoom, bounds, alternate orientation and reset pass in all six rooms.');
}finally{await browser.close();}
