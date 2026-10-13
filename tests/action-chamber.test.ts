import test from 'node:test';
import assert from 'node:assert/strict';
import {LavaFerry,FERRY,RIVER} from '../src/lava-ferry.ts';
import {Game,canStand} from '../src/game.ts';
import {actionPuzzle} from '../src/puzzles.ts';
import {HeroTeam} from '../src/team.ts';
import {ACTION_JUMPS} from '../src/action-chamber.ts';

function placeWord(g:Game,index:number,slot:number){
 const b=g.blocks[index],target=g.layout.sockets[slot];
 Object.assign(g.player,{x:target.x,z:target.z+1.9});g.facing=Math.PI;
 Object.assign(b,{state:'carried',carrier:g.controlledHero,slot:undefined});g.interact();
 assert.equal(g.placed[slot],b);
}

test('ferry carries grounded passengers and loose cargo both ways, ignoring airborne passengers',()=>{
 const f=new LavaFerry();
 const rider={x:0,z:FERRY.a,y:0,grounded:true},air={x:1,z:FERRY.a,y:1,grounded:false};
 const cargo={x:-1,z:FERRY.a,y:0,state:'floor',size:.95};
 f.command(FERRY.b);f.advance(2,[rider,air],[cargo]);
 assert.equal(f.z,RIVER.center);assert.equal(rider.z,RIVER.center);assert.equal(cargo.z,RIVER.center);assert.equal(air.z,FERRY.a);
 f.command(FERRY.a);f.advance(2,[rider],[cargo]);assert.equal(f.z,FERRY.b);
 f.command(FERRY.a);f.advance(4,[rider],[cargo]);assert.equal(rider.z,FERRY.a);assert.equal(cargo.z,FERRY.a);
});
test('wrong matches preserve correct answers, all three power the gate',()=>{
 const g=new Game(actionPuzzle);new HeroTeam(g);const c=g.actionChamber!;
 for(let i=0;i<3;i++)c.collect(g,i);
 g.update(1.6);
 placeWord(g,0,0);placeWord(g,2,1);
 assert.deepEqual(c.matches,[true,false,false]);assert.equal(g.solved,false);
 g.player.z=g.layout.sockets[1].z+1.7;g.interact();assert.equal(g.carried,g.blocks[2]);
 Object.assign(g.player,{x:0,z:-15});g.facing=0;g.interact();assert.equal(g.carried,undefined);
 placeWord(g,1,1);placeWord(g,2,2);assert.equal(g.solved,true);
 assert.ok(g.events.includes('ACTION_LANGUAGE_COMPLETE'));
});

const setup=(hero:'mia'|'yuki'='mia')=>{const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);return {g,t,c:g.actionChamber!};};
const tick=(t:HeroTeam,seconds:number,dx=0,dz=0)=>{for(let i=0;i<Math.ceil(seconds*60);i++)t.update(1/60,dx,dz);};
for(const hero of ['mia','yuki'] as const)test(`${hero} earns JUMP only at the fifth split step and returns down carrying it`,()=>{
 const {g,t,c}=setup(hero);Object.assign(g.player,{x:1.3,z:22.9});
 assert.equal(ACTION_JUMPS.length,5);
 for(const [i,{z:target,y}] of ACTION_JUMPS.entries()){
  assert.equal(c.earned[1],false);
  assert.equal(g.jump(),true);const travel=(g.player.z-target)/5;tick(t,travel,0,-1);tick(t,1);
  assert.ok(Math.abs(g.motion[hero].y-y)<.02);
  if(i<4)assert.equal(c.earned[1],false);
 }
 assert.equal(c.earned[1],false);assert.equal(c.earned[0],false);
 tick(t,1.6);assert.equal(g.nearest?.text,'JUMP');t.interact();assert.equal(g.carried?.text,'JUMP');
 for(const {z} of [...ACTION_JUMPS].reverse().slice(1)){assert.equal(g.jump(),true);tick(t,(z-g.player.z)/5,0,1);tick(t,1.1);}
 g.jump();tick(t,(24.7-g.player.z)/5,0,1);tick(t,1.2);assert.equal(g.motion[hero].y,0);assert.equal(g.carried?.text,'JUMP');
});
test('two heroes and loose words cross with one toggle plate per dock',()=>{
 const {g,t,c}=setup('yuki');c.collect(g,0);c.collect(g,1);c.collect(g,2);
 tick(t,1.6);
 Object.assign(t.actors.yuki,{x:0,z:FERRY.a});
 g.blocks.slice(0,3).forEach((b,i)=>Object.assign(b,{x:i-1,z:FERRY.a+1,y:0}));
 t.select('mia');Object.assign(g.player,{x:-4,z:FERRY.a});tick(t,4.2);
 assert.ok(Math.abs(t.actors.yuki.z-FERRY.b)<1e-8);assert.equal(c.lift.z,FERRY.b);
 for(const b of g.blocks.slice(0,3))assert.ok(Math.abs(b.z-(FERRY.b+1))<1e-8);
 t.select('yuki');Object.assign(g.player,{x:-4,z:FERRY.b});tick(t,4.2);assert.equal(c.lift.z,FERRY.a);
 Object.assign(g.player,{x:-4,z:FERRY.b-3});tick(t,.1);t.select('mia');Object.assign(g.player,{x:0,z:FERRY.a});tick(t,.1);
 t.select('yuki');Object.assign(g.player,{x:-4,z:FERRY.b});tick(t,4.2);
 assert.ok(Math.abs(t.actors.mia.z-FERRY.b)<1e-8);assert.equal(c.lift.z,FERRY.b);assert.equal(g.escaped,false);
});
test('fall recovery preserves earned words, ferry position and matches',()=>{
 const {g,t,c}=setup();c.collect(g,0);placeWord(g,0,0);Object.assign(g.player,{x:10,z:RIVER.center});tick(t,2);
 assert.equal(c.earned[0],true);assert.equal(c.matches[0],true);assert.equal(c.lift.z,FERRY.a);assert.equal(g.motion.mia.y,0);assert.ok(g.player.z>RIVER.near);
 Object.assign(g.blocks[0],{state:'floor',slot:undefined,x:12,z:RIVER.center,y:0});tick(t,1.5);
 assert.equal(g.blocks[0].z,g.layout.blockPositions[0].z);assert.equal(c.matches[0],false);
});

test('split step columns have normal floor between and below them, with no guardrails',()=>{
 const {g,c}=setup();for(const a of ACTION_JUMPS){assert.equal(c.ground({x:-1.3,z:a.z},10),a.y);assert.equal(c.ground({x:1.3,z:a.z},10),a.y);assert.equal(c.ground({x:0,z:a.z},10),a.y===4.75?4.75:0);}
 assert.equal(c.ground({x:1.3,z:20.25},10),0);
 assert.equal(g.layout.obstacles!.some(o=>o.id.startsWith('jump-guard-')),false);
 Object.assign(g.player,{x:1.3,z:22.9});assert.equal(g.canMoveTo(1.3,21.8),false);
});
test('missing a high step lands on normal floor without recovery or resetting earned words',()=>{
 const {g,t,c}=setup();c.collect(g,2);tick(t,1.6);Object.assign(g.player,{x:0,z:15.6});Object.assign(g.motion.mia,{y:3.8,vy:0,grounded:false});
 const recoveries=g.events.filter(e=>e==='FALL_SAFE').length;tick(t,1.5);
 assert.equal(g.motion.mia.y,0);assert.equal(g.player.z,15.6);assert.equal(g.player.x,0);assert.equal(g.events.filter(e=>e==='FALL_SAFE').length,recoveries);assert.equal(c.earned[2],true);
 tick(t,1.4,0,1);assert.ok(g.player.z>24.8);assert.equal(g.motion.mia.y,0);
});
test('docked ferry has open sides for walking and collecting cargo',()=>{
 const {g,c}=setup();Object.assign(g.player,{x:3.2,z:FERRY.a});assert.equal(g.canMoveTo(2.2,FERRY.a),true);
 assert.equal(c.interactionClear({x:3.2,z:FERRY.a},{x:1.7,z:FERRY.a},0),true);
 assert.ok(Math.abs(g.layout.spawn.x)<7);assert.ok(g.layout.spawn.z>29);
});
test('forecourt triples the former station-to-wall clearance while preserving the far exit',()=>{
 const {g,t}=setup();assert.equal(g.layout.halfDepth-24.5,(28-24.5)*3);
 assert.equal(g.layout.exitZ,-28);assert.equal(g.layout.sockets[3].z,FERRY.a);
 for(const actor of Object.values(t.actors)){assert.ok(actor.z>29);assert.ok(Math.abs(actor.x)<8);assert.equal(canStand(actor.x,actor.z,false,.38,g.layout),true);}
 for(const x of [-15,-5,5,15])assert.equal(g.canMoveTo(x,32),true);
});
test('companion cannot enter challenges, lava or controls; can explore both safe banks',()=>{
 const {t}=setup();const world=t.world();assert.equal(world.canNavigate!({x:0,z:RIVER.center}),false);assert.equal(world.canNavigate!({x:0,z:18}),false);assert.equal(world.canNavigate!({x:-10,z:20}),false);assert.equal(world.canNavigate!({x:12,z:20}),false);assert.equal(world.canNavigate!({x:-4,z:FERRY.a}),false);assert.equal(world.canNavigate!({x:8,z:-15}),true);
});

test('E places three separate words aboard without overlap and reset clears a travelling ferry',()=>{
 const {g,t,c}=setup('yuki');Object.assign(g.player,{x:0,z:FERRY.a});
 for(let i=0;i<3;i++){g.facing=i*2*Math.PI/3;c.collect(g,i);Object.assign(g.blocks[i],{state:'carried',carrier:'yuki'});t.interact();assert.equal(g.blocks[i].state,'floor');assert.equal(c.lift.contains(g.blocks[i],g.blocks[i].size/2),true);}
 for(const a of g.blocks.slice(0,3))for(const b of g.blocks.slice(0,3))if(a!==b)assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.95);
 c.lift.command(FERRY.b);tick(t,1);assert.equal(c.lift.moving,true);t.reset();assert.equal(g.actionChamber!.lift.z,FERRY.a);assert.deepEqual(g.actionChamber!.earned,[false,false,false]);
});
test('switching back to a stationary operator does not issue another ferry command',()=>{
 const {g,t,c}=setup('mia');Object.assign(g.player,{x:-4,z:FERRY.a});tick(t,4.2);assert.equal(c.lift.z,FERRY.b);
 t.select('yuki');tick(t,1);t.select('mia');tick(t,1);assert.equal(g.events.filter(e=>e==='FERRY_DEPART').length,1);
});
test('all words power the exit, but the entrance-side hero cannot satisfy the team exit',()=>{
 const {g,t,c}=setup('mia');for(let i=0;i<3;i++){c.collect(g,i);placeWord(g,i,i);}tick(t,5);
 Object.assign(g.player,{x:12,z:-30});tick(t,.1);assert.equal(g.escaped,false);
 Object.assign(t.actors.yuki,{x:12.5,z:-30});tick(t,.1);assert.equal(g.escaped,true);
});


test("step sides block the hero radius, with a walkable middle gap",()=>{const {c}=setup();assert.equal(c.canMove({x:1.3,z:22.3},0,true),false);assert.equal(c.canMove({x:0,z:21.4},0,true),true);assert.equal(c.canMove({x:1.3,z:21.4},.95,false),true);});

test('one plate per dock toggles the ferry from either endpoint on fresh entry',()=>{
 const {g,t,c}=setup();assert.equal(g.layout.sockets.slice(3).length,2);
 assert.equal(g.layout.exitCenterX,12);assert.equal(RIVER.near,0);
 Object.assign(g.player,{x:-4,z:FERRY.a});tick(t,4.2);assert.equal(c.lift.z,FERRY.b);
 tick(t,1);assert.equal(c.lift.z,FERRY.b);
 Object.assign(g.player,{x:-4,z:FERRY.a+3});tick(t,.1);
 Object.assign(g.player,{x:-4,z:FERRY.a});tick(t,4.2);assert.equal(c.lift.z,FERRY.a);
});

test('missed jumps between every row leave room to walk sideways out',()=>{
 for(let i=0;i<ACTION_JUMPS.length-1;i++){
  const {g,t}=setup();const z=(ACTION_JUMPS[i].z+ACTION_JUMPS[i+1].z)/2;
  Object.assign(g.player,{x:1.3,z});Object.assign(g.motion.mia,{y:0,vy:0,grounded:true});
  tick(t,.6,1,0);assert.ok(g.player.x>3.5,`stuck in row gap ${i}`);
 }
});

test('summit is a continuous landing and JUMP is reachable from either lane',()=>{
 for(const x of [-1.3,1.3]){
  const {g,t,c}=setup();const top=ACTION_JUMPS.at(-1)!;
  assert.equal(c.ground({x:0,z:top.z},top.y),top.y);
  Object.assign(g.player,{x,z:top.z});Object.assign(g.motion.mia,{y:top.y,vy:0,grounded:true});
  tick(t,1.6);assert.equal(g.nearest?.text,'JUMP');t.interact();assert.equal(g.carried?.text,'JUMP');
 }
});

test('far-end sign barrier prevents forward shortcuts but leaves the stairs open',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:0,z:12.2});Object.assign(g.motion.mia,{y:4.75,vy:0,grounded:true});
 assert.equal(g.canMoveTo(0,10.95),false);
 assert.equal(g.canMoveTo(0,13.1),true);
});
