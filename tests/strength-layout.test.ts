import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,canStand} from '../src/game.ts';
import {memoryPuzzle,volcanoLayout} from '../src/puzzles.ts';
test('Room 2 accepts any hero switch before the timed two-plate mission',()=>{const t=new Game(memoryPuzzle).training!;t.move(3,'mia');t.look(1);t.tick(30);assert.equal(t.step,'switch');assert.equal(t.docked,false);t.switched('yuki');assert.equal(t.step,'mission');t.emit('TAB_SWITCHED');assert.equal(t.step,'mission');t.tick(2.7);assert.equal(t.docked,false);t.tick(.6);assert.equal(t.docked,true);});
test('Room 2 exit geometry agrees with the offset doorway and distinct footprint',()=>{const g=new Game(memoryPuzzle),l=g.layout;assert.notEqual(l.halfWidth,volcanoLayout.halfWidth);assert.equal(canStand(-3.5,-10,false,.38,l),false);assert.equal(canStand(-3.5,-10,true,.38,l),true);assert.equal(canStand(0,-10,true,.38,l),false);for(const b of g.blocks)assert.ok(canStand(b.x,b.z,false,b.size/2,l));assert.notEqual(l.sockets[0].z,l.sockets[1].z);});
