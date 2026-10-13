import test from 'node:test';
import assert from 'node:assert/strict';
import {IndexedWheel} from '../src/dragon-west.ts';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {dragonPuzzle} from '../src/finale-layout.ts';
import {DRAGON_PILLARS,DRAGON_ENDING_Z} from '../src/dragon-layout.ts';
const make=()=>{const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia');return {g,t,d:g.finale!.dragon!};};
const tick=(t:HeroTeam,s:number)=>{for(let i=0;i<s*60;i++)t.update(1/60);};
test('wheel advances once per release and press, never queues mid-motion presses',()=>{
 const w=new IndexedWheel();assert.equal(w.activate(true),true);w.advance(1);w.activate(false);assert.equal(w.activate(true),false);w.advance(4);assert.equal(w.angle,Math.PI/2);w.advance(30);assert.equal(w.angle,Math.PI/2);w.activate(false);w.activate(true);w.advance(3);assert.equal(w.angle,Math.PI);assert.equal(w.pose(0).z,7);
});
test('both sentence puzzles finish either route without requiring the apple on the other route',()=>{
 for(const west of [false,true]){const {g,t,d}=make();if(west)d.west.complete=true;else d.locks[0]=d.locks[1]=d.locks[2]=true;d.language[1]=d.language[2]=true;tick(t,4);assert.equal(d.bridgeReady,true);assert.equal(d.language[0],false);}
});
test('wheel transports parked hero and carried Heart across two indexed steps',()=>{
 const {g,t,d}=make();Object.assign(t.actors.yuki,{x:-30,z:17});Object.assign(t.actors.mia,{x:-25,z:21});Object.assign(g.finale!.heart,{state:'carried',carrier:'yuki'});
 tick(t,3);assert.ok(Math.abs(g.motion.yuki.y-5)<1e-6);assert.equal(d.west.wheel.angle,Math.PI/2);tick(t,10);assert.equal(d.west.wheel.angle,Math.PI/2);
 Object.assign(t.actors.mia,{x:-28,z:21});tick(t,.1);Object.assign(t.actors.mia,{x:-25,z:21});tick(t,3);
 assert.ok(Math.abs(t.actors.yuki.z-7)<1e-6);assert.ok(Math.abs(g.motion.yuki.y)<1e-6);assert.equal(g.finale!.recoveries,0);
});
test('apple unlocks lift; lower pad arms departure and upper pad calls it back',()=>{
 const {g,t,d}=make();Object.assign(t.actors.mia,{x:-25,z:0});tick(t,.2);assert.equal(d.west.liftBoarding,false);d.language[0]=true;tick(t,.2);assert.equal(d.west.liftBoarding,true);
 Object.assign(t.actors.mia,{x:-31,z:-2});Object.assign(t.actors.yuki,{x:-29,z:-2});Object.assign(g.finale!.heart,{state:'carried',carrier:'mia'});tick(t,5);assert.equal(d.west.lift.y,5);assert.equal(g.motion.mia.y,5);assert.equal(g.motion.yuki.y,5);assert.equal(g.finale!.recoveries,0);
 Object.assign(t.actors.mia,{x:-35,z:-6.7});tick(t,5);assert.equal(d.west.lift.y,0);assert.equal(g.motion.yuki.y,0);
});
test('ending thresholds are clear of volcanic pillars',()=>{for(const x of [-7,7])for(const p of DRAGON_PILLARS)assert.ok(Math.abs(p.x-x)>p.halfX+1.8||Math.abs(p.z-(DRAGON_ENDING_Z+1))>p.halfZ+.5);});

test('far-side operator can bring the second student across the wheel',()=>{
 const {g,t,d}=make();d.west.wheel.angle=d.west.wheel.target=Math.PI;
 Object.assign(t.actors.mia,{x:-30,z:17});Object.assign(t.actors.yuki,{x:-25,z:3.5});Object.assign(g.finale!.heart,{state:'carried',carrier:'mia'});
 tick(t,3);assert.ok(Math.abs(g.motion.mia.y-5)<1e-6);
 Object.assign(t.actors.yuki,{x:-28,z:3.5});tick(t,.1);Object.assign(t.actors.yuki,{x:-25,z:3.5});tick(t,3);
 assert.ok(Math.abs(t.actors.mia.z-7)<1e-6);assert.equal(g.finale!.recoveries,0);
});
test('lift remains where commanded until a fresh call, and reset returns every device to start',()=>{
 const {g,t,d}=make();d.language[0]=true;d.west.lift.y=5;d.west.lift.state='UP';Object.assign(t.actors.mia,{x:-24,z:3});tick(t,5);assert.equal(d.west.lift.y,5);
 Object.assign(t.actors.mia,{x:-25,z:0});tick(t,5);assert.equal(d.west.lift.y,0);d.west.wheel.angle=4;d.west.gateOpen=true;t.reset();const fresh=g.finale!.dragon!.west;assert.equal(fresh.lift.y,0);assert.equal(fresh.liftUnlocked,false);assert.equal(fresh.wheel.angle,0);assert.equal(fresh.gateOpen,false);assert.equal(fresh.shuttleX,-30);assert.equal(fresh.crossing,false);
});
test('Mia cannot release either left gate pad and sprint through alone',()=>{
 for(const [z,pad] of [[33,{x:-25,z:33}],[21,{x:-37,z:21}]] as const){const {g,t,d}=make();Object.assign(t.actors.mia,pad);tick(t,1);assert.equal(d.west.gateLift,6);const direction=z>26?-1:1;
 for(let i=0;i<150;i++)t.update(1/60,0,direction);assert.ok(direction<0?t.actors.mia.z>26:t.actors.mia.z<26);assert.equal(d.west.gateOpen,false);}
});
test('lateral shuttle carries a rider and Heart outward and brings them back if they stay aboard',()=>{
 const {g,t,d}=make();d.language[0]=true;Object.assign(t.actors.mia,{x:-30,z:-10});Object.assign(g.motion.mia,{y:5,grounded:true});Object.assign(g.finale!.heart,{state:'carried',carrier:'mia'});g.facing=Math.PI;tick(t,7);assert.ok(Math.abs(t.actors.mia.x+18)<.1);tick(t,7.5);assert.ok(Math.abs(t.actors.mia.x+30)<.1);assert.equal(g.finale!.recoveries,0);
});
test('apple choices include color and fruit distractors, wrong pair never unlocks lift',()=>{
 const {g,t,d}=make();for(const word of ['GREEN','YELLOW','PEAR','BANANA'])assert.ok(g.blocks.some(b=>b.text===word));for(const [slot,word] of ['GREEN','PEAR'].entries()){const b=g.blocks.find(b=>b.text===word)!;Object.assign(b,g.layout.sockets[slot],{state:'socket',slot});}tick(t,.2);assert.equal(d.west.liftUnlocked,false);for(const [slot,word] of ['RED','APPLE'].entries()){g.blocks.filter(b=>b.slot===slot).forEach(b=>Object.assign(b,{state:'floor',slot:undefined}));Object.assign(g.blocks.find(b=>b.text===word)!,g.layout.sockets[slot],{state:'socket',slot});}tick(t,.2);assert.equal(d.west.liftUnlocked,true);
});
