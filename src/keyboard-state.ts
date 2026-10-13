export const MOVEMENT_KEYS=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
const aliases:Record<string,string>={w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD',ArrowUp:'ArrowUp',ArrowDown:'ArrowDown',ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight'};
/** Physical press/release state. OS repeat is not evidence that other held keys were released. */
export class KeyboardState extends Set<string>{
 // Keep the optional clock for callers; held state deliberately has no timeout.
 constructor(_now?:()=>number){super();}
 renew(_code:string){} // Repeats must not resurrect input cleared by focus loss.
 release(code:string,key:string){this.delete(code);const alias=aliases[key.toLowerCase()]??aliases[key];if(alias)this.delete(alias);}
}
