import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import * as puzzles from '../src/puzzles.ts';

const setup=()=>{assert.ok(puzzles.sortingPuzzle,'Room 6 must be registered');const g=new Game(puzzles.sortingPuzzle),t=new HeroTeam(g,'yuki');return {g,t};};
const tick=(t:HeroTeam,s:number)=>{for(let i=0;i<s*60;i++)t.update(1/60);};
function place(g:Game,word:string,slot:number){const b=g.blocks.find(b=>b.text===word)!;Object.assign(b,{state:'carried',carrier:g.controlledHero,slot:undefined});const q=g.layout.sockets[slot];Object.assign(g.player,{x:q.x,z:q.z+1.8});g.motion[g.controlledHero].y=0;g.interact();return b;}
function clearPlate(g:Game,slot:number,parkingX:number){
 const old=g.placed[slot],q=g.layout.sockets[slot];assert.ok(old);
 Object.assign(g.player,{x:q.x,z:q.z+1.7});g.facing=Math.PI;g.interact();assert.equal(g.carried,old);
 Object.assign(g.player,{x:parkingX,z:-12});g.facing=0;g.interact();assert.equal(g.carried,undefined);g.facing=Math.PI;
}

test('foundry has nine light words distributed across both levels and one heavy boulder',()=>{
 const {g}=setup();assert.equal(g.blocks.length,10);assert.equal(g.blocks.filter(b=>b.weightClass==='heavy').length,1);
 for(const b of g.blocks.filter(b=>b.text!=='HEAVY')){assert.equal(b.size,.95);assert.equal(b.weightClass,'light');assert.equal(b.requiredStrength,1);}
 assert.ok(g.blocks.some(b=>b.y===5));assert.ok(g.blocks.some(b=>b.y===0));
});
test('ordered pairs solve independently, decoys and reversed words fail safely',()=>{
 const {g}=setup();place(g,'GREEN',2);place(g,'PEAR',3);assert.equal(g.slotFeedback(2),'correct');
 place(g,'APPLE',0);place(g,'RED',1);assert.equal(g.slotFeedback(0),'wrong');assert.equal(g.slotFeedback(2),'correct');
 clearPlate(g,0,-8);place(g,'BLUE',0);assert.equal(g.solved,false);
 clearPlate(g,0,-5);clearPlate(g,1,-2);place(g,'RED',0);place(g,'APPLE',1);place(g,'YELLOW',4);place(g,'BANANA',5);
 assert.equal(g.solved,true);assert.equal(g.slotLocked(0),false);assert.ok(g.events.includes('SORTING_COMPLETE'));
});
for(const [color,fruit,station] of [['GREEN','APPLE',0],['RED','PEAR',0],['BLUE','APPLE',0],['YELLOW','PEAR',2],['RED','BANANA',0],['APPLE','RED',0]] as const)test(`wrong combination ${color} ${fruit} remains removable`,()=>{
 const {g}=setup();place(g,color,station*2);place(g,fruit,station*2+1);assert.equal(g.solved,false);assert.equal(g.slotFeedback(station*2),'wrong');assert.equal(g.slotLocked(station*2),false);assert.ok(g.rejectionTime>0);
});
test('removing a correct word clears only its pair and closes its energy branch',()=>{
 const {g,t}=setup();for(const [word,slot] of [['RED',0],['APPLE',1],['GREEN',2],['PEAR',3],['YELLOW',4],['BANANA',5]] as const)place(g,word,slot);
 tick(t,5);assert.equal(g.doorPowered,true);Object.assign(g.player,{x:g.blocks.find(b=>b.text==='RED')!.x,z:-17.5});g.interact();g.refreshDevices();
 assert.equal(g.carried?.text,'RED');assert.equal(g.solved,false);assert.equal(g.slotFeedback(2),'correct');tick(t,.1);assert.equal(g.conduitProgress[0],0);
});
test('six correct sockets charge and fully open the door without activating lift controls',()=>{
 const {g,t}=setup();for(const [word,slot] of [['RED',0],['APPLE',1],['GREEN',2],['PEAR',3],['YELLOW',4],['BANANA',5]] as const)place(g,word,slot);
 tick(t,5);assert.equal(g.doorPowered,true);assert.equal(g.doorLift,g.layout.doorTravel);
});
test('heavy plate starts existing bridge cycle without solving the final puzzle',()=>{
 const {g,t}=setup();place(g,'HEAVY',6);tick(t,1);assert.ok(g.bridge.extension>.98);assert.equal(g.solved,false);
 Object.assign(g.player,{x:5,z:14});tick(t,.05);assert.equal(g.sorting!.bridgeLocked,true);assert.equal(g.bridge.permanent,true);
});
test('Mia struggles with the boulder and cannot carry it',()=>{
 const {g,t}=setup();t.select('mia');const b=g.blocks[0];Object.assign(g.player,{x:b.x,z:b.z+2});g.interact();assert.equal(g.action?.kind,'HEAVY_STRUGGLE');tick(t,4);assert.equal(b.state,'floor');
});
test('fall and Tab preserve progress and both physical hero positions',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:-3,z:14});tick(t,.1);const p={...g.player};t.select('mia');tick(t,1);assert.equal(g.motion.yuki.y,-3);assert.equal(t.actors.yuki.x,p.x);assert.equal(t.actors.yuki.z,p.z);assert.equal(g.escaped,false);
 assert.equal(g.sorting!.ground({x:-9,z:25},-3),0);assert.equal(g.sorting!.ground({x:-4,z:25},-3),-3);
});
test('lift transports two heroes and five words with occupancy-edge controls',()=>{
 const {g,t}=setup();Object.assign(t.actors.yuki,{x:8,z:0});Object.assign(t.actors.mia,{x:10,z:0});
 const cargo=g.blocks.slice(1,6);cargo.forEach((b,i)=>Object.assign(b,{x:8+i%3,z:-1+Math.floor(i/3),y:0,state:'floor'}));
 g.sorting!.lift.activate([true,false]);tick(t,4.2);assert.equal(g.sorting!.lift.state,'UP');assert.equal(g.motion.yuki.y,5);assert.equal(g.motion.mia.y,5);for(const b of cargo)assert.equal(b.y,5);
 assert.equal(t.companion.state,'HOLD_POSITION');t.select('mia');assert.equal(g.motion.mia.y,5);
});
test('companion cannot traverse temporary slabs or trigger controls and cannot teleport',()=>{
 const {g,t}=setup();assert.equal(t.world().canNavigate!({x:-3,z:14}),false);assert.equal(t.world().canNavigate!({x:5,z:1}),false);assert.equal(t.world(undefined,()=>false).visible,undefined);
});
test('reset during travel and partial sorting restores every machine and word',()=>{
 const {g,t}=setup();place(g,'GREEN',2);place(g,'PEAR',3);g.sorting!.lift.activate([true]);tick(t,1);t.reset();
 assert.equal(g.sorting!.lift.y,0);assert.equal(g.sorting!.lift.state,'DOWN');assert.equal(g.bridge.extension,0);assert.equal(g.sorting!.bridgeLocked,false);assert.equal(g.solved,false);assert.equal(g.placed.filter(Boolean).length,0);assert.deepEqual(g.blocks.map(b=>({x:b.x,z:b.z,y:b.y})),g.layout.blockPositions);
});
test('upstairs or separated teammate cannot satisfy the downstairs exit',()=>{
 const {g,t}=setup();g.solved=true;g.doorLift=4.6;Object.assign(g.player,{x:-12,z:-30});Object.assign(t.actors.mia,{x:9,z:-5});g.motion.mia.y=5;
 assert.equal(t.companionAtExit,false);tick(t,3);assert.equal(g.escaped,false);assert.equal(g.motion.mia.y,5);
});
for(const hero of ['yuki','mia'] as const)test(`${hero} uses the unchanged timed slabs; Mia crosses while Yuki falls safely`,()=>{
 const {g,t}=setup();t.select(hero);place(g,'HEAVY',6);Object.assign(g.player,{x:-10,z:14});g.bridge.time=.85;g.bridge.update(0,true,false);
 for(let i=0;i<2.9*60;i++)t.update(1/60,1,0);
 if(hero==='mia'){assert.ok(g.player.x>3.5);assert.equal(g.motion[hero].y,0);}else {assert.ok(g.player.x<3);tick(t,1);assert.equal(g.motion[hero].y,-3);}
});
test('Tab with a carried word on a moving slab retains its carrier through the fall',()=>{
 const {g,t}=setup();const b=g.blocks[1];Object.assign(b,{state:'carried',carrier:'yuki'});Object.assign(g.player,{x:-3,z:14});t.update(.1);t.select('mia');tick(t,2);
 assert.equal(b.carrier,'yuki');assert.equal(b.state,'carried');assert.equal(g.motion.yuki.y,-3);assert.equal(t.ownershipValid,true);
});
test('words placed on the recovery floor remain reachable and can be carried back up',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:-3,z:20});g.motion.yuki.y=-3;const b=g.blocks[1];Object.assign(b,{state:'carried',carrier:'yuki'});g.facing=0;g.interact();assert.equal(b.state,'floor');assert.equal(b.y,-3);
 Object.assign(g.player,{x:b.x,z:b.z-1.5});g.interact();assert.equal(g.carried?.id,b.id);Object.assign(g.player,{x:-4.05,z:25});tick(t,.05);
 for(let i=0;i<2*60;i++)t.update(1/60,-1,0);assert.equal(g.motion.yuki.y,0);assert.equal(b.carrier,'yuki');
});
test('upper-edge placement retains cargo when blocked and drops safely when turned toward support',()=>{
 const {g}=setup();Object.assign(g.player,{x:14,z:-3});g.motion.yuki.y=5;g.facing=0;const b=g.blocks[1];Object.assign(b,{state:'carried',carrier:'yuki'});g.interact();assert.equal(b.state,'carried');g.facing=Math.PI;g.interact();assert.equal(b.state,'floor');assert.equal(b.y,5);assert.equal(g.sorting!.ground(b,5),5);
});
test('many E placements on the cabin keep every word supported without overlap',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:9,z:0});let placed=0;
 for(const [i,b] of g.blocks.slice(1,6).entries()){g.facing=i*2*Math.PI/5;Object.assign(b,{state:'carried',carrier:'yuki'});g.interact();assert.equal(b.state,'floor');placed++;assert.ok(g.sorting!.lift.contains(b,b.size/2));}
 assert.equal(placed,5);const cargo=g.blocks.filter(b=>b.state==='floor'&&g.sorting!.lift.contains(b));
 for(const a of cargo)for(const b of cargo)if(a.id!==b.id)assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.95);
 g.sorting!.lift.activate([true]);tick(t,4.2);for(const b of cargo)assert.equal(b.y,5);
});
test('standing and repeated lift control entries do not oscillate or queue commands',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:5,z:1});tick(t,1);
 for(let i=0;i<4;i++){Object.assign(g.player,{x:5,z:3.3});t.update(.01);Object.assign(g.player,{x:5,z:1});t.update(.01);}
 tick(t,8);assert.equal(g.sorting!.lift.state,'UP');t.select('mia');tick(t,8);assert.equal(g.sorting!.lift.state,'UP');assert.equal(t.companion.state,'HOLD_POSITION');
});
test('switching during cabin travel preserves both rider motion and carried words',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:9,z:0});const b=g.blocks[1];Object.assign(b,{state:'carried',carrier:'yuki'});Object.assign(t.actors.mia,{x:5,z:1});tick(t,1);t.select('mia');tick(t,4);
 assert.equal(g.motion.yuki.y,5);assert.equal(b.carrier,'yuki');assert.equal(b.state,'carried');assert.equal(t.companion.state,'HOLD_POSITION');
});
test('foundry reset at every lift phase restores occupancy history and no rider state survives',()=>{
 for(const seconds of [.2,1.8,3.8,4.2]){const {g,t}=setup();Object.assign(g.player,{x:9,z:0});Object.assign(t.actors.mia,{x:5,z:1});tick(t,seconds);t.reset();assert.equal(g.sorting!.lift.state,'DOWN');assert.equal(g.motion.yuki.y,0);assert.equal(g.motion.mia.y,0);assert.equal(g.requiredDevices.size,0);assert.equal(g.bridge.time,0);}
});
test('closed gallery rails and absent lift prevent bypassing word transport',()=>{
 const {g}=setup();Object.assign(g.player,{x:9,z:-3.1});g.motion.yuki.y=5;assert.equal(g.canMoveTo(9,-2.4),false);g.jump();assert.equal(g.canMoveTo(9,-2.4),false);assert.equal(g.canMoveTo(4,-2),false);
});
test('removing a pair pauses door closure above a hero and permits a safe retreat',()=>{
 const {g,t}=setup();for(const [word,slot] of [['RED',0],['APPLE',1],['GREEN',2],['PEAR',3],['YELLOW',4],['BANANA',5]] as const)place(g,word,slot);tick(t,5);
 Object.assign(t.actors.mia,{x:-12,z:-28});Object.assign(g.player,{x:-9.25,z:-17.5});g.interact();t.select('mia');tick(t,2);assert.ok(g.doorLift>=2.9);assert.equal(g.canMoveTo(-12,-27.95),true);
});
