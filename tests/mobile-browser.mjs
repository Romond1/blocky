import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const url=(process.env.GAME_URL??'http://127.0.0.1:5188').replace(/\/?$/,'/');
await mkdir('output/mobile',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const shot=name=>page.screenshot({path:`output/mobile/${name}.png`});
const tap=async selector=>{await page.locator(selector).tap();await step(0);};
const cdp=await context.newCDPSession(page);
const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({...p,radiusX:5,radiusY:5,force:1}))});
const center=async selector=>{const b=await page.locator(selector).boundingBox();assert.ok(b,selector);return {x:b.x+b.width/2,y:b.y+b.height/2};};
try{
 await page.goto(url);await page.waitForFunction(()=>!!window.advanceTime);await step(0);
 assert.equal((await state()).movement.controls.mode,'touch');assert.equal(await page.locator('.rotation-prompt').isVisible(),true);assert.equal((await state()).started,false);await shot('portrait');
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>document.querySelector('.rotation-prompt').hidden);await shot('touch-welcome');
 await tap('.welcome-play');assert.equal((await state()).started,true);assert.equal((await state()).movement.controls.mode,'touch');
 assert.equal(await page.locator('.touch-controls').isVisible(),true);assert.equal(await page.locator('#debug-toggle').isVisible(),false);assert.equal(await page.locator('#reset-all-testing').isVisible(),false);assert.equal(await page.locator('.room-navigation').count(),0);
 assert.equal((await state()).movement.controls.shadows,false);assert.ok((await state()).movement.controls.pixelRatio<=1.25);
 await shot('touch-game');
 for(const size of [{width:667,height:375},{width:568,height:320},{width:844,height:390}]){
  await page.setViewportSize(size);await page.waitForTimeout(80);await step(0);
  for(const selector of ['.joystick','[data-action="jump"]','[data-action="interact"]','[data-action="switchHero"]','#pause-menu']){
   const b=await page.locator(selector).boundingBox();assert.ok(b&&b.width>=44&&b.height>=44,`${selector} finger size`);assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1,`${selector} viewport fit`);
  }await shot(`landscape-${size.width}`);
 }
 let stick=await center('.joystick'),jump=await center('[data-action="jump"]'),before=(await state()).player;
 await touch('touchStart',[{id:1,...stick}]);await touch('touchMove',[{id:1,x:stick.x,y:stick.y-45}]);await step(200);
 assert.ok((await state()).player.z<before.z-.2);
 await touch('touchStart',[{id:1,x:stick.x,y:stick.y-45},{id:2,...jump}]);await step(130);
 assert.ok((await state()).motion.mia.y>.1,'multitouch jump while moving');assert.ok((await state()).movement.controls.touch.z>.5);
 await touch('touchEnd',[]);await step(650);assert.deepEqual((await state()).movement.controls.touch,{x:0,z:0});
 // Independent camera finger while movement stays held.
 const look=await center('.touch-look'),yaw=(await state()).camera.yaw;
 await touch('touchStart',[{id:1,...stick},{id:2,...look}]);await touch('touchMove',[{id:1,x:stick.x+35,y:stick.y},{id:2,x:look.x+35,y:look.y-15}]);await step(100);
 assert.notEqual((await state()).camera.yaw,yaw);assert.ok((await state()).movement.controls.touch.x>.1);
 await touch('touchCancel',[]);await step(0);assert.deepEqual((await state()).movement.controls.touch,{x:0,z:0});
 // Blur, orientation change and menu interrupts clear movement.
 for(const interrupt of ['blur','visibilitychange','pagehide']){
  await touch('touchStart',[{id:1,...stick}]);await touch('touchMove',[{id:1,x:stick.x+35,y:stick.y}]);
  await page.evaluate(type=>(type==='visibilitychange'?document:window).dispatchEvent(new Event(type)),interrupt);await step(0);
  assert.deepEqual((await state()).movement.controls.touch,{x:0,z:0},interrupt);await touch('touchCancel',[]);
  if((await state()).movement.controls.paused){const position=(await state()).player;await step(1000);assert.deepEqual((await state()).player,position);await page.locator('.menu-primary [data-menu="resume"]').tap();await step(0);}
 }
 const hero=(await state()).selectedHero;await tap('[data-action="switchHero"]');await step(500);assert.notEqual((await state()).selectedHero,hero);
 await tap('#pause-menu');before=(await state()).player;await page.keyboard.press('w');await step(1000);assert.deepEqual((await state()).player,before);assert.equal((await state()).movement.controls.paused,true);
 await page.locator('.replay-menu summary').tap();assert.equal(await page.locator('.replay-menu nav button').count(),1);assert.equal(await page.locator('.teacher-controls').isVisible(),false);await shot('pause');
 // Convenience gate only reveals after deliberate title taps and correct code.
 for(let i=0;i<5;i++)await page.locator('.menu-heading h2').tap();
 await page.locator('.teacher-unlock input').fill('0000');await page.locator('.teacher-unlock button').tap();assert.equal(await page.locator('.teacher-controls').isVisible(),false);
 await page.locator('.teacher-unlock input').fill('1001');await page.locator('.teacher-unlock button').tap();assert.equal(await page.locator('#reset-all-testing').isVisible(),true);
 page.once('dialog',dialog=>dialog.dismiss());await page.locator('#reset-all-testing').tap();assert.equal((await state()).movement.controls.progress.unlocked,1);
 await page.locator('[data-menu="lock"]').tap();assert.equal(await page.locator('#reset-all-testing').isVisible(),false);
 await page.locator('#control-mode').selectOption('touch');await page.locator('[data-menu="resume"]').first().tap();await step(0);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);assert.equal(await page.locator('.rotation-prompt').isVisible(),true);before=(await state()).player;await step(2000);assert.deepEqual((await state()).player,before);
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(100);await step(0);assert.equal(await page.locator('.rotation-prompt').isVisible(),false);
 await tap('#pause-menu');page.once('dialog',d=>d.accept());await page.locator('#reset').tap();await step(0);assert.equal((await state()).solved,false);
 await tap('#pause-menu');await page.locator('#control-mode').selectOption('keyboard');await page.locator('[data-menu="resume"]').first().tap();await step(0);assert.equal(await page.locator('.touch-controls').isVisible(),false);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);assert.equal(await page.locator('.rotation-prompt').isVisible(),false,'keyboard override never demands rotation');
 assert.deepEqual(errors,[]);await writeFile('output/mobile/input-state.json',JSON.stringify(await state(),null,2));
 console.log('PASS Chromium touch: rotation, responsive targets, analog + multitouch jump/camera, cancellation, interrupts, hero, menu, reset, teacher gate and override');
}catch(error){console.log(await page.evaluate(()=>typeof window.render_game_to_text==='function'?JSON.parse(window.render_game_to_text()).movement.controls:document.body.innerText));await shot('failed');throw error;}finally{await browser.close();}
try{
 const b=await webkit.launch({headless:true});const p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const e=[];p.on('pageerror',err=>e.push(String(err)));
 await p.goto(url);await p.waitForFunction(()=>!!window.advanceTime);await p.locator('.welcome-play').tap();await p.waitForTimeout(300);assert.equal(await p.locator('.touch-controls').isVisible(),true);await p.locator('[data-action="switchHero"]').tap();await p.screenshot({path:'output/mobile/webkit.png'});assert.deepEqual(e,[]);await b.close();console.log('PASS Playwright WebKit touch smoke (not physical iPhone Safari)');
}catch(error){if(String(error).includes('Executable doesn\'t exist'))console.log('LIMITATION WebKit browser runtime unavailable');else throw error;}
