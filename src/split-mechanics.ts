export type Hero = 'yuki'|'mia';
export type Position = {x:number;z:number};
export const TUTORIAL_GAP={far:15.4,near:16.4,stop:16.78};
export const HELP_BUTTONS=[{x:-13.38,z:22.2},{x:-6.62,z:22.2}];
export function nearHelpButton(p:Position){return HELP_BUTTONS.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<2.15);}
export const newMotion=()=>({y:0,vy:0,grounded:true,crossed:false});
export type Motion=ReturnType<typeof newMotion>;
export class Bridge {
 time=0; extension=0; permanent=false;
 update(dt:number,active:boolean,locked:boolean){
  this.permanent=locked;
  if(locked){this.extension=1;return;}
  if(!active){this.time=0;this.extension=0;return;}
  this.time+=dt;const phase=this.time%5.5;
  this.extension=phase<.8?phase/.8:phase<3.35?1:phase<4.05?1-(phase-3.35)/.7:0;
 }
 get state(){return this.permanent?'STABLE':this.extension>=.98?'CROSS NOW':this.extension>0?'MOVING':'RETRACTED';}
}
export function ramp(p:Position){return p.x>=-8&&p.x<=-3&&p.z>=5&&p.z<=9;}
export function ground(p:Position,bridge:Bridge,below=false){
 if(ramp(p))return -(p.x+8)*.6;
 if(p.x>-3&&p.x<9){
  if(!below&&p.z>=-4&&p.z<=0&&bridge.extension>=.98)return 0;
  return -3;
 }
 return 0;
}
export function tutorialGap(p:Position){return p.z>TUTORIAL_GAP.far&&p.z<TUTORIAL_GAP.near;}
export function safeBlockFloor(p:Position){return (p.x<=-4.2||p.x>=10.2)&&!ramp(p)&&p.z<15;}

export const nearJumpDitch=(p:Position)=>p.z<18.8&&p.z>TUTORIAL_GAP.far&&p.x< -3;
