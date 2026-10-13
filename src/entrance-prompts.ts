/** Short entrance instructions follow the browser language; puzzle answers stay English. */
const copies={
 en:{info:'Press [E] for info',jump:'Press [SPACE] to jump'},
 ja:{info:'[E] キーでヒントを見る',jump:'[SPACE] キーでジャンプ'},
 es:{info:'Pulsa [E] para ver la ayuda',jump:'Pulsa [SPACE] para saltar'},
 fr:{info:'Appuie sur [E] pour les infos',jump:'Appuie sur [SPACE] pour sauter'},
 de:{info:'Drücke [E] für Infos',jump:'Drücke [SPACE] zum Springen'},
 it:{info:'Premi [E] per le informazioni',jump:'Premi [SPACE] per saltare'},
 pt:{info:'Pressione [E] para ver a ajuda',jump:'Pressione [SPACE] para pular'},
 ko:{info:'[E] 키로 도움말 보기',jump:'[SPACE] 키로 점프'},
 zh:{info:'按 [E] 查看提示',jump:'按 [SPACE] 跳跃'},
};
export function entranceCopy(languages:readonly string[]){
 for(const tag of languages){const language=tag.toLowerCase().split(/[-_]/)[0] as keyof typeof copies;if(language in copies)return {language,...copies[language]};}
 return {language:'en',...copies.en};
}
export const entranceText=entranceCopy(typeof navigator==='undefined'?['en']:navigator.languages?.length?navigator.languages:[navigator.language]);
/** Render real keycaps, fitting translated text around them without clipping. */
export function paintEntrancePrompt(canvas:HTMLCanvasElement,text:string){
 const c=canvas.getContext('2d')!;c.clearRect(0,0,1200,300);
 c.fillStyle='#15252e';c.fillRect(0,0,1200,300);c.strokeStyle='#74c8d0';c.lineWidth=8;c.strokeRect(8,8,1184,284);
 const parts=text.split(/(\[[^\]]+\])/);let size=78;
 const width=(part:string)=>part.startsWith('[')?(part==='[SPACE]'?size*3.7:size*1.2):c.measureText(part).width;
 let total=0;do{c.font=`bold ${size}px sans-serif`;total=parts.reduce((n,p)=>n+width(p),0);if(total<=1080)break;size--;}while(size>24);
 let left=(1200-total)/2;c.textBaseline='middle';c.textAlign='left';
 for(const part of parts){const w=width(part);if(part.startsWith('[')){
  c.fillStyle='#07131b';c.beginPath();c.roundRect(left,83,w,142,14);c.fill();
  c.fillStyle='#dce4e4';c.beginPath();c.roundRect(left,72,w,132,14);c.fill();
  c.strokeStyle='#879ca5';c.lineWidth=3;c.stroke();c.fillStyle='#20323c';c.font=`bold ${size*.68}px sans-serif`;c.textAlign='center';c.fillText(part.slice(1,-1),left+w/2,137);
  if(part==='[SPACE]'){c.beginPath();c.moveTo(left+w*.22,172);c.lineTo(left+w*.22,181);c.lineTo(left+w*.78,181);c.lineTo(left+w*.78,172);c.stroke();}
  c.font=`bold ${size}px sans-serif`;c.textAlign='left';
 }else {c.fillStyle='#fff3d9';c.fillText(part,left,146);}left+=w;}
}
