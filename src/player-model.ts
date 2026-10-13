import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Movement owns the parent Group; replace only its visual child. Faces local +Z. */
export function createPlayerModel(): THREE.Group {
  const model = new THREE.Group();
  const part = (size: number[], position: number[], color: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size as [number, number, number]), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    mesh.position.set(...position as [number, number, number]); mesh.castShadow = true; model.add(mesh);
  };
  part([0.62, 0.65, 0.36], [0, 1.04, 0], 0x237e9c);
  part([0.59, 0.54, 0.51], [0, 1.65, 0], 0xf5ba84);
  part([0.65, 0.2, 0.57], [0, 1.96, -0.02], 0x25323e);
  part([0.65, 0.35, 0.15], [0, 1.73, -0.23], 0x25323e);
  for (const side of [-1, 1]) {
    part([0.24, 0.6, 0.3], [side * 0.19, 0.41, 0], 0x243243);
    part([0.27, 0.18, 0.4], [side * 0.19, 0.12, 0.04], 0x171e29);
    part([0.24, 0.58, 0.3], [side * 0.44, 1.06, 0], 0x4babc0);
    part([0.24, 0.2, 0.28], [side * 0.44, 0.72, 0], 0xf5ba84);
    part([0.1, 0.1, 0.025], [side * 0.14, 1.67, 0.26], 0x17232c);
  }
  part([0.17, 0.22, 0.04], [0, 1.12, 0.2], 0xb0ffff);
  return model;
}

/** Optional: call with '/models/player.glb'. Failure preserves the placeholder. */
export async function replacePlayerModel(parent: THREE.Group, url: string): Promise<boolean> {
  try {
    const { scene } = await new GLTFLoader().loadAsync(url);
    const box = new THREE.Box3().setFromObject(scene);
    const height = box.max.y - box.min.y;
    if (height <= 0) return false;
    scene.scale.setScalar(2.06 / height);
    const normalized = new THREE.Box3().setFromObject(scene);
    scene.position.set(-(normalized.min.x + normalized.max.x) / 2, -normalized.min.y, -(normalized.min.z + normalized.max.z) / 2);
    scene.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = true; } });
    parent.clear(); parent.add(scene); return true;
  } catch (error) { console.warn('GLB unavailable; keeping the placeholder.', error); return false; }
}
