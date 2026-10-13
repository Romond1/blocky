import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createWorldMaterials} from '../src/world-materials.ts';
import {buildFoundryRecoveryStair} from '../src/sorting-foundry-chamber.ts';
test('sideways recovery treads fill below the walking surface instead of blocking the hero',()=>{
 const scene=new THREE.Group(),root=buildFoundryRecoveryStair(scene,createWorldMaterials());scene.updateMatrixWorld(true);
 for(const child of root.children){const p=child.getWorldPosition(new THREE.Vector3()),bounds=new THREE.Box3().setFromObject(child),floor=-(p.x+9)*.6;
  assert.ok(bounds.max.y<=floor+.17,`step at x=${p.x} blocks above floor ${floor}: ${bounds.max.y}`);assert.ok(bounds.min.y>=-3.1);
 }
});
