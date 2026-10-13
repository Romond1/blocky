import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const url=process.env.GAME_URL??'http://127.0.0.1:5189/blocky';
const teacherInspection=process.env.TEACHER_INSPECTION==='1',expectedUnlocked=teacherInspection?1:2;
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
let acceptConfirmation=true,confirmations=0;
page.on('dialog',d=>{confirmations++;void (acceptConfirmation?d.accept():d.dismiss());});
const cdp=await context.newCDPSession(page),state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({...p,radiusX:4,radiusY:4,force:1}))});
const tap=async action=>{await page.locator(`[data-action="${action}"]`).tap();await step(0);};
async function axis(axis,target){
 const box=await page.locator('.joystick').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
 const original=(await state()).room;
 for(let i=0;i<90;i++){
  const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.06||s.room!==original)return;
  await touch('touchStart',[{id:1,x,y}]);
  await touch('touchMove',[{id:1,x:x+(axis==='x'?Math.sign(d)*50:0),y:y+(axis==='z'?Math.sign(d)*50:0)}]);
  const speed=s.selectedHero==='mia'?7:3.5;await step(Math.min(200,Math.abs(d)/speed*1000+20));await touch('touchEnd',[]);await step(0);
  const n=await state();if(n.room!==original)return;
  assert.ok(Math.abs(n.player[axis]-s.player[axis])>.001,`joystick blocked ${axis}→${target} at ${JSON.stringify(n.player)}`);
 }throw Error(`joystick target timeout ${axis} ${target}`);
}
async function go(x,z){
 const s=await state(),start=s.player,end={x,z};
 const safe=p=>Math.abs(p.x)<s.bounds.halfWidth-.39&&p.z<s.bounds.halfDepth-.39&&p.z>(s.solved?-s.bounds.halfDepth-3.6:-s.bounds.halfDepth+.39)&&(p.z>=-s.bounds.halfDepth+.38||Math.abs(p.x-(s.bounds.exitCenterX??0))<s.bounds.exitHalfWidth-.4)&&s.blocks.every(b=>b.state==='carried'||Math.abs(b.x-p.x)>b.size/2+.39||Math.abs(b.z-p.z)>b.size/2+.39)&&s.obstacles.every(o=>Math.abs(o.x-p.x)>o.width/2+.39||Math.abs(o.z-p.z)>o.depth/2+.39)&&s.sockets.every(q=>Math.abs(q.x-p.x)>(q.halfSize??.7)+.39||Math.abs(q.z-p.z)>(q.halfSize??.7)+.39);
 const segment=(a,b)=>{const count=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.08);for(let i=1;i<=count;i++){if(!safe({x:a.x+(b.x-a.x)*i/count,z:a.z+(b.z-a.z)*i/count}))return false;}return true;};
 const anchors=[];for(let px=-Math.floor(s.bounds.halfWidth);px<=Math.floor(s.bounds.halfWidth);px+=.5)for(let pz=-Math.floor(s.bounds.halfDepth)-3;pz<=Math.floor(s.bounds.halfDepth);pz+=.5)anchors.push({x:px,z:pz});
 const near=anchors.filter(p=>safe(p)&&segment(start,{x:p.x,z:start.z})&&segment({x:p.x,z:start.z},p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];assert.ok(near);
 const key=p=>`${p.x},${p.z}`,queue=[near],parents=new Map([[key(near),null]]);let found;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(segment(p,{x:end.x,z:p.z})&&segment({x:end.x,z:p.z},end)){found=p;break;}for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:p.x+dx,z:p.z+dz};if(!parents.has(key(n))&&safe(n)&&segment(p,n)){parents.set(key(n),p);queue.push(n);}}}
 assert.ok(found,'physical route exists');const route=[];while(found){route.unshift(found);found=parents.get(key(found));}route.push(end);
 for(const p of route){if((await state()).room!==s.room)return;await axis('x',p.x);if((await state()).room!==s.room)return;await axis('z',p.z);}
}
try{
 await mkdir('output/mobile',{recursive:true});
 await page.goto(`${url}/?room=10`);await page.waitForFunction(()=>!!window.advanceTime);await step(0);
 assert.equal((await state()).room,'hero','production query does not unlock Room10');
 await page.locator('.welcome-play').tap();await step(0);
 await page.locator('#pause-menu').tap();await page.locator('#reset').tap();await step(0);assert.equal(confirmations,0,'fresh-room reset is immediate');
 if(teacherInspection){
  await page.locator('#pause-menu').tap();for(let i=0;i<5;i++)await page.locator('.menu-heading h2').tap();
  await page.locator('.teacher-unlock input').fill('1001');await page.locator('.teacher-unlock button').tap();
  await page.locator('#teacher-room-select').selectOption('1');await page.locator('#teacher-room-go').tap();await step(0);
 }
 // Complete with actual joystick and ACTION input. No position/puzzle fixtures.
 let s=await state(),block=s.blocks.find(b=>b.text==='E');await go(block.x,block.z+1.1);await tap('interact');assert.equal((await state()).carried,'E');
 const firstHero=(await state()).selectedHero;await tap('switchHero');await step(500);assert.notEqual((await state()).selectedHero,firstHero);
 assert.equal((await state()).blocks.find(b=>b.text==='E').carrier,firstHero,'switch keeps carrier');await tap('switchHero');await step(500);
 const socket=(await state()).sockets[0];await go(socket.x,socket.z+1.6);await tap('interact');assert.equal((await state()).solved,true);await step(5200);
 await page.screenshot({path:'output/mobile/touch-puzzle-solved.png'});
 acceptConfirmation=false;await page.locator('#pause-menu').tap();await page.locator('#reset').tap();await step(0);assert.equal(confirmations,1);assert.equal((await state()).solved,true,'cancel preserves unfinished puzzle');
 acceptConfirmation=true;await page.locator('.menu-primary [data-menu="resume"]').tap();await step(0);
 const depth=(await state()).bounds.halfDepth;await go(2,-4);await go(2,-8.5);await go(0,-depth+1.1);await go(0,-depth-1.9);await step(20000);
 assert.equal((await state()).room,'memory');assert.equal((await state()).movement.controls.progress.unlocked,expectedUnlocked);assert.equal((await state()).economy.heartShards,1);
 const economy=(await state()).economy;
 await page.locator('#pause-menu').tap();await page.locator('.replay-menu summary').tap();assert.equal(await page.locator('.replay-menu nav button').count(),expectedUnlocked);
 await page.locator('.replay-menu nav button').first().tap();await step(0);assert.equal((await state()).room,'hero');assert.equal((await state()).movement.controls.progress.unlocked,expectedUnlocked);assert.equal((await state()).economy.heroCoins,economy.heroCoins);
 await page.goto(`${url}/?room=10`);await page.waitForFunction(()=>!!window.advanceTime);assert.equal((await state()).room,teacherInspection?'hero':'memory','locked URL falls back to highest reached room');
 await page.locator('.welcome-play').tap();await page.locator('#pause-menu').tap();await page.locator('#reset').tap();await step(0);
 assert.equal((await state()).movement.controls.progress.unlocked,expectedUnlocked);assert.equal((await state()).economy.heartShards,1);
 await page.screenshot({path:'output/mobile/production-room2.png'});assert.deepEqual(errors,[]);
 await writeFile('output/mobile/touch-puzzle-result.json',JSON.stringify({passed:true,errors,progress:(await state()).movement.controls.progress,economy:(await state()).economy},null,2));
 await page.locator('#pause-menu').tap();for(let i=0;i<5;i++)await page.locator('.menu-heading h2').tap();
 await page.locator('.teacher-unlock input').fill('1001');await page.locator('.teacher-unlock button').tap();await page.locator('#reset-all-testing').tap();await step(0);
 assert.equal((await state()).room,'hero');assert.equal((await state()).movement.controls.progress.unlocked,1);assert.equal((await state()).economy.heroCoins,0);assert.equal((await state()).economy.heartShards,0);
 await page.reload();await page.waitForFunction(()=>!!window.advanceTime);assert.equal((await state()).movement.controls.progress.unlocked,1);assert.equal(await page.locator('.teacher-controls').isVisible(),false);
 console.log(`PASS production: fresh ?room=10 rejected; joystick + ACTION solve Room1; carried block survives HERO; ${teacherInspection?'teacher completion does not unlock Room2':'natural Room2 unlock'}; replay, reload and reset preserve progress/collectibles; confirmed teacher reset clears only local save`);
}finally{await browser.close();}
