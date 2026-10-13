import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {actionPuzzle} from '../src/puzzles.ts';
const tick=(t:HeroTeam,s:number,dx=0,dz=0)=>{for(let i=0;i<Math.ceil(s*60);i++)t.update(1/60,dx,dz);};
test('LIFT has a one large base and three small pieces and a lower reachable ledge',()=>{
 const g=new Game(actionPuzzle);assert.equal(g.blocks.length,7);assert.deepEqual(g.blocks.slice(3).map(b=>b.size),[2.2,.8,.8,.8]);
 assert.equal(g.blocks[3].requiredStrength,2);assert.ok(g.blocks.slice(4).every(b=>b.weightClass==='light'));assert.equal(g.blocks[2].y,3.8);
});
test('Yuki moves the large construction base slowly without changing base hero abilities',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);Object.assign(g.player,{x:10,z:23});g.facing=Math.PI;t.interact();tick(t,.6);assert.equal(g.carried?.id,3);
 g.player.z=26;const x=g.player.x;tick(t,1,1,0);assert.ok(g.player.x-x>1.2&&g.player.x-x<1.6);
});
for(const hero of ['yuki','mia'] as const)test(`${hero} can select and pick up a neighbor's top block while standing on another block`,()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);
 const under=g.blocks[3],neighbor=g.blocks[4],top=g.blocks[5];Object.assign(under,{x:12,z:19,y:0,size:1.8});Object.assign(neighbor,{x:12,z:17.4,y:0,size:1.8});Object.assign(top,{x:12,z:17.4,y:1.8,support:neighbor.id});
 Object.assign(g.player,{x:12,z:18.8});Object.assign(g.motion[hero],{y:1.8,vy:0,grounded:true});g.facing=Math.PI;
 assert.equal(g.nearest?.id,top.id);t.interact();assert.equal(g.carried?.id,top.id);assert.equal(top.support,undefined);assert.equal(under.state,'floor');assert.equal(neighbor.state,'floor');
});

test('small piece stacks stably on another small piece while the hero stands on the large base',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);
 const big=g.blocks[3],medium=g.blocks[4],small=g.blocks[5];Object.assign(big,{x:12,z:16});Object.assign(medium,{x:12,z:16.48,y:2.2,support:big.id});
 Object.assign(g.player,{x:12,z:14.7});Object.assign(g.motion.yuki,{y:2.2,vy:0,grounded:true});g.facing=0;
 Object.assign(small,{state:'carried',carrier:'yuki'});t.interact();assert.equal(small.support,medium.id);assert.equal(small.y,3);assert.equal(small.state,'floor');
 const placed=g.blocks.map(b=>({...b}));tick(t,2);assert.deepEqual(g.blocks,placed);
});

for(const hero of ['yuki','mia'] as const)test(`${hero} needs a small step before climbing the large base`,()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);const big=g.blocks[3],small=g.blocks[4];Object.assign(big,{x:12,z:18});Object.assign(small,{x:12,z:20});
 Object.assign(g.player,{x:12,z:21.3});g.jump();tick(t,.5,0,-1);tick(t,1);assert.equal(g.motion[hero].y,.8);
 g.jump();tick(t,.55,0,-1);tick(t,1);assert.equal(g.motion[hero].y,2.2);
 t.reset();Object.assign(g.blocks[3],{x:12,z:18});Object.assign(g.player,{x:12,z:20});g.jump();tick(t,.7,0,-1);tick(t,1);assert.equal(g.motion[hero].y,0);assert.ok(g.player.z>19.3);
});
test('placing from a small step skips the occupied support and settles on the big base',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);const big=g.blocks[3],step=g.blocks[4],held=g.blocks[5];
 Object.assign(big,{x:12,z:16});Object.assign(step,{x:12,z:18.4});Object.assign(g.player,{x:12,z:18.5});Object.assign(g.motion.yuki,{y:.8,vy:0,grounded:true});g.facing=Math.PI;
 Object.assign(held,{state:'carried',carrier:'yuki'});t.interact();assert.equal(held.support,big.id);assert.equal(held.y,2.2);assert.ok(held.z<17);assert.equal(g.motion.yuki.y,.8);
});

test('multiple small pieces can rest beside one another on the large base',()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g);t.holdPosition(t.other);const big=g.blocks[3],first=g.blocks[4],held=g.blocks[5],step=g.blocks[6];
 Object.assign(big,{x:12,z:16});Object.assign(first,{x:11.68,z:16,y:2.2,support:big.id});Object.assign(step,{x:14.5,z:16});
 Object.assign(g.player,{x:14.5,z:16});Object.assign(g.motion.yuki,{y:.8,vy:0,grounded:true});g.facing=-Math.PI/2;Object.assign(held,{state:'carried',carrier:'yuki'});
 t.interact();assert.equal(held.support,big.id);assert.ok(held.x-first.x>=.8);assert.equal(held.y,2.2);
});

for(const hero of ['yuki','mia'] as const)test(`${hero} needs the small top piece to jump from the base to the LIFT ledge`,()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g,hero);t.holdPosition(t.other);const big=g.blocks[3],top=g.blocks[4];Object.assign(big,{x:12,z:15.5});
 Object.assign(g.player,{x:12,z:14.4});Object.assign(g.motion[hero],{y:2.2,vy:0,grounded:true});g.jump();tick(t,.4,0,-1);tick(t,1);assert.ok(g.motion[hero].y<3.8);
 Object.assign(top,{x:12,z:15,y:2.2,support:big.id});Object.assign(g.player,{x:12,z:14.4});Object.assign(g.motion[hero],{y:3,vy:0,grounded:true});g.jump();tick(t,.28,0,-1);tick(t,1);assert.equal(g.motion[hero].y,3.8);
 t.interact();assert.equal(g.carried?.text,'LIFT');
});
