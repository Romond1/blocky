import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/cooperation',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/cooperation/${name}.png`});await writeFile(`output/cooperation/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify({player:n.player,motion:n.motion[n.selectedHero]})}`);}
const swap=async()=>{await press('Tab');await step(600);};
async function select(hero){if((await state()).selectedHero!==hero)await swap();}
// Plan paths from observed state, then execute each segment using actual keyboard input.
async function go(x,z){
 const s=await state(),end={x,z},start=s.player;
 const safe=p=>Math.abs(p.x)<10.61&&p.z<25.61&&p.z>-29.6&&(p.z>=-25.62||s.doorLift>2.8&&Math.abs(p.x)<1.4)&&
  (Math.abs(p.z-15)>=.79||s.cooperation.gateLift>=2.5)&&
  (p.z<=-9||p.z>=3||s.cooperation.bridgeLocked&&Math.abs(p.x)<=1.8)&&
  s.blocks.every(b=>b.state==='carried'||Math.abs(b.x-p.x)>b.size/2+.39||Math.abs(b.z-p.z)>b.size/2+.39)&&
  s.obstacles.every(o=>Math.abs(o.x-p.x)>o.width/2+.39||Math.abs(o.z-p.z)>o.depth/2+.39)&&
  s.sockets.every(q=>q.acceptedActivator==='HERO'||Math.abs(q.x-p.x)>(q.halfSize??1.1)+.39||Math.abs(q.z-p.z)>(q.halfSize??1.1)+.39);
 const segment=(a,b)=>{const count=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1));for(let i=1;i<=count;i++)if(!safe({x:a.x+(b.x-a.x)*i/count,z:a.z+(b.z-a.z)*i/count}))return false;return true;};
 const key=p=>`${p.x},${p.z}`,anchors=[];
 for(let ax=Math.floor(start.x*2)/2-1;ax<=Math.ceil(start.x*2)/2+1;ax+=.5)for(let az=Math.floor(start.z*2)/2-1;az<=Math.ceil(start.z*2)/2+1;az+=.5)anchors.push({x:ax,z:az});
 const origin=anchors.filter(p=>safe(p)&&segment(start,{x:p.x,z:start.z})&&segment({x:p.x,z:start.z},p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];assert.ok(origin,'route origin');
 const queue=[origin],parents=new Map([[key(origin),null]]);let found;
 for(let i=0;i<queue.length&&i<11000;i++){
  const p=queue[i];if(segment(p,{x:end.x,z:p.z})&&segment({x:end.x,z:p.z},end)){found=p;break;}
  for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:p.x+dx,z:p.z+dz};if(!parents.has(key(n))&&safe(n)&&segment(p,n)){parents.set(key(n),p);queue.push(n);}}
 }
 assert.ok(found,`no route to ${x},${z}`);const route=[];while(found){route.unshift(found);found=parents.get(key(found));}route.push(end);
 for(const p of route){await move('x',p.x);await move('z',p.z);}
}
async function jumpEmptyObjectPlate(name){
 await go(-5,7.7);await press('Space');await hold('w',200);await step(900);
 const s=await state();assert.equal(s.motion[s.selectedHero].y,.2825);assert.equal(s.cooperation.heavyActive,false);await shot(name);
 await hold('s',700);await step(300);assert.equal((await state()).motion[s.selectedHero].y,0);
}
try{
 await page.goto('http://127.0.0.1:5188/?room=4&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);if(await page.locator('.welcome-play').isVisible())await page.locator('.welcome-play').click();await step(0);assert.equal((await state()).room,'cooperation');await shot('01-entrance');
 await go(-3,21);await step(700);assert.ok((await state()).cooperation.gateLift>2.8);await swap();const held={...(await state()).heroes.yuki};
 await go(0,13);await go(3,11);assert.deepEqual((await state()).heroes.yuki,held);assert.equal((await state()).companion.state,'HOLD_POSITION');await shot('02-opposite-plate');
 await swap();await go(0,13);assert.equal((await state()).stageSolved[0],true);await shot('03-cooperation-complete');await jumpEmptyObjectPlate('03b-yuki-empty-object-plate');
 await go(-7,9.5);await press('e');await step(550);assert.equal((await state()).carried,'HEAVY');await go(-5,8.2);await press('e');assert.equal((await state()).cooperation.heavyActive,true);await shot('04-heavy-powered');
 // Yuki can attempt the timed path, fall safely, then use the lit stairs to return.
 await go(0,3.5);let s=await state();await step((5.5-s.bridge.time%5.5+.82)%5.5*1000);await hold('w',3600);await step(900);assert.equal((await state()).motion.yuki.y,-3);await shot('05-safe-fall');
 await move('x',7);await move('z',5.5);await shot('06-stair-opening');await move('z',9);assert.equal((await state()).motion.yuki.y,0);await shot('06-recovery');
 await select('mia');await go(0,3.5);s=await state();await step((5.5-s.bridge.time%5.5+.82)%5.5*1000);await hold('w',1950);await step(100);assert.ok((await state()).player.z<-9);assert.equal((await state()).motion.mia.y,0);await go(0,-12);assert.equal((await state()).cooperation.bridgeLocked,true);await shot('07-stable-crossing');
 await select('yuki');await go(0,-13);await step(100);assert.equal((await state()).stageSolved[1],true);await shot('08-reunited');
 // E-place RED in the work area, then retrieve GREEN and stack it with forgiving aim.
 await go(-3,-17.5);await press('e');assert.equal((await state()).carried,'RED');await go(0,-19.5);await move('z',-19.6);await press('e');s=await state();const red=s.blocks.find(b=>b.text==='RED');assert.equal(red.state,'floor');
 await go(-3,-20.5);await press('e');assert.equal((await state()).carried,'GREEN');await go(red.x+.2,red.z+3.2);await move('z',red.z+2.15);s=await state();assert.ok((red.x-s.player.x)*Math.sin(s.facing)+(red.z-s.player.z)*Math.cos(s.facing)>0,'support cube remains in front during the smooth turn');await press('e');await step(300);s=await state();assert.equal(s.solved,true);assert.equal(s.blocks.find(b=>b.text==='GREEN').support,red.id);await shot('09-green-on-red');
 await step(4500);await go(0,-28);await step(18000);assert.equal((await state()).room,'fruit');await shot('10-team-exit');await page.goto('http://127.0.0.1:5188/?room=4&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);if(await page.locator('.welcome-play').isVisible())await page.locator('.welcome-play').click();await step(0);
 await press('r');s=await state();assert.deepEqual(s.stageSolved,[false,false,false]);assert.equal(s.cooperation.gateLift,0);assert.equal(s.bridge.extension,0);assert.equal(s.blocks.some(b=>b.support!==undefined),false);await shot('11-reset');
 // Reverse the first cooperation roles with actual keyboard input, then test Mia's familiar heavy struggle.
 await page.goto('http://127.0.0.1:5188/?room=4&hero=mia');await page.waitForFunction(()=>window.render_game_to_text);if(await page.locator('.welcome-play').isVisible())await page.locator('.welcome-play').click();await step(0);
 await go(-3,21);await step(700);await swap();const heldMia={...(await state()).heroes.mia};
 await go(0,13);await go(3,11);assert.deepEqual((await state()).heroes.mia,heldMia);assert.equal((await state()).companion.state,'HOLD_POSITION');await shot('13-role-reversal');
 await swap();await go(0,13);assert.equal((await state()).stageSolved[0],true);await jumpEmptyObjectPlate('13b-mia-empty-object-plate');
 await go(-7,9.5);await press('e');assert.equal((await state()).heavyAction.kind,'HEAVY_STRUGGLE');await hold('a',100);await step(500);assert.equal((await state()).carried,null);await shot('14-mia-heavy-struggle');await press('r');
 await page.setViewportSize({width:960,height:640});await step(0);await shot('12-small-window');assert.deepEqual(errors,[]);console.log('Room 4 real-keyboard cooperation, timed crossing, recovery, stacking, team exit and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
