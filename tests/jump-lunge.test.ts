import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {powerPuzzle} from '../src/puzzles.ts';

function advance(team:HeroTeam,seconds:number,dx=0,dz=0,step=1/60){for(let left=seconds;left>1e-8;left-=step)team.update(Math.min(step,left),dx,dz);}
for(const hero of ['yuki','mia'] as const){
 test(`${hero}: Space alone jumps in place and remains stationary after landing`,()=>{
  const g=new Game(),team=new HeroTeam(g,hero),start={...g.player};assert.equal(g.jump(),true);advance(team,1.2);
  assert.deepEqual(g.player,start);assert.equal(g.motion[hero].grounded,true);
  const stopped={...g.player};advance(team,.5);assert.deepEqual(g.player,stopped);
 });
 test(`${hero}: steering moves during a jump and releasing input stops movement`,()=>{
  const g=new Game(),team=new HeroTeam(g,hero);g.jump();advance(team,.1,1,0);const p={...g.player};advance(team,.6);
  assert.ok(g.player.x>g.layout.spawn.x);assert.deepEqual(g.player,p);
 });
 test(`${hero}: explicit jump steering respects solid room boundaries`,()=>{
  const g=new Game(),team=new HeroTeam(g,hero);g.facing=Math.PI/2;const start={...g.player};g.jump();advance(team,.2,1,0);advance(team,.8);
  assert.ok(g.player.x>start.x);assert.equal(g.player.z,start.z);
  team.reset();g.player.x=g.layout.halfWidth-.4;g.facing=Math.PI/2;g.jump();advance(team,1,1,0);assert.ok(g.player.x<=g.layout.halfWidth-.38);
 });
}
test('jumping in place is frame-rate independent and adds no movement after reset or switching',()=>{
 const results=[];
 for(const step of [1/30,1/60,1/120]){const g=new Game(),team=new HeroTeam(g);g.jump();advance(team,1,0,0,step);results.push(g.player.z);}
 assert.ok(results.every(z=>Math.abs(z-4)<.001));
 const g=new Game(),team=new HeroTeam(g);g.jump();advance(team,.1);team.select('mia');const p={...g.player};advance(team,1);assert.deepEqual(g.player,p);
 team.select('yuki');const q={...g.player};advance(team,.5);assert.deepEqual(g.player,q);
 g.jump();team.reset();advance(team,.5);assert.equal(g.player.z,g.layout.spawn.z);
});
test('Space with forward input can clear the existing tutorial ditch from its lip',()=>{
 for(const hero of ['yuki','mia'] as const){const g=new Game(powerPuzzle),team=new HeroTeam(g,hero);g.player.z=16.78;g.jump();advance(team,1,0,-1);
  assert.ok(g.player.z<15.4,hero);assert.equal(g.motion[hero].grounded,true);assert.ok(!g.events.includes('JUMP_RETRY'));
 }
});
