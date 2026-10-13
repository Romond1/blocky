import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const touch=process.env.DRAGON_TOUCH==='1',output=touch?'output/dragon-mobile':'output/dragon';
const page=await browser.newPage(touch?{viewport:{width:844,height:390},isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}}),errors=[];
const act=()=>touch?page.locator('.touch-actions [data-action="interact"]').tap():page.keyboard.press('e');
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log(m.type(),m.text().slice(0,2000));});
await mkdir(output,{recursive:true});
await page.goto('http://127.0.0.1:5188/?room=10');
await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
const play=page.locator('.welcome-play');if(await play.isVisible())await (touch?play.tap():play.click());
await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).started);
await page.evaluate(async()=>{const {team}= (await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();team.select('mia');});
await page.waitForTimeout(1800);
await page.screenshot({path:`${output}/entry.png`});
await writeFile(`${output}/entry.json`,await page.evaluate(()=>window.render_game_to_text()));
const state=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));assert.equal(state.room,'dragon');assert.equal(state.finale.dragon.locks.length,4);assert.equal(state.economy.roomProgress.coinsTotal,12);assert.deepEqual(errors,[]);
for(const [name,p] of [['cooperation',{x:13,z:28,y:0}],['transport',{x:29,z:13,y:0}],['construction',{x:31,z:-10,y:0}],['carousel',{x:-29,z:-23,y:5}]]){
 await page.evaluate(async p=>{const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();Object.assign(t.actors.mia,{x:p.x,z:p.z});g.motion.mia.y=p.y;g.motion.mia.grounded=true;},p);
 await page.waitForTimeout(250);await page.screenshot({path:`${output}/${name}.png`});
}
await page.reload();await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
for(const choice of ['continue_adventure','leave_block_world']){
 if(choice==='leave_block_world'){await page.reload();await page.waitForFunction(()=>typeof window.render_game_to_text==='function');}
 if(await play.isVisible())await (touch?play.tap():play.click());
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).started);
 await page.evaluate(async()=>{
  window.finalChoiceEvents=[];window.addEventListener('room10_final_choice',e=>window.finalChoiceEvents.push(e.detail));
  const {game:g,team:t}= (await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
  t.select('mia');
  const {DRAGON_CHECKPOINTS,DRAGON_PANELS}=await import('/src/dragon-layout.ts');
  for(const index of [1,2,3]){const p=DRAGON_CHECKPOINTS[index];Object.assign(t.actors.mia,{x:p.x-1,z:p.z});Object.assign(t.actors.yuki,{x:p.x+1,z:p.z});for(const h of ['mia','yuki'])Object.assign(g.motion[h],{y:p.y,grounded:true});Object.assign(g.finale.heart,p,{state:'floor',carrier:undefined});g.refreshDevices(.1);}
  for(const panel of DRAGON_PANELS)for(const slot of panel.slots){g.finale.dragon.carousel.attached.delete(slot);Object.assign(g.blocks[slot],g.layout.sockets[slot],{y:5.29,state:'socket',slot});}
  Object.assign(t.actors.mia,{x:-24,z:-25});Object.assign(t.actors.yuki,{x:-22,z:-25});
 });
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).finale.dragon.bridgeReady);
 let s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));assert.equal(s.finale.dragon.bridgeReady,true,JSON.stringify(s.finale));
 await page.screenshot({path:`${output}/bridge-${choice}.png`});
 await page.evaluate(async()=>{const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();const {DRAGON_ALTAR}=await import('/src/dragon-layout.ts');Object.assign(t.actors.mia,{x:0,z:DRAGON_ALTAR.z-1.5});g.motion.mia.y=5;Object.assign(g.finale.heart,{state:'carried',carrier:'mia'});});
 await act();await page.waitForTimeout(150);
 s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));assert.equal(s.finale.dragon.restored,true);assert.equal(s.escaped,false);
 await page.screenshot({path:`${output}/restored-${choice}.png`});
 await page.evaluate(async choice=>{const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();const {DRAGON_ENDING_Z}=await import('/src/dragon-layout.ts');const d=g.finale.dragon;Object.assign(t.actors.mia,{x:(choice==='continue_adventure')===d.continueLeft?-7:7,z:DRAGON_ENDING_Z});},choice);
 await page.waitForTimeout(150);assert.equal(JSON.parse(await page.evaluate(()=>window.render_game_to_text())).finale.dragon.choice,null);
 await act();await page.waitForTimeout(2300);
 s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));assert.equal(s.finale.dragon.choice,choice);
 const events=await page.evaluate(()=>window.finalChoiceEvents);assert.equal(events.length,1);assert.equal(events[0].choice,choice);assert.ok(events[0].timeToChoiceMs>=0);
 await page.screenshot({path:`${output}/${choice}.png`});await writeFile(`${output}/${choice}.json`,JSON.stringify({state:s,events},null,2));
}
assert.deepEqual(errors,[]);console.log(`${touch?'Touch':'Desktop'}: both explicit choice paths, telemetry and restored rendering passed.`);
await browser.close();
