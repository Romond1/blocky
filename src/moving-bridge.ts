import * as THREE from 'three';
import {bridgeRunes} from './split-art.ts';
/** Shared four-slab assembly. Rooms position/rotate the assembly, not the bridge implementation. */
export function buildMovingBridge(parent:THREE.Object3D,slab:THREE.Material,rail:THREE.Material,conduit:THREE.Material){
 const geometry=new THREE.BoxGeometry(1,1,1),slabs:THREE.Group[]=[];
 function part(group:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material){
  const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 }
 for(let i=0;i<4;i++){
  const group=new THREE.Group();parent.add(group);group.position.x=-1.5+i*3;
  part(group,2.98,.5,4,0,-.25,0,slab);
  for(const z of [-1.86,1.86])part(group,2.8,.055,.08,0,.04,z,rail);
  bridgeRunes(group,rail,conduit,i);slabs.push(group);
 }
 return {slabs,update(extension:number,retractDistance=4.5,baseZ=-2){slabs.forEach(s=>s.position.z=baseZ-(1-extension)*retractDistance);}};
}
