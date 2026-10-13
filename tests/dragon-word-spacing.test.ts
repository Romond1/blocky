import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {dragonPuzzle} from '../src/finale-layout.ts';

test('all Room 10 word plates accept physical cubes beside already placed answers',()=>{
 for(const order of [[0,1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1,0]]){
  const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia');
  for(const id of order){
   const s=g.layout.sockets[id],b=g.blocks[id];
   g.finale!.dragon!.carousel.detach(id,()=>{});
   Object.assign(b,{state:'carried',carrier:'mia'});
   Object.assign(t.actors.mia,{x:s.x,z:s.z+1.6,facing:Math.PI});
   Object.assign(g.motion.mia,{y:s.y??0,grounded:true});
   t.select('mia');g.facing=Math.PI;t.interact();
   assert.equal(g.placed[id]?.id,id,`slot ${id}: ${g.message}`);
  }
  assert.deepEqual(g.finale!.dragon!.language,[true,true,true]);
 }
});

test('final plates receive words from a comfortable distance and diagonal approach',()=>{
 for(const id of [0,1,2,3,4,5,6,7,8,9])for(const offset of [-.6,0,.6]){
  const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia'),s=g.layout.sockets[id];
  g.finale!.dragon!.carousel.attached.delete(id);
  Object.assign(g.blocks[id],{state:'carried',carrier:'mia'});
  Object.assign(t.actors.mia,{x:s.x+offset,z:s.z+2.35,facing:Math.PI});
  Object.assign(g.motion.mia,{y:s.y??0,grounded:true});t.select('mia');g.facing=Math.PI;
  assert.equal(g.nearbySlot,id);t.interact();assert.equal(g.placed[id]?.id,id,g.message);assert.equal(g.slotFeedback(id),'correct');
 }
});
