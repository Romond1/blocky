import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.ts';
import { HeroTeam } from '../src/team.ts';
import { powerPuzzle } from '../src/puzzles.ts';
function pick(g:Game,text:string){const b=g.blocks.find(b=>b.text===text)!;g.player.x=b.x;g.player.z=b.z+1.6;g.interact();g.update(.5);assert.equal(g.carried?.text,text);}
function place(g:Game,i:number){const s=g.layout.sockets[i];g.player.x=s.x;g.player.z=s.z+1.7;g.interact();}
test('STRONG powers first lock; wrong answers remain retrievable; M stabilizes crossing',()=>{
 const g=new Game(powerPuzzle);pick(g,'FAST');place(g,0);assert.equal(g.slotFeedback(0),'wrong');assert.equal(g.solved,false);
 pick(g,'FAST');g.player.x=-16;g.player.z=9;g.interact();pick(g,'STRONG');place(g,0);
 assert.deepEqual(g.stageSolved,[true,false]);assert.equal(g.doorLift,0);
 pick(g,'N');place(g,1);assert.equal(g.slotFeedback(1),'wrong');pick(g,'N');g.player.x=14;g.player.z=6;g.interact();
 pick(g,'M');place(g,1);assert.equal(g.solved,true);g.update(7);assert.equal(g.bridge.extension,1);
 g.reset();assert.deepEqual(g.stageSolved,[false,false]);assert.equal(g.bridge.extension,0);assert.equal(g.doorLift,0);
});
test('each hero must jump tutorial; walking and repeated Space cannot bypass it',()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,'yuki');
 for(let i=0;i<100;i++)t.update(.02,0,-1);
 assert.ok(g.player.z>=16.78);assert.equal(g.jump(),true);assert.equal(g.jump(),false);
 for(let i=0;i<65;i++)t.update(.02,0,-1);
 assert.ok(g.player.z<16);assert.equal(g.motion.yuki.crossed,true);assert.equal(g.motion.mia.crossed,false);assert.ok(t.actors.mia.z>18);
 t.select('mia');for(let i=0;i<100;i++)t.update(.02,0,-1);g.jump();for(let i=0;i<65;i++)t.update(.02,0,-1);
 assert.equal(g.motion.mia.crossed,true);t.reset();assert.equal(g.motion.yuki.crossed,false);assert.equal(g.motion.mia.y,0);
});
test('Mia crosses temporary slabs; Yuki falls safely',()=>{
 for(const hero of ['mia','yuki'] as const){const g=new Game(powerPuzzle),t=new HeroTeam(g,hero);g.stageSolved[0]=true;g.bridge.time=.8;g.player.x=-3.5;g.player.z=-2;
 for(let i=0;i<160;i++)t.update(.02,1,0);
 if(hero==='mia')assert.ok(g.player.x>9);else {assert.ok(g.motion.yuki.y<0);assert.equal(g.escaped,false);}
 }
});

test('safe lower floor returns through ramp and reset clears a midair handoff',()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,'yuki');g.stageSolved[0]=true;g.bridge.time=.8;g.player.x=-3.5;g.player.z=-2;
 for(let i=0;i<180;i++)t.update(.02,1,0);for(let i=0;i<80;i++)t.update(.02);
 assert.equal(g.motion.yuki.y,-3);assert.ok(g.events.includes('FALL_SAFE'));
 for(let i=0;i<128;i++)t.update(.02,0,1);
 for(let i=0;i<260;i++)t.update(.02,-1,0);
 assert.ok(g.player.x< -8);assert.equal(g.motion.yuki.y,0);assert.equal(g.stageSolved[0],true);
 g.player.x=-10;g.player.z=18.1;assert.equal(g.jump(),true);t.update(.2);t.select('mia');for(let i=0;i<50;i++)t.update(.02);
 assert.equal(t.actors.yuki.z,18.1);assert.equal(g.motion.yuki.y,0);t.reset();assert.equal(g.bridge.time,0);assert.equal(g.events.length,0);
});
test('both heroes have the same jump impulse and air speed with no double jump',()=>{
 const distances=[];for(const hero of ['yuki','mia'] as const){const g=new Game(),t=new HeroTeam(g,hero);g.player.x=0;g.player.z=2;g.jump();t.update(.01);const before=g.player.x;for(let i=0;i<25;i++){assert.equal(g.jump(),false);t.update(.02,1,0);}distances.push(g.player.x-before);}
 assert.ok(Math.abs(distances[0]-distances[1])<1e-6);
});

// Revised room boundary: no walkable-looking rear gallery behind the bridge.
test('near exit wall blocks rear gallery and keeps its only doorway gated',()=>{
 const g=new Game(powerPuzzle),z=g.layout.exitZ!;
 assert.ok(z> -8);assert.ok(g.layout.sockets[0].z>0);
 assert.equal(g.canMoveTo(3,z-1),false);assert.equal(g.canMoveTo(14,z-1),false);
 g.doorLift=4.6;assert.equal(g.canMoveTo(g.layout.exitCenterX!,z-2),true);
});
