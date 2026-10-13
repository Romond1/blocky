import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, canStand } from '../src/game.ts';

test('wrong answer remains retrievable; correct answer completes the first plate', () => {
  const game = new Game();
  game.player = { x: game.blocks[0].x, z: game.blocks[0].z };
  game.interact();
  assert.equal(game.carried?.text, 'A');
  game.player = { x: game.layout.sockets[0].x, z: game.layout.sockets[0].z+1.6 };
  game.interact();
  assert.equal(game.solved, false);
  assert.equal(game.socketBlock?.text, 'A');
  assert.match(game.message, /Try another block/);
  game.interact();
  assert.equal(game.carried?.text, 'A');
  game.player = { x: 0, z: 5 };game.facing=0;
  game.interact();assert.equal(game.carried,undefined);game.facing=Math.PI;
  game.player = { x: game.blocks[1].x, z: game.blocks[1].z+1.6 };
  game.interact();
  assert.equal(game.carried?.text, 'E');
  game.player = { x: game.layout.sockets[0].x, z: game.layout.sockets[0].z+1.6 };
  game.interact();
  assert.equal(game.heroWordSolved, true);assert.equal(game.solved,true);
  assert.equal(game.word, 'H E R O');
});

test('wall and locked gate block passage; opened gate permits only doorway', () => {
  assert.equal(canStand(0, -10, false), false);
  assert.equal(canStand(0, -10, true), true);
  assert.equal(canStand(3, -10, true), false);
  assert.equal(canStand(9, 0, true), false);
});

test('drop near a wall stays on accessible floor and reset restores all state', () => {
  const game = new Game();
  game.player = { x: game.blocks[1].x, z: game.blocks[1].z }; game.interact();
  game.player = { x: 5.3, z: 0 }; game.facing = Math.PI / 2; game.interact();
  const block = game.blocks.find(b => b.text === 'E')!;
  assert.equal(canStand(block.x, block.z, false, 0.55), true);
  game.solved = true; game.escaped = true; game.reset();
  assert.equal(game.solved, false); assert.equal(game.escaped, false);
  assert.equal(game.carried, undefined);
  assert.deepEqual(game.blocks.map(b => b.state), ['floor', 'floor', 'floor']);
});

