import * as THREE from 'three';
import {heartShardGeometry,heartMaterial} from './heart-crystal.ts';
import type {Game} from './game.ts';
import type {Economy} from './economy.ts';
import {ROOM_COLLECTIBLES,type CollectibleDefinition} from './collectible-data.ts';
import {collectibleVisible} from './collectibles.ts';

/** One resource kit per room: all coins share meshes' geometries and materials. */
export function createCollectibleView(root:THREE.Group,game:Game,economy:Economy){
 const token=new THREE.CylinderGeometry(.34,.34,.13,20);token.rotateX(Math.PI/2);
 const rim=new THREE.TorusGeometry(.28,.025,4,20);
 const stroke=new THREE.BoxGeometry(1,1,1);
 const gold=new THREE.MeshStandardMaterial({color:0xffc53f,metalness:.65,roughness:.3,emissive:0xd89419,emissiveIntensity:.32});
 const mark=new THREE.MeshStandardMaterial({color:0xfff2a5,metalness:.45,roughness:.35,emissive:0xffc348,emissiveIntensity:.35});
 const shardGeometry=heartShardGeometry();
 const glass=heartMaterial();
 const coreGeometry=new THREE.OctahedronGeometry(.16);
 const core=new THREE.MeshBasicMaterial({color:0xffef9b});
 const sparkGeometry=new THREE.OctahedronGeometry(.035);
 const flashGeometry=new THREE.TorusGeometry(.45,.045,4,24);
 const flashMaterial=new THREE.MeshBasicMaterial({color:0xffe785,transparent:true,opacity:.7,depthWrite:false});
 const entries=(ROOM_COLLECTIBLES[game.puzzle.id]??[]).map((definition,index)=>{
  const group=new THREE.Group();group.name=definition.id;
  const sparks:THREE.Mesh[]=[];
  if(definition.type==='coin'){
   group.add(new THREE.Mesh(token,gold));
   for(const face of [-1,1]){
    const edge=new THREE.Mesh(rim,mark);edge.position.z=face*.08;group.add(edge);
    for(const [x,y,w,h] of [[-.085,0,.045,.28],[.085,0,.045,.28],[0,0,.17,.045]]){
     const line=new THREE.Mesh(stroke,mark);line.scale.set(w,h,.025);line.position.set(x,y,face*.083);group.add(line);
    }
   }
  }else if(definition.type==='memoryCrystal'){
   const blue=new THREE.MeshStandardMaterial({color:0x39baff,emissive:0x167bea,emissiveIntensity:1.2,metalness:.3,roughness:.12});const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.65),blue);crystal.scale.y=1.7;group.add(crystal);group.add(new THREE.PointLight(0x39baff,9,5,2));for(let i=0;i<5;i++){const spark=new THREE.Mesh(sparkGeometry,blue);group.add(spark);sparks.push(spark);}
  }else{
   group.add(new THREE.Mesh(shardGeometry,glass),new THREE.Mesh(coreGeometry,core));
   const glow=new THREE.PointLight(0xffcd42,3,3.5,2);group.add(glow);
   for(let i=0;i<5;i++){const spark=new THREE.Mesh(sparkGeometry,core);group.add(spark);sparks.push(spark);}
  }
  const flash=new THREE.Mesh(flashGeometry,definition.type==='memoryCrystal'?new THREE.MeshBasicMaterial({color:0x69cfff,transparent:true,opacity:.7,depthWrite:false}):flashMaterial);flash.visible=false;root.add(flash,group);
  return {definition,group,flash,sparks,phase:index*1.7,age:-1,from:new THREE.Vector3(),target:new THREE.Vector3()};
 });
 const scratch=new THREE.Vector3();
 return {
  collect(c:CollectibleDefinition){
   const entry=entries.find(e=>e.definition.id===c.id);if(!entry)return;
   const {position:p}=c;entry.age=0;entry.from.set(p.x,p.y+(c.type==='coin'?1.15:1.65),p.z);
   entry.target.set(game.player.x,game.motion[game.controlledHero].y+1.5,game.player.z);
   entry.flash.position.copy(entry.target);entry.flash.visible=true;entry.group.visible=true;
  },
  update(dt:number,time:number){
   for(const e of entries){
    const shard=e.definition.type!=='coin';
    if(e.age>=0){
     e.age+=dt;const duration=shard?.55:.3,t=Math.min(1,e.age/duration);
     e.group.position.lerpVectors(e.from,e.target,1-(1-t)**3);e.group.scale.setScalar(Math.max(.001,1-t*t));e.group.rotation.y+=dt*12;
     e.flash.scale.setScalar(.4+t*(shard?3:1.5));e.flash.lookAt(scratch.set(e.target.x,e.target.y+1,e.target.z+5));
     e.group.visible=t<1;e.flash.visible=t<1;
     continue;
    }
    e.flash.visible=false;e.group.visible=collectibleVisible(e.definition,game,economy);
    if(!e.group.visible)continue;
    const p=e.definition.position;
    e.group.position.set(p.x,p.y+(shard?1.65:1.15)+Math.sin(time*2.4+e.phase)*.12,p.z);
    const proximity=Math.max(0,1-Math.hypot(game.player.x-p.x,game.player.z-p.z)/3);
    e.group.scale.setScalar(1+(shard?proximity*.12:0));e.group.rotation.y=time*(shard?.65:2.4)+e.phase;
    e.group.rotation.z=shard?Math.sin(time+e.phase)*.12:0;
    e.sparks.forEach((spark,i)=>{const a=time*.7+i*Math.PI*2/5;spark.position.set(Math.cos(a)*.5,Math.sin(time*1.5+i)*.55,Math.sin(a)*.5);});
   }
  },
  reset(){for(const e of entries){e.age=-1;e.group.scale.setScalar(1);e.flash.visible=false;}},
  snapshot(){return entries.map(e=>({id:e.definition.id,type:e.definition.type,position:e.definition.position,collected:economy.has(e.definition.id),visible:e.group.visible}));},
 };
}
