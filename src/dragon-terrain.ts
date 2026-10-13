import {WEST_FLOORS} from './dragon-west.ts';
type Point={x:number;z:number};
type Rect={left:number;right:number;near:number;far:number;y:number};
export type FloorPatch={points:Point[];y:number;left:number;right:number;near:number;far:number};

export const DRAGON_COURT={left:26,right:43,near:-18,far:-8,y:0};
export const DRAGON_GALLERY={left:24,right:27.6,near:-21,far:-11,y:4};
export const DRAGON_DOCK={left:30,right:40,near:8.5,far:13,y:0};
export const DRAGON_HEART_LANDING={left:-4.5,right:4.5,near:-23,far:-17,y:5};
const channel={left:22,right:55,near:-8,far:10,y:0};
const angle=(p:Point)=>Math.atan2(p.x,p.z);
export function dragonHeight(p:Point){const a=angle(p);return a<0&&p.z> -8?0:a>=2.08||a<-.3?5:0;}
export function dragonRadii(a:number){a=Math.atan2(Math.sin(a),Math.cos(a));return {inner:Math.abs(a)>2.7?28:Math.abs(a+2.2)<.65?22:24,outer:49};}
const corners=(r:Rect):Point[]=>[{x:r.left,z:r.near},{x:r.left,z:r.far},{x:r.right,z:r.far},{x:r.right,z:r.near}];

/** Clip a convex polygon against one half-plane, keeping the nonnegative side. */
function clip(points:Point[],distance:(p:Point)=>number){
 const out:Point[]=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],da=distance(a),db=distance(b);
  if(da>=0)out.push(a);
  if((da<0)!==(db<0)){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});}
 }
 return out;
}
/** Disjoint pieces outside a rectangle; the interior belongs to its own surface. */
function subtract(points:Point[],r:Rect){
 const result:Point[][]=[];let inside=points;
 for(const distance of [(p:Point)=>p.x-r.left,(p:Point)=>r.right-p.x,(p:Point)=>p.z-r.near,(p:Point)=>r.far-p.z]){
  const outside=clip(inside,p=>-distance(p));if(outside.length>=3)result.push(outside);
  inside=clip(inside,distance);if(inside.length<3)break;
 }
 return result;
}
const signedArea=(p:Point[])=>p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a.x*b.z-b.x*a.z;},0)/2;
function makePatches(){
 const patches:FloorPatch[]=[];
 const add=(points:Point[],y:number)=>{
  const area=signedArea(points);if(Math.abs(area)<1e-8)return;
  if(area>0)points.reverse(); // Upward-facing triangle winding.
  patches.push({points,y,left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),near:Math.min(...points.map(p=>p.z)),far:Math.max(...points.map(p=>p.z))});
 };
 // Explicit seams keep height changes and lava cuts out of rendered triangles.
 const angles=[...Array.from({length:513},(_,i)=>-Math.PI+i*Math.PI*2/512),-2.85,-1.8,-1.55,-.3,2.08].sort((a,b)=>a-b);
 for(let i=1;i<angles.length;i++){
  const a=angles[i-1],b=angles[i],mid=(a+b)/2;
  const radii=dragonRadii(mid),point=(angle:number,r:number)=>({x:Math.sin(angle)*r,z:Math.cos(angle)*r});
  let pieces=[[point(a,radii.inner),point(a,radii.outer),point(b,radii.outer),point(b,radii.inner)]];
  for(const cut of [channel,DRAGON_GALLERY,DRAGON_COURT,DRAGON_DOCK,{left:-55,right:-8,near:-12,far:29,y:0},{left:-40,right:-22,near:-16,far:-12,y:5},{left:-21,right:-15,near:-16,far:-12,y:5}])pieces=pieces.flatMap(p=>subtract(p,cut));
  for(const p of pieces)add(p,dragonHeight(point(mid,31)));
 }
 for(const r of WEST_FLOORS)for(const p of r.y===0?subtract(corners(r),{left:-33.5,right:-26.5,near:-5.5,far:1.5,y:0}):[corners(r)])add(p,r.y);
 add(corners({left:-21,right:-15,near:-16,far:-12,y:5}),5);
 add(corners(DRAGON_GALLERY),DRAGON_GALLERY.y);
 for(const p of subtract(corners(DRAGON_COURT),DRAGON_GALLERY))add(p,0);
 add(corners(DRAGON_DOCK),0);
 add(corners(DRAGON_HEART_LANDING),5);
 return patches;
}
export const DRAGON_FLOOR_PATCHES=makePatches();
// Movement/cargo queries inspect only nearby patches, rather than the whole ring.
const cells=new Map<string,FloorPatch[]>(),cell=4;
for(const p of DRAGON_FLOOR_PATCHES)for(let x=Math.floor(p.left/cell);x<=Math.floor(p.right/cell);x++)for(let z=Math.floor(p.near/cell);z<=Math.floor(p.far/cell);z++){
 const key=`${x},${z}`,list=cells.get(key)??[];list.push(p);cells.set(key,list);
}
export function dragonFloor(p:Point){
 let height=-8;
 for(const patch of cells.get(`${Math.floor(p.x/cell)},${Math.floor(p.z/cell)}`)??[]){
  if(p.x<patch.left-1e-7||p.x>patch.right+1e-7||p.z<patch.near-1e-7||p.z>patch.far+1e-7)continue;
  if(patch.points.every((a,i)=>{const b=patch.points[(i+1)%patch.points.length];return (b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x)<=1e-7;}))height=Math.max(height,patch.y);
 }
 return height;
}
export function dragonFloorTriangles(){
 const vertices:number[]=[];
 for(const p of DRAGON_FLOOR_PATCHES)for(let i=1;i<p.points.length-1;i++)for(const v of [p.points[0],p.points[i],p.points[i+1]])vertices.push(v.x,p.y,v.z);
 return vertices;
}

/** Short boundary segments share navigation and visible rails; docks stay open. */
export const DRAGON_RAILS=(()=>{
 const rails:import('./block-collision.ts').BoxBody[]=[],seen=new Set<string>();
 const opening=(x:number,z:number)=>
  x>22&&z> -19&&z<15||
  x> -34&&x< -26&&z>=-5.6&&z<=1.6||
  x>=-21&&x<=-15&&Math.abs(z+12)<.2|| // Existing ferry, drawbridge and elevator approaches.
  Math.abs(x)<4&&z< -20||
  Math.abs(x)<10&&z< -15&&z> -26|| // Restored portal wings join the Heart landing. // Heart bridge.
  Math.abs(x+30)<3.8&&(Math.abs(z-19)<.2||Math.abs(z-7)<.2||Math.abs(z-1.5)<.2||Math.abs(z+5.5)<.2||Math.abs(z+8)<.2||Math.abs(z+12)<.2);
 for(const patch of DRAGON_FLOOR_PATCHES)for(let i=0;i<patch.points.length;i++){
  const a=patch.points[i],b=patch.points[(i+1)%patch.points.length],length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.01)continue;
  const count=Math.ceil(length/1.5),nx=(b.z-a.z)/length,nz=-(b.x-a.x)/length;
  for(let j=0;j<count;j++){
   const t=(j+.5)/count,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
   if(Math.hypot(x,z)>45||opening(x,z))continue;
   const l=dragonFloor({x:x+nx*.08,z:z+nz*.08}),r=dragonFloor({x:x-nx*.08,z:z-nz*.08});
   if(l>=0&&r>=0||l<0&&r<0)continue;
   const key=`${x.toFixed(2)},${z.toFixed(2)}`;if(seen.has(key))continue;seen.add(key);
   rails.push({x,y:patch.y+.5,z,halfX:length/count/2,halfY:.5,halfZ:.09,yaw:-Math.atan2(b.z-a.z,b.x-a.x)});
  }
 }
 return rails;
})();
