import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heroPuzzle,actionPuzzle} from '../src/puzzles.ts';
import {tryStack} from '../src/block-stacking.ts';
const tick=(t:HeroTeam,s:number,dx=0,dz=0)=>{for(let i=0;i<s*60;i++)t.update(1/60,dx,dz);};
test('aiming beside the visible face does not magnetically stack',()=>{
 const g=new Game(actionPuzzle),base=g.blocks[3],held=g.blocks[4];
 Object.assign(base,{x:0,z:0,y:0});Object.assign(held,{state:'carried'});
 assert.equal(tryStack(held,[base,held],{x:1.52,z:1.4},Math.PI,()=>true,()=>true,true,true),false);
});
test('a larger block cannot stack on a smaller block',()=>{
 const g=new Game(actionPuzzle),base=g.blocks[4],held=g.blocks[3];
 Object.assign(base,{x:0,z:0,y:0});Object.assign(held,{state:'carried'});
 assert.equal(tryStack(held,[base,held],{x:0,z:2},Math.PI,()=>true,()=>true,true,true),false);
});
test('clear floor in front of a large base remains available for a small step',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);
 const base=g.blocks[3],step=g.blocks[4];Object.assign(base,{x:12,z:16,y:0});Object.assign(step,{state:'carried',carrier:t.selected});
 Object.assign(g.player,{x:12,z:19.4});g.facing=Math.PI;t.interact();
 assert.equal(step.state,'floor');assert.equal(step.y,0);assert.equal(step.support,undefined);assert.ok(step.z>17.5);
});
test('ordinary room allows touching-face neighbors and deliberate equal-size stacking',()=>{
 const g=new Game(heroPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);
 const [base,held]=g.blocks;g.blocks.slice(2).forEach(b=>b.hidden=true);
 Object.assign(base,{x:0,z:3,y:0});Object.assign(held,{state:'carried',carrier:t.selected});
 Object.assign(g.player,{x:base.size,z:3+held.size/2+.5});g.facing=Math.PI;t.interact();
 assert.equal(held.state,'floor');assert.equal(held.support,undefined);assert.equal(held.y,0);
 assert.ok(Math.abs(held.x-base.x)<base.size+.05,'no artificial spacing between visible faces');
 Object.assign(held,{state:'carried',carrier:t.selected});Object.assign(g.player,{x:0,z:5});g.facing=Math.PI;t.interact();
 assert.equal(held.support,base.id);assert.equal(held.y,base.size);
});
for(const hero of ['yuki','mia'] as const)test(`${hero} jumps from a touching small step onto a large base`,()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);
 const base=g.blocks[3],step=g.blocks[4];Object.assign(base,{x:12,z:18,y:0});Object.assign(step,{x:12,z:19.5,y:0});
 Object.assign(g.player,{x:12,z:20.8});g.jump();tick(t,.35,0,-1);tick(t,1);assert.equal(g.motion[hero].y,.8);
 g.jump();tick(t,.5,0,-1);tick(t,1);assert.equal(g.motion[hero].y,2.2);
});
