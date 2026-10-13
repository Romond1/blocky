import * as THREE from 'three';
import {volcanicBuilder} from './volcanic-kit.ts';
import {bridgeRunes} from './split-art.ts';
import {HERO_PLATE_PURPLE} from './puzzle-visuals.ts';
import type {WorldMaterials} from './world-materials.ts';
/** Shared Room 5 cabin, guide rails, guards and runes. */
export function buildLiftView(scene:THREE.Group,palette:WorldMaterials){
 const {box}=volcanicBuilder(scene,palette);
 const glow=(color:number)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.45});
 // Frame and paired guide rails make the full height of travel readable from the entrance.
 const energy=glow(HERO_PLATE_PURPLE),cabin=new THREE.Group();scene.add(cabin);
 for(const x of [6.35,11.65]){
  box(.35,9,.6,x,4.5,0,palette.metal);box(.07,7,.07,x,3.5,0,energy);
  // Fixed corner posts frame the lower trench; raised cabin guards move clear of it.
  box(.13,3,.13,x,1.5,2.45,palette.metal);box(.13,3,.13,x,1.5,-2.45,palette.metal);
 }
 box(5.9,.5,1,9,8.8,0,palette.metal);
 box(5,.5,5,9,-.25,0,palette.dark,cabin);box(4.9,.06,4.9,9,.03,0,palette.stone,cabin);
 for(const x of [6.65,11.35]){
  box(.12,.12,4.75,x,.12,0,energy,cabin);box(.12,1.1,4.75,x,.55,0,palette.metal,cabin);
 }
 // Front fence travels with the cabin. The north/rear landing is the only entrance.
 for(const x of [6.65,7.8,9,10.2,11.35])box(.09,2.2,.1,x,1.1,2.35,palette.metal,cabin);
 for(const y of [.35,1.25,2.2])box(4.8,.1,.12,9,y,2.35,palette.metal,cabin);
 box(4.8,.04,.04,9,2.27,2.35,energy,cabin);
 const glyphRoot=new THREE.Group();glyphRoot.position.set(9,.04,0);cabin.add(glyphRoot);bridgeRunes(glyphRoot,energy,energy,0);
 return {cabin,energy};
}
