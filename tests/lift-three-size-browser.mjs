import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await mkdir('output/action-stations',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/action-stations/${name}.png`});await writeFile(`output/action-stations/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){let s=await state();for(let i=0;i<50&&Math.abs(s.player[axis]-target)>.04;i++){
 const d=target-s.player[axis],belt=axis==='z'&&s.player.x< -7.85&&s.player.x> -12.15&&s.player.z>11.35&&s.player.z<24.5;
 const v=(!s.motion[s.selectedHero].grounded?5:s.selectedHero==='mia'?7:3.5)*(s.blocks.find(b=>b.state==='carried'&&b.carrier===s.selectedHero)?.carrySpeedMultiplier??1);
 const speed=belt?(d<0?v-5.5:v+5.5):v;
 await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.min(500,Math.abs(d)/Math.max(.5,speed)*1000));s=await state();
 }assert.ok(Math.abs(s.player[axis]-target)<.18,`blocked ${axis} ${target}: ${JSON.stringify(s.player)} y=${s.motion[s.selectedHero].y} carried=${s.carried}`);}
try{
 await page.goto('http://127.0.0.1:5188/?room=7&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);if(await page.locator('.welcome-play').isVisible())await page.locator('.welcome-play').click();await step(0);let s;
 await move('x',12);await move('z',25.5);await shot('lift-entrance');
 await move('x',10);await move('z',23);await press('e');await step(600);assert.equal((await state()).blocks[3].state,'carried');
 await move('x',8);await move('z',25.5);await move('z',18.7);await move('x',12);await move('z',17.6);await press('e');assert.equal((await state()).carried,null);await shot('05-large-base');
 await move('z',24.5);await move('x',13);await move('z',23.6);await press('e');assert.equal((await state()).blocks[4].state,'carried');
 await move('z',24.5);await move('x',12);await move('z',19.4);await press('e');assert.equal((await state()).blocks[4].state,'floor');await shot('06-small-first-step');
 await move('z',24.5);await move('x',14.2);await move('z',22.4);await press('e');assert.equal((await state()).blocks[5].state,'carried');
 await move('z',24.5);await move('x',12);await move('z',20.3);await press('Space');await move('z',18.6);await step(900);assert.equal((await state()).motion.yuki.y,.8);
 await press('e');s=await state();assert.equal(s.blocks[5].support,3);assert.equal(s.blocks[5].y,2.2);await shot('07-small-big-small-route');

 const stack=(await state()).blocks.map(b=>({...b}));await press('Tab');await step(700);assert.equal((await state()).selectedHero,'mia');assert.deepEqual((await state()).blocks,stack);
 await move('z',27);await move('x',12);await move('z',20.3);await press('Space');await move('z',18.6);await step(900);assert.equal((await state()).motion.mia.y,.8);
 await press('Space');await move('z',17.18);await step(900);assert.equal((await state()).motion.mia.y,2.2);await press('e');assert.equal((await state()).blocks[5].state,'carried');await press('e');assert.equal((await state()).blocks[5].support,3);
 await press('Space');await move('z',16.3);await step(900);assert.equal((await state()).motion.mia.y,3);await move('z',15.75);
 await press('Space');await move('z',13);await step(900);assert.equal((await state()).motion.mia.y,3.8);await press('e');assert.equal((await state()).carried,'LIFT');await shot('mia-small-big-small-lift');assert.ok((await state()).ownershipValid);assert.deepEqual(errors,[]);
 console.log('Mia climbs the Yuki-built small/big/small route, retrieves the elevated small block, and collects LIFT without disturbing the stack on switch.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}


