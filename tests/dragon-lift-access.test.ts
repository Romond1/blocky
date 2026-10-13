import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {dragonPuzzle} from '../src/finale-layout.ts';
const tick=(t:HeroTeam,s:number,dx=0,dz=0)=>{for(let i=0;i<s*60;i++)t.update(1/60,dx,dz);};
const make=()=>{const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia'),d=g.finale!.dragon!;d.locks[0]=d.locks[1]=true;t.holdPosition(t.other);return {g,t,d};};
test('unlocked lower landing pad waits for the Heart before carrying the team',()=>{
 const {g,t,d}=make(),pad=g.layout.sockets[16];d.liftUnlocked=true;assert.ok(pad,'accessible lower control');
 Object.assign(t.actors.mia,pad);Object.assign(t.actors.yuki,{x:30,z:-14});tick(t,.1);
 tick(t,15);assert.equal(d.lift.y,0,'no boarding countdown');
 Object.assign(t.actors.mia,{x:32,z:-14});tick(t,1);assert.equal(d.lift.y,0,'wait for the Heart');
 Object.assign(g.finale!.heart,{state:'carried',carrier:'mia'});tick(t,4.5);
 assert.equal(d.lift.y,4);assert.equal(g.motion.mia.y,4);assert.equal(g.motion.yuki.y,4);assert.equal(g.finale!.recoveries,0);
 // Move both travelers through the broad upper exit onto the permanent gallery.
 for(const hero of ['mia','yuki'] as const){t.select(hero);for(let i=0;i<160&&t.actors[hero].x>26.6;i++)t.update(1/60,-1,0);assert.ok(t.actors[hero].x<27.6);assert.equal(g.motion[hero].y,4);}
});
test('lower pad recalls the raised lift and reset clears boarding',()=>{
 const {g,t,d}=make(),pad=g.layout.sockets[16];d.liftUnlocked=true;assert.ok(pad);
 d.lift.y=4;d.lift.state='UP';Object.assign(t.actors.mia,pad);Object.assign(t.actors.yuki,{x:25,z:-19});g.motion.yuki.y=4;
 tick(t,4.5);assert.equal(d.lift.y,0);
 t.reset();assert.equal(g.finale!.dragon!.snapshot().lift.boarding,false);
});
test('a grounded rider standing on cargo counts as aboard and carries the Heart upward',()=>{
 const {g,t,d}=make();d.liftUnlocked=true;d.liftBoarding=true;
 Object.assign(g.blocks[13],{x:32,z:-14,y:0});Object.assign(t.actors.mia,{x:32,z:-14});g.motion.mia.y=1.2;
 Object.assign(t.actors.yuki,{x:29,z:-14});Object.assign(g.finale!.heart,{state:'carried',carrier:'mia'});
 tick(t,4.5);assert.equal(d.lift.y,4);assert.equal(g.motion.mia.y,5.2);assert.equal(g.motion.yuki.y,4);assert.equal(g.finale!.recoveries,0);
});
test('wide elevator, blocks and ground support agree and start free of overlaps',()=>{
 const {g,t,d}=make();assert.ok(d.liftContains({x:34,z:-14}));assert.ok(d.liftContains({x:31,z:-11}));
 assert.deepEqual(g.blocks.slice(10,13).map(b=>b.size),[1.8,1.8,1.8]);
 const original=g.blocks.slice(10,15).map(b=>({x:b.x,z:b.z,y:b.y}));tick(t,2);
 assert.deepEqual(g.blocks.slice(10,15).map(b=>({x:b.x,z:b.z,y:b.y})),original);
 assert.equal(g.events.includes('WORD_RECOVERED'),false);
});


test('right lift cannot bypass blocks; upper grounded plate unlocks partner calls and reset relocks',()=>{
 const {g,t,d}=make();const lower=g.layout.sockets[16],upper=g.layout.sockets[14];
 Object.assign(t.actors.mia,lower);Object.assign(t.actors.yuki,{x:31,z:-14});Object.assign(g.finale!.heart,{state:'carried',carrier:'yuki'});
 tick(t,2);assert.equal(d.liftUnlocked,false);assert.equal(d.liftBoarding,false);assert.equal(d.lift.y,0);
 Object.assign(t.actors.mia,{x:31,z:-14});tick(t,2);assert.equal(d.lift.y,0);
 Object.assign(t.actors.mia,upper);Object.assign(g.motion.mia,{y:4,grounded:true});tick(t,4.5);
 assert.equal(d.liftUnlocked,true);assert.equal(d.lift.y,4);assert.equal(g.motion.yuki.y,4);
 t.reset();assert.equal(g.finale!.dragon!.liftUnlocked,false);
});
