import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});await mkdir('output/tutorial-docking',{recursive:true});const errors=[];
try{
 for(const [room,locale] of [[1,'en-US'],[2,'ja-JP']]){
 const page=await browser.newPage({locale,viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(String(e)));
 const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms),state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
 await page.goto(`http://127.0.0.1:5188/?room=${room}`);await page.waitForFunction(()=>!!window.advanceTime);await step(20000);
 const panel=page.locator('.training-prompt');assert.ok((await panel.boundingBox()).y<200);
 if(room===1){
 assert.equal((await state()).training.step,'move');await page.keyboard.press('w');await step(0);assert.equal((await state()).training.step,'look');await step(20000);assert.equal((await state()).training.step,'look');
 await page.mouse.move(600,400);await step(0);assert.equal((await state()).training.step,'look');await page.mouse.down();await step(0);assert.equal((await state()).training.step,'look');await page.mouse.move(660,400,{steps:5});await page.mouse.up();await step(0);
 }else{
 assert.equal((await state()).training.step,'switch');await page.keyboard.press('w');await step(10000);assert.equal((await state()).training.step,'switch');await page.locator('#switch-hero').click();await step(500);assert.equal((await state()).training.step,'switch');await page.keyboard.press('Tab');await step(0);
 }
 if(room===2){assert.equal(await panel.isVisible(),false);await step(500);assert.equal(await panel.isVisible(),true);assert.match(await panel.innerText(),/今回のミッション/);}
 assert.equal((await state()).training.step,'mission');
 await page.screenshot({path:`output/tutorial-docking/${locale}-mission.png`});await step(2700);assert.equal((await state()).training.docked,false);await step(200);assert.equal((await state()).training.docked,true);
 await page.waitForTimeout(220);await page.screenshot({path:`output/tutorial-docking/${locale}-moving.png`});await page.waitForTimeout(650);
 assert.ok((await panel.boundingBox()).x>850);assert.equal(await panel.locator('li').count(),room===1?3:2);assert.equal(await panel.locator('li[data-complete=true]').count(),room===1?2:1);assert.equal(await page.locator('.objective').isVisible(),false);
 await page.screenshot({path:`output/tutorial-docking/${locale}-checklist.png`});await step(20000);assert.equal((await state()).training.docked,true);
 await page.setViewportSize({width:640,height:480});await page.waitForTimeout(850);await step(0);await page.screenshot({path:`output/tutorial-docking/${locale}-small.png`});
 await page.keyboard.press('r');await step(0);assert.equal((await state()).training.step,room===1?'move':'switch');assert.equal((await state()).training.docked,false);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: action-gated prompts, real left-drag requirement, timed mission, animated right checklist, localization, persistence and reset.');
}finally{await browser.close();}
