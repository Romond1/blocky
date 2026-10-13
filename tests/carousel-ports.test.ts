import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {abilityPuzzle} from '../src/puzzles.ts';
test('each Room 8 carousel has exactly two station-facing pickup openings',()=>{
 const g=new Game(abilityPuzzle);
 for(const c of g.ability!.carousels)assert.equal(c.config.pickupPorts?.length,2);
});

import {HeroTeam} from '../src/team.ts';
function aligned(g:Game,portIndex:number,id=2){const c=g.ability!.machine(id)!;c.tick(.3,true);c.angle=c.config.pickupPorts![portIndex].angle-c.config.wordBlocks.indexOf(id)*2*Math.PI/c.config.wordBlocks.length;g.refreshDevices();return c;}
for(const portIndex of [0,1])test(`stopped word can be retrieved only through opening ${portIndex+1}`,()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g,'mia'),c=aligned(g,portIndex),p=c.pose(2)!;const a=c.config.pickupPorts![portIndex].angle;
 Object.assign(g.player,{x:c.config.position.x+Math.cos(a)*6.75,z:c.config.position.z+Math.sin(a)*6.75});g.facing=Math.atan2(c.config.position.x-g.player.x,c.config.position.z-g.player.z);
 assert.equal(c.canRetrieve(2,g.player),true);assert.equal(g.nearest,g.blocks[2]);g.interact();assert.equal(g.carried,g.blocks[2],g.message);assert.equal(c.attached.has(2),false);
});
test('stopping a word behind the fence never enables pickup, including while jumping or approaching around a corner',()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g,'mia'),c=g.ability!.carousels[0];c.tick(.3,true);c.angle=Math.PI/2;g.refreshDevices();const p=c.pose(2)!;
 Object.assign(g.player,{x:p.x,z:p.z+1.45});g.facing=Math.PI;
 assert.equal(g.nearest,undefined);assert.equal(g.hint,'');g.interact();assert.equal(g.carried,undefined);assert.equal(c.detach(2),false);
 g.motion.mia.y=2;g.motion.mia.grounded=false;assert.equal(g.nearest,undefined);g.interact();assert.equal(g.carried,undefined);
 const port=c.config.pickupPorts![0];c.angle=port.angle+port.halfAngle+.01;g.refreshDevices();const q=c.pose(2)!;Object.assign(g.player,{x:q.x-1.4,z:q.z});assert.equal(c.canRetrieve(2,g.player),false);
});
test('aligned words cannot be taken from another fence sector; most stopped trays remain unavailable',()=>{
 const g=new Game(abilityPuzzle),c=aligned(g,0),port=c.config.pickupPorts![0];
 const actor={x:c.config.position.x+Math.cos(port.angle+.46)*6.75,z:c.config.position.z+Math.sin(port.angle+.46)*6.75};assert.equal(c.canRetrieve(2,actor),false);
 const allowed=c.config.wordBlocks.filter(id=>!!c.portForWord(id));assert.ok(allowed.length<=2);assert.ok(allowed.length<c.attached.size);
 c.tick(.5,false);assert.equal(c.canRetrieve(2,actor),false);assert.equal(c.attached.size,7);
});
test('fence collision is low and transparent, with clear full-width ports and no other opening',()=>{
 const g=new Game(abilityPuzzle),c=g.ability!.carousels[0],bodies=c.fenceBodies();assert.ok(bodies.length>50);assert.ok(bodies.every(b=>b.y+b.halfY<=1.25));
 for(const port of c.config.pickupPorts!){const p={x:c.config.position.x+Math.cos(port.angle)*c.fenceRadius,z:c.config.position.z+Math.sin(port.angle)*c.fenceRadius};assert.ok(bodies.every(b=>Math.hypot(b.x-p.x,b.z-p.z)>1.3));}
});

test('visibly open off-center words have forgiving pickup allowance and the second opening has no tall pole',()=>{
 const g=new Game(abilityPuzzle),t=new HeroTeam(g,'mia'),c=g.ability!.carousels[0],port=c.config.pickupPorts![0];c.tick(.3,true);c.angle=port.angle+.25;g.refreshDevices();
 const p=c.pose(2)!,angle=port.angle+.25;Object.assign(g.player,{x:c.config.position.x+Math.cos(angle)*6.75,z:c.config.position.z+Math.sin(angle)*6.75});g.facing=Math.atan2(p.x-g.player.x,p.z-g.player.z);
 assert.equal(g.nearest,g.blocks[2]);g.interact();assert.equal(g.carried,g.blocks[2],g.message);
 assert.equal(g.layout.obstacles!.some(o=>o.id==='hall-spire'),false);
});
