import * as THREE from 'three';
import type {RoomObstacle} from './puzzles.ts';
/** Camera-only preference; never consulted by puzzle simulation. */
export class CameraDistance {
 distance=6;target=6;
 wheel(delta:number){if(Number.isFinite(delta))this.target=Math.max(4,Math.min(9,this.target+delta*.008));}
 update(dt:number){this.distance+=(this.target-this.distance)*(1-Math.exp(-Math.max(0,dt)*8));}
 reset(){this.distance=6;this.target=6;}
}

/** Existing obstacle pull-in, evaluated at actual elevation with a close-wall fallback. */
export function clearCameraPosition(eye:THREE.Vector3,desired:THREE.Vector3,obstacles:RoomObstacle[]){
 const direction=desired.clone().sub(eye).normalize(),ray=new THREE.Ray(eye,direction);
 let clearance=desired.distanceTo(eye);
 for(const o of obstacles){
  const bounds=new THREE.Box3(new THREE.Vector3(o.x-o.width/2-.2,-.2,o.z-o.depth/2-.2),new THREE.Vector3(o.x+o.width/2+.2,o.height+.2,o.z+o.depth/2+.2));
  const hit=ray.intersectBox(bounds,new THREE.Vector3());if(hit)clearance=Math.min(clearance,Math.max(.2,eye.distanceTo(hit)-.1));
 }
 // A shoulder-height wall can otherwise push the lens inside the hero's head.
 return clearance<1.8?eye.clone().add(new THREE.Vector3(0,2.5,0)):eye.clone().addScaledVector(direction,clearance);
}

/** Oriented cavern walls and moving gates also participate in camera pull-in. */
export function clearCavernCamera(eye:THREE.Vector3,desired:THREE.Vector3,bodies:import('./block-collision.ts').BoxBody[]){
 const direction=desired.clone().sub(eye).normalize();let clearance=desired.distanceTo(eye);
 for(const b of bodies){
  const origin=eye.clone().sub(new THREE.Vector3(b.x,b.y,b.z)).applyAxisAngle(new THREE.Vector3(0,1,0),-b.yaw);
  const localDirection=direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0),-b.yaw);
  const bounds=new THREE.Box3(new THREE.Vector3(-b.halfX-.2,-b.halfY-.2,-b.halfZ-.2),new THREE.Vector3(b.halfX+.2,b.halfY+.2,b.halfZ+.2));
  if(bounds.containsPoint(origin))continue;
  const hit=new THREE.Ray(origin,localDirection).intersectBox(bounds,new THREE.Vector3());if(hit)clearance=Math.min(clearance,Math.max(.3,origin.distanceTo(hit)-.15));
 }
 return eye.clone().addScaledVector(direction,clearance);
}
