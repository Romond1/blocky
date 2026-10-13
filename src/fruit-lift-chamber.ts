import {buildLiftView} from './lift-view.ts';
import {buildKageAlcove} from './kage-alcove-view.ts';
import {LUMA_MEMORY} from './luma-alcove.ts';
import * as THREE from 'three';
import {createWorldMaterials} from './world-materials.ts';
import {buildCaveShell} from './cave-shell.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildPuzzleCircuit,ACTIVE,DORMANT,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {fruitLayout} from './puzzles.ts';
import {BALCONY,FRUIT_BANKS} from './fruit-lift.ts';
import {LIFT} from './elevator.ts';
import {fruitPicture} from './fruit-pictures.ts';
import {wallGlyph} from './split-map.ts';
import {bridgeRunes} from './split-art.ts';
import type {Game} from './game.ts';
/** Room 4 kit in a broad, open vertical court; new geometry is limited to the lift and balcony. */
export function buildFruitLiftChamber(scene:THREE.Group){
 const palette=createWorldMaterials(),{box,floors,stair,doorway}=volcanicBuilder(scene,palette);
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.45});
 buildCaveShell(scene,palette,14,12,15,1.8,-10,[{centerX:LUMA_MEMORY.entrance.x,halfWidth:.8,height:4.5}]);floors(FRUIT_BANKS);
 floors([[6.5,13.5,-2.5,2.5,-3],[BALCONY.left,BALCONY.right,BALCONY.back,BALCONY.front,5]]);
 stair(12.5,-2.5,2.5,2);
 box(3.8,.75,.12,9,-1.7,-2.35,wallGlyph("BRING WORD BLOCKS UP IN THE LIFT",3.8,.75));
 const recovery=new THREE.MeshStandardMaterial({color:0x465b66,roughness:1});box(7,.025,5,10,-2.985,0,recovery);
 for(let z=-2;z<2.5;z+=.65)box(6.8,.012,.04,10,-2.965,z,palette.metal);
 for(const side of [-1,1]){
  box(1.2,.15,24,side*14.7,-.2,0,palette.lava);
  for(const z of [8,-5]){const l=new THREE.PointLight(0xff7136,35,11,2);l.position.set(side*14.3,2,z);scene.add(l);}
 }
 for(const o of fruitLayout.obstacles!.filter(o=>!o.id.startsWith('luma-')))box(o.width,o.height,o.depth,o.x,o.height/2,o.z);
 // Upper balcony has an open front and a clear landing directly north of the cabin.
 for(const x of [3.2,13.3]){box(.12,.12,9,x,6.15,-7.1,palette.metal);for(let z=-11.4;z<-2.5;z+=1.1)box(.12,1.1,.12,x,5.55,z,palette.metal);}
 for(const [left,right] of [[3.2,6.5],[11.5,13.3]]){
  box(right-left,.12,.12,(left+right)/2,6.15,-2.62,palette.metal);
  for(let x=left;x<=right;x+=1.05)box(.12,1.1,.12,x,5.55,-2.62,palette.metal);
 }
 for(const x of [3.3,13.2])box(.7,5,.7,x,2.5,-10.8);
 const {cabin,energy}=buildLiftView(scene,palette);
 const door=doorway(-10,-12);
 const path=(ps:number[][],y=.035)=>ps.map(([x,z])=>new THREE.Vector3(x,y,z));
 const circuit=buildPuzzleCircuit(scene,{...fruitLayout,sockets:fruitLayout.sockets.slice(0,5)},door,palette.stone,[
  path([[-5,-10.2],[-5,-10.8],[-8,-10.8],[-8,-11.5],[-10,-11.5]]),
  path([[0,-10.2],[0,-11.1],[-7.4,-11.1],[-7.4,-11.5],[-10,-11.5]]),
  path([[5,-10.2],[5,-11.35],[-7,-11.35],[-7,-11.5],[-10,-11.5]]),
  path([[5,2.1],[5,3.1],[9,3.1],[9,2.6]]),
  path([[5,-3.9],[5,-3.2],[9,-3.2],[9,-2.6]],5.035),
 ]);
 const purpleRims=fruitLayout.sockets.slice(3,5).map(s=>{
  for(const sign of [-1,1]){box(.09,.04,2.25,s.x+sign*1.12,(s.y??0)+.095,s.z,energy);box(2.25,.04,.09,s.x,(s.y??0)+.095,s.z+sign*1.12,energy);}
  return s;
 });void purpleRims;
 // No word labels on the answer wall: the educational task is word -> picture.
 const seals:THREE.MeshStandardMaterial[]=[];
 for(const [i,fruit] of (['APPLE','BANANA','PEAR'] as const).entries()){
  const x=fruitLayout.sockets[i].x;
  box(3.7,3.5,.4,x,2.45,-11.55);box(3.15,3.15,.08,x,2.6,-11.31,fruitPicture(fruit));
  const seal=glow(DORMANT);seals.push(seal);box(.38,.38,.12,x,4.5,-11.28,seal).rotation.z=Math.PI/4;
 }
 box(5.2,1,.3,-3,7.4,-11.45,wallGlyph('THE FRUIT LIFT',5.2,1));
 box(2.8,.55,.08,5,4.65,-2.12,wallGlyph('UP ↕ DOWN',2.8,.55));
 const emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:180},(_,i)=>i%3===1?(i%12)+1:i%3===0?Math.sin(i*17)*14:Math.sin(i*13)*12),3));
 const embers=new THREE.Points(emberGeometry,new THREE.PointsMaterial({color:0xffba6b,size:.035}));scene.add(embers);
 for(const [x,y,z] of [[0,6,5],[0,4,-7],[9,10,-7],[9,4,0]]){const l=new THREE.PointLight(0xaadfff,45,20,2);l.position.set(x,y,z);scene.add(l);}
 const memoryRoom=buildKageAlcove(scene,palette,LUMA_MEMORY);
 return {palette,lava:palette.lava,embers,door,circuit,socketMaterials:circuit.socketMaterials,tiles:[] as THREE.Mesh[],
  fruit:{update(g:Game,time:number){
   memoryRoom.update(g,time);
   const f=g.fruit!;cabin.position.y=f.lift.y;
   energy.emissiveIntensity=f.lift.moving?1.1+Math.sin(time*5)*.2:.65;
   seals.forEach((m,i)=>{m.color.setHex(f.matches[i]?ACTIVE:DORMANT);m.emissive.copy(m.color);});
   circuit.update([...f.matches,f.pulse>0,f.pulse>0],[...g.conduitProgress.slice(0,3),1-f.pulse,1-f.pulse],g.doorPowered,time,g.doorCharge,
    fruitLayout.sockets.slice(0,5).map((_,i)=>({activeColor:i<3?ACTIVE:HERO_PLATE_PURPLE,dormantColor:i<3?DORMANT:HERO_PLATE_PURPLE})));
  }},
 };
}
