import * as THREE from 'three';
import {KAGE_AREAS,KAGE_WALLS,KAGE_GATE,KAGE_PLATE,KAGE_ENTRANCE,KAGE_WALL_HEIGHT,KAGE_MEMORY,type MemoryRoomDefinition} from './kage-alcove.ts';
import {basaltFloor} from './split-art.ts';
import type {WorldMaterials} from './world-materials.ts';
import type {Game} from './game.ts';

export function buildKageAlcove(root:THREE.Group,palette:WorldMaterials,definition:MemoryRoomDefinition=KAGE_MEMORY){
 const local=new THREE.Group();local.name=`${definition.assetFolder}-memory-room`;
 local.scale.x=definition.transform.scaleX;local.position.set(definition.transform.offsetX,0,definition.transform.offsetZ);root.add(local);root=local;
 const geo=new THREE.BoxGeometry(1,1,1);
 const gold=new THREE.MeshStandardMaterial({color:0xb69a60,metalness:.6,roughness:.45});
 const iron=new THREE.MeshStandardMaterial({color:0x646366,metalness:.7,roughness:.42});
 function box(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=root){
  const mesh=new THREE.Mesh(geo,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;parent.add(mesh);return mesh;
 }
 // Render disjoint floor sections; the collision areas intentionally overlap at joins.
 const [passage,turn,gallery,reward]=KAGE_AREAS;
 const surfaces=[{...passage,back:turn.front},{...turn,right:gallery.left},gallery,{...reward,front:gallery.back}];
 for(const a of surfaces){
  box(a.right-a.left,.4,a.front-a.back,(a.left+a.right)/2,-.2,(a.back+a.front)/2,palette.dark);
  box(a.right-a.left,.25,a.front-a.back,(a.left+a.right)/2,KAGE_WALL_HEIGHT+.125,(a.back+a.front)/2,palette.dark);
 }
 basaltFloor(root,surfaces.map(a=>[a.left,a.right,a.back,a.front]),palette.dark);
 for(const o of KAGE_WALLS){
  box(o.width,o.height,o.depth,o.x,o.height/2,o.z,palette.dark);
  // Shallow, staggered strata use the outside cave's rock material.
  const alongX=o.width>o.depth,length=alongX?o.width:o.depth;
  for(let row=0;row<4;row++)for(let start=0;start<length;start+=1.8){
   const span=Math.min(1.76,length-start),offset=-length/2+start+span/2;
   box(alongX?span:o.width+.07,1.4,alongX?o.depth+.07:span,
    o.x+(alongX?offset:0),.8+row*1.6,o.z+(alongX?0:offset),row%3===1?palette.stone:palette.dark);
  }
 }
 // A fixed stone lintel frames an unobstructed passage; no entrance door.
 box(1.6,.35,.5,KAGE_ENTRANCE.x,4.625,KAGE_ENTRANCE.z,palette.stone);

 const gate=new THREE.Group();gate.name=`${definition.assetFolder}-barred-gate`;gate.position.set(KAGE_GATE.x,0,KAGE_GATE.z);root.add(gate);
 const width=KAGE_GATE.halfWidth*2;
 for(let x=-KAGE_GATE.halfWidth+.2;x<KAGE_GATE.halfWidth;x+=.4)box(.075,3.5,.12,x,1.75,0,iron,gate);
 for(const y of [.14,1.15,3.4])box(width,.11,.14,0,y,0,iron,gate);
 for(const side of [-1,1])box(.18,3.9,.4,KAGE_GATE.x+side*(KAGE_GATE.halfWidth+.09),1.95,KAGE_GATE.z,palette.metal);
 box(width+.36,.25,.4,KAGE_GATE.x,3.9,KAGE_GATE.z,palette.metal);
 box(width,KAGE_WALL_HEIGHT-4,.4,KAGE_GATE.x,(KAGE_WALL_HEIGHT+4)/2,KAGE_GATE.z,palette.dark);

 const plateMat=new THREE.MeshStandardMaterial({color:0x827d70,emissive:0x66502b,emissiveIntensity:.35});
 box(1.4,.28,1.4,KAGE_PLATE.x,.14,KAGE_PLATE.z,gold);
 box(1.25,.025,1.25,KAGE_PLATE.x,.29,KAGE_PLATE.z,plateMat);
 const loader=new THREE.TextureLoader();
 for(const [i,asset] of definition.pictures.entries()){
  const x=-8+i*3.8,h=asset.height,w=asset.width??3.4,y=h>2.2?4.5:4.25;
  box(w+.2,h+.2,.12,x,y,-22.86,gold);
  const texture=loader.load(`${import.meta.env.BASE_URL}memories/${definition.assetFolder}/${asset.file}`);texture.colorSpace=THREE.SRGBColorSpace;
  const picture=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
  picture.scale.x=definition.transform.scaleX;
  picture.name=`${definition.assetFolder}-picture-${i+1}`;picture.position.set(x,y,-22.79);root.add(picture);
 }
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=240;const c=canvas.getContext('2d')!;
 c.fillStyle='#2b2b2e';c.fillRect(0,0,1600,240);c.strokeStyle='#b69a60';c.lineWidth=8;c.strokeRect(4,4,1592,232);
 c.fillStyle='#fff3d6';c.font='bold 108px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(`What animal is ${definition.character}?`,800,120);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const question=new THREE.Mesh(new THREE.PlaneGeometry(10.6,1.59),new THREE.MeshBasicMaterial({map:texture}));question.scale.x=definition.transform.scaleX;question.position.set(-4.2,2.25,-22.8);root.add(question);
 // Visible lamps lead into the optional passage in both Kage and mirrored Luma.
 // Emissive faces remain visible on phones with shadows disabled.
 const lampMaterial=new THREE.MeshStandardMaterial({color:0xffd99b,emissive:0xffbd5e,emissiveIntensity:2.1,roughness:.5});
 for(const z of [-4.35,-8.2,-12.4]){
  for(const side of [-1,1]){
   box(.16,.65,.22,KAGE_ENTRANCE.x+side*.7,2.5,z,gold);
   const lamp=box(.1,.4,.25,KAGE_ENTRANCE.x+side*.66,2.5,z,lampMaterial);
   lamp.name=`${definition.assetFolder}-passage-lamp`;
  }
  const light=new THREE.PointLight(0xffd8a1,30,8,2);light.name=`${definition.assetFolder}-passage-light`;light.position.set(KAGE_ENTRANCE.x,2.8,z);root.add(light);
 }
 // Warm light now connects the doorway, corridor bend and gallery.
 for(const [x,z,intensity,range] of [[-13,-16,28,8],[-6,-17,85,18],[.3,-19.5,45,12]]){
  const light=new THREE.PointLight(0xffdbac,intensity,range,2);light.position.set(x,4.8,z);root.add(light);
 }
 const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:90},(_,i)=>i%3===0?-6+Math.sin(i*7)*6:i%3===1?.6+(i%11)*.38:-17+Math.cos(i*11)*4),3));
 const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xe6cc77,size:.045,transparent:true,opacity:.5}));root.add(particles);
 return {update(g:Game,time:number){gate.position.y=g.memory?.gateLift??0;plateMat.emissive.setHex(g.memory?.solved?0x36bfff:0x66502b);particles.position.y=Math.sin(time*.6)*.15;}};
}
