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
 await page.goto('http://127.0.0.1:5188/?room=7&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);await shot('01-initial-visible-goals');
 let s=await state();assert.deepEqual(s.actionChamber.collected,[false,false,false]);assert.equal(s.blocks[2].y,3.8);
 await move('x',-10);await move('z',24.65);await hold('w',3000);s=await state();assert.ok(s.player.z>24);await shot('02-yuki-resistance');
 await press('r');await press('Tab');await step(600);await move('z',27);await move('x',-10);await move('z',24.6);await shot('run-entrance');await hold('w',4200);s=await state();assert.ok(s.player.z>16&&s.player.z<19);const z=s.player.z;await step(400);assert.ok((await state()).player.z>z+2);await shot('03-mia-resistance');
 await hold('w',6000);await press('e');assert.equal((await state()).carried,'RUN');assert.equal((await state()).actionChamber.collected[0],true);await shot('04-run-collected');
 await press('r');await step(100);if((await state()).selectedHero!=='yuki'){await press('Tab');await step(600);}
 await move('x',12);await move('z',25.5);await shot('lift-entrance');
 await move('x',10);await move('z',23);await press('e');await step(600);assert.equal((await state()).blocks[3].state,'carried');
 await move('x',8);await move('z',25.5);await move('z',18.7);await move('x',12);await move('z',17.6);await press('e');assert.equal((await state()).carried,null);await shot('05-large-base');
 await move('z',24.5);await move('x',13);await move('z',23.6);await press('e');assert.equal((await state()).blocks[4].state,'carried');
 await move('z',24.5);await move('x',12);await move('z',19.4);await press('e');assert.equal((await state()).blocks[4].state,'floor');await shot('06-small-first-step');
 await move('z',24.5);await move('x',14.2);await move('z',22.4);await press('e');assert.equal((await state()).blocks[5].state,'carried');
 await move('z',24.5);await move('x',12);await move('z',20.3);await press('Space');await move('z',18.6);await step(900);assert.equal((await state()).motion.yuki.y,.8);
 await press('e');s=await state();assert.equal(s.blocks[5].support,3);assert.equal(s.blocks[5].y,2.2);await shot('07-small-big-small-route');
 await press('Space');await move('z',17.18);await step(900);assert.equal((await state()).motion.yuki.y,2.2);await shot('08-big-climbed');
 await press('e');assert.equal((await state()).blocks[5].state,'carried');await shot('08a-elevated-small-pickup');await press('e');assert.equal((await state()).blocks[5].support,3);
 await press('Space');await move('z',16.3);await step(900);assert.equal((await state()).motion.yuki.y,3);await shot('09-top-small-climbed');
 await move('z',15.75);await press('Space');await move('z',13);await step(900);assert.equal((await state()).motion.yuki.y,3.8);await press('e');assert.equal((await state()).carried,'LIFT');assert.equal((await state()).actionChamber.collected[2],true);await shot('10-lift-collected');
 await press('r');await step(100);await move('x',1.3);await move('z',25.5);await shot('jump-entrance');await move('z',22.9);
 for(const z of [21.4,19.1,16.8,14.5,12.2]){await press('Space');await move('z',z);await step(1000);}
 assert.equal((await state()).actionChamber.collected[1],false);await press('e');assert.equal((await state()).carried,'JUMP');await shot('10-jump-collected');
 await press('Tab');await step(1000);assert.equal((await state()).companion.state,'HOLDING_OBJECT');assert.ok((await state()).ownershipValid);
 await press('r');s=await state();assert.deepEqual(s.actionChamber.collected,[false,false,false]);assert.equal(s.actionChamber.ferryZ,2.5);assert.ok(s.blocks.every(b=>b.state==='floor'));assert.deepEqual(errors,[]);
 console.log('Room 7 keyboard conveyor, visible rewards, small/big/small construction and climb to LIFT, JUMP, switch and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}


