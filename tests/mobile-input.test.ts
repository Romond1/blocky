import test from 'node:test';
import assert from 'node:assert/strict';
import {MovementInput} from '../src/movement.ts';
import {Game} from '../src/game.ts';
import {chooseControlMode,needsRotation,joystickVector} from '../src/input-device.ts';

test('small joystick deflection remains slow after smoothing',()=>{
 const input=new MovementInput();
 for(let i=0;i<20;i++)input.update(1/60,.2,.1);
 const v=input.update(1/60,.2,.1);assert.ok(Math.abs(v.x-.2)<.001);assert.ok(Math.abs(v.z-.1)<.001);
 assert.deepEqual(input.update(1/60,0,0),{x:0,z:0});
});
test('game movement honors analog magnitude and clamps diagonal speed',()=>{
 const travel=(x:number,z:number)=>{const g=new Game();const p={...g.player};g.update(.1,x,z);return Math.hypot(g.player.x-p.x,g.player.z-p.z);};
 assert.ok(Math.abs(travel(.25,0)/travel(1,0)-.25)<.001);
 assert.ok(Math.abs(travel(1,1)/travel(1,0)-1)<.001);
});
test('capabilities, active input and explicit override select controls without UA',()=>{
 const desktop={width:1280,coarse:false,fine:true,touchPoints:0,lastInput:undefined};
 assert.equal(chooseControlMode('auto',desktop),'keyboard');
 assert.equal(chooseControlMode('auto',{...desktop,width:844,coarse:true,touchPoints:5}),'touch');
 assert.equal(chooseControlMode('auto',{...desktop,lastInput:'touch',touchPoints:10}),'touch');
 assert.equal(chooseControlMode('auto',{...desktop,lastInput:'keyboard',coarse:true,touchPoints:10}),'keyboard');
 assert.equal(chooseControlMode('touch',desktop),'touch');
 assert.equal(chooseControlMode('keyboard',{...desktop,coarse:true}),'keyboard');
 assert.equal(needsRotation('keyboard',390,844),false);
 assert.equal(needsRotation('touch',390,844),true);
 assert.equal(needsRotation('touch',844,390),false);
 assert.equal(needsRotation('touch',820,1180),false);
});
test('joystick deadzone and radial clamp provide neutral and bounded diagonal movement',()=>{
 assert.deepEqual(joystickVector(2,2,50),{x:0,z:0});
 const v=joystickVector(100,-100,50);assert.ok(Math.abs(Math.hypot(v.x,v.z)-1)<.001);assert.ok(v.x>0&&v.z>0);
 assert.ok(joystickVector(25,0,50).x<.5);
});
