import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {createBlockHero} from '../src/characters/BlockHero.ts';
import {heroPuzzle,fruitPuzzle,sortingPuzzle,actionPuzzle} from '../src/puzzles.ts';
import {MovementInput,carryPoint,turnToward} from '../src/movement.ts';

test('adding a second direction blends through intermediate travel angles without release drift',()=>{
 const input=new MovementInput();input.update(.2,0,1);const diagonal=input.update(1/60,1,1);
 assert.ok(diagonal.x>0&&diagonal.x<diagonal.z,'added axis snapped to diagonal');
 const released=input.update(1/60,1,0);assert.equal(released.z,0);assert.ok(released.x>0);
 const reversed=input.update(1/60,-1,0);assert.ok(reversed.x<0);
 assert.deepEqual(input.update(1/60,0,0),{x:0,z:0});
 input.clear();assert.deepEqual(input.update(0,1,1),{x:0,z:0});
});
test('turn duration is consistent at 30, 60 and 120 fps',()=>{
 for(const rate of [30,60,120]){let angle=Math.PI;for(let i=0;i<rate/10;i++)angle=turnToward(angle,Math.PI/2,1/rate);assert.ok(Math.abs(angle-(Math.PI-1))<1e-10);}
});
test('all cube sizes stay centered at arbitrary continuous headings',()=>{
 for(const size of [.95,1.65])for(let angle=0;angle<Math.PI*2;angle+=Math.PI/16){
  const p={x:3,z:4,facing:angle},a=carryPoint(p,size),dx=a.x-p.x,dz=a.z-p.z;
  assert.ok(Math.abs(dx*Math.cos(angle)-dz*Math.sin(angle))<1e-10);
  assert.ok(Math.abs(dx*Math.sin(angle)+dz*Math.cos(angle)-(size/2+.5))<1e-10);
 }
});

test('Space alone has no horizontal drift, including after a direction release',()=>{
 const g=new Game(),team=new HeroTeam(g);const p={...g.player};g.jump();for(let i=0;i<60;i++)team.update(1/60);assert.deepEqual(g.player,p);
 g.jump();team.update(.1,1,0);const stopped={...g.player};for(let i=0;i<60;i++)team.update(1/60);assert.deepEqual(g.player,stopped);
});
test('turns pass through intermediate headings and release freezes precision aim',()=>{
 const g=new Game();g.facing=Math.PI;g.update(1/60,1,0);
 assert.ok(g.facing>Math.PI/2+.01&&g.facing<Math.PI-.01,'heading snapped');
 const p={...g.player},angle=g.facing;g.update(.5);assert.deepEqual(g.player,p);assert.equal(g.facing,angle);
 for(let i=0;i<60;i++)g.update(1/60,1,0);assert.ok(Math.abs(g.facing-Math.PI/2)<.001);
});
test('shortest turn crosses the angle seam without spinning',()=>{
 const g=new Game();g.facing=Math.PI-.02;g.update(1/60,-.1,-1);assert.ok(Math.abs(g.facing-(Math.PI-.02))<.2);
});
for(const kind of ['yuki','mia'] as const)test(`${kind} blends both hands into the same forward carrying pose`,()=>{
 const hero=createBlockHero(kind);hero.update(0,0,false);const initial=hero.joints.left.shoulder.rotation.x;
 hero.update(1/60,0,true);assert.ok(Math.abs(hero.joints.left.shoulder.rotation.x-initial)<.3,'pickup snapped');
 for(let i=0;i<60;i++)hero.update(1/60,0,true);
 assert.ok(Math.abs(hero.joints.left.shoulder.rotation.x-hero.joints.right.shoulder.rotation.x)<.001,'one hand remains down');
 assert.ok(hero.joints.left.shoulder.rotation.x<-.7);
});
for(const puzzle of [heroPuzzle,fruitPuzzle,sortingPuzzle,actionPuzzle])test(`${puzzle.id}: blocked front drop keeps cube instead of moving it sideways`,()=>{
 const g=new Game(puzzle),team=new HeroTeam(g);const b=g.blocks.find(b=>b.weightClass==='light')!;
 Object.assign(b,{state:'carried',carrier:'yuki'});g.player.x=g.layout.halfWidth-.4;g.player.z=g.layout.spawn.z;g.facing=Math.PI/2;
 team.interact();assert.equal(b.state,'carried');
});
