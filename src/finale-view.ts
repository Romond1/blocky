import * as THREE from 'three';
import {createWorldMaterials} from './world-materials.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildCaveShell} from './cave-shell.ts';
import {buildPuzzleCircuit,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {buildMovingBridge} from './moving-bridge.ts';
import {heroPicture} from './ability-hall-view.ts';
import {fruitPicture} from './fruit-pictures.ts';
import {textMaterial} from './room.ts';
import {heartLayout,HEART_PANELS,HEART_PEDESTAL,caveRadii,caveHeight,CAVE_ZONES} from './finale-layout.ts';
import {heartGeometry,heartShardGeometry,heartMaterial} from './heart-crystal.ts';
import type {Game} from './game.ts';
import {buildDragonMachinery} from './dragon-view.ts';
import {dragonFloor,DRAGON_PILLARS,DRAGON_WALLS,DRAGON_ALTAR} from './dragon-layout.ts';
import {dragonFloorTriangles} from './dragon-terrain.ts';

export function buildFinale(scene:THREE.Group,g:Game){
 const palette=createWorldMaterials(),kit=volcanicBuilder(scene,palette),box=kit.box;
 const purple=new THREE.MeshStandardMaterial({color:HERO_PLATE_PURPLE,emissive:HERO_PLATE_PURPLE,emissiveIntensity:.7});
 const gold=heartMaterial();
 const heartMark=(x:number,y:number,z:number,scale=1)=>{const h=new THREE.Mesh(heartGeometry(),gold);h.position.set(x,y,z);h.scale.setScalar(scale);scene.add(h);return h;};
 const pedestal=(x:number,z:number)=>{box(4,.18,3.3,x,-.09,z,palette.metal);const mark=heartMark(x,1.9,z);mark.material=new THREE.MeshStandardMaterial({color:0xffd663,emissive:0xeaa82d,emissiveIntensity:.5,wireframe:true});return mark;};
 let circuit:ReturnType<typeof buildPuzzleCircuit>;
 const door=new THREE.Group();scene.add(door);
 let gate:THREE.Group|undefined,cabin:THREE.Group|undefined,ferry:THREE.Group|undefined,bridge:ReturnType<typeof buildMovingBridge>|undefined;
 const shards:THREE.Mesh[]=[];const debug=new THREE.Group();scene.add(debug);
 const assemblyHeart=new THREE.Mesh(heartGeometry(),gold);assemblyHeart.position.set(0,3.5,33);assemblyHeart.visible=false;scene.add(assemblyHeart);
 const assemblyGlow=new THREE.PointLight(0xffd15a,0,10,2);assemblyGlow.position.set(0,3,33);scene.add(assemblyGlow);
 const deckMaterial=new THREE.MeshStandardMaterial({color:0x596875,roughness:.85,metalness:.1});
 let bridgeHousingRoot:THREE.Group|undefined;
 let dragonView:ReturnType<typeof buildDragonMachinery>|undefined;
 if(!g.finale!.cave){
  kit.floors([[-14,14,24,42],[-14,14,-2.5,24],[-14,14,-10,-2.5,5],[-14,14,-24,-20],[-14,14,-62,-36],[6.5,11.5,-2.5,2.5,-1]]);
  // Broad descending terrace: a continuous slope with readable crosswise basalt courses.
  const verts:number[]=[];
  verts.push(-14,5,-10,14,5,-10,-14,0,-20,14,5,-10,14,0,-20,-14,0,-20);
  const rampGeometry=new THREE.BufferGeometry();rampGeometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rampGeometry.computeVertexNormals();
  const ramp=new THREE.Mesh(rampGeometry,palette.stone);ramp.material.side=THREE.DoubleSide;ramp.receiveShadow=true;scene.add(ramp);
  for(let z=-19.5;z<-10;z+=.5)box(28,.025,.04,0,(z+20)*.5+.012,z,palette.metal);
  const shell=new THREE.Group();shell.position.z=-10;scene.add(shell);buildCaveShell(shell,palette,14,52,17,2.5);
  for(const o of heartLayout.obstacles!.filter(o=>!o.id.startsWith('finale-image-'))){const bottom=o.id==='bridge-housing'?-3:0;box(o.width,o.height-bottom,o.depth,o.x,(o.height+bottom)/2,o.z,palette.stone);}
  // Quiet assembly court; collected fragments stay visible before and during assembly.
  const ring=new THREE.Mesh(new THREE.RingGeometry(3.8,4.05,48),gold);ring.rotation.x=-Math.PI/2;ring.position.set(0,.035,33);scene.add(ring);
  const shardGeometry=heartShardGeometry();for(let i=0;i<8;i++){const shard=new THREE.Mesh(shardGeometry,gold);scene.add(shard);shards.push(shard);}
  for(const x of [-7,7]){box(1.5,10,1.5,x,5,35,palette.stone);heartMark(x,6,34.2,.7);}
  gate=new THREE.Group();gate.position.z=24;scene.add(gate);
  for(let x=-2.3;x<2.4;x+=.5){box(.14,6,.6,x,3,0,palette.metal,gate);box(.04,5.7,.04,x,3,.34,purple,gate);}box(5,.22,.6,0,5.9,0,palette.metal,gate);
  box(6,.6,1,0,7,24,palette.metal);
  cabin=new THREE.Group();cabin.position.x=9;scene.add(cabin);box(5,.5,5,0,-.25,0,palette.dark,cabin);box(4.9,.04,4.9,0,.02,0,deckMaterial,cabin);
  for(const x of [6.3,11.7]){box(.25,11,.25,x,5,0,palette.metal);box(.08,11,.08,x+.16,5,0,purple);}
  for(const side of [-1,1])box(.14,1,5,side*2.45,.5,0,palette.metal,cabin);
  box(28,.15,12,0,-2.2,-30,palette.lava);
  const bridgeRoot=new THREE.Group();bridgeHousingRoot=bridgeRoot;bridgeRoot.position.set(-7,0,-27);bridgeRoot.rotation.y=Math.PI/2;scene.add(bridgeRoot);bridge=buildMovingBridge(bridgeRoot,deckMaterial,palette.metal,purple);
  for(const z of [-23,-37])box(4.3,.06,.3,-7,.025,z,palette.metal);
  ferry=new THREE.Group();scene.add(ferry);box(5,.5,5,0,-.25,0,palette.dark,ferry);box(4.9,.04,4.9,0,.02,0,deckMaterial,ferry);
  for(const x of [-2.7,2.7]){box(.18,.1,23,x,-.15,-30,palette.metal);box(.07,.045,23,x,-.07,-30,purple);}
  // Dock edge markers stay outside the moving deck: no coplanar surface overlap.
  for(const z of [-21.5,-38.5])for(const x of [-2.8,2.8])box(.2,.04,5.9,x,.02,z,palette.metal);
  for(const p of HEART_PANELS){
   const picture=p.picture==='APPLE'||p.picture==='PEAR'?fruitPicture(p.picture):heroPicture({hero:p.picture==='RUN'?'mia':'yuki',action:p.picture} as Parameters<typeof heroPicture>[0],p.picture==='LIFT');
   box(4,3.5,.15,p.x,4,p.z-2.2,picture);box(4.3,3.9,.3,p.x,4,p.z-2.35,palette.metal);
   box(4.3,2.05,.3,p.x,1.025,p.z-2.35,palette.stone);
   for(const slot of p.slots){const s=heartLayout.sockets[slot];box(1.2,.8,.1,s.x,1,s.z-1.05,textMaterial('_','#223540','#ffe7a9'));}
  }
  pedestal(HEART_PEDESTAL.x,HEART_PEDESTAL.z);
  // Open final approach: hints of the vast next chamber remain beyond the portcullis.
  door.position.set(0,0,-62);for(const x of [-2.7,2.7])box(.6,12,1,x,6,-62,palette.stone);box(6,.8,1,0,8,-62,palette.metal);
  box(4.2,6,.4,0,3,0,palette.door,door);box(4.2,.12,.1,0,3,.26,palette.energy,door);
  box(4.2,.7,4,0,-.35,-64);box(60,.2,25,0,-4,-78,palette.lava);
  for(const x of [-14,14])box(4,28,5,x,10,-79,palette.hot);heartMark(0,5,-86,3);
  const paths=heartLayout.sockets.map((s,i)=>{
   const end=i<12?{x:Math.sign(s.x)*1.8,y:.035,z:-61}:i<14?{x:0,y:.035,z:24}:i<16?{x:9,y:(s.y??0)+.035,z:0}:i===16?{x:-7,y:.035,z:-23}:{x:0,y:.035,z:-38.5};
   return [new THREE.Vector3(s.x,(s.y??0)+.035,s.z-.7),new THREE.Vector3(s.x,(s.y??0)+.035,end.z),new THREE.Vector3(end.x,end.y,end.z)];
  });
  circuit=buildPuzzleCircuit(scene,heartLayout,door,palette.stone,paths,{dynamicLights:false,segmentLength:1.2,scaleToPlate:true});
 }else{
  // One disjoint surface supplies both the visible ground and collision heights.
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(dragonFloorTriangles(),3));geo.computeVertexNormals();const floor=new THREE.Mesh(geo,palette.dark);floor.name='dragon-static-floor';floor.receiveShadow=true;scene.add(floor);
  const lake=new THREE.Mesh(new THREE.CylinderGeometry(52,52,1,128),palette.lava);lake.name='dragon-lava';lake.position.y=-3.4;scene.add(lake);
  // Instanced irregular wall strata keep the enlarged cavern inexpensive to render.
  const rockGeometry=new THREE.BoxGeometry(1,1,1),matrices:THREE.Matrix4[]=[],transform=new THREE.Object3D();
  for(let i=0;i<DRAGON_WALLS.length;i++){const wall=DRAGON_WALLS[i];for(let j=0;j<9;j++){
   transform.position.set(wall.x,1.4+j*3,wall.z);transform.scale.set(j<3?wall.halfX*2:4.2+Math.sin(i*7+j)*.6,3.7,wall.halfZ*2);transform.rotation.set(j<3?0:.08*Math.sin(i+j),wall.yaw,j<3?0:.1*Math.cos(i*3+j));transform.updateMatrix();matrices.push(transform.matrix.clone());
  }}
  const strata=new THREE.InstancedMesh(rockGeometry,palette.dark,matrices.length);matrices.forEach((m,i)=>strata.setMatrixAt(i,m));strata.computeBoundingSphere();scene.add(strata);
  for(let i=0;i<20;i++){const a=i*Math.PI*2/20,r=47;box(2.5,17+Math.sin(i*3)*6,3,Math.sin(a)*r,12,Math.cos(a)*r,palette.hot);}
  // Massive central pillars and suspended arches emphasize the scale across the basin.
  for(const p of DRAGON_PILLARS){box(p.halfX*2,p.halfY*2,p.halfZ*2,p.x,p.y,p.z,palette.hot);box(5,1.4,5,p.x,20,p.z,palette.stone);}
  for(const a of [Math.PI/2,-Math.PI/2,Math.PI*.82,-Math.PI*.82]){const root=new THREE.Group();root.rotation.y=a;scene.add(root);box(1.6,18,2,0,9,45,palette.dark,root);box(1.6,18,2,0,9,20,palette.dark,root);box(2,1.8,27,0,18,32.5,palette.metal,root);}
  // Perimeter floor courses, lower overlooks and golden far destination.
  heartMark(0,11,DRAGON_ALTAR.z+2,3.2);
  for(const x of [-4,4]){box(.8,8,.8,x,9,DRAGON_ALTAR.z+2,palette.metal);box(.12,7,.12,x,9,DRAGON_ALTAR.z+1.5,gold);}
  for(const z of CAVE_ZONES){const label=box(3.5,1,.1,z.x,caveHeight(z)+2,z.z,textMaterial('ZONE '+z.id));scene.remove(label);debug.add(label);}
  // Distant cracks and shafts are decorative, leaving every future challenge site open.
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=47;box(.25,18,.3,Math.sin(a)*r,11,Math.cos(a)*r,palette.lava);}
  const cavePaths=g.layout.sockets.map((s,i)=>{
   const y=(s.y??0)+.035,point=(x:number,z:number)=>new THREE.Vector3(x,y,z);
   const westPaths:Record<number,[number,number][]>= {
    17:[[-25,27],[-31,27],[-31,26]],18:[[-37,25],[-31,25],[-31,26]],
    19:[[-25,19.3],[-30,19.3],[-30,19]],20:[[-25,5.7],[-30,5.7],[-30,7]],
    21:[[-35,-5.7],[-30,-5.7],[-30,-5.5]],22:[[-26.4,0],[-26.4,-2],[-26.5,-2]],
   };
   if(westPaths[i])return [point(s.x,s.z),...westPaths[i].map(([x,z])=>point(x,z))];
   const target=i===10||i===11?{x:Math.sin(.64)*31,z:Math.cos(.64)*31}:i===12?{x:29,z:10}:i===13?{x:33,z:-10}:i===14?{x:27.6,z:-15}:i===16?{x:31.1,z:-10.5}:i===15?{x:-26,z:-19}:{x:s.x,z:s.z-1.5};
   return [point(s.x,s.z),point(target.x,target.z)];
  });
  circuit=buildPuzzleCircuit(scene,g.layout,door,palette.stone,cavePaths,{dynamicLights:false,segmentLength:.8,scaleToPlate:true});door.visible=false;
  dragonView=buildDragonMachinery(scene,g);
 }
 const verts=new Float32Array(90*3);for(let i=0;i<90;i++){verts[i*3]=Math.sin(i*17)* (g.finale!.cave?26:14);verts[i*3+1]=i%11;verts[i*3+2]=g.finale!.cave?Math.cos(i*9)*26:-30+Math.cos(i*9)*30;}
 const emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.BufferAttribute(verts,3));const embers=new THREE.Points(emberGeometry,new THREE.PointsMaterial({color:0xffbc69,size:.045,transparent:true,opacity:.5}));scene.add(embers);
 for(const [x,y,z] of g.finale!.cave?[[0,7,0],[0,5,-31],[0,4,30]]:[[-12,5,26],[12,5,8],[0,7,-30],[0,5,-60]]){const light=new THREE.PointLight(0xffa04c,50,g.finale!.cave?48:18,2);light.position.set(x,y,z);scene.add(light);}
 return {door,tiles:[] as THREE.Mesh[],socketMaterials:circuit.socketMaterials,circuit,embers,lava:palette.lava,palette,
  finale:{update(game:Game,time:number,showDebug=false){const f=game.finale!;debug.visible=showDebug;if(gate)gate.position.y=f.gateLift;if(cabin)cabin.position.y=f.lift.y;if(ferry)ferry.position.z=f.ferry.worldZ;bridge?.update(f.bridgeExtension,10,0);if(bridgeHousingRoot)bridgeHousingRoot.visible=f.bridgeExtension>.001;
   dragonView?.update(time);
   if(f.dragon?.restored){palette.lava.emissiveIntensity=.9;(embers.material as THREE.PointsMaterial).color.setHex(0x8fffc3);}
   const assemblyProgress=f.paused?Math.min(1,f.assemblyTime/6):0;gold.emissiveIntensity=.85+assemblyProgress*1.8;assemblyGlow.intensity=f.paused?assemblyProgress*20:0;
   assemblyHeart.visible=f.paused&&assemblyProgress>.78&&!f.videoActive;assemblyHeart.scale.setScalar(Math.max(.001,(assemblyProgress-.78)/.22)*1.3);assemblyHeart.rotation.y=time*.25;
   shards.forEach((s,i)=>{s.visible=i<f.shardCount&&f.assembly!=='complete';const a=time*.65+i*Math.PI*2/Math.max(1,f.shardCount),t=f.paused?Math.min(1,f.assemblyTime/6):0,r=3*(1-Math.max(0,(t-.45)/.55));s.position.set(Math.cos(a)*r,1.6+t*2,33+Math.sin(a)*r);s.rotation.y=time;s.scale.setScalar(1-Math.max(0,(t-.8)/.2));});
   circuit.update(game.layout.sockets.map((_,i)=>game.slotFeedback(i)==='correct'),game.conduitProgress,game.doorPowered,time,game.doorCharge,game.layout.sockets.map(s=>s.acceptedActivator==='HERO'?{activeColor:HERO_PLATE_PURPLE,dormantColor:HERO_PLATE_PURPLE}:{activeColor:0x49eaff,dormantColor:0xff650a}));
  }},
 };
}
