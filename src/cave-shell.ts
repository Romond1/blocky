import * as THREE from 'three';
import type { WorldMaterials } from './world-materials.ts';

/** Decorative geology stays outside the existing walkable footprint. */
export function buildCaveShell(parent: THREE.Object3D, palette: WorldMaterials, width: number, depth: number, height: number, exitWidth: number, exitCenterX=0, rearOpenings:readonly {centerX:number;halfWidth:number;height:number}[]=[]) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const rocks: THREE.Matrix4[] = [], flows: THREE.Matrix4[] = [];
  const transform = new THREE.Object3D();
  let seed = 7341;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function block(list: THREE.Matrix4[], x: number, y: number, z: number, w: number, h: number, d: number, tilt = 0) {
    transform.position.set(x,y,z); transform.scale.set(w,h,d); transform.rotation.set(tilt * 0.45,tilt,tilt * 0.6); transform.updateMatrix(); list.push(transform.matrix.clone());
  }
  // Overlapping, offset strata: no mortar grid, columns, or metal lamp housings.
  for (const side of [-1,1]) {
    for (let z = -depth - 1; z <= depth + 1; z += 1.7) {
      for (let y = 0.7; y < height + 2; y += 1.8) {
        const bulk = 1.6 + random() * 2.1;
        block(rocks, side * (width + 1.7 + bulk / 2 + random() * 0.9), y, z + random() * 0.7,
          bulk, 2.1 + random() * 1.4, 2.4 + random() * 1.3, (random() - 0.5) * 0.7);
      }
    }
    // High crags project over the lava, breaking the straight wall silhouette.
    for(let z=-depth;z<depth;z+=3.7) {
      block(rocks,side*(width+1.25),height*0.69+random()*1.4,z,2.0+random(),2.0+random()*2,2.7,(random()-0.5)*0.6);
    }
    // Three uneven lava falls originate high in the rock and reach the molten moat.
    for (const [index, fraction] of [-0.68,0.08,0.7].entries()) {
      const center = depth * fraction + side * 0.7;
      const top = height * (0.72 + index * 0.08);
      for (let y = -0.05; y < top; y += 0.48) {
        const bend = Math.sin(y * 0.7 + index * 2 + side) * 0.36;
        const spread = 0.45 + 0.25 * Math.sin(y * 1.3 + index) ** 2 + (y < 1 ? 0.65 : 0);
        block(flows, side * (width + 1.6 + Math.sin(y * 0.55) * 0.12), y + 0.24, center + bend, 0.28, 0.53, spread);
        // Irregular dark lips make the fall a fissure cut into the rock face.
        for (const edge of [-1,1]) block(rocks,side * (width + 1.85),y + 0.3,center + bend + edge * (spread / 2 + 0.35),0.8,0.7,0.7);
      }
      block(flows, side * (width + 0.9), -0.12, center, 1.8, 0.12, 2.2);
    }
    // Preserve the geology seed sequence after removing the raised lava bank.
    for (let z=-depth;z<depth;z+=1.3) random();
  }
  for (const side of [-1,1]) for (let x=-width-2;x<width+2;x+=1.6) {
    for (let y=0.8;y<height+2;y+=1.8) {
      // Keep the entire gate, inscriptions, and tunnel clear.
      if (side < 0 && Math.abs(x-exitCenterX) < exitWidth + 1.7) continue;
      if(side<0&&rearOpenings.some(o=>y<o.height+1.7&&Math.abs(x-o.centerX)<o.halfWidth+1.7))continue;
      block(rocks,x+random()*0.5,y,side*(depth+1.9+random()*1.5),2.4+random(),2.2+random(),1.5+random(),(random()-0.5)*0.55);
    }
  }
  // A broken overhead crust with hanging angular teeth; never near head height.
  for(let x=-width-2;x<width+2;x+=2.5) for(let z=-depth-1;z<depth+1;z+=2.8) {
    block(rocks,x,height+0.8+random()*1.1,z,3.8,2+random()*1.4,4,(random()-0.5)*0.28);
    if(random()<0.38 && Math.abs(x-exitCenterX)>exitWidth+1) block(rocks,x,height-0.4,z,0.7+random(),1.8+random()*1.5,0.8+random(),(random()-0.5)*0.3);
  }
  for(const [matrices,material,name] of [[rocks,palette.dark,'cave-strata'],[flows,palette.lava,'lava-falls']] as const) {
    const mesh = new THREE.InstancedMesh(geometry,material,matrices.length);
    matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix)); mesh.name=name; mesh.receiveShadow=true;
    // Static geology uses ambient/key shading; no extra shadow pass for hundreds of rocks.
    mesh.castShadow=false; mesh.computeBoundingSphere(); parent.add(mesh);
  }
}

/** Flat natural bedrock, with an irregular shoreline outside the collision boundary. */
export function buildCaveFloor(parent: THREE.Object3D, palette: WorldMaterials, width: number, depth: number) {
  const outline = new THREE.Shape();
  outline.moveTo(-width, -depth);
  outline.lineTo(width, -depth);
  for (let z = -depth + 0.8, i = 0; z < depth; z += 0.8, i++) {
    outline.lineTo(width + 0.04 + (Math.sin(i * 4.7) * 0.5 + 0.5) * 0.22, z);
  }
  outline.lineTo(width, depth); outline.lineTo(-width, depth);
  for (let z = depth - 0.8, i = 0; z > -depth; z -= 0.8, i++) {
    outline.lineTo(-width - 0.04 - (Math.sin(i * 3.1 + 2) * 0.5 + 0.5) * 0.22, z);
  }
  outline.closePath();
  const floor = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: 0.2, bevelEnabled: false, steps: 1 }), palette.dark);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.2;
  floor.receiveShadow = true; floor.name = 'natural-cave-floor'; parent.add(floor);
}
