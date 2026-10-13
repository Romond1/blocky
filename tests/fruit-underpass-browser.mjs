import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/fruit-underpass',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/fruit-underpass/${name}.png`});await writeFile(`output/fruit-underpass/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify({p:n.player,m:n.motion[n.selectedHero],lift:n.elevator})}`);}
const hidden=s=>s.collectibles.filter(c=>c.type==='coin'&&c.position.y===-3);
try{
 await page.goto('http://127.0.0.1:5188/?room=5&hero=mia');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await move('x',12.5);await move('z',-1.5);await step(300);let s=await state();assert.ok(s.collectibles.find(c=>c.id==='room5_coin_08').collected);assert.equal(hidden(s).length,4);await shot('01-stair-coin-and-hidden-coins');
 await hold('a',350);s=await state();assert.ok(s.player.x>=11.87);assert.equal(hidden(s).filter(c=>c.collected).length,0);await shot('02-down-lift-blocks-entry');
 await move('x',12.5);await move('z',4);await move('x',5);await move('z',1);await step(4400);assert.equal((await state()).elevator.state,'UP');
 await move('z',4);await move('x',12.5);await move('z',-1.5);await step(300);const before=(await state()).economy.heroCoins;await shot('03-raised-lift-reveals-coins');
 await move('x',10.8);await step(300);await move('z',1.8);await step(300);s=await state();assert.equal(s.motion.mia.y,-3);assert.equal(hidden(s).filter(c=>c.collected).length,4);assert.equal(s.economy.heroCoins,before+4);assert.equal(s.solved,false);await shot('04-four-coins-collected');
 // Lower from the other hero's control while Mia remains physically under the cabin.
 await press('Tab');await step(600);await move('z',-4);await move('x',5);await move('z',1);await step(5000);s=await state();assert.equal(s.elevator.state,'MOVING_DOWN');assert.equal(s.elevator.blocked,true);assert.ok(s.elevator.y-.5>s.motion.mia.y+2.8);
 await press('Tab');await step(600);await shot('05-lowering-pauses-over-hero');await press('Space');assert.equal((await state()).motion.mia.grounded,true);
 await move('z',-2.4);await move('x',12.5);await move('z',4);await step(1000);assert.equal((await state()).elevator.state,'DOWN');await shot('06-safe-stair-return');
 await press('r');assert.equal(hidden(await state()).filter(c=>c.collected).length,4);await page.reload();await page.waitForFunction(()=>window.render_game_to_text);await step(0);assert.equal(hidden(await state()).filter(c=>c.collected).length,4);
 await page.locator('#reset-all-testing').click();await step(0);assert.equal((await state()).economy.heroCoins,0);assert.deepEqual(errors,[]);
 console.log('Under-lift keyboard stair approach, closed entry, four raised-lift coins, descent clearance, safe retreat, persistence and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
