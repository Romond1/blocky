import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game,canStand} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heroPuzzle,memoryPuzzle,powerPuzzle} from '../src/puzzles.ts';
import {atTeamExit,distance,findRoute,navigable,roomInterests} from '../src/companions/companion.ts';

for(const puzzle of [heroPuzzle,memoryPuzzle,powerPuzzle])for(const selected of ['yuki','mia'] as const){
 test(`${puzzle.id}/${selected}: independent safe exploration, no puzzle writes, atomic switching`,()=>{
  const game=new Game(puzzle),team=new HeroTeam(game,selected),blocks=JSON.stringify(game.blocks),start={...team.actors[team.other]},states=new Set<string>();
  const other=team.other;let moved=0;
  for(let i=0;i<7200;i++){
   team.update(1/60);states.add(team.companion.state);
   const actor=team.actors[other];assert.ok(canStand(actor.x,actor.z,false,.45,game.layout));
   moved=Math.max(moved,distance(actor,start));
  }
  if(game.split){assert.equal(moved,0,'holds safely before tutorial jump');assert.ok(states.has('HOLD_POSITION'));}else{assert.ok(moved>2,'explores away from spawn');assert.ok(states.has('EXPLORE'));assert.ok(states.has('INSPECT'));}assert.equal(JSON.stringify(game.blocks),blocks);assert.equal(game.attempts,0);
  const old={...game.player},next={...team.actors[other]};assert.ok(team.select(other));assert.equal(game.player.x,next.x);assert.equal(game.player.z,next.z);assert.equal(team.actors[selected].x,old.x);
  const controlled={...game.player};team.update(1/60);assert.equal(game.player.x,controlled.x);assert.equal(game.player.z,controlled.z);assert.equal(team.companion.hero,selected);
  team.reset();assert.ok(distance(team.actors.yuki,team.actors.mia)>=1.5);
 });
 test(`${puzzle.id}/${selected}: both exit orders, open gate routing and transition`,()=>{
  for(const first of ['player','companion']){
   const game=new Game(puzzle),team=new HeroTeam(game,selected);game.solved=true;game.slotFeedback=()=> 'correct';game.conduitProgress=game.layout.sockets.map(()=>1);game.doorLift=game.layout.doorTravel;if(game.split){game.stageSolved=[true,true];game.motion.yuki.crossed=true;game.motion.mia.crossed=true;Object.assign(team.actors.yuki,{x:-10,z:12});Object.assign(team.actors.mia,{x:-12,z:12});}
   if(first==='player')Object.assign(game.player,{x:game.layout.exitCenterX??0,z:(game.layout.exitZ??-game.layout.halfDepth)-1.9});
   else Object.assign(team.actors[team.other],{x:(game.layout.exitCenterX??0)-.9,z:(game.layout.exitZ??-game.layout.halfDepth)-2});
   team.update(1/60);assert.equal(game.escaped,false,'one hero cannot leave alone');
   if(first==='companion') {for(let i=0;i<60;i++)team.update(1/60);assert.equal(team.companion.state,'WAIT_AT_EXIT');Object.assign(game.player,{x:(game.layout.exitCenterX??0)+.5,z:(game.layout.exitZ??-game.layout.halfDepth)-2});}
   for(let i=0;i<7200&&!game.escaped;i++)team.update(1/60);
   assert.ok(game.escaped,`team exit timed out: ${JSON.stringify({actor:team.actors[team.other],state:team.companion.state,path:team.companion.path})}`);
   assert.ok(atTeamExit(game.player,game.layout));assert.ok(atTeamExit(team.actors[team.other],game.layout));
  }
 });
}
test('switching retains held blocks with original hero and never places them',()=>{
 const game=new Game(),team=new HeroTeam(game);Object.assign(game.player,{x:game.blocks[1].x,z:game.blocks[1].z});team.interact();assert.equal(game.carried?.text,'E');
 const held=JSON.stringify(game.blocks);team.select('mia');assert.equal(game.carried,undefined);assert.equal(JSON.stringify(game.blocks),held);
 for(let i=0;i<120;i++)team.update(1/60);assert.equal(JSON.stringify(game.blocks),held);team.select('yuki');assert.equal(game.carried?.text,'E');
});
test('authored interest points avoid static geometry; route around Split Chamber pressure plates',()=>{
 for(const puzzle of [heroPuzzle,memoryPuzzle,powerPuzzle]){
  const team=new HeroTeam(new Game(puzzle));for(const p of roomInterests(puzzle.id)){assert.ok(canStand(p.x,p.z,false,.48,team.game.layout),p.name);}
 }
 const team=new HeroTeam(new Game(powerPuzzle));const path=findRoute({x:-10,z:12},{x:-14,z:-2},team.world());assert.ok(path.length>25);path.forEach(p=>assert.ok(navigable(p,team.world())));
});

test('blocked-route recovery is delayed, safe and off-camera only',()=>{
 const team=new HeroTeam(new Game());const npc=team.companion;const world=team.world();
 // Trap the companion with a temporary solid; recovery must not relocate the player or blocks.
 world.blocks=[...world.blocks,{x:npc.actor.x,z:npc.actor.z,halfSize:1.1}];world.visible=()=>true;
 for(let i=0;i<1800;i++)npc.update(1/60,world);assert.equal(npc.recoveries,0,'no visible popping');
 world.visible=()=>false;for(let i=0;i<1800;i++)npc.update(1/60,world);
 assert.ok(npc.recoveries>0);assert.ok(navigable(npc.actor,world));assert.ok(distance(npc.actor,world.player)>1);
});
test('far teammate catches up, event hooks react without hint access, plans stay bounded',()=>{
 const team=new HeroTeam(new Game(memoryPuzzle));Object.assign(team.game.player,{x:-8,z:-7.4});const states=new Set<string>();const events:string[]=[];
 const remove=team.companion.onEvent(e=>events.push(e));team.companion.emit('PLAYER_PICKED_UP_BLOCK');
 for(let i=0;i<3600;i++){team.update(1/60);states.add(team.companion.state);}
 assert.ok(states.has('CATCH_UP'));assert.ok(distance(team.game.player,team.actors[team.other])<14);assert.ok(team.companion.replans<80);
 assert.deepEqual(events,['PLAYER_PICKED_UP_BLOCK']);remove();
});

