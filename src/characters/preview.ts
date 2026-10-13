/// <reference types="vite/client" />
import * as THREE from 'three';
import { createYuki } from './Yuki.ts';
import { createMia } from './Mia.ts';
if (!import.meta.env.DEV) throw new Error('Character inspection is development-only.');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x192333);
scene.add(new THREE.HemisphereLight(0xe1f3ff,0x687080,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);scene.add(light);
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,30);camera.position.set(0,1.3,4.6);camera.lookAt(0,1.1,0);
const yuki=new URLSearchParams(location.search).get('hero')==='mia'?createMia():createYuki();scene.add(yuki.root);
let pose='idle',axes=false,last=performance.now();const helpers:THREE.AxesHelper[]=[];
yuki.root.traverse(o=>{if(o.name.includes('Pivot')||o.name==='Head'){const h=new THREE.AxesHelper(.2);h.visible=false;o.add(h);helpers.push(h)}});
document.querySelectorAll<HTMLButtonElement>('[data-pose]').forEach(b=>b.onclick=()=>{pose=b.dataset.pose!});
document.querySelector<HTMLButtonElement>('#turn')!.onclick=()=>yuki.root.rotation.y+=Math.PI/2;
document.querySelector<HTMLButtonElement>('#pivots')!.onclick=()=>{axes=!axes;helpers.forEach(h=>h.visible=axes)};
document.querySelector('#stats')!.textContent=`${yuki.stats.triangles} triangles · ${yuki.stats.drawCalls} model draws · idle / walk / carrying`;
function frame(now:number){const dt=Math.min((now-last)/1000,.04);last=now;yuki.update(dt,pose==='walk'?3.5:0,pose==='carry');renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
