import * as THREE from 'three';
import {createWorldMaterials,type WorldMaterials} from './world-materials.ts';
import {buildCaveShell} from './cave-shell.ts';
import {volcanicBuilder} from './volcanic-kit.ts';
import {buildMovingBridge} from './moving-bridge.ts';
import {buildLiftView} from './lift-view.ts';
import {buildPuzzleCircuit,ACTIVE,DORMANT,HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import {fruitPicture} from './fruit-pictures.ts';
import {wallGlyph} from './split-map.ts';
import {sortingLayout} from './puzzles.ts';
import {SORTING_GALLERY,SORTING_PAIRS} from './sorting-foundry.ts';
import type {Game} from './game.ts';

export function buildFoundryRecoveryStair(scene:THREE.Group,palette:WorldMaterials){
 const root=new THREE.Group();root.position.set(-4,0,25);root.rotation.y=-Math.PI/2;scene.add(root);
 volcanicBuilder(root,palette).stair(0,0,5,4);return root;
}

/** Familiar volcanic machines, arranged across the room and then along an offset gallery. */
export function buildSortingFoundryChamber(scene:THREE.Group){
 const palette=createWorldMaterials(),{box,floors,stair,doorway}=volcanicBuilder(scene,palette);
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.75,roughness:.45});
 buildCaveShell(scene,palette,16,28,15,1.8,-12);
 floors([[-16,-9,8,28],[3,16,8,28],[-16,16,2.5,8],[-16,3,-28,2.5],[3,6.5,-28,2.5],[13.5,16,-2.5,2.5],[6.5,16,-28,-2.5],[-9,3,8,28,-3],
  [SORTING_GALLERY.left,SORTING_GALLERY.right,SORTING_GALLERY.back,SORTING_GALLERY.front,5]]);
 floors([[6.5,13.5,-2.5,2.5,-3]]);stair(12.5,-2.5,2.5,2);
 box(3.8,.75,.12,9,-1.7,-2.35,wallGlyph("BRING WORD BLOCKS UP IN THE LIFT",3.8,.75));
 const lower=new THREE.MeshStandardMaterial({color:0x465b66,roughness:1});box(12,.025,20,-3,-2.985,18,lower);
 for(let x=-8.5;x<3;x+=1.25)box(.04,.012,19.8,x,-2.965,18,palette.metal);
 // Rotate the existing twenty-tread recovery stair to return to the west bank.
 buildFoundryRecoveryStair(scene,palette);
 box(7,.04,.1,-.5,-2.955,25,palette.energy);box(.1,.04,10,-4,-2.955,20,palette.energy);
 // The molten feed channel is framed by solid housing, above the safe recovery route.
 box(12,.35,.035,-3,.65,11.525,palette.lava);
 for(const side of [-1,1])box(1.2,.15,56,side*16.7,-.2,0,palette.lava);
 for(const o of sortingLayout.obstacles!){const foundation=o.id==='slab-housing'?3:0;box(o.width,o.height+foundation,o.depth,o.x,(o.height-foundation)/2,o.z);}
 const bridgeRoot=new THREE.Group();bridgeRoot.position.set(-6,0,14);scene.add(bridgeRoot);
 const slab=new THREE.MeshStandardMaterial({color:0x566771,roughness:.65,emissive:DORMANT,emissiveIntensity:.12});
 const rail=glow(DORMANT),bridgeEnergy=glow(DORMANT),bridge=buildMovingBridge(bridgeRoot,slab,rail,bridgeEnergy);
 const ghost=new THREE.MeshBasicMaterial({color:DORMANT,transparent:true,opacity:.18,depthWrite:false});
 for(let i=0;i<4;i++){box(2.98,.025,4,-7.5+i*3,-2.93,14,ghost);box(2.85,.8,.08,-7.5+i*3,-.25,11.525,palette.door);}
 for(const x of [-9,3])box(.12,.07,4.4,x,.035,14,palette.metal);
 const {cabin,energy}=buildLiftView(scene,palette);
 // Open railing keeps the upstairs words visible; the cabin landing is the single gap.
 const b=SORTING_GALLERY;
 box(1.35,.2,1.35,9.25,.1,-8.5,palette.stone);
 box(1.35,.2,1.35,9.25,4.9,-8.5,palette.metal);
 for(const y of [5.45,6.15])box(b.right-b.left,.12,.12,(b.left+b.right)/2,y,b.back+.2,palette.metal);
 for(let x=b.left+.2;x<b.right;x+=1.3)box(.12,1.1,.12,x,5.55,b.back+.2,palette.metal);
 for(const x of [b.left+.2,b.right-.2]){box(.12,.12,b.front-b.back,x,6.15,(b.front+b.back)/2,palette.metal);for(let z=b.back+.4;z<b.front;z+=1.3)box(.12,1.1,.12,x,5.55,z,palette.metal);}
 for(const [left,right] of [[3.2,6.5],[11.5,15.3]]){box(right-left,.12,.12,(left+right)/2,6.15,-2.62,palette.metal);for(let x=left;x<=right;x+=1.3)box(.12,1.1,.12,x,5.55,-2.62,palette.metal);}
 box(2.8,.55,.08,5,4.65,-2.12,wallGlyph('UP ↕ DOWN',2.8,.55));
 const door=doorway(-12,-28);
 const path=(ps:number[][],y=.035)=>ps.map(([x,z])=>new THREE.Vector3(x,y,z));
 const paths=sortingLayout.sockets.map((s,i)=>i<6?path([[s.x,s.z-1.1],[s.x,-22.5],[[-8,-1,6][Math.floor(i/2)],-23.2]]):
  i===6?path([[-13,10.9],[-10,10.9],[-10,14],[-9,14]]):i===7?path([[5,12.9],[5,12],[3,12],[3,14]]):
  i===8?path([[5,2.1],[5,3.1],[9,3.1],[9,2.6]]):path([[5,-3.9],[5,-3.2],[9,-3.2],[9,-2.6]],5.035));
 const circuit=buildPuzzleCircuit(scene,sortingLayout,door,palette.stone,paths,{segmentLength:.55,dynamicLights:false});
 const stationMaterials:THREE.MeshStandardMaterial[]=[],pictures:THREE.MeshBasicMaterial[]=[];
 for(const [i,pair] of SORTING_PAIRS.entries()){
  const x=[-8,-1,6][i],m=glow(DORMANT);stationMaterials.push(m);
  box(5.6,4.9,.5,x,3.15,-23.65);
  const picture=fruitPicture(pair[1],'#36ae48');pictures.push(picture);box(3.15,3.15,.08,x,3.3,-23.34,picture);
  box(5.3,.9,.12,x,5.55,-23.25,wallGlyph(pair.join(' '),5.3,.9));
  for(const sign of [-1,1]){box(.07,4.1,.06,x+sign*2.65,3.3,-23.28,m);box(5.3,.07,.06,x,3.3+sign*2.05,-23.28,m);}
  const seal=box(.38,.38,.12,-12+(i-1)*.7,4.4,-27.45,m);seal.rotation.z=Math.PI/4;
 }
 const final=glow(DORMANT);box(23,.04,.12,-3.5,.04,-26.6,final);box(.12,.04,1.25,-12,.04,-27.2,final);
 box(7.5,.9,.25,-7,8,-27.4,wallGlyph('06 / THE SORTING FOUNDRY',7.5,.9));
 const purple=glow(HERO_PLATE_PURPLE);
 for(const s of sortingLayout.sockets.slice(7))for(const sign of [-1,1]){box(.08,.04,2.25,s.x+sign*1.12,(s.y??0)+.095,s.z,purple);box(2.25,.04,.08,s.x,(s.y??0)+.095,s.z+sign*1.12,purple);}
 const emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:180},(_,i)=>i%3===1?(i%12)+1:i%3===0?Math.sin(i*17)*16:Math.sin(i*13)*28),3));
 const embers=new THREE.Points(emberGeometry,new THREE.PointsMaterial({color:0xffba6b,size:.035}));scene.add(embers);
 for(const [x,y,z,color,power] of [[-13,5,20,0xff7136,35],[7,5,14,0xaadfff,40],[-3,-.5,21,0x89e4e8,32],[4,6,4,0xaadfff,40],[9,10,-8,0xaadfff,45],[-3,6,-20,0xaadfff,50]]){
  const l=new THREE.PointLight(color,power,22,2);l.position.set(x,y,z);scene.add(l);
 }
 return {palette,lava:palette.lava,embers,door,circuit,socketMaterials:circuit.socketMaterials,tiles:[] as THREE.Mesh[],
  sorting:{update(g:Game,time:number){
   const f=g.sorting!;bridge.update(g.bridge.extension,4.5,0);cabin.position.y=f.lift.y;
   const color=f.bridgeLocked?ACTIVE:DORMANT;[slab,rail,bridgeEnergy].forEach(m=>{m.emissive.setHex(color);});rail.color.setHex(color);bridgeEnergy.color.setHex(color);
   energy.emissiveIntensity=f.lift.moving?1.1+Math.sin(time*5)*.2:.65;
   stationMaterials.forEach((m,i)=>{m.color.setHex(f.matches[i]?ACTIVE:DORMANT);m.emissive.copy(m.color);m.emissiveIntensity=f.matches[i]?.9+Math.sin(Math.min(1,g.conduitProgress[i*2]*3.4)*Math.PI)*.4:.4;});
   pictures.forEach((m,i)=>m.color.setHex(f.matches[i]?0xffffff:0xa6b3ba));
   final.color.setHex(g.solved?ACTIVE:DORMANT);final.emissive.copy(final.color);
   const active=g.layout.sockets.map((_,i)=>g.slotFeedback(i)==='correct');
   circuit.update(active,g.conduitProgress,g.doorPowered,time,g.doorCharge,g.layout.sockets.map((s,i)=>({activeColor:i>=7&&!f.bridgeLocked?HERO_PLATE_PURPLE:ACTIVE,dormantColor:s.acceptedActivator==='HERO'?HERO_PLATE_PURPLE:DORMANT})));
  }},
 };
}
