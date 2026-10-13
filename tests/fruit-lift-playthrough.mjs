import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('output/fruit-lift',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async key=>{await page.keyboard.press(key);await step(20);};
const hold=async(key,ms)=>{await page.keyboard.down(key);await step(ms);await page.keyboard.up(key);};
const shot=async name=>{await page.screenshot({path:`output/fruit-lift/${name}.png`});await writeFile(`output/fruit-lift/${name}.json`,JSON.stringify(await state(),null,2));};
async function move(axis,target){const s=await state(),d=target-s.player[axis];if(Math.abs(d)<.03)return;await hold(axis==='x'?(d>0?'d':'a'):(d>0?'s':'w'),Math.abs(d)/(s.selectedHero==='mia'?7:3.5)*1000);const n=await state();assert.ok(Math.abs(n.player[axis]-target)<.12,`blocked ${axis} ${target}: ${JSON.stringify({player:n.player,motion:n.motion[n.selectedHero]})}`);}
const swap=async()=>{await press('Tab');await step(600);};
async function select(hero){if((await state()).selectedHero!==hero)await swap();}
async function go(x,z){
 const s=await state(),end={x,z},start=s.player;
 const height=s.motion[s.selectedHero].y,up=height>3,lift=s.elevator;
 const inLift=p=>Math.abs(p.x-9)<=2.5&&Math.abs(p.z)<=2.5;
 const safe=p=>!(Math.abs(p.x-9)<2.89&&p.z>2.12&&p.z<2.89)&&Math.abs(p.x)<13.6&&p.z<11.6&&p.z>-15.6&&(p.z>=-11.62||s.doorLift>2.8&&Math.abs(p.x+10)<1.4)&&
  (up?(p.x>=3.4&&p.x<=13.1&&p.z>=-11.2&&p.z<=-2.5||inLift(p)&&lift.state==='UP'):
    !(p.x>=6.12&&p.x<=11.88&&p.z>=-2.88&&p.z<=2.88)||Math.abs(p.z)<2.9&&lift.state==='DOWN'&&Math.abs(p.x-9)<2.12)&&
  !(p.x>=11.5&&p.x<=13.5&&p.z>=-2.5&&p.z<2.5)&&
  s.blocks.every(b=>b.state==='carried'||Math.abs((b.y??0)-height)>1.2||Math.abs(b.x-p.x)>b.size/2+.39||Math.abs(b.z-p.z)>b.size/2+.39)&&
  s.obstacles.every(o=>Math.abs(o.x-p.x)>o.width/2+.39||Math.abs(o.z-p.z)>o.depth/2+.39)&&
  s.sockets.every(q=>Math.abs((q.y??0)-height)>.5||q.acceptedActivator==='HERO'?(Math.abs((q.y??0)-height)>.5||Math.hypot(q.x-end.x,q.z-end.z)<1||Math.hypot(q.x-start.x,q.z-start.z)<1.5||Math.hypot(q.x-p.x,q.z-p.z)>1.5):Math.abs(q.x-p.x)>1.49||Math.abs(q.z-p.z)>1.49);
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

try{
 await page.goto('http://127.0.0.1:5188/?room=5&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);assert.equal((await state()).room,'fruit');await shot('01-entrance');
 await go(9,0);await swap();await go(5,1);await step(4400);assert.equal((await state()).elevator.state,'UP');assert.equal((await state()).motion.yuki.y,5);await shot('02-first-ascent');
 await swap();await go(9,-4);await shot('03-balcony');
 for(const [word,x] of [['BANANA',6],['PEAR',10.5]]){
  if(word==='BANANA'){await go(9,-3.3);await move('x',7.4);}else await go(x,-4.8);await press('e');assert.equal((await state()).carried,word);
  await go(word==='BANANA'?8:10,0);await press('e');assert.equal((await state()).carried,null);const b=(await state()).blocks.find(b=>b.text===word);assert.equal(b.y,5);assert.ok(Math.abs(b.z)<2.1);
 }
 await go(9,-4);await shot('04-loaded-lift');await swap();await go(5,3.2);await go(5,1);await step(4400);assert.equal((await state()).elevator.state,'DOWN');await shot('05-cargo-down');
 for(const [word,index] of [['PEAR',2],['BANANA',1],['APPLE',0]]){
  const b=(await state()).blocks.find(b=>b.text===word);await go(b.x,b.z+(word==='APPLE'?1.5:-1.5));await press('e');assert.equal((await state()).carried,word);
  const q=(await state()).sockets[index];await go(q.x,q.z+1.9);await press('e');assert.equal((await state()).slotFeedback[index],'correct');await shot(`06-match-${word}`);
 }
 await step(5000);assert.equal((await state()).solved,true);assert.equal((await state()).escaped,false);assert.equal((await state()).motion.yuki.y,5);await shot('07-wall-complete');
 // Bring the cabin back up, then physically retrieve the waiting hero.
 await go(5,3.2);await go(5,1);await step(4400);await swap();await go(9,0);await swap();await go(5,3.2);await go(5,1);await step(4400);assert.equal((await state()).motion.yuki.y,0);await shot('08-reunited');await go(5,3.2);
 await swap();await go(9,-4);await go(-10,-14);await step(18000);assert.equal((await state()).room,'sorting');await shot('09-team-exit-room6');
 await page.goto('http://127.0.0.1:5188/?room=5&hero=yuki');await page.waitForFunction(()=>window.render_game_to_text);await step(0);
 await press('r');assert.equal((await state()).elevator.y,0);assert.equal((await state()).solved,false);await shot('10-reset');
 // Reverse roles, switch during motion, and reset with a rider between floors.
 await select('mia');await go(9,0);await swap();await go(5,1);await step(400);await swap();await step(4300);assert.equal((await state()).motion.mia.y,5);await shot('11-reverse-rider');
 await go(9,-4);await go(5,-5);await step(500);await press('r');assert.equal((await state()).elevator.state,'DOWN');assert.equal((await state()).motion.mia.y,0);
 await page.setViewportSize({width:960,height:640});await step(0);await shot('12-small-window');assert.deepEqual(errors,[]);console.log('Room 5 keyboard transport, multiple cargo, fruit matches, reunion, team exit, reverse rider and reset passed.');
}catch(e){await shot('failure');console.error(e);process.exitCode=1;}finally{await browser.close();}
