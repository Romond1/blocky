import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1200,height:800}});const errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
try {
 await p.goto('http://127.0.0.1:5188/?choose=1');await p.waitForFunction(()=>window.advanceTime);
 await p.screenshot({path:'output/hero-picker.png'});
 const state=()=>p.evaluate(()=>JSON.parse(window.render_game_to_text()));const before=(await state()).player;
 await p.keyboard.down('w');await p.evaluate(()=>window.advanceTime(1000));await p.keyboard.up('w');assert.deepEqual((await state()).player,before);
 await p.locator('[data-hero="mia"]').click();assert.equal((await state()).selectedHero,'mia');assert.equal(await p.locator('.hero-picker').isVisible(),false);
 await p.evaluate(()=>window.advanceTime(0));await p.screenshot({path:'output/mia-game.png'});
 await p.keyboard.press('r');assert.equal((await state()).selectedHero,'mia');await p.locator('[data-room="power"]').click();await p.waitForFunction(()=>window.advanceTime);assert.equal((await state()).selectedHero,'mia');
 await p.goto('http://127.0.0.1:5188/?choose=1');await p.waitForFunction(()=>window.advanceTime);await p.setViewportSize({width:390,height:844});await p.screenshot({path:'output/hero-picker-mobile.png'});
 await p.locator('[data-hero="yuki"]').focus();await p.keyboard.press('Enter');assert.equal((await state()).selectedHero,'yuki');assert.equal((await state()).started,true);
 assert.deepEqual(errors,[]);console.log('PASS picker: both heroes, keyboard, input gating, reset, replay persistence, mobile, no errors');
}finally{await b.close()}
