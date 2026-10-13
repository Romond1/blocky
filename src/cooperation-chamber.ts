import * as THREE from 'three';
import {createWorldMaterials} from './world-materials.ts';
import {buildCaveShell} from './cave-shell.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildMovingBridge} from './moving-bridge.ts';
import {buildPuzzleCircuit,ACTIVE,DORMANT,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {wallGlyph} from './split-map.ts';
import {cooperationLayout} from './puzzles.ts';
import {COOP_GATE,STACK_AREA} from './cooperation.ts';
import type {Game} from './game.ts';

/** A connected court, longitudinal crossing and color workshop built from the existing volcanic kit. */
export function buildCooperationChamber(scene:THREE.Group){
 const palette=createWorldMaterials();
 const {box,floors,stair,doorway}=volcanicBuilder(scene,palette);
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.45});
 buildCaveShell(scene,palette,11,26,10,1.8);
 // Leave the entire recovery incline open through the upper bank.
 const banks=[[-11,5,3,26],[9,11,3,26],[5,9,8,26],[-11,11,-26,-9]];
 floors(banks);
 box(22,.7,12,0,-3.35,-3);
 const lower=new THREE.MeshStandardMaterial({color:0x465b66,roughness:1});box(22,.025,12,0,-2.985,-3,lower);
 for(let z=-8.5;z<3;z+=1.2)box(21.8,.012,.04,0,-2.965,z,palette.metal);
 // Lava belongs to the surrounding rock moat; the recovery floor itself is safe.
 for(const side of [-1,1]){
  box(1.2,.15,52,side*11.7,-.2,0,palette.lava);
  for(const z of [21,7,-16]){const light=new THREE.PointLight(0xff7136,35,11,2);light.position.set(side*11.3,2,z);scene.add(light);}
 }
 for(const o of cooperationLayout.obstacles!){const foundation=o.id==='bridge-housing'?3:0;box(o.width,o.height+foundation,o.depth,o.x,(o.height-foundation)/2,o.z);}
 // Familiar portcullis bars reveal the opposite court, with a collision-matching rising assembly.
 for(const x of [-2.25,2.25])box(.5,7,1.25,x,3.5,15,palette.metal);
 box(5.1,.7,1.25,0,5.6,15,palette.metal);box(5.2,1.8,1.3,0,6.8,15);
 const gate=new THREE.Group();gate.position.z=COOP_GATE.z;scene.add(gate);
 const gateEnergy=glow(HERO_PLATE_PURPLE);
 for(let i=0;i<7;i++){
  const x=-1.8+i*.6;box(.16,4.8,.7,x,2.4,0,palette.metal,gate);
  box(.035,4.65,.035,x,2.4,.37,gateEnergy,gate);
 }
 box(3.95,.16,.7,0,4.7,0,palette.metal,gate);
 // Recovery stair shares a continuous collision incline with small visible treads.
 stair(7,3,8,4);
 box(.1,.04,8,7,-2.955,-1,palette.energy);
 box(7,.04,.1,3.5,-2.955,-5,palette.energy);
 const returnLight=new THREE.PointLight(0x89e4e8,40,16,2);returnLight.position.set(7,-.5,1);scene.add(returnLight);
 // Dark recessed slots frame the shared mechanism's four slab outlets.
 const slotMaterial=new THREE.MeshBasicMaterial({color:0x0c121b});
 for(let i=0;i<4;i++){
  const z=1.5-i*3;box(.08,.85,2.86,-3.055,-.22,z,slotMaterial);
  for(const y of [-.66,.22])box(.1,.06,2.95,-3.015,y,z,palette.metal);
 }
 // Slabs slide from the west housing into a four-unit-wide northbound path.
 const bridgeRoot=new THREE.Group();bridgeRoot.position.set(0,0,0);bridgeRoot.rotation.y=Math.PI/2;scene.add(bridgeRoot);
 const slabMaterial=new THREE.MeshStandardMaterial({color:0x566771,roughness:.65,emissive:DORMANT,emissiveIntensity:.12});
 const rail=glow(DORMANT),bridgeConduit=glow(DORMANT);
 const bridge=buildMovingBridge(bridgeRoot,slabMaterial,rail,bridgeConduit);
 // Orange footprints show the crossing before its slabs extend.
 const ghost=new THREE.MeshBasicMaterial({color:DORMANT,transparent:true,opacity:.18,depthWrite:false});
 for(let i=0;i<4;i++)box(4,.025,2.98,0,-2.93,1.5-i*3,ghost);
 for(const z of [3,-9])box(4.4,.07,.13,0,.035,z,palette.metal);
 const door=doorway(0,-26);
 const path=(ps:number[][])=>ps.map(([x,z])=>new THREE.Vector3(x,.035,z));
 const circuit=buildPuzzleCircuit(scene,cooperationLayout,door,palette.stone,[
  path([[-3,19.9],[-3,17.1],[-1.9,17.1],[-1.9,15.1]]),
  path([[3,12.1],[3,13.5],[1.9,13.5],[1.9,14.9]]),
  path([[-5,4.9],[-5,4.2],[0,4.2],[0,3.1]]),
  path([[0,-10.9],[0,-9.1]]),
 ]);
 // Purple rims are deliberately unmistakable, even before activation.
 const purpleRims=[0,1,3].map(i=>{
  const s=cooperationLayout.sockets[i],material=glow(HERO_PLATE_PURPLE);
  for(const sign of [-1,1]){box(.09,.04,2.25,s.x+sign*1.12,.095,s.z,material);box(2.25,.04,.09,s.x,.095,s.z+sign*1.12,material);}
  return {index:i,material};
 });
 const workshopTrim=glow(DORMANT);
 const {left,right,back,front}=STACK_AREA;
 for(const x of [left,right])box(.1,.04,front-back,x,.035,(front+back)/2,workshopTrim);
 for(const z of [back,front])box(right-left,.04,.1,0,.035,z,workshopTrim);
 // Existing engraved word tiles, with no illustrated answer or extra sentence.
 const wordTiles=[['GREEN',2.5],['ON',1.1],['RED',2.1]] as const;
 let cursor=-3.02;
 const signs=wordTiles.map(([word,width])=>{const m=wallGlyph(word,width,1.15);const tile=box(width,1.15,.2,cursor+width/2,3.1,-25.2,m);cursor+=width+.16;return tile;});
 box(6.5,1.5,.4,0,3.1,-25.5);
 const signSolved=wordTiles.map(([word,width])=>wallGlyph(word,width,1.15,'#49eaff'));
 const signDormant=signs.map(s=>s.material);
 for(const material of signSolved){const spare=box(.01,.01,.01,0,-10,0,material);spare.visible=false;}
 const finalEnergy=glow(DORMANT);
 box(.13,.045,1.75,5.8,.04,-24.85,finalEnergy);box(5.8,.045,.13,2.9,.04,-25.65,finalEnergy);
 const seals=[0,1,2].map(i=>{const m=glow(DORMANT);const seal=box(.48,.48,.12,-.75+i*.75,4.45,-25.45,m);seal.rotation.z=Math.PI/4;return m;});
 // Stage seals also mark each architectural threshold, not a large HUD checklist.
 const nearSeals=[0,1,2].map(i=>{const m=glow(DORMANT);const seal=box(.28,.28,.12,-.5+i*.5,5.6,15.66,m);seal.rotation.z=Math.PI/4;return m;});
 const emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:180},(_,i)=>i%3===1?(i%9)+1:i%3===0?Math.sin(i*17)*11:Math.sin(i*13)*26),3));
 const embers=new THREE.Points(emberGeometry,new THREE.PointsMaterial({color:0xffba6b,size:.035}));scene.add(embers);
 for(const z of [22,10,-13,-22]){const l=new THREE.PointLight(0xaadfff,38,20,2);l.position.set(0,5,z);scene.add(l);}
 const colorSignals=(g:Game)=>cooperationLayout.sockets.map((s,i)=>{
  const stable=i<2?g.stageSolved[0]:g.cooperation!.bridgeLocked;
  return {activeColor:stable?ACTIVE:s.acceptedActivator==='HERO'?HERO_PLATE_PURPLE:ACTIVE,dormantColor:s.acceptedActivator==='HERO'?HERO_PLATE_PURPLE:DORMANT};
 });
 return {palette,lava:palette.lava,embers,door,socketMaterials:circuit.socketMaterials,tiles:[] as THREE.Mesh[],
  circuit,
  cooperation:{update(g:Game,time:number){
   gate.position.y=g.cooperation!.gateLift;
   const bridgeColor=g.cooperation!.bridgeLocked?ACTIVE:DORMANT;
   bridge.update(g.bridge.extension,8,0); // Local X maps to longitudinal Z.
   [slabMaterial,rail,bridgeConduit].forEach(m=>{m.emissive.setHex(bridgeColor);});rail.color.setHex(bridgeColor);bridgeConduit.color.setHex(bridgeColor);
   gateEnergy.color.setHex(g.stageSolved[0]?ACTIVE:HERO_PLATE_PURPLE);gateEnergy.emissive.copy(gateEnergy.color);
   purpleRims.forEach(({index,material})=>{const stable=index<2?g.stageSolved[0]:g.cooperation!.bridgeLocked;material.color.setHex(stable?ACTIVE:HERO_PLATE_PURPLE);material.emissive.copy(material.color);});
   signs.forEach((s,i)=>s.material=g.stageSolved[2]?signSolved[i]:signDormant[i]);
   [workshopTrim,finalEnergy].forEach(m=>{m.color.setHex(g.stageSolved[2]?ACTIVE:DORMANT);m.emissive.copy(m.color);});
   [seals,nearSeals].forEach(set=>set.forEach((m,i)=>{m.color.setHex(g.stageSolved[i]?ACTIVE:DORMANT);m.emissive.copy(m.color);}));
   circuit.update(g.layout.sockets.map((_,i)=>g.slotFeedback(i)==='correct'),g.conduitProgress,g.doorPowered,time,g.doorCharge,colorSignals(g));
  }},
 };
}
