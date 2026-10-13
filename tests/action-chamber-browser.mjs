import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await mkdir('output/action-chamber',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/action-chamber/${name}.png`});await writeFile(`output/action-chamber/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){let s=await state();for(let i=0;i<50&&Math.abs(s.player[axis]-target)>.04;i++){
 const d=target-s.player[axis],belt=axis==='z'&&s.player.x< -7.85&&s.player.x> -12.15&&s.player.z>11.35&&s.player.z<24.5;
 const v=(!s.motion[s.selectedHero].grounded?5:s.selectedHero==='mia'?7:3.5)*(s.blocks.find(b=>b.state==='carried'&&b.carrier===s.selectedHero)?.carrySpeedMultiplier??1);
 const speed=belt?(d<0?v-5.5:v+5.5):v;
 await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.min(500,Math.abs(d)/Math.max(.5,speed)*1000));s=await state();
 }assert.ok(Math.abs(s.player[axis]-target)<.18,`blocked ${axis} ${target}: ${JSON.stringify(s.player)} y=${s.motion[s.selectedHero].y} carried=${s.carried}`);}
const swap=async()=>{await press('Tab');await step(600);};
let s;try{
 await page.goto('http://127.0.0.1:5188/?room=7&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 assert.equal((await state()).room,'action');assert.ok((await state()).player.z>29);assert.equal((await state()).bounds.halfDepth,35);await shot('01-expanded-forecourt');
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
 await move('x',6);await move('z',3.8);await move('x',0);await move('z',2.5);await press('e');assert.equal((await state()).carried,null);
 await swap();await move('z',27);await move('x',-10);await move('z',24.6);await hold('w',9000);
 assert.equal((await state()).actionChamber.earned[0],false);await press('e');assert.equal((await state()).carried,'RUN');await shot('03-run-earned');
 await move('z',25.4);await move('x',-6);await move('z',3.8);await move('x',0);await press('e');assert.equal((await state()).carried,null);
 await move('x',-3);await move('z',25.2);await move('x',1.3);await move('z',22.9);
 await press('Space');await move('z',21.4);await step(900);assert.ok(Math.abs((await state()).motion.mia.y-.95)<.02);
 const recoveries=(await state()).events.filter(e=>e==='FALL_SAFE').length;
 await move('x',0);await step(1100);assert.equal((await state()).motion.mia.y,0);assert.equal((await state()).actionChamber.earned[1],false);
 assert.equal((await state()).events.filter(e=>e==='FALL_SAFE').length,recoveries);await shot('04-missed-jump-normal-floor');
 await move('z',25.2);await move('x',1.3);await move('z',22.9);
 for(const z of [21.4,19.1,16.8,14.5,12.2]){await press('Space');await move('z',z);await step(1000);}
 assert.equal((await state()).actionChamber.earned[1],false);await press('e');assert.equal((await state()).carried,'JUMP');await shot('05-split-steps-summit');
 for(const z of [14.5,16.8,19.1,21.4,23.4]){await press('Space');await move('z',z);await step(1100);}
 assert.equal((await state()).motion.mia.y,0);assert.equal((await state()).carried,'JUMP');
 await move('x',-4.5);await move('z',3.8);await move('x',-1.3);await press('e');assert.equal((await state()).carried,null);await shot('06-flat-ferry-loaded');
 await move('x',-4);await move('z',2.5);await step(4300);assert.ok(Math.abs((await state()).heroes.yuki.z+14.5)<.2);
 for(const b of (await state()).blocks.slice(0,3))assert.ok(b.z< -6);await shot('07-cargo-across');
 await swap();await move('x',-1.4);await move('z',-15.8);await press('e');assert.equal((await state()).carried,'LIFT');
 await move('z',-19.1);await move('x',0);await press('e');assert.equal((await state()).slotFeedback[1],'wrong');
 // Clear the wrong plate physically before bringing its replacement.
 await move('z',-19.3);await press('e');assert.equal((await state()).carried,'LIFT');await move('z',-17.5);await move('x',3);await press('e');assert.equal((await state()).carried,null);assert.equal((await state()).placed[1],null);
 await move('z',-18);await move('x',3);await move('z',-13.2);await move('x',2.6);await press('e');assert.equal((await state()).carried,'RUN');
 await move('z',-19.1);await move('x',-7);await press('e');assert.equal((await state()).slotFeedback[0],'correct');
 await move('z',-18);await move('x',-1.4);await move('z',-13.2);await press('e');assert.equal((await state()).carried,'JUMP');
 await move('z',-19.1);await move('x',0);await press('e');assert.equal((await state()).carried,null);assert.equal((await state()).slotFeedback[1],'correct');
 await move('z',-17.5);await move('x',3);await press('e');assert.equal((await state()).carried,'LIFT');await move('x',7);await move('z',-19.1);await press('e');await step(5000);
 assert.equal((await state()).solved,true);assert.equal((await state()).doorPowered,true);assert.equal((await state()).escaped,false);await shot('08-all-matched');
 await move('z',-18);await move('x',-4);await move('z',-14.5);await step(4300);assert.equal((await state()).actionChamber.ferryZ,2.5);
 await swap();await move('z',3.8);await move('x',0);
 await swap();await move('z',-18);await move('x',-4);await move('z',-14.5);await step(4300);assert.ok(Math.abs((await state()).heroes.mia.z+13.2)<.2);await shot('09-both-across');
 await move('z',-18);await swap();await move('z',-18);await move('x',12);await move('z',-25);await move('z',-30);await step(15000);
 assert.equal((await state()).room,'ability');await shot('10-room8-transition');
 await page.goto('http://127.0.0.1:5188/?room=7&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await press('r');assert.deepEqual((await state()).actionChamber.earned,[false,false,false]);assert.equal((await state()).actionChamber.ferryZ,2.5);assert.ok((await state()).player.z>29);
 await page.setViewportSize({width:960,height:640});await step(0);await shot('11-small-window-forecourt');assert.deepEqual(errors,[]);
 console.log('Room 7 visible goals, construction LIFT, conveyor RUN, split-step ascent/descent and missed-jump retry, flat ferry cargo, matching, team exit and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}

