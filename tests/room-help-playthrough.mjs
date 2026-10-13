import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const hold=async(k,ms)=>{await page.keyboard.down(k);await step(ms);await page.keyboard.up(k);};
await mkdir('output/help',{recursive:true});
try{
 await page.goto('http://127.0.0.1:5188/?room=3&hero=yuki');await page.waitForFunction(()=>window.advanceTime);await step(0);
 await page.screenshot({path:'output/help/entrance.png'});
 await hold('a',570);assert.ok((await state()).help.available);const before=await state();
 await page.keyboard.press('e');assert.ok((await state()).help.open);
 for(let i=0;i<4;i++){await step(i===0?1000:4000);assert.equal((await state()).help.step,i);await page.screenshot({path:`output/help/step-${i}.png`});}
 const after=await state();assert.deepEqual(after.player,before.player);assert.deepEqual(after.stageSolved,before.stageSolved);assert.equal(after.bridge.time,before.bridge.time);
 await page.getByRole('button',{name:'Replay animation'}).click();assert.equal((await state()).help.time,0);
 await page.keyboard.press('Escape');assert.equal((await state()).help.open,false);
 await hold('d',1140);assert.ok((await state()).help.available);await page.keyboard.press('e');assert.ok((await state()).help.open);
 await page.setViewportSize({width:800,height:600});await page.waitForTimeout(150);await step(4000);await page.screenshot({path:'output/help/small.png'});
 await page.keyboard.press('e');assert.equal((await state()).help.open,false);
 await page.keyboard.press('r');await step(0);await hold('w',2000);
 await page.keyboard.down('w');await page.keyboard.press('Space');await step(350);let s=await state();assert.ok(s.motion.yuki.y>0);await page.screenshot({path:'output/help/running-jump.png'});
 await step(700);await page.keyboard.up('w');assert.ok((await state()).motion.yuki.crossed);
 await page.keyboard.press('Tab');await step(650);await hold('w',1100);await page.keyboard.down('w');await page.keyboard.press('Space');await step(1100);await page.keyboard.up('w');assert.ok((await state()).motion.mia.crossed);
 assert.deepEqual(errors,[]);console.log('Both help buttons, animated sequence, pause/replay/close, small screen, and W + Space for both heroes passed.');
}finally{await browser.close();}
