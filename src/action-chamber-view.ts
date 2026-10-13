import * as THREE from 'three';
import {createWorldMaterials} from './world-materials.ts';
import {buildCaveShell} from './cave-shell.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildPuzzleCircuit,ACTIVE,DORMANT,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {wallGlyph} from './split-map.ts';
import {bridgeRunes} from './split-art.ts';
import {actionLayout} from './puzzles.ts';
import {STATION_SURFACES} from './action-layout.ts';
import {RIVER,FERRY} from './lava-ferry.ts';
import type {Game} from './game.ts';

/** Wordless silhouettes: motion trails, airborne feet, and a raised boulder. */
function actionPicture(index:number){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#202f39';c.fillRect(0,0,512,512);c.strokeStyle='#ffe2ac';c.fillStyle='#ffe2ac';c.lineWidth=28;c.lineCap='round';c.lineJoin='round';
 const line=(points:number[][])=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 if(index===0){c.fillRect(266,108,60,60);line([[280,190],[230,270],[310,325],[360,375]]);line([[235,263],[178,330],[120,325]]);line([[270,205],[330,235],[367,190]]);line([[265,210],[205,195],[164,240]]);c.lineWidth=9;line([[65,185],[145,185]]);line([[50,240],[128,240]]);line([[58,285],[130,285]]);}
 if(index===1){c.fillRect(230,100,60,60);line([[260,187],[260,260],[208,294],[178,269]]);line([[260,258],[321,293],[355,261]]);line([[250,200],[200,157],[171,110]]);line([[270,200],[325,155],[345,105]]);c.lineWidth=9;c.strokeStyle='#49eaff';line([[123,364],[185,364]]);line([[322,364],[395,364]]);c.setLineDash([10,16]);line([[220,344],[220,382]]);line([[287,344],[287,382]]);c.setLineDash([]);}
 if(index===2){c.fillRect(161,62,190,86);c.fillRect(230,190,60,60);line([[259,270],[259,328],[215,402]]);line([[259,328],[306,402]]);line([[246,280],[190,227],[190,169]]);line([[273,280],[322,227],[322,169]]);c.strokeStyle='#49eaff';c.lineWidth=9;line([[137,145],[137,87],[123,108]]);line([[375,145],[375,87],[390,108]]);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshStandardMaterial({map:texture,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.3,roughness:.9});
}

export function buildActionChamber(scene:THREE.Group){
 const palette=createWorldMaterials(),{box,floors,doorway}=volcanicBuilder(scene,palette);
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.5});
 const front=actionLayout.halfDepth,back=actionLayout.exitZ??-front,center=(front+back)/2,depth=(front-back)/2;
 const shell=new THREE.Group();shell.position.z=center;scene.add(shell);buildCaveShell(shell,palette,18,depth,14,1.8,actionLayout.exitCenterX);
 // The split steps stand on solid ground; missed jumps land on the normal bank floor.
 floors([[-18,18,back,RIVER.far],[-18,18,RIVER.near,front]]);
 box(36,.18,12,0,-1.7,RIVER.center,palette.lava);
 for(const side of [-1,1])box(1.2,.15,front-back,side*18.65,-.2,center,palette.lava);
 for(const a of STATION_SURFACES){
  const x=a.x,STEP_HALF_WIDTH=a.halfWidth,STEP_HALF_DEPTH=a.halfDepth;
  box(STEP_HALF_WIDTH*2,a.y,STEP_HALF_DEPTH*2,x,a.y/2,a.z,palette.dark);
  floors([[x-STEP_HALF_WIDTH,x+STEP_HALF_WIDTH,a.z-STEP_HALF_DEPTH,a.z+STEP_HALF_DEPTH,a.y]]);
  box(STEP_HALF_WIDTH*2-.12,.04,.1,x,a.y+.02,a.z+STEP_HALF_DEPTH-.06,palette.metal);
 }
 for(const o of actionLayout.obstacles!.filter(o=>!o.id.startsWith('action-image-')&&!o.id.startsWith('jump-end-barrier')&&!o.id.startsWith('jump-side-barrier')))box(o.width,o.height,o.depth,o.x,o.height/2,o.z,palette.stone);
 // Station boundaries and readable entrance signs explain the activity before interaction.
 const stationLines=[{left:7.2,right:16.8,back:10.5,front:24.5,x:12,name:'LIFT STATION',color:DORMANT},
 {left:-3.4,right:3.4,back:9.5,front:24.8,x:0,name:'JUMP STATION',color:ACTIVE},
 {left:-12.9,right:-7.1,back:9.4,front:24.7,x:-10,name:'RUN STATION',color:HERO_PLATE_PURPLE}];
 for(const s of stationLines){
  const m=glow(s.color),cx=(s.left+s.right)/2,cz=(s.back+s.front)/2;
  for(const x of [s.left,s.right])box(.075,.035,s.front-s.back,x,.035,cz,m);
  for(const z of [s.back,s.front])box(s.right-s.left,.035,.075,cx,.035,z,m);
  for(const x of [s.left,s.right])for(const z of [s.back,s.front]){box(.2,.65,.2,x,.325,z,palette.metal);box(.22,.04,.22,x,.67,z,m);}
  const isJump=s.name==='JUMP STATION';
  const isRun=s.name==='RUN STATION';
  const signX=s.x,signWidth=isJump?4.4:4.8,signY=isJump?6.2:isRun?5.7:5.5,signZ=isJump?10.95:isRun?12.5:s.back;
  box(signWidth,.8,.16,signX,signY,signZ,wallGlyph(s.name,signWidth,.8));
  for(const side of [-1,1]){
   const supportHeight=isRun?signY-4.5:signY;
   box(.1,supportHeight,.1,signX+side*(signWidth/2-.1),isRun?4.5+supportHeight/2:signY/2,isRun?12:signZ,palette.metal);
  }
 }
 // Jagged lava-bank teeth repeat the kit's basalt forms without closing sightlines.
 for(const sign of [-1,1])for(let x=-17;x<=17;x+=2.8){if(Math.abs(x)<5.5)continue;box(1.6,.9,1,x,-.45,sign===1?RIVER.near+.1:RIVER.far-.1,palette.dark);}
 // Two exposed guide tracks and matching docks make the horizontal lift legible.
 const steel=new THREE.MeshStandardMaterial({color:0xa1adb9,metalness:.7,roughness:.4});
 const dockSteel=new THREE.MeshStandardMaterial({color:0x596573,metalness:.45,roughness:.65});
 const trackLength=FERRY.a-FERRY.b+5.8,trackCenter=(FERRY.a+FERRY.b)/2;
 for(const side of [-1,1]){
  box(.3,.32,trackLength,side*2.7,-.38,trackCenter,palette.dark);
  box(.16,.09,trackLength,side*2.7,-.175,trackCenter,steel);
  for(const z of [FERRY.a+2.6,FERRY.b-2.6])box(.55,.45,.4,side*2.7,-.2,z,dockSteel);
 }
 for(const z of [FERRY.a,FERRY.b]){
  box(5.9,.018,5.9,0,.009,z,dockSteel);
  box(5.45,.008,5.45,0,.022,z,palette.dark);
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.05,2.18,48),steel);
  ring.rotation.x=-Math.PI/2;ring.position.set(0,.028,z);scene.add(ring);
  for(const side of [-1,1]){
   box(.1,.035,5.65,side*2.83,.065,z,steel);
   box(5.65,.035,.1,0,.065,z+side*2.83,steel);
   for(const end of [-1,1]){
    box(.3,.09,.3,side*2.55,.085,z+end*2.55,steel);
    box(.1,.1,.1,side*2.55,.1,z+end*2.55,palette.dark);
   }
  }
 }
 const cabin=new THREE.Group();scene.add(cabin);const purple=glow(HERO_PLATE_PURPLE);
 box(5,.5,5,0,-.25,0,palette.dark,cabin);box(4.9,.05,4.9,0,.025,0,palette.stone,cabin);
 for(const sign of [-1,1]){
  // Carriage rollers sit below the boarding surface and follow the fixed rails.
  for(const z of [-1.75,1.75]){
   box(.65,.3,.75,sign*2.55,-.32,z,dockSteel,cabin);
   const roller=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.18,12),steel);
   roller.rotation.z=Math.PI/2;roller.position.set(sign*2.78,-.3,z);cabin.add(roller);
  }
  box(.08,.035,4.7,sign*2.35,.045,0,purple,cabin);
  box(4.7,.07,.09,0,.08,sign*2.35,purple,cabin);
 }
 const runeRoot=new THREE.Group();runeRoot.position.y=.06;cabin.add(runeRoot);bridgeRunes(runeRoot,purple,purple,0);
 const door=doorway(actionLayout.exitCenterX??0,-28);
 const paths=actionLayout.sockets.map((s,i)=>i<3?[new THREE.Vector3(s.x,.04,s.z-1.2),new THREE.Vector3(s.x,.04,-25.5),new THREE.Vector3(actionLayout.exitCenterX??0,.04,-25.5),new THREE.Vector3(actionLayout.exitCenterX??0,.04,-27.7)]:[new THREE.Vector3(s.x,.04,s.z),new THREE.Vector3(i>=3?-2.5:s.x+.5,.04,s.z)]);
 const circuit=buildPuzzleCircuit(scene,actionLayout,door,palette.stone,paths,{segmentLength:.45});
 for(let i=0;i<3;i++){const x=actionLayout.sockets[i].x;box(4,3.8,.5,x,2.5,-23.5);box(3.45,3.45,.08,x,2.65,-23.2,actionPicture(i));}
 box(9,1,.22,0,7,-27.5,wallGlyph('07 / THE ACTION CHAMBER',9,1));
 // Fixed goal pads: every word is already present above its destination.
 for(const p of actionLayout.blockPositions.slice(0,3)){
  const y=p.y??0;box(1.2,.025,1.2,p.x,y+.012,p.z,glow(ACTIVE));
 }
 const belt=glow(0x59cfe8);
 box(4.25,.04,13.15,-10,.02,17.925,palette.dark);
 const strips=Array.from({length:18},(_,i)=>{
  const root=new THREE.Group();scene.add(root);
  box(4.1,.025,.06,-10,.065,0,palette.metal,root);
  // Chevron tips face positive Z, toward the entrance.
  for(const side of [-1,1]){const arm=box(.07,.028,.55,-10+side*.18,.085,.4,belt,root);arm.rotation.y=side*-.65;}
  return root;
 });
 const emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:240},(_,i)=>i%3===1?i%11+.3:i%3===0?Math.sin(i*17)*18:Math.sin(i*13)*28),3));
 const embers=new THREE.Points(emberGeometry,new THREE.PointsMaterial({color:0xffb35c,size:.035}));scene.add(embers);
 for(const [x,z] of [[-15,3],[15,-3],[-12,19],[12,19],[0,-17],[0,30]]){const l=new THREE.PointLight(z===3||z===-3?0xff7136:0xaadfff,55,22,2);l.position.set(x,5,z);scene.add(l);}
 return {palette,lava:palette.lava,embers,door,circuit,socketMaterials:circuit.socketMaterials,tiles:[] as THREE.Mesh[],
  action:{update(g:Game,time:number){const a=g.actionChamber!;cabin.position.z=a.lift.z;purple.emissiveIntensity=a.lift.moving?1.1+Math.sin(time*5)*.2:.65;
   strips.forEach((strip,i)=>strip.position.z=11.35+((i*.75+a.conveyorTravel)%13.15));
   circuit.update(actionLayout.sockets.map((_,i)=>g.slotFeedback(i)==='correct'),g.conduitProgress,g.doorPowered,time,g.doorCharge,actionLayout.sockets.map((_,i)=>({activeColor:i<3?ACTIVE:HERO_PLATE_PURPLE,dormantColor:i<3?DORMANT:HERO_PLATE_PURPLE})));
  }},
 };
}
