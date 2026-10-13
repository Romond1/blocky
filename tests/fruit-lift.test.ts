import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Elevator,LIFT} from '../src/elevator.ts';

test('lift toggles only on fresh occupancy and ignores triggers while moving',()=>{
 const lift=new Elevator();lift.activate([true,false]);assert.equal(lift.state,'MOVING_UP');
 lift.advance(4,[],[]);assert.equal(lift.state,'UP');lift.activate([true,false]);assert.equal(lift.state,'UP');
 lift.activate([false,false]);lift.activate([true,false]);assert.equal(lift.state,'MOVING_DOWN');
 lift.activate([false,false]);lift.activate([true,false]);lift.advance(4,[],[]);assert.equal(lift.state,'DOWN');
 lift.activate([true,false]);assert.equal(lift.state,'DOWN');
});
test('both heroes and five objects move by the exact platform delta',()=>{
 const lift=new Elevator(),people=[{x:LIFT.x-1,z:0,y:0,grounded:true},{x:LIFT.x+1,z:0,y:0,grounded:true}];
 const cargo=Array.from({length:5},(_,i)=>({x:LIFT.x+(i%3-1),z:1-Math.floor(i/3),y:0,state:'floor',size:.95}));
 lift.activate([true,false]);lift.advance(4,people,cargo);assert.equal(lift.y,5);
 for(const p of people)assert.equal(p.y,5);for(const b of cargo)assert.equal(b.y,5);
 lift.activate([false,false]);lift.activate([false,true]);lift.advance(4,people,cargo);
 for(const p of people)assert.equal(p.y,0);for(const b of cargo)assert.equal(b.y,0);
});
test('descent pauses above an obstructing hero and resumes once clear',()=>{
 const lift=new Elevator();lift.activate([true]);lift.advance(4,[],[]);lift.activate([false]);lift.activate([true]);
 const underneath={x:LIFT.x,z:0,y:0,grounded:true};lift.advance(4,[underneath],[]);assert.equal(lift.y,5);assert.equal(lift.blocked,true);
 underneath.x=0;lift.advance(4,[underneath],[]);assert.equal(lift.state,'DOWN');
});

import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {fruitPuzzle} from '../src/puzzles.ts';
const setup=(hero:'mia'|'yuki'='yuki')=>{const g=new Game(fruitPuzzle),t=new HeroTeam(g,hero);return {g,t};};
const tick=(t:HeroTeam,seconds:number)=>{for(let i=0;i<seconds*60;i++)t.update(1/60);};
for(const hero of ['yuki','mia'] as const)test(`${hero} rides while other hero controls; Tab retains cabin support`,()=>{
 const {g,t}=setup(hero);Object.assign(g.player,{x:9,z:0});t.select(t.other);
 Object.assign(g.player,{x:5,z:1});tick(t,4.2);
 assert.equal(g.fruit!.lift.state,'UP');assert.equal(g.motion[hero].y,5);assert.equal(t.actors[hero].x,9);
 assert.equal(g.presenceRequired(t.selected),true);t.select(hero);assert.equal(g.motion[hero].y,5);
});
test('upper words cannot be picked up from lower floor; all fruit blocks are explicitly light',()=>{
 const {g}=setup();Object.assign(g.player,{x:6,z:-6});assert.equal(g.nearest,undefined);
 for(const b of g.blocks){assert.equal(b.size,.95);assert.equal(b.weightClass,'light');assert.equal(b.requiredStrength,1);}
});
test('matches lock separately; decoys stay retrievable; reset clears motion and puzzle',()=>{
 const {g,t}=setup();
 const place=(word:string,index:number)=>{const b=g.blocks.find(b=>b.text===word)!;Object.assign(b,{state:'carried',carrier:t.selected});Object.assign(g.player,{x:g.layout.sockets[index].x,z:g.layout.sockets[index].z+1.9});g.interact();};
 place('APPLE',0);assert.equal(g.slotFeedback(0),'correct');assert.equal(g.slotLocked(0),true);
 place('GRAPE',1);assert.equal(g.slotFeedback(1),'wrong');assert.equal(g.slotLocked(1),false);assert.equal(g.slotFeedback(0),'correct');
 g.player.z=g.layout.sockets[1].z+1.7;g.interact();assert.equal(g.carried?.text,'GRAPE');
 Object.assign(g.player,{x:0,z:6});g.facing=0;g.interact();assert.equal(g.carried,undefined);g.facing=Math.PI;
 place('PEAR',2);place('BANANA',1);assert.equal(g.solved,true);
 g.fruit!.lift.activate([true]);tick(t,1);t.reset();assert.equal(g.fruit!.lift.state,'DOWN');assert.equal(g.solved,false);assert.equal(g.motion.yuki.y,0);assert.equal(g.blocks[1].y,5);
});
test('upper companion cannot transition at downstairs exit or navigate across levels',()=>{
 const {g,t}=setup();g.solved=true;g.doorLift=4.6;Object.assign(t.actors.mia,{x:-10,z:-14});g.motion.mia.y=5;
 Object.assign(g.player,{x:-10,z:-14});t.update(.01);assert.equal(g.escaped,false);
 assert.equal(t.world().canNavigate!({x:-10,z:-14}),false);
});

test('inactive hero holds a purple toggle plate until the player moves them off, including after solving',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:5,z:1});tick(t,4.2);t.select('mia');
 const held={...t.actors.yuki};g.solved=true;tick(t,12);assert.deepEqual(t.actors.yuki,held);assert.equal(t.companion.state,'HOLD_POSITION');assert.equal(g.fruit!.lift.state,'UP');
 t.select('yuki');Object.assign(g.player,{x:5,z:3.2});t.update(.1);assert.equal(g.presenceRequired('yuki'),false);t.select('mia');tick(t,1);assert.notEqual(t.companion.state,'HOLD_POSITION');
});

test('front lift fence blocks crossing and placing a block through it; rear entry stays open',()=>{
 const {g}=setup();Object.assign(g.player,{x:9,z:2});assert.equal(g.canMoveTo(9,2.4),false);
 assert.equal(g.canMoveTo(9,-2.4),true);g.jump();assert.equal(g.canMoveTo(9,2.4),false);
 g.motion.yuki.grounded=true;g.motion.yuki.y=0;g.facing=0;
 const b=g.blocks[0];Object.assign(b,{state:'carried',carrier:'yuki'});g.interact();
 assert.equal(b.state,'carried','fence blocks forward placement without moving the cube sideways');
 g.facing=Math.PI;g.interact();assert.equal(b.state,'floor');assert.ok(b.z<2,'turning into the cabin permits placement');assert.ok(Math.abs(b.x-g.player.x)<1e-8);
});

test('fruit cannot be picked up through the front fence or side rails',()=>{
 const {g}=setup();const b=g.blocks[0];Object.assign(b,{x:9,z:1.6,y:0});Object.assign(g.player,{x:9,z:3.1});assert.equal(g.nearest,undefined);
 Object.assign(b,{x:7,z:0});Object.assign(g.player,{x:5.6,z:0});assert.equal(g.nearest,undefined);
 Object.assign(b,{x:9,z:-1.6});Object.assign(g.player,{x:9,z:-3.1});assert.equal(g.nearest?.id,b.id);
});

test('upper hero cannot step or jump into an absent lift to bypass cooperation',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:9,z:-3.1});g.motion.yuki.y=5;
 assert.equal(g.canMoveTo(9,-2.4),false);g.jump();assert.equal(g.canMoveTo(9,-2.4),false);
 tick(t,.1);assert.ok(g.motion.yuki.y>=5);
});

test('E placement fits all five light blocks on the cabin without overlap and transports them',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:9,z:0});g.facing=0;
 const fruitBlocks=g.blocks.filter(b=>['APPLE','BANANA','PEAR','ORANGE','GRAPE'].includes(b.text));assert.equal(fruitBlocks.length,5);
 for(const [i,b] of fruitBlocks.entries()){g.facing=i*2*Math.PI/5;Object.assign(b,{state:'carried',carrier:'yuki'});g.interact();assert.equal(b.state,'floor');assert.ok(g.fruit!.lift.contains(b,b.size/2));}
 for(const a of fruitBlocks)for(const b of fruitBlocks)if(a.id!==b.id)assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.95);
 Object.assign(t.actors.mia,{x:5,z:1});tick(t,4.2);for(const b of fruitBlocks)assert.equal(b.y,5);
});
for(const when of [.2,1.8,3.8])test(`jump during lift travel at ${when}s lands on its endpoint`,()=>{
 const {g,t}=setup();Object.assign(g.player,{x:9,z:0});Object.assign(t.actors.mia,{x:5,z:1});tick(t,when);g.jump();tick(t,5);
 assert.equal(g.motion.yuki.y,5);assert.equal(g.motion.yuki.grounded,true);
 Object.assign(t.actors.mia,{x:5,z:3.2});t.update(.01);Object.assign(t.actors.mia,{x:5,z:1});tick(t,when);g.jump();tick(t,5);
 assert.equal(g.motion.yuki.y,0);assert.equal(g.motion.yuki.grounded,true);
});
