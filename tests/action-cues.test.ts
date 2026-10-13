import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heroPuzzle,memoryPuzzle,powerPuzzle} from '../src/puzzles.ts';
import {actionCues,isHeroSwitchKey} from '../src/action-cues.ts';

test('Q and Tab switch heroes, without stealing unrelated keys',()=>{
 assert.ok(isHeroSwitchKey('KeyQ'));assert.ok(isHeroSwitchKey('Tab'));
 assert.equal(isHeroSwitchKey('KeyE'),false);assert.equal(isHeroSwitchKey('Space'),false);
});
test('a successful hero swap completes Room 2 onboarding regardless of input source',()=>{
 const game=new Game(memoryPuzzle),team=new HeroTeam(game,'mia');
 assert.equal(game.training!.setupComplete,false);
 team.select('yuki');
 assert.equal(game.training!.setupComplete,true);
 assert.equal(game.training!.step,'mission');
 assert.equal(actionCues(game).switchSuggested,false);
});
test('Room 1 introduces switching after move/look and stops after a swap',()=>{
 const game=new Game(heroPuzzle),team=new HeroTeam(game,'mia');
 assert.equal(actionCues(game).switchSuggested,false);
 game.training!.move(1,'mia');game.training!.look(.5);
 assert.equal(actionCues(game).switchSuggested,true);
 team.select('yuki');assert.equal(actionCues(game).switchSuggested,false);
});
test('nearby block and carrying state determine action button cue',()=>{
 const game=new Game(heroPuzzle);const block=game.blocks.find(b=>b.text==='E')!;
 Object.assign(game.player,{x:block.x,z:block.z+1.2});
 assert.equal(actionCues(game).actionLabel,'Pick up');
 assert.equal(actionCues(game).actionAvailable,true);
 game.interact();assert.ok(game.carried);
 assert.equal(actionCues(game).actionLabel,'Place');
});
test('Room 3 points back to the waiting hero after crossing the entrance gap',()=>{
 const game=new Game(powerPuzzle);new HeroTeam(game,'mia');
 assert.equal(actionCues(game).switchSuggested,false);
 game.motion.mia.crossed=true;
 assert.equal(actionCues(game).switchSuggested,true);
 game.motion.yuki.crossed=true;
 assert.equal(actionCues(game).switchSuggested,false);
});
