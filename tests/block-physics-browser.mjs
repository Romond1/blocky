import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {boxesOverlap} from '../src/block-collision.ts';

const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const out='output/block-physics';await mkdir(out,{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{
 await page.mouse.move(750,480);await page.mouse.down();await page.mouse.move(970,530,{steps:6});await page.mouse.up();await step(400);
 await page.screenshot({path:`${out}/${name}.png`});await writeFile(`${out}/${name}.json`,JSON.stringify(await state(),null,2));
 await page.mouse.move(970,530);await page.mouse.down();await page.mouse.move(750,480,{steps:6});await page.mouse.up();await step(400);
};
async function move(axis,target){
 let s=await state();
 for(let i=0;i<6&&Math.abs(s.player[axis]-target)>.035;i++){
  const d=target-s.player[axis],speed=s.motion[s.selectedHero].grounded?s.abilities[s.selectedHero].speedMultiplier*3.5:5;
  await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/speed*1000);s=await state();
 }
 assert.ok(Math.abs(s.player[axis]-target)<.16,`blocked ${axis} ${target}: ${JSON.stringify(s.player)}`);
}
function assertHeldClear(s){
 const held=s.movement.carried.find(b=>b.hero===s.selectedHero),block=s.blocks.find(b=>b.id===held?.id);
 assert.ok(held&&block,'expected a physical carried cube');
 const body={...held.center,halfX:block.size/2,halfY:block.size/2,halfZ:block.size/2,yaw:s.facing};
 for(const other of s.blocks.filter(b=>b.id!==block.id&&true)){
  const rest={x:other.x,y:(other.y??.015)+other.size/2,z:other.z,halfX:other.size/2,halfY:other.size/2,halfZ:other.size/2,yaw:0};
  assert.equal(boxesOverlap(body,rest),false,`carried ${block.text} intersects ${other.text}`);
 }
}
try{
 await page.goto('http://127.0.0.1:5188/?room=7&hero=mia');await page.waitForFunction(()=>window.advanceTime);await step(0);
 // Earn the real JUMP reward through the room's keyboard route.
 await move('x',1.3);await move('z',22.9);
 for(const z of [21.4,19.1,16.8,14.5,12.2]){await press('Space');await move('z',z);await step(1000);}
 assert.equal((await state()).actionChamber.earned[1],false);await press('e');assert.equal((await state()).carried,'JUMP');
 for(const z of [14.5,16.8,19.1,21.4,23.4]){await press('Space');await move('z',z);await step(1100);}
 await move('z',25);await move('x',10);
 // Sustained forward pressure must stop the held cube before the large cube.
 await page.keyboard.down('w');for(let i=0;i<50;i++){await step(25);assertHeldClear(await state());}await page.keyboard.up('w');
 let s=await state();assert.equal(s.carried,'JUMP');assert.ok(s.player.z>23.5&&s.player.z<23.8);
 const stopped={x:s.player.x,z:s.player.z};await hold('w',700);s=await state();assertHeldClear(s);assert.deepEqual({x:s.player.x,z:s.player.z},stopped);
 await shot('01-carried-cube-stopped-at-heavy');
 await press('e');s=await state();const heavy=s.blocks.find(b=>b.weightClass==='heavy'),jump=s.blocks.find(b=>b.text==='JUMP');
 assert.equal(s.carried,null);assert.equal(jump.state,'floor');assert.equal(jump.support,undefined);
 const rest=b=>({x:b.x,y:(b.y??0)+b.size/2,z:b.z,halfX:b.size/2,halfY:b.size/2,halfZ:b.size/2,yaw:0});
 assert.equal(boxesOverlap(rest(jump),rest(heavy)),false);await shot('02-forward-drop-beside-heavy');assert.deepEqual(errors,[]);
 await writeFile(`${out}/results.json`,JSON.stringify({passed:true,errors,checks:['full-volume carry collision','no push-through','forward drop without overlap']}));
 console.log('Room 7 keyboard full-volume carry collision, no push-through and forward drop passed. Climbing progression is verified by action-stations-browser.mjs.');
}catch(error){await shot('failure');console.error(error);process.exitCode=1;}finally{await browser.close();}
