import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800},locale:process.env.GAME_LOCALE??'en-US'}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
const press=async k=>{await page.keyboard.press(k);await step(0);};
await mkdir('output/training',{recursive:true});
const shot=async name=>{await page.waitForTimeout(320);return page.screenshot({path:`output/training/${process.env.GAME_LOCALE??'en-US'}-${name}.png`});};
async function axis(axis,target){const s=await state(),delta=target-s.player[axis];if(Math.abs(delta)<.015)return;
 const key=axis==='x'?delta>0?'d':'a':delta>0?'s':'w';await page.keyboard.down(key);await step(Math.abs(delta)/(3.5*s.abilities[s.selectedHero].speedMultiplier)*1000);await page.keyboard.up(key);
 if((await state()).room!==s.room)return;
 assert.ok(Math.abs((await state()).player[axis]-target)<.08,`blocked ${axis} -> ${target}: ${JSON.stringify((await state()).player)}`);
}
async function go(x,z){
 const s=await state(),start=s.player,end={x,z};
 const safe=p=>Math.abs(p.x)<s.bounds.halfWidth-.39&&p.z<s.bounds.halfDepth-.39&&p.z>(s.solved?-s.bounds.halfDepth-3.6:-s.bounds.halfDepth+.39)&&(p.z>=-s.bounds.halfDepth+.38||Math.abs(p.x-(s.bounds.exitCenterX??0))<s.bounds.exitHalfWidth-.4)&&s.blocks.every(b=>b.state==='carried'||Math.abs(b.x-p.x)>b.size/2+.39||Math.abs(b.z-p.z)>b.size/2+.39)&&s.obstacles.every(o=>Math.abs(o.x-p.x)>o.width/2+.39||Math.abs(o.z-p.z)>o.depth/2+.39)&&s.sockets.every(q=>Math.abs(q.x-p.x)>(q.halfSize??.7)+.39||Math.abs(q.z-p.z)>(q.halfSize??.7)+.39);
 const segment=(a,b)=>{const d=Math.hypot(a.x-b.x,a.z-b.z);for(let i=1;i<=Math.ceil(d/.08);i++){const t=i/Math.ceil(d/.08);if(!safe({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t}))return false;}return true;};
 // Orthogonal routes preserve the game's normalized speed and make collision assertions precise.
 const anchors=[];for(let x=-Math.floor(s.bounds.halfWidth);x<=Math.floor(s.bounds.halfWidth);x+=.5)for(let z=-Math.floor(s.bounds.halfDepth)-3;z<=Math.floor(s.bounds.halfDepth);z+=.5)anchors.push({x,z});
 const near=anchors.filter(p=>safe(p)&&segment(start,{x:p.x,z:start.z})&&segment({x:p.x,z:start.z},p)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];
 assert.ok(near,'reachable route anchor');const key=p=>`${p.x},${p.z}`,queue=[near],parents=new Map([[key(near),null]]);let found;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(segment(p,{x:end.x,z:p.z})&&segment({x:end.x,z:p.z},end)){found=p;break;}
 for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:p.x+dx,z:p.z+dz};if(!parents.has(key(n))&&safe(n)&&segment(p,n)){parents.set(key(n),p);queue.push(n);}}}
 assert.ok(found,'route exists');const route=[];while(found){route.unshift(found);found=parents.get(key(found));}route.push(end);
 for(const p of route){if((await state()).room!==s.room)return;await axis('x',p.x);if((await state()).room!==s.room)return;await axis('z',p.z);}
}
async function switchTo(hero){if((await state()).selectedHero!==hero)await press('Tab');await step(500);}
async function pick(id){const b=(await state()).blocks[id];await go(b.x-(id===3?1.5:0),b.z+(id===3?0:1.1));await press('e');}
async function plate(id){const p=(await state()).sockets[id];await go(p.x,p.z+1.6);await press('e');}
try{
 await page.goto('http://127.0.0.1:5188/?room=2');await page.waitForFunction(()=>!!window.advanceTime);await step(0);
 const panel=page.locator('.training-prompt'),banner=page.locator('.interaction-banner');
 let b=(await state()).blocks[3];await go(b.x-1.5,b.z);assert.equal(await banner.isVisible(),false);await press('e');assert.equal((await state()).heavyAction.kind,'HEAVY_STRUGGLE');assert.equal(await banner.isVisible(),false);await shot('mia-no-heavy-pickup');
 await press('Tab');assert.equal(await panel.isVisible(),false);await step(500);assert.equal(await panel.isVisible(),true);assert.match(await panel.innerText(),/YOUR MISSION/);await shot('new-mission-card');await step(2800);await page.waitForTimeout(800);assert.ok((await state()).training.docked);
 b=(await state()).blocks[3];await go(b.x-1.5,b.z);assert.equal(await banner.getAttribute('data-kind'),'pickup');assert.equal(await banner.isVisible(),true);await shot('yuki-heavy-pickup');await press('e');await step(500);assert.equal((await state()).carried,'HEAVY');assert.equal(await banner.getAttribute('data-target'),'plate-1');
 const p=(await state()).sockets[1];await go(p.x,p.z+3.1);await shot('forgiving-heavy-drop');await press('e');assert.equal((await state()).placed[1],'HEAVY');assert.equal((await state()).training.heavyActivated,true);
 await switchTo('mia');await go(p.x,p.z+1.6);assert.equal(await banner.isVisible(),false);await shot('mia-sword-tucked');assert.deepEqual(errors,[]);console.log('PASS: distinct TAB mission transition, Mia restrictions, Yuki HEAVY cues and forgiving placement.');
}finally{await browser.close();}
