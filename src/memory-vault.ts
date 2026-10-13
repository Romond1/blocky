import { buildCaveShell, buildCaveFloor } from './cave-shell.ts';
import * as THREE from 'three';
import { createWorldMaterials, type WorldMaterials } from './world-materials.ts';
import { memoryLayout } from './puzzles.ts';
import { textMaterial } from './room.ts';

/** Larger hand-authored chamber; all props stay outside the collision footprint. */
export function buildMemoryVault(scene: THREE.Group, options: { shellOnly?: boolean; title?: string; subtitle?: string } = {}) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const palette = createWorldMaterials();
  const stone = [palette.stone, palette.stone, palette.hot, palette.dark];
  const trim = palette.metal, obsidian = palette.dark, lava = palette.lava, glow = palette.energy;
  function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material = stone[0]) {
    const mesh = new THREE.Mesh(geometry, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  box(28, 0.7, 35, 0, -0.48, 0, obsidian);
  buildCaveFloor(scene, palette, 11.8, 15.8);
  // Lava channels and chunky buttresses surround, rather than obstruct, the floor.
  for (const side of [-1, 1]) {
    box(1.7, 0.15, 32, side * 12.85, -0.12, 0, lava);
    for (const z of [-9, 8]) {
      const light = new THREE.PointLight(0xff7030, 80, 20, 2); light.position.set(side * 11, 4, z); scene.add(light);
    }
  }
  buildCaveShell(scene, palette, 11.8, 15.8, 12.5, 2.6);
  const door = new THREE.Group(); door.position.set(0, 0, -15.95); scene.add(door);
  function gatePart(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) {
    const part = box(w, h, d, x, y, z, material); scene.remove(part); door.add(part); return part;
  }
  gatePart(4.95, 7.3, 0.75, 0, 3.65, 0, palette.door);
  for (const x of [-1.75, 0, 1.75]) gatePart(0.12, 6.7, 0.1, x, 3.65, 0.42, trim);
  for (const y of [0.6, 2.5, 5.1, 6.8]) gatePart(4.7, 0.16, 0.12, 0, y, 0.44, trim);
  const seal = gatePart(1, 1, 0.14, 0, 4, 0.46, glow); seal.rotation.z = Math.PI / 4;
  for (const side of [-1, 1]) {
    box(0.8, 7.9, 1.4, side * 2.95, 3.95, -15.95, trim);
    box(0.09, 7, 0.14, side * 2.52, 3.65, -15.15, glow);
    box(1.2, 0.7, 1.7, side * 2.95, 0.35, -15.95, obsidian);
  }
  box(7.1, 0.75, 1.6, 0, 7.7, -15.95, trim);
  box(5, 0.3, 4.5, 0, -0.15, -18, obsidian);
  box(0.5, 9, 4.5, -2.75, 4.5, -18, obsidian); box(0.5, 9, 4.5, 2.75, 4.5, -18, obsidian);
  box(5.5, 9, 0.5, 0, 4.5, -20.1, obsidian); box(5.5, 0.5, 4.5, 0, 9, -18, obsidian);
  box(4.5, 6, 0.1, 0, 3.2, -19.8, glow);
  const exitLight = new THREE.PointLight(0x7cffe5, 65, 13); exitLight.position.set(0, 3, -18); scene.add(exitLight);

  const socketMaterials = (options.shellOnly ? [] : memoryLayout.sockets).map((s, i) => {
    const material = buildPedestal(scene, s, String(i + 1), palette);
    const marker = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), textMaterial(String(i + 1), '#173c40'));
    marker.rotation.x = -Math.PI / 2; marker.position.set(s.x, 0.025, s.z + 2); scene.add(marker);
    return material;
  });
  // A single readable wide inscription on the far wall, generated at runtime.
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 384;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#151f2b'; ctx.fillRect(0, 0, 2048, 384);
  ctx.strokeStyle = '#a08359'; ctx.lineWidth = 10; ctx.strokeRect(15, 15, 2018, 354);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe6b8'; ctx.font = 'bold 103px sans-serif'; ctx.fillText(options.title ?? 'REMEMBER YOUR ADVENTURE', 1024, 158);
  ctx.fillStyle = '#cdece5'; ctx.font = '57px sans-serif'; ctx.fillText(options.subtitle ?? 'Put these events in the order they happened.', 1024, 280);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 2.5), new THREE.MeshBasicMaterial({ map: texture }));
  sign.position.set(0, 9.6, -15.64); scene.add(sign);
  const emberGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(100 * 3);
  for (let i = 0; i < 100; i++) { positions[i * 3] = Math.sin(i * 15.7) * 13; positions[i * 3 + 1] = i % 18 * 0.5 + 0.4; positions[i * 3 + 2] = Math.cos(i * 7.2) * 15; }
  emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({ color: 0xffb45f, size: 0.04, transparent: true, opacity: 0.55, depthWrite: false })); scene.add(embers);
  return { door, socketMaterials, tiles: [] as THREE.Mesh[], embers, lava, palette };
}

/** Same socket geometry in both multi-block rooms. */
export function buildPedestal(scene: THREE.Group, s: { x: number; z: number }, label: string, palette: WorldMaterials) {
  const material = new THREE.MeshStandardMaterial({ color: 0x64ddd5, emissive: 0x32c6bb, emissiveIntensity: 0.55 });
  const stone = palette.metal;
  const inset = palette.door;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  function box(w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material) {
    const mesh = new THREE.Mesh(geometry, mat); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  }
  box(2.5, 0.65, 2, s.x, 0.325, s.z, stone);
  box(2.25, 0.15, 1.8, s.x, 0.725, s.z, inset);
  for (const side of [-1, 1]) {
    box(0.1, 0.06, 1.9, s.x + side * 1.13, 0.82, s.z, material);
    box(2.3, 0.06, 0.1, s.x, 0.82, s.z + side * 0.9, material);
  }
  const face = new THREE.Mesh(new THREE.PlaneGeometry(label.length > 1 ? 1.25 : 0.48, 0.48), textMaterial(label, '#173c40'));
  face.position.set(s.x, 0.36, s.z + 1.01); scene.add(face);
  return material;
}
