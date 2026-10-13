import type {EconomyStorage} from './economy.ts';
import './account.css';
type State={adventure:unknown;economy:unknown};
type Account={user:{id:number;name:string};state:State;revision:number};
const api=new URL('api/index.php',new URL('.',location.href));
let account:Account|undefined,dirty=false,working:Promise<void>|undefined,stopped=false;
let values:Record<string,string>={};
const status=document.createElement('span');status.className='account-save';status.setAttribute('role','status');
async function request(action:string,body?:unknown){
 const url=new URL(api);url.searchParams.set('action',action);
 const r=await fetch(url,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Blocky-Request':'1'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 let data;try{data=await r.json();}catch{throw new Error('The save server is unavailable. Please try again.');}
 if(!r.ok){const error=new Error(data.error||'Please try again.') as Error&{status:number};error.status=r.status;throw error;}return data;
}
function state():State{return {adventure:JSON.parse(values['be-a-hero:adventure']),economy:JSON.parse(values['be-a-hero:economy'])};}
function cache(){if(!account)return;try{localStorage.setItem('blocky:pending:'+account.user.id,JSON.stringify({revision:account.revision,state:state(),dirty}));}catch{/* Network save remains available. */}}
export const accountStorage:EconomyStorage={getItem:key=>values[key]??null,setItem(key,value){values[key]=value;dirty=true;status.textContent='Saving…';cache();void flush();},removeItem(key){delete values[key];}};
export function activeAccount(){return account;}
export async function flush():Promise<void>{
 if(working)return working;if(!account||!dirty||stopped)return;
 working=(async()=>{try{while(dirty){dirty=false;const data=await request('save',{revision:account!.revision,state:state()});account!.revision=data.revision;cache();}status.textContent='Saved online ✓';}
 catch(error){dirty=true;cache();const e=error as Error&{status?:number};if(e.status===409||e.status===401){stopped=true;status.textContent=e.message;}else status.textContent='Not saved yet · reconnecting…';}finally{working=undefined;}})();return working;
}
function use(data:Account){account=data;values={'be-a-hero:adventure':JSON.stringify(data.state.adventure),'be-a-hero:economy':JSON.stringify(data.state.economy)};
 try{const cached=JSON.parse(localStorage.getItem('blocky:pending:'+data.user.id)||'null');if(cached?.dirty&&cached.revision===data.revision){values={'be-a-hero:adventure':JSON.stringify(cached.state.adventure),'be-a-hero:economy':JSON.stringify(cached.state.economy)};dirty=true;}}catch{}
 status.textContent='Saved online ✓';setInterval(()=>void flush(),5000);window.addEventListener('online',()=>void flush());window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});void flush();
}
export function addAccountMenu(dialog:HTMLElement){if(!account)return;const box=document.createElement('section');box.className='account-menu';const name=document.createElement('strong');name.textContent='Playing as '+account.user.name;const button=document.createElement('button');button.type='button';button.textContent='Save & log out';button.onclick=async()=>{button.disabled=true;await flush();if(dirty){button.disabled=false;status.textContent=stopped?'Reload this page to restore your latest online save.':'Please reconnect before logging out, so your progress is saved.';return;}try{await request('logout',{});location.reload();}catch{button.disabled=false;status.textContent='Could not log out. Please try again.';}};box.append(name,status,button);dialog.append(box);}
export async function signIn(){
 try{const data=await request('me');use(data);return;}catch{/* Display sign-in, including a useful retry error if offline. */}
 const root=document.querySelector<HTMLElement>('#app')!;
 root.innerHTML=`<section class="account-screen"><div class="account-card"><span class="account-eyebrow">BE A HERO</span><div class="account-block" aria-hidden="true">B</div><h1>Blocky World</h1><p class="account-intro">Your hero. Your adventure.</p><div class="account-tabs" role="group" aria-label="Choose sign-in"><button type="button" data-mode="login" aria-pressed="true">Log in</button><button type="button" data-mode="register" aria-pressed="false">New player</button></div><form><label>Your nickname<input name="nickname" autocomplete="username" minlength="2" maxlength="16" pattern="[A-Za-z0-9_-]{2,16}" required placeholder="e.g. BlueFox" autocapitalize="none" spellcheck="false"></label><label>Your PIN<input name="pin" type="password" inputmode="numeric" autocomplete="current-password" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required placeholder="4–8 numbers"></label><p class="account-hint">Use your nickname and PIN on any phone or computer.</p><p class="account-error" role="alert"></p><button class="account-submit" type="submit">Let's play →</button></form><p class="account-footer">Your rooms, coins and treasures are saved online.<br>Use a nickname, not your full name.</p></div></section>`;
 let mode='login';const form=root.querySelector('form')!,error=root.querySelector<HTMLElement>('.account-error')!,submit=root.querySelector<HTMLButtonElement>('.account-submit')!;
 root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode!;root.querySelectorAll('[data-mode]').forEach(t=>t.setAttribute('aria-pressed',String((t as HTMLElement).dataset.mode===mode)));submit.textContent=mode==='register'?'Create my hero →':"Let's play →";root.querySelector<HTMLInputElement>('[name=pin]')!.autocomplete=mode==='register'?'new-password':'current-password';error.textContent='';});
 await new Promise<void>(resolve=>{form.onsubmit=async event=>{event.preventDefault();submit.disabled=true;error.textContent='';const fields=new FormData(form);try{const data=await request(mode,{name:String(fields.get('nickname')).trim(),pin:fields.get('pin')});use(data);resolve();}catch(e){error.textContent=(e as Error).message;}finally{submit.disabled=false;}};});
}
