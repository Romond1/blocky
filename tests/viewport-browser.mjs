import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 for(const [width,height] of [[1920,1080],[1366,768],[1280,720],[1024,600],[800,600],[640,360],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5188/');await page.waitForFunction(()=>window.render_game_to_text);
  await page.waitForFunction(()=>document.querySelector('.welcome-inner').getBoundingClientRect().bottom<=innerHeight+1);
  const fit=await page.evaluate(()=>{
   const selectors=['.welcome-inner','.welcome-heroes','.welcome-controls','.welcome-play','.welcome-tab','.welcome-video','.welcome-video-footer'];
   return selectors.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
  });
  for(const r of fit){assert.ok(r.left>=-1&&r.right<=width+1&&r.top>=-1&&r.bottom<=height+1,`${width}x${height}: ${JSON.stringify(r)}`);}
  assert.equal(await page.locator('.welcome').evaluate(v=>v.scrollHeight<=v.clientHeight+1&&v.scrollWidth<=v.clientWidth+1),true);
  await page.screenshot({path:`output/welcome/fit-${width}x${height}.png`});
  await page.keyboard.press('Enter');
  const canvas=await page.locator('#app > canvas').evaluate(v=>{const r=v.getBoundingClientRect();return {width:r.width,height:r.height};});
  assert.ok(Math.abs(canvas.width-width)<1&&Math.abs(canvas.height-height)<1);
  const hud=await page.locator('.hud').evaluate(v=>{const r=v.getBoundingClientRect();return {right:r.right,bottom:r.bottom};});assert.ok(hud.right<=width+1&&hud.bottom<=height+1);
 }
 await page.setViewportSize({width:1280,height:800});await page.goto('http://127.0.0.1:5188/');await page.waitForFunction(()=>window.render_game_to_text);
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1.5});
 await page.waitForFunction(()=>{const r=document.querySelector('.welcome-inner').getBoundingClientRect();return r.right<=visualViewport.width+1&&r.bottom<=visualViewport.height+1;});
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>Math.abs(document.querySelector('canvas').getBoundingClientRect().width-visualViewport.width)<1);
 assert.deepEqual(errors,[]);console.log('PASS: eight screen sizes, no splash scrolling, all controls/video on screen, canvas/HUD fit and 150% visual viewport zoom.');
}finally{await browser.close();}

