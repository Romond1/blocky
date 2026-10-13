import * as THREE from 'three';

/** Flat fractured basalt: visual joints only, so movement remains smooth. */
export function basaltFloor(parent:THREE.Group,rectangles:number[][],stone:THREE.MeshStandardMaterial){
 const positions:number[]=[],colors:number[]=[];
 const noise=(x:number,z:number)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
 for(const [left,right,back,front,y=0] of rectangles){
  const sites:{x:number;z:number}[]=[];
  for(let x=left+.7;x<right;x+=1.7)for(let z=back+.6;z<front;z+=1.5)sites.push({x:Math.min(right-.08,x+noise(x,z)*.8),z:Math.min(front-.08,z+noise(z,x)*.7)});
  for(const site of sites){
   let polygon=[[left,back],[right,back],[right,front],[left,front]];
   for(const other of sites){
    if(other===site)continue;
    const nx=other.x-site.x,nz=other.z-site.z,limit=(other.x**2+other.z**2-site.x**2-site.z**2)/2;
    const clipped:number[][]=[];
    for(let i=0;i<polygon.length;i++){
     const a=polygon[i],b=polygon[(i+1)%polygon.length],da=a[0]*nx+a[1]*nz-limit,db=b[0]*nx+b[1]*nz-limit;
     if(da<=0)clipped.push(a);
     if((da<=0)!==(db<=0)){const t=da/(da-db);clipped.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
    }
    polygon=clipped;if(!polygon.length)break;
   }
   if(polygon.length<3)continue;
   const shade=.06+noise(site.x,site.z)*.045;
   const tint=new THREE.Color().setRGB(shade,shade*.99,shade*1.06);
   polygon=polygon.map(([x,z])=>[site.x+(x-site.x)*.975,site.z+(z-site.z)*.975]);
   for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length];positions.push(site.x,y+.009,site.z,b[0],y+.009,b[1],a[0],y+.009,a[1]);
    for(let n=0;n<3;n++)colors.push(tint.r,tint.g,tint.b);
   }
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const material=stone.clone();material.color.setHex(0xffffff);material.vertexColors=true;material.onBeforeCompile=stone.onBeforeCompile;material.customProgramCacheKey=stone.customProgramCacheKey;
 const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.name='fractured-basalt-floor';parent.add(mesh);
}

/** Inlaid angular glyphs and a separate conduit travel with each moving slab. */
export function bridgeRunes(parent:THREE.Group,material:THREE.Material,conduit:THREE.Material,index:number){
 const line=(ax:number,az:number,bx:number,bz:number,width=.045,mat=material)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,.018,Math.hypot(bx-ax,bz-az)),mat);
  mesh.position.set((ax+bx)/2,.028,(az+bz)/2);mesh.rotation.y=Math.atan2(bx-ax,bz-az);parent.add(mesh);
 };
 for(const z of [-1.13,1.13]){
  line(-.5,z,0,z-.45);line(0,z-.45,.5,z);line(.5,z,0,z+.45);line(0,z+.45,-.5,z);
  line(0,z-.65,0,z+.65);line(-.72,z-.25,-.72,z+.25);line(.72,z-.25,.72,z+.25);
  if(index%2===0){line(-1.1,z-.35,-.72,z);line(.72,z,1.1,z+.35);}
  else {line(-1.1,z+.35,-.72,z);line(.72,z,1.1,z-.35);}
 }
 // Mia's amber/cyan power track physically separates when the slabs retract.
 line(-1.49,0,1.49,0,.13,conduit);
 for(const z of [-.24,.24])line(-1.49,z,1.49,z,.035,conduit);
 for(const x of [-1.25,-.8,.8,1.25])line(x,-.31,x,.31,.045,conduit);
}
