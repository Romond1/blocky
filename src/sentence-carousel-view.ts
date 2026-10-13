import * as THREE from 'three';
import {SentenceCarousel,type SentenceCarouselConfig} from './sentence-carousel.ts';
/** Visible mechanics driven by the reusable simulation, with swiveling readable trays. */
export function buildSentenceCarousel(parent:THREE.Object3D,c:SentenceCarouselConfig,control:{x:number;z:number}){
 const root=new THREE.Group();root.position.set(c.position.x,0,c.position.z);parent.add(root);
 const metal=new THREE.MeshStandardMaterial({color:0x71828e,metalness:.65,roughness:.38});
 const dark=new THREE.MeshStandardMaterial({color:0x273740,metalness:.55,roughness:.65});
 const accent=new THREE.MeshStandardMaterial({color:c.direction===1?0xffa840:0x49eaff,emissive:c.direction===1?0xffa840:0x49eaff,emissiveIntensity:.6});
 const brake=new THREE.MeshStandardMaterial({color:0xaa6dff,emissive:0xaa6dff,emissiveIntensity:.45});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=metal,p:THREE.Object3D=root)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;};
 const cylinder=(r:number,h:number,y:number,m:THREE.Material,p:THREE.Object3D=root)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),m);mesh.position.y=y;mesh.receiveShadow=true;p.add(mesh);return mesh;};
 const fence=new SentenceCarousel(c);
 for(const body of fence.fenceBodies()){const mesh=box(body.halfX*2,body.halfY*2,body.halfZ*2,body.x-c.position.x,body.y,body.z-c.position.z,metal);mesh.rotation.y=body.yaw;}
 for(const port of c.pickupPorts??[])for(const side of [-1,1]){
  const angle=port.angle+port.halfAngle*side;
  box(.085,1.25,.085,Math.cos(angle)*fence.fenceRadius,.63,Math.sin(angle)*fence.fenceRadius,accent);
 }
 cylinder(c.radius+.65,.14,.07,dark);
 const rotor=new THREE.Group();root.add(rotor);
 cylinder(1.65,.9,.65,dark,rotor);cylinder(1.78,.12,1.16,metal,rotor);
 cylinder(.55,1.5,.85,metal);cylinder(.7,.13,1.63,accent);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(c.radius,.12,4,48),metal);ring.rotation.x=Math.PI/2;ring.position.y=.25;rotor.add(ring);
 const bearings:THREE.Group[]=[];
 c.wordBlocks.forEach((_,i)=>{
  const angle=i*Math.PI*2/c.wordBlocks.length;
  const arm=box(c.radius-1.15,.2,.23,Math.cos(angle)*(c.radius+1.15)/2,.25,Math.sin(angle)*(c.radius+1.15)/2,metal,rotor);arm.rotation.y=-angle;
  const tray=new THREE.Group();tray.position.set(Math.cos(angle)*c.radius,0,Math.sin(angle)*c.radius);rotor.add(tray);bearings.push(tray);
  box(1.35,.16,1.35,0,.28,0,metal,tray);
  for(const side of [-1,1])box(1.4,.045,.07,0,.37,side*.65,accent,tray);
  cylinder(.21,.18,.17,accent,tray);
 });
 for(let i=0;i<12;i++){const a=i*Math.PI/6,gear=box(.22,.2,.48,Math.cos(a)*1.8,1.07,Math.sin(a)*1.8,metal,rotor);gear.rotation.y=-a;}
 const clamps:THREE.Mesh[]=[];
 for(const side of [-1,1])clamps.push(box(.35,.35,1.4,side*1.98,.7,0,brake));
 // Low orange/cyan rim marks the hero exclusion footprint, without hiding trays.
 const rim=new THREE.Mesh(new THREE.TorusGeometry(c.radius+.65,.035,4,48),accent);rim.rotation.x=Math.PI/2;rim.position.y=.16;root.add(rim);
 const controlX=control.x-c.position.x,controlZ=control.z-c.position.z,length=Math.hypot(controlX,controlZ);
 const ux=controlX/length,uz=controlZ/length;
 for(let r=c.radius+.75;r<length-1.1;r+=.45){const segment=box(.13,.025,.32,ux*r,.03,uz*r,brake);segment.rotation.y=Math.atan2(ux,uz);}
 for(const side of [-1,1]){const edge=box(.09,.035,2.25,controlX+uz*side*.8,.09,controlZ-ux*side*.8,brake);edge.rotation.y=Math.atan2(ux,uz);}
 const light=new THREE.PointLight(c.direction===1?0xffa840:0x49eaff,18,13);light.position.set(0,3,0);root.add(light);
 return {update(machine:SentenceCarousel){rotor.rotation.y=-machine.angle;bearings.forEach(tray=>tray.rotation.y=machine.angle);
  brake.emissiveIntensity=machine.braked?1.7:.45;clamps.forEach((m,i)=>m.position.x=(i?1:-1)*(machine.braked?1.82:1.98));
  accent.emissiveIntensity=machine.stopped?.45:.65;
 }};
}
