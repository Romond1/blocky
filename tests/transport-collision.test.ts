import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {fruitPuzzle,actionPuzzle} from '../src/puzzles.ts';
import {bodyClear} from '../src/carry-collision.ts';
import {FERRY} from '../src/lava-ferry.ts';

const tick=(t:HeroTeam,n:number,x=0,z=0)=>{for(let i=0;i<n;i++)t.update(1/60,x,z);};

for(const dt of [1/60,1])test(`lift pauses a carried cube below the gallery and resumes when its rider backs away (${dt}s)`,()=>{
 const g=new Game(fruitPuzzle),t=new HeroTeam(g,'yuki');t.holdPosition('mia');
 Object.assign(g.player,{x:9,z:-1.8});g.facing=Math.PI;
 const b=g.blocks[0];Object.assign(b,{state:'carried',carrier:'yuki'});
 g.fruit!.lift.activate([true]);
 for(let i=0;i<Math.ceil(4.4/dt);i++){t.update(dt);assert.ok(bodyClear(g,b,g.blockBody(b)),'held cube never enters the gallery slab');}
 assert.equal(g.fruit!.lift.blocked,true);assert.ok(g.fruit!.lift.y>2&&g.fruit!.lift.y<3);
 const stopped=g.fruit!.lift.y;tick(t,30);assert.equal(g.fruit!.lift.y,stopped);
 tick(t,28,0,1);assert.ok(g.player.z>-.3,'the rider can retreat from contact');
 tick(t,300);assert.equal(g.fruit!.lift.state,'UP');assert.equal(g.motion.yuki.y,5);assert.equal(g.carried,b);
});

for(const dt of [1/60,1])test(`ferry pauses all riders and stacked cargo before a held cube hits shore cargo, then resumes (${dt}s)`,()=>{
 const g=new Game(actionPuzzle),t=new HeroTeam(g,'yuki');t.holdPosition('mia');
 const c=g.actionChamber!;for(let i=0;i<3;i++)c.collect(g,i);tick(t,100);
 Object.assign(g.player,{x:0,z:.6});g.facing=Math.PI;
 const [shore,held,top,base]=g.blocks;
 Object.assign(shore,{x:0,z:-17.5,y:0,state:'floor'});
 Object.assign(held,{state:'carried',carrier:'yuki'});
 Object.assign(base,{x:1,z:3,y:0,state:'floor'});
 Object.assign(top,{x:1,z:3,y:base.size,support:base.id,state:'floor'});
 c.lift.command(FERRY.b);
 for(let i=0;i<Math.ceil(4.7/dt);i++){t.update(dt);assert.ok(bodyClear(g,held,g.blockBody(held)),'carried cube never overlaps shore cargo');}
 assert.equal(c.lift.blocked,true);assert.ok(c.lift.z>FERRY.b);
 const stopped={ferry:c.lift.z,hero:g.player.z,base:base.z,top:top.z};tick(t,30);
 assert.deepEqual({ferry:c.lift.z,hero:g.player.z,base:base.z,top:top.z},stopped);
 assert.equal(top.support,base.id);assert.equal(top.y,base.size);
 tick(t,25,1,0);assert.ok(g.player.x>1,'rider can move the carried cube out of the collision path');
 tick(t,150);assert.equal(c.lift.z,FERRY.b);assert.equal(c.lift.state,'UP');
 assert.ok(Math.abs(base.z-(3+FERRY.b-FERRY.a))<1e-8);assert.equal(top.z,base.z);assert.equal(held.carrier,'yuki');
});
