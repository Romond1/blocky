import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as camera from '../src/camera-distance.ts';
import * as THREE from 'three';
test('wheel zoom is bounded, smooth, frame-rate independent and resettable',()=>{
 const c=new camera.CameraDistance();assert.equal(c.distance,6);c.wheel(120);assert.ok(c.target>6);c.update(.1);assert.ok(c.distance>6&&c.distance<c.target);
 c.wheel(100000);assert.equal(c.target,9);c.wheel(-100000);assert.equal(c.target,4);
 const a=new camera.CameraDistance(),b=new camera.CameraDistance();a.wheel(240);b.wheel(240);a.update(1);for(let i=0;i<60;i++)b.update(1/60);assert.ok(Math.abs(a.distance-b.distance)<1e-10);c.reset();assert.equal(c.distance,6);assert.equal(c.target,6);
});
test('close walls keep the camera outside the hero, with collision evaluated upstairs',()=>{
 assert.equal(typeof camera.clearCameraPosition,'function');
 const wall={id:'wall',x:2,z:0,width:1,depth:5,height:10,kind:'wall' as const};
 const eye=new THREE.Vector3(1.1,6.6,0),desired=new THREE.Vector3(7,7.5,0);
 const result=camera.clearCameraPosition(eye,desired,[wall]);assert.ok(result.distanceTo(eye)>=2);assert.ok(result.x<1.3);assert.ok(result.y>6.6);
 const above=new THREE.Vector3(0,15,0),far=new THREE.Vector3(6,16,0);assert.deepEqual(camera.clearCameraPosition(above,far,[wall]),far);
});
