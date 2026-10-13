import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as puzzles from '../src/puzzles.ts';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';

test('Room 4 is registered with four letter-sized light color blocks',()=>{
 const puzzle=puzzles.cooperationPuzzle;
 assert.ok(puzzle,'cooperationPuzzle must exist');
 const game=new Game(puzzle);
 for(const word of ['RED','BLUE','GREEN','YELLOW']){
  const b=game.blocks.find(b=>b.text===word);assert.ok(b);assert.equal(b.weightClass,'light');assert.equal(b.requiredStrength,1);assert.equal(b.size,.95);
 }
});

test('presence plate holds survive switching in a shared room, then release on leaving',()=>{
 const layout={...puzzles.volcanoLayout,sockets:[{x:0,z:0,halfSize:1,acceptedActivator:'HERO'}]};
 const game=new Game({...puzzles.heroPuzzle,training:false,room:layout}),team=new HeroTeam(game,'yuki');
 Object.assign(team.actors.yuki,{x:0,z:0});
 team.select('mia');
 const waiting={...team.actors.yuki};
 for(let i=0;i<600;i++)team.update(1/60);
 assert.equal(team.companion.state,'HOLD_POSITION');assert.deepEqual(team.actors.yuki,waiting);
 team.select('yuki');Object.assign(game.player,{x:3,z:3});team.select('mia');
 for(let i=0;i<180;i++)team.update(1/60);
 assert.notEqual(team.companion.state,'HOLD_POSITION');
});

for(const first of ['yuki','mia'] as const)test(`cooperation handoff works with ${first} holding entrance plate`,()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,first);
 assert.ok(g.cooperation,'chamber rules must exist');
 Object.assign(t.actors[first],{x:-3,z:21});t.update(1);
 assert.ok(g.cooperation.gateLift>2.8);t.select(t.other);
 const waiting={...t.actors[first]};for(let i=0;i<120;i++)t.update(1/60);
 assert.deepEqual(t.actors[first],waiting);assert.equal(t.companion.state,'HOLD_POSITION');
 Object.assign(g.player,{x:3,z:11});t.update(.1);t.select(first);t.update(.6);
 Object.assign(g.player,{x:0,z:16});t.update(.1);assert.ok(g.cooperation.gateLift>2.8);
 Object.assign(g.player,{x:0,z:13});t.update(.1);
 assert.equal(g.stageSolved[0],true);assert.equal(g.cooperation.gateLift,4.8);
 for(let i=0;i<300;i++)t.update(1/60);
 assert.notEqual(t.companion.state,'HOLD_POSITION','unneeded plate releases');
});

test('solo hero cannot outrun a closing gate; gate waits above an occupied passage',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,'mia');assert.ok(g.cooperation);
 Object.assign(g.player,{x:-3,z:21});t.update(1);Object.assign(g.player,{x:0,z:19.8});t.update(.2);
 assert.ok(Math.abs(g.cooperation.gateLift-1.6)<1e-8);assert.equal(g.canMoveTo(0,15),false);
 g.cooperation.gateLift=4.8;Object.assign(g.player,{x:0,z:15});t.update(.3);
 assert.ok(g.cooperation.gateLift>=2.7,'no crushing');
 Object.assign(g.player,{x:0,z:13.8});t.update(.3);assert.equal(g.cooperation.gateLift,0);
});

test('hero plates ignore objects and airborne heroes; object plate ignores heroes',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);assert.ok(g.cooperation);
 Object.assign(g.blocks[0],{x:-3,z:21});t.update(1);assert.equal(g.cooperation.gateLift,0);
 Object.assign(g.player,{x:-3,z:21});g.jump();t.update(.1);assert.equal(g.cooperation.gateLift,0);
 Object.assign(g.player,{x:-5,z:6});t.update(1);assert.equal(g.cooperation.heavyActive,false);
});

test('timed bridge activates before reunion, permanently locks at return plate, needs both for section 2',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);assert.ok(g.cooperation);
 Object.assign(g.blocks[0],{state:'socket',slot:2,x:-5,z:6});t.update(1);assert.ok(g.bridge.extension>0);assert.equal(g.stageSolved[0],false);assert.equal(g.slotActive(2),true);
 Object.assign(t.actors.yuki,{x:-3,z:10});Object.assign(t.actors.mia,{x:3,z:10});t.update(.1);assert.equal(g.stageSolved[0],true);
 t.update(1);assert.ok(g.bridge.extension>0);
 Object.assign(t.actors.mia,{x:0,z:-12});t.update(.1);assert.equal(g.bridge.permanent,true);assert.equal(g.stageSolved[1],false);
 Object.assign(t.actors.yuki,{x:3,z:-11});t.update(.1);assert.equal(g.stageSolved[1],true);
 t.reset();assert.deepEqual(g.stageSolved,[false,false,false]);assert.equal(g.bridge.extension,0);assert.equal(g.cooperation.gateLift,0);
});

test('GREEN ON RED needs direct resting support inside the workshop',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);assert.ok(g.cooperation);g.stageSolved=[true,true,false];
 const red=g.blocks.find(b=>b.text==='RED')!,green=g.blocks.find(b=>b.text==='GREEN')!;
 Object.assign(red,{x:0,z:-21,y:0});Object.assign(green,{x:0,z:-21,y:.95,support:red.id});t.update(.1);
 assert.equal(g.solved,true);assert.equal(g.stageSolved[2],true);
});
for(const bad of ['reverse','beside','blue','floating','outside','carried'])test(`stack does not solve: ${bad}`,()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);assert.ok(g.cooperation);g.stageSolved=[true,true,false];
 const red=g.blocks[1],blue=g.blocks[2],green=g.blocks[3];Object.assign(red,{x:0,z:-21,y:0});Object.assign(green,{x:0,z:-21,y:.95,support:red.id});
 if(bad==='reverse'){Object.assign(green,{y:0,support:undefined});Object.assign(red,{y:.95,support:green.id});}
 if(bad==='beside')Object.assign(green,{x:2,y:0,support:undefined});
 if(bad==='blue'){Object.assign(blue,{x:0,z:-21,y:0});green.support=blue.id;red.x=3;}
 if(bad==='floating')green.support=undefined;
 if(bad==='outside'){green.z=red.z=8;}
 if(bad==='carried'){green.state='carried';green.carrier='yuki';}
 t.update(.1);assert.equal(g.solved,false);
});


test('E placement snaps either hero light block onto a nearby support; top remains retrievable',()=>{
 for(const hero of ['yuki','mia'] as const){
  const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,hero);g.stageSolved=[true,true,false];
  const red=g.blocks[1],green=g.blocks[3];Object.assign(red,{x:0,z:-21,y:0});Object.assign(green,{state:'carried',carrier:hero});
  Object.assign(g.player,{x:.2,z:-19});g.facing=Math.PI;t.interact();
  assert.equal(green.support,red.id);assert.equal(green.y,.95);assert.equal(green.state,'floor');assert.equal(g.solved,true);
  g.player.z=-19.3;g.facing=0;t.interact();assert.equal(green.state,'carried','top block is the accessible pickup');assert.equal(red.state,'floor');assert.equal(green.support,undefined);
 }
});

test('generic device holds survive Tab until device explicitly releases',()=>{
 const g=new Game(puzzles.memoryPuzzle),t=new HeroTeam(g,'yuki');
 g.requirePresence('dashboard','yuki');t.select('mia');const p={...t.actors.yuki};
 for(let i=0;i<300;i++)t.update(1/60);assert.deepEqual(t.actors.yuki,p);assert.equal(t.companion.state,'HOLD_POSITION');
 g.releasePresence('dashboard');for(let i=0;i<600;i++)t.update(1/60);assert.notDeepEqual(t.actors.yuki,p);
});

test('an autonomous companion never wanders onto a temporary bridge or falls during cycling',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,'yuki');g.stageSolved[0]=true;
 Object.assign(g.blocks[0],{state:'socket',slot:2,x:-5,z:6});Object.assign(g.player,{x:0,z:4});Object.assign(t.actors.mia,{x:3,z:5});
 for(let i=0;i<1800;i++){t.update(1/60);assert.ok(g.motion.mia.y>=0,'NPC remains on a safe bank');}
});

test('temporary slabs are excluded from autonomous navigation even while fully extended',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);g.stageSolved[0]=true;g.bridge.extension=1;
 assert.equal(t.world().canNavigate!({x:0,z:1.5}),false);
});

test('reset from the far exit respawns distinct heroes without stale bank restrictions',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,'yuki');Object.assign(t.actors.mia,{x:0,z:-28});
 t.reset();assert.ok(Math.hypot(t.actors.yuki.x-t.actors.mia.x,t.actors.yuki.z-t.actors.mia.z)>=1.5);
});

for(const hero of ['yuki','mia'] as const)test(`${hero} timed crossing uses existing speed; failure stays safe`,()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,hero);g.stageSolved[0]=true;
 Object.assign(g.blocks[0],{state:'socket',slot:2,x:-5,z:6});Object.assign(g.player,{x:0,z:3.5});Object.assign(t.actors[t.other],{x:3,z:7});g.bridge.time=.82;
 for(let i=0;i<230;i++)t.update(1/60,0,-1);
 if(hero==='mia'){assert.ok(g.player.z<-9.6);assert.equal(g.motion.mia.y,0);assert.ok(g.cooperation!.bridgeLocked);}
 else {assert.ok(g.player.z>-9);assert.equal(g.motion.yuki.y,-3);assert.equal(g.escaped,false);}
});

test('Room 4 keeps the final exit closed for one hero and completes when both arrive',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);g.stageSolved=[true,true,true];g.cooperation!.bridgeLocked=true;
 Object.assign(g.player,{x:0,z:-28});Object.assign(t.actors.mia,{x:4,z:-24});
 for(let i=0;i<400;i++){t.holdPosition('mia');t.update(1/60);}
 assert.ok(g.doorLift>2.8);assert.equal(g.escaped,false);t.releasePosition('mia');
 for(let i=0;i<1500&&!g.escaped;i++)t.update(1/60);
 assert.equal(g.escaped,true);
});


test('removing a tower support settles the remaining stack without scattering or overlap',async()=>{
 const {detachSupport}=await import('../src/block-stacking.ts');
 const g=new Game(puzzles.cooperationPuzzle),[red,blue,green]=[g.blocks[1],g.blocks[2],g.blocks[3]];
 Object.assign(red,{x:0,z:-21,y:0});Object.assign(green,{x:0,z:-21,y:.95,support:red.id});Object.assign(blue,{x:0,z:-21,y:1.9,support:green.id});
 detachSupport(red,g.blocks);red.state='carried';
 assert.equal(green.x,0);assert.equal(green.z,-21);assert.equal(green.y,0);assert.equal(green.support,undefined);
 assert.equal(blue.support,green.id);assert.equal(blue.y,.95);
});

test('a player-controlled hero leaving a generic presence device releases its hold',()=>{
 const g=new Game(puzzles.memoryPuzzle),t=new HeroTeam(g,'yuki');g.requirePresence('dashboard','yuki');
 Object.assign(g.player,{x:4,z:4});t.update(.1);t.select('mia');
 for(let i=0;i<300;i++)t.update(1/60);
 assert.notEqual(t.companion.state,'HOLD_POSITION');assert.equal(g.requiredDevices.has('dashboard'),false);
});

test('retracted slab storage is inside solid housing, not a misleading walkable platform',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);Object.assign(g.player,{x:-8,z:4});
 assert.equal(g.canMoveTo(-8,0),false);
});

test('a gate paused over a hero remains above their head throughout jumping',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);Object.assign(g.player,{x:0,z:15});g.cooperation!.gateLift=4.8;
 t.update(.2);assert.equal(g.cooperation!.gateLift,2.7);g.jump();
 let occupiedFrames=0;
 for(let i=0;i<60;i++){t.update(1/60);if(Math.abs(g.player.z-15)<.78-.001){occupiedFrames++;assert.ok(g.cooperation!.gateLift>=g.motion.yuki.y+2.7-1e-8,'occupied gate preserves head clearance');}}
 assert.equal(occupiedFrames,60);assert.equal(g.player.z,15,'jumping in place stays beneath the safely raised gate');
 for(let i=0;i<30;i++)t.update(1/60,0,-1);assert.ok(g.player.z<14,'explicit forward input clears the gate');
});

test('standing just outside a closed gate cannot reopen it through its safety sensor',()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g);Object.assign(g.player,{x:0,z:15.8});
 for(let i=0;i<60;i++)t.update(1/60);assert.equal(g.cooperation!.gateLift,0);assert.equal(g.canMoveTo(0,15.7),false);
});

for(const hero of ['yuki','mia'] as const)test(`${hero} can jump onto an empty object plate and walk off without activating it`,()=>{
 const g=new Game(puzzles.cooperationPuzzle),t=new HeroTeam(g,hero);g.stageSolved[0]=true;Object.assign(g.player,{x:-5,z:7.7});
 g.jump();for(let i=0;i<12;i++)t.update(1/60,0,-1);for(let i=0;i<60;i++)t.update(1/60);
 assert.equal(g.motion[hero].y,.2825);assert.equal(g.cooperation!.heavyActive,false);
 for(let i=0;i<60;i++)t.update(1/60,0,1);assert.ok(g.player.z>7.5);assert.equal(g.motion[hero].y,0);
});
