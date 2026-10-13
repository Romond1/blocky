import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, canStand } from '../src/game.ts';
import { legacyMemoryPuzzle as memoryPuzzle, memoryLayout } from '../src/puzzles.ts';

function pick(game: Game, text: string) {
  const block = game.blocks.find(b => b.text === text)!;
  game.player = { x: block.x, z: block.z + 1.6 }; game.interact();
  assert.equal(game.carried?.text, text);
}
function place(game: Game, index: number) {
  const target = memoryLayout.sockets[index];
  game.player = { x: target.x, z: target.z + 1.7 }; game.interact();
}

test('no partial hints; full incorrect sequence rejects all three together', () => {
  const game = new Game(memoryPuzzle);
  pick(game, 'MEET LUMA'); place(game, 0);
  assert.equal(game.message, ''); assert.equal(game.rejectionTime, 0); assert.equal(game.attempts, 0);
  pick(game, 'SAVE KAGE'); place(game, 1);
  assert.equal(game.message, ''); assert.equal(game.attempts, 0);
  pick(game, 'MEET ARACHNE'); place(game, 2);
  assert.equal(game.solved, false); assert.equal(game.attempts, 1);
  assert.equal(game.message, 'THAT’S NOT HOW THE STORY HAPPENED...'); assert.equal(game.rejectionTime, 1.5);
  game.update(1.6); assert.equal(game.rejectionTime, 0); assert.equal(game.doorLift, 0);
});

test('wrong arrangement can be corrected after clearing occupied plates; confirmed chronology unlocks gate', () => {
  const game = new Game(memoryPuzzle);
  for (const [i, text] of ['MEET LUMA', 'SAVE KAGE', 'MEET ARACHNE'].entries()) { pick(game, text); place(game, i); }
  pick(game, 'MEET LUMA');game.player={x:0,z:7};game.facing=0;game.interact();assert.equal(game.carried,undefined);game.facing=Math.PI;
  pick(game, 'SAVE KAGE'); place(game, 0);assert.equal(game.solved,false);
  pick(game,'MEET LUMA');place(game, 1);
  assert.equal(game.solved, true); assert.equal(game.message, 'MEMORY RESTORED');
  assert.deepEqual(game.placed.map(b => b?.text), ['SAVE KAGE', 'MEET LUMA', 'MEET ARACHNE']);
  assert.equal(game.carried, undefined);
  game.update(6); assert.equal(game.doorLift, 7.8);
  game.reset(); assert.equal(game.solved, false); assert.equal(game.attempts, 0); assert.equal(game.rejectionTime, 0);
  assert.ok(game.placed.every(b => !b)); assert.equal(game.blocks.length, 8);
});

test('decoy letters carry, drop and occupy sockets but never solve the story', () => {
  const game = new Game(memoryPuzzle);
  pick(game, 'R'); place(game, 0); pick(game, 'A'); place(game, 1); pick(game, 'X'); place(game, 2);
  assert.equal(game.solved, false); assert.equal(game.rejectionTime, 1.5);
  pick(game, 'A'); game.player = { x: 0, z: 7 }; game.interact();
  assert.equal(game.carried, undefined); assert.equal(game.blocks.find(b => b.text === 'A')?.state, 'floor');
  game.interact(); assert.equal(game.carried?.text, 'A', 'a dropped decoy is immediately within pickup reach');
});

test('bigger room blocks walls, pedestals and closed exit; opens only the doorway', () => {
  const can = (x: number, z: number, open = false) => canStand(x, z, open, 0.38, memoryLayout);
  assert.equal(can(9, 12), true); assert.equal(can(12, 0), false);
  assert.equal(can(0, -16), false); assert.equal(can(0, -16, true), true);
  assert.equal(can(4, -16, true), false);
  for (const s of memoryLayout.sockets) assert.equal(can(s.x, s.z), false);
  const game = new Game(memoryPuzzle); pick(game, 'SAVE KAGE');
  game.player = { x: 11.3, z: 0 }; game.facing = Math.PI / 2; game.interact();
  const block = game.blocks.find(b => b.text === 'SAVE KAGE')!;
  assert.equal(block.state, 'carried', 'blocked forward placement keeps the cube in hand');
  game.facing=-Math.PI/2;game.interact();
  assert.equal(block.state, 'floor');assert.ok(block.x<game.player.x);assert.ok(Math.abs(block.z-game.player.z)<1e-8);assert.equal(canStand(block.x, block.z, false, 1.08, memoryLayout), true);
});
