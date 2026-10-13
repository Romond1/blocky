import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group} from 'three';
import {Game,canStand} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {fruitPuzzle} from '../src/puzzles.ts';
import {Economy,ECONOMY_SAVE_KEY} from '../src/economy.ts';
import {ROOM_COLLECTIBLES} from '../src/collectible-data.ts';
import {collectNearby} from '../src/collectibles.ts';
import {createCollectibleView} from '../src/collectible-view.ts';
import {navigable} from '../src/companions/companion.ts';

test('Room 5 hides a left-turning ground-floor passage beside PEAR without unlocking the main exit',()=>{
 const g=new Game(fruitPuzzle);assert.ok(g.memory);
 const route=[{x:10.8,z:-10},{x:10.8,z:-20.8},{x:8.1,z:-20.8},{x:1,z:-20.8},{x:1,z:-28.5}];
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.1);
  for(let j=0;j<=steps;j++){const p={x:a.x+(b.x-a.x)*j/steps,z:a.z+(b.z-a.z)*j/steps};assert.ok(canStand(p.x,p.z,false,.38,g.layout),JSON.stringify(p));assert.equal(g.transport!.ground(p,0),0);}
 }
 assert.equal(g.memory.canPass({x:10.8,z:-12},0),true);
 assert.equal(g.canMoveTo(10.8,-12),true);
 g.motion.yuki.y=5;assert.equal(g.canMoveTo(10.8,-12),false,'balcony rear rail remains closed');
});
for(const hero of ['yuki','mia'] as const)test(`${hero} opens only Luma's FOX gate without changing fruit matches or lift controls`,()=>{
 const g=new Game(fruitPuzzle),t=new HeroTeam(g,hero);assert.ok(g.memory);
 const plate=g.layout.sockets[5];assert.ok(plate);Object.assign(g.player,{x:plate.x,z:plate.z+1.8});
 for(const animal of ['WOLF','SPIDER','FOX']){
  if(g.placed[5]){const old=g.placed[5];g.player.z=plate.z+1.7;g.interact();assert.equal(g.carried,old);Object.assign(g.player,{x:animal==='SPIDER'?-4:2,z:-24});g.facing=0;g.interact();assert.equal(g.carried,undefined);assert.equal(old!.state,'floor');Object.assign(g.player,{x:plate.x,z:plate.z+1.8});g.facing=Math.PI;}
  const b=g.blocks.find(b=>b.text===animal)!;assert.ok(b);assert.equal(b.weightClass,'light');Object.assign(b,{state:'carried',carrier:hero,slot:undefined});
  g.interact();g.refreshDevices(.8);
  assert.equal(g.memory.solved,animal==='FOX');assert.deepEqual(g.fruit!.matches,[false,false,false]);assert.deepEqual(g.fruit!.controls,[false,false]);assert.equal(g.fruit!.lift.state,'DOWN');assert.equal(g.solved,false);assert.equal(g.doorLift,0);
 }
 assert.equal(g.memory.canPass({x:5.8,z:-30.6},0),true);assert.equal(g.slotLocked(5),false);
 // Retrieve FOX to close the optional gate while retaining the fruit puzzle state.
 const fox=g.blocks.find(b=>b.text==='FOX')!;Object.assign(fox,{state:'floor',slot:undefined,carrier:undefined});g.refreshDevices(.8);
 assert.equal(g.memory.solved,false);assert.equal(g.memory.canPass({x:5.8,z:-30.6},0),false);t.reset();assert.equal(g.memory.solved,false);
});
test('Luma crystal stays visible behind closed bars and persists separately from Kage',()=>{
 const store=new Map<string,string>(),storage={getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>{store.set(k,v);},removeItem:(k:string)=>{store.delete(k);}};
 const g=new Game(fruitPuzzle),e=new Economy(storage),view=createCollectibleView(new Group(),g,e);
 const c=ROOM_COLLECTIBLES.fruit.find(c=>c.type==='memoryCrystal');assert.ok(c);assert.equal(c.id,'room5_memory_crystal_luma');
 view.update(0,0);assert.equal(view.snapshot().find(entry=>entry.id===c.id)?.visible,true);Object.assign(g.player,c.position);
 assert.equal(collectNearby(g,e).some(entry=>entry.id===c.id),false);
 const fox=g.blocks.find(b=>b.text==='FOX')!;Object.assign(fox,{state:'socket',slot:5});g.refreshDevices(.8);
 assert.equal(collectNearby(g,e).some(entry=>entry.id===c.id),true);assert.equal(collectNearby(g,e).some(entry=>entry.id===c.id),false);
 assert.equal(new Economy(storage).has(c.id),true);assert.equal(e.has('room3_memory_crystal_kage'),false);assert.ok(store.has(ECONOMY_SAVE_KEY));g.reset();assert.equal(e.has(c.id),true);e.reset();assert.equal(new Economy(storage).memoryCrystalsCollected,0);
});
test('Luma optional plate cannot power the main door or toggle the elevator',()=>{
 const g=new Game(fruitPuzzle);assert.ok(g.memory);g.solved=true;g.conduitProgress=[1,1,1,0,0,0];assert.equal(g.doorPowered,true);
 const t=new HeroTeam(g);Object.assign(t.actors.yuki,g.layout.sockets[5]);g.refreshDevices(.5);assert.deepEqual(g.fruit!.controls,[false,false]);assert.equal(g.fruit!.lift.state,'DOWN');
 Object.assign(t.actors.yuki,{x:1,z:-24});g.doorLift=4.6;assert.equal(t.playerAtExit,false);
 assert.equal(navigable({x:5.8,z:-30.6},t.world()),false,'companions cannot pass closed bars');
});
