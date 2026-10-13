import * as THREE from 'three';
import {createWorldMaterials} from './world-materials.ts';
import {buildCaveShell} from './cave-shell.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildPuzzleCircuit,ACTIVE,DORMANT,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {wallGlyph} from './split-map.ts';
import {textMaterial} from './room.ts';
import {abilityLayout,ABILITY_SENTENCES,ABILITY_STEPS,ABILITY_SCALE,ABILITY_CAROUSELS,ABILITY_RECOVERY,type SentenceDefinition} from './ability-layout.ts';
import {buildSentenceCarousel} from './sentence-carousel-view.ts';
import type {Game} from './game.ts';

/** Same wordless action drawings as the action room, with recognizable hero armor colors. */
export function heroPicture(d:Pick<SentenceDefinition,'hero'|'action'>,pluralBlocks=false){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#202f39';c.fillRect(0,0,512,512);
 const color=d.hero==='mia'?'#ed6473':'#83caff';
 c.fillStyle=color;c.font='bold 48px sans-serif';c.textAlign='center';c.fillText(d.hero.toUpperCase(),256,60);
 c.strokeStyle=color;c.fillStyle=color;c.lineWidth=30;c.lineCap='square';c.lineJoin='miter';
 const line=(points:number[][])=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const head=(x:number,y:number)=>{c.fillStyle=d.hero==='mia'?'#b43c54':'#ccddec';c.fillRect(x,y,66,64);c.fillStyle='#ffe0b6';c.fillRect(x+12,y+25,42,29);c.fillStyle='#253039';c.fillRect(x+40,y+30,8,8);c.fillStyle=color;};
 if(d.action==='RUN'){
  head(263,117);line([[285,205],[230,278],[300,337],[357,392]]);line([[239,281],[171,350],[113,337]]);
  line([[276,213],[338,247],[375,199]]);line([[270,218],[205,203],[165,248]]);
  c.lineWidth=9;c.strokeStyle='#ffcc76';for(const y of [206,263,309])line([[58,y],[132,y]]);
 }else if(d.action==='LIFT'){
  c.fillStyle='#8c969c';c.fillRect(161,89,190,78);c.strokeStyle='#ff9c26';c.lineWidth=7;c.strokeRect(161,89,190,78);
  if(pluralBlocks){c.strokeRect(161,89,61,78);c.strokeRect(226,89,61,78);c.strokeRect(291,89,60,78);}
  head(230,206);c.strokeStyle=color;c.lineWidth=30;
  line([[259,291],[259,353],[212,431]]);line([[259,353],[311,431]]);line([[246,301],[190,243],[190,184]]);line([[273,301],[322,243],[322,184]]);
  c.strokeStyle='#ffcc76';c.lineWidth=8;line([[134,163],[134,102],[121,118]]);line([[380,163],[380,102],[393,118]]);
 }else{
  head(230,117);line([[260,209],[260,279],[204,313],[171,284]]);line([[260,277],[322,312],[360,281]]);
  line([[249,220],[199,178],[168,131]]);line([[271,220],[326,176],[351,127]]);
  c.strokeStyle='#49eaff';c.lineWidth=9;line([[102,405],[178,405]]);line([[335,405],[411,405]]);
  c.setLineDash([12,16]);line([[229,350],[229,405]]);line([[284,350],[284,405]]);c.setLineDash([]);
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshStandardMaterial({map:texture,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.4,roughness:.8});
}

export function buildAbilityHall(scene:THREE.Group){
 const palette=createWorldMaterials(),kit=volcanicBuilder(scene,palette),S=ABILITY_SCALE;
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=palette.dark,parent:THREE.Object3D=scene)=>kit.box(w*S,h,d*S,x*S,y,z*S,m,parent);
 const floors=(rects:number[][])=>kit.floors(rects.map(([l,r,b,f,y=0])=>[l*S,r*S,b*S,f*S,y]));
 const doorway=(x:number,z:number)=>kit.doorway(x*S,z*S);
 const shell=new THREE.Group();shell.position.z=2*S;scene.add(shell);buildCaveShell(shell,palette,24*S,26*S,15,1.8,abilityLayout.exitCenterX!);
 // Move only the east shell beside the widened main chamber; preserve the intro shell.
 shell.children.forEach(child=>{if(child instanceof THREE.InstancedMesh){const matrix=new THREE.Matrix4();for(let i=0;i<child.count;i++){child.getMatrixAt(i,matrix);if(matrix.elements[12]>33.6&&matrix.elements[14]+shell.position.z<14){matrix.elements[12]+=14.4;child.setMatrixAt(i,matrix);}}child.instanceMatrix.needsUpdate=true;child.computeBoundingSphere();}});
 kit.floors([[33.6,48,-33.6,14]]);
 kit.box(14.4,13,1.4,40.8,6.5,-35.4,palette.stone);
 const machines=ABILITY_CAROUSELS.map(c=>buildSentenceCarousel(scene,c,abilityLayout.sockets[c.brakeControlId]));
 for(const p of ABILITY_RECOVERY){kit.box(4.8,.04,3.2,p.x,-.02,p.z,palette.metal);for(const x of [-2.4,2.4])kit.box(.08,.04,3.2,p.x+x,.13,p.z,palette.energy);}
 floors([[-24,-3,10,28],[-24,24,4,10],[3,24,-24,4]]);
 for(const o of abilityLayout.obstacles!)kit.box(o.width,o.height,o.depth,o.x,o.height/2,o.z,palette.stone);
 // Offset basalt ribs break up the large inner wall while preserving its solid silhouette.
 for(let z=-21;z<=3;z+=3.4){box(.3,8+Math.abs(Math.sin(z))*4,1.3,3.12,4,z,palette.dark);}
 for(let x=-22;x<-3;x+=3){box(1.3,6+Math.abs(Math.sin(x))*5,.3,x,3.2,4.12,palette.dark);}
 for(const s of ABILITY_STEPS){kit.box(s.width,s.y,s.depth,s.x,s.y/2,s.z,palette.dark);kit.floors([[s.x-s.width/2,s.x+s.width/2,s.z-s.depth/2,s.z+s.depth/2,s.y]]);}
 // Lava follows outer edges; it never divides the language route.
 box(1,.13,52,-24.65,-.2,2,palette.lava);kit.box(1,.13,47.6,48.65,-.2,-9.8,palette.lava);
 box(20,.13,.8,-13.5,-.2,28.5,palette.lava);
 for(const [x,z] of [[-22,20],[-22,7],[22,7],[22,-11],[22,-21]]){const light=new THREE.PointLight(0xff8540,30,9);light.position.set(x*S,3,z*S);scene.add(light);}
 const door=kit.doorway(abilityLayout.exitCenterX!,abilityLayout.exitZ!);
 const paths=abilityLayout.sockets.map((s,i)=>{
  const d=ABILITY_SENTENCES.find(d=>d.slots.includes(i));
  const carousel=ABILITY_CAROUSELS.find(c=>c.brakeControlId===i);
  const end=carousel?new THREE.Vector3(carousel.position.x,.04,carousel.position.z+carousel.radius):i===15?new THREE.Vector3(.6*S,.04,7*S):d?.section===1?new THREE.Vector3(-.6*S,.04,7*S):d?.section===2?new THREE.Vector3(d.x,.04,-6.5*S):new THREE.Vector3(abilityLayout.exitCenterX!,.04,abilityLayout.exitZ!+.7);
  return [new THREE.Vector3(s.x,.04,s.z-1.15),new THREE.Vector3(s.x,.04,s.z-1.45),new THREE.Vector3(end.x,.04,s.z-1.45),end];
 });
 const circuit=buildPuzzleCircuit(scene,abilityLayout,door,palette.stone,paths,{segmentLength:.5,dynamicLights:false});
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8});
 const purple=glow(HERO_PLATE_PURPLE);
 const cornerGate=new THREE.Group();scene.add(cornerGate);cornerGate.position.set(0,0,7*S);
 // Room 4's open portcullis, rotated across the corner corridor.
 for(const z of [-3.2,3.2]){box(.9,7,.5,0,3.5,7+z,palette.metal);}
 box(1.2,.7,6.8,0,5.6,7,palette.metal);box(1.3,1.8,6.8,0,6.8,7);
 for(let z=-2.85;z<=2.9;z+=.6){
  box(.7,4.8,.16,0,2.4,z,palette.metal,cornerGate);
  box(.035,4.65,.035,.37,2.4,z,purple,cornerGate);
 }
 box(.7,.16,5.95,0,4.7,0,palette.metal,cornerGate);
 const buildGlow=glow(HERO_PLATE_PURPLE);
 const buildGate=new THREE.Group();scene.add(buildGate);buildGate.position.set(26.1,0,-7*S);
 for(let x=-21.6/S;x<=21.6/S;x+=.6){box(.16,4.8,.7,x,2.4,0,palette.metal,buildGate);box(.035,4.65,.035,x,2.4,.37,buildGlow,buildGate);}
 box(43.8/S,.16,.7,0,4.7,0,palette.metal,buildGate);
 for(const x of [3,48/S])box(.5,7,1.2,x,3.5,-7,palette.metal);
 box(44.3/S,.7,1.2,26.1/S,5.6,-7,palette.metal);
 const successGeometry=new THREE.BufferGeometry();const sparks=new Float32Array(36*3);
 for(let i=0;i<36;i++){sparks[i*3]=5+(i%18)*2.4;sparks[i*3+1]=.6+(i%5)*.4;sparks[i*3+2]=-7*S+.7+Math.sin(i)*.35;}
 successGeometry.setAttribute('position',new THREE.BufferAttribute(sparks,3));
 const successMaterial=new THREE.PointsMaterial({color:0xffdc72,size:.16,transparent:true,opacity:0,depthWrite:false});
 const success=new THREE.Points(successGeometry,successMaterial);success.visible=false;scene.add(success);
 const frames:THREE.MeshStandardMaterial[]=[];
 const panels=ABILITY_SENTENCES.map(d=>{
  const pic=kit.box(d.section===1?4.8:4.2,3.9,.12,d.x,4.35,d.z-1.45*S,heroPicture(d));
  const fixed:THREE.Mesh[]=[];
  const frame=glow(DORMANT);frames.push(frame);
  if(d.section!==1){
   for(const side of [-1,1]){
    kit.box(.08,.04,5.8,d.x+side*5.25,.04,d.z,frame);
    kit.box(10.5,.04,.08,d.x,.04,d.z+side*2.9,frame);
   }
  }
  if(d.section===1){
   d.slots.forEach((slot,i)=>{const q=abilityLayout.sockets[slot];fixed.push(kit.box(1.95,.75,.14,q.x,1.55,q.z-.65,textMaterial(d.answer[i],i===1?'#594276':'#25323d')));});
  }
  if(d.fixed){
   for(let i=0;i<2;i++)fixed.push(kit.box(1.95,1.05,.14,d.x+(i-1)*2.5*S,1.45,d.z-.3*S,textMaterial(d.answer[i],i===1?'#594276':'#25323d')));
   kit.box(1.8,.52,.12,d.x+2.5*S,.95,d.z-1.28*S,wallGlyph(d.action,1.8,.52));
  }
  const sentence=kit.box(d.section===1?7.1:6.6,.68,.14,d.x,6.8,d.z-1.43*S,wallGlyph(d.answer.join(' ')+'.',6.6,.68,'#49eaff'));sentence.visible=false;
  const period=kit.box(.13,.13,.13,d.x+3.55*S,.65,d.z,palette.energy);period.visible=false;
  return {pic,fixed,sentence,period};
 });

 // Modest arch above the reveal rather than three ability stations.
 box(21,.8,.8,13.5,11,3.5,palette.dark);
 const vertices=new Float32Array(48*3);for(let i=0;i<48;i++){vertices[i*3]=i<16?-15+(i%8)*1.2:4+(i%12);vertices[i*3+1]=.6+(i%9)*.6;vertices[i*3+2]=i<16?7+(i%8)*2:7-(i%24)*1.25;vertices[i*3]*=S;vertices[i*3+2]*=S;}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
 const embers=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xffb35c,size:.025,transparent:true,opacity:.5,depthWrite:false}));scene.add(embers);
 return {door,circuit,socketMaterials:circuit.socketMaterials,tiles:[],embers,lava:palette.lava,palette,
  ability:{update(g:Game,time:number){
   const a=g.ability!;machines.forEach((m,i)=>m.update(a.carousels[i]));cornerGate.position.y=a.gateLift;buildGate.position.y=a.buildLift;
   const celebration=a.buildCelebration/3;
   buildGlow.color.setHex(a.buildOpen?0xffd568:HERO_PLATE_PURPLE);buildGlow.emissive.copy(buildGlow.color);buildGlow.emissiveIntensity=.8+celebration*(1+Math.sin(time*9)*.4);
   success.visible=celebration>0;success.position.y=(1-celebration)*3;success.scale.setScalar(1+(1-celebration)*.4);successMaterial.opacity=celebration;
   circuit.update(g.layout.sockets.map((_,i)=>g.slotFeedback(i)==='correct'),g.conduitProgress,g.doorPowered,time,g.doorCharge,
    g.layout.sockets.map((s,i)=>({plateDormantColor:s.acceptedActivator!=='HERO'&&g.slotFeedback(i)==='wrong'?0xf04418:undefined,activeColor:s.acceptedActivator==='HERO'?HERO_PLATE_PURPLE:ACTIVE,dormantColor:s.acceptedActivator==='HERO'?HERO_PLATE_PURPLE:DORMANT})));
   panels.forEach((p,i)=>{
    frames[i].color.setHex(a.completed[i]?ACTIVE:DORMANT);frames[i].emissive.copy(frames[i].color);
    p.sentence.visible=a.completed[i];p.period.visible=a.completed[i];
    const pulse=a.completed[i]?Math.sin(Math.min(1,g.conduitProgress[ABILITY_SENTENCES[i].slots[0]]*2)*Math.PI):0;
    p.pic.position.y=4.35+pulse*.12;p.pic.rotation.z=ABILITY_SENTENCES[i].action==='RUN'?pulse*.04:0;
    (p.pic.material as THREE.MeshStandardMaterial).emissiveIntensity=a.wrongTime[i]>0?.65:.4+pulse*.8;
    p.fixed.forEach(m=>{const material=m.material as THREE.MeshStandardMaterial;material.emissive.setHex(a.completed[i]?ACTIVE:0xffffff);material.emissiveIntensity=a.completed[i]?1:.25;});
   });
  }}
 };
}
