import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:900,height:650}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:5188/?room=9');
 await page.getByRole('button',{name:/Play Game/}).click();
 const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
 assert.equal((await read()).finale.assembly,'waiting');
 assert.equal(await page.locator('.heart-video').evaluate(v=>v.hidden),true);
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
 assert.equal(await page.locator('.heart-video').evaluate(v=>v.hidden),true,'shards assemble before video');
 await page.locator('.heart-video').waitFor({state:'visible',timeout:15000});
 await page.waitForFunction(()=>document.querySelector('.heart-video video')?.readyState>=2);
 const start=await read();assert.equal(start.finale.assembly,'playing');
 const frame=await page.evaluate(()=>{const r=document.querySelector('.heart-video video').getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight};});
 assert.ok(frame.top>0&&frame.bottom<frame.height,'whole video must fit with bottom margin');
 await page.keyboard.down('w');await page.keyboard.press('Tab');await page.keyboard.press('e');await page.keyboard.press('Space');
 await page.evaluate(()=>window.advanceTime(500));await page.keyboard.up('w');
 const paused=await read();assert.deepEqual(paused.player,start.player);assert.equal(paused.selectedHero,start.selectedHero);assert.equal(paused.carried,null);
 assert.equal(await page.locator('.heart-video video').evaluate(v=>v.muted),false);
 await page.locator('.heart-video-sound').click();assert.equal(await page.locator('.heart-video video').evaluate(v=>v.muted),true);
 await page.screenshot({path:'output/finale/09-video-small.png'});
 // Exercise a real media error through the adapter's native event contract.
 await page.locator('.heart-video video').evaluate(v=>v.dispatchEvent(new Event('error')));
 await page.getByRole('button',{name:'Continue playing',exact:true}).click();assert.equal((await read()).finale.assembly,'complete');
 assert.equal(await page.locator('.heart-video').evaluate(v=>v.hidden),true);
 await page.keyboard.press('r');await page.evaluate(()=>window.advanceTime(20));assert.equal((await read()).finale.assembly,'waiting');
 assert.equal(await page.locator('.heart-video').evaluate(v=>v.hidden),true);
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
 await page.locator('.heart-video').waitFor({state:'visible',timeout:15000});
 await page.waitForFunction(()=>document.querySelector('.heart-video video')?.readyState>=2);
 assert.equal(await page.locator('.heart-video').evaluate(v=>v.hidden),false);
 assert.deepEqual(errors,[]);console.log('Video sizing, control freeze, sound, error fallback and reset replay passed');
}finally{await browser.close();}
