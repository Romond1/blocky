import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},locale:'en-US'}),errors=[];
let page=await context.newPage();
page.on('pageerror',e=>errors.push(String(e)));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
await mkdir('output/collectibles',{recursive:true});
try{
 let wallet=0;
 for(let room=1;room<=6;room++){
  // Keep shared localStorage while releasing old WebGL contexts between rooms.
  if(room>1){await page.close();page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));}
  await page.goto(`http://127.0.0.1:5188/?room=${room}&hero=yuki`);await page.waitForFunction(()=>window.advanceTime);await step(0);
  let s=await state();assert.equal(s.economy.heroCoins,wallet);assert.equal(s.economy.totalHeartShards,6);
  assert.equal(s.collectibles.length,[6,7,9,9,9,10][room-1]);assert.equal(s.collectibles.find(c=>c.type==='heartShard').visible,false);
  await page.screenshot({path:`output/collectibles/room-${room}-start.png`});
  await hold('w',350);s=await state();wallet++;assert.equal(s.economy.heroCoins,wallet);assert.equal(s.economy.roomProgress.coinsCollected,1);
  assert.ok(s.events.includes('HERO_COIN_COLLECTED'));assert.match(await page.locator('.room-coins').innerText(),/^ROOM COINS 1/);
  await step(700);assert.equal((await state()).collectibles[0].visible,false);
  const ids=s.economy.collected.map(c=>c.id);await page.keyboard.press('r');await step(0);
  assert.equal((await state()).economy.heroCoins,wallet);assert.deepEqual((await state()).economy.collected.map(c=>c.id),ids);
  await hold('w',350);assert.equal((await state()).economy.heroCoins,wallet);
  await page.reload();await page.waitForFunction(()=>window.advanceTime);await step(0);assert.equal((await state()).economy.heroCoins,wallet);
  await hold('w',350);assert.equal((await state()).economy.heroCoins,wallet);
 }
 assert.equal(await page.locator('.economy-reset').isVisible(),false);
 await page.locator('#debug-toggle').click();await step(0);assert.equal(await page.locator('.economy-reset').isVisible(),true);
 assert.match(await page.locator('#debug').innerText(),/HERO COINS 6/);
 await page.locator('.economy-reset').click();await step(0);assert.equal((await state()).economy.heroCoins,0);assert.equal((await state()).economy.collected.length,0);
 await page.keyboard.press('r');await step(0);await hold('w',350);assert.equal((await state()).economy.heroCoins,1);
 await page.keyboard.press('Tab');await step(600);assert.equal((await state()).economy.heroCoins,1);
 await page.locator('#debug-toggle').click();await page.keyboard.press('r');await step(0);
 await page.setViewportSize({width:960,height:640});await page.evaluate(()=>{for(let i=0;i<45;i++)window.advanceTime(16);});await page.screenshot({path:'output/collectibles/small-window.png'});
 assert.deepEqual(errors,[]);await writeFile('output/collectibles/result.json',JSON.stringify({passed:true,errors,checks:'Six rooms; real keyboard pickups; counts; hidden exit shards; reset/replay/reload duplicate protection; debug economy reset; hero switch; small viewport'},null,2));
 console.log('PASS: collectible browser checks across all six rooms');
}catch(e){await page.screenshot({path:'output/collectibles/failure.png'});console.error(e);process.exitCode=1;}finally{await browser.close();}
