import {createHeartGuidance} from './heart-guidance.ts';
import {activeAccount,accountStorage} from './account.ts';
import {actionCues,isHeroSwitchKey} from './action-cues.ts';
import {visibleViewport,fitHud} from './viewport.ts';
import {createInputDevice} from './input-device.ts';
import {createTouchControls,type GameAction} from './touch-controls.ts';
import {browserProgress,ROOM_IDS,ROOM_NAMES} from './adventure-progress.ts';
import {createPlayerMenu} from './player-menu.ts';
import {DRAGON_ALTAR} from './dragon-layout.ts';
import {createWelcome} from './welcome.ts';
import {buildFinale} from './finale-view.ts';
import {createDragonEnding} from './dragon-ending.ts';
import {heartGeometry,heartMaterial,decorateHeart} from './heart-crystal.ts';
import {createHeartCutscene} from './heart-cutscene.ts';
const assemblyVideo=new URL('../Assets/Tutorials/room 9/forest-heart-restored.mp4',import.meta.url).href;
window.BLOCK_WORLD_CONFIG={heartAssemblyVideo:assemblyVideo,...window.BLOCK_WORLD_CONFIG};
import {KeyboardState,MOVEMENT_KEYS} from './keyboard-state.ts';
import {MovementInput} from './movement.ts';
import {buildAbilityHall} from './ability-hall-view.ts';
import {buildActionChamber} from './action-chamber-view.ts';
import {insideArea} from './kage-alcove.ts';
import {browserEconomy} from './economy.ts';
import {ROOM_COLLECTIBLES,totalHeartShards} from './collectible-data.ts';
import {collectNearby} from './collectibles.ts';
import {createCollectibleView} from './collectible-view.ts';
import {createCollectibleUI} from './collectible-ui.ts';
import {CameraDistance,clearCameraPosition,clearCavernCamera} from './camera-distance.ts';
import {buildSortingFoundryChamber} from './sorting-foundry-chamber.ts';
import {buildFruitLiftChamber} from './fruit-lift-chamber.ts';
import {buildCooperationChamber} from './cooperation-chamber.ts';
import {entranceText} from './entrance-prompts.ts';
import {createRoomHelp} from './room-help.ts';
import {nearHelpButton,nearJumpDitch} from './split-mechanics.ts';
import {createInteractionBanner} from './interaction-banner.ts';
import {instruction,instructionLocale,localizeInstructions,adaptControlHints} from './instructions.ts';
import {rockGlyph,blockGeometry,ACTIVE,DORMANT} from './puzzle-visuals.ts';
import { createTrainingUI } from './training-ui.ts';
import { HERO_ABILITIES, HERO_SWITCH_DURATION } from './heroes.ts';
import * as THREE from 'three';
import { Game } from './game.ts';
import { HeroTeam } from './team.ts';
import { buildRoom, textMaterial } from './room.ts';

import { buildPowerChamber } from './power-chamber.ts';
import { heroPuzzle, memoryPuzzle, powerPuzzle, cooperationPuzzle, fruitPuzzle, sortingPuzzle, actionPuzzle, abilityPuzzle, heartPuzzle, dragonPuzzle, type PuzzleDefinition } from './puzzles.ts';
import { createYuki } from './characters/Yuki.ts';
import { createMia } from './characters/Mia.ts';
import './style.css';
import './player-ui.css';
import { animateEnvironment } from './world-materials.ts';

document.documentElement.lang=instructionLocale;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<div class="hud player-hud"><section class="room-status"><strong id="room-name"></strong><span id="room-goal"></span></section><section class="objective"><div class="eyebrow"></div><p id="prompt"></p><p id="instruction" hidden></p><div class="word" id="word"></div></section><div class="hero-status" id="hero-status" role="status"><strong id="hero-label"></strong><span id="hero-ability"></span><button id="switch-hero">Switch hero</button></div><div class="tools"><button id="pause-menu" aria-label="Pause and settings">☰ <span>Menu</span></button></div><div class="feedback" role="status" aria-live="polite" id="feedback"></div><section class="complete" id="complete" hidden><div class="eyebrow"></div><h1></h1><p></p></section><div class="bottom"><div class="hint" id="hint"></div><div class="controls" hidden></div></div><pre class="debug" id="debug" hidden></pre></div>`;
const ui = (id: string) => document.getElementById(id)!;
const economy=browserEconomy(activeAccount()?accountStorage:undefined);
const progress=browserProgress(economy.snapshot().collected,activeAccount()?accountStorage:undefined);
const development=Boolean((import.meta as ImportMeta & {env?:{DEV?:boolean}}).env?.DEV);
const puzzles=[heroPuzzle,memoryPuzzle,powerPuzzle,cooperationPuzzle,fruitPuzzle,sortingPuzzle,actionPuzzle,abilityPuzzle,heartPuzzle,dragonPuzzle];
let touchControls:ReturnType<typeof createTouchControls>|undefined;
const device=createInputDevice(()=>queueMicrotask(refreshControls));
let graphicsQuality='auto';
const rotation=document.createElement('section');rotation.className='rotation-prompt';rotation.hidden=true;
rotation.innerHTML='<div class="rotate-phone" aria-hidden="true">↻<i></i></div><h1>TURN YOUR PHONE SIDEWAYS!</h1><p>Heroes need a bigger view of the adventure! Turn your phone sideways to begin!</p><label>Controls <select aria-label="Rotation screen controls"><option value="auto">Automatic</option><option value="touch">Touch</option><option value="keyboard">Keyboard &amp; mouse</option></select></label>';
app.append(rotation);
rotation.querySelector('select')!.onchange=event=>device.setPreference((event.target as HTMLSelectElement).value as 'auto'|'touch'|'keyboard');
const dragonEnding=createDragonEnding(app);
const collectibleUI=createCollectibleUI(document.querySelector<HTMLElement>('.hud')!,economy);
const trainingUI=createTrainingUI(document.querySelector<HTMLElement>('.hud')!);
const interactionBanner=createInteractionBanner(document.querySelector<HTMLElement>('.hud')!);
const requestedRoom = new URLSearchParams(location.search).get('room');
// The local development server retains room fixtures; production URLs cannot unlock rooms.
const initialRoom=development&&requestedRoom&&/^(10|[1-9])$/.test(requestedRoom)?Number(requestedRoom):progress.resolve(requestedRoom);
let game = new Game(puzzles[initialRoom-1]);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x242633); scene.fog = new THREE.FogExp2(0x202b38, 0.025);
let renderer: THREE.WebGLRenderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
catch { app.innerHTML = '<p class="error">This prototype needs WebGL. Enable hardware acceleration in Chrome and reload.</p>'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
app.prepend(renderer.domElement); renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('aria-label', 'Block World Escape. WASD or arrows to move, drag mouse to look, E to pick up or drop.');
const fillLight = new THREE.HemisphereLight(0x9ec9e7, 0x60443e, 1.5); scene.add(fillLight);
const keyLight = new THREE.DirectionalLight(0xd7e9f5, 2.2); keyLight.position.set(1, 8, 5); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.normalBias = 0.04; scene.add(keyLight);
const roomRoot = new THREE.Group(); scene.add(roomRoot);
type BaseRoomView=Pick<ReturnType<typeof buildRoom>,'door'|'socketMaterials'|'tiles'|'embers'|'lava'|'palette'>;
type RoomView = BaseRoomView & Pick<ReturnType<typeof buildRoom>,'circuit'> & Partial<Pick<ReturnType<typeof buildPowerChamber>, 'power' | 'doorScale'>> & Partial<Pick<ReturnType<typeof buildCooperationChamber>,'cooperation'>> & Partial<Pick<ReturnType<typeof buildFruitLiftChamber>,'fruit'>> & Partial<Pick<ReturnType<typeof buildSortingFoundryChamber>,'sorting'>> & Partial<Pick<ReturnType<typeof buildActionChamber>,'action'>> & Partial<Pick<ReturnType<typeof buildAbilityHall>,'ability'>> & Partial<Pick<ReturnType<typeof buildFinale>,'finale'>>;
function createRoom(): RoomView { if(game.finale)game.finale.shardCount=economy.heartShardsCollected; return game.finale ? buildFinale(roomRoot,game) : game.ability ? buildAbilityHall(roomRoot) : game.actionChamber ? buildActionChamber(roomRoot) : game.sorting ? buildSortingFoundryChamber(roomRoot) : game.fruit ? buildFruitLiftChamber(roomRoot) : game.cooperation ? buildCooperationChamber(roomRoot) : game.puzzle.id === 'power' ? buildPowerChamber(roomRoot) : buildRoom(roomRoot,game.layout); }
let room = createRoom();
let collectibleView=createCollectibleView(roomRoot,game,economy);
let selectedHero: 'yuki' | 'mia' = new URLSearchParams(location.search).get('hero') === 'yuki' ? 'yuki' : 'mia';
let started = false;
let roomChanged=false;
// Teacher inspection never grants the player's next-room unlock.
let teacherVisit=false;

const heroViews = { yuki: createYuki(), mia: createMia() };
const team = new HeroTeam(game, selectedHero);
const heroRoots = {yuki: new THREE.Group(), mia: new THREE.Group()};
for(const id of ['yuki','mia'] as const){heroRoots[id].add(heroViews[id].root);scene.add(heroRoots[id]);}
let transferTime=0;
const transferFrom=new THREE.Vector3(), transferLookFrom=new THREE.Vector3(), cameraLook=new THREE.Vector3();
const welcome = createWelcome(app, hero => {
  if(device.portrait)return;
  void device.requestLandscape(app);
  selectedHero = hero; team.selected = hero; team.enter(game);
  started = true; clearInput(); refreshHeroMenu(); renderer.domElement.focus();
}, selectedHero,()=>!device.portrait,mode=>device.setPreference(mode),()=>device.preference);
function refreshHeroMenu() {
  welcome.hidden = started;
  const hud=document.querySelector<HTMLElement>('.hud')!;hud.hidden=!started;hud.inert=!started;
  renderer.domElement.inert=!started;
}
refreshHeroMenu();
function switchHero(source:'button'|'keyboard'|'touch'='button') {
  if(!canPlay()||game.escaped)return;
  transferFrom.copy(camera.position);transferLookFrom.copy(cameraLook);
  if(!team.select(team.other))return;
  if(source==='keyboard'||source==='touch')game.training?.emit('TAB_SWITCHED');
  selectedHero=team.selected;transferTime=HERO_SWITCH_DURATION;
  dragging=false;clearInput();refreshHeroMenu();renderer.domElement.focus();
}
ui('switch-hero').onclick=()=>switchHero();

function createBlockViews() { return game.blocks.map(block => {
  const colors:Record<string,[string,string]>={RED:['#ce2836','#ffffff'],BLUE:['#1768e0','#ffffff'],GREEN:['#188d3b','#ffffff'],YELLOW:['#f9cf28','#171b25']};
  const color=game.cooperation||game.sorting||game.finale?.cave?colors[block.text]:undefined;
  const material = block.objective==='heart'?heartMaterial():color?textMaterial(block.text,color[0],game.sorting?'#ff9c26':color[1]):rockGlyph(block.text);
  const size = block.size;
  const mesh = new THREE.Mesh(block.objective==='heart'?heartGeometry():blockGeometry(size), material);
  mesh.castShadow = true; mesh.receiveShadow = true; roomRoot.add(mesh);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size + 0.07, size + 0.07, size + 0.07)), new THREE.LineBasicMaterial({ color: 0x9effed }));
  mesh.add(outline); outline.visible = false;
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(size*1.25,size*1.25),new THREE.MeshBasicMaterial({color:0x080808,transparent:true,opacity:block.weightClass==='heavy'?.32:.12,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;roomRoot.add(shadow);
  const animateHeart=block.objective==='heart'?decorateHeart(mesh):undefined;
  return { mesh, outline, material, size, shadow, animateHeart };
}); }
let blockViews = createBlockViews();
const zoomHint=document.createElement('section');
zoomHint.className='zoom-tutorial';zoomHint.setAttribute('role','status');
zoomHint.innerHTML='<strong>Try the mouse wheel!</strong><p>Scroll the mouse wheel a little to zoom in and out.</p>';
zoomHint.hidden=true;app.append(zoomHint);
let zoomHintShown=false,zoomHintTime=0;
function updateZoomHint(dt:number){
 if(game.sorting&&!zoomHintShown){zoomHintShown=true;zoomHintTime=8;}
 zoomHintTime=Math.max(0,zoomHintTime-dt);zoomHint.hidden=device.mode==='touch'||!game.sorting||zoomHintTime===0;
}
const camera = new THREE.PerspectiveCamera(57, 1, 0.08, 180);
const heartCutscene=createHeartCutscene(app);
const heartGuidance=createHeartGuidance(app);
const zoom=new CameraDistance();
const defaultPitch = () => game.finale ? .28 : game.ability ? .36 : game.actionChamber ? 0.48 : game.transport ? 0.26 : game.training ? 0.30 : 0.58;
let yaw = 0, pitch = defaultPitch(), dragging = false, previousSolved = false, previousPower = false;
const keys = new KeyboardState();
const movementInput=new MovementInput();
const clearInput=()=>{keys.clear();movementInput.clear();dragging=false;touchControls?.clear();};
const roomHelp=createRoomHelp(()=>{clearInput();renderer.domElement.focus();});
const canOpenHelp=()=>game.split&&game.motion[selectedHero].grounded&&nearHelpButton(game.player);
function updateRoomLabels() {
  const roomNumber=ROOM_IDS.indexOf(game.puzzle.id as typeof ROOM_IDS[number])+1;
  ui('room-name').textContent=`${roomNumber} / ${ROOM_NAMES[roomNumber-1]}`;
  const ability=!!game.ability,action=!!game.actionChamber,sorting=!!game.sorting,fruit=!!game.fruit,cooperation=!!game.cooperation;
  const memory = game.puzzle.id === 'memory', power = game.puzzle.id === 'power';
  document.querySelector('.objective .eyebrow')!.textContent = game.finale ? (game.finale.cave?'10 / THE DRAGON’S CAVE':'09 / THE HEART GAUNTLET') : ability ? '08 / THE ABILITY HALL' : action ? '07 / THE ACTION CHAMBER' : sorting ? '06 / THE SORTING FOUNDRY' : fruit ? '05 / THE FRUIT LIFT' : cooperation ? '04 / THE COOPERATION CHAMBER' : power ? '03 / THE SPLIT CHAMBER' : memory ? '02 / THE STRENGTH CHAMBER' : '01 / THE TRAINING CHAMBER';
  ui('prompt').textContent = power ? game.activeStage!.title : memory ? game.puzzle.prompt : game.puzzle.prompt;
  ui('instruction').textContent = power ? game.activeStage!.prompt : memory ? game.puzzle.prompt : '';
  ui('instruction').hidden = true;
  ui('prompt').hidden=ability||power||cooperation||fruit||sorting;
  document.querySelector('.objective')!.classList.toggle('split-objective',power||cooperation||fruit);
  document.querySelector('.objective')!.classList.toggle('action-objective',action);
  document.querySelector('#complete .eyebrow')!.textContent = ability ? 'ROOM 08 COMPLETE' : action ? 'ROOM 07 COMPLETE' : sorting ? 'ROOM 06 COMPLETE' : fruit ? 'ROOM 05 COMPLETE' : cooperation ? 'ROOM 04 COMPLETE' : power ? 'TRAINING COMPLETE' : memory ? 'ROOM 02 COMPLETE' : 'ROOM 01 COMPLETE';
  document.querySelector('#complete h1')!.textContent = ability||action||sorting||fruit||cooperation ? 'You escaped together!' : power ? 'ROOM ESCAPED!' : memory ? 'You escaped the Strength Chamber!' : 'You escaped the first room!';
  document.querySelector('#complete p')!.textContent = ability ? 'The Ability Hall is complete. Press R to replay.' : action ? 'The Action Chamber is complete. Press R to replay.' : sorting ? 'The Sorting Foundry is complete. Press R to replay.' : fruit ? 'The Fruit Lift is complete. Press R to replay.' : cooperation ? 'The Cooperation Chamber is complete. Press R to replay.' : power ? 'Three training rooms complete. You’re ready for the adventure.\nPress R to replay this room.' : 'A hero finds a way. Press R to play again.';
  keyLight.position.set(2, ability||power||cooperation||fruit||action ? 16 : memory ? 12 : 8, 5);
  const shadowSize = ability||power||cooperation||fruit||action ? 27 : memory ? 18 : 10;
  keyLight.shadow.camera.left = -shadowSize; keyLight.shadow.camera.right = shadowSize;
  keyLight.shadow.camera.top = shadowSize; keyLight.shadow.camera.bottom = -shadowSize; keyLight.shadow.camera.updateProjectionMatrix();
  (scene.fog as THREE.FogExp2).density = ability||power||cooperation||fruit||action ? 0.014 : memory ? 0.018 : 0.022;
  if(game.finale){(scene.fog as THREE.FogExp2).density=game.finale.cave?.006:.009;}
  fillLight.intensity = ability||power||cooperation||fruit||action ? 1.25 : memory ? 1.35 : 1.65;
  keyLight.intensity = ability||power||cooperation||fruit||action ? 1.9 : memory ? 2.0 : 2.3;
}
function enterRoom(puzzle: PuzzleDefinition,retainHeart=true) {
  roomChanged=false;
  const heartCarrier=retainHeart&&puzzle.id==='dragon'&&game.finale?.heart.state==='carried'?game.finale.heart.carrier:undefined;
  roomHelp.close();heartCutscene.reset();
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  roomRoot.traverse(obj => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
      geometries.add(obj.geometry);
      for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) materials.add(material);
    }
  });
  materials.forEach(material => { for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value); material.dispose(); });
  textures.forEach(texture => texture.dispose()); geometries.forEach(geometry => geometry.dispose()); roomRoot.clear();
  game = new Game(puzzle); team.enter(game);if(heartCarrier&&game.finale)Object.assign(game.finale.heart,{state:'carried',carrier:heartCarrier}); transferTime=0; room = createRoom(); blockViews = createBlockViews();
  collectibleView=createCollectibleView(roomRoot,game,economy);
  zoom.reset();yaw = 0; pitch = defaultPitch(); previousSolved = false; previousPower = false; clearInput();
  history.replaceState(null,'',`${location.pathname}?room=${ROOM_IDS.indexOf(puzzle.id as typeof ROOM_IDS[number])+1}&hero=${selectedHero}`);
  updateRoomLabels(); if(!game.finale&&puzzle.id!=='hero'&&puzzle.id!=='cooperation'&&puzzle.id!=='fruit'&&puzzle.id!=='sorting'&&puzzle.id!=='action'&&puzzle.id!=='ability')game.say(puzzle.id === 'power' ? 'THE SPLIT CHAMBER — Two locks. Restore the heroes’ powers.' : 'THE STRENGTH CHAMBER — Complete HERO and let Yuki place HEAVY.');
}
updateRoomLabels();
function reset() { roomChanged=false;roomHelp.close();heartCutscene.reset(); team.reset();enterRoom(game.puzzle,false);if(game.finale)game.finale.shardCount=economy.heartShardsCollected; collectibleView.reset(); transferTime=0; zoom.reset();yaw = 0; pitch = defaultPitch(); clearInput(); updateRoomLabels(); renderer.domElement.focus(); }
function requestReset(){
 const meaningful=roomChanged||game.solved||game.stageSolved.some(Boolean)||game.finale?.sections.some(Boolean);
 if(meaningful&&!confirm(instruction('Restart this room’s puzzle? Your unlocked rooms and collected treasures stay saved.')))return false;
 reset();return true;
}
/** Browser integration fixtures are unavailable in production builds. */
export function inspectDragonForTests(){if(!development||!game.finale?.dragon)throw new Error('Room 10 development fixture only');return {game,team,roomRoot};}
const menu=createPlayerMenu(app,progress,{
 pause:clearInput,resume:()=>{clearInput();renderer.domElement.focus();},reset:requestReset,
 replay:room=>{if(progress.canReplay(room)){teacherVisit=false;enterRoom(puzzles[room-1]);}},
 visitRoom:room=>{
  if(!menu.teacher||!Number.isInteger(room)||room<1||room>puzzles.length)return false;
  teacherVisit=true;enterRoom(puzzles[room-1]);return true;
 },
 lockTeacher:()=>{
  ui('debug').hidden=true;
  if(teacherVisit){teacherVisit=false;enterRoom(puzzles[progress.unlocked-1]);menu.close();}
 },
 resetAll:()=>{teacherVisit=false;progress.reset();economy.reset();collectibleUI.reset();enterRoom(heroPuzzle);team.reset();},
 debug:()=>{ui('debug').hidden=!menu.teacher||!ui('debug').hidden;},
 controlMode:mode=>device.setPreference(mode),quality:value=>{graphicsQuality=value;resize();},
});
function canPlay(){return started&&!device.portrait&&!menu.open&&!roomHelp.open&&!game.finale?.paused;}
function openMenu(){if(!started)return;menu.show(ROOM_IDS.indexOf(game.puzzle.id as typeof ROOM_IDS[number])+1,device.preference);}
ui('pause-menu').onclick=openMenu;
function performAction(action:GameAction,source:'keyboard'|'touch'='touch'){
 if(action==='interact'&&roomHelp.open){roomHelp.close();return;}
 if(!canPlay())return;
 if(action==='switchHero'){switchHero(source);return;}
 if(transferTime>0)return;
 if(action==='jump')game.jump();
 else if(canOpenHelp()){clearInput();roomHelp.show();}
 else {
  const before=JSON.stringify(game.blocks);team.interact();
  if(game.action||JSON.stringify(game.blocks)!==before)roomChanged=true;
 }
}
function look(dx:number,dy:number){
 if(!canPlay())return;
 const oldYaw=yaw,oldPitch=pitch;yaw-=dx*.005;pitch=THREE.MathUtils.clamp(pitch+dy*.004,.154,.95);
 game.training?.look(Math.abs(yaw-oldYaw)+Math.abs(pitch-oldPitch));
}
touchControls=createTouchControls(app,action=>performAction(action),look,canPlay);
function refreshControls(){
 clearInput();rotation.hidden=!device.portrait;
 welcome.inert=device.portrait;
 rotation.querySelector('select')!.value=device.preference;
 resize();
}
refreshControls();
window.addEventListener('keydown', event => {
  if (!started) return;
  if(menu.open)return;
  if(event.code==='Escape'){event.preventDefault();if(roomHelp.open)roomHelp.close();else openMenu();return;}
  if(device.portrait)return;
  if(roomHelp.open){if(event.code==='KeyE'||event.code==='Escape'){event.preventDefault();if(!event.repeat)roomHelp.close();}return;}
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLElement && event.target.isContentEditable) return;
  if(isHeroSwitchKey(event.code)){event.preventDefault();if(!event.repeat)performAction('switchHero','keyboard');return;}
  if (event.target instanceof HTMLButtonElement && event.code === 'Enter') return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  // Repeats must never restore a key after focus loss, reset or hero switching.
  if (event.repeat){keys.renew(event.code);return;}
  const movementKey=MOVEMENT_KEYS.includes(event.code);
  if(movementKey||event.code==='Space')renderer.domElement.focus({preventScroll:true});
  keys.add(event.code);
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))game.training?.emit('PLAYER_MOVED');
  if (event.code === 'KeyE')performAction('interact','keyboard');
  if (event.code === 'Space')performAction('jump','keyboard');
  if (event.code === 'KeyR')requestReset();
  if (event.code === 'Backquote'&&menu.teacher)ui('debug').hidden = !ui('debug').hidden;
  if (event.code === 'KeyF') {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void app.requestFullscreen().catch(() => game.say('Fullscreen is unavailable in this browser.'));
  }
},true);
window.addEventListener('keyup', event => {keys.release(event.code,event.key);},true);
function suspend(){clearInput();if(started&&!menu.open&&!roomHelp.open)openMenu();}
window.addEventListener('blur', suspend);
window.addEventListener('pagehide', suspend);
renderer.domElement.addEventListener('blur', clearInput);
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden)suspend();});
renderer.domElement.addEventListener('pointerdown', event => { if (!canPlay() || event.button !== 0||event.pointerType==='touch') return; dragging = true; renderer.domElement.setPointerCapture(event.pointerId); renderer.domElement.focus(); });
renderer.domElement.addEventListener('pointerup', () => { dragging = false; });
renderer.domElement.addEventListener('pointercancel', () => { dragging = false; });
renderer.domElement.addEventListener('lostpointercapture', () => { dragging = false; });
renderer.domElement.addEventListener('pointermove', event => {
  if (dragging)look(event.movementX,event.movementY);
});
renderer.domElement.addEventListener('wheel',event=>{if(!canPlay())return;event.preventDefault();zoom.wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));},{passive:false});
function resize() {
  const view = visibleViewport();
  const reduced=graphicsQuality==='low'||graphicsQuality==='auto'&&device.mode==='touch';
  renderer.setPixelRatio(Math.min(devicePixelRatio,reduced?1.25:2));
  renderer.shadowMap.enabled=!reduced;
  renderer.setSize(view.width, view.height);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.left = `${view.left}px`;
  renderer.domElement.style.top = `${view.top}px`;
  camera.aspect = view.width / view.height;
  // Preserve the landscape horizontal field of view on narrow displays.
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(57) / 2) * Math.max(1, (16 / 10) / camera.aspect)));
  camera.updateProjectionMatrix();
  fitHud(document.querySelector<HTMLElement>('.hud')!);
}
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
window.visualViewport?.addEventListener('scroll', resize);
const viewportObserver = new ResizeObserver(resize); viewportObserver.observe(app);
resize();
renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); game.say('Graphics paused. Reload the page to restart.'); });
renderer.domElement.addEventListener('webglcontextrestored', () => location.reload());

function successSound() {
  try {
    const context = new AudioContext(); void context.resume();
    if (game.puzzle.sequence || game.puzzle.stages) {
      const rumble = context.createOscillator(), envelope = context.createGain();
      rumble.type = 'triangle'; rumble.frequency.setValueAtTime(92, context.currentTime);
      rumble.frequency.exponentialRampToValueAtTime(28, context.currentTime + 1.5);
      envelope.gain.setValueAtTime(0, context.currentTime); envelope.gain.linearRampToValueAtTime(0.4, context.currentTime + 0.04);
      envelope.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.65);
      rumble.connect(envelope); envelope.connect(context.destination); rumble.start(); rumble.stop(context.currentTime + 1.7);
    }
    for (const [i, frequency] of [523.25, 659.25, 783.99].entries()) {
      const oscillator = context.createOscillator(), gain = context.createGain(); oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, context.currentTime + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.09, context.currentTime + i * 0.13 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + i * 0.13 + 0.4);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(context.currentTime + i * 0.13); oscillator.stop(context.currentTime + i * 0.13 + 0.42);
    }
    setTimeout(() => void context.close(), 2000);
  } catch { /* Visual success feedback also works without audio. */ }
}
let environmentTime = 0;
function update(dt: number) {
  if (!started||menu.open||device.portrait) return;
  updateZoomHint(dt);
  if(roomHelp.open){roomHelp.update(dt);return;}
  environmentTime += dt;zoom.update(dt);
  heartCutscene.update(game,dt);
  if(game.finale?.paused)clearInput();
  const keyboardForward=Number(keys.has('KeyW') || keys.has('ArrowUp'))-Number(keys.has('KeyS') || keys.has('ArrowDown'));
  const keyboardRight=Number(keys.has('KeyD') || keys.has('ArrowRight'))-Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  const forward = transferTime>0?0:Math.max(-1,Math.min(1,keyboardForward+(touchControls?.vector.z??0)));
  const right = transferTime>0?0:Math.max(-1,Math.min(1,keyboardRight+(touchControls?.vector.x??0)));
  const input=movementInput.update(dt,right,forward);
  // Preserve the previous full-speed keyboard response; touch retains analog magnitude.
  if(keyboardForward||keyboardRight){const length=Math.hypot(input.x,input.z);if(length){input.x/=length;input.z/=length;}}
  const oldX = game.player.x, oldZ = game.player.z, knewSpeed=game.training?.has('MIA_SPEED_EXPERIENCED');
  team.update(dt, input.x * Math.cos(yaw) - input.z * Math.sin(yaw), -input.x * Math.sin(yaw) - input.z * Math.cos(yaw), {x:camera.position.x,z:camera.position.z}, point=>{
    const projected=new THREE.Vector3(point.x,1,point.z).project(camera);
    return projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<1.2&&Math.abs(projected.y)<1.2;
  });
  if(game.training?.has('MIA_SPEED_EXPERIENCED')&&!knewSpeed)game.say('MIA IS SUPER FAST!');
  heroViews[selectedHero].update(dt,dt>0?Math.hypot(game.player.x-oldX,game.player.z-oldZ)/dt:0,!!game.carried,{heavy:game.carried?.weightClass==='heavy',action:game.action?.kind,progress:game.action?game.action.time/game.action.duration:0});
  heroViews[team.other].update(dt,team.companion.speed,game.blocks.some(b=>b.state==='carried'&&b.carrier===team.other),{heavy:game.blocks.some(b=>b.state==='carried'&&b.carrier===team.other&&b.weightClass==='heavy')});
  transferTime=Math.max(0,transferTime-dt);
  for(const collectible of collectNearby(game,economy)){
    collectibleView.collect(collectible);collectibleUI.collected(collectible);
    window.dispatchEvent(new CustomEvent(collectible.type==='coin'?'HERO_COIN_COLLECTED':collectible.type==='memoryCrystal'?'MEMORY_CRYSTAL_COLLECTED':'HEART_SHARD_COLLECTED',{detail:{id:collectible.id,roomId:collectible.roomId,value:collectible.value??1}}));
  }
  collectibleView.update(dt,environmentTime);collectibleUI.update(dt,game.puzzle.id);
  if(!teacherVisit&&(game.escaped||game.finale?.dragon?.restored))progress.complete(ROOM_IDS.indexOf(game.puzzle.id as typeof ROOM_IDS[number])+1);
  if (game.escaped && game.puzzle.id === 'hero') enterRoom(memoryPuzzle);
  else if (game.escaped && game.puzzle.id === 'memory') enterRoom(powerPuzzle);
  else if (game.escaped && game.puzzle.id === 'power') enterRoom(cooperationPuzzle);
  else if (game.escaped && game.puzzle.id === 'cooperation') enterRoom(fruitPuzzle);
  else if (game.escaped && game.puzzle.id === 'fruit') enterRoom(sortingPuzzle);
  else if (game.escaped && game.puzzle.id === 'sorting') enterRoom(actionPuzzle);
  else if (game.escaped && game.puzzle.id === 'action') enterRoom(abilityPuzzle);
  else if (game.escaped && game.puzzle.id === 'ability') enterRoom(heartPuzzle);
  else if (game.escaped && game.puzzle.id === 'heart') enterRoom(dragonPuzzle);
}
function render() {
  dragonEnding.update(game,economy);
  collectibleView.update(0,environmentTime);collectibleUI.update(0,game.puzzle.id);
  if(!menu.teacher)ui('debug').hidden=true;
  animateEnvironment(roomRoot, room.embers, room.palette, environmentTime, game.solved);
  for(const id of ['yuki','mia'] as const){const actor=team.actors[id];heroRoots[id].position.set(actor.x,game.motion[id].y,actor.z);heroRoots[id].rotation.y=actor.facing;}
  const nearest = game.nearest;
  for (const block of game.blocks) {
    const view = blockViews[block.id];
    const body=game.blockBody(block);
    view.mesh.position.set(body.x,body.y,body.z);view.mesh.rotation.y=body.yaw;
    view.mesh.visible=!block.hidden&&(!game.actionChamber||game.actionChamber.blockVisible(block.id));view.shadow.visible=view.mesh.visible;
    view.animateHeart?.(environmentTime);
    const platePulse=block.state==='socket'&&game.slotFeedback(block.slot??0)==='correct'?Math.sin(Math.min(1,game.conduitProgress[block.slot??0]*3.4)*Math.PI):0;
    view.mesh.scale.setScalar(1+platePulse*.08);
    view.mesh.position.y+=platePulse*.08;
    view.mesh.rotation.z=0;
    if(game.action?.blockId===block.id){
      const a=game.action,p=Math.min(1,a.time/a.duration);
      if(a.kind!=='HEAVY_LIFT'){
        view.mesh.position.y+=a.kind==='HEAVY_STRUGGLE'?Math.min(1,p*5)*.2:.2*(1-p*p);
        view.mesh.rotation.z=Math.sin(a.time*35)*.018*(a.kind==='HEAVY_STRUGGLE'?1:1-p);
      }
    }
    view.shadow.position.x=view.mesh.position.x;view.shadow.position.z=view.mesh.position.z;
    if(game.finale||game.transport||game.ability)view.shadow.position.y=(block.state==='carried'?game.motion[block.carrier??selectedHero].y:(block.y??0))+.012;
    view.outline.visible = nearest?.id === block.id && !game.carried||!!game.sorting&&block.state==='socket'&&(block.slot??10)<6&&game.slotFeedback(block.slot!)==='correct';
    if(game.sorting&&block.weightClass==='light'){view.material.emissive.setHex(DORMANT);view.material.emissiveIntensity=view.outline.visible?2.6:1.8;}
    else if(game.ability){view.material.emissive.setHex(block.state==='socket'&&game.slotLocked(block.slot!)?ACTIVE:DORMANT);view.material.emissiveIntensity=view.outline.visible?2.6:1.8;}
    else if(game.cooperation&&block.text!=='HEAVY'){view.material.emissive.setHex((game.sorting?block.state==='socket'&&game.slotFeedback(block.slot!)==='correct':game.cooperation!.blockSolved(block,game))?ACTIVE:0xffffff);view.material.emissiveIntensity=(game.sorting?block.state==='socket'&&game.slotFeedback(block.slot!)==='correct':game.cooperation!.blockSolved(block,game))?.8:view.outline.visible?.35:.12;}
    else if(block.objective==='heart'){view.material.emissive.setHex(0xffb91b);view.material.emissiveIntensity=.95+Math.sin(environmentTime*2)*.1;}
    else {view.material.emissive.setHex(block.state==='socket'&&game.slotFeedback(block.slot??0)==='correct'?ACTIVE:DORMANT);
    view.material.emissiveIntensity = view.outline.visible ? 2.6 : 1.8;}
  }
  room.door.position.y = game.doorLift / (room.doorScale ?? 1);
  if(!room.finale&&!room.cooperation&&!room.fruit&&!room.sorting&&!room.action&&!room.ability)room.circuit.update(game.layout.sockets.map((_,i)=>game.slotFeedback(i)==='correct'),game.conduitProgress,game.doorPowered,environmentTime,game.doorCharge);
  if(room.cooperation)room.cooperation.update(game,environmentTime);
  if(room.fruit)room.fruit.update(game,environmentTime);
  if(room.sorting)room.sorting.update(game,environmentTime);
  if(room.action)room.action.update(game,environmentTime);
  if(room.ability)room.ability.update(game,environmentTime);
  room.finale?.update(game,environmentTime,!ui('debug').hidden);
  if(room.power){room.power.update(game,environmentTime);if(game.stageSolved[0]&&!previousPower){successSound();updateRoomLabels();}previousPower=!!game.stageSolved[0];}
  if (game.heroWordSolved !== previousSolved) {
    if (room.tiles[1]) {
      const old = room.tiles[1].material as THREE.MeshStandardMaterial;
      old.map?.dispose(); old.dispose(); room.tiles[1].material = textMaterial(game.heroWordSolved ? game.puzzle.answer : game.training ? '_' : '?', '#252f35', game.heroWordSolved ? '#49eaff' : '#ffac55');
    }
    if (game.heroWordSolved) successSound(); previousSolved = game.heroWordSolved;
  }
  const target = new THREE.Vector3(game.player.x - Math.sin(yaw) * 1.5, game.ability?2.6:game.training?2.3:1.6, game.player.z - Math.cos(yaw) * 1.5);
  if(game.cooperation&&game.player.z>19&&game.player.x>4&&Math.abs(yaw)<.1){target.x=2.5;target.y=1.2;target.z=game.player.z;}
  const desired = new THREE.Vector3(game.player.x, 1.25, game.player.z).add(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch) * zoom.distance + Math.cos(yaw) * 0.9, Math.sin(pitch) * zoom.distance, Math.cos(yaw) * Math.cos(pitch) * zoom.distance - Math.sin(yaw) * 0.9));
  const memoryDefinition=game.memory?.definition;
  const secretArea=game.memory?.contains(game.player)&&game.motion[selectedHero].y<3?memoryDefinition?.areas.find(a=>insideArea(game.player,a)):undefined;
  if(!secretArea){
   const cameraArea=game.ability?game.layout.optionalAreas?.find(a=>insideArea(game.player,a)):undefined;
   desired.x = THREE.MathUtils.clamp(desired.x, cameraArea?.left??-game.layout.halfWidth + 0.3, (cameraArea?.right??game.layout.halfWidth) - 0.3);
   desired.z = THREE.MathUtils.clamp(desired.z, (game.layout.exitZ??-game.layout.halfDepth) + 0.55, game.layout.halfDepth - 0.5);
  }
  if (!secretArea && game.player.z < (game.layout.exitZ??-game.layout.halfDepth)) { desired.x = THREE.MathUtils.clamp(desired.x, (game.layout.exitCenterX??0)-game.layout.exitHalfWidth + 0.4, (game.layout.exitCenterX??0)+game.layout.exitHalfWidth - 0.4); desired.z = Math.max(desired.z, game.player.z + 1.2); }
  // Pull the existing follow camera forward when a new interior structure obstructs it.
  const eye = new THREE.Vector3(game.player.x, 1.6+game.motion[selectedHero].y, game.player.z);
  if(secretArea){
   // Shorten the whole camera ray at room edges to preserve the viewing angle.
   const front=secretArea===memoryDefinition!.areas[3]?Math.max(game.player.z,memoryDefinition!.gate.z-.3):secretArea.front-.2;
   const boundedX=THREE.MathUtils.clamp(desired.x,secretArea.left+.2,secretArea.right-.2);
   const boundedZ=THREE.MathUtils.clamp(desired.z,secretArea.back+.2,front);
   const deltaX=desired.x-game.player.x,deltaZ=desired.z-game.player.z;
   const fraction=Math.max(0,Math.min(1,Math.abs(deltaX)>.001?(boundedX-game.player.x)/deltaX:1,Math.abs(deltaZ)>.001?(boundedZ-game.player.z)/deltaZ:1));
   desired.y=Math.min(desired.y,5.8);
   desired.lerpVectors(new THREE.Vector3(game.player.x,1.6,game.player.z),desired,fraction);
  }
  if(game.cooperation&&game.player.z>19&&game.player.x>4&&Math.abs(yaw)<.1)desired.y+=2.5;
  const forecourtFraming=game.actionChamber&&game.player.z>26&&Math.abs(yaw)<.05&&Math.abs(pitch-.48)<.05?THREE.MathUtils.smoothstep(game.player.z,26,29):0;
  if(forecourtFraming>0){desired.lerp(new THREE.Vector3(game.player.x+1,10.5,Math.min(game.layout.halfDepth-.6,game.player.z+3)),forecourtFraming);target.lerp(new THREE.Vector3(1,1.3,25),forecourtFraming);}
  if(game.finale?.cave&&game.player.z>28&&Math.abs(game.player.x)<8&&Math.abs(yaw)<.05){const reveal=THREE.MathUtils.smoothstep(game.player.z,28,31);desired.lerp(new THREE.Vector3(game.player.x+1,10,38.5),reveal);target.lerp(new THREE.Vector3(0,2,18),reveal);}
  const fieldOfView=(game.finale?.cave?74:57)+(game.ability?8:0)+forecourtFraming*15;if(Math.abs(camera.fov-fieldOfView)>.001){camera.fov=fieldOfView;camera.updateProjectionMatrix();}
  desired.y+=game.motion[selectedHero].y;target.y+=game.motion[selectedHero].y;
  if(game.finale?.paused){target.set(0,2.5,33);desired.set(6,7.5,40);}
  if(game.finale?.dragon?.restored&&!game.finale.dragon.choice&&Math.abs(game.player.x)<4&&Math.abs(game.player.z-DRAGON_ALTAR.z)<4&&Math.abs(yaw)<.1){target.set(0,8,DRAGON_ALTAR.z+1);desired.set(game.player.x*.3,10.5,DRAGON_ALTAR.z-11);}
  desired.copy(clearCameraPosition(eye,desired,game.layout.obstacles??[]));
  if(game.finale?.dragon)desired.copy(clearCavernCamera(eye,desired,game.finale.dragon.solids()));

  if(game.cooperation&&game.motion[selectedHero].y<-.4){desired.z=THREE.MathUtils.clamp(desired.z,-8.5,2.5);}
  if(game.split&&game.motion[selectedHero].y<-.4&&game.player.x> -3)desired.x=THREE.MathUtils.clamp(desired.x,-2.5,8.5);
  if (game.puzzle.id !== 'hero' && game.solved && game.doorLift < 2) desired.y += Math.sin(game.doorLift * 48) * 0.035;
  if(transferTime>0){const t=1-transferTime/HERO_SWITCH_DURATION, blend=t*t*(3-2*t);camera.position.lerpVectors(transferFrom,desired,blend);cameraLook.lerpVectors(transferLookFrom,target,blend);}
  else {camera.position.copy(desired);cameraLook.copy(target);}
  if(game.heavyImpact>0)camera.position.y+=Math.sin(game.heavyImpact*75)*.025*game.heavyImpact/.35;
  camera.lookAt(cameraLook);
  camera.updateMatrixWorld();
  interactionBanner.update(game,camera,blockViews);
  ui('hero-label').textContent=selectedHero.toUpperCase();
  ui('hero-ability').textContent=HERO_ABILITIES[selectedHero].ability;
  ui('hero-status').classList.toggle('switching',transferTime>0);
  ui('word').textContent = game.puzzle.stages ? game.solved ? 'PATH STABLE · EXIT TOGETHER' : `LOCK 1 ${game.stageSolved[0] ? '●' : '○'}   LOCK 2 ${game.stageSolved[1] ? '●' : '○'}` : game.puzzle.sequence ? game.solved ? 'MEMORY RESTORED' : '1 — 2 — 3' : game.word;
  ui('word').classList.toggle('memory-word', game.puzzle.id !== 'hero');
  ui('hint').textContent = team.tutorial.promptRequested ? 'Click Switch hero or press Q / Tab' : team.playerAtExit&&!team.companionAtExit ? `Wait for ${team.other==='mia'?'Mia':'Yuki'}!` : game.hint;
  ui('feedback').textContent = !game.escaped && game.messageTime > 0 ? game.message : '';
  if(game.split){
    // Puzzle states are carried by the physical glyphs, map and lock lights.
    ui('word').textContent=`${game.stageSolved[0]?'●':'○'}   ${game.stageSolved[1]?'●':'○'}`;
    ui('word').setAttribute('aria-label',`${game.stageSolved.filter(Boolean).length} of 2 locks powered`);
    if(!game.memory?.contains(game.player))ui('feedback').textContent='';
    if(!game.memory?.contains(game.player)&&!game.carried&&!game.nearest&&!game.action&&!team.playerAtExit){
      ui('hint').textContent=!game.motion[selectedHero].crossed?(nearJumpDitch(game.player)?entranceText.jump:''):!game.motion[team.other].crossed?'[Q / Tab] SWITCH HERO':'';
    }
    if(canOpenHelp())ui('hint').textContent=entranceText.info;
  }else ui('word').removeAttribute('aria-label');
  if(game.ability||game.cooperation||game.fruit||game.sorting||game.actionChamber){ui('word').textContent='';ui('feedback').textContent=(game.ability||game.sorting||game.actionChamber)&&game.messageTime>0?game.message:'';}
  heartGuidance.update(game,started&&!menu.open&&!device.portrait);
  if(game.finale){ui('word').textContent='';ui('prompt').textContent=game.finale.assembly==='complete'?game.puzzle.prompt:'HEART OF THE FOREST';ui('feedback').textContent=game.messageTime>0?game.message:'';ui('switch-hero').toggleAttribute('disabled',game.finale.paused);}
  else ui('switch-hero').removeAttribute('disabled');
  ui('complete').hidden = !game.escaped;
  if (!ui('debug').hidden) ui('debug').textContent = `Tutorial ${game.training?.step??'none'} · Heavy action ${game.action?.kind??'none'}\nMia speed multiplier ${HERO_ABILITIES.mia.speedMultiplier.toFixed(1)}\nYuki strength ${HERO_ABILITIES.yuki.strength}\nHero switch available ${started&&!game.escaped}\nControllers: player 1 / companion 1 · valid ${team.ownershipValid}\nPlayer ${selectedHero} · Companion ${team.other}\nState ${team.companion.state}\nTarget ${team.companion.targetName}\nDistance ${Math.hypot(game.player.x-team.actors[team.other].x,game.player.z-team.actors[team.other].z).toFixed(1)}m\nExit: player ${team.playerAtExit} / companion ${team.companionAtExit}\nPlayer x ${game.player.x.toFixed(2)} z ${game.player.z.toFixed(2)}\nCarried ${game.carried?.text ?? 'none'}\nSlots ${game.placed.map(b => b?.text ?? 'empty').join(' / ')}\nRoom ${game.puzzle.id}\nLocks ${game.stageSolved.join(' / ')}\nSolved ${game.solved}\nGate ${game.doorLift.toFixed(2)}\nEscaped ${game.escaped}`;
  trainingUI.update(game,keys,selectedHero,team.other,team.playerAtExit&&!team.companionAtExit,device.mode==='touch');
  const goals=['Complete HERO. Power the doorway.','Complete HERO. Yuki lifts HEAVY.','Restore both heroes’ powers.','Hold the plates. Escape together.','Match each word to its fruit.','Match the colors and fruit.','Match RUN, JUMP and LIFT.','Build the heroes’ sentences.','Carry the Heart through four challenges.','Carry the Heart to the altar.'];
  ui('room-goal').textContent=game.finale?.dragon?.restored?'Choose your next adventure.':game.solved&&!game.finale?'Walk through the glowing doorway':goals[ROOM_IDS.indexOf(game.puzzle.id as typeof ROOM_IDS[number])];
  if(game.finale?.dragon?.locks[0]&&!game.finale.dragon.locks[1])ui('room-goal').textContent='One hero holds the pad. Switch heroes and jump across.';
  if(game.finale?.dragon?.locks[1]&&!game.finale.dragon.locks[2])ui('room-goal').textContent=!game.finale.dragon.liftUnlocked?'Build steps and climb to the upper plate to unlock the lift.':game.finale.dragon.lift.moving||game.finale.dragon.lift.state==='UP'?'Ride the lift. Walk onto the upper landing.':game.finale.dragon.liftBoarding?'Bring your partner and the Heart onto the lift. No hurry.':'Call the lift for your partner and the Heart.';
  if(game.finale?.dragon?.locks[2]&&!game.finale.dragon.restored)ui('room-goal').textContent=game.finale.dragon.bridgeReady?'The Heart bridge is open. Return to the golden Heart.':'Hold the carousel pad. Complete the three word puzzles.';
  const cues=actionCues(game,!!canOpenHelp()||!!game.finale);
  touchControls?.update(started&&!menu.open&&!device.portrait&&!roomHelp.open,!canPlay()||transferTime>0,cues.actionAvailable,device.mode==='touch',cues.switchSuggested,cues.actionLabel);
  ui('switch-hero').classList.toggle('switch-suggested',canPlay()&&transferTime<=0&&cues.switchSuggested);
  menu.updateControls(device.mode==='touch');
  if(!ui('debug').hidden){const progress=economy.roomProgress(game.puzzle.id,ROOM_COLLECTIBLES[game.puzzle.id]??[]);ui('debug').textContent+=`\nHERO COINS ${economy.heroCoins}\nHEART SHARDS ${economy.heartShardsCollected} / ${totalHeartShards}\nCURRENT ROOM COINS ${progress.coinsCollected} / ${progress.coinsTotal}`;}
  localizeInstructions(app);
  adaptControlHints(document.querySelector<HTMLElement>('.hud')!,device.mode==='touch');
  renderer.render(scene, camera);
}
let last = performance.now(), manualTime = false;
function frame(now: number) {
  const dt = Math.max(0, Math.min((now - last) / 1000, 0.04)); last = now;
  if (!manualTime && !document.hidden) { update(dt); render(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function movementSnapshot(){
  scene.updateMatrixWorld(true);
  const point=(object:THREE.Object3D)=>object.getWorldPosition(new THREE.Vector3());
  return {keys:[...keys],controls:{mode:device.mode,preference:device.preference,rotation:device.portrait,paused:menu.open,touch:touchControls?.vector,progress:progress.snapshot(),pixelRatio:renderer.getPixelRatio(),shadows:renderer.shadowMap.enabled},carried:game.blocks.filter(b=>b.state==='carried').map(b=>{
    const hero=b.carrier??selectedHero,joints=heroViews[hero].joints;
    return {id:b.id,hero,center:point(blockViews[b.id].mesh),leftHand:point(joints.left.hand),rightHand:point(joints.right.hand)};
  })};
}
Object.assign(window, {
  render_game_to_text: () => JSON.stringify({ finale:game.finale?.snapshot()??null, movement:movementSnapshot(), ability:game.ability?.snapshot()??null, actionChamber:game.actionChamber?{earned:game.actionChamber.earned,matches:game.actionChamber.matches,collected:game.actionChamber.collected,conveyorSpeed:5.5,conveyorTravel:game.actionChamber.conveyorTravel,stationStats:game.actionChamber.stationStats,ferryZ:game.actionChamber.lift.z}:null,memoryAlcove:game.memory?.snapshot()??null,economy:{...economy.snapshot(),totalHeartShards,roomProgress:economy.roomProgress(game.puzzle.id,ROOM_COLLECTIBLES[game.puzzle.id]??[])},collectibles:collectibleView.snapshot(), entrance:{language:entranceText.language,info:entranceText.info,jump:entranceText.jump,jumpVisible:nearJumpDitch(game.player)&&!game.motion[selectedHero].crossed}, help:{available:canOpenHelp(),open:roomHelp.open,step:roomHelp.step,time:roomHelp.time}, motion:game.motion, bridge:{extension:game.bridge.extension,state:game.bridge.state,time:game.bridge.time}, events:game.events, instructionLocale, sorting:game.sorting?{heavyActive:game.sorting.heavyActive,bridgeLocked:game.sorting.bridgeLocked,matches:game.sorting.matches}:null,elevator:game.transport?{state:game.transport.lift.state,y:game.transport.lift.y,blocked:game.transport.lift.blocked,controls:game.transport.controls,matches:game.fruit?.matches??game.sorting?.matches}:null, cooperation:game.cooperation?{gateLift:game.cooperation.gateLift,heroPlates:game.cooperation.heroActive,heavyActive:game.cooperation.heavyActive,bridgeLocked:game.cooperation.bridgeLocked}:null, renderStats:{drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},coordinates: 'X right, Y up, negative Z toward exit; banks Y=0, recovery Y=-3, galleries Y=5', room: game.puzzle.id, selectedHero, started, training:game.training?.snapshot()??null, heavyAction:game.action, heavyImpact:game.heavyImpact, lastHeavyEvent:game.lastHeavyEvent, abilities:HERO_ABILITIES, tutorial:team.tutorial, switching:transferTime>0, ownershipValid:team.ownershipValid, controllers:{player:team.selected,companion:team.other}, character: heroViews[selectedHero].stats, heroes: team.actors, companion: {hero:team.other,state:team.companion.state,target:team.companion.targetName,path:team.companion.path,replans:team.companion.replans,recoveries:team.companion.recoveries,lastEvent:team.companion.lastEvent}, teamExit: {player:team.playerAtExit,companion:team.companionAtExit}, bounds: { optionalAreas:game.layout.optionalAreas??[],halfWidth: game.layout.halfWidth, halfDepth: game.layout.halfDepth, exitZ:game.layout.exitZ??-game.layout.halfDepth, exitCenterX:game.layout.exitCenterX??0,exitHalfWidth:game.layout.exitHalfWidth }, obstacles: game.layout.obstacles ?? [], player: game.player, facing: game.facing, blocks: game.blocks, carried: game.carried?.text ?? null, socket: game.layout.sockets[0], sockets: game.layout.sockets, socketBlock: game.socketBlock?.text ?? null, placed: game.placed.map(b => b?.text ?? null), solved: game.solved, escaped: game.escaped, doorLift: game.doorLift, conduitProgress:game.conduitProgress, doorPowered:game.doorPowered, doorCharge:game.doorCharge, stageSolved: game.stageSolved, revealTime: game.revealTime, slotFeedback: game.layout.sockets.map((_, i) => game.slotFeedback(i)), rejectionTime: game.rejectionTime, attempts: game.attempts, pedestalColors: room.socketMaterials.map(m => m.color.getHexString()), hint: game.hint, message: game.message, camera: { yaw, pitch, distance:zoom.distance,targetDistance:zoom.target,position: camera.position } }),
  advanceTime: (ms: number) => { manualTime = true; for (let remaining = ms / 1000; remaining > 0; remaining -= 1 / 60) update(Math.min(remaining, 1 / 60)); render(); },
});




