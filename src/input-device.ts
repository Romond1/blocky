export type ControlMode='touch'|'keyboard';
export type ControlPreference=ControlMode|'auto';
export const CONTROL_KEY='be-a-hero:controls';
export function chooseControlMode(preference:ControlPreference,capabilities:{width:number;coarse:boolean;fine:boolean;touchPoints:number;lastInput?:string}):ControlMode{
 if(preference!=='auto')return preference;
 if(capabilities.lastInput==='touch')return 'touch';
 if(capabilities.lastInput==='keyboard'||capabilities.lastInput==='mouse')return 'keyboard';
 return capabilities.coarse||(capabilities.touchPoints>0&&!capabilities.fine&&capabilities.width<=1400)?'touch':'keyboard';
}
export const needsRotation=(mode:ControlMode,width:number,height:number)=>mode==='touch'&&width<600&&height>width;
export function joystickVector(dx:number,dy:number,radius:number){
 const length=Math.hypot(dx,dy),dead=radius*.12;
 if(length<=dead)return {x:0,z:0};
 const magnitude=Math.min(1,(length-dead)/(radius-dead));
 return {x:dx/length*magnitude,z:-dy/length*magnitude};
}
export function createInputDevice(onChange:()=>void){
 const coarse=matchMedia('(pointer: coarse)'),fine=matchMedia('(any-pointer: fine)');
 let preference:ControlPreference='auto',lastInput:string|undefined,mode:ControlMode='keyboard',portrait=false;
 try{const saved=localStorage.getItem(CONTROL_KEY);if(saved==='touch'||saved==='keyboard')preference=saved;}catch{}
 function refresh(){
  const width=visualViewport?.width??innerWidth,height=visualViewport?.height??innerHeight;
  const next=chooseControlMode(preference,{width,coarse:coarse.matches,fine:fine.matches,touchPoints:navigator.maxTouchPoints,lastInput});
  const rotate=needsRotation(next,width,height),changed=next!==mode||portrait!==rotate;
  mode=next;portrait=rotate;document.documentElement.dataset.controls=mode;
  if(changed)onChange();
 }
 function observe(input:string){if(lastInput===input)return;lastInput=input;refresh();}
 window.addEventListener('pointerdown',e=>observe(e.pointerType==='touch'?'touch':'mouse'),true);
 window.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&!(e.target instanceof HTMLSelectElement))observe('keyboard');},true);
 window.addEventListener('resize',refresh);visualViewport?.addEventListener('resize',refresh);coarse.addEventListener('change',refresh);fine.addEventListener('change',refresh);
 refresh();
 return {get mode(){return mode;},get portrait(){return portrait;},get preference(){return preference;},refresh,
  setPreference(value:ControlPreference){preference=value;lastInput=undefined;try{localStorage.setItem(CONTROL_KEY,value);}catch{}refresh();onChange();},
  async requestLandscape(element:HTMLElement){
   if(mode!=='touch')return;
   // Browser support varies; rejection always leaves the rotation prompt available.
   const orientation=screen.orientation as ScreenOrientation&{lock?:(value:string)=>Promise<void>};
   if(!orientation?.lock)return;
   try{if(!document.fullscreenElement&&element.requestFullscreen)await element.requestFullscreen();await orientation.lock('landscape');}catch{}
  },
 };
}
