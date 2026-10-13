import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/luma',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/luma/${name}.png`});await writeFile(`output/luma/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify(n.player)}`);}
const mainUnchanged=async()=>{const s=await state();assert.equal(s.room,'fruit');assert.equal(s.solved,false);assert.deepEqual(s.elevator.matches,[false,false,false]);assert.deepEqual(s.elevator.controls,[false,false]);assert.equal(s.elevator.state,'DOWN');assert.equal(s.doorLift,0);};
try{
 await page.goto('http://127.0.0.1:5188/?room=5&hero=mia');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await move('x',3);await move('z',-6);await move('x',10.8);await move('z',-9.8);await shot('01-pear-hidden-entrance');
 await move('z',-20.8);await move('x',0);await move('z',-22);await shot('02-luma-gallery');await mainUnchanged();
 assert.equal((await state()).collectibles.find(c=>c.type==='memoryCrystal').visible,true);
 await move('x',5.8);await move('z',-29.2);await hold('w',400);
 let s=await state();assert.ok(s.player.z>=-30&&s.player.z<-29.8);assert.equal(s.memoryAlcove.gateLift,0);assert.equal(s.economy.memoryCrystals,0);await shot('03-closed-bars-visible-crystal');
 await move('z',-22.2);await move('x',3.8);await press('e');assert.equal((await state()).carried,'WOLF');
 await move('z',-24.5);await move('x',-1.2);await press('e');await step(800);assert.equal((await state()).memoryAlcove.solved,false);await shot('04-wrong-wolf');await mainUnchanged();
 await move('x',1);await move('z',-21.1);await move('x',-1.2);await press('e');assert.equal((await state()).carried,'FOX');
 await move('z',-24.5);await press('e');await step(800);assert.equal((await state()).memoryAlcove.solved,true);assert.equal((await state()).carried,'WOLF');await mainUnchanged();
 await move('z',-22.5);await move('x',.8);await press('e');assert.equal((await state()).carried,null);await shot('05-fox-opens-gate');
 await move('z',-28.8);await move('x',5.8);await move('z',-33.5);await step(300);s=await state();assert.equal(s.economy.memoryCrystals,1);assert.equal(await page.locator('.memory-total').isVisible(),true);await shot('06-luma-crystal-collected');
 await move('z',-28.8);await move('x',8.1);await move('z',-20.8);await move('x',10.8);await move('z',-9.8);await mainUnchanged();await shot('07-returned-to-pear');
 await press('r');s=await state();assert.equal(s.memoryAlcove.solved,false);assert.equal(s.economy.memoryCrystals,1);assert.equal(s.collectibles.find(c=>c.type==='memoryCrystal').visible,false);
 await page.reload();await page.waitForFunction(()=>window.render_game_to_text);await step(0);assert.equal((await state()).economy.memoryCrystals,1);
 await page.setViewportSize({width:960,height:640});await step(0);await shot('08-small-window-reset');
 await page.locator('#reset-all-testing').click();await step(0);assert.equal((await state()).economy.memoryCrystals,0);assert.deepEqual(errors,[]);
 console.log('Luma keyboard entrance, left turn, artwork, locked visible crystal, WOLF rejection, FOX success, return, persistence and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
