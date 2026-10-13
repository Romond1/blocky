import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ROOM_COLLECTIBLES,allCollectibles,totalHeartShards} from '../src/collectible-data.ts';
import {collectNearby} from '../src/collectibles.ts';
import {Economy} from '../src/economy.ts';
import {Game,canStand} from '../src/game.ts';
import {heroPuzzle,memoryPuzzle,powerPuzzle,cooperationPuzzle,fruitPuzzle,sortingPuzzle} from '../src/puzzles.ts';
import {HeroTeam} from '../src/team.ts';
import {cooperationGround} from '../src/cooperation.ts';
import {ground} from '../src/split-mechanics.ts';

test('eight shard rooms and the finale coin registry have unique persistent identities',()=>{
 assert.equal(totalHeartShards,8);assert.equal(new Set(allCollectibles.map(c=>c.id)).size,allCollectibles.length);
 assert.deepEqual(Object.values(ROOM_COLLECTIBLES).map(cs=>cs.filter(c=>c.type==='coin').length),[12,10,9,9,5,6,7,8,12,9]);
 for(const [roomId,cs] of Object.entries(ROOM_COLLECTIBLES)){assert.equal(cs.filter(c=>c.type==='heartShard').length,roomId==='heart'||roomId==='dragon'?0:1);assert.ok(cs.every(c=>c.roomId===roomId));}
});
test('only controlled hero position collects, hero switching cannot award twice',()=>{
 const g=new Game(heroPuzzle),team=new HeroTeam(g,'yuki'),e=new Economy(),c=ROOM_COLLECTIBLES.hero[0];
 Object.assign(team.actors.mia,c.position);assert.equal(collectNearby(g,e).length,0);assert.equal(e.heroCoins,0);
 team.select('mia');assert.equal(collectNearby(g,e).length,1);assert.equal(e.heroCoins,1);
 team.select('yuki');team.select('mia');assert.equal(collectNearby(g,e).length,0);
 team.reset();assert.equal(e.heroCoins,1);assert.equal(e.has(c.id),true);
});
test('height separates upstairs, downstairs and recovery collectibles',()=>{
 const g=new Game(fruitPuzzle),e=new Economy(),c=ROOM_COLLECTIBLES.fruit.find(c=>c.position.y===5)!;
 Object.assign(g.player,c.position);assert.equal(collectNearby(g,e).some(x=>x.id===c.id),false);
 g.motion[g.controlledHero].y=5;assert.equal(collectNearby(g,e).some(x=>x.id===c.id),true);
});
test('exit shards unlock with the door and never gate room progression',()=>{
 for(const puzzle of [heroPuzzle,memoryPuzzle,powerPuzzle,cooperationPuzzle,fruitPuzzle,sortingPuzzle]){
  const g=new Game(puzzle),e=new Economy(),c=ROOM_COLLECTIBLES[puzzle.id].find(c=>c.type==='heartShard')!;
  Object.assign(g.player,c.position);assert.equal(collectNearby(g,e).some(x=>x.id===c.id),false);
  g.solved=true;g.doorLift=3;assert.equal(collectNearby(g,e).some(x=>x.id===c.id),true);assert.equal(e.heartShardsCollected,1);
  assert.equal(c.position.x,g.layout.exitCenterX??0);assert.ok(Math.abs(c.position.z-(g.layout.exitZ??-g.layout.halfDepth))<1);
 }
});
test('every placement is on accessible room support without wall clipping',()=>{
 for(const puzzle of [heroPuzzle,memoryPuzzle,powerPuzzle,cooperationPuzzle,fruitPuzzle,sortingPuzzle]){
  const g=new Game(puzzle);g.bridge.extension=1;if(g.sorting)g.sorting.bridgeExtension=1;
  for(const c of ROOM_COLLECTIBLES[puzzle.id]){
   if(c.access==='raisedFruitLift'){g.fruit!.lift.state='UP';g.fruit!.lift.y=5;}
   const p=c.position;assert.equal(canStand(p.x,p.z,true,.38,g.layout,p.y),true,c.id);
   const floor=g.transport?g.transport.ground(p,p.y):g.cooperation?cooperationGround(p,1,p.y<-.4):g.split?(g.memory?.contains(p)?0:ground(p,g.bridge,p.y<-.4)):0;
   assert.equal(floor,p.y,c.id+' support');
   if(g.transport)assert.equal(g.transport.canMove(p,p.y,true),true,c.id+' walkable support');
  }
 }
});
test('all team exits work with zero coins and zero shards',()=>{
 for(const puzzle of [heroPuzzle,memoryPuzzle,powerPuzzle,cooperationPuzzle,fruitPuzzle,sortingPuzzle]){
  const g=new Game(puzzle),team=new HeroTeam(g),e=new Economy();g.solved=true;g.doorLift=g.layout.doorTravel;
  const x=g.layout.exitCenterX??0,z=(g.layout.exitZ??-g.layout.halfDepth)-2;
  Object.assign(team.actors.yuki,{x,z});Object.assign(team.actors.mia,{x:x+.5,z});
  assert.equal(team.playerAtExit,true,puzzle.id);assert.equal(team.companionAtExit,true,puzzle.id);
  assert.equal(e.heroCoins,0);assert.equal(e.heartShardsCollected,0);
 }
});
