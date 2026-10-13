const clamp=(v:number)=>Math.max(0,Math.min(1,v));
/** Shared reward presentation state, independent of meshes and puzzle completion. */
export class RewardHatch {
 rise=0;doorOpen=0;visible=false;
 private time=0;private phase:'closed'|'reveal'|'ready'|'retract'='closed';private startRise=0;
 get ready(){return this.phase==='ready';}
 reveal(){if(this.phase==='reveal'||this.phase==='ready')return;this.phase='reveal';this.time=0;this.visible=true;}
 retract(){if(this.phase==='closed'||this.phase==='retract')return;this.startRise=this.rise;this.phase='retract';this.time=0;}
 tick(dt:number){
  this.time+=Math.max(0,dt);
  if(this.phase==='reveal'){
   this.doorOpen=this.time<1.1?clamp(this.time/.25):1-clamp((this.time-1.1)/.3);
   const t=clamp((this.time-.25)/.85);this.rise=t*t*(3-2*t);
   if(this.time>=1.4){this.phase='ready';this.doorOpen=0;this.rise=1;}
  }else if(this.phase==='retract'){
   this.doorOpen=this.time<.85?clamp(this.time/.2):1-clamp((this.time-.85)/.3);
   const t=clamp((this.time-.2)/.65);this.rise=this.startRise*(1-t*t*(3-2*t));
   if(this.time>=1.15){this.phase='closed';this.doorOpen=0;this.rise=0;this.visible=false;}
  }
 }
}
