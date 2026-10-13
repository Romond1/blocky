import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {actionPuzzle} from '../src/puzzles.ts';
const setup=(hero:'yuki'|'mia'='yuki')=>{const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);return {g,t};};
const tick=(t:HeroTeam,s:number,dx=0,dz=0)=>{for(let i=0;i<Math.ceil(s*60);i++)t.update(1/60,dx,dz);};
test('all three light words exist initially; construction uses one large and three small pieces',()=>{
 const {g}=setup();for(const b of g.blocks.slice(0,3)){assert.ok(g.actionChamber!.blockVisible(b.id));assert.equal(b.y,g.layout.blockPositions[b.id].y);assert.equal(b.weightClass,'light');assert.equal(b.requiredStrength,1);}
 assert.deepEqual(g.blocks.slice(3).map(b=>b.weightClass),['heavy','light','light','light']);
 assert.ok(g.blocks[2].y!>3);
});
for(const hero of ['yuki','mia'] as const)test(`${hero} fights continuous conveyor using actual movement`,()=>{
 const {g,t}=setup(hero);Object.assign(g.player,{x:-10,z:21});tick(t,2,0,-1);
 if(hero==='yuki')assert.ok(g.player.z>=21);else assert.ok(g.player.z>17&&g.player.z<19);
 Object.assign(g.player,{z:18});const before=g.player.z;tick(t,.4);assert.ok(g.player.z>before+1.5);
});
test('Yuki jumping cannot beat belt; switched companion rides backward without fighting',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:-10,z:18});g.jump();tick(t,.6,0,-1);assert.ok(g.player.z>=18);
 t.select('mia');tick(t,1);assert.equal(t.companion.state,'HOLD_POSITION');assert.ok(t.actors.yuki.z>21);assert.ok(t.ownershipValid);
});
test('physical pickup alone marks collection; standing at summit does not',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:1.3,z:12.2});Object.assign(g.motion.yuki,{y:4.75,grounded:true});tick(t,.1);
 assert.equal(g.actionChamber!.earned[1],false);t.interact();assert.equal(g.carried?.text,'JUMP');assert.equal(g.actionChamber!.earned[1],true);
 t.reset();assert.deepEqual(g.actionChamber!.earned,[false,false,false]);assert.equal(g.blocks[1].y,4.75);
});
test('LIFT ledge blocks floor approach and normal jump',()=>{
 const {g,t}=setup();Object.assign(g.player,{x:12,z:14.6});assert.equal(g.canMoveTo(12,12),false);
 g.jump();tick(t,.7,0,-1);assert.ok(g.player.z>13.4);assert.equal(g.actionChamber!.earned[2],false);
});

test('construction pieces keep heavy/light ability rules for both heroes',()=>{
 for(const hero of ['yuki','mia'] as const){
  const {g,t}=setup(hero);Object.assign(g.player,{x:10,z:23});g.facing=Math.PI;t.interact();tick(t,1);
  assert.equal(g.blocks[3].state,hero==='yuki'?'carried':'floor');
  t.reset();Object.assign(g.player,{x:g.blocks[5].x,z:g.blocks[5].z+1.4});g.facing=Math.PI;t.interact();assert.equal(g.blocks[5].state,'carried');
 }
});
test('standing on a construction block cannot pick it up to fly',()=>{
 const {g,t}=setup();const b=g.blocks[5];Object.assign(g.player,{x:b.x,z:b.z});Object.assign(g.motion.yuki,{y:b.size,grounded:true});t.interact();
 assert.equal(b.state,'floor');assert.equal(g.action,null);
});
test('out-of-bounds construction recovers its support chain without clearing collection',()=>{
 const {g,t}=setup();g.actionChamber!.collect(g,0);const base=g.blocks[3],top=g.blocks[5];
 Object.assign(base,{x:20,z:18});Object.assign(top,{x:20,z:18,y:base.size,support:base.id});tick(t,1.2);
 assert.equal(base.x,g.layout.blockPositions[3].x);assert.equal(top.x,g.layout.blockPositions[5].x);assert.equal(top.support,undefined);assert.equal(g.actionChamber!.collected[0],true);
});
test('a switched-away hero on construction holds; placed blocks do not move',()=>{
 const {g,t}=setup();const b=g.blocks[3];Object.assign(b,{x:12,z:16});Object.assign(g.player,{x:12,z:16});Object.assign(g.motion.yuki,{y:b.size,grounded:true});
 const before=g.blocks.map(b=>({...b}));t.select('mia');tick(t,2);assert.equal(t.companion.state,'HOLD_POSITION');assert.deepEqual(g.blocks,before);assert.ok(t.ownershipValid);
});
