import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/split',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/split/${name}.png`});await writeFile(`output/split/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify(n.player)}`);}
const go=async(x,z)=>{await move('x',x);await move('z',z);};
const swap=async()=>{await press('Tab');await step(600);};
async function jumpOnPlate(index,name){
 const before=await state(),plate=before.sockets[index];
 if(index===1){await move('z',2.6);await move('x',plate.x);await move('z',plate.z+1.7);}else{await move('z',plate.z+1.7);await move('x',plate.x);}
 await page.keyboard.down('w');await press('Space');await step(330);await page.keyboard.up('w');await step(700);
 const standing=await state();assert.equal(standing.motion[standing.selectedHero].y,.2825);assert.ok(standing.motion[standing.selectedHero].grounded);
 assert.deepEqual(standing.stageSolved,before.stageSolved);assert.equal(standing.doorLift,0);await shot(name);
 await hold('s',700);await step(400);assert.equal((await state()).motion[standing.selectedHero].y,0);
}

try{
 await page.goto('http://127.0.0.1:5188/?room=3&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);await shot('01-hallway');
 await hold('w',2000);assert.ok((await state()).player.z>=16.78);await page.keyboard.down('w');await press('Space');await press('Space');await step(750);await page.keyboard.up('w');await step(200);assert.ok((await state()).motion.yuki.crossed);await shot('02-floor-map');await jumpOnPlate(0,'02a-yuki-on-plate');await move('x',-10);
 await swap();assert.ok((await state()).player.z>18);await hold('w',1100);await page.keyboard.down('w');await press('Space');await step(750);await page.keyboard.up('w');await step(200);assert.ok((await state()).motion.mia.crossed);await jumpOnPlate(0,'02b-mia-on-plate');
 await move('x',-9);await move('z',3);await press('e');assert.equal((await state()).heavyAction.kind,'HEAVY_STRUGGLE');await hold('a',100);await step(500);assert.equal((await state()).carried,null);
 await swap();await move('z',3);await go(-9,3);await press('e');await step(550);assert.equal((await state()).carried,'FAST');await move('z',5);await move('x',-12);await press('e');assert.equal((await state()).slotFeedback[0],'wrong');await shot('03-wrong-word');
 // A held boulder extends beyond the hero, so leave turning room beside the west wall.
 await press('e');await step(550);await go(-15,9);await press('e');await go(-16,2);await move('x',-14);await press('e');await step(550);assert.equal((await state()).carried,'STRONG');await go(-15,5);await move('x',-12);await press('e');assert.deepEqual((await state()).stageSolved,[true,false]);await shot('04-powered');
 // Yuki can attempt the crossing, fall safely, and walk back up the ramp.
 await move('x',-9);await move('z',1);await move('x',-3.5);await move('z',-2);let timing=await state();await step((5.5-timing.bridge.time%5.5+.82)%5.5*1000);
 await hold('d',3400);await step(1000);assert.equal((await state()).motion.yuki.y,-3);await shot('04b-safe-fall');
 await move('z',7);await move('x',-9);assert.equal((await state()).motion.yuki.y,0);await shot('04c-return-ramp');await go(-10,15);await shot('04d-map-powered');await go(-9,7);
 await swap();await move('x',-6);await move('z',-2);await move('x',-3.5);
 let s=await state();await step((5.5-s.bridge.time%5.5+.82)%5.5*1000);await hold('d',2000);assert.ok((await state()).player.x>9);assert.equal((await state()).motion.mia.y,0);await shot('05-crossed');await jumpOnPlate(1,'05b-mia-on-far-plate');
 // Light cubes also need room for their corners while turning by the east wall.
 await go(10.5,4.6);await move('x',15);await press('e');assert.equal((await state()).carried,'N');await go(16,.7);await move('x',14);await press('e');assert.equal((await state()).slotFeedback[1],'wrong');await shot('06-wrong-letter');
 await press('e');await move('x',16);await move('z',2.5);await press('e');assert.equal((await state()).carried,null,'turn into free floor before dropping N');await move('z',2);await go(11,2.5);await move('x',12);await press('e');assert.equal((await state()).carried,'M');await move('z',.7);await move('x',14);await press('e');await step(3500);assert.equal((await state()).solved,true);assert.equal((await state()).bridge.extension,1);await shot('07-stable');
 await move('x',11);await move('z',-2);await move('x',-9);await shot('08-reunion');await go(-10,15);await shot('08b-map-stable');await move('z',7);await move('x',-16);await move('z',-2);await move('x',-14);await move('z',-6.5);await step(15000);assert.equal((await state()).room,'cooperation');assert.deepEqual((await state()).stageSolved,[false,false,false]);await shot('09-team-exit');
 await page.goto('http://127.0.0.1:5188/?room=3&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await press('r');s=await state();assert.deepEqual(s.stageSolved,[false,false]);assert.equal(s.bridge.extension,0);assert.equal(s.motion.mia.crossed,false);assert.equal(s.doorLift,0);await shot('10-reset');await page.setViewportSize({width:960,height:640});await page.waitForTimeout(150);await step(0);await shot('11-small-window');
 assert.deepEqual(errors,[]);console.log('Full Room 3 keyboard playthrough passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}


