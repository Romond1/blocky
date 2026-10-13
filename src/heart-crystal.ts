import * as THREE from 'three';
/** Shared fragment silhouette: the finale and collectible economy use one art source. */
export function heartShardGeometry(){
 const s=new THREE.Shape();s.moveTo(-.29,.27);s.lineTo(-.09,.61);s.lineTo(.32,.43);s.lineTo(.19,.06);s.lineTo(.34,-.14);s.lineTo(-.06,-.64);s.lineTo(-.34,-.06);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.045,bevelThickness:.045});g.translate(0,0,-.08);return g;
}
export function heartMaterial(){return new THREE.MeshStandardMaterial({color:0xffdb5b,emissive:0xffb91b,emissiveIntensity:.85,metalness:.15,roughness:.15,transparent:true,opacity:.73,side:THREE.DoubleSide,depthWrite:false});}
export function heartGeometry(){
 const s=new THREE.Shape();s.moveTo(0,.27);s.lineTo(-.23,.53);s.lineTo(-.48,.47);s.lineTo(-.55,.2);s.lineTo(-.43,-.06);s.lineTo(0,-.52);s.lineTo(.43,-.06);s.lineTo(.55,.2);s.lineTo(.48,.47);s.lineTo(.23,.53);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:1});g.translate(0,0,-.16);return g;
}
export function decorateHeart(mesh:THREE.Mesh){
 const core=new THREE.Mesh(new THREE.OctahedronGeometry(.19),new THREE.MeshBasicMaterial({color:0xffef9b}));mesh.add(core,new THREE.PointLight(0xffd15a,6,6,2));
 const geometry=new THREE.OctahedronGeometry(.025),material=new THREE.MeshBasicMaterial({color:0xffe99b});
 const sparks=Array.from({length:6},()=>{const spark=new THREE.Mesh(geometry,material);mesh.add(spark);return spark;});
 return (time:number)=>{sparks.forEach((s,i)=>{const a=time*.7+i*Math.PI/3;s.position.set(Math.cos(a)*.67,Math.sin(time*1.6+i)*.55,Math.sin(a)*.46);});};
}
