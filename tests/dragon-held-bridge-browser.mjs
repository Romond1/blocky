import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/dragon-held-bridge',{recursive:true});
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:800},isMobile:touch,hasTouch:touch});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
  const press=selector=>touch?page.locator(selector).tap():page.locator(selector).click();
  await page.goto('http://127.0.0.1:5188/?room=10');await page.waitForFunction(()=>!!window.advanceTime);
  await step(0);await press('.welcome-play');
  // Stage the already-tested gate; cross the entire second obstacle with real inputs.
  await page.evaluate(async()=>{
   const {game:g,team:t}=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).inspectDragonForTests();
   Object.assign(t.actors.mia,{x:25,z:17});Object.assign(t.actors.yuki,{x:27,z:17});
   Object.assign(g.finale.heart,{x:26,z:17,y:0,state:'floor',carrier:undefined});g.refreshDevices(.1);
   Object.assign(t.actors.mia,{x:28,z:13});Object.assign(t.actors.yuki,{x:29,z:12});
   Object.assign(g.finale.heart,{state:'carried',carrier:'yuki'});g.refreshDevices();
  });
  await step(15000);assert.equal((await state()).finale.dragon.slabsActive,true);
  const mode=touch?'touch':'desktop';
  await page.screenshot({path:`output/dragon-held-bridge/${mode}-held.png`});
  if(touch)await press('[data-action="switchHero"]');else await page.keyboard.press('Tab');
  await step(15000);assert.equal((await state()).selectedHero,'yuki');assert.equal((await state()).finale.dragon.slabsActive,true);
  const cdp=touch?await context.newCDPSession(page):null;
  async function moveStart(){
   if(!touch){await page.keyboard.down('w');return;}
   const b=await page.locator('.joystick').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x,y:y-50}]});
  }
  async function moveEnd(){if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.keyboard.up('w');}
  const targets=[10,6.3,2.6,-1.1,-4.8,-8.5,-9.3];
  for(const [i,target] of targets.entries()){
   if(i>0&&i<6){if(touch)await press('[data-action="jump"]');else await page.keyboard.press('Space');}
   await moveStart();
   for(let frame=0;frame<100;frame++){
    const s=await state(),distance=s.player.z-target;if(distance<=.08)break;
    await step(distance>.55?80:1000/60);
   }
   await moveEnd();await step(500);
   const s=await state();assert.ok(Math.abs(s.player.z-target)<.2,`land at ${target}: ${JSON.stringify(s.player)}`);
   assert.equal(s.finale.dragon.slabsActive,true);assert.equal(s.finale.recoveries,0);
   if(i===3)await page.screenshot({path:`output/dragon-held-bridge/${mode}-crossing.png`});
  }
  await page.screenshot({path:`output/dragon-held-bridge/${mode}-crossed.png`});
  const crossed=await state();assert.equal(crossed.finale.dragon.locks[1],false);
  // Switching back and stepping off the pad lowers it; returning raises it again.
  if(touch)await press('[data-action="switchHero"]');else await page.keyboard.press('Tab');
  await step(600);assert.equal((await state()).selectedHero,'mia');
  await moveStart();await step(220);await moveEnd();await step(0);
  assert.equal((await state()).finale.dragon.slabsActive,false);
  assert.deepEqual(errors,[]);
  await writeFile(`output/dragon-held-bridge/${mode}-result.json`,JSON.stringify({passed:true,errors,crossed},null,2));
  await context.close();console.log(`PASS ${mode}: pad held 30 seconds; HERO/Tab switch; Yuki carries Heart over every slab with real jumps; pad release lowers bridge`);
 }
}finally{await browser.close();}
