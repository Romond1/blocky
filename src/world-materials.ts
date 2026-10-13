import * as THREE from 'three';

/** Room-owned palette: no downloaded textures, extra render passes or global GPU resources. */
export function createWorldMaterials() {
  const time = { value: 0 };
  function surface(color: number, kind: 'stone' | 'hot' | 'lava', roughness = 0.92) {
    const material = new THREE.MeshStandardMaterial({ color, roughness,
      emissive: kind === 'stone' ? 0x000000 : 0xffffff, emissiveIntensity: kind === 'lava' ? 1.15 : 0.65 });
    material.onBeforeCompile = shader => {
      shader.uniforms.worldTime = time;
      shader.vertexShader = 'varying vec3 rockPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
        vec4 rockWorld = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          rockWorld = instanceMatrix * rockWorld;
        #endif
        rockPosition = (modelMatrix * rockWorld).xyz;
        #include <project_vertex>`);
      shader.fragmentShader = `varying vec3 rockPosition;
        uniform float worldTime;
        float rockHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.1,0.2,0.3)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
        float rockNoise(vec3 p) {
          vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(rockHash(i),rockHash(i+vec3(1,0,0)),f.x),mix(rockHash(i+vec3(0,1,0)),rockHash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(rockHash(i+vec3(0,0,1)),rockHash(i+vec3(1,0,1)),f.x),mix(rockHash(i+vec3(0,1,1)),rockHash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
      ` + shader.fragmentShader;
      const lava = kind === 'lava';
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec3 rp = rockPosition;
        ${lava ? 'rp += vec3(worldTime * 0.07, worldTime * 0.42, -worldTime * 0.045);' : ''}
        float broad = rockNoise(rp * 1.15);
        float grain = rockNoise(rp * ${lava ? '3.3' : '8.0'});
        float vein = abs(broad + grain * 0.16 - 0.53);
        float fissure = 1.0 - smoothstep(0.003, 0.018, vein);
        ${lava ? `float heat = smoothstep(0.25, 0.76, broad + grain * 0.24);
          vec3 molten = mix(vec3(0.22,0.012,0.002),vec3(1.0,0.19,0.006),heat);
          molten = mix(molten,vec3(1.0,0.72,0.12),fissure * 0.83);
          molten = mix(molten, vec3(0.035,0.006,0.003), smoothstep(0.58,0.73,broad) * 0.9);
          diffuseColor.rgb = molten;` : `diffuseColor.rgb *= 0.82 + broad * 0.24 + grain * 0.12;
          diffuseColor.rgb *= 1.0 - fissure * 0.13;`}
      `);
      if (kind !== 'stone') shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance *= ${lava ? 'molten' : 'vec3(1.0,0.12,0.005) * fissure * smoothstep(0.40,0.65,grain)'};`);
    };
    material.customProgramCacheKey = () => `block-world-${kind}-v1`;
    return material;
  }
  const stone = surface(0x626675, 'stone');
  const dark = surface(0x282f3d, 'stone');
  const hot = surface(0x3b404e, 'hot');
  const lava = surface(0xffffff, 'lava', 0.72);
  const metal = new THREE.MeshStandardMaterial({color:0x82725c,metalness:0.65,roughness:0.48});
  const door = new THREE.MeshStandardMaterial({color:0x263b48,metalness:0.6,roughness:0.38});
  const energy = new THREE.MeshStandardMaterial({color:0x63dbdf,emissive:0x23bfd2,emissiveIntensity:0.6,metalness:0.25,roughness:0.35});
  return { stone, dark, hot, lava, metal, door, energy, time };
}
export type WorldMaterials = ReturnType<typeof createWorldMaterials>;

/** Existing lights and particles only; animation never writes to simulation state. */
export function animateEnvironment(root: THREE.Group, embers: THREE.Points, palette: WorldMaterials, seconds: number, solved: boolean) {
  palette.time.value = seconds;
  palette.energy.emissiveIntensity = solved ? 1.45 + Math.sin(seconds * 2) * 0.12 : 0.45;
  const positions = embers.geometry.getAttribute('position') as THREE.BufferAttribute;
  if (!embers.userData.base) embers.userData.base = Float32Array.from(positions.array);
  const base = embers.userData.base as Float32Array;
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, (base[i * 3 + 1] + seconds * (0.11 + i % 3 * 0.025)) % 8 + 0.2);
    positions.setX(i, base[i * 3] + Math.sin(seconds * 0.3 + i) * 0.12);
  }
  positions.needsUpdate = true;
  root.traverse(object => {
    if (object instanceof THREE.PointLight && object.color.r > object.color.g * 1.5) {
      object.userData.baseIntensity ??= object.intensity;
      object.intensity = object.userData.baseIntensity * (1 + Math.sin(seconds * 1.4 + object.position.z) * 0.035);
    }
  });
}
