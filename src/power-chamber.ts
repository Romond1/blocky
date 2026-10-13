import {buildKageAlcove} from './kage-alcove-view.ts';
import {KAGE_AREAS} from './kage-alcove.ts';
import {buildMovingBridge} from './moving-bridge.ts';
import {entranceText,paintEntrancePrompt} from './entrance-prompts.ts';
import * as THREE from 'three';
import {TUTORIAL_GAP,HELP_BUTTONS,nearHelpButton,nearJumpDitch} from './split-mechanics.ts';
import {paintRoomMap,wallGlyph,ROOM_COLORS} from './split-map.ts';
import {textMaterial} from './room.ts';
import {basaltFloor} from './split-art.ts';
import { buildCaveShell } from './cave-shell.ts';
import { createWorldMaterials } from './world-materials.ts';
import { buildPuzzleCircuit, ACTIVE, DORMANT } from './puzzle-visuals.ts';
import { powerLayout } from './puzzles.ts';
import type { Game } from './game.ts';

/** Authored banks and readable, entrance-aligned floor schematic. */
export function buildPowerChamber(scene:THREE.Group){
 const palette=createWorldMaterials(),geo=new THREE.BoxGeometry(1,1,1);
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material=palette.stone)=>{
  const mesh=new THREE.Mesh(geo,mat);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;scene.add(mesh);return mesh;
 };
 buildCaveShell(scene,palette,18,30,10,1.6,-10);
 // Solid volcanic banks stop at the nearer rear wall. Cutouts match the stairwell and jump gap.
 const floors=[[-18,-8,-4.5,15],[-8,-3,-4.5,5],[-8,-3,9,15],[-18,-3,15,TUTORIAL_GAP.far],[-14,-6,TUTORIAL_GAP.near,30],[9,18,-4.5,30],[-3,9,-4.5,30,-3]];
 for(const [left,right,back,front,y=0] of floors)box(right-left,.7,front-back,(left+right)/2,y-.35,(back+front)/2,palette.dark);
 basaltFloor(scene,floors.filter(r=>r.length===4),palette.dark);
 // A continuous, striped lower surface contrasts with the tiled upper banks, as on the map.
 const lower=new THREE.MeshStandardMaterial({color:ROOM_COLORS.ravine,roughness:1});
 box(12,.025,34.5,3,-2.985,12.75,lower);
 const lowerStripe=new THREE.MeshStandardMaterial({color:ROOM_COLORS.ravineStripe,roughness:1});
 for(let z=-3;z<30;z+=1.4)box(11.9,.012,.035,3,-2.965,z,lowerStripe);
 // Muted bank-edge bands match the two filled map regions without changing the floor tiles.
 const nearBand=new THREE.MeshStandardMaterial({color:ROOM_COLORS.near,roughness:1});
 const farBand=new THREE.MeshStandardMaterial({color:ROOM_COLORS.far,roughness:1});
 for(const [z,d] of [[2.5,5],[12,6]])box(.26,.022,d,-3.18,.022,z,nearBand);
 box(.26,.022,34.4,9.18,.022,12.75,farBand);
 box(8,.2,1,-10,-.8,(TUTORIAL_GAP.far+TUTORIAL_GAP.near)/2,palette.lava);
 for(const z of [TUTORIAL_GAP.far-.03,TUTORIAL_GAP.near+.03])box(8,.06,.09,-10,.03,z,palette.hot);
 for(const o of powerLayout.obstacles!.filter(o=>!o.id.startsWith('kage-')))box(o.width,o.height,o.depth,o.x,o.height/2,o.z,palette.dark);
 // Actual treads and risers over the continuous walk-up collision incline.
 // Small 15cm risers keep the visible feet close to the smooth ramp height.
 for(let i=0;i<20;i++){
  const x=-8+(i+.5)*.25,top=-i*.15-.075;
  box(.25,3+top,4,x,(-3+top)/2,7,palette.dark);
  box(.22,.025,3.9,x,top+.012,7,palette.stone);
  box(.035,.025,3.9,x-.1,top+.029,7,palette.metal);
 }
 for(const [x,z,d] of [[-3,2.5,5],[-3,15,12],[9,10.5,21]])box(.12,.08,d,x,.04,z,palette.metal);
 // Full-height basalt wall, with a door opening on the near bank and four narrow slab ports.
 const wallZ=-4.5;
 const wall=(left:number,right:number,bottom:number,top:number)=>box(right-left,top-bottom,5,(left+right)/2,(bottom+top)/2,wallZ-2.5,palette.dark);
 const passage=KAGE_AREAS[0];
 wall(-18,passage.left,-3,11);wall(passage.right,-15.7,-3,11);wall(passage.left,passage.right,4.8,11);
 wall(-12.3,-3,-3,11);wall(9,18,-3,11);wall(-15.7,-12.3,5,11);
 wall(-3,9,-3,-.65);wall(-3,9,.24,11);
 for(let i=0;i<=4;i++)box(.13,.9,.45,-3+i*3,-.2,wallZ+.03,palette.metal);
 // Irregular rock courses join the mechanisms into the room wall, rather than a climbable plinth.
 for(let row=0;row<5;row++)for(let col=0;col<13;col++){
  const x=-17+col*2.7+(row%2)*.35,y=1.4+row*2;
  if(x-1.4<passage.right&&x+1.4>passage.left&&y<6)continue;
  if(x> -16.8&&x< -11.2&&y<6)continue;
  const rock=box(2.5+(col%3)*.12,1.7+(col%2)*.15,.3+(col%3)*.13,x,y,wallZ+.03,palette.dark);rock.rotation.z=Math.sin(col*7+row)*.035;
 }
 const slabMat=new THREE.MeshStandardMaterial({color:0x566771,roughness:.65,emissive:DORMANT,emissiveIntensity:.12});
 const railMat=new THREE.MeshStandardMaterial({color:DORMANT,emissive:DORMANT,emissiveIntensity:.8});
 const bridgeConduit=new THREE.MeshStandardMaterial({color:DORMANT,emissive:DORMANT,emissiveIntensity:.8});
 const movingBridge=buildMovingBridge(scene,slabMat,railMat,bridgeConduit);
 const door=new THREE.Group();door.position.set(-14,0,wallZ);scene.add(door);
 for(const x of [-15.85,-12.15])box(.6,5,.8,x,2.5,wallZ+.08,palette.metal);
 box(4.4,.6,1,-14,5,wallZ,palette.metal);box(3,.4,4,-14,-.2,wallZ-2,palette.dark);
 for(const x of [-15.75,-12.25])box(.5,6,4,x,3,wallZ-2,palette.dark);
 box(3.5,6,.4,-14,3,wallZ-4,palette.dark);
 // No conduit travels behind the wall. Mia's circuit terminates at the moving crossing.
 const path=(points:number[][])=>points.map(([x,z])=>new THREE.Vector3(x,.055,z));
 const circuit=buildPuzzleCircuit(scene,{...powerLayout,sockets:powerLayout.sockets.slice(0,2)},door,palette.stone,[
  path([[-12,1.9],[-12,0],[-14,0],[-14,-4.35]]),
  path([[12.9,-1],[12.5,-1],[12.5,-2],[9,-2]]),
 ]);
 function panel(lines:string[],w:number,h:number,x:number,y:number,z:number){
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=300;const c=canvas.getContext('2d')!;
  c.fillStyle='#15252e';c.fillRect(0,0,1200,300);c.strokeStyle='#74c8d0';c.lineWidth=8;c.strokeRect(8,8,1184,284);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff3d9';
  lines.forEach((line,i)=>{let size=90;c.font=`bold ${size}px sans-serif`;while(c.measureText(line).width>1120)c.font=`bold ${--size}px sans-serif`;c.fillText(line,600,150+(i-(lines.length-1)/2)*130);});
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;
 }
 // Puzzle language is fixed to the rock wall, with Room 1's bordered letter style.
 const miaTiles=['J','U','_','P'].map((letter,i)=>box(1.15,1.15,.22,12.15+i*1.28,3.25,-4.02,textMaterial(letter,'#252f35','#ffac55')));
 const miaAnswer=textMaterial('M','#252f35','#49eaff');
 const yukiWords=[['YUKI',2.05],['IS',.95],['SUPER',2.35],['_',2.4]] as const;
 let wordX=-12.05;
 const yukiTiles=yukiWords.map(([word,width])=>{const mesh=box(width,1.1,.22,wordX+width/2,3.25,-4.02,wallGlyph(word,width,1.1));wordX+=width+.13;return mesh;});
 const yukiAnswer=wallGlyph('STRONG',2.4,1.1,'#49eaff');
 const miaMissing=miaTiles[2].material,yukiMissing=yukiTiles[3].material;
 // Keep alternate materials in the room disposal traversal without drawing them.
 for(const material of [miaAnswer,yukiAnswer,miaMissing,yukiMissing]){const spare=box(.01,.01,.01,0,-10,0,material);spare.visible=false;}
 const helpButtons=HELP_BUTTONS.map((p,i)=>{
  const material=textMaterial('?','#253542','#fff0ad');
  const button=box(1.65,1.65,.2,p.x,2,p.z,material);button.rotation.y=i===0?Math.PI/2:-Math.PI/2;
  const label=panel([],3.1,.62,p.x,3.25,p.z);label.rotation.y=button.rotation.y;
  paintEntrancePrompt(label.material.map!.image as HTMLCanvasElement,entranceText.info);label.material.map!.needsUpdate=true;
  return button;
 });
 const jumpHelper=panel([],3.6,.72,-10,2.8,TUTORIAL_GAP.far);
 paintEntrancePrompt(jumpHelper.material.map!.image as HTMLCanvasElement,entranceText.jump);jumpHelper.material.map!.needsUpdate=true;
 box(.12,.04,9,3,-2.96,2.5,palette.energy);box(6,.04,.12,0,-2.96,7,palette.energy);
 const recoveryLight=new THREE.PointLight(0x86dfe9,28,16,2);recoveryLight.position.set(3,-.5,5);scene.add(recoveryLight);
 const locks=[0,1].map(i=>{const m=new THREE.MeshStandardMaterial({color:DORMANT,emissive:DORMANT,emissiveIntensity:1});box(.55,.55,.15,-14+(i? .65:-.65),4.3,-3.97,m);return m;});
 // Branches visibly connect each pressure plate to its bridge terminal.
 const branchMaterials=[0,1].map(()=>new THREE.MeshStandardMaterial({color:DORMANT,emissive:DORMANT,emissiveIntensity:1}));
 box(9,.04,.12,-7.5,.055,0,branchMaterials[0]);box(.12,.04,3,-12,.055,1.5,branchMaterials[0]);box(.12,.04,2,-3.08,.055,-1,branchMaterials[0]);
 // Fixed terminal pads meet the slab-carried central conduit only when fully extended.
 box(8.8,.035,.12,-7.4,.055,-2,branchMaterials[1]);box(.12,.035,1.9,-11.8,.055,-2.95,branchMaterials[1]);box(1.55,.035,.12,-12.575,.055,-3.9,branchMaterials[1]);
 const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1100;const c=canvas.getContext('2d')!;
 const mapTexture=new THREE.CanvasTexture(canvas);mapTexture.colorSpace=THREE.SRGBColorSpace;mapTexture.anisotropy=8;
 const map=new THREE.Mesh(new THREE.PlaneGeometry(8.5,5.4),new THREE.MeshBasicMaterial({map:mapTexture}));map.rotation.x=-Math.PI/2;map.position.set(-10,.055,12);scene.add(map);
 box(8.7,.06,5.6,-10,.015,12,palette.metal);
 let lastMap='';
 function drawMap(g:Game){
  const key=`${g.stageSolved}/${Math.round(g.bridge.extension*30)}`;if(key===lastMap)return;lastMap=key;
  paintRoomMap(c,g);mapTexture.needsUpdate=true;
 }
 const emberGeo=new THREE.BufferGeometry();emberGeo.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:180},(_,i)=>i%3===1?(i%9)+1:Math.sin(i*17)*18),3));
 const embers=new THREE.Points(emberGeo,new THREE.PointsMaterial({color:0xffba6b,size:.035}));scene.add(embers);
 for(const [x,z] of [[-10,12],[-11,-5],[14,-5],[3,5]]){const light=new THREE.PointLight(0xaadfff,35,20,2);light.position.set(x,5,z);scene.add(light);}
 const alcove=buildKageAlcove(scene,palette);
 return {palette,lava:palette.lava,embers,door,circuit,socketMaterials:circuit.socketMaterials,tiles:[] as THREE.Mesh[],doorScale:1,
  power:{update(g:Game,time=0){
   alcove.update(g,time);
   movingBridge.update(g.bridge.extension);
   bridgeConduit.color.setHex(g.solved?ACTIVE:DORMANT);bridgeConduit.emissive.setHex(g.solved?ACTIVE:DORMANT);
   slabMat.emissive.setHex(g.solved?ACTIVE:DORMANT);railMat.color.setHex(g.solved?ACTIVE:DORMANT);railMat.emissive.setHex(g.solved?ACTIVE:DORMANT);
   miaTiles[2].material=g.stageSolved[1]?miaAnswer:miaMissing;yukiTiles[3].material=g.stageSolved[0]?yukiAnswer:yukiMissing;
   locks.forEach((m,i)=>{const color=g.stageSolved[i]?ACTIVE:DORMANT;m.color.setHex(color);m.emissive.setHex(color);branchMaterials[i].color.setHex(color);branchMaterials[i].emissive.setHex(color);});
   jumpHelper.visible=!g.motion[g.controlledHero].crossed&&nearJumpDitch(g.player);
   helpButtons.forEach(button=>{const m=button.material as THREE.MeshStandardMaterial;m.emissiveIntensity=nearHelpButton(g.player)?.65:.25;});
   drawMap(g);
  }},
 };
}
