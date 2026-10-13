import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const url=(process.env.GAME_URL??'http://127.0.0.1:5189/blocky').replace(/\/$/,'');
const rooms=['hero','memory','power','cooperation','fruit','sorting','action','ability','heart','dragon'];
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/teacher-rooms',{recursive:true});
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:800},isMobile:touch,hasTouch:touch});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const press=selector=>touch?page.locator(selector).tap():page.locator(selector).click();
  const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  const step=()=>page.evaluate(()=>window.advanceTime(0));
  const saved={version:1,unlocked:3,completed:2};
  await page.goto(`${url}/`);
  await page.evaluate(saved=>localStorage.setItem('be-a-hero:adventure',JSON.stringify(saved)),saved);
  await page.goto(`${url}/?room=10`);await page.waitForFunction(()=>!!window.advanceTime);await step();
  assert.equal((await state()).room,'power','locked URL falls back to saved progress');
  await press('.welcome-play');await press('#pause-menu');
  assert.equal(await page.locator('.replay-menu nav button').count(),3);
  assert.equal(await page.locator('.teacher-controls').isVisible(),false);
  for(let i=0;i<5;i++)await press('.menu-heading h2');
  await page.locator('.teacher-unlock input').fill('1001');await press('.teacher-unlock button');
  assert.equal(await page.locator('#teacher-room-select option').count(),10,'teacher can choose every room');
  assert.equal(await page.locator('#teacher-room-select').inputValue(),'3');
  // Every room uses the real entry lifecycle without granting public unlocks.
  for(const n of touch?[10,8]:[10,9,8,7,6,5,4,3,2,1]){
   await page.locator('#teacher-room-select').selectOption(String(n));
   if(n===10){await page.locator('#teacher-room-go').scrollIntoViewIfNeeded();await page.screenshot({path:`output/teacher-rooms/${touch?'touch':'desktop'}-selector.png`});}
   await press('#teacher-room-go');await step();
   assert.equal((await state()).room,rooms[n-1]);
   assert.deepEqual((await state()).movement.controls.progress,saved,'teacher visit preserves progress');
   if(n===10)await page.screenshot({path:`output/teacher-rooms/${touch?'touch':'desktop'}-room10.png`});
   await press('#pause-menu');
   assert.equal(await page.locator('#teacher-room-select').inputValue(),String(n));
   assert.equal(await page.locator('.replay-menu nav button').count(),3);
  }
  await press('[data-menu="lock"]');await step();
  assert.equal((await state()).room,'power','leaving teacher inspection returns to an unlocked room');
  assert.equal(await page.locator('#debug').isVisible(),false);
  await press('#pause-menu');
  assert.equal(await page.locator('.teacher-controls').isVisible(),false);
  // A stale/programmatic click cannot use the hidden teacher control after locking.
  await page.evaluate(()=>{document.querySelector('#teacher-room-select').value='10';document.querySelector('#teacher-room-go').click();});
  assert.equal((await state()).room,'power');
  await press('.replay-menu summary');await page.locator('.replay-menu nav button').first()[touch?'tap':'click']();await step();
  assert.equal((await state()).room,'hero','previous rooms remain replayable');
  assert.deepEqual((await state()).movement.controls.progress,saved);
  await page.goto(`${url}/?room=10`);await page.waitForFunction(()=>!!window.advanceTime);await step();
  assert.equal((await state()).room,'power');await press('.welcome-play');await press('#pause-menu');
  assert.equal(await page.locator('.teacher-controls').isVisible(),false,'teacher gate resets on reload');
  assert.deepEqual(errors,[]);
  await context.close();
  console.log(`PASS ${touch?'touch':'desktop'}: teacher room access; public replay restrictions; save preservation; lock/reload revoke access`);
 }
}finally{await browser.close();}
