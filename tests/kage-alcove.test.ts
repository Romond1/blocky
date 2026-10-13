import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,canStand} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {powerPuzzle,cooperationPuzzle} from '../src/puzzles.ts';
import {Economy} from '../src/economy.ts';
import {collectNearby} from '../src/collectibles.ts';
import {ROOM_COLLECTIBLES} from '../src/collectible-data.ts';
import {createCollectibleView} from '../src/collectible-view.ts';
import {KAGE_ENTRANCE,KAGE_GATE} from '../src/kage-alcove.ts';
import {Group} from 'three';
import {navigable} from '../src/companions/companion.ts';

test('Room 4 starts in the right-hand court with safe, distinct heroes away from the plate',()=>{
 const g=new Game(cooperationPuzzle),t=new HeroTeam(g);assert.ok(g.player.x>=5);assert.ok(g.player.z<=23);
 assert.ok(Math.hypot(g.player.x+3,g.player.z-21)>5);assert.notDeepEqual(t.actors.yuki,t.actors.mia);
 assert.ok(canStand(g.player.x,g.player.z,false,.38,g.layout));
});
test('the left entrance reaches both corridor turns and the enlarged gallery before the main exit unlocks',()=>{
 const g=new Game(powerPuzzle);assert.ok(g.memory);
 assert.deepEqual(KAGE_ENTRANCE,{x:-17,z:-4.5});
 const route=[{x:-17,z:-3.2},{x:-17,z:-13.3},{x:-14.3,z:-13.3},{x:-14.3,z:-21.5},{x:-1,z:-21.5},{x:-1,z:-12.3}];
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.1);
  for(let step=0;step<=steps;step++){
   const p={x:a.x+(b.x-a.x)*step/steps,z:a.z+(b.z-a.z)*step/steps};
   assert.ok(canStand(p.x,p.z,false,.38,g.layout),`new secret route blocked at ${JSON.stringify(p)}`);
  }
 }
 assert.ok(canStand(-12,-26,false,.38,g.layout),'crystal chamber is supported');
});
test('the old right entrance is closed and the main exit and secret walls stay solid',()=>{
 const g=new Game(powerPuzzle);
 for(const p of [{x:16.4,z:-7},{x:16.4,z:-12.4},{x:13,z:-12.4}])assert.equal(canStand(p.x,p.z,false,.38,g.layout),false,JSON.stringify(p));
 assert.equal(canStand(12,-7,false,.38,g.layout),false);assert.equal(canStand(-14,-7,false,.38,g.layout),false);
 assert.equal(canStand(-15.5,-18,false,.38,g.layout),false);
});
test('the secret entrance permits both heroes immediately without an animation tick',()=>{
 for(const hero of ['yuki','mia'] as const){
  const g=new Game(powerPuzzle);new HeroTeam(g,hero);assert.ok(g.memory);
  assert.equal(g.memory.canPass({x:-17,z:-4.5},0),true,hero);
  assert.equal(g.canMoveTo(-17,-4.5),true,hero);
  g.refreshDevices(5);assert.equal(g.memory.canPass({x:-17,z:-4.5},0),true,`${hero}: entrance stays open while heroes are elsewhere`);
 }
});
test('all animal blocks spawn on the new gallery floor clear of walls and plates',()=>{
 const g=new Game(powerPuzzle),expected=[['WOLF',-10,-16.1],['FOX',-5,-15],['SPIDER',.1,-19.6]] as const;
 for(const [word,x,z] of expected){
  const block=g.blocks.find(b=>b.text===word)!;assert.ok(block);assert.deepEqual({x:block.x,z:block.z},{x,z});
  assert.ok(g.memory?.contains(block));assert.ok(canStand(block.x,block.z,false,block.size/2+.08,g.layout),word);
 }
});
test('the crystal gate blocks passage until WOLF opens it',()=>{
 const g=new Game(powerPuzzle);new HeroTeam(g);assert.ok(g.memory);
 assert.deepEqual({x:KAGE_GATE.x,z:KAGE_GATE.z,halfWidth:KAGE_GATE.halfWidth},{x:-12,z:-23.1,halfWidth:1.8});
 assert.equal(g.memory.canPass({x:-12,z:-23.1},0),false);
 Object.assign(g.player,{x:g.layout.sockets[2].x,z:g.layout.sockets[2].z+1.8});
 const wolf=g.blocks.find(b=>b.text==='WOLF')!;wolf.state='carried';wolf.carrier='yuki';g.interact();
 assert.equal(g.memory.solved,true);assert.equal(g.memory.canPass({x:-12,z:-23.1},0),false,'gate needs clearance before passage');
 g.update(.8);assert.equal(g.memory.canPass({x:-12,z:-23.1},0),true);
});
test('standing outside an unsolved crystal gate cannot trigger its safety lift',()=>{
 const g=new Game(powerPuzzle);assert.ok(g.memory);Object.assign(g.player,{x:KAGE_GATE.x,z:KAGE_GATE.z+.66});
 g.memory.tick(.8,g);assert.equal(g.memory.solved,false);assert.equal(g.memory.gateLift,0);
 assert.equal(g.memory.canPass({x:KAGE_GATE.x,z:KAGE_GATE.z},0),false);
});
test('removing WOLF keeps an already-open gate clear of a hero standing underneath',()=>{
 const g=new Game(powerPuzzle);assert.ok(g.memory);const wolf=g.blocks.find(b=>b.text==='WOLF')!;
 Object.assign(wolf,{state:'socket',slot:2});g.memory.tick(.8,g);assert.ok(g.memory.gateLift>2.8);
 Object.assign(g.player,{x:KAGE_GATE.x,z:KAGE_GATE.z});Object.assign(wolf,{state:'floor',slot:undefined});
 g.memory.tick(.8,g);assert.equal(g.memory.solved,false);assert.ok(g.memory.gateLift>=2.8);
 assert.equal(g.memory.canPass({x:KAGE_GATE.x,z:KAGE_GATE.z},0),true);
 Object.assign(g.player,{z:KAGE_GATE.z+1});g.memory.tick(.8,g);assert.equal(g.memory.gateLift,0);
});
test('a reunited companion can enter the gallery while the closed crystal gate stays blocked',()=>{
 const g=new Game(powerPuzzle),team=new HeroTeam(g);g.solved=true;
 Object.assign(team.actors.yuki,{x:-10,z:4});Object.assign(team.actors.mia,{x:-11,z:4});
 g.motion.yuki.crossed=true;g.motion.mia.crossed=true;assert.equal(team.reunited,true);
 assert.equal(navigable({x:-5,z:-16},team.world()),true,'gallery access must not be blocked by the main bank limit');
 assert.equal(navigable({x:-12,z:-23.1},team.world()),false,'companions respect the closed crystal gate');
});
test('visiting the secret gallery does not count as walking through the main team exit',()=>{
 const g=new Game(powerPuzzle),team=new HeroTeam(g);g.solved=true;g.doorLift=4.6;
 Object.assign(team.actors.yuki,{x:-14,z:-13.3});Object.assign(team.actors.mia,{x:-14.5,z:-6.7});
 g.motion.yuki.crossed=true;g.motion.mia.crossed=true;
 assert.equal(team.playerAtExit,false);assert.equal(team.companionAtExit,true);
 team.update(0);assert.equal(g.escaped,false);
});
test('solo game updates keep a solved secret-gallery visit inside the current room',()=>{
 const g=new Game(powerPuzzle);g.solved=true;g.doorLift=4.6;Object.assign(g.player,{x:-5,z:-16});
 g.update(0);assert.equal(g.escaped,false);
 Object.assign(g.player,{x:-14,z:-6.5});g.update(0);assert.equal(g.escaped,true,'the actual main exit still completes the room');
});
test('an unsolved memory crystal is visible behind the closed gate but cannot be collected',()=>{
 const g=new Game(powerPuzzle),e=new Economy(),root=new Group(),view=createCollectibleView(root,g,e);
 const crystal=ROOM_COLLECTIBLES.power.find(c=>c.type==='memoryCrystal')!;assert.ok(crystal);
 view.update(0,0);assert.equal(view.snapshot().find(c=>c.id===crystal.id)?.visible,true);
 assert.deepEqual(crystal.position,{x:-12,y:0,z:-26});
 Object.assign(g.player,crystal.position);assert.equal(collectNearby(g,e).some(c=>c.id===crystal.id),false);assert.equal(e.memoryCrystalsCollected,0);
 assert.equal(g.memory?.solved,false);assert.equal(g.memory?.gateLift,0);
 e.collect(crystal);view.update(0,0);assert.equal(view.snapshot().find(c=>c.id===crystal.id)?.visible,false);
});
for(const hero of ['yuki','mia'] as const)test(`${hero} solves only WOLF, collects a crystal once, and never changes main locks`,()=>{
 const g=new Game(powerPuzzle),team=new HeroTeam(g,hero),e=new Economy();assert.ok(g.memory);
 const slot=g.layout.sockets[2];assert.ok(slot);const crystal=ROOM_COLLECTIBLES.power.find(c=>c.type==='memoryCrystal');assert.ok(crystal);
 Object.assign(g.player,{x:slot.x,z:slot.z+1.8});
 for(const word of ['FOX','SPIDER','WOLF']){
  const old=g.placed[2];if(old){g.player.z=slot.z+1.7;g.interact();assert.equal(g.carried,old);Object.assign(g.player,{x:word==='SPIDER'?-8:0,z:-18});g.facing=0;g.interact();assert.equal(g.carried,undefined);assert.equal(old.state,'floor');Object.assign(g.player,{x:slot.x,z:slot.z+1.8});g.facing=Math.PI;}
  const block=g.blocks.find(b=>b.text===word)!;assert.ok(block);block.state='carried';block.carrier=hero;g.interact();team.update(1);
  assert.equal(g.memory.solved,word==='WOLF');assert.deepEqual(g.stageSolved,[false,false]);assert.equal(g.solved,false);
  if(word!=='WOLF'){Object.assign(g.player,crystal.position);assert.equal(collectNearby(g,e).some(c=>c.id===crystal.id),false);Object.assign(g.player,{x:slot.x,z:slot.z+1.8});}
 }
 team.update(1);Object.assign(g.player,crystal.position);assert.equal(collectNearby(g,e).some(c=>c.id===crystal.id),true);assert.equal(e.memoryCrystalsCollected,1);
 assert.equal(collectNearby(g,e).some(c=>c.id===crystal.id),false);team.reset();assert.equal(e.memoryCrystalsCollected,1);assert.equal(g.memory.solved,false);
 e.reset();assert.equal(e.memoryCrystalsCollected,0);
});
test('memory crystal does not contribute to main door conduits or lock the optional plate',()=>{
 const g=new Game(powerPuzzle);g.solved=true;g.conduitProgress=[1,1,0];assert.equal(g.doorPowered,true);assert.equal(g.slotLocked(2),false);
});
