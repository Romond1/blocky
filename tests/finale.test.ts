import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import * as puzzles from '../src/puzzles.ts';

test('finale rooms provide dedicated integrated controllers',()=>{
 const p=(puzzles as any).heartPuzzle;assert.ok(p,'Room 9 definition must exist');
 const g=new Game(p);assert.ok((g as any).finale,'Room 9 must own finale state');
 const cave=new Game((puzzles as any).dragonPuzzle);assert.ok((cave as any).finale);
 assert.equal(cave.solved,false,'cavern must not activate ending');
});

const make=(room='heart')=>{const g=new Game((puzzles as any)[room==='heart'?'heartPuzzle':'dragonPuzzle']);return {g,t:new HeroTeam(g,'mia'),f:(g as any).finale};};
const tick=(t:HeroTeam,seconds:number)=>{for(let i=0;i<seconds*60;i++)t.update(1/60);};
test('assembly needs a hero in the circle and freezes movement, switching and interactions',()=>{
 const {g,t,f}=make();f.shardCount=5;
 tick(t,.1);assert.equal(f.assembly,'waiting');Object.assign(t.actors.mia,{x:0,z:33});tick(t,.1);
 assert.equal(f.assembly,'playing');const start={...g.player};t.update(.3,1,0);g.interact();assert.equal(t.select('yuki'),false);
 assert.deepEqual(g.player,start);assert.equal(g.carried,undefined);tick(t,6.5);assert.equal(f.assembly,'complete');assert.equal(f.heart.state,'floor');assert.equal(f.shardCount,5);
});
test('Heart uses shared light carrying and stationary companion handoff',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(g.player,{x:0,z:33.3});g.facing=Math.PI;g.interact();
 assert.equal(g.carried?.id,f.heart.id);assert.equal(g.carried?.weightClass,'light');assert.equal(t.select('yuki'),true);
 const p={...t.actors.mia};tick(t,2);assert.equal(f.heart.carrier,'mia');assert.deepEqual(t.actors.mia,p);assert.equal(t.companion.state,'HOLDING_OBJECT');
 t.select('mia');g.interact();assert.equal(f.heart.state,'floor');
});
test('objective loss recovers alone to reached checkpoint and reset restarts assembly',()=>{
 const {g,t,f}=make();f.finishAssembly(g);f.checkpoint={x:0,y:0,z:-40};Object.assign(f.heart,{x:0,z:-30,y:-8,state:'floor'});tick(t,.1);
 assert.equal(f.heart.z,-40);assert.equal(g.escaped,false);assert.equal(f.recoveries,1);t.reset();assert.equal((g as any).finale.assembly,'waiting');
});
test('reciprocal gate holds until all three travelers pass',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(t.actors.mia,{x:-6,z:27});Object.assign(t.actors.yuki,{x:0,z:26});tick(t,.8);
 assert.ok(f.gateLift>2.8);t.select('yuki');tick(t,1);assert.equal(t.companion.state,'HOLD_POSITION');
 Object.assign(t.actors.yuki,{x:6,z:21});t.select('mia');tick(t,.7);assert.ok(f.gateLift>2.8);
 Object.assign(t.actors.mia,{x:0,z:20});Object.assign(f.heart,{x:0,z:19});tick(t,.1);assert.equal(f.sections[0],true);
});
test('existing elevator moves Heart and grounded rider stably',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(t.actors.mia,{x:5,z:3});Object.assign(t.actors.yuki,{x:9,z:0});Object.assign(f.heart,{x:9,z:-1,y:0});tick(t,4.2);
 assert.equal(f.lift.y,5);assert.equal(g.motion.yuki.y,5);assert.equal(f.heart.y,5);assert.equal(t.companion.state,'HOLD_POSITION');
});
test('Side B toggle commands ferry to A and returns Yuki and Heart to B',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(t.actors.mia,{x:5,z:-39});Object.assign(t.actors.yuki,{x:0,z:-21.5});Object.assign(f.heart,{x:0,z:-20.5,y:0});tick(t,4.2);
 assert.equal(f.ferry.worldZ,-21.5);Object.assign(t.actors.mia,{x:6.5,z:-40});tick(t,.1);Object.assign(t.actors.mia,{x:5,z:-39});tick(t,4.2);
 assert.equal(f.ferry.worldZ,-38.5);assert.ok(t.actors.yuki.z<-36);assert.ok(f.heart.z<-36);assert.equal(f.sections[2],true);
});
test('language requires correct ordered words and physical Heart delivery for team exit',()=>{
 const {g,t,f}=make();f.finishAssembly(g);f.sections=[true,true,true];
 for(let i=0;i<12;i++){const b=g.blocks.find(b=>b.id===i);assert.ok(b);Object.assign(b,{state:'socket',slot:i,x:g.layout.sockets[i].x,z:g.layout.sockets[i].z,y:.29});}
 tick(t,.1);assert.equal(f.language.every(Boolean),true);assert.equal(g.solved,true);assert.equal(f.exitReady,false);
 Object.assign(f.heart,{x:0,z:-59,y:0,state:'floor'});tick(t,6);assert.equal(f.exitReady,true);
 Object.assign(t.actors.mia,{x:0,z:-64});Object.assign(t.actors.yuki,{x:1,z:-64});tick(t,.1);assert.equal(g.escaped,true);
});
test('dragon ring has broken sector routes, central lava and no automatic ending',()=>{
 const {g,t,f}=make('dragon');assert.equal(f.assembly,'complete');assert.equal(f.ground({x:0,z:0},0),-8);
 assert.equal(f.ground({x:31,z:2},0),-8);assert.equal(f.ground({x:-31,z:0},0),0);assert.equal(f.canMove({x:Math.sin(.64)*31,z:Math.cos(.64)*31},0,true),false);assert.equal(f.ground({x:0,z:31},0),0);assert.equal(f.ground({x:0,z:-31},5),5);
 tick(t,10);assert.equal(g.solved,false);assert.equal(g.escaped,false);
});
test('either hero can carry the objective on the elevator without collision recovery',()=>{
 for(const hero of ['mia','yuki'] as const){const {g,t,f}=make();f.finishAssembly(g);t.select(hero);
 Object.assign(t.actors[hero],{x:9,z:0});Object.assign(f.heart,{state:'carried',carrier:hero});
 Object.assign(t.actors[t.other],{x:5,z:3});tick(t,4.2);
 assert.equal(f.lift.y,5);assert.equal(g.motion[hero].y,5);assert.equal(f.heart.carrier,hero);assert.equal(f.recoveries,0);
 }
});
test('incorrect word order is retrievable; Heart is never accepted by a language plate',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(g.player,{x:-10.15,z:-45.65});g.facing=Math.PI;
 const b=g.blocks[1];Object.assign(b,{state:'carried',carrier:'mia'});g.interact();assert.equal(b.slot,0);assert.equal(f.language[0],false);
 g.interact();assert.equal(b.state,'carried');Object.assign(g.player,{x:0,z:-44});f.drop(g,b);assert.equal(b.state,'floor');
 Object.assign(g.player,{x:-10.15,z:-45.65});Object.assign(f.heart,{state:'carried',carrier:'mia'});g.interact();assert.notEqual(f.heart.state,'socket');assert.equal(f.heart.slot,undefined);
});
test('temporary bridge favors Mia speed and safely recovers a late Yuki crossing',()=>{
 for(const h of ['mia','yuki'] as const){const {g,t,f}=make();f.finishAssembly(g);t.select(h);Object.assign(t.actors[h],{x:-7,z:-23.7});Object.assign(t.actors[t.other],{x:-10,z:-21});g.bridge.time=.8;
 for(let i=0;i<180;i++)t.update(1/60,0,-1);
 if(h==='mia')assert.ok(t.actors[h].z<-36);else assert.ok(t.actors[h].z>-36);
 assert.equal(g.escaped,false);
 }
});
test('an invalid Heart cannot award forward checkpoints or completion',()=>{
 const {g,t,f}=make();f.finishAssembly(g);Object.assign(t.actors.mia,{x:2,z:-40});Object.assign(t.actors.yuki,{x:4,z:-40});
 Object.assign(f.heart,{x:100,z:-40,y:0});tick(t,.1);assert.equal(f.checkpointIndex,0);assert.equal(f.sections.some(Boolean),false);assert.equal(f.heart.z,32);
});
test('language picture supports are solid camera/navigation obstacles',()=>{
 const {g,f}=make();f.finishAssembly(g);assert.equal(g.canMoveTo(7,-49.35),false);assert.equal(g.canMoveTo(-7,-57.35),false);
});

test('pending video keeps the assembled heart sequence paused until playback ends',()=>{const {g,t,f}=make();f.startAssembly(g);f.videoPending=true;tick(t,7);assert.equal(f.assembly,'playing');assert.ok(f.assemblyTime>=6);f.videoPending=false;f.videoActive=true;tick(t,2);assert.equal(f.assembly,'playing');f.finishAssembly(g);assert.equal(f.assembly,'complete');assert.equal(f.heart.hidden,false);});
