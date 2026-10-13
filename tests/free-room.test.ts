import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {volcanoLayout,memoryPuzzle,powerPuzzle} from '../src/puzzles.ts';
function pick(g:Game,id:number){const b=g.blocks[id];Object.assign(g.player,{x:b.x,z:b.z+1.5});g.interact();}
function place(g:Game,i:number){Object.assign(g.player,{x:g.layout.sockets[i].x,z:g.layout.sockets[i].z+1.6});g.interact();}
test('Mia can try HEAVY immediately and Yuki can lift it without any lessons',()=>{for(const hero of ['mia','yuki'] as const){const g=new Game(memoryPuzzle);new HeroTeam(g,hero);pick(g,3);assert.equal(g.action?.kind,hero==='mia'?'HEAVY_STRUGGLE':'HEAVY_LIFT');g.update(.5);assert.equal(!!g.carried,hero==='yuki');}});
test('heavy-first completion, wrong plates and rearrangement are unrestricted',()=>{const g=new Game(memoryPuzzle);new HeroTeam(g,'yuki');pick(g,3);g.update(.5);place(g,0);assert.equal(g.placed[0]?.text,'HEAVY');assert.equal(g.solved,false);g.interact();g.update(.5);place(g,1);assert.equal(g.training!.heavyActivated,true);assert.equal(g.solved,false);pick(g,1);place(g,0);assert.equal(g.solved,true);g.interact();assert.equal(g.carried?.text,'E');assert.equal(g.solved,false);place(g,0);assert.equal(g.solved,true);});
test('Room 2 size, block sizes and plates match requested layout',()=>{const g=new Game(memoryPuzzle);assert.ok(Math.abs(volcanoLayout.halfWidth*volcanoLayout.halfDepth/(5.8*7.8)-1.4)<1e-10);assert.equal(g.blocks[3].size,new Game(memoryPuzzle).blocks[3].size);assert.equal(g.blocks[3].size,new Game(powerPuzzle).blocks[0].size);assert.equal(g.blocks[0].size,new Game(memoryPuzzle).blocks[0].size);const[a,b]=g.layout.sockets;assert.notEqual(a.x,-b.x);assert.notEqual(a.z,b.z);assert.equal(g.layout.exitCenterX,-3.5);assert.ok(new Set(g.blocks.slice(0,3).map(b=>b.z)).size===3);});

