import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/dragon-floor',{recursive:true});
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:800},isMobile:touch,hasTouch:touch});
  const page=await context.newPage(),errors=[],mode=touch?'touch':'desktop';page.on('pageerror',e=>errors.push(String(e)));
  const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
  const cdp=touch?await context.newCDPSession(page):null;
  const press=selector=>touch?page.locator(selector).tap():page.locator(selector).click();
  const shot=name=>page.screenshot({path:`output/dragon-floor/${mode}-${name}.png`});
  async function walk(dx,dz,ms){
   if(touch){const b=await page.locator('.joystick').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+dx*50,y:y+dz*50}]});
    await step(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   }else{const key=dx?(dx>0?'d':'a'):(dz>0?'s':'w');await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);}
   await step(150);
  }
  async function orbit(delta){const {width,height}=page.viewportSize(),x=width-40,y=height*.5;
   if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:2,x:x+delta,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+delta,y,{steps:10});await page.mouse.up();}
   await step(0);
  }
  await page.goto('http://127.0.0.1:5188/?room=10');await page.waitForFunction(()=>!!window.advanceTime);await step(0);await press('.welcome-play');
  await page.evaluate(async()=>{
   const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   g.finale.dragon.locks[0]=g.finale.dragon.locks[1]=true;
   Object.assign(t.actors.mia,{x:35.5,z:-9.5});Object.assign(t.actors.yuki,{x:25,z:-15});g.motion.yuki.y=5;
  });
  await step(4500);assert.equal((await state()).finale.dragon.lift.y,5);
  await shot('court');await walk(0,-1,350);assert.ok((await state()).player.z<-11);
  assert.equal((await state()).finale.recoveries,0);await shot('court-walk');
  await orbit(-160);await shot('court-angle');await orbit(160);
  await page.evaluate(async()=>{
   const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   Object.assign(t.actors.mia,{x:-13,z:-23});Object.assign(g.motion.mia,{y:5,vy:0,grounded:true});
   g.finale.dragon.locks[2]=true;
  });
  // Actual approach movement reaches the relocated pad, without passing behind a panel.
  await walk(-1,0,850);await step(500);
  assert.equal((await state()).finale.controls[5],true);await shot('brake');
  if(touch)await press('[data-action="switchHero"]');else await page.keyboard.press('Tab');
  await step(2000);assert.equal((await state()).finale.controls[5],true);
  const expectedWord=await page.evaluate(async()=>{
   const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   const word=g.blocks[0],dx=word.x+26,dz=word.z+19,len=Math.hypot(dx,dz);
   Object.assign(t.actors.yuki,{x:word.x+dx/len*1.3,z:word.z+dz/len*1.3});Object.assign(g.motion.yuki,{y:5,grounded:true});
   g.facing=Math.atan2(word.x-g.player.x,word.z-g.player.z);return word.text;
  });
  await step(0);if(touch)await press('[data-action="interact"]');else await page.keyboard.press('e');await step(0);
  assert.equal((await state()).carried,expectedWord);assert.equal((await state()).finale.controls[5],true);
  if(touch)await press('[data-action="switchHero"]');else await page.keyboard.press('Tab');await step(600);
  await page.evaluate(async()=>{
   const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   Object.assign(t.actors.mia,{x:0,z:-30});Object.assign(g.motion.mia,{y:5,vy:0,grounded:true});Object.assign(g.finale.heart,{state:'carried',carrier:'mia'});
  });
  await orbit(-Math.PI/.005);await step(0);await shot('heart-gap');
  assert.equal((await state()).finale.dragon.bridgeReady,false);
  assert.equal(await page.evaluate(async()=>{const {roomRoot}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();return roomRoot.getObjectByName('dragon-final-bridge').visible;}),false);
  await page.evaluate(async()=>{
   const {game:g}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   const {DRAGON_PANELS}=await import('/src/dragon-layout.ts');
   for(const panel of DRAGON_PANELS)for(const slot of panel.slots){g.finale.dragon.carousel.attached.delete(slot);Object.assign(g.blocks[slot],g.layout.sockets[slot],{y:5.29,state:'socket',slot});}
  });
  await step(3500);assert.equal((await state()).finale.dragon.bridgeReady,true);await shot('heart-connected');
  // The camera now faces inward; forward input walks directly across the short bridge.
  await walk(0,-1,1100);
  assert.ok((await state()).player.z>-23.5,JSON.stringify((await state()).player));
  if(touch)await press('[data-action="interact"]');else await page.keyboard.press('e');await step(100);
  assert.equal((await state()).finale.dragon.restored,true);assert.equal((await state()).finale.recoveries,0);await shot('heart-restored');
  assert.deepEqual(errors,[]);await writeFile(`output/dragon-floor/${mode}-result.json`,JSON.stringify({passed:true,errors,state:await state()},null,2));
  await context.close();console.log(`PASS ${mode}: widened court movement and views; accessible held carousel pad; inactive Heart gap; short bridge traversal and deliberate restoration`);
 }
}finally{await browser.close();}
