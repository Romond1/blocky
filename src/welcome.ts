import {fitWelcome} from './viewport.ts';
import type {ControlPreference} from './input-device.ts';
const tutorialVideo = new URL('../Assets/Tutorials/Room 1/Kids_solving_lava_cavern_puzzle_20260929140154.mp4', import.meta.url).href;

const heroSheets = {
  yuki: new URL('../Assets/Characters/Yuki_Blocky_character_design_sheet_2K.jpg', import.meta.url).href,
  mia: new URL('../Assets/Characters/Mia_blocky.jpg', import.meta.url).href,
};
type WelcomeHero = 'yuki' | 'mia';

export function createWelcome(parent: HTMLElement, onPlay: (hero: WelcomeHero) => void, initialHero: WelcomeHero = 'mia',canStart=()=>true,setControls:(mode:ControlPreference)=>void=()=>{},getControls:()=>ControlPreference=()=> 'auto') {
  let selected = initialHero;
  const screen = document.createElement('section');
  screen.className = 'welcome';
  screen.lang = 'en';
  screen.setAttribute('translate', 'yes');
  screen.setAttribute('aria-labelledby', 'welcome-title');
  screen.innerHTML = `
    <div class="welcome-inner">
      <header class="welcome-heading">
        <span class="welcome-tag">Your adventure starts here</span>
        <h1 id="welcome-title">Blocky World</h1>
        <p>Explore a world of blocks. Solve the puzzles and escape the room!</p>
      </header>
      <div class="welcome-panels">
        <section class="welcome-panel welcome-tutorial" aria-labelledby="welcome-watch">
          <h2 id="welcome-watch">How to play</h2>
          <p>Pick up the blocks. Put them in the right places to open the door.</p>
          <video class="welcome-video" autoplay muted loop playsinline controls preload="auto" aria-label="Watch how to solve the block puzzle"></video>
          <div class="welcome-video-footer">
            <p class="welcome-video-status" role="status">Watch the video, or start when you are ready.</p>
            <button class="welcome-sound" type="button" aria-pressed="false">Turn sound on</button>
          </div>
          <div class="welcome-heroes" role="group" aria-labelledby="welcome-heroes-title">
            <h2 id="welcome-heroes-title">Choose your hero</h2>
            <div class="welcome-hero-options">
              <button class="welcome-hero" type="button" data-hero="yuki" aria-pressed="false">
                <span class="welcome-portrait welcome-portrait-yuki" role="img" aria-label="Yuki in blue armor"></span>
                <strong translate="no">Yuki</strong><span class="welcome-power">Super strength</span>
                <span class="welcome-power-description">He can lift very heavy blocks.</span>
                <span class="welcome-selected">Choose Yuki</span>
              </button>
              <button class="welcome-hero" type="button" data-hero="mia" aria-pressed="false">
                <span class="welcome-portrait welcome-portrait-mia" role="img" aria-label="Mia in red armor"></span>
                <strong translate="no">Mia</strong><span class="welcome-power">Super speed</span>
                <span class="welcome-power-description">She can run very fast.</span>
                <span class="welcome-selected">Choose Mia</span>
              </button>
            </div>
            <div class="welcome-tab"><kbd translate="no">Q / Tab</kbd><div><strong>Switch heroes!</strong><p>Click Switch hero, or press Q or Tab to switch between Yuki and Mia. Use both powers to solve the puzzles!</p></div></div>
          </div>
        </section>
        <section class="welcome-panel welcome-controls" aria-labelledby="welcome-controls-title">
          <h2 id="welcome-controls-title">Your controls</h2>
          <dl class="desktop-welcome-controls">
            <div><dt translate="no"><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></dt><dd>Move</dd></div>
            <div><dt>Mouse</dt><dd>Hold and drag to look around</dd></div>
            <div><dt>Mouse wheel</dt><dd>Scroll to zoom in and out</dd></div>
            <div><dt><kbd>Space</kbd></dt><dd>Jump</dd></div>
            <div><dt translate="no"><kbd>E</kbd></dt><dd>Pick up or put down a block</dd></div>
          </dl>
          <p class="touch-welcome-controls">Move with the left stick. Drag the right side to look.<br>JUMP hops · ACTION picks up or places · HERO switches heroes.</p>
          <label class="welcome-mode">Controls <select aria-label="Welcome controls"><option value="auto">Automatic</option><option value="touch">Touch</option><option value="keyboard">Keyboard &amp; mouse</option></select></label>
          <div class="welcome-mission"><strong>Click or press a key</strong><p>Use the on-screen buttons to switch hero, pick up and jump. The keyboard works too!</p></div>
          <button class="welcome-play" type="button">Play Game <kbd>Enter</kbd></button>
          <p class="welcome-skip">You can skip the video and play now.</p>
        </section>
      </div>
    </div>`;
  // Arrange hero selection beside controls, with the tutorial spanning below.
  const panels = screen.querySelector<HTMLElement>('.welcome-panels')!;
  const heroes = screen.querySelector<HTMLElement>('.welcome-heroes')!;
  heroes.classList.add('welcome-panel');
  panels.prepend(heroes);
  panels.append(screen.querySelector<HTMLElement>('.welcome-tutorial')!);
  const video = screen.querySelector<HTMLVideoElement>('video')!;
  const controlSelect=screen.querySelector<HTMLSelectElement>('.welcome-mode select')!;
  controlSelect.value=getControls();controlSelect.onchange=()=>setControls(controlSelect.value as ControlPreference);
  const sound = screen.querySelector<HTMLButtonElement>('.welcome-sound')!;
  const status = screen.querySelector<HTMLElement>('.welcome-video-status')!;
  video.src = tutorialVideo;
  video.loop = true;
  video.muted = true;
  sound.onclick = () => {
    video.muted = !video.muted;
    sound.textContent = video.muted ? 'Turn sound on' : 'Turn sound off';
    sound.setAttribute('aria-pressed', String(!video.muted));
    if (video.paused && !video.ended) void video.play().catch(() => {
      status.textContent = 'Press play on the video to watch.';
    });
  };
  video.onerror = () => { status.textContent = 'The video could not load. You can still press Play Game.'; };
  const heroButtons = screen.querySelectorAll<HTMLButtonElement>('.welcome-hero');
  function refreshSelection() {
    heroButtons.forEach(button => {
      const active = button.dataset.hero === selected;
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('.welcome-selected')!.textContent = active ? 'Selected' : `Choose ${button.dataset.hero === 'yuki' ? 'Yuki' : 'Mia'}`;
    });
  }
  for (const hero of ['yuki', 'mia'] as const) {
    screen.querySelector<HTMLElement>(`.welcome-portrait-${hero}`)!.style.backgroundImage = `url("${heroSheets[hero]}")`;
  }
  heroButtons.forEach(button => { button.onclick = () => { selected = button.dataset.hero as WelcomeHero; refreshSelection(); }; });
  refreshSelection();
  function start() {
    if (screen.hidden||!canStart()) return;
    stopFitting();
    video.pause();
    screen.hidden = true;
    window.removeEventListener('keydown', startWithEnter, true);
    onPlay(selected);
  }
  function startWithEnter(event: KeyboardEvent) {
    if (event.code !== 'Enter' || event.repeat || event.isComposing || screen.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    start();
  }
  screen.querySelector<HTMLButtonElement>('.welcome-play')!.onclick = start;
  window.addEventListener('keydown', startWithEnter, true);
  parent.append(screen);
  const stopFitting = fitWelcome(screen);
  void video.play().catch(() => { status.textContent = 'Press play on the video, or start the game now.'; });
  screen.querySelector<HTMLButtonElement>('.welcome-play')!.focus({preventScroll:true});
  return screen;
}
