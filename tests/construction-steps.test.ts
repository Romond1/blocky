import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {actionPuzzle} from '../src/puzzles.ts';
test('heavy block can settle against the ledge without extra invisible placement padding',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);
 Object.assign(g.player,{x:12,z:15.9});g.facing=Math.PI;
 const b=g.blocks[3];Object.assign(b,{state:'carried',carrier:'yuki'});
 t.interact();assert.equal(b.state,'floor');assert.ok(b.z-b.size/2>=13.2-1e-6);assert.ok(b.z<14.31);
 t.interact();for(let i=0;i<40;i++)t.update(1/60);assert.equal(b.state,'carried');
});

