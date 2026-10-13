import type {CollectibleIdentity} from './economy.ts';
import {ABILITY_SCALE} from './ability-layout.ts';
import {KAGE_CRYSTAL} from './kage-alcove.ts';
import {LUMA_MEMORY} from './luma-alcove.ts';
import {volcanoLayout,strengthLayout,powerLayout,cooperationLayout,fruitLayout,sortingLayout,actionLayout,abilityLayout,type RoomLayout} from './puzzles.ts';

export type CollectibleType='coin'|'heartShard'|'memoryCrystal';
export interface CollectibleDefinition extends CollectibleIdentity {
 type:CollectibleType;
 /** Position is the supporting floor height; visuals float above it. */
 position:{x:number;y:number;z:number};
 category:'obvious'|'exploration'|'sneaky'|'exit';
 access?:'raisedFruitLift';
}
type Placement=readonly [x:number,y:number,z:number,category:CollectibleDefinition['category']];
function room(roomId:string,number:number,layout:RoomLayout,coins:readonly Placement[]):readonly CollectibleDefinition[]{
 return [...coins.map(([x,y,z,category],i)=>({id:`room${number}_coin_${String(i+1).padStart(2,'0')}`,roomId,type:'coin' as const,value:1,position:{x,y,z},category})),
 {id:`room${number}_heart_shard`,roomId,type:'heartShard',position:{x:layout.exitCenterX??0,y:0,z:(layout.exitZ??-layout.halfDepth)+.35},category:'exit'}];
}
/** Initial placements: edit coordinates here without touching room builders. */
export const ROOM_COLLECTIBLES:Readonly<Record<string,readonly CollectibleDefinition[]>>={
 dragon:[[0,0,32],[8,0,30],[24,0,20],[32,0,12],[33,0,-10],[29,0,-17],[25,4,-16],[19,5,-25],[12,5,-27],[-12,5,-27],[-18,5,-14],[-29,5,-24]].map(([x,y,z],i)=>({id:`room10_coin_${String(i+1).padStart(2,'0')}`,roomId:'dragon',type:'coin' as const,value:1,position:{x,y,z},category:i%3===0?'obvious' as const:'exploration' as const})),
 heart:[[0,0,36,'obvious'],[-11,0,30,'exploration'],[9,0,17,'obvious'],[-12,0,5,'sneaky'],[12,5,-6,'exploration'],[9,2.5,-15,'obvious'],[-11,0,-22,'exploration'],[8,0,-40,'obvious'],[-12,0,-58,'sneaky'],[0,0,-57,'obvious']].map(([x,y,z,category],i)=>({id:`room9_coin_${String(i+1).padStart(2,'0')}`,roomId:'heart',type:'coin' as const,value:1,position:{x:Number(x),y:Number(y),z:Number(z)},category:category as CollectibleDefinition['category']})),
 ability:room('ability',8,abilityLayout,[[-10,0,21,'obvious'],[-14,0,14,'exploration'],[-4.6,0,12.4,'sneaky'],[1.5,0,7,'obvious'],[10.5,0,4,'obvious'],[22,0,3.5,'exploration'],[22,1.2,-6,'exploration'],[4.2,0,-17.5,'sneaky'],[10,0,-22,'obvious']].map(([x,y,z,category])=>[Number(x)*ABILITY_SCALE,Number(y),Number(z)*ABILITY_SCALE,category] as Placement)),
 action:room('action',7,actionLayout,[[12,0,24,'obvious'],[-10,0,20,'obvious'],[-10,0,13,'obvious'],[1.3,1.9,19.1,'obvious'],[-1.3,3.8,14.5,'exploration'],[15,0,22,'sneaky'],[-14,0,7.5,'sneaky'],[8,0,-18,'exploration'],[0,0,-18,'obvious']]),
 hero:room('hero',1,volcanoLayout,[[0,0,2.3,'obvious'],[1.4,0,-.2,'obvious'],[-1,0,-5.8,'obvious'],[4.9,0,-3,'exploration'],[-5.6,0,5.8,'sneaky']]),
 memory:room('memory',2,strengthLayout,[[1.5,0,3.5,'obvious'],[-1.5,0,1,'obvious'],[-3.5,0,-5.8,'obvious'],[7.5,0,2.5,'exploration'],[-7.5,0,4.5,'exploration'],[6.5,0,-7.1,'sneaky']]),
 power:[...room('power',3,powerLayout,[[-10,0,21,'obvious'],[-10,0,12,'obvious'],[-15.5,0,5,'exploration'],[-11,0,-2.7,'obvious'],[3,-3,4,'exploration'],[11,0,5,'exploration'],[16.3,0,10,'sneaky']]),{id:'room3_memory_crystal_kage',roomId:'power',type:'memoryCrystal',position:KAGE_CRYSTAL,category:'sneaky'}],
 cooperation:room('cooperation',4,cooperationLayout,[[6,0,20,'obvious'],[8.5,0,23.5,'exploration'],[3,0,9,'obvious'],[-8.8,0,5,'sneaky'],[4,0,-11,'obvious'],[-6,0,-13,'exploration'],[9,0,-18,'sneaky'],[0,0,-24.5,'exploration']]),
 fruit:[...room('fruit',5,fruitLayout,[[-5,0,7,'obvious'],[-9,0,3,'exploration'],[4,0,3.5,'obvious'],[0,0,-5.5,'obvious'],[-12,0,-2,'sneaky'],[7,5,-5.5,'exploration'],[12,5,-9,'sneaky'],[12.5,-2.4,-1.5,'exploration']]),
  ...[-1.8,-.6,.6,1.8].map((z,i)=>({id:`room5_coin_${String(i+9).padStart(2,'0')}`,roomId:'fruit',type:'coin' as const,value:1,position:{x:10.8,y:-3,z},category:'sneaky' as const,access:'raisedFruitLift' as const})),
  {id:'room5_memory_crystal_luma',roomId:'fruit',type:'memoryCrystal',position:LUMA_MEMORY.crystal,category:'sneaky'}],
 sorting:room('sorting',6,sortingLayout,[[-13,0,22,'obvious'],[-14.7,0,15,'exploration'],[-12,0,10,'obvious'],[0,-3,21,'exploration'],[6,0,18,'obvious'],[4,0,3.5,'exploration'],[7,5,-6,'exploration'],[13,5,-12,'sneaky'],[-14,0,-15,'sneaky']]),
};
export const allCollectibles=Object.values(ROOM_COLLECTIBLES).flat();
export const totalHeartShards=allCollectibles.filter(c=>c.type==='heartShard').length;
