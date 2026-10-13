import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,canStand} from '../src/game.ts';
import * as puzzles from '../src/puzzles.ts';
import {HeroTeam} from '../src/team.ts';
import {ABILITY_RECOVERY} from '../src/ability-layout.ts';
import {ROOM_COLLECTIBLES} from '../src/collectible-data.ts';
const setup=()=>{assert.ok(puzzles.abilityPuzzle,'Room 8 is registered');const g=new Game(puzzles.abilityPuzzle);const t=new HeroTeam(g,'mia');return {g,t,c:g.ability!};};
function release(g:Game,id:number){const c=g.ability!.machine(id);if(!c)return;c.tick(.3,true);c.angle=c.config.pickupPorts![0].angle-c.config.wordBlocks.indexOf(id)*Math.PI*2/c.config.wordBlocks.length;assert.equal(c.detach(id),true);}
function place(g:Game,word:string,slot:number){
 const weight=g.layout.sockets[slot].accepts;const introId=({18:17,19:18,0:0,20:19,21:20,1:1} as Record<number,number>)[slot];const b=(introId!==undefined&&g.blocks[introId].text===word?g.blocks[introId]:g.blocks.find(b=>b.text===word&&b.state==='floor'&&b.weightClass===weight))!;assert.ok(b,word);
 release(g,b.id);
 const previous={hero:g.controlledHero,player:g.player,facing:g.facing};
 const hero=b.weightClass==='heavy'?'yuki':g.controlledHero;g.controlledHero=hero;g.player=g.actors![hero];
 const s=g.layout.sockets[slot];Object.assign(g.player,{x:s.x,z:s.z+2.05});g.facing=Math.PI;
 Object.assign(b,{state:'carried',carrier:hero,slot:undefined});g.interact();assert.equal(g.placed[slot],b,g.message);
 g.controlledHero=previous.hero;g.player=previous.player;g.facing=previous.facing;
}
function solve(g:Game,panel:number){const d=g.ability!.sentences[panel];d.slots.forEach((s,i)=>place(g,d.answer[d.fixed+i],s));}

function intro(g:Game){solve(g,0);solve(g,1);Object.assign(g.player,g.layout.sockets[14]);g.refreshDevices(.7);}
test('Room 8 has six sentences, matching light introductory and main words, L-shaped solid boundary and nine coins/one shard',()=>{
 const {g,c}=setup();assert.equal(c.sentences.length,6);assert.equal(g.blocks[0].weightClass,'light');assert.equal(g.blocks[1].weightClass,'light');assert.equal(g.blocks[1].size,.95);for(const b of g.blocks.slice(2))assert.equal(b.weightClass,'light');
 assert.equal(canStand(-10,-10,false,.38,g.layout),false);assert.equal(canStand(-10,18,false,.38,g.layout),true);
 assert.equal(ROOM_COLLECTIBLES.ability.filter(c=>c.type==='coin').length,9);assert.equal(ROOM_COLLECTIBLES.ability.filter(c=>c.type==='heartShard').length,1);assert.equal(ROOM_COLLECTIBLES.ability.some(c=>c.type==='memoryCrystal'),false);
});
test('guided three-word examples activate independently; corner needs intentional hero plate',()=>{
 const {g,c}=setup();solve(g,1);assert.deepEqual(c.completed,[false,true,false,false,false,false]);solve(g,0);assert.equal(c.cornerOpen,false);
 Object.assign(g.player,g.layout.sockets[14]);g.refreshDevices(.7);assert.equal(c.cornerOpen,true);assert.equal(c.canPass({x:0,z:9.8}),true);
});
test('wrong ordered sentences stay retrievable and reverse completion preserves solved panels',()=>{
 const {g,c}=setup();intro(g);solve(g,3);assert.equal(c.completed[3],true);assert.equal(g.slotActive(2),true);
 for(const [word,s] of [['CAN',2],['MIA',3],['RUN',4]] as const)place(g,word,s);
 assert.equal(c.completed[2],false);assert.ok(g.rejectionTime>0);assert.equal(g.slotLocked(2),false);assert.equal(c.completed[3],true);
 for(const s of [2,3,4]){const b=g.placed[s]!;Object.assign(b,{state:'floor',slot:undefined,...g.layout.blockPositions[b.id]});}
 solve(g,2);assert.equal(c.buildOpen,true);solve(g,5);solve(g,4);assert.equal(g.solved,true);
 assert.deepEqual(c.completed,Array(6).fill(true));assert.equal(g.slotLocked(2),true);
});
test('lava, wall, excessive height and out-of-bounds recovery preserve solved sentences',()=>{
 const {g,c}=setup();intro(g);solve(g,2);const solved=g.placed[2];
 for(const point of [{x:19,z:4,y:-4},{x:-10,z:-10,y:0},{x:100,z:100,y:0},{x:10,z:0,y:20}]){
 const b=g.blocks.find(b=>b.state==='floor'&&b.text==='CAN')!;release(g,b.id);Object.assign(b,point);g.refreshDevices(.1);
 assert.deepEqual({x:b.x,z:b.z},ABILITY_RECOVERY[b.id<9?0:1]);assert.equal(g.placed[2],solved);assert.equal(c.completed[2],true);
 }
});
test('final sentences open the centered exit without extra plates and release a parked companion',()=>{
 const {g,t,c}=setup();intro(g);solve(g,2);solve(g,3);solve(g,4);assert.equal(g.solved,false);
 Object.assign(t.actors.mia,{x:18,z:-23});t.select('yuki');t.update(2);assert.equal(t.companion.state,'HOLD_POSITION');
 solve(g,5);assert.equal(g.solved,true);assert.equal(g.layout.exitCenterX,25);assert.equal(g.layout.sockets.length,22);
 for(let i=0;i<300;i++)t.update(1/60);assert.notEqual(t.companion.state,'HOLD_POSITION');
 Object.assign(t.actors.yuki,{x:25,z:-36});Object.assign(t.actors.mia,{x:25.8,z:-36});t.update(.01);assert.equal(g.escaped,true);
 t.reset();assert.equal(g.solved,false);assert.equal(g.ability!.exitOpen,false);
});

test('40 percent expansion leaves a full unit between familiar pads and ample staging distance',()=>{
 const {g,c}=setup();assert.equal(g.layout.halfWidth,33.599999999999994);assert.ok(Math.abs(g.layout.halfDepth-39.2)<1e-8);
 const a=g.layout.sockets[2],b=g.layout.sockets[3];assert.ok(b.x-a.x-2.3>1);
 assert.equal(g.blocks[2].size,.95);assert.ok(g.layout.optionalAreas!.some(a=>a.right===48));assert.ok(Math.hypot(g.blocks[2].x-a.x,g.blocks[2].z-a.z)>6);
 assert.equal(c.canPass({x:0,z:9.8}),false);assert.equal(c.canPass({x:14,z:-9.8}),false);
});
test('wrong hero/action variants never solve; cross-section words and halfway reset remain recoverable',()=>{
 for(const words of [['RUN','MIA','CAN'],['MIA','CAN','JUMP'],['MIA','RUN','CAN']]){
 const {g,t,c}=setup();intro(g);words.forEach((w,i)=>place(g,w,2+i));assert.equal(c.completed[2],false);assert.equal(g.solved,false);
 assert.ok([2,3,4].every(s=>!g.slotLocked(s)));
 t.reset();assert.equal(g.blocks.every(b=>b.state==='floor'),true);assert.deepEqual(g.ability!.completed,Array(6).fill(false));
 }
 const {g,t}=setup();intro(g);const b=g.blocks[4];Object.assign(b,{state:'carried',carrier:'mia'});Object.assign(g.player,{x:14,z:-3});
 for(let i=0;i<12;i++)t.select(t.other);assert.equal(b.carrier,'mia');assert.equal(b.state,'carried');assert.equal(t.ownershipValid,true);
 t.reset();assert.equal(g.carried,undefined);
});

test('parked Room 8 teammate walks to the new exit automatically after completion',()=>{
 const {g,t}=setup();intro(g);Object.assign(t.actors.mia,{x:25,z:-13.3});t.select('yuki');[2,3,4,5].forEach(i=>solve(g,i));
 Object.assign(g.player,{x:25,z:-36});for(let i=0;i<1200&&!g.escaped;i++)t.update(1/60);assert.equal(g.escaped,true);
});

test('recovery finds free floor space when its recovery pedestal is occupied',()=>{
 const {g,c}=setup();intro(g);const target=g.blocks[4],home=ABILITY_RECOVERY[0];
 release(g,target.id);
 const other=g.blocks[6];release(g,other.id);Object.assign(other,home,{y:0});Object.assign(target,{x:99,z:99,y:-4});g.refreshDevices(.1);
 assert.ok(Math.hypot(target.x-home.x,target.z-home.z)<7);assert.ok(g.blocks.every(b=>b===target||b.state==='carried'||Math.hypot(target.x-b.x,target.z-b.z)>1.05));assert.equal(c.completed[0],true);
});
test('both heroes can use the optional low jump route, and it never gates language completion',()=>{
 for(const hero of ['mia','yuki'] as const){const {g,t}=setup();intro(g);solve(g,2);solve(g,3);t.select(hero);const x=22*1.4;
 Object.assign(g.player,{x,z:-3*1.4});assert.equal(g.jump(),true);
 for(let i=0;i<17;i++)t.update(1/60,0,-1);for(let i=0;i<60;i++)t.update(1/60);
 assert.equal(g.motion[hero].y,.6);assert.equal(g.ability!.completed[4],false);
 }
});

test('corner gate is Room 4 cooperation: near hold, closes on departure, far hold and reunion latch',()=>{
 const {g,t,c}=setup();solve(g,0);solve(g,1);
 Object.assign(t.actors.mia,g.layout.sockets[14]);Object.assign(t.actors.yuki,{x:-14,z:20});
 for(let i=0;i<60;i++)g.refreshDevices(1/60);assert.ok(c.gateLift>2.8);
 Object.assign(t.actors.mia,{x:-9.8,z:9.8});for(let i=0;i<60;i++)g.refreshDevices(1/60);assert.equal(c.gateLift,0);
 Object.assign(t.actors.yuki,g.layout.sockets[15]);for(let i=0;i<60;i++)g.refreshDevices(1/60);assert.ok(c.gateLift>2.8);assert.equal(c.cornerJoined,false);
 Object.assign(t.actors.mia,{x:4,z:9.8});g.refreshDevices(1/60);assert.equal(c.cornerJoined,true);
 Object.assign(t.actors.yuki,{x:9,z:9.8});for(let i=0;i<60;i++)g.refreshDevices(1/60);assert.ok(c.gateLift>2.8);
});

test('intro has matching light words staged in front of each ordered, labeled plate',()=>{
 const {g,c}=setup();for(const panel of [0,1]){const d=c.sentences[panel];assert.equal(d.fixed,0);assert.equal(d.slots.length,3);
 const ids=panel===0?[17,18,0]:[19,20,1];ids.forEach((id,i)=>{const q=g.layout.sockets[d.slots[i]],b=g.blocks[id];assert.equal(b.text,d.answer[i]);assert.equal(b.size,.95);assert.ok(Math.abs(q.x-b.x)<.001);assert.ok(b.z>q.z);});}
 place(g,'MIA',18);assert.equal(c.completed[0],false);place(g,'CAN',19);assert.equal(c.completed[0],false);place(g,'RUN',0);assert.equal(c.completed[0],true);
});
test('the two sentence banks are separated by a broad floor gap rather than connected pads',()=>{
 const {g,c}=setup();const mia=c.sentences[2],yuki=c.sentences[3];assert.ok(yuki.x-mia.x>16);assert.notEqual(mia.z,yuki.z);
 const last=g.layout.sockets[4],first=g.layout.sockets[5];assert.ok(first.x-last.x-2.3>7);
 assert.equal(g.layout.sockets[1].accepts,'light');for(const i of [5,6,7,11,12,13])assert.equal(g.layout.sockets[i].accepts,'light');
});

test('switching away on an optional step holds that hero instead of completing movement autonomously',()=>{
 const {g,t}=setup();Object.assign(t.actors.mia,{x:22*1.4,z:-4*1.4});Object.assign(g.motion.mia,{y:.6,grounded:true});t.select('yuki');t.update(2);
 assert.equal(t.companion.state,'HOLD_POSITION');assert.equal(t.actors.mia.z,-4*1.4);
});

test('corner gate pauses above a crossing hero and closes after they clear it',()=>{
 const {g,t,c}=setup();intro(g);Object.assign(t.actors.yuki,{x:0,z:9.8});Object.assign(g.motion.yuki,{y:1,grounded:false});Object.assign(t.actors.mia,{x:-10,z:9.8});g.refreshDevices(1);
 assert.ok(c.gateLift>=3.7);Object.assign(t.actors.yuki,{x:4,z:9.8});g.refreshDevices(1);assert.equal(c.gateLift,0);
});
test('every Room 8 collectible has accessible support; walls cannot be climbed to bypass the corner',()=>{
 const {g,c}=setup();for(const item of ROOM_COLLECTIBLES.ability){const p=item.position;assert.equal(canStand(p.x,p.z,true,.38,g.layout,p.y),true,item.id);assert.equal(c.ground(p),p.y,item.id);}
 Object.assign(g.motion.mia,{y:20,grounded:false});assert.equal(g.canMoveTo(-10,-10),false);assert.equal(c.canMove({x:0,z:9.8},20),false);
});

test('secondary hero stays parked at either carousel opening and sentence station until the door opens',()=>{
 for(const p of [{x:18,z:-2},{x:32,z:-24},{x:40,z:-22},{x:-7,z:9.8},{x:-7,z:26}]){const {g,t}=setup();Object.assign(t.actors.mia,p);t.select('yuki');for(let i=0;i<600;i++)t.update(1/60);assert.deepEqual({x:t.actors.mia.x,z:t.actors.mia.z},p);assert.equal(t.companion.state,'HOLD_POSITION');}
});


test('first carousel gate lifts smoothly with success feedback and matching collision, then resets',()=>{
 const {g,c}=setup();intro(g);solve(g,2);assert.equal(c.buildOpen,false);assert.equal(c.buildLift,0);
 solve(g,3);assert.equal(c.buildOpen,true);assert.equal(c.buildLift,0);assert.ok(g.events.includes('ABILITY_GATE_UNLOCKED'));
 assert.equal(c.canPass({x:20,z:-9.8}),false);
 c.tick(.55,g);const first=c.buildLift;assert.ok(first>0&&first<2.5);assert.ok(c.buildCelebration>0);
 c.tick(.55,g);assert.ok(c.buildLift>first);assert.equal(c.canPass({x:20,z:-9.8}),true);
 c.tick(1.1,g);assert.equal(c.buildLift,5.2);c.tick(1,g);assert.equal(c.buildCelebration,0);
 g.reset();assert.equal(g.ability!.buildLift,0);assert.equal(g.ability!.buildOpen,false);
});
test('second carousel RUN and LIFT decoys use normal light cubes and never solve JUMP sentences',()=>{
 const {g,c}=setup();intro(g);solve(g,2);solve(g,3);
 const machine=c.carousels[1];assert.equal(machine.config.wordBlocks.length,8);
 for(const id of [15,16]){assert.ok(machine.attached.has(id));assert.equal(g.blocks[id].weightClass,'light');assert.equal(g.blocks[id].size,g.blocks[14].size);}
 place(g,'MIA',8);place(g,'CAN',9);place(g,'RUN',10);assert.equal(c.completed[4],false);
 const wrong=g.placed[10]!;Object.assign(wrong,{state:'floor',slot:undefined,x:39,z:-14});g.placed[10]=undefined;
 place(g,'LIFT',10);assert.equal(c.completed[4],false);assert.equal(c.exitOpen,false);
 g.reset();assert.ok(g.ability!.carousels[1].attached.has(15));assert.ok(g.ability!.carousels[1].attached.has(16));
});

test('wrong-word plate feedback starts immediately and persists only on mismatched occupied plates',()=>{
 const {g}=setup();place(g,'CAN',18);assert.equal(g.slotFeedback(18),'wrong');assert.equal(g.slotFeedback(19),'empty');
 g.refreshDevices(3);assert.equal(g.slotFeedback(18),'wrong');assert.equal(g.ability!.completed[0],false);
 const b=g.placed[18]!;Object.assign(b,{state:'floor',slot:undefined,x:-23.8,z:30});g.placed[18]=undefined;
 assert.equal(g.slotFeedback(18),'empty');place(g,'MIA',18);assert.equal(g.slotFeedback(18),'empty');
 place(g,'CAN',19);place(g,'RUN',0);for(const slot of [18,19,0])assert.equal(g.slotFeedback(slot),'correct');
 assert.equal(g.slotFeedback(14),'empty');
});
