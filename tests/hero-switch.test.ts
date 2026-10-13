import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';

test('Mia covers exactly twice Yuki distance for identical player input',()=>{
 const distances=['yuki','mia'].map(id=>{const g=new Game();new HeroTeam(g,id as 'yuki'|'mia');const x=g.player.x;g.update(.1,1,0);return g.player.x-x;});
 assert.ok(Math.abs(distances[1]-distances[0]*2)<1e-10);
});
test('outgoing carrier stays at exact pose even after the door opens',()=>{
 const g=new Game(),t=new HeroTeam(g);Object.assign(g.player,{x:g.blocks[1].x,z:g.blocks[1].z});t.interact();const pose={...t.actors.yuki};t.select('mia');
 g.solved=true;g.slotFeedback=()=> 'correct';g.conduitProgress=g.layout.sockets.map(()=>1);g.doorLift=4;for(let i=0;i<600;i++)t.update(1/60);
 assert.deepEqual(t.actors.yuki,pose);assert.equal(t.companion.state,'HOLDING_OBJECT');
 t.select('yuki');assert.equal(g.carried?.text,'E');
});
import {HERO_ABILITIES,canHeroInteract} from '../src/heroes.ts';
import {powerPuzzle} from '../src/puzzles.ts';
import type {CompanionState} from '../src/companions/companion.ts';
test('explicit hold persists across ownership changes and releases cleanly',()=>{
 const t=new HeroTeam(new Game());t.holdPosition('yuki');t.select('mia');const pose={...t.actors.yuki};
 for(let i=0;i<600;i++)t.update(1/60);assert.deepEqual(t.actors.yuki,pose);assert.equal(t.companion.state,'HOLD_POSITION');
 t.select('yuki');t.select('mia');t.update(1);assert.deepEqual(t.actors.yuki,pose);
 t.releasePosition('yuki');for(let i=0;i<600;i++)t.update(1/60);assert.notDeepEqual(t.actors.yuki,pose);
});
test('all autonomous states hand off atomically without stale routes; tutorial fires once per switch',()=>{
 const states:CompanionState[]=['EXPLORE','INSPECT','WATCH_PLAYER','LOOSE_FOLLOW','CATCH_UP','GO_TO_EXIT','WAIT_AT_EXIT'];
 for(const state of states){const t=new HeroTeam(new Game());const events:unknown[]=[];t.onHeroSwitched(e=>events.push(e));t.companion.state=state;t.companion.path=[{x:4,z:4}];const poses=JSON.stringify(t.actors);
 t.select('mia');assert.equal(JSON.stringify(t.actors),poses);assert.deepEqual(t.companion.path,[]);assert.ok(t.ownershipValid);
 for(let i=0;i<100;i++){t.select(t.other);assert.ok(t.ownershipValid);}
 assert.equal(t.tutorial.switchCount,101);assert.equal(events.length,101);assert.ok(t.tutorial.hasSwitched);}
});
test('switching at the exit still requires both physical heroes',()=>{
 const t=new HeroTeam(new Game(powerPuzzle));t.game.solved=true;t.game.slotFeedback=()=> 'correct';t.game.conduitProgress=t.game.layout.sockets.map(()=>1);t.game.doorLift=4;t.game.stageSolved=[true,true];t.game.motion.yuki.crossed=true;t.game.motion.mia.crossed=true;Object.assign(t.actors.yuki,{x:-10,z:12});Object.assign(t.actors.mia,{x:-14,z:-6.5});t.select('mia');t.update(.1);assert.equal(t.game.escaped,false);
 for(let i=0;i<7200&&!t.game.escaped;i++)t.update(1/60);assert.ok(t.game.escaped);
});
test('strength capability and configurable movement are centralized',()=>{
 assert.ok(canHeroInteract('yuki',{requiredStrength:2}));assert.equal(canHeroInteract('mia',{requiredStrength:2}),false);assert.ok(canHeroInteract('mia',{}));
 const original=HERO_ABILITIES.mia.speedMultiplier;
 try{for(const multiplier of [1.75,2,2.25,2.5]){HERO_ABILITIES.mia.speedMultiplier=multiplier;const g=new Game();new HeroTeam(g,'mia');g.update(.1,1,0);assert.ok(Math.abs(g.player.x-.35*multiplier)<1e-10);}}
 finally{HERO_ABILITIES.mia.speedMultiplier=original;}
});
