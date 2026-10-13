import test from 'node:test';
import assert from 'node:assert/strict';
import {boxesOverlap,boxCorners,interpolateBody,sweepClear} from '../src/block-collision.ts';
import type {BoxBody} from '../src/block-collision.ts';

const box=(changes:Partial<BoxBody>={}):BoxBody=>({x:0,y:0,z:0,halfX:.5,halfY:.5,halfZ:.5,yaw:0,...changes});
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('rotated cube corners collide beyond the unrotated footprint',()=>{
 const rotated=box({yaw:Math.PI/4}),obstacle=box({x:.75,halfX:.1,halfZ:.1});
 assert.equal(boxesOverlap(box(),obstacle),false);
 assert.equal(boxesOverlap(rotated,obstacle),true);
 assert.equal(boxesOverlap(obstacle,rotated),true);
 const corners=boxCorners(rotated);
 assert.equal(corners.length,4);
 close(Math.max(...corners.map(p=>p.x)),Math.SQRT1_2);
 close(Math.min(...corners.map(p=>p.z)),-Math.SQRT1_2);
});

test('SAT separates rotated rectangles even when their world bounds overlap',()=>{
 const a=box({halfX:2,halfZ:.1,yaw:Math.PI/4});
 const b=box({halfX:2,halfZ:.1,yaw:Math.PI/4,x:.3,z:.3});
 assert.equal(boxesOverlap(a,b),false);
 assert.equal(boxesOverlap(b,a),false);
 assert.equal(boxesOverlap(a,box({...b,x:.05,z:.05})),true);
});

test('vertical separation and surface contact permit resting without overlap',()=>{
 assert.equal(boxesOverlap(box(),box({y:1.1})),false);
 assert.equal(boxesOverlap(box(),box({y:1})),false);
 assert.equal(boxesOverlap(box(),box({x:1})),false);
 assert.equal(boxesOverlap(box(),box({z:1})),false);
 assert.equal(boxesOverlap(box(),box({x:1-1e-7})),false);
 assert.equal(boxesOverlap(box(),box({x:1-1e-4})),true);
 assert.equal(boxesOverlap(box(),box({y:.9})),true);
 const yaw=.7,a=box({yaw}),b=box({yaw,x:Math.cos(yaw),z:-Math.sin(yaw)});
 assert.equal(boxesOverlap(a,b),false);
});

test('corners use the same yaw convention as forward carrying and translation',()=>{
 const corners=boxCorners(box({x:4,z:-3,halfX:2,halfZ:1,yaw:Math.PI/2}));
 close(Math.min(...corners.map(p=>p.x)),3);close(Math.max(...corners.map(p=>p.x)),5);
 close(Math.min(...corners.map(p=>p.z)),-5);close(Math.max(...corners.map(p=>p.z)),-1);
});

test('interpolation blends position and extents along the shortest yaw arc',()=>{
 const from=box({yaw:179*Math.PI/180}),to=box({x:4,y:2,z:6,halfX:1.5,halfY:2.5,halfZ:3.5,yaw:-179*Math.PI/180});
 const mid=interpolateBody(from,to,.5);
 close(mid.x,2);close(mid.y,1);close(mid.z,3);
 close(mid.halfX,1);close(mid.halfY,1.5);close(mid.halfZ,2);
 close(mid.yaw,Math.PI);
 close(interpolateBody(box(),box({yaw:Math.PI}),.5).yaw,Math.PI/2);
});

test('sweep detects a thin obstacle between otherwise clear endpoints',()=>{
 const from=box({x:-1,halfX:.03}),to=box({...from,x:1}),obstacle=box({x:.013,halfX:.006});
 const clear=(body:BoxBody)=>!boxesOverlap(body,obstacle);
 assert.equal(clear(from),true);assert.equal(clear(to),true);
 assert.equal(sweepClear(from,to,clear),false);
 assert.equal(sweepClear(box({x:-1,y:2}),box({x:1,y:2}),clear),true);
});

test('sweep samples rotating corners over a half turn',()=>{
 const from=box({halfX:1.5,halfZ:.1}),to=box({...from,yaw:Math.PI}),obstacle=box({z:1.1,halfX:.1,halfZ:.1});
 const clear=(body:BoxBody)=>!boxesOverlap(body,obstacle);
 assert.equal(clear(from),true);assert.equal(clear(to),true);
 assert.equal(sweepClear(from,to,clear),false);
});

test('sweep takes the short seam crossing and visits both endpoints',()=>{
 const from=box({yaw:179*Math.PI/180}),to=box({...from,yaw:-179*Math.PI/180});
 const seen:BoxBody[]=[];
 assert.equal(sweepClear(from,to,body=>{seen.push(body);return Math.cos(body.yaw)<-.99;}),true);
 assert.ok(seen.length>=2);close(seen[0].yaw,from.yaw);
 close(Math.sin(seen.at(-1)!.yaw),Math.sin(to.yaw));
 assert.equal(sweepClear(box(),box({x:2}),body=>body.x>0),false);
 assert.equal(sweepClear(box(),box({x:2}),body=>body.x<2),false);
 assert.equal(sweepClear(box(),box(),()=>false),false);
});

test('combined translation and rotation keep each corner sample within .025 units',()=>{
 const seen:BoxBody[]=[];
 assert.equal(sweepClear(box({halfX:2}),box({x:2,y:1,z:-3,halfX:3,yaw:Math.PI}),body=>{seen.push(body);return true;}),true);
 for(let i=1;i<seen.length;i++){
  const before=boxCorners(seen[i-1]),after=boxCorners(seen[i]);
  for(let corner=0;corner<4;corner++)assert.ok(Math.hypot(after[corner].x-before[corner].x,seen[i].y-seen[i-1].y,after[corner].z-before[corner].z)<=.025+1e-9);
 }
});
