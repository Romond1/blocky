import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {actionPuzzle} from '../src/puzzles.ts';
function setup(hero:'mia'|'yuki'='yuki'){
 const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);
 g.actionChamber!.earned=[true,true,true];
 g.blocks.forEach((b,i)=>Object.assign(b,{x:-14+i*3,z:30,y:0,state:'floor',support:undefined}));
 Object.assign(g.player,{x:3,z:28});return {g,t};
}
for(const size of [.95,1.65])test(`forgiving edge landing on ${size} cube`,()=>{
 const {g,t}=setup(),b=g.blocks[0];Object.assign(b,{x:3,z:28,size});
 g.player.x=3+size/2+.2;Object.assign(g.motion.yuki,{y:size+.5,vy:-1,grounded:false});
 for(let i=0;i<60;i++)t.update(1/60);assert.equal(g.motion.yuki.y,size);assert.ok(g.motion.yuki.grounded);
});
for(const hero of ['mia','yuki'] as const)test(`${hero} can jump from ground onto a large cube with a slightly off-center approach`,()=>{
 const {g,t}=setup(hero),b=g.blocks[3];Object.assign(b,{x:3,z:26,size:1.65});g.player.x=3.9;g.player.z=27.4;
 g.jump();for(let i=0;i<35;i++)t.update(1/60,0,-1);for(let i=0;i<60;i++)t.update(1/60);
 assert.equal(g.motion[hero].y,1.65);assert.ok(g.motion[hero].grounded);
});
test('Room 7 light cubes stack onto HEAVY with forgiving aim and remain climbable',()=>{
 const {g,t}=setup(),small=g.blocks[1],base=g.blocks[3];Object.assign(base,{x:3,z:26,size:1.65});
 Object.assign(g.player,{x:3.3,z:28.45});g.facing=Math.PI;Object.assign(small,{state:'carried',carrier:'yuki'});
 t.interact();assert.equal(small.state,'floor');assert.equal(small.support,base.id);assert.equal(small.y,1.65);assert.equal(small.x,base.x);assert.equal(small.z,base.z);
 Object.assign(g.player,{x:3.6,z:26});Object.assign(g.motion.yuki,{y:3,vy:-1,grounded:false});
 for(let i=0;i<60;i++)t.update(1/60);assert.ok(Math.abs(g.motion.yuki.y-2.6)<1e-8);
});
test('untouched floor cubes use their rendered base height when stacking',()=>{
 const {g,t}=setup(),small=g.blocks[1],base=g.blocks[3];Object.assign(base,{x:3,z:26,size:1.65});delete base.y;
 Object.assign(g.player,{x:3,z:28.45});g.facing=Math.PI;Object.assign(small,{state:'carried',carrier:'yuki'});
 t.interact();assert.equal(small.support,base.id);assert.ok(Math.abs((small.y??0)-1.665)<1e-8);
});
