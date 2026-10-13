import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const tick=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const hold=async(key,ms)=>{await page.keyboard.down(key);await tick(ms);await page.keyboard.up(key);};
const press=async key=>{await page.keyboard.press(key);await tick(0);};
const out='output/movement';await mkdir(out,{recursive:true});
function checkCarry(s){
 const held=s.movement.carried.find(b=>b.hero===s.selectedHero);assert.ok(held,'held cube visible');
 const p=s.player,a=s.facing,dx=held.center.x-p.x,dz=held.center.z-p.z;
 assert.ok(Math.abs(dx*Math.cos(a)-dz*Math.sin(a))<.0001,'cube off center');
 assert.ok(dx*Math.sin(a)+dz*Math.cos(a)>.8,'cube behind hero');
 for(const hand of [held.leftHand,held.rightHand]){
  const forward=(hand.x-p.x)*Math.sin(a)+(hand.z-p.z)*Math.cos(a);
  assert.ok(forward>.4,'hand not holding front');
 }
}
try{
 for(const hero of ['yuki','mia']){
  await page.goto(`http://127.0.0.1:5188/?room=1&hero=${hero}`);await page.waitForFunction(()=>window.advanceTime);await tick(0);
  // Letter A is on the open entrance side in this deterministic arrangement.
  let s=await state();const b=s.blocks.find(b=>b.x>3&&b.z>2);assert.ok(b);
  const speed=3.5*s.abilities[hero].speedMultiplier;
  await hold('d',(b.x-s.player.x)/speed*1000);s=await state();
  await hold(s.player.z>b.z+1.05?'w':'s',Math.abs(s.player.z-(b.z+1.05))/speed*1000);
  await press('e');await tick(500);checkCarry(await state());
  // Face toward the camera, then orbit for a readable three-quarter carrying view.
  await hold('w',600);await hold('s',330);await tick(200);checkCarry(await state());
  await page.mouse.move(750,480);await page.mouse.down();await page.mouse.move(990,540,{steps:6});await page.mouse.up();await page.mouse.wheel(0,250);await tick(600);
  await page.screenshot({path:`${out}/${hero}-two-hand-carry.png`});
  // Camera-relative movement can aim between the old eight headings.
  await hold('a',100);await tick(150);s=await state();checkCarry(s);
  const start={...s.player},facing=s.facing,carried=s.blocks.find(b=>b.carrier===hero&&b.state==='carried');
  await press('e');s=await state();const dropped=s.blocks.find(b=>b.id===carried.id);assert.equal(dropped.state,'floor');
  const dx=dropped.x-start.x,dz=dropped.z-start.z;
  assert.ok(Math.abs(dx*Math.cos(facing)-dz*Math.sin(facing))<.0001,'drop moved sideways');
  assert.ok(dx*Math.sin(facing)+dz*Math.cos(facing)>0);
  await page.screenshot({path:`${out}/${hero}-front-drop.png`});
  // Pick up again and verify TAB preserves the old holder's pose and position.
  await press('e');await tick(500);checkCarry(await state());s=await state();const before=s.movement.carried[0].center;
  await press('Tab');await tick(800);s=await state();const after=s.movement.carried.find(b=>b.hero===hero).center;
  assert.deepEqual(after,before);assert.equal(s.companion.state,'HOLDING_OBJECT');
 }
 // Heavy lift animation ends at the same center line and frees both hands.
 await page.goto('http://127.0.0.1:5188/?room=2&hero=yuki');await page.waitForFunction(()=>window.advanceTime);await tick(0);
 let s=await state();const heavy=s.blocks.find(b=>b.weightClass==='heavy');
 await hold('d',(heavy.x-1.5-s.player.x)/3.5*1000);s=await state();await hold('w',(s.player.z-heavy.z)/3.5*1000);
 await press('e');assert.equal((await state()).heavyAction.kind,'HEAVY_LIFT');await tick(600);checkCarry(await state());
 await hold('s',330);await tick(200);checkCarry(await state());
 await page.mouse.move(750,480);await page.mouse.down();await page.mouse.move(990,540,{steps:6});await page.mouse.up();await page.mouse.wheel(0,250);await tick(600);
 await page.screenshot({path:`${out}/yuki-heavy-carry.png`});
 assert.deepEqual(errors,[]);await writeFile(`${out}/carry-results.json`,JSON.stringify({passed:true,errors,checks:'both hands, centered cubes, continuous angles, forward drops, held companion, heavy lift'}));
 console.log('Both heroes: centered two-hand carry, continuous aim, front drops, TAB holding pose and heavy lift passed.');
}finally{await browser.close();}
