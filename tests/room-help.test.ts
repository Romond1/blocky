import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {powerPuzzle} from '../src/puzzles.ts';
import {nearHelpButton,TUTORIAL_GAP} from '../src/split-mechanics.ts';
import {helpFrame} from '../src/room-help.ts';
test('both wall buttons have local interaction range',()=>{
 assert.ok(nearHelpButton({x:-12,z:22.2}));assert.ok(nearHelpButton({x:-8,z:22.2}));
 assert.equal(nearHelpButton({x:-10,z:22.2}),false);assert.equal(nearHelpButton({x:-12,z:14}),false);
});
test('help sequences the locks, temporary bridge and door, then loops',()=>{
 assert.equal(helpFrame(0).first,false);assert.equal(helpFrame(3).extension,1);
 assert.equal(helpFrame(7.5).extension,0);assert.equal(helpFrame(9).second,false);
 assert.equal(helpFrame(10).second,true);assert.equal(helpFrame(10).door,0);
 assert.equal(helpFrame(14).door,1);assert.deepEqual(helpFrame(16),helpFrame(0));
});
for(const hero of ['yuki','mia'] as const)test(`${hero} can keep moving forward while jumping over the lava ditch`,()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,hero);
 for(let i=0;i<100;i++)t.update(.02,0,-1);
 assert.ok(g.player.z>=TUTORIAL_GAP.stop);assert.ok(g.jump());
 for(let i=0;i<60;i++)t.update(.02,0,-1);
 assert.ok(g.player.z<TUTORIAL_GAP.far);assert.ok(g.motion[hero].grounded);assert.ok(g.motion[hero].crossed);
});
test('a running jump launched early is not blocked in midair',()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,'yuki');g.player.z=18.4;
 assert.ok(g.jump());
 for(let i=0;i<32;i++)t.update(.02,0,-1);
 assert.ok(g.player.z<TUTORIAL_GAP.stop);assert.ok(g.motion.yuki.y>0);
});

for(const hero of ['yuki','mia'] as const)test(`${hero} retains forward and sideways steering throughout a ditch jump`,()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,hero);g.player.x=-10;g.player.z=17.1;
 g.jump();t.update(.1,0,-1);const z=g.player.z;
 t.update(.1,1,-1);assert.ok(g.player.x>-9.8);assert.ok(g.player.z<z-.2);
 const p={...g.player};t.update(.1,0,1);assert.ok(g.player.z>p.z+.2);
});
test('a short steered jump keeps the existing safe ditch retry rather than teleporting across',()=>{
 const g=new Game(powerPuzzle),t=new HeroTeam(g,'yuki');g.player.z=17.1;
 g.jump();for(let i=0;i<50;i++)t.update(.02,0,i<12?-1:0);assert.ok(Math.abs(g.player.z-16.83)<.001);assert.equal(g.motion.yuki.grounded,true);
 assert.ok(g.events.includes('JUMP_RETRY'));assert.equal(g.motion.yuki.crossed,false);
});
