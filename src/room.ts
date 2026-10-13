import { buildPuzzleCircuit } from './puzzle-visuals.ts';
import { volcanoLayout, type RoomLayout } from './puzzles.ts';
import { buildCaveShell, buildCaveFloor } from './cave-shell.ts';
import * as THREE from 'three';
import { createWorldMaterials } from './world-materials.ts';

export function textMaterial(text: string, background = '#173344', foreground = '#fff6da') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = background; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#c4a777'; ctx.lineWidth = 12; ctx.strokeRect(24, 24, 464, 464);
  if(text==='_'){ctx.strokeStyle=foreground;ctx.lineWidth=9;ctx.setLineDash([22,16]);ctx.strokeRect(70,70,372,372);ctx.setLineDash([]);}
  ctx.fillStyle = foreground;
  const lines = text.split(' ');
  let fontSize = lines.length > 1 ? 115 : 330;
  ctx.font = `bold ${fontSize}px sans-serif`;
  while (lines.some(line => ctx.measureText(line).width > 425) && fontSize > 24) ctx.font = `bold ${--fontSize}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((line, index) => ctx.fillText(line, 256, 267 + (index - (lines.length - 1) / 2) * (fontSize + 22)));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 0.18 });
}

export function buildRoom(scene: THREE.Scene | THREE.Group, layout:RoomLayout=volcanoLayout) {
  const {halfWidth:w,halfDepth:d,sockets}=layout;const shift=7.8-d,exitX=layout.exitCenterX??0;
  const palette = createWorldMaterials();
  const stone = [palette.stone, palette.stone, palette.stone, palette.stone];
  const basalt = palette.dark, trim = palette.metal, lava = palette.lava, cyan = palette.energy;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material = basalt) {
    const mesh = new THREE.Mesh(geometry, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  box(w*2+4, 0.6, d*2+3, 0, -0.5, 0);
  buildCaveFloor(scene, palette, w, d);
  for (const side of [-1, 1]) {
    box(1.2, 0.13, d*2+.4, side * (w+.7), -0.2, 0, lava);
    for (const z of [-5, 1, 6]) {
      const light = new THREE.PointLight(0xff7d30, 42, 9, 2); light.position.set(side * (w+.1), 2.5, z); scene.add(light);
    }
  }
  buildCaveShell(scene, palette, w, d, 9, 1.6,exitX);
  for(const o of layout.obstacles??[])box(o.width,o.height,o.depth,o.x,o.height/2,o.z,palette.stone);
  const doorwayStart=scene.children.length;
  // Thick arch and a single rising gate.
  for (const side of [-1, 1]) {
    box(0.65, 4.8, 0.9, side * 1.85, 2.4, -7.9+shift, trim);
    box(0.1, 3.7, 0.1, side * 1.51, 2, -7.37+shift, trim);
  }
  box(4.4, 0.7, 1.2, 0, 4.8, -7.9+shift, trim);
  const door = new THREE.Group(); door.position.set(0, 0, -7.95+shift); scene.add(door);
  const panel = box(2.95, 4.2, 0.5, 0, 2.1, 0, palette.door); scene.remove(panel); door.add(panel);
  for (let x = -1; x <= 1; x += 0.5) {
    const bar = box(0.07, 3.8, 0.08, x, 2.1, 0.3, trim); scene.remove(bar); door.add(bar);
  }
  const seal = box(0.45, 0.45, 0.12, 0, 2.3, 0.32, cyan); scene.remove(seal); door.add(seal); seal.rotation.z = Math.PI / 4;
  box(3, 0.3, 4.5, 0, -0.15, -9.75+shift, basalt);
  box(0.5, 6, 4.5, -1.75, 3, -9.75+shift); box(0.5, 6, 4.5, 1.75, 3, -9.75+shift);
  box(3.5, 6, 0.5, 0, 3, -12+shift); box(3.5, 0.5, 4.5, 0, 6, -9.75+shift);
  box(2.6, 3.8, 0.1, 0, 2, -11.7+shift, cyan);
  const exitLight = new THREE.PointLight(0x79ffe6, 40, 10); exitLight.position.set(0, 2.5, -10+shift); scene.add(exitLight);
  // Offset the complete arch, door and exit passage as one architectural unit.
  scene.children.slice(doorwayStart).forEach(part=>part.position.x+=exitX);
  const circuit=buildPuzzleCircuit(scene,layout,door,palette.stone);
  const socketMaterials=circuit.socketMaterials;
  const tiles: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(1.05,1.05,.18), textMaterial(['H','_','R','O'][i], '#252f35', '#ffac55'));
    tile.position.set(exitX+(i-1.5)*1.18,5.7,-d+.3);scene.add(tile);tiles.push(tile);
  }
  if(sockets[1])box(2.6,.7,.14,sockets[1].x,2.2,sockets[1].z-1.2,textMaterial('HEAVY','#324448','#ffac55'));
  // Simple floating embers: one draw call, deterministic positions.
  const vertices = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) { vertices[i * 3] = Math.sin(i * 15.7) * (w+.5); vertices[i * 3 + 1] = (i % 13) * 0.48 + 0.3; vertices[i * 3 + 2] = Math.cos(i * 7.2) * (d-.5); }
  const emberGeometry = new THREE.BufferGeometry(); emberGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({ color: 0xffb35c, size: 0.025, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(embers);
  return { door, socketMaterials, circuit, tiles, embers, lava, palette };
}
