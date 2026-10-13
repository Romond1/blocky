import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
await mkdir('output/ferry-mechanism',{recursive:true});
try{
 await page.goto('http://127.0.0.1:5188/?room=7&hero=mia');await page.waitForFunction(()=>window.advanceTime);
 await hold('d',500);await hold('w',3800);
 await page.mouse.wheel(0,450);await step(100);
 await page.screenshot({path:'output/ferry-mechanism/near-dock.png'});
 // Approach the existing purple control plate on dry ground.
 let s=await state();await hold('a',(s.player.x+4)/7*1000);
 s=await state();await hold('w',(s.player.z-2.5)/7*1000);
 await step(1700);s=await state();assert.ok(s.actionChamber.ferryZ<2.5&&s.actionChamber.ferryZ> -14.5);
 await page.screenshot({path:'output/ferry-mechanism/in-transit.png'});
 await step(2600);assert.equal((await state()).actionChamber.ferryZ,-14.5);
 await page.screenshot({path:'output/ferry-mechanism/far-dock.png'});
 await hold('d',700);await hold('a',700);await step(4300);
 assert.equal((await state()).actionChamber.ferryZ,2.5);assert.deepEqual(errors,[]);
 console.log('Guide-rail ferry: departure, transit, far docking and return passed without browser errors.');
}finally{await browser.close();}
