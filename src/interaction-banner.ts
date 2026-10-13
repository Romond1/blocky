import * as THREE from 'three';
import type {Game} from './game.ts';
import {instruction} from './instructions.ts';
/** Room 1 interaction cues follow the actual block/plate in camera space. */
export function createInteractionBanner(hud:HTMLElement){
 const banner=document.createElement('div');banner.className='interaction-banner';banner.hidden=true;
 const key=document.createElement('kbd');key.textContent='E';const label=document.createElement('span');banner.append(key,label);hud.append(banner);
 const point=new THREE.Vector3();
 return {update(game:Game,camera:THREE.Camera,blockViews:ReadonlyArray<{mesh:THREE.Mesh,size:number}>){
  banner.hidden=true;delete banner.dataset.kind;delete banner.dataset.target;
  if(!['hero','memory'].includes(game.puzzle.id)||game.escaped)return;
  const carried=game.carried,block=carried?undefined:game.nearest;
  const heavyLesson=game.puzzle.id==='memory';
  if(heavyLesson&&(game.controlledHero!=='yuki'||(carried??block)?.weightClass!=='heavy'))return;
  if(carried){
   const index=heavyLesson?1:0,plate=game.layout.sockets[index],occupant=game.placed[index];
   point.set(plate.x,occupant?occupant.size+.75:1,plate.z);
   label.textContent=instruction('Drop on the plate');banner.dataset.kind='drop';banner.dataset.target=`plate-${index}`;
  }else if(block){
   const view=blockViews[block.id];view.mesh.getWorldPosition(point);point.y+=view.size/2+.35;
   label.textContent=instruction('Pick up');banner.dataset.kind='pickup';banner.dataset.target=`block-${block.id}`;
  }else return;
  point.project(camera);
  // Never pin a label to an unrelated screen edge when its object is off camera.
  if(point.z < -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1)return;
  banner.style.left=`${(point.x+1)*50}%`;banner.style.top=`${(1-point.y)*50}%`;banner.hidden=false;
 }};
}
