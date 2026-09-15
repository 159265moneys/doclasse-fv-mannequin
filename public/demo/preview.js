import Lenis from './lenis.mjs';
import {mountMannequin} from '../mannequin/mannequin.js?v=1.1.0';
const hero=document.querySelector('.hero');
const copy=hero.querySelector('.hero__copy');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis=new Lenis({lerp:reduced?1:.09,wheelMultiplier:.95,smoothWheel:!reduced});
const heroState={scroll:0};
const stop=mountMannequin(document.getElementById('mannequin-fv'),{assetBase:'./mannequin',getScroll:()=>heroState.scroll,debug:new URLSearchParams(location.search).has('debug')});
function frame(time){lenis.raf(time);const rect=hero.getBoundingClientRect();heroState.scroll=Math.max(0,Math.min(1,-rect.top/rect.height));copy.style.transform=`translateY(${-18*heroState.scroll}%)`;copy.style.opacity=String(1-.8*heroState.scroll);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.addEventListener('pagehide',event=>{if(!event.persisted){stop();lenis.destroy();}});
