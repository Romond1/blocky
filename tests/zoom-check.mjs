import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const hero of ['mia','yuki']){
 const page=await browser.newPage({viewport:{width:1200,height:800}});
 await page.goto(`http://127.0.0.1:5188/?room=6&hero=${hero}`);
 const hint=page.locator('.zoom-tutorial');await hint.waitFor({state:'visible'});
 await page.mouse.move(600,600);await page.mouse.wheel(0,100);await page.waitForTimeout(100);
 const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));assert.ok(state.camera.targetDistance>4);
 await page.evaluate(()=>window.advanceTime(8500));assert.equal(await hint.isVisible(),false);
 await page.keyboard.press('Tab');await page.keyboard.press('r');await page.waitForTimeout(100);assert.equal(await hint.isVisible(),false);
 await page.screenshot({path:`output/sorting-foundry/zoom-check-${hero}.png`});await page.close();
}
await browser.close();console.log('Zoom hint passed for both heroes, wheel input, expiry, switching and reset.');

