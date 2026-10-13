import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {dragonPuzzle} from '../src/finale-layout.ts';
import {DRAGON_CHECKPOINTS,DRAGON_ALTAR,DRAGON_ENDING_Z,DRAGON_PANELS,DRAGON_CONTROLS,DRAGON_BRIDGE,dragonRadii} from '../src/dragon-layout.ts';
import {boxesOverlap} from '../src/block-collision.ts';
import {DRAGON_SLABS} from '../src/dragon-layout.ts';
import {ROOM_COLLECTIBLES} from '../src/collectible-data.ts';
const make=()=>{const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia');return {g,t,f:g.finale!,d:g.finale!.dragon!};};
const tick=(t:HeroTeam,s:number)=>{for(let i=0;i<s*60;i++)t.update(1/60);};
function reunite(s:ReturnType<typeof make>,i:number){const p=DRAGON_CHECKPOINTS[i];Object.assign(s.t.actors.mia,{x:p.x-1,z:p.z});Object.assign(s.t.actors.yuki,{x:p.x+1,z:p.z});for(const h of ['mia','yuki'] as const)Object.assign(s.g.motion[h],{y:p.y,grounded:true});Object.assign(s.f.heart,p,{state:'floor',carrier:undefined});tick(s.t,.1);}
test('sector locks require both heroes and valid Heart in order; falling preserves them',()=>{
 const s=make();reunite(s,2);assert.deepEqual(s.d.locks,[true,true,false,false]);
 reunite(s,3);assert.deepEqual(s.d.locks,[true,true,true,false]);assert.equal(s.f.checkpointIndex,3);
 Object.assign(s.f.heart,{x:0,z:0,y:-8});s.g.motion.mia.y=-4;tick(s.t,.1);
 assert.equal(s.f.recoveries,1);assert.equal(s.f.heart.y,5);assert.deepEqual(s.d.locks,[true,true,true,false]);assert.equal(s.g.motion.mia.y,5);
});
test('one hero or missing Heart cannot complete the cooperation sector',()=>{
 const s=make();Object.assign(s.t.actors.mia,{x:26,z:17});tick(s.t,.1);assert.equal(s.d.locks[0],false);
 Object.assign(s.t.actors.yuki,{x:25,z:18});tick(s.t,.1);assert.equal(s.d.locks[0],false);
 Object.assign(s.f.heart,{x:26,z:17});tick(s.t,.1);assert.equal(s.d.locks[0],true);
});
test('cave elevator reuses rider and Heart displacement, including carried Heart',()=>{
 for(const carrying of [false,true]){const s=make();reunite(s,2);Object.assign(s.t.actors.mia,{x:25,z:-15});s.g.motion.mia.y=4;
  Object.assign(s.t.actors.yuki,{x:30,z:-14});s.g.motion.yuki.y=0;
  Object.assign(s.f.heart,{x:30,z:-15,y:0,state:carrying?'carried':'floor',carrier:carrying?'yuki':undefined});tick(s.t,4.2);
  assert.equal(s.d.lift.y,4);assert.equal(s.g.motion.yuki.y,4);assert.equal(s.f.recoveries,0);if(!carrying)assert.equal(s.f.heart.y,4);
 }
});
test('ferry sends back empty, then transports parked Yuki and loose Heart together',()=>{
 const s=make();reunite(s,1);Object.assign(s.t.actors.mia,{x:34,z:-10});Object.assign(s.t.actors.yuki,{x:33,z:10});Object.assign(s.f.heart,{x:33,z:11,y:0});tick(s.t,4.2);
 assert.equal(s.d.ferryZ,10);Object.assign(s.t.actors.mia,{x:32,z:-11});tick(s.t,.1);Object.assign(s.t.actors.mia,{x:34,z:-10});tick(s.t,4.2);
 assert.equal(s.d.ferryZ,-7);assert.ok(Math.abs(s.f.heart.z+6)<1e-8);assert.ok(Math.abs(s.t.actors.yuki.z+7)<1e-8);assert.equal(s.f.recoveries,0);
});
test('pillar carousel requires braking and remains detached after picking up a word',()=>{
 const s=make(),b=s.g.blocks[2];assert.equal(s.d.available(b,b),false);s.d.carousel.tick(.4,true);assert.equal(s.d.available(b,b),true);
 assert.equal(s.d.carousel.detach(2),true);Object.assign(b,{state:'carried',carrier:'mia'});Object.assign(s.t.actors.mia,{x:-31,z:-20});s.g.motion.mia.y=5;
 const p={x:b.x,z:b.z};s.d.carousel.tick(1,false);assert.deepEqual({x:b.x,z:b.z},p);
});

test('carousel brake is reachable on the open approach and remains held after switching',()=>{
 const s=make(),pad=DRAGON_CONTROLS[5];
 assert.ok(pad.x>-22&&pad.z<-21,'brake belongs in the open approach, away from the apple picture');
 Object.assign(s.t.actors.mia,{x:-21,z:-25});Object.assign(s.g.motion.mia,{y:5,grounded:true});
 for(let i=0;i<300;i++){const dx=pad.x-s.g.player.x,dz=pad.z-s.g.player.z,len=Math.hypot(dx,dz);if(len<.1)break;s.t.update(1/60,dx/len,dz/len);}
 assert.ok(Math.hypot(s.g.player.x-pad.x,s.g.player.z-pad.z)<.15);
 tick(s.t,.5);assert.equal(s.d.carousel.stopped,true);
 s.t.select('yuki');tick(s.t,2);assert.equal(s.d.carousel.stopped,true);assert.equal(s.f.controls[5],true);
 const word=s.g.blocks[2],dx=word.x+26,dz=word.z+19,len=Math.hypot(dx,dz);
 Object.assign(s.t.actors.yuki,{x:word.x+dx/len*1.3,z:word.z+dz/len*1.3});Object.assign(s.g.motion.yuki,{y:5,grounded:true});
 s.g.facing=Math.atan2(word.x-s.g.player.x,word.z-s.g.player.z);s.t.interact();
 assert.equal(s.g.carried?.id,word.id);assert.equal(s.d.attached(word.id),false);assert.equal(s.f.controls[5],true);
});

test('final bridge is a short entrance connection, leaving the middle as lava',()=>{
 const s=make();assert.equal(DRAGON_BRIDGE.length,2);
 assert.equal(s.d.ground({x:0,z:-26},5),-8,'visible gap before completion');
 s.d.locks.fill(true);s.d.responseTime=3;
 assert.equal(s.d.ground({x:0,z:-26},5),5,'completion joins the entrance');
 assert.equal(s.d.ground({x:0,z:0},5),-8,'no walkway through the lake center');
 assert.equal(s.d.ground(DRAGON_ALTAR,5),5,'Heart landing has physical support');
 s.d.restored=true;assert.equal(s.d.ground({x:7,z:DRAGON_ENDING_Z},5),5);
 assert.equal(s.d.ground({x:0,z:-16.5},5),-8,'portal wings cannot create invisible floor behind the Heart');
});
test('three ordered language targets unlock permanent bridge; deliberate altar and neutral choice',()=>{
 const s=make();reunite(s,2);reunite(s,3);
 for(const panel of DRAGON_PANELS)for(const slot of panel.slots){s.d.carousel.attached.delete(slot);Object.assign(s.g.blocks[slot],s.g.layout.sockets[slot],{y:5.29,state:'socket',slot});}
 tick(s.t,3.2);assert.deepEqual(s.d.locks,[true,true,true,true]);assert.equal(s.d.bridgeReady,true);assert.equal(s.d.ground({x:0,z:-26},5),5);
 Object.assign(s.t.actors.mia,{x:0,z:DRAGON_ALTAR.z-1.5});s.g.motion.mia.y=5;Object.assign(s.f.heart,{state:'carried',carrier:'mia'});s.g.interact();
 assert.equal(s.d.restored,true);assert.equal(s.g.escaped,false);assert.equal(s.f.heart.state,'socket');assert.ok(s.g.events.includes('FINAL_HEART_PLACED'));
 Object.assign(s.t.actors.mia,{x:-7,z:DRAGON_ENDING_Z});tick(s.t,1);assert.equal(s.d.choice,null);s.g.interact();assert.equal(s.d.choice,s.d.continueLeft?'continue_adventure':'leave_block_world');
 const selected=s.d.choice;s.g.interact();assert.equal(s.d.choice,selected);assert.deepEqual({x:s.f.heart.x,z:s.f.heart.z,y:s.f.heart.y},DRAGON_ALTAR);
});
test('construction stacks retain support and can be built in multiple positions',()=>{
 const s=make();reunite(s,2);s.g.blocks[12].hidden=true;s.g.blocks[13].hidden=true;const lower=s.g.blocks[10],upper=s.g.blocks[11];Object.assign(lower,{x:31,z:-14,y:0});Object.assign(upper,{x:31,z:-14,y:lower.size,state:'floor',support:10});
 tick(s.t,.2);assert.equal(upper.y,lower.size);assert.equal(upper.support,10);assert.equal(s.f.recoveries,0);
});
test('either hero holds the bridge up indefinitely while the other crosses carrying the Heart',()=>{
 for(const h of ['mia','yuki'] as const){const s=make();reunite(s,1);const holder=h==='mia'?'yuki':'mia';
  s.t.select(holder);Object.assign(s.t.actors[holder],{x:28,z:13});Object.assign(s.t.actors[h],{x:29,z:12});Object.assign(s.f.heart,{state:'carried',carrier:h});
  tick(s.t,12);assert.equal(s.d.ground(DRAGON_SLABS[2],0),0,'held bridge cannot expire');
  assert.equal(s.g.layout.sockets[12].activationMode,'HOLD');
  s.t.select(h);tick(s.t,12);
  assert.equal(s.d.ground(DRAGON_SLABS[2],0),0,'switching keeps the waiting hero on the pad');
  for(const [i,target] of [...DRAGON_SLABS.map(s=>s.z),-9.3].entries()){
   if(i>0&&i<DRAGON_SLABS.length)assert.equal(s.g.jump(),true);
   for(let frame=0;frame<180;frame++){
    const p=s.t.actors[h],m=s.g.motion[h];
    if(p.z<=target+.08&&m.grounded)break;
    s.t.update(1/60,0,p.z>target+.08?-1:0);
   }
   assert.ok(Math.abs(s.t.actors[h].z-target)<.15,`${h} did not land at ${target}: ${JSON.stringify(s.t.actors[h])}`);
   assert.equal(s.g.motion[h].grounded,true);
  }
  assert.deepEqual({x:s.t.actors[holder].x,z:s.t.actors[holder].z},{x:28,z:13});
  assert.equal(s.f.heart.carrier,h);assert.equal(s.f.recoveries,0);assert.equal(s.g.events.includes('FALL_SAFE'),false);
  assert.equal(s.d.locks[1],false,'the holder and Heart still have to reunite beyond the bridge');
 }
});

test('bridge needs grounded hero occupancy, lowers on release and raises again on return',()=>{
 const s=make(),plate=s.g.layout.sockets[12],slab=DRAGON_SLABS[2];
 assert.equal(s.d.ground(slab,0),-8);
 Object.assign(s.t.actors.mia,plate);s.g.refreshDevices();assert.equal(s.d.ground(slab,0),0);
 Object.assign(s.g.motion.mia,{y:1,grounded:false});s.g.refreshDevices();assert.equal(s.d.ground(slab,0),-8,'jumping above pad does not hold it');
 Object.assign(s.g.motion.mia,{y:0,grounded:true});s.g.refreshDevices();assert.equal(s.d.ground(slab,0),0);
 s.t.actors.mia.z=16;s.g.refreshDevices();assert.equal(s.d.ground(slab,0),-8,'walking away releases bridge immediately');
 Object.assign(s.f.heart,plate,{state:'floor'});s.g.refreshDevices();assert.equal(s.d.ground(slab,0),-8,'Heart cannot replace a hero on the pad');
 Object.assign(s.t.actors.yuki,plate);s.g.refreshDevices();assert.equal(s.d.ground(slab,0),0,'either hero can reactivate the bridge');
 s.t.reset();assert.equal(s.g.finale!.dragon!.ground(slab,0),-8,'reset clears bridge activation');
});
test('both heroes can climb broad touching construction steps beside the lift',()=>{
 for(const h of ['mia','yuki'] as const){const s=make();reunite(s,2);s.t.select(h);
  Object.assign(s.g.blocks[10],{x:32,z:-14,y:0});Object.assign(s.g.blocks[13],{x:32,z:-12.3,y:0});
  Object.assign(s.t.actors[h],{x:32,z:-10.7});Object.assign(s.t.actors[s.t.other],{x:35,z:-9});
  Object.assign(s.g.motion[h],{y:0,grounded:true});
  s.g.jump();for(let i=0;i<90;i++)s.t.update(1/60,0,s.g.player.z> -12.2?-1:0);
  assert.equal(s.g.motion[h].y,1.2);
  s.g.jump();for(let i=0;i<90;i++)s.t.update(1/60,0,s.g.player.z> -13.7?-1:0);
  assert.equal(s.g.motion[h].y,1.8);
 }
});
test('a detached language word lost to lava recovers onto the upper gallery',()=>{
 const s=make(),word=s.g.blocks[2];s.d.carousel.attached.delete(2);Object.assign(word,{x:0,z:0,y:-8,state:'floor'});tick(s.t,.1);
 assert.equal(word.y,5);assert.equal(word.state,'floor');assert.ok(Math.hypot(word.x,word.z)>24);assert.equal(s.d.attached(2),false);
});
test('every authored plate and coin rests on reachable sector floor',()=>{const s=make();for(const p of [...s.g.layout.sockets,...ROOM_COLLECTIBLES.dragon.map(c=>c.position)])assert.equal(s.d.ground(p,p.y??0),p.y??0,JSON.stringify(p));});
test('closed cooperation gate blocks the inner jump shortcut and matches solid geometry',()=>{
 const {d}=make();
 for(const radius of [25.5,26.8,28.5,31,34.5,37]){
  const p={x:Math.sin(.64)*radius,z:Math.cos(.64)*radius};
  assert.equal(d.canMove(p,1,false),false,`jump route at radius ${radius}`);
  assert.ok(d.solids().some(b=>boxesOverlap(b,{...p,y:2,halfX:.38,halfY:1,halfZ:.38,yaw:0})),`visible structure must close radius ${radius}`);
 }
 d.gateLift=6;assert.equal(d.canMove({x:Math.sin(.64)*31,z:Math.cos(.64)*31},0,true),true,'raised gate preserves the intended route');
});
test('gallery radii agree across wrapped render and physics angles',()=>{
 for(const a of [-2.7,-2.2,-1.9])assert.deepEqual(dragonRadii(a+Math.PI*2),dragonRadii(a));
});
test('central volcanic pillars are solid even when jumping across lava',()=>{
 const {d}=make();for(const [x,z] of [[-16,-7],[17,5],[-5,17],[8,-17]])assert.equal(d.canMove({x,z},1,false),false);
});
test('falling heroes cannot advance a checkpoint before recovery',()=>{
 const {g,t,f,d}=make();Object.assign(t.actors.mia,{x:26,z:17});Object.assign(t.actors.yuki,{x:25,z:17});Object.assign(f.heart,{x:27,z:17,y:0});
 for(const h of ['mia','yuki'] as const)Object.assign(g.motion[h],{y:-3,grounded:false});
 g.refreshDevices(.01);assert.equal(d.locks[0],false);assert.equal(f.checkpointIndex,0);assert.ok(t.actors.mia.z>30);
});
test('Room 10 Heart pickup stays with its carrier across switching and lava recovery',()=>{
 const {g,t,f}=make();Object.assign(t.actors.mia,{x:0,z:30.4});g.facing=Math.PI;t.interact();assert.equal(f.heart.carrier,'mia');
 t.select('yuki');tick(t,.1);assert.equal(f.heart.carrier,'mia');assert.equal(g.carried,undefined);
 t.select('mia');Object.assign(t.actors.mia,{x:0,z:0});g.motion.mia.y=-3;g.refreshDevices(.01);
 assert.equal(f.heart.state,'floor');assert.equal(f.heart.carrier,undefined);assert.equal(f.recoveries,1);assert.ok(f.heart.z>=28);
});
test('both heroes and the carried Heart can walk the reciprocal gate from the real spawn',()=>{
 const {g,t,f,d}=make();
 const walk=(x:number,z:number)=>{for(let i=0;i<1200;i++){const dx=x-g.player.x,dz=z-g.player.z,len=Math.hypot(dx,dz);if(len<.13)return;t.update(1/60,dx/len,dz/len);}assert.fail(`stuck walking to ${x},${z}: ${JSON.stringify(g.player)}`);};
 walk(7,30);walk(13,28);tick(t,.8);assert.ok(d.gateLift>3);
 t.select('yuki');walk(0,30.4);g.facing=Math.PI;t.interact();assert.equal(f.heart.carrier,'yuki');
 for(const [x,z] of [[8,30],[14,27],[18,25],[22,22]])walk(x,z);
 assert.equal(d.locks[0],false);t.select('mia');
 for(const [x,z] of [[14,27],[18,25],[22,23]])walk(x,z);
 tick(t,.1);assert.equal(d.locks[0],true);assert.equal(f.recoveries,0);assert.equal(f.heart.carrier,'yuki');
});
test('walking the outer ring without either plate cannot raise the gate or earn its lock',()=>{
 const {g,t,f,d}=make();let plateUsed=false;
 const walk=(x:number,z:number)=>{for(let i=0;i<240;i++){const dx=x-g.player.x,dz=z-g.player.z,len=Math.hypot(dx,dz);if(len<.13)return true;t.update(1/60,dx/len,dz/len);plateUsed ||= f.controls[0]||f.controls[1];}return false;};
 const arc=()=>{if(!walk(0,33))return false;for(let i=1;i<=40;i++)if(!walk(Math.sin(i*.02)*33,Math.cos(i*.02)*33))return false;return true;};
 const miaCrossed=arc();t.select('yuki');assert.equal(walk(0,30.4),true);g.facing=Math.PI;t.interact();assert.equal(f.heart.carrier,'yuki');const yukiCrossed=arc();
 assert.equal(plateUsed,false);assert.equal(f.recoveries,0);assert.equal(g.events.includes('FALL_SAFE'),false);
 assert.equal(d.locks[0],false,'proximity to the gate must not solve cooperation');assert.equal(d.gateLift,0);assert.equal(miaCrossed,false);assert.equal(yukiCrossed,false);
});
test('an open gate retains clearance only for travelers physically underneath it',()=>{
 const {g,t,d}=make();Object.assign(t.actors.mia,{x:13,z:28});tick(t,.8);assert.equal(d.gateLift,6);
 Object.assign(t.actors.yuki,{x:Math.sin(.64)*31,z:Math.cos(.64)*31});Object.assign(t.actors.mia,{x:14.5,z:28});
 tick(t,.5);assert.equal(d.gateLift,2.8,'the raised gate must not crush a traveler');
 Object.assign(t.actors.yuki,{x:Math.sin(.64)*15,z:Math.cos(.64)*15});g.refreshDevices(.5);
 assert.equal(d.gateLift,0,'a hero on the same angle outside the gate cannot prop it open');
});
