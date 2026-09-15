/**
 * Display Blender Cycles pixels, including its fabric, stitch geometry and bounced light.
 * Nine photographed camera angles give a subtle turn without simplifying the materials.
 * Returns cleanup for React unmounts and navigation.
 */
export function mountMannequin(host, options = {}) {
  if (!host) throw new Error('A mannequin container is required.');
  const assetBase = (options.assetBase ?? '/mannequin').replace(/\/$/, '');
  const stage = document.createElement('div');
  stage.className = 'mannequin-stage';
  stage.setAttribute('aria-hidden', 'true');
  const poster = new Image();
  poster.className = 'mannequin-cycles';
  poster.alt = '';
  poster.width = 1400;
  poster.height = 2000;
  poster.decoding = 'async';
  poster.fetchPriority = 'high';
  poster.src = options.posterUrl ?? `${assetBase}/cycles-mannequin.webp`;
  stage.append(poster);
  host.append(stage);
  const surface = host.closest('.hero') ?? host;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const views = [];
  const layers = [];
  let disposed = false;
  let loading = false;
  let ready = false;
  let failed = false;
  let visible = true;
  let frame = 0;
  let current = 4;
  let target = 4;
  let previous = 0;
  const motionAllowed = () => options.motion !== false && !navigator.connection?.saveData && fine.matches && !reduced.matches;
  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  function rest() {
    stop();current = target = 4;
    poster.style.opacity = '1';
    for(const layer of layers) layer.style.opacity = '0';
  }
  function render(now) {
    frame = 0;
    if(disposed || !visible || document.hidden || !ready || !motionAllowed()) return;
    const delta = previous ? Math.min((now - previous) / 1000, .07) : .016;
    previous = now;
    current += (target-current)*(1-Math.exp(-delta*4));
    const low = Math.floor(current);
    const high = Math.min(8,low+1);
    if(layers[0].dataset.index !== String(low)) { layers[0].src = views[low].src;layers[0].dataset.index = String(low); }
    if(layers[1].dataset.index !== String(high)) { layers[1].src = views[high].src;layers[1].dataset.index = String(high); }
    // Adjacent angles differ by only 1.5 degrees; blending avoids stepped motion.
    poster.style.opacity = '0';
    layers[0].style.opacity = '1';
    layers[1].style.opacity = String(current-low);
    if(Math.abs(target-current) > .003) frame = requestAnimationFrame(render);
    else {previous = 0;if(target===4)rest();}
  }
  function start() {
    if(frame || !ready || disposed || !visible || document.hidden || !motionAllowed()) return;
    frame = requestAnimationFrame(render);
  }
  function loadViews() {
    if(loading || failed || disposed || !motionAllowed()) return;
    loading = true;
    const promises = Array.from({length:9}, (_, index) => new Promise((resolve,reject) => {
      const view = new Image();view.decoding = 'async';view.alt = '';view.fetchPriority = 'low';
      view.onload = () => view.decode().then(resolve,reject);
      view.onerror = reject;
      view.src = `${assetBase}/views/view-${String(index).padStart(2,'0')}.webp`;
      views[index] = view;
    }));
    Promise.all(promises).then(() => {
      if(disposed) return;
      for(let i=0;i<2;i++) {
        const layer = new Image();layer.className = 'mannequin-view';layer.alt = '';layer.width=1050;layer.height=1500;layer.decoding='async';layer.style.opacity='0';
        stage.append(layer);layers.push(layer);
      }
      ready = true;start();
    }).catch(() => {failed=true;rest();});
  }
  function onMove(event) {
    if(!motionAllowed() || !visible || disposed) return;
    const rect=surface.getBoundingClientRect();
    if(!rect.width)return;
    target=Math.max(0,Math.min(8,(event.clientX-rect.left)/rect.width*8));
    loadViews();start();
  }
  function onLeave() {target=4;start();}
  function onPreference() {if(!motionAllowed())rest();}
  function onVisibility() {if(document.hidden)rest();}
  const observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;if(!visible)rest();});
  observer.observe(stage);
  surface.addEventListener('pointermove',onMove,{passive:true});
  surface.addEventListener('pointerleave',onLeave);
  reduced.addEventListener('change',onPreference);fine.addEventListener('change',onPreference);
  document.addEventListener('visibilitychange',onVisibility);
  return () => {
    disposed=true;stop();observer.disconnect();
    surface.removeEventListener('pointermove',onMove);surface.removeEventListener('pointerleave',onLeave);
    reduced.removeEventListener('change',onPreference);fine.removeEventListener('change',onPreference);
    document.removeEventListener('visibilitychange',onVisibility);
    for(const view of views){view.onload=null;view.onerror=null;view.removeAttribute('src');}
    stage.remove();views.length=0;layers.length=0;
  };
}
