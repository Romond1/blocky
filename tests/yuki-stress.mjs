import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createYuki } from '../src/characters/Yuki.ts';
import { writeFileSync } from 'node:fs';
const y=createYuki();
assert.ok(y.joints.shield.parent===y.joints.left.forearm);
for(let i=0;i<36000;i++){y.update(1/60,i%600<300?3.5:0,i%900<450);}
y.root.updateMatrixWorld(true);
y.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
y.update(1,0,false);
const bounds=new THREE.Box3().setFromObject(y.root);
assert.ok(bounds.min.y>-.06 && bounds.min.y<.05,'feet contact floor');
assert.ok(bounds.max.y<2.2,'doorway scale');
const materials=new Set(),geometries=new Set();y.root.traverse(o=>{if(o.isMesh){materials.add(o.material);geometries.add(o.geometry)}});
const report={...y.stats,simulatedMinutes:10,bounds:{min:bounds.min,max:bounds.max},materials:materials.size,geometries:geometries.size,passed:true};
writeFileSync('output/yuki-stress.json',JSON.stringify(report,null,2));console.log(report);
