import assert from 'node:assert/strict';
import {createMia} from '../src/characters/Mia.ts';
const mia=createMia();const cape=mia.root.getObjectByName('RigidCape');assert.ok(cape);assert.equal(mia.joints.shield.parent,mia.joints.right.hand);
const rigid=cape.children.map(o=>({p:o.position.toArray(),r:o.rotation.toArray()}));
for(let i=0;i<36000;i++)mia.update(1/60,i%600<300?3.5:0,i%900<450);
mia.root.updateMatrixWorld(true);mia.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
assert.deepEqual(cape.children.map(o=>({p:o.position.toArray(),r:o.rotation.toArray()})),rigid);
console.log('PASS Mia: 10 simulated minutes, rigid cape, sword parent, finite transforms',mia.stats);
