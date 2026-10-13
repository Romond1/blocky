import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {dragonPuzzle} from '../src/finale-layout.ts';
import {dragonFloor,DRAGON_CONTROLS} from '../src/dragon-layout.ts';
import {dragonFloorTriangles} from '../src/dragon-terrain.ts';
import * as THREE from 'three';

test('wall-side ground and expanded construction court support both heroes and the Heart',()=>{
 for(const hero of ['mia','yuki'] as const){
  const g=new Game(dragonPuzzle),t=new HeroTeam(g,hero),d=g.finale!.dragon!,f=g.finale!;
  for(const p of [{x:0,z:37},{x:34,z:15},{x:32,z:-12},{x:32,z:-16},{x:-35,z:-17}]){
   const height=p.x<0?5:0;assert.equal(d.ground(p,height),height,JSON.stringify(p));
   Object.assign(t.actors[hero],p);Object.assign(g.motion[hero],{y:height,vy:0,grounded:true});
   Object.assign(f.heart,{state:'carried',carrier:hero});
   for(let i=0;i<90;i++)t.update(1/60);
   assert.equal(g.motion[hero].y,height);assert.equal(f.heart.carrier,hero,`Heart at ${JSON.stringify(p)}`);assert.equal(f.recoveries,0);
   assert.equal(g.events.includes('FALL_SAFE'),false);
  }
 }
});

test('wall is solid, but the required bridge channel stays lava across its width',()=>{
 const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia'),d=g.finale!.dragon!;
 assert.equal(d.canMove({x:0,z:46.8},0,true),false,'cave wall stops movement');
 for(const x of [29,33,37,39])assert.equal(dragonFloor({x,z:1}),-8,`no wall-side bypass at x=${x}`);
 assert.equal(d.ground({x:0,z:0},0),-8);
 Object.assign(t.actors.mia,{x:0,z:0});g.motion.mia.y=-3;g.refreshDevices();
 assert.equal(g.events.includes('FALL_SAFE'),true,'falling into visible lava still recovers');
});

test('rendered floor has one surface at its collision height, including court/gallery joins',()=>{
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(dragonFloorTriangles(),3));
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()),ray=new THREE.Raycaster();mesh.updateMatrixWorld();
 for(let x=23.173;x<39;x+=.47)for(let z=-22.219;z<14;z+=.53){
  ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(mesh),floor=dragonFloor({x,z});
  assert.equal(hits.length,floor<0?0:1,`duplicate or missing floor at ${x},${z}`);
  if(hits.length)assert.ok(Math.abs(hits[0].point.y-floor)<1e-5);
 }
 geometry.dispose();(mesh.material as THREE.Material).dispose();
});

test('isolated Heart landing cannot be reached by jumping before the final bridge opens',()=>{
 for(const hero of ['mia','yuki'] as const)for(const x of [-4.5,0,4.5]){
  const g=new Game(dragonPuzzle),t=new HeroTeam(g,hero),d=g.finale!.dragon!;
  const destination={x,z:-23},r=Math.hypot(destination.x,destination.z),start={x:destination.x/r*28.04,z:destination.z/r*28.04};
  Object.assign(t.actors[hero],start);Object.assign(g.motion[hero],{y:5,grounded:true});g.jump();let landed=false;
  for(let i=0;i<140;i++){const dx=destination.x-g.player.x,dz=destination.z-g.player.z,len=Math.hypot(dx,dz);t.update(1/60,dx/len,dz/len);if(g.motion[hero].grounded&&g.motion[hero].y>4.9&&Math.abs(g.player.x)<=4.51&&g.player.z>=-23.01&&g.player.z<=-17)landed=true;}
  assert.equal(landed,false,`${hero} shortcut at x=${x}`);assert.equal(d.bridgeReady,false);
 }
});

test('the Heart can be carried from the lift past the inactive entrance to the carousel approach',()=>{
 const g=new Game(dragonPuzzle),t=new HeroTeam(g,'mia'),f=g.finale!,d=f.dragon!;
 d.locks=[true,true,true,false];Object.assign(t.actors.mia,{x:24,z:-21});Object.assign(g.motion.mia,{y:5,grounded:true});
 Object.assign(f.heart,{state:'carried',carrier:'mia'});
 for(const p of [{x:16,z:-29},{x:0,z:-33},{x:-12,z:-30},{x:-13,z:-24},DRAGON_CONTROLS[5]]){
  for(let i=0;i<600;i++){const dx=p.x-g.player.x,dz=p.z-g.player.z,len=Math.hypot(dx,dz);if(len<.12)break;t.update(1/60,dx/len,dz/len);}
  assert.ok(Math.hypot(p.x-g.player.x,p.z-g.player.z)<.15,`route blocked at ${JSON.stringify(g.player)}, target ${JSON.stringify(p)}`);
  assert.equal(g.motion.mia.y,5);assert.equal(f.heart.carrier,'mia');assert.equal(f.recoveries,0);
 }
 assert.equal(d.bridgeReady,false);assert.equal(d.restored,false);
});


test('widened west perimeter has no entrance seam holes or duplicated surfaces',()=>{
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(dragonFloorTriangles(),3));const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()),ray=new THREE.Raycaster();mesh.updateMatrixWorld();
 for(let x=-42.137;x<-8;x+=.71)for(let z=-8.219;z<39;z+=.83){ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(mesh);assert.equal(hits.length,dragonFloor({x,z})<0?0:1,`west floor seam at ${x},${z}`);}
 for(const p of [{x:-12,z:34},{x:-20,z:32},{x:-30,z:32},{x:-37,z:28},{x:-38,z:5},{x:-23,z:5}])assert.equal(dragonFloor(p),0,JSON.stringify(p));
 geometry.dispose();(mesh.material as THREE.Material).dispose();
});
