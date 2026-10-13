import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group} from 'three';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {fruitPuzzle,sortingPuzzle} from '../src/puzzles.ts';
import {ROOM_COLLECTIBLES} from '../src/collectible-data.ts';
import {Economy} from '../src/economy.ts';
import {collectNearby} from '../src/collectibles.ts';
import {createCollectibleView} from '../src/collectible-view.ts';

test('Room 5 keeps the side-stair coin and adds four coins on the floor beneath the cabin',()=>{
 const coins=ROOM_COLLECTIBLES.fruit.filter(c=>c.type==='coin');assert.equal(coins.length,12);
 assert.deepEqual(coins.find(c=>c.id==='room5_coin_08')?.position,{x:12.5,y:-2.4,z:-1.5});
 const hidden=coins.filter(c=>c.position.y===-3);assert.equal(hidden.length,4);
 assert.ok(hidden.every(c=>c.position.x>6.5&&c.position.x<11.5&&Math.abs(c.position.z)<2.5));
});
for(const hero of ['yuki','mia'] as const)test(`${hero} can enter the lower path only when the lift is fully up`,()=>{
 const g=new Game(fruitPuzzle);new HeroTeam(g,hero);Object.assign(g.player,{x:12.2,z:-1.5});g.motion[hero].y=-2.4;
 const lift=g.fruit!.lift;
 for(const state of ['DOWN','MOVING_UP','MOVING_DOWN'] as const){lift.state=state;lift.y=state==='DOWN'?0:3;assert.equal(g.canMoveTo(11.7,-1.5),false,state);}
 lift.state='UP';lift.y=5;assert.equal(g.canMoveTo(11.7,-1.5),true);assert.equal(g.fruit!.ground({x:10.8,z:-1.5},-3),-3);
 Object.assign(g.player,{x:10.8,z:-1.5});g.motion[hero].y=-3;assert.equal(g.canMoveTo(9,-1.5),true);
 // Shared lift support in Room 6 retains its original shaft-side restrictions.
 const foundry=new Game(sortingPuzzle);foundry.sorting!.lift.state='UP';foundry.sorting!.lift.y=5;foundry.motion.yuki.y=-3;assert.equal(foundry.transport!.canMove({x:9,z:0},-3,true),false);
});
test('hidden coins render while the cabin is down but cannot be collected through it',()=>{
 const g=new Game(fruitPuzzle),e=new Economy(),view=createCollectibleView(new Group(),g,e);
 const coins=ROOM_COLLECTIBLES.fruit.filter(c=>c.type==='coin'&&c.position.y===-3);assert.equal(coins.length,4);
 view.update(0,0);assert.ok(coins.every(c=>view.snapshot().find(v=>v.id===c.id)?.visible));
 const coin=coins[0];Object.assign(g.player,coin.position);g.motion.yuki.y=-3;
 assert.equal(collectNearby(g,e).some(c=>c.id===coin.id),false);
 g.fruit!.lift.state='UP';g.fruit!.lift.y=5;assert.equal(collectNearby(g,e).some(c=>c.id===coin.id),true);
 assert.equal(collectNearby(g,e).some(c=>c.id===coin.id),false);
});
test('a descending cabin pauses before its underside touches a child and permits retreat',()=>{
 const g=new Game(fruitPuzzle),team=new HeroTeam(g),lift=g.fruit!.lift;lift.state='MOVING_DOWN';lift.y=5;
 Object.assign(g.player,{x:10.8,z:-1.5});g.motion.yuki.y=-3;
 for(let i=0;i<600;i++)lift.advance(1/60,[{...g.player,y:-3,grounded:true}],[]);
 assert.equal(lift.blocked,true);assert.ok(lift.y-.5>-3+2.8,'the underside stays above the head');
 assert.equal(g.canMoveTo(11,-1.5),true,'child already inside can retreat while lowering is paused');
 assert.equal(g.jump(),false,'a child cannot jump through the paused cabin underside');
 Object.assign(team.actors.yuki,{x:12.2,z:-1.5});lift.advance(1,[{...g.player,y:-2.4,grounded:true}],[]);assert.equal(lift.state,'DOWN');
});
