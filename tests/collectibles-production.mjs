import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';

// Serve the built output on an ephemeral local port, then close it after testing.
const root=resolve('dist'),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'};
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  const file=path===root?resolve(root,'index.html'):path;
  res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${server.address().port}/?hero=yuki`);await page.waitForFunction(()=>window.advanceTime);
 await page.evaluate(()=>window.advanceTime(0));assert.equal(await page.locator('.economy-reset').count(),0);
 await page.locator('#debug-toggle').click();await page.evaluate(()=>window.advanceTime(0));assert.equal(await page.locator('.economy-reset').count(),0);
 await page.keyboard.down('w');await page.evaluate(()=>window.advanceTime(350));await page.keyboard.up('w');
 assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).economy.heroCoins),1);
 await page.reload();await page.waitForFunction(()=>window.advanceTime);await page.evaluate(()=>window.advanceTime(0));
 assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).economy.heroCoins),1);assert.deepEqual(errors,[]);
 console.log('PASS: production pickup/persistence; economy reset absent even with Debug open');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
