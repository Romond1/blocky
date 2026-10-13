import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {abilityPuzzle} from '../src/puzzles.ts';
test('main chamber exposes two configurable continuously rotating sentence carousels',()=>{
 const g=new Game(abilityPuzzle);const machines=g.ability!.carousels;
 assert.equal(machines?.length,2);
 assert.ok(machines[0].velocity>0);assert.ok(machines[1].velocity<0);
 assert.equal(g.blocks.slice(2).every(b=>b.weightClass==='light'&&b.requiredStrength===1),true);
});

import {SentenceCarousel} from '../src/sentence-carousel.ts';
import {HeroTeam} from '../src/team.ts';
const config={id:'test',position:{x:0,z:0},radius:4,speed:.4,direction:1 as const,wordBlocks:[101,102,103],brakeControlId:0};
test('continuous rotation integrates large and small steps identically, with readable configured speed',()=>{
 const a=new SentenceCarousel(config),b=new SentenceCarousel(config);a.tick(2,false);for(let i=0;i<120;i++)b.tick(1/60,false);
 assert.ok(Math.abs(a.angle-b.angle)<1e-10);assert.ok(Math.abs(a.angle-.8)<1e-10);
 const p=a.pose(101)!;assert.ok(Math.abs(Math.hypot(p.x,p.z)-4)<1e-10);
});
test('brake decelerates in .3 seconds, holds, release accelerates and emits transitions once',()=>{
 const c=new SentenceCarousel(config),events:string[]=[];const emit=(e:string)=>events.push(e);
 c.tick(.1,true,emit);assert.ok(c.velocity>0&&c.velocity<.4);assert.equal(c.stopped,false);
 c.tick(.2,true,emit);assert.equal(c.stopped,true);const angle=c.angle;c.tick(3,true,emit);assert.equal(c.angle,angle);
 c.tick(.15,false,emit);assert.ok(c.velocity>0&&c.velocity<.4);c.tick(.15,false,emit);assert.equal(c.velocity,.4);
 assert.equal(events.filter(e=>e==='CAROUSEL_BRAKE').length,1);assert.equal(events.filter(e=>e==='CAROUSEL_STOPPED').length,1);assert.ok(events.includes('CAROUSEL_RELEASE'));
});
test('moving attachment cannot detach; stopped removal leaves an empty rotating tray until reset',()=>{
 const c=new SentenceCarousel({...config,direction:-1,initialAngle:.2});assert.equal(c.detach(101),false);
 c.tick(.3,true);assert.equal(c.detach(101),true);assert.equal(c.detach(101),false);c.tick(1,false);
 assert.equal(c.attached.has(101),false);assert.ok(c.pose(101));assert.ok(c.angle<.2);
 c.reset();assert.equal(c.angle,.2);assert.equal(c.velocity,-.4);assert.equal(c.braked,false);assert.equal(c.attached.size,3);
});
for(const hero of ['mia','yuki'] as const)test(`${hero} brake operator survives repeated TAB and other hero retrieves a LIGHT tray word`,()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g,hero),a=g.ability!,c=a.carousels[0],plate=g.layout.sockets[c.config.brakeControlId];
 Object.assign(g.player,plate);Object.assign(t.actors[t.other],{x:25,z:12});for(let i=0;i<24;i++)t.update(1/60);
 assert.equal(c.stopped,true);assert.equal(g.presenceRequired(hero),true);
 for(let i=0;i<12;i++){t.select(t.other);t.update(.06);}if(t.selected===hero)t.select(t.other);
 for(let i=0;i<90;i++)t.update(1/60);assert.equal(t.companion.state,'HOLD_POSITION');assert.deepEqual({x:t.actors[hero].x,z:t.actors[hero].z},{x:plate.x,z:plate.z});assert.equal(c.stopped,true);
 c.angle=c.config.pickupPorts![0].angle;g.refreshDevices();
 const b=g.blocks[2],p=c.pose(b.id)!,dx=p.x-25,dz=p.z,r=Math.hypot(dx,dz);
 Object.assign(g.player,{x:p.x+dx/r*1.45,z:p.z+dz/r*1.45});g.facing=Math.atan2(-dx,-dz);g.motion[t.selected].y=0;
 assert.equal(g.nearest,b);g.interact();assert.equal(g.carried,b,g.message);assert.equal(a.attached(b.id),false);assert.equal(b.weightClass,'light');
 // Release the human-controlled operator; removed cargo never returns to its ring.
 t.select(hero);Object.assign(g.player,{x:25,z:12});for(let i=0;i<24;i++)t.update(1/60);assert.ok(c.velocity>0);assert.equal(a.attached(b.id),false);assert.equal(b.state,'carried');
 t.reset();assert.equal(g.ability!.carousels[0].attached.size,7);assert.ok(g.ability!.carousels[0].velocity>0);assert.equal(g.carried,undefined);
});
test('full-speed tray words have no E prompt and heroes/companion cannot enter machines or activate brakes autonomously',()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g),a=g.ability!;g.refreshDevices();const b=g.blocks[2],p=a.carousels[0].pose(b.id)!;
 Object.assign(g.player,{x:p.x+1.2,z:p.z});assert.equal(g.nearest,undefined);assert.equal(g.hint,'');g.interact();assert.equal(g.carried,undefined);
 for(const c of a.carousels){assert.equal(a.canMove(c.config.position,0),false);assert.equal(a.canMove(c.config.position,10),false);assert.equal(t.world().canNavigate!(c.config.position),false);assert.equal(t.world().canNavigate!(g.layout.sockets[c.config.brakeControlId]),false);}
 const before=g.blocks.map(b=>b.state);for(let i=0;i<300;i++)t.update(1/60);assert.deepEqual(g.blocks.map(b=>b.state),before);
});
test('opposite phase remains 20 percent faster and tray order works with arbitrary slot counts',()=>{
 const g=new Game(abilityPuzzle),[a,b]=g.ability!.carousels;assert.equal(b.config.speed/a.config.speed,1.2);assert.equal(b.config.direction,-a.config.direction);
 const c=new SentenceCarousel({...config,wordBlocks:[9,8]});assert.ok(Math.abs(c.pose(9)!.x+c.pose(8)!.x)<1e-10);
});

test('completed-phase brakes remain off limits to an approaching NPC, while a former operator can leave',()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g),a=g.ability!,q=g.layout.sockets[16];a.completed[2]=a.completed[3]=true;
 Object.assign(t.actors[t.other],{x:25,z:12});assert.equal(a.companionSafe(g,q),false);
 Object.assign(t.actors[t.other],{x:q.x,z:q.z+.5});assert.equal(a.companionSafe(g,{x:q.x,z:q.z+.8}),true);assert.equal(a.companionSafe(g,q),false);
});
test('detached lost words recover off the machine and reset restores exact tray poses',()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g),a=g.ability!,c=a.carousels[0],b=g.blocks[2];c.tick(.3,true);c.angle=c.config.pickupPorts![0].angle;assert.equal(c.detach(b.id),true);
 Object.assign(b,{x:100,z:-100,y:-3});g.refreshDevices(.1);assert.equal(a.attached(b.id),false);assert.equal(b.state,'floor');assert.ok(Math.hypot(b.x-39,b.z-9)<5);
 c.tick(.8,false);const otherAngle=a.carousels[1].angle;t.reset();assert.notEqual(g.ability!.carousels[1].angle,otherAngle);
 for(const c of g.ability!.carousels)for(const id of c.attached){const p=c.pose(id)!;assert.equal(g.blocks[id].x,p.x);assert.equal(g.blocks[id].z,p.z);assert.equal(g.blocks[id].y,p.y);}
});
