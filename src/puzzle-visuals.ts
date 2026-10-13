import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { RoomLayout } from './puzzles.ts';
export const HERO_PLATE_PURPLE=0x7024d8;
export const DORMANT=0xff650a, ACTIVE=0x49eaff;
const glow=()=>new THREE.MeshStandardMaterial({color:DORMANT,emissive:DORMANT,emissiveIntensity:.8,roughness:.4});
/** Rock remains neutral; only the carved glyph emits the puzzle state colour. */
export function rockGlyph(text:string){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#000';c.fillRect(0,0,512,512);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';let size=340;c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>430)c.font=`bold ${--size}px Georgia`;c.fillText(text,256,270);
 const mask=new THREE.CanvasTexture(canvas);
 const rock=document.createElement('canvas');rock.width=rock.height=512;const r=rock.getContext('2d')!;
 r.fillStyle='#424b50';r.fillRect(0,0,512,512);
 for(let i=0;i<6500;i++){const v=50+(i*37%45);r.fillStyle=`rgba(${v},${v+6},${v+9},.25)`;r.fillRect((i*73)%512,(i*137)%512,3+i%13,2+i%7);}
 r.strokeStyle='#242b30';r.lineWidth=3;for(let i=0;i<9;i++){r.beginPath();r.moveTo(i*71%512,0);r.lineTo(i*53%512,80+i*29);r.lineTo(i*97%512,140+i*37);r.stroke();}
 const map=new THREE.CanvasTexture(rock);map.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshStandardMaterial({map,roughness:.95,emissiveMap:mask,emissive:DORMANT,emissiveIntensity:2});
}
export const blockGeometry=(size:number)=>new RoundedBoxGeometry(size,size,size,3,.07);
/** One reusable orange-to-cyan circuit for every room, including future layouts. */
export function buildPuzzleCircuit(scene:THREE.Group|THREE.Scene,layout:RoomLayout,door:THREE.Group,stone:THREE.Material,authoredPaths?:THREE.Vector3[][],options:{segmentLength?:number;dynamicLights?:boolean;scaleToPlate?:boolean}={}){
 const plateGroups:THREE.Group[]=[], rings:THREE.Mesh[]=[], lights:THREE.PointLight[]=[], sparks:THREE.Group[]=[];
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const hc=haloCanvas.getContext('2d')!;
 const gradient=hc.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(.4,'rgba(255,255,255,.3)');gradient.addColorStop(1,'rgba(255,255,255,0)');hc.fillStyle=gradient;hc.fillRect(0,0,128,128);const haloTexture=new THREE.CanvasTexture(haloCanvas);
 const additive=(opacity=0)=>new THREE.MeshBasicMaterial({color:ACTIVE,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 const socketMaterials:THREE.MeshStandardMaterial[]=[], beams:THREE.Mesh[]=[], paths:{mesh:THREE.Mesh,material:THREE.MeshStandardMaterial,t:number}[][]=[];
 function mesh(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material,parent:THREE.Object3D=scene){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.06,h/3)),mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;}
 for(const s of layout.sockets){
  const firstChild=scene.children.length;
  mesh(2.3,.22,2.3,s.x,.11,s.z,stone);const mat=glow();socketMaterials.push(mat);mesh(1.98,.065,1.98,s.x,.25,s.z,mat);
  for(const sign of [-1,1]){mesh(.15,.16,2.25,s.x+sign*1.06,.23,s.z,stone);mesh(2.25,.16,.15,s.x,.23,s.z+sign*1.06,stone);}
  const group=new THREE.Group();group.position.set(s.x,0,s.z);const parts=scene.children.slice(firstChild);scene.add(group);parts.forEach(p=>group.attach(p));group.position.y=s.y??0;plateGroups.push(group);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.45,1.55,4,1,Math.PI/4),additive());ring.rotation.x=-Math.PI/2;ring.position.set(s.x,(s.y??0)+.045,s.z);scene.add(ring);rings.push(ring);
  const light=new THREE.PointLight(ACTIVE,0,7,2);light.position.set(s.x,(s.y??0)+1.2,s.z);if(options.dynamicLights!==false)scene.add(light);lights.push(light);
  const burst=new THREE.Group();burst.position.set(s.x,s.y??0,s.z);scene.add(burst);sparks.push(burst);const sparkMaterial=additive(.8);
  for(let n=0;n<16;n++){const particle=new THREE.Mesh(new THREE.OctahedronGeometry(.045),sparkMaterial);burst.add(particle);}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(1.95,1.25,1.95),new THREE.MeshBasicMaterial({color:ACTIVE,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(s.x,(s.y??0)+.9,s.z);scene.add(beam);beams.push(beam);
  const terminalX=(layout.exitCenterX??0)+(layout.sockets.length>1?Math.sign(s.x)*.65:0),branchZ=-layout.halfDepth+.65+paths.length*.45;
  const innerX=s.x-Math.sign(s.x)*1.3;
  const points=authoredPaths?.[paths.length]??[new THREE.Vector3(s.x,.035,s.z-1.1),new THREE.Vector3(innerX,.035,s.z-1.9),new THREE.Vector3(innerX,.035,branchZ),new THREE.Vector3(terminalX,.035,branchZ),new THREE.Vector3(terminalX,.035,-layout.halfDepth+.1)];
  const length=points.slice(1).reduce((n,p,i)=>n+p.distanceTo(points[i]),0),segments:typeof paths[number]=[];let walked=0;
  for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],dist=a.distanceTo(b),count=Math.ceil(dist/(options.segmentLength??.22));for(let k=0;k<count;k++){const center=a.clone().lerp(b,(k+.5)/count),m=glow();const angle=Math.atan2(b.x-a.x,b.z-a.z),t=(walked+dist*k/count)/length;
    const line=mesh(.22,.045,dist/count+.012,center.x,center.y,center.z,m);line.rotation.y=angle;segments.push({mesh:line,material:m,t});
    // Small parallel tracks and outward teeth make the route read as a circuit.
    if(k%4<3)for(const side of [-1,1]){const rail=mesh(.065,.03,dist/count+.012,center.x+Math.cos(angle)*side*.32,center.y+.005,center.z-Math.sin(angle)*side*.32,m);rail.rotation.y=angle;}
    if(k%5===0){const tooth=mesh(.85,.03,.06,center.x,center.y+.005,center.z,m);tooth.rotation.y=angle;}
}walked+=dist;}paths.push(segments);
 }
 // An original engraved sun/diamond seal and radial runes, attached to the rising slab.
 const rune=glow(),width=layout.exitHalfWidth*1.8,height=layout.doorTravel-.4;
 door.clear();mesh(width,height,.5,0,height/2,0,stone,door);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(width*.29,.065,6,64),rune);ring.position.set(0,height*.52,.28);door.add(ring);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.sin(a)*width*.39,y=height*.52+Math.cos(a)*width*.39;const mark=mesh(.045,.23,.04,x,y,.29,rune,door);mark.rotation.z=-a;}
 const seal=mesh(width*.27,width*.27,.08,0,height*.52,.3,rune,door);seal.rotation.z=Math.PI/4;
 for(const side of [-1,1]){mesh(.08,height*.32,.05,side*width*.16,height*.82,.29,rune,door);mesh(.08,height*.32,.05,side*width*.16,height*.18,.29,rune,door);mesh(width*.28,.08,.05,side*width*.36,height*.52,.29,rune,door);}
 const doorAura=new THREE.Mesh(new THREE.PlaneGeometry(width*2.3,height*1.6),new THREE.MeshBasicMaterial({map:haloTexture,color:ACTIVE,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));doorAura.position.set(0,height*.52,.36);door.add(doorAura);
 const doorLight=new THREE.PointLight(ACTIVE,0,14,2);doorLight.position.set(0,height*.55,1.4);door.add(doorLight);
 return {socketMaterials,update(correct:boolean[],progress:number[],powered:boolean,time:number,doorCharge=0,signals?:{activeColor:number;dormantColor:number;plateDormantColor?:number}[]){
  socketMaterials.forEach((m,i)=>{
   const p=progress[i],pulse=correct[i]?Math.sin(Math.min(1,p*3.4)*Math.PI):0,color=correct[i]?(signals?.[i]?.activeColor??ACTIVE):(signals?.[i]?.plateDormantColor??signals?.[i]?.dormantColor??DORMANT);
   m.color.setHex(color);m.emissive.setHex(color);m.emissiveIntensity=correct[i]?1.3+pulse*2:.8;
   lights[i].color.setHex(color);
   if(layout.sockets[i].acceptedActivator==='HERO')plateGroups[i].scale.y=.32;
   // A spring-like swell, followed by a sustained powered rim; collision stays stable.
   const footprint=options.scaleToPlate?(layout.sockets[i].halfSize??1.05)/1.05:1;
   plateGroups[i].scale.set(footprint*(1+pulse*.22),(layout.sockets[i].acceptedActivator==='HERO'?.32:1)*(1+pulse*.3),footprint*(1+pulse*.22));
   (beams[i].material as THREE.MeshBasicMaterial).opacity=correct[i]?.07+pulse*.14:0;beams[i].scale.y=1+pulse*.8;
   rings[i].scale.setScalar(1+p*1.8);(rings[i].material as THREE.MeshBasicMaterial).opacity=correct[i]?(1-p)*.75:0;
   (rings[i].material as THREE.MeshBasicMaterial).color.setHex(color);(beams[i].material as THREE.MeshBasicMaterial).color.setHex(color);sparks[i].children.forEach(p=>((p as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(color));
   lights[i].intensity=correct[i]&&options.dynamicLights!==false?8+pulse*35:0;
   sparks[i].visible=correct[i]&&p<1;sparks[i].children.forEach((particle,n)=>{const a=n*Math.PI/8,r=1+p*1.5;particle.position.set(Math.cos(a)*r,.3+Math.sin(p*Math.PI)*(1+n%3*.35),Math.sin(a)*r);particle.scale.setScalar(1-p*.7);});
   paths[i].forEach(s=>{const active=p>s.t,color=active?(signals?.[i]?.activeColor??ACTIVE):(signals?.[i]?.dormantColor??DORMANT),front=Math.max(0,1-Math.abs(p-s.t)/.14);s.material.color.setHex(color);s.material.emissive.setHex(color);s.material.emissiveIntensity=active?1.2+front*4+Math.max(0,Math.sin(s.t*26-time*7))*.7:.8;s.mesh.scale.y=1+front*3;});
  });
  rune.color.setHex(powered?ACTIVE:DORMANT);rune.emissive.setHex(powered?ACTIVE:DORMANT);rune.emissiveIntensity=powered?1.3+Math.sin(doorCharge*Math.PI)*2.3:.8;
  (doorAura.material as THREE.MeshBasicMaterial).opacity=powered?.12+Math.sin(doorCharge*Math.PI)*.3:0;
  doorLight.intensity=powered?25+Math.sin(doorCharge*Math.PI)*55:0;
 }};
}
