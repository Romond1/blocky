import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heroPuzzle,actionPuzzle} from '../src/puzzles.ts';
const advance=(t:HeroTeam,n:number,dx=0,dz=0)=>{for(let i=0;i<n*60;i++)t.update(1/60,dx,dz);};
for(const puzzle of [heroPuzzle,actionPuzzle])for(const hero of ['yuki','mia'] as const)test(`${puzzle.id}/${hero}: land on small box then jump onto big box`,()=>{
 const g=new Game(puzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);
 if(g.actionChamber){g.actionChamber.earned=[true,true,true];}
 g.blocks.slice(2).forEach(b=>Object.assign(b,{x:-15,z:28}));Object.assign(g.blocks[0],{x:3,z:28,y:0,size:.95,state:'floor'});Object.assign(g.blocks[1],{x:4.4,z:28,y:0,size:1.65,state:'floor'});
 if(puzzle.id==='hero'){g.blocks.forEach(b=>b.z=4);}
 const z=g.blocks[0].z;Object.assign(g.player,{x:3,z});Object.assign(g.motion[hero],{y:1.3,vy:0,grounded:false});advance(t,.5);
 assert.equal(g.motion[hero].y,.95);assert.equal(g.motion[hero].grounded,true);
 assert.equal(g.jump(),true);advance(t,.15);advance(t,.28,1,0);advance(t,.8);
 assert.equal(g.motion[hero].y,1.65);assert.equal(g.motion[hero].grounded,true);
 advance(t,.6,0,1);advance(t,1);assert.equal(g.motion[hero].y,0);
});
test('box side stays solid below its top and removed support starts a fall',()=>{
 const g=new Game(),t=new HeroTeam(g);t.holdPosition(t.other);const b=g.blocks[0];Object.assign(b,{x:0,z:4,y:0,size:.95,state:'floor'});
 Object.assign(g.player,{x:-1,z:4});assert.equal(g.canMoveTo(0,4),false);
 Object.assign(g.player,{x:0,z:4});Object.assign(g.motion.yuki,{y:.95,vy:0,grounded:true});b.state='carried';advance(t,.5);assert.equal(g.motion.yuki.y,0);
});

test('stacked boxes and socket boxes support landings; an overhead box does not teleport a player upward',()=>{
 const g=new Game(),t=new HeroTeam(g);t.holdPosition(t.other);
 const b=g.blocks[0];Object.assign(b,{x:3,z:4,y:.95,size:.95,state:'floor'});
 Object.assign(g.player,{x:3,z:4});Object.assign(g.motion.yuki,{y:0,vy:0,grounded:true});advance(t,.1);assert.equal(g.motion.yuki.y,0);
 Object.assign(g.motion.yuki,{y:2.2,vy:0,grounded:false});advance(t,.5);assert.equal(g.motion.yuki.y,1.9);
 Object.assign(b,{state:'socket',y:.29});Object.assign(g.motion.yuki,{y:1.6,vy:0,grounded:false});advance(t,.5);assert.equal(g.motion.yuki.y,1.24);
});
