export type WeightClass='light'|'heavy';
export interface BlockDefinition {size:number;weightClass:WeightClass;requiredStrength:number;requiredAbility?:'strength';carrySpeedMultiplier?:number;}
export const LIGHT_BLOCK:BlockDefinition={size:.95,weightClass:'light',requiredStrength:1};
export const HEAVY_BLOCK:BlockDefinition={size:1.65,weightClass:'heavy',requiredStrength:2,requiredAbility:'strength'};
/** Cube base shared by rendering, collision and stacked support. */
export const blockBase=(block:{y?:number;state?:string})=>block.y??(block.state==='socket'?.29:.015);
export function acceptsPlate(block:BlockDefinition,plate:{accepts?:WeightClass}){return !plate.accepts||block.weightClass===plate.accepts;}
