import assert from 'node:assert/strict';
const base=process.env.ACCOUNT_API_URL || 'http://127.0.0.1:5190/api/index.php';
function client(){let cookie='';return async(action,body)=>{const r=await fetch(base+'?action='+action,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Blocky-Request':'1',Cookie:cookie},body:body?JSON.stringify(body):undefined});const c=r.headers.get('set-cookie');if(c)cookie=c.split(';')[0];return {status:r.status,data:await r.json()};};}
const a=client(),b=client(),c=client(),name='test'+Date.now().toString(36);
assert.equal((await a('me')).status,401);
assert.equal((await a('register',{name,pin:'3141'})).status,200);
assert.equal((await b('login',{name,pin:'9999'})).status,401);
let me=await a('me');assert.equal(me.data.user.name,name);
let saved=await a('save',{revision:0,state:{adventure:{version:1,unlocked:2,completed:1},economy:{version:1,heroCoins:0,collected:[]}}});assert.equal(saved.status,200);
assert.equal((await a('save',{revision:0,state:{adventure:{version:1,unlocked:2,completed:1},economy:{version:1,heroCoins:0,collected:[]}}})).status,409);
assert.equal((await c('register',{name:name+'b',pin:'2718'})).status,200);
assert.equal((await c('me')).data.state.adventure.unlocked,1);
assert.equal((await b('login',{name,pin:'3141'})).status,200);
assert.equal((await b('me')).data.state.adventure.unlocked,2);
await b('logout',{});assert.equal((await b('me')).status,401);
console.log('PASS: registration, PIN, session, isolation, cloud resume, stale save, logout');

