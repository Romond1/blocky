import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/dragon-lift-placement',{recursive:true});
try{for(const touch of [false,true]){
 const mode=touch?'touch':'desktop',context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:800},isMobile:touch,hasTouch:touch}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));const cdp=touch?await context.newCDPSession(page):null;
 const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
 const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
 const press=selector=>touch?page.locator(selector).tap():page.locator(selector).click();
 const action=async name=>{if(touch)await press(`[data-action="${name}"]`);else await page.keyboard.press({interact:'e',switchHero:'Tab',jump:'Space'}[name]);await step(name==='switchHero'?650:20);};
 const shot=name=>page.screenshot({path:`output/dragon-lift-placement/${mode}-${name}.png`});
 async function walk(dx,dz,ms){
  if(touch){const b=await page.locator('.joystick').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+dx*50,y:y+dz*50}]});await step(ms);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{const key=dx?(dx>0?'d':'a'):(dz>0?'s':'w');await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);}
  await step(100);
 }
 await page.goto('http://127.0.0.1:5188/?room=10');await page.waitForFunction(()=>!!window.advanceTime);await step(0);await press('.welcome-play');
 await page.evaluate(async()=>{
  const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
  g.finale.dragon.locks[0]=g.finale.dragon.locks[1]=true;g.finale.dragon.liftUnlocked=true;
  Object.assign(t.actors.mia,{x:31.1,z:-9.2});Object.assign(t.actors.yuki,{x:33,z:-9.2});g.facing=Math.PI;
  Object.assign(g.finale.heart,{state:'carried',carrier:'mia'});
 });
 await step(20000);assert.equal((await state()).finale.dragon.lift.boarding,true);assert.equal((await state()).finale.dragon.lift.y,0);await shot('waiting-at-lower-pad');
 await walk(0,-1,450);assert.equal((await state()).finale.dragon.lift.y,0,'wait for the other hero');
 await action('switchHero');await walk(0,-1,950);await step(4500);
 let s=await state();assert.equal(s.finale.dragon.lift.y,5);assert.equal(s.motion.mia.y,5);assert.equal(s.motion.yuki.y,5);assert.equal(s.finale.recoveries,0);await shot('both-heroes-up');
 await action('switchHero');await walk(-1,0,640);await step(200);s=await state();assert.ok(s.player.x<27.6);assert.equal(s.motion.mia.y,5);await shot('upper-landing');
 await walk(0,-1,1250);await action('switchHero');await walk(-1,0,1900);await walk(0,-1,2250);
 s=await state();assert.equal(s.finale.dragon.locks[2],true,'both heroes and Heart reach the upper route after unlocking');assert.equal(s.finale.dragon.lift.state,'UP','walking through the landing does not trigger its side control');
 await action('switchHero');
 // Placement fixture only stages the approach. Actual ACTION places and picks up each block.
 await page.evaluate(async()=>{
  const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
  const d=g.finale.dragon;d.lift.y=0;d.lift.state='DOWN';d.liftBoarding=false;
  Object.assign(t.actors.mia,{x:33.715,z:-12.9});Object.assign(g.motion.mia,{y:0,vy:0,grounded:true});g.facing=Math.PI;
  Object.assign(t.actors.yuki,{x:25,z:-20});Object.assign(g.motion.yuki,{y:5,vy:0,grounded:true});
  Object.assign(g.finale.heart,{state:'carried',carrier:'yuki'});
  Object.assign(g.blocks[10],{x:32,z:-14,y:0,state:'floor',support:undefined});
  Object.assign(g.blocks[13],{state:'carried',carrier:'mia',support:undefined});
 });
 await action('interact');s=await state();assert.equal(s.blocks[13].state,'floor');assert.equal(s.blocks[13].y,0);assert.equal(s.blocks[13].support,undefined);assert.ok(Math.abs(s.blocks[13].x-s.blocks[10].x-1.715)<.03);await shot('blocks-beside');
 await action('interact');assert.equal((await state()).blocks[13].state,'carried');
 await page.evaluate(async()=>{const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();Object.assign(t.actors.mia,{x:32,z:-11.1});g.facing=Math.PI;});
 await action('interact');s=await state();assert.equal(s.blocks[13].support,10);assert.equal(s.blocks[13].y,2.2);await step(2000);assert.equal((await state()).blocks[13].support,10);await shot('small-on-large');
 // Touching steps: the same real jump/move controls for desktop and touch.
 await page.evaluate(async()=>{const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();Object.assign(g.blocks[13],{x:32,z:-12.3,y:0,support:undefined});Object.assign(t.actors.mia,{x:32,z:-10.7});Object.assign(g.motion.mia,{y:0,vy:0,grounded:true});});
 await action('jump');await walk(0,-1,470);await step(900);assert.equal((await state()).motion.mia.y,1.2);
 await action('jump');await walk(0,-1,400);await step(900);assert.equal((await state()).motion.mia.y,2.2);await shot('jumped-adjacent-steps');
 assert.deepEqual(errors,[]);await writeFile(`output/dragon-lift-placement/${mode}-result.json`,JSON.stringify({passed:true,errors,state:await state()},null,2));
 await context.close();console.log(`PASS ${mode}: untimed boarding, both heroes and Heart lifted; face-adjacent placement, intentional small-on-large stack, jumping touching steps`);
}}finally{await browser.close();}
