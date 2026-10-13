import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heroPuzzle} from '../src/puzzles.ts';
import {LIGHT_BLOCK,HEAVY_BLOCK} from '../src/blocks.ts';
import {carryPoint} from '../src/movement.ts';

function arena(){return new Game({...heroPuzzle,training:false,choices:['CUBE','HEAVY'],blocks:[LIGHT_BLOCK,HEAVY_BLOCK],room:{...heroPuzzle.room!,halfWidth:10,halfDepth:10,sockets:[],spawn:{x:0,z:0},blockPositions:[{x:0,z:1.3},{x:0,z:3}],obstacles:[]}});}
function carry(g:Game){Object.assign(g.blocks[0],{state:'carried',carrier:'yuki'});g.facing=0;}
test('held cube stops at HEAVY before the hero collider reaches it, even on long frames',()=>{
 const g=arena();carry(g);g.update(1,0,1);
 assert.ok(g.player.z<=.725+.0001,`carried cube entered HEAVY at hero z=${g.player.z}`);
 const stopped=g.player.z;g.update(.2,0,-1);assert.ok(g.player.z<stopped,'must be able to back away');
});
test('turning cannot swing a held cube into another block',()=>{
 const g=arena();carry(g);g.blocks[1].x=1.8;g.blocks[1].z=.9;
 g.update(.16,1,0);assert.ok(g.facing<Math.PI/2-.01,'turn swung through heavy block');
});
test('carry footprint respects a wall while the hero still has room',()=>{
 const g=arena();carry(g);g.blocks[1].x=-6;g.blocks[1].z=-6;
 g.layout.obstacles!.push({id:'wall',x:0,z:2,width:4,depth:.2,height:3,kind:'wall'});
 g.update(.8,0,1);assert.ok(g.player.z<=.45+.0001);
});
test('pickup cannot teleport a cube through a blocking volume to the hands',()=>{
 const g=arena();g.blocks[0].x=1.7;g.blocks[0].z=0;g.blocks[1].x=-6;g.blocks[1].z=-6;g.facing=0;
 g.layout.obstacles!.push({id:'post',x:.85,z:.6,width:.15,depth:.15,height:3,kind:'pillar'});
 g.interact();assert.equal(g.carried,undefined);assert.equal(g.blocks[0].state,'floor');
});
test('a cube carried by the other hero is also solid',()=>{
 const g=arena(),team=new HeroTeam(g);carry(g);Object.assign(team.actors.mia,{x:0,z:3.7,facing:Math.PI});Object.assign(g.blocks[1],{state:'carried',carrier:'mia'});
 team.update(.4,0,1);const a=carryPoint({...g.player,facing:g.facing},.95),b=carryPoint(team.actors.mia,1.65);
 assert.ok(b.z-a.z>=1.3-.0001,'two held cubes intersected');
});
test('jumping cannot lower a held cube through another cube',()=>{
 const g=arena(),team=new HeroTeam(g);carry(g);g.motion.yuki.y=2;g.motion.yuki.grounded=false;g.motion.yuki.vy=-1;
 g.blocks[1].z=.975;for(let i=0;i<90;i++)team.update(1/60);
 assert.ok(g.motion.yuki.y+1.12-.475>=1.65-.0001,'falling carry passed through a block');
});
test('an empty-handed hero cannot walk through their companion\'s held cube',()=>{
 const g=arena(),team=new HeroTeam(g);Object.assign(team.actors.mia,{x:0,z:3.7,facing:Math.PI});Object.assign(g.blocks[1],{state:'carried',carrier:'mia'});
 g.blocks[0].x=-6;g.blocks[0].z=-6;g.update(1,0,1);
 assert.ok(g.player.z<=3.7-1.325-.825-.38+.0001);
});
test('a previously dropped cube rests on the plate surface and remains retrievable',()=>{
 const g=new Game(heroPuzzle),b=g.blocks[0],s=g.layout.sockets[0];
 Object.assign(b,{state:'carried',carrier:'yuki',y:0});Object.assign(g.player,{x:s.x,z:s.z+1.6});g.facing=Math.PI;
 g.interact();assert.equal(b.state,'socket');assert.equal(b.y,(s.y??0)+.29);
 g.interact();assert.equal(g.carried,b,'floor height must not leave the cube embedded in the plate');
});
