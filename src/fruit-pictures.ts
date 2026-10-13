import * as THREE from 'three';
/** Word-free fruit illustrations: answers are printed only on movable blocks. */
export function fruitPicture(fruit:'APPLE'|'BANANA'|'PEAR',pearColor='#b7d646'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#182b35';c.fillRect(0,0,512,512);c.strokeStyle='#83765b';c.lineWidth=12;c.strokeRect(12,12,488,488);
 c.shadowColor='#0008';c.shadowBlur=22;c.shadowOffsetY=12;
 if(fruit==='APPLE'){
  c.fillStyle='#ee353b';c.beginPath();c.moveTo(256,163);c.bezierCurveTo(125,80,83,222,129,337);c.bezierCurveTo(160,418,219,420,256,391);c.bezierCurveTo(300,421,371,403,395,328);c.bezierCurveTo(445,211,378,95,256,163);c.fill();
 }else if(fruit==='BANANA'){
  c.fillStyle='#ffcf39';c.beginPath();c.moveTo(128,128);c.bezierCurveTo(111,370,290,421,413,217);c.bezierCurveTo(383,402,172,469,111,274);c.bezierCurveTo(91,218,97,168,128,128);c.fill();
  c.strokeStyle='#f6a523';c.lineWidth=8;c.beginPath();c.moveTo(124,168);c.bezierCurveTo(120,366,296,418,398,249);c.stroke();
  c.fillStyle='#765539';c.fillRect(111,118,22,30);c.save();c.translate(411,218);c.rotate(.5);c.fillRect(-9,-15,19,25);c.restore();
 }else{
  c.fillStyle=pearColor;c.beginPath();c.moveTo(250,145);c.bezierCurveTo(202,136,212,235,173,270);c.bezierCurveTo(76,359,161,442,255,433);c.bezierCurveTo(374,450,433,355,347,273);c.bezierCurveTo(305,234,306,145,270,145);c.fill();
 }
 c.shadowBlur=0;c.shadowOffsetY=0;
 if(fruit!=='BANANA'){
  c.strokeStyle='#83553c';c.lineWidth=17;c.lineCap='round';c.beginPath();c.moveTo(258,162);c.quadraticCurveTo(250,119,275,94);c.stroke();
  c.fillStyle='#4ea957';c.beginPath();c.moveTo(266,130);c.quadraticCurveTo(308,72,359,112);c.quadraticCurveTo(318,150,266,130);c.fill();
  c.fillStyle='#ffffff45';c.beginPath();c.ellipse(fruit==='APPLE'?164:190,fruit==='APPLE'?217:328,14,29,.4,0,Math.PI*2);c.fill();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map:texture});
}
