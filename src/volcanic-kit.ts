import * as THREE from 'three';
import {basaltFloor} from './split-art.ts';
import type {WorldMaterials} from './world-materials.ts';
/** Shared Room 4 building elements; room builders supply layout coordinates. */
export function volcanicBuilder(scene:THREE.Group,palette:WorldMaterials){
 const geometry=new THREE.BoxGeometry(1,1,1);
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material=palette.dark,parent:THREE.Object3D=scene)=>{
  const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const floors=(rects:number[][])=>{for(const [l,r,b,f,y=0] of rects)box(r-l,.7,f-b,(l+r)/2,y-.35,(b+f)/2);basaltFloor(scene,rects,palette.dark);};
 const stair=(x:number,start:number,end:number,width:number,low=-3,high=0)=>{
  for(let i=0;i<20;i++){const z=start+(i+.5)*(end-start)/20,top=low+(i+.5)*(high-low)/20;
   box(width,top-low,(end-start)/20,x,(low+top)/2,z);
   box(width-.1,.025,(end-start)/20-.03,x,top+.012,z,palette.stone);
   box(width-.1,.025,.035,x,top+.025,z+(end-start)/40-.025,palette.metal);
  }
 };
 const doorway=(x:number,z:number)=>{
  const door=new THREE.Group();door.position.set(x,0,z);scene.add(door);
  for(const side of [-1,1]){box(.6,5,.9,x+side*2.1,2.5,z,palette.metal);box(.6,6,4,x+side*2.1,3,z-2);}
  box(4.8,.7,1.2,x,5,z,palette.metal);box(3.6,.4,4,x,-.2,z-2);box(4.8,.6,4,x,6,z-2);
  box(3.6,6,.4,x,3,z-4);box(3.3,4,.1,x,2.4,z-3.7,palette.energy);return door;
 };
 return {box,floors,stair,doorway};
}
