import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>d.accept());
const tick=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
try{
 await page.goto('http://127.0.0.1:5188/?room=7');await page.waitForFunction(()=>window.render_game_to_text);await page.locator(".welcome-play").click();
 for(const key of ['a','d','s','w','ArrowLeft','ArrowRight','ArrowDown','ArrowUp'])for(const order of [true,false]){
  await page.keyboard.press('r');await tick(0);await page.locator('#pause-menu').focus();
  if(order){await page.keyboard.down(key);await page.keyboard.down('Space');}else{await page.keyboard.down('Space');await page.keyboard.down(key);}
  await tick(150);await page.keyboard.up(key);await page.keyboard.up('Space');const before=await state();await tick(1200);const after=await state();
  assert.ok(Math.hypot(after.player.x-before.player.x,after.player.z-before.player.z)<.001,`${key}/${order} drift`);
  assert.equal(after.motion[after.selectedHero].grounded,true);
 }
 // Releasing both before a simulation frame must not leave an automatic forward lunge.
 await page.keyboard.press('r');await page.locator('canvas[data-engine]').focus();await page.keyboard.down('Space');await page.keyboard.down('a');await page.keyboard.up('a');await page.keyboard.up('Space');const before=await state();await tick(1000);const after=await state();
 assert.ok(Math.hypot(after.player.x-before.player.x,after.player.z-before.player.z)<.001);assert.deepEqual(errors,[]);
 // OS repeats belong to the last key only. A held direction must survive Space.
 await page.keyboard.press('r');await page.keyboard.down('a');await page.keyboard.down('Space');await tick(150);await page.keyboard.up('Space');
 await page.waitForTimeout(1400);const heldChord=await state();await tick(100);const continuing=await state();
 assert.ok(continuing.player.x<heldChord.player.x-.2,'held direction expired when Space owned repeat');
 // Focus loss is the reliable cancellation signal for a release outside the game.
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));const lostRelease=await state();await tick(500);const stopped=await state();
 assert.ok(Math.hypot(stopped.player.x-lostRelease.player.x,stopped.player.z-lostRelease.player.z)<.001,'focus loss latched direction');
 assert.equal(stopped.movement.controls.paused,true);await page.locator('[data-menu="resume"]').first().click();
 await page.keyboard.down('a');await tick(100);assert.equal((await state()).player.x,stopped.player.x,'repeat resurrected cleared direction');
 await page.keyboard.up('a');
 // A genuinely held key remains active across the timeout via repeat events.
 await page.keyboard.press('r');await page.keyboard.down('a');await page.keyboard.down('Space');await tick(150);await page.keyboard.up('Space');
 await page.waitForTimeout(750);await page.keyboard.down('a');await page.waitForTimeout(750);
 const held=await state();await tick(100);const renewed=await state();assert.ok(renewed.player.x<held.player.x-.2,'held direction expired despite repeat');
 await page.keyboard.up('a');await page.keyboard.down('d');await tick(150);const reverse=await state();assert.ok(reverse.player.x>renewed.player.x,'cannot reverse direction');await page.keyboard.up('d');
 // A focused menu button must not steal Space or reset the room on keyup.
 await page.keyboard.press('r');await page.locator('#pause-menu').focus();const stationary=await state();await page.keyboard.down('Space');await tick(150);
 assert.ok((await state()).motion[(await state()).selectedHero].y>0);await page.keyboard.up('Space');await tick(1000);
 assert.equal((await state()).player.x,stationary.player.x);assert.equal((await state()).player.z,stationary.player.z);
 assert.deepEqual(errors,[]);
 console.log('Eight directions, both key orders, rapid chords, no-repeat held chords, focus-loss recovery, ignored repeats and Space on focused HUD passed.');
}finally{await browser.close();}
