/** Upright box centered at x/y/z; yaw follows Three.js rotation about +Y. */
export type BoxBody={x:number;y:number;z:number;halfX:number;halfY:number;halfZ:number;yaw:number};

const CONTACT_EPSILON=1e-6;
const SWEEP_SPACING=.025;
const yawDelta=(from:number,to:number)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const axes=(body:BoxBody)=>{
 const c=Math.cos(body.yaw),s=Math.sin(body.yaw);
 return [{x:c,z:-s},{x:s,z:c}];
};

/** Strict volume overlap: touching faces, edges and corners are valid contact. */
export function boxesOverlap(a:BoxBody,b:BoxBody):boolean{
 if(Math.abs(a.y-b.y)>=a.halfY+b.halfY-CONTACT_EPSILON)return false;
 const aa=axes(a),bb=axes(b),dx=b.x-a.x,dz=b.z-a.z;
 for(const axis of [...aa,...bb]){
  const dot=(v:{x:number;z:number})=>Math.abs(v.x*axis.x+v.z*axis.z);
  const reachA=a.halfX*dot(aa[0])+a.halfZ*dot(aa[1]);
  const reachB=b.halfX*dot(bb[0])+b.halfZ*dot(bb[1]);
  if(Math.abs(dx*axis.x+dz*axis.z)>=reachA+reachB-CONTACT_EPSILON)return false;
 }
 return true;
}

/** Stable corner order allows callers to compare a corner throughout a sweep. */
export function boxCorners(body:BoxBody):Array<{x:number;z:number}>{
 const [right,forward]=axes(body),corners=[];
 for(const x of [-body.halfX,body.halfX])for(const z of [-body.halfZ,body.halfZ]){
  corners.push({x:body.x+right.x*x+forward.x*z,z:body.z+right.z*x+forward.z*z});
 }
 return corners;
}

/** Interpolate a pose without making a long turn across the -PI/+PI seam. */
export function interpolateBody(a:BoxBody,b:BoxBody,t:number):BoxBody{
 const blend=(from:number,to:number)=>from+(to-from)*t;
 return {x:blend(a.x,b.x),y:blend(a.y,b.y),z:blend(a.z,b.z),
  halfX:blend(a.halfX,b.halfX),halfY:blend(a.halfY,b.halfY),halfZ:blend(a.halfZ,b.halfZ),
  yaw:a.yaw+yawDelta(a.yaw,b.yaw)*t};
}

/** Check endpoints and intermediate poses, bounded by translation plus corner travel. */
export function sweepClear(from:BoxBody,to:BoxBody,isClear:(body:BoxBody)=>boolean):boolean{
 if(!isClear(from))return false;
 const translation=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z);
 const radius=Math.max(Math.hypot(from.halfX,from.halfZ),Math.hypot(to.halfX,to.halfZ));
 const rotation=radius*Math.abs(yawDelta(from.yaw,to.yaw));
 const resizing=Math.hypot(to.halfX-from.halfX,to.halfY-from.halfY,to.halfZ-from.halfZ);
 const count=Math.max(1,Math.ceil((translation+rotation+resizing)/SWEEP_SPACING));
 for(let i=1;i<=count;i++)if(!isClear(i===count?to:interpolateBody(from,to,i/count)))return false;
 return true;
}
