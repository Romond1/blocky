import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];await mkdir('output/instructions',{recursive:true});
try{
 for(const locale of ['en-US','ja-JP','fr-FR']){
  const context=await browser.newContext({locale,viewport:{width:1280,height:800}});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5188/?room=2');await page.waitForFunction(()=>!!window.advanceTime);await page.evaluate(()=>window.advanceTime(0));
  const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));assert.equal(state.instructionLocale,locale==='ja-JP'?'ja':'en');assert.equal(state.blocks[3].x,6.1);assert.equal(state.blocks[3].text,'HEAVY');
  const panel=page.locator('.training-prompt');const rect=await panel.boundingBox();assert.ok(Math.abs(rect.x+rect.width/2-640)<2);assert.ok(rect.y>120&&rect.y+rect.height<650);assert.ok(parseFloat(await panel.locator('strong').evaluate(e=>getComputedStyle(e).fontSize))>=23);
  assert.match(await panel.innerText(),locale==='ja-JP'?/ヒーローを交代しよう/:/SWITCH HERO/);
  await page.screenshot({path:`output/instructions/${locale}-room2-entry.png`});
  await page.keyboard.press('Tab');await page.evaluate(()=>window.advanceTime(500));assert.equal((await page.evaluate(()=>JSON.parse(window.render_game_to_text()))).selectedHero,'yuki');
  await page.setViewportSize({width:640,height:480});await page.evaluate(()=>window.advanceTime(0));const small=await panel.boundingBox();assert.ok(small.x>=0&&small.y>=0&&small.x+small.width<=640&&small.y+small.height<=480);
  await page.screenshot({path:`output/instructions/${locale}-small.png`});await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: English/Japanese browser locales, fallback, centered readable prompts, smaller viewport, HEAVY position and unrestricted switching.');
}finally{await browser.close();}
