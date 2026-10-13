import * as THREE from 'three';
import {TUTORIAL_GAP} from './split-mechanics.ts';
import type { Game } from './game.ts';

export const ROOM_COLORS={near:'#657580',far:'#8a7166',ravine:'#252c36',ravineStripe:'#48515d',stairs:'#b2b5b3',wall:'#101820',bridge:'#d28643',stable:'#49c9d4'};

/** One world-coordinate plan: north wall, banks, stairwell and entrance match the real footprint. */
export function paintRoomMap(c:CanvasRenderingContext2D,g:Game){
 const sx=34,sz=29,ox=700,oz=215;
 const x=(v:number)=>ox+v*sx,z=(v:number)=>oz+v*sz;
 const rect=(l:number,r:number,b:number,f:number,color:string)=>{c.fillStyle=color;c.fillRect(x(l),z(b),(r-l)*sx,(f-b)*sz);};
 const line=(points:number[][],color:string,width=7)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([px,pz],i)=>i?c.lineTo(x(px),z(pz)):c.moveTo(x(px),z(pz)));c.stroke();};
 const amber='#ffac55',cyan='#49eaff',a=g.stageSolved[0],b=g.stageSolved[1];
 c.fillStyle='#111a23';c.fillRect(0,0,1400,1100);c.strokeStyle='#829aa3';c.lineWidth=5;c.strokeRect(18,18,1364,1064);
 // Broad filled banks make height and separation readable without labels.
 rect(-18,18,-4.5,30,ROOM_COLORS.ravine);
 for(let rz=-3;rz<30;rz+=1.4)line([[-3,rz],[9,rz]],ROOM_COLORS.ravineStripe,3);
 rect(-18,-8,-4.5,15,ROOM_COLORS.near);rect(-8,-3,-4.5,5,ROOM_COLORS.near);rect(-8,-3,9,TUTORIAL_GAP.far,ROOM_COLORS.near);rect(-18,-3,15,TUTORIAL_GAP.far,ROOM_COLORS.near);
 rect(-14,-6,TUTORIAL_GAP.near,30,ROOM_COLORS.near);rect(9,18,-4.5,30,ROOM_COLORS.far);
 // Sparse matching basalt joints, clipped to the two upper banks.
 c.save();c.beginPath();c.rect(x(-18),z(-4.5),10*sx,19.5*sz);c.rect(x(9),z(-4.5),9*sx,34.5*sz);c.clip();
 for(let rz=-3;rz<30;rz+=2.4)line([[-18,rz],[18,rz]],'#26333b',2);
 for(let rx=-17;rx<18;rx+=2.7)line([[rx,-4.5],[rx+.7,30]],'#26333b',2);c.restore();
 // The wall closes the plan directly behind the moving slabs: no phantom rear gallery.
 rect(-18,18,-6,-4.5,ROOM_COLORS.wall);
 rect(-8,-3,5,9,ROOM_COLORS.stairs);
 for(let i=0;i<=20;i++)line([[-8+i*.25,5],[-8+i*.25,9]],'#3d464f',3);
 line([[3,-2],[3,7],[-3,7]],'#73929c',4);
 // Two independent circuits, including Mia's route across the bridge.
 line([[-12,3],[-12,0],[-14,0],[-14,-4.5]],a?cyan:amber);
 line([[-12,3],[-12,0],[-3,0],[-3,-2]],a?cyan:amber);
 line([[14,-1],[12.5,-1],[12.5,-2],[9,-2]],b?cyan:amber);
 line([[-3,-2],[-11.8,-2],[-11.8,-3.9],[-13.35,-3.9]],b?cyan:amber);
 // Muted filled landing footprints keep the crossing identifiable even while retracted.
 for(let i=0;i<4;i++){
  const l=-3+i*3;rect(l+.09,l+2.91,-4,0,'#574334');
  c.strokeStyle='#b98a52';c.lineWidth=3;c.setLineDash([7,6]);c.strokeRect(x(l+.09),z(-4),2.82*sx,4*sz);c.setLineDash([]);
 }
 // Filled slabs animate in the same direction as the actual crossing.
 const extension=g.bridge.extension,back=-4-(1-extension)*4.5;
 c.save();c.beginPath();c.rect(x(-3),z(-4.5),12*sx,4.5*sz);c.clip();
 for(let i=0;i<4;i++){
  const left=-3+i*3;
  rect(left+.09,left+2.91,back,back+4,b?ROOM_COLORS.stable:ROOM_COLORS.bridge);
  line([[left+.12,back+2],[left+2.88,back+2]],b?cyan:amber,6);
  line([[left+.85,back+.8],[left+1.5,back+.3],[left+2.15,back+.8],[left+1.5,back+1.3],[left+.85,back+.8]],'#f9d5a0',3);
 }c.restore();
 // Distinct plate symbols: large word block and small letter block.
 for(const [i,p] of g.layout.sockets.entries()){
  rect(p.x-1.05,p.x+1.05,p.z-1.05,p.z+1.05,g.stageSolved[i]?cyan:amber);
  const size=i===0?.63:.36;rect(p.x-size,p.x+size,p.z-size,p.z+size,'#293740');
  if(g.stageSolved[i]){c.fillStyle=cyan;c.font='bold 30px sans-serif';c.textAlign='center';c.fillText('✓',x(p.x),z(p.z)+10);}
 }
 // Door, its two locks and the entrance marker are pictograms only.
 rect(-15.5,-12.5,-5.4,-4.45,'#ddd5b6');rect(-15.15,-12.85,-5.4,-4.6,g.solved?'#66cad0':'#25323a');
 [a,b].forEach((on,i)=>rect(-15.1+i*1.4,-14.25+i*1.4,-6.3,-5.7,on?cyan:amber));
 rect(-14,-6,TUTORIAL_GAP.far,TUTORIAL_GAP.near,'#ef7927');
 line([[-14,TUTORIAL_GAP.far],[-6,TUTORIAL_GAP.far]],amber,4);line([[-14,TUTORIAL_GAP.near],[-6,TUTORIAL_GAP.near]],amber,4);
 c.fillStyle='#f5f1db';c.beginPath();c.moveTo(x(-10),z(22.3));c.lineTo(x(-10.65),z(23.6));c.lineTo(x(-9.35),z(23.6));c.closePath();c.fill();
 // Tiny footprints reinforce the starting location without a reading task.
 for(const dx of [-.28,.28]){c.beginPath();c.ellipse(x(-10+dx),z(25),6,12,0,0,Math.PI*2);c.fill();}
}

/** Same border, typeface and missing-answer box as Room 1, proportioned for words. */
export function wallGlyph(text:string,width:number,height:number,foreground='#ffac55'){
 const canvas=document.createElement('canvas');canvas.height=512;canvas.width=Math.round(512*width/height);const c=canvas.getContext('2d')!;
 c.fillStyle='#252f35';c.fillRect(0,0,canvas.width,512);c.strokeStyle='#c4a777';c.lineWidth=12;c.strokeRect(24,24,canvas.width-48,464);
 c.fillStyle=foreground;c.textAlign='center';c.textBaseline='middle';let size=300;c.font=`bold ${size}px sans-serif`;
 while(c.measureText(text).width>canvas.width-100)c.font=`bold ${--size}px sans-serif`;
 if(text==='_'){c.strokeStyle=foreground;c.lineWidth=8;c.setLineDash([20,15]);c.strokeRect(60,65,canvas.width-120,375);c.setLineDash([]);}
 c.fillText(text,canvas.width/2,266);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.22,roughness:.8});
}
