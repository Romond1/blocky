import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const room of [1,10])for(const mode of ['touch','keyboard']){
  const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:3,hasTouch:mode==='touch',isMobile:mode==='touch'});
  await page.goto(`http://127.0.0.1:5188/?room=${room}`);await page.waitForFunction(()=>!!window.render_game_to_text);
  await page.locator('.welcome-play')[mode==='touch'?'tap':'click']();
  const frames=await page.evaluate(()=>new Promise(resolve=>{const values=[];let previous=performance.now(),warmup=45;function frame(now){if(warmup-->0)previous=now;else{values.push(now-previous);previous=now;}if(values.length===120)resolve(values);else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
  const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));frames.sort((a,b)=>a-b);
  results.push({room,mode,viewport:'844x390',deviceScaleFactor:3,medianFrameMs:Number(frames[60].toFixed(2)),p95FrameMs:Number(frames[114].toFixed(2)),...state.renderStats,pixelRatio:state.movement.controls.pixelRatio,shadows:state.movement.controls.shadows});
  await page.close();
 }
 await writeFile('output/mobile/performance.json',JSON.stringify({note:'Local headless Chromium, no CPU/network throttling. These are not physical-phone frame rates.',results},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
