import test from 'node:test';
import assert from 'node:assert/strict';
import {Elevator,LIFT} from '../src/elevator.ts';
import {LavaFerry,FERRY} from '../src/lava-ferry.ts';

const cargo=(id:number,x:number,z:number,y=0,support?:number)=>({id,x,z,y,size:.95,state:'floor',support});
const passenger=(x:number,z:number,y=0,grounded=true)=>({x,z,y,grounded});
const near=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

test('elevator transports a three-cube support chain and heroes on the deck and stack',()=>{
 const lift=new Elevator(),base=cargo(0,9,0),middle=cargo(1,9,0,.95,0),top=cargo(2,9,0,1.9,1);
 const deck=passenger(10,1),rider=passenger(9,0,2.85),edgeRider=passenger(9+.95/2+.27,0,2.85);
 const air=passenger(9,0,3,false),outside=passenger(15,0),floating=cargo(3,10,0,1.9),unrelated=cargo(4,15,0);
 const carried={...cargo(5,9,0,.95,0),state:'carried'},detached=cargo(6,10,0,3,999);
 // Children precede parents so collection cannot depend on cargo-array order.
 const goods=[top,middle,base,floating,unrelated,carried,detached];
 assert.equal(lift.aboard(rider,goods),true);assert.equal(lift.aboard(air,goods),false);
 lift.activate([true]);lift.advance(4,[deck,rider,edgeRider,air,outside],goods);
 near(base.y,5);near(middle.y,5.95);near(top.y,6.9);near(rider.y,7.85);near(edgeRider.y,7.85);near(deck.y,5);
 assert.equal(air.y,3);assert.equal(outside.y,0);assert.equal(floating.y,1.9);assert.equal(unrelated.y,0);assert.equal(carried.y,.95);assert.equal(detached.y,3);
 assert.equal(top.support,1);assert.equal(middle.support,0);assert.equal(base.x,9);assert.equal(top.z,0);
 lift.activate([false]);lift.activate([true]);lift.advance(4,[deck,rider,edgeRider],goods);
 near(base.y,0);near(middle.y,.95);near(top.y,1.9);near(deck.y,0);near(rider.y,2.85);near(edgeRider.y,2.85);
});

test('ferry transports stacked cargo and grounded stack riders both ways without changing height',()=>{
 const ferry=new LavaFerry(),base=cargo(0,0,FERRY.a),top=cargo(1,0,FERRY.a,.95,0);
 const rider=passenger(.95/2+.27,FERRY.a,1.9),deck=passenger(-1,FERRY.a),air=passenger(0,FERRY.a,2,false);
 const unrelated=cargo(2,8,FERRY.a),unsupported=cargo(3,1,FERRY.a,1.9),carried={...cargo(4,0,FERRY.a,1.9,1),state:'carried'};
 const offChain=cargo(5,8,FERRY.a,.95,2),goods=[top,offChain,base,unrelated,unsupported,carried];
 ferry.command(FERRY.b);ferry.advance(2,[rider,deck,air],goods);ferry.advance(2,[rider,deck,air],goods);
 for(const body of [base,top,rider,deck])near(body.z,FERRY.b);
 near(rider.y,1.9);near(top.y,.95);near(base.y,0);near(deck.y,0);near(rider.x,.95/2+.27);
 for(const body of [unrelated,unsupported,carried,offChain,air])near(body.z,FERRY.a);
 ferry.command(FERRY.a);ferry.advance(4,[rider,deck],goods);
 for(const body of [base,top,rider,deck])near(body.z,FERRY.a);
});

test('transport requires a physical support chain and respects the rider edge allowance',()=>{
 const lift=new Elevator(),base=cargo(0,9,0),floating=cargo(1,9,0,3,0),offset=cargo(2,12,0,.95,0);
 const beyondEdge=passenger(9+.95/2+.29,0,.95),high=passenger(9,0,1.2),air=passenger(9,0,.95,false);
 lift.activate([true]);lift.advance(1,[beyondEdge,high,air],[floating,offset,base]);
 near(base.y,LIFT.speed);assert.equal(floating.y,3);assert.equal(offset.y,.95);
 assert.equal(beyondEdge.y,.95);assert.equal(high.y,1.2);assert.equal(air.y,.95);
});

test('a child with duplicate array references only moves once',()=>{
 const lift=new Elevator(),base=cargo(0,9,0),top=cargo(1,9,0,.95,0);
 lift.activate([true]);lift.advance(1,[],[top,base,top,base]);
 near(base.y,LIFT.speed);near(top.y,.95+LIFT.speed);
});

test('descending safety still pauses the whole stack above a hero underneath',()=>{
 const lift=new Elevator();lift.activate([true]);lift.advance(4,[],[]);
 const base=cargo(0,9,0,5),top=cargo(1,9,0,5.95,0),rider=passenger(9,0,6.9),under=passenger(9,0,0);
 lift.activate([false]);lift.activate([true]);lift.advance(4,[rider,under],[base,top]);
 assert.equal(lift.blocked,true);assert.equal(lift.y,5);assert.equal(base.y,5);assert.equal(top.y,5.95);assert.equal(rider.y,6.9);
 under.x=15;lift.advance(4,[rider,under],[base,top]);
 near(base.y,0);near(top.y,.95);near(rider.y,1.9);assert.equal(lift.state,'DOWN');
});
