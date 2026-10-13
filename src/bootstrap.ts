import {signIn} from './account.ts';
const development=Boolean((import.meta as ImportMeta & {env?:{DEV?:boolean}}).env?.DEV);
async function boot(){if(!development)await signIn();await import('./main.ts');}
void boot().catch(error=>{const p=document.createElement('p');p.textContent='Could not start the game. Please reload. '+String(error);document.querySelector('#app')?.replaceChildren(p);});
