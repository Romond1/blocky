/** Fit DOM game surfaces to the visible browser area, including browser zoom. */
export function visibleViewport() {
  const viewport = window.visualViewport;
  return {
    width: Math.max(1, viewport?.width ?? window.innerWidth),
    height: Math.max(1, viewport?.height ?? window.innerHeight),
    left: viewport?.offsetLeft ?? 0,
    top: viewport?.offsetTop ?? 0,
  };
}

export function fitWelcome(screen: HTMLElement) {
  const stage = screen.querySelector<HTMLElement>('.welcome-inner')!;
  let frame = 0;
  function fit() {
    frame = 0;
    if (screen.hidden) return;
    if(document.documentElement.dataset.controls==='touch'){
      stage.style.cssText='';return;
    }
    const view = visibleViewport();
    const width = view.width < 700 ? 620 : 1080;
    stage.style.width = `${width}px`;
    const height = stage.scrollHeight;
    const scale = Math.min((view.width - 20) / width, (view.height - 20) / height, 1.25);
    stage.style.transform = `scale(${Math.max(.01, scale)})`;
    stage.style.left = `${view.left + (view.width - width * scale) / 2}px`;
    stage.style.top = `${view.top + (view.height - height * scale) / 2}px`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(fit); }
  const observer = new ResizeObserver(schedule);
  observer.observe(stage);
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  void document.fonts.ready.then(schedule);
  fit();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('scroll', schedule);
  };
}

export function fitHud(hud: HTMLElement) {
  const view = visibleViewport();
  const scale = document.documentElement.dataset.controls==='touch'?1:Math.min(1, view.width / 1000, view.height / 650);
  hud.style.width = `${view.width / scale}px`;
  hud.style.height = `${view.height / scale}px`;
  hud.style.inset = 'auto';
  hud.style.left = `${view.left}px`;
  hud.style.top = `${view.top}px`;
  hud.style.transformOrigin = 'top left';
  hud.style.transform = `scale(${scale})`;
}
