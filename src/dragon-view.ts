import {DRAGON_RAILS} from './dragon-terrain.ts';
import {WEST} from './dragon-west.ts';
import * as THREE from 'three';
import {volcanicBuilder} from './volcanic-kit.ts';
import {createWorldMaterials} from './world-materials.ts';
import {buildSentenceCarousel} from './sentence-carousel-view.ts';
import {heroPicture} from './ability-hall-view.ts';
import {fruitPicture} from './fruit-pictures.ts';
import {heartGeometry} from './heart-crystal.ts';
import {DRAGON_ALTAR,DRAGON_ENDING_Z,DRAGON_LIFT} from './dragon-layout.ts';
import {DRAGON_CAROUSEL,DRAGON_PANELS,DRAGON_CONTROLS,DRAGON_SLABS,DRAGON_BRIDGE,DRAGON_GATE,DRAGON_GATE_SHOULDERS,dragonFloor,dragonHeight} from './dragon-layout.ts';
import type {Game} from './game.ts';
function portalLabel(text:string,subtitle=false){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='#14202a';c.fillRect(0,0,1024,128);c.strokeStyle='#ffda7c';c.lineWidth=4;c.strokeRect(3,3,1018,122);c.fillStyle='#eeeaff';c.textAlign='center';c.textBaseline='middle';c.font=`${subtitle?'400 40':'700 48'}px 'Arial Black', sans-serif`;c.fillText(text,512,64,960);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.22,roughness:.8});}

function routeArrowMaterial(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d')!;
 c.fillStyle='#14202a';c.fillRect(0,0,512,128);c.strokeStyle='#ffda7c';c.lineWidth=5;c.strokeRect(3,3,506,122);
 c.fillStyle='#ffda7c';c.font='bold 108px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('←',132,65);c.fillText('→',380,65);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.35});
}

/** Finale machinery layered onto the existing volcanic shell and central lake. */
export function buildDragonMachinery(scene:THREE.Group,g:Game){
 const palette=createWorldMaterials(),{box}=volcanicBuilder(scene,palette);
 const cyan=new THREE.MeshStandardMaterial({color:0x49eaff,emissive:0x22d9e7,emissiveIntensity:.8});
 const purple=new THREE.MeshStandardMaterial({color:0xaa6dff,emissive:0xaa6dff,emissiveIntensity:.65});
 const dormant=new THREE.MeshStandardMaterial({color:0x31313d,metalness:.6,roughness:.5});
 const emerald=new THREE.MeshStandardMaterial({color:0x5cf6ae,emissive:0x39e689,emissiveIntensity:.4});
 const gold=new THREE.MeshStandardMaterial({color:0xffda7c,emissive:0xcc9b37,emissiveIntensity:.4,metalness:.65});
 const railMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),palette.metal,DRAGON_RAILS.length);
 const posts=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),palette.dark,DRAGON_RAILS.length);
 const railTransform=new THREE.Object3D();
 DRAGON_RAILS.forEach((r,i)=>{railTransform.position.set(r.x,r.y+.35,r.z);railTransform.rotation.set(0,r.yaw,0);railTransform.scale.set(r.halfX*2,.12,.16);railTransform.updateMatrix();railMesh.setMatrixAt(i,railTransform.matrix);railTransform.position.y=r.y;railTransform.scale.set(.13,r.halfX<.4&&i%5!==0?0:1,.13);railTransform.updateMatrix();posts.setMatrixAt(i,railTransform.matrix);});
 railMesh.name='dragon-guardrails';posts.name='dragon-guardrail-posts';scene.add(railMesh,posts);
 const f=g.finale!.dragon!;
 const machine=buildSentenceCarousel(scene,DRAGON_CAROUSEL,DRAGON_CONTROLS[5]);
 // The original machine's axle is extended into a monumental volcanic pillar.
 box(3.5,24,4,-26,17,-19,palette.hot);box(5,.7,5,-26,28,-19,palette.dark);
 // Lift the familiar carousel and word trays to the elevated gallery.
 const carouselRoot=scene.children.find(o=>o.position.x===-26&&o.position.z===-19);if(carouselRoot)carouselRoot.position.y=5;
 const gate=new THREE.Group();gate.position.set(DRAGON_GATE.x,0,DRAGON_GATE.z);gate.rotation.y=DRAGON_GATE.yaw;scene.add(gate);
 for(let x=-13;x<=13;x+=.65){box(.18,6,.8,x,3,0,palette.metal,gate);box(.04,5.6,.05,x,3,.43,purple,gate);}
 box(26,.22,.8,0,5.9,0,palette.metal,gate);
 for(const shoulder of DRAGON_GATE_SHOULDERS){const wall=box(shoulder.halfX*2,shoulder.halfY*2,shoulder.halfZ*2,shoulder.x,shoulder.y,shoulder.z,palette.dark);wall.rotation.y=shoulder.yaw;}
 // Visible slab tops match the forgiving jump gaps in simulation.
 const slabs=DRAGON_SLABS.map(s=>{const root=new THREE.Group();scene.add(root);box(s.width,.5,s.depth,s.x,-.25,s.z,palette.dark,root);box(s.width-.2,.04,s.depth-.2,s.x,.02,s.z,purple,root);return root;});
 const ferry=new THREE.Group();ferry.name='dragon-ferry';ferry.position.x=33;scene.add(ferry);box(5,.45,5,0,-.275,0,palette.dark,ferry);box(5,.05,5,0,-.005,0,palette.stone,ferry);
 for(const x of [30.4,35.6]){box(.14,.15,23,x,-.12,7.5,palette.metal);box(.055,.03,23,x,0,7.5,purple);}
 const lift=new THREE.Group();lift.name='dragon-lift';lift.position.set(DRAGON_LIFT.x,0,DRAGON_LIFT.z);scene.add(lift);const deck=DRAGON_LIFT.half*2;
 box(deck,.45,deck,0,-.275,0,palette.dark,lift);const eastDeck=box(deck,.05,deck,0,-.005,0,dormant,lift);
 for(const x of [DRAGON_LIFT.x-DRAGON_LIFT.half-.15,DRAGON_LIFT.x+DRAGON_LIFT.half+.15]){
  box(.22,9,.22,x,4,DRAGON_LIFT.z-DRAGON_LIFT.half,palette.metal);box(.07,8,.07,x+.14,4,DRAGON_LIFT.z-DRAGON_LIFT.half,purple);
 }
 // A broad, outlined deck and matching lower control make the loading area legible.
 for(const side of [-1,1])box(.12,.04,deck-.25,side*(DRAGON_LIFT.half-.12),.045,0,purple,lift);
 box(deck-.25,.04,.12,0,.045,DRAGON_LIFT.half-.12,purple,lift);
 // Court and dock are part of the shared floor. Gallery backing sits below its top.
 box(3.6,.67,10,25.8,3.635,-16,palette.dark);
 // A visible five-unit cliff, without sockets or a prescribed staircase.
 box(5,4,1.1,27,2,-18.5,palette.dark);
 for(const p of DRAGON_PANELS){const pic=p.picture==='APPLE'?fruitPicture('APPLE'):heroPicture({hero:p.picture==='RUN'?'mia':'yuki',action:p.picture} as Parameters<typeof heroPicture>[0],p.picture==='LIFT');
  box(4,3.2,.2,p.x,p.y+3.2,p.z-2.2,pic);box(4.3,3.5,.35,p.x,p.y+3.2,p.z-2.4,palette.metal);
  box(4.3,1.5,.35,p.x,p.y+.75,p.z-2.4,palette.dark);
 }
 const westGate=new THREE.Group();westGate.position.set(-31,0,26);scene.add(westGate);
 for(let x=-10;x<=10;x+=.65)box(.18,6,.5,x,3,0,palette.metal,westGate);
 const wheel=new THREE.Group();wheel.position.set(WEST.x,0,WEST.wheelZ);scene.add(wheel);
 // Two vertical rims and spokes; passenger trays remain horizontal.
 for(const x of [-3.25,3.25]){
  const rim=new THREE.Mesh(new THREE.TorusGeometry(WEST.radius,.16,8,64),gold);rim.rotation.y=Math.PI/2;rim.position.x=x;wheel.add(rim);
  box(.18,WEST.radius*2,.18,x,0,0,palette.metal,wheel);box(.18,.18,WEST.radius*2,x,0,0,palette.metal,wheel);
 }
 const trays=Array.from({length:4},()=>{const root=new THREE.Group();root.name='west-wheel-deck';scene.add(root);box(6,.25,4,0,-.15,0,palette.stone,root);for(const x of [-2.9,2.9])box(.1,.08,3.8,x,.04,0,gold,root);return root;});
 const westLift=new THREE.Group();westLift.position.set(WEST.x,0,WEST.liftZ);scene.add(westLift);const westDeck=box(7,.45,7,0,-.25,0,dormant,westLift);westLift.name='west-apple-lift';
 for(const x of [-33.7,-26.3])box(.16,7,.16,x,2.5,-5.5,palette.metal);
 const westBridge=new THREE.Group();westBridge.name='west-lateral-shuttle';scene.add(westBridge);box(5,.4,4,0,4.75,-10,palette.stone,westBridge);for(const x of [-2.4,2.4])box(.12,.1,4,x,5.08,-10,purple,westBridge);
 const sign=(text:string,x:number,z:number,base:number,width=5.5)=>{
  const root=new THREE.Group();root.name='dragon-sign-'+text;root.position.set(x,base,z);scene.add(root);
  box(width+.2,1.05,.25,0,2.2,0,palette.metal,root);box(width,.85,.06,0,2.2,.16,portalLabel(text),root);box(width,.85,.06,0,2.2,-.16,portalLabel(text),root);
  for(const dx of [-width*.35,width*.35])box(.16,1.85,.16,dx,.925,0,palette.metal,root);
 };
 for(const [text,x,z,base] of [['HOLD TO OPEN',-31,29,0],['STEP OFF, THEN ON',-25,19.5,0],['HELP YOUR PARTNER',-23,5,0],['RED APPLE → LIFT',-38,-5,0],['RIDE · STEP OFF',-36,-7,5],['CALL / BOARD',-23,-2,0],['UP / DOWN',-37,-7,5],['BUILD STEPS · CLIMB UP',40,-17,0],['UNLOCK THE LIFT',25,-19,4]] as const)sign(text,x,z,base);

 const routeSign=box(4.5,1,.12,0,1.65,27,routeArrowMaterial());routeSign.name='dragon-route-arrows';box(.15,1.1,.15,0,.55,27,palette.metal);
 const altarZ=DRAGON_ALTAR.z;
 const nodes=Array.from({length:4},(_,i)=>{const x=(i-1.5)*2.3;box(1.6,1,1.5,x,6,altarZ+3,palette.metal);const node=new THREE.Mesh(new THREE.OctahedronGeometry(.8),dormant);node.position.set(x,7.8,altarZ+3);scene.add(node);return node;});
 const bridge=new THREE.Group();bridge.name='dragon-final-bridge';scene.add(bridge);
 DRAGON_BRIDGE.slice(1).forEach((b,i)=>{const a=DRAGON_BRIDGE[i],length=Math.hypot(b.x-a.x,b.z-a.z),root=new THREE.Group();root.position.set((a.x+b.x)/2,5,(a.z+b.z)/2);root.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);bridge.add(root);
  box(6.4,.6,length+.4,0,-.33,0,palette.dark,root);box(6.4,.05,length+.4,0,-.005,0,palette.stone,root);
  for(const side of [-1,1]){box(.16,.1,length,side*3,.15,0,gold,root);for(let z=-length/2;z<length/2;z+=3)box(.16,.9,.16,side*3,.45,z,emerald,root);}
 });
 box(9,.97,6,0,4.485,altarZ,palette.dark);box(4,.15,3.5,0,5.075,altarZ,gold);
 const outline=new THREE.Mesh(heartGeometry(),new THREE.MeshStandardMaterial({color:0x8cf0b6,emissive:0x4ee9a1,emissiveIntensity:.65,wireframe:true}));outline.position.set(0,6.5,altarZ);outline.scale.setScalar(1.2);scene.add(outline);
 const energy:THREE.Mesh[]=[];
 for(let i=0;i<160;i++){const a=i*Math.PI*2/160,p={x:Math.sin(a)*31,z:Math.cos(a)*31};if(dragonFloor(p)<0)continue;const m=box(.16,.05,.55,p.x,dragonFloor(p)+.05,p.z,dormant);m.rotation.y=a;energy.push(m);}
 const veins:THREE.Mesh[]=[];
 for(const [x,z] of [[-16,-7],[17,5],[-5,17],[8,-17],[-26,-19]])veins.push(box(.13,19,.13,x+1.8,9,z,cyan));
 const portalRoot=new THREE.Group();scene.add(portalRoot);
 
 for(const [side,x] of [['left',-7],['right',7]] as const){const isContinue=(side==='left')===f.continueLeft;const accent=isContinue?cyan:emerald;const portalMaterial=new THREE.MeshStandardMaterial({color:isContinue?0x49eaff:0x5cf6ae,emissive:isContinue?0x22d9e7:0x39e689,emissiveIntensity:.7,transparent:true,opacity:.42,side:THREE.DoubleSide});
  box(5,.4,6,x,4.8,DRAGON_ENDING_Z,palette.dark,portalRoot);
  for(const dx of [-1.8,1.8])box(.4,4.8,.4,x+dx,7.4,DRAGON_ENDING_Z+1,accent,portalRoot);
  box(4,.4,.4,x,9.8,DRAGON_ENDING_Z+1,palette.metal,portalRoot);box(3.3,4.3,.08,x,7.3,DRAGON_ENDING_Z+1,portalMaterial,portalRoot);
  box(5.6,1.05,.35,x,10.25,DRAGON_ENDING_Z+1,palette.metal,portalRoot);
  for(const face of [-1,1])box(5.4,.85,.08,x,10.25,DRAGON_ENDING_Z+1+face*.22,portalLabel(isContinue?'EXPLORE MORE':'RETURN HOME'),portalRoot);
  // Large geometric badges use the same block materials as the door frames.
  for(const face of [-1,1]){const badgeZ=DRAGON_ENDING_Z+1+face*.15;
  box(2.2,2.2,.16,x,7.5,badgeZ,palette.dark,portalRoot);
  if(isContinue){
   const diamond=box(1.05,1.05,.12,x,7.5,badgeZ+face*.14,accent,portalRoot);diamond.rotation.z=Math.PI/4;
   const needle=box(.16,1.45,.16,x,7.5,badgeZ+face*.25,gold,portalRoot);needle.rotation.z=-Math.PI/5;
  }else{
   box(1.25,.95,.12,x,7.25,badgeZ+face*.14,accent,portalRoot);
   for(const dir of [-1,1]){const roof=box(1.05,.22,.12,x+dir*.36,7.98,badgeZ+face*.14,accent,portalRoot);roof.rotation.z=-dir*Math.PI/4;}
   box(.32,.6,.13,x,7.08,badgeZ+face*.23,palette.dark,portalRoot);
  }}
 }
 const glow=new THREE.PointLight(0x67ffac,0,70,2);glow.position.set(0,8,altarZ);scene.add(glow);
 return {update(time:number){westGate.position.y=f.west.gateLift;wheel.rotation.x=-f.west.wheel.angle;trays.forEach((t,i)=>{const p=f.west.wheel.pose(i);t.position.set(p.x,p.y,p.z);});westLift.position.y=f.west.lift.y;westBridge.visible=f.west.crossing;westBridge.position.x=f.west.shuttleX;westDeck.material=f.west.liftUnlocked?purple:dormant;machine.update(f.carousel);gate.position.y=f.gateLift;ferry.position.z=f.ferryZ;lift.position.y=f.liftY;eastDeck.material=f.liftUnlocked?purple:dormant;slabs.forEach(s=>s.position.y=f.slabsActive?0:-4);
  bridge.visible=f.bridgeReady;portalRoot.visible=f.restored;outline.visible=!f.restored;
  nodes.forEach((n,i)=>{n.material=f.locks[i]?cyan:dormant;n.rotation.y=time*.25;});
  energy.forEach((m,i)=>m.material=f.locks.every(Boolean)&&i/energy.length<f.responseTime/3?cyan:dormant);
  veins.forEach((m,i)=>{m.visible=f.responseTime>1+i*.22;if(f.restored)m.material=emerald;});
  glow.intensity=f.restored?180+Math.sin(time*2)*20:f.bridgeReady?35:0;
  if(f.restored){gold.emissiveIntensity=1.4+Math.sin(time*2)*.2;cyan.emissiveIntensity=1.2;}
 }};
}
