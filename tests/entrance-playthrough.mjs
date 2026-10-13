import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/entrance',{recursive:true});
try{
 for(const locale of ['en-US','ja-JP','fr-FR']){
  const context=await browser.newContext({locale,viewport:{width:1280,height:800}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5188/?room=3&hero=yuki');await page.waitForFunction(()=>window.advanceTime);
  const tick=ms=>page.evaluate(ms=>window.advanceTime(ms),ms),state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  await tick(0);let s=await state();assert.equal(s.player.z,23);assert.equal(s.entrance.jumpVisible,false);assert.equal(s.entrance.language,locale.slice(0,2));
  await page.screenshot({path:`output/entrance/${locale}-info.png`});
  await page.keyboard.down('w');await tick(1400);await page.keyboard.up('w');s=await state();assert.ok(s.entrance.jumpVisible);assert.equal(s.help.available,false);
  await page.screenshot({path:`output/entrance/${locale}-jump.png`});
  for(const hero of ['yuki','mia']){
   if(hero==='mia'){await page.keyboard.press('Tab');await tick(650);await page.keyboard.down('w');await tick(700);await page.keyboard.up('w');}
   await page.keyboard.down('w');await tick(250);const before=await state();await page.keyboard.down('Space');await tick(150);await page.keyboard.up('Space');
   const mid=await state();assert.ok(mid.motion[hero].y>0);assert.ok(mid.player.z<before.player.z-.3);
   await page.keyboard.down('d');await tick(120);await page.keyboard.up('d');const steering=await state();assert.ok(steering.player.x>mid.player.x+.25);assert.ok(steering.player.z<mid.player.z-.25);
   await tick(400);await page.keyboard.up('w');await tick(250);assert.ok((await state()).motion[hero].crossed);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('English/Japanese/French phased prompts and live W + Space + sideways steering for both heroes passed.');
}finally{await browser.close();}
