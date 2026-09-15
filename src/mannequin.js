import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { updateReferenceRig, updateReferenceRibbon } from './reference-motion.js';
import { createSparkles } from './sparkles.js';
import { ribbonPathGLSL, ribbonFrameGLSL } from './ribbon-motion.js';

const clamp = value => THREE.MathUtils.clamp(value, 0, 1);
const easeInOut = (value, power) => { const t=clamp(value); return t<.5 ? (2*t)**power/2 : 1-(2*(1-t))**power/2; };

function createStudio(renderer) {
  const studio=new THREE.Scene(); studio.background=new THREE.Color(.022,.024,.028);
  const cards=[];
  for(const [pos,size,color,strength] of [
    [[0,4,3],[6,2],0xfff6ea,2.4], [[-4,1,1],[4,3],0xffe2cf,1.2], [[4,-1,-2],[4,3],0xf0c9b8,.8]
  ]) {
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(strength),side:THREE.DoubleSide});
    const card=new THREE.Mesh(new THREE.PlaneGeometry(...size),material);card.position.set(...pos);card.lookAt(0,0,0);studio.add(card);cards.push(card);
  }
  const generator=new THREE.PMREMGenerator(renderer), environment=generator.fromScene(studio,.04,.1,100);
  generator.dispose();for(const card of cards){card.geometry.dispose();card.material.dispose();}
  return environment;
}

function createRibbon(base, uniforms, textures) {
  const geometry=new THREE.PlaneGeometry(1,1,900,6);geometry.computeTangents();
  const normal=new THREE.TextureLoader().load(`${base}/ribbon-normal.jpg`);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.repeat.set(1.6,.18);textures.add(normal);
  const material=new THREE.MeshPhysicalMaterial({color:new THREE.Color(.285,.004,.016),roughness:.30,metalness:0,anisotropy:.68,sheen:.28,sheenColor:0xf1c5b8,sheenRoughness:.35,normalMap:normal,normalScale:new THREE.Vector2(.14,.14),side:THREE.DoubleSide,transparent:true});
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nuniform float uTime,uScroll,uTurns,uWidth;\nvarying float vRibbonS;\n${ribbonPathGLSL}`)
      .replace('#include <beginnormal_vertex>',`${ribbonFrameGLSL}\nvec3 objectNormal=nrm;\n#ifdef USE_TANGENT\nvec3 objectTangent=T;\n#endif\nvRibbonS=uv.x;`)
      .replace('#include <begin_vertex>','vec3 transformed=pos;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uDraw;\nvarying float vRibbonS;')
      .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vRibbonS>uDraw*1.02)discard;');
  };
  const ribbon=new THREE.Mesh(geometry,material);ribbon.frustumCulled=false;return ribbon;
}

/** Replace only the FV model. Its parent retains the existing Lenis/GSAP and copy animation. */
export function mountMannequin(host, options={}) {
  if(!host)throw new Error('A mannequin container is required.');
  const base=(options.assetBase??'/mannequin').replace(/\/$/,'');
  const surface=host.closest('.hero')??host;
  const stage=document.createElement('div');stage.className='mannequin-stage';stage.setAttribute('aria-hidden','true');stage.dataset.state='loading';
  const fallback=document.createElement('div');fallback.className='mannequin-fallback-layout';
  const poster=new Image();poster.className='mannequin-cycles';poster.src=options.posterUrl??`${base}/cycles-mannequin.webp`;poster.alt='';poster.width=1400;poster.height=2000;poster.decoding='async';poster.fetchPriority='high';fallback.append(poster);stage.append(fallback);host.append(stage);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,loaded=false,visible=true,frame=0,previous=0,elapsed=0,readyTime=null;
  let width=1,height=1,viewportWidth=1;
  const pointer={nx:0,ny:0};
  const textures=new Set();const objects=new Set();
  let renderer;
  try { renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'}); }
  catch {stage.dataset.state='fallback';return ()=>{disposed=true;stage.remove();};}
  renderer.domElement.className='mannequin-canvas';renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=2**.35;
  stage.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.15,5.2);camera.lookAt(0,0,0);
  const group=new THREE.Group();scene.add(group);
  const environment=createStudio(renderer);scene.environment=environment.texture;scene.environmentIntensity=.45;
  scene.add(new THREE.HemisphereLight(0xfff6e9,0x403022,.45));
  const key=new THREE.DirectionalLight(0xfff1dc,2.3);key.position.set(-3.9,2.35,2.52);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffddbc,.6);rim.position.set(2.5,2.2,-2.1);scene.add(rim);
  const uniforms={uTime:{value:0},uScroll:{value:0},uTurns:{value:2.3},uWidth:{value:.085},uDraw:{value:0}};
  const ribbon=createRibbon(base,uniforms,textures);ribbon.material.envMap=environment.texture;ribbon.material.envMapIntensity=1.35;group.add(ribbon);objects.add(ribbon);
  // A soft grounded contact shadow. Its position and scale match the reference scene.
  const shadowSize=128,data=new Uint8Array(shadowSize*shadowSize*4);
  for(let y=0;y<shadowSize;y++)for(let x=0;x<shadowSize;x++){
    const radius=Math.hypot((x-64)/64,(y-64)/64),i=(y*shadowSize+x)*4;
    data[i]=91;data[i+1]=58;data[i+2]=42;data[i+3]=Math.round(Math.max(0,1-radius)**3*72);
  }
  const shadowTexture=new THREE.DataTexture(data,shadowSize,shadowSize);shadowTexture.needsUpdate=true;textures.add(shadowTexture);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.5;scene.add(ground);objects.add(ground);
  const sparkles=createSparkles(renderer.getPixelRatio());group.add(sparkles);objects.add(sparkles);
  let model=null;let presentationReady=!options.subscribeReady;
  const draco=new DRACOLoader();draco.setDecoderPath(`${base}/draco/`);draco.setDecoderConfig({type:'wasm'});draco.setWorkerLimit(2);
  const loader=new GLTFLoader().setDRACOLoader(draco);
  function destroyObject(root){root.traverse(ob=>{ob.geometry?.dispose();for(const material of [ob.material].flat().filter(Boolean)){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose();}});}
  function progress(){if(options.getScroll){const value=options.getScroll();return Number.isFinite(value)?clamp(value):0;}const rect=surface.getBoundingClientRect();return rect.height?clamp(-rect.top/rect.height):0;}
  function stop(){cancelAnimationFrame(frame);frame=0;previous=0;}
  function tick(now){
    frame=0;if(disposed||!loaded||!visible||document.hidden)return;
    const dt=previous?Math.min((now-previous)/1000,.1):0;previous=now;
    const motion=options.motion!==false&&!reduced.matches;
    if(motion)elapsed+=dt;
    const scroll=motion?progress():0;
    const cursor=options.getPointer?.()??pointer;
    updateReferenceRig(group,camera,{width,height,viewportWidth,scroll,pointer:motion?cursor:{nx:0,ny:0}},motion?dt:1);
    if(!motion)group.rotation.set(0,0,0);
    updateReferenceRibbon(uniforms,elapsed,scroll);sparkles.material.uniforms.time.value=elapsed;
    const age=readyTime===null?0:(now-readyTime)/1000;
    const appear=motion?easeInOut((age-.1)/2.6,3):1;
    uniforms.uDraw.value=motion?easeInOut((age-.5)/3.2,4):1;
    for(const material of model.userData.appearMaterials)material.userData.appear.value=appear;
    ground.position.x=group.position.x;
    renderer.render(scene,camera);
    stage.dataset.state='ready';
    if(options.debug){stage.dataset.yaw=String(group.rotation.y);stage.dataset.cameraZ=String(camera.position.z);stage.dataset.scroll=String(scroll);stage.dataset.pointer=JSON.stringify(cursor);}
    if(motion)frame=requestAnimationFrame(tick);
  }
  function start(){if(disposed||!loaded||!visible||document.hidden||frame)return;frame=requestAnimationFrame(tick);}
  function resize(){
    if(disposed)return;width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
    camera.aspect=width/height;camera.updateProjectionMatrix();viewportWidth=2*Math.tan(THREE.MathUtils.degToRad(16))*camera.position.length()*camera.aspect;
    renderer.setSize(width,height,false);start();
  }
  function move(event){pointer.nx=event.clientX/innerWidth*2-1;pointer.ny=event.clientY/innerHeight*2-1;start();}
  function visibility(){document.hidden?stop():start();}
  function preference(){stop();start();}
  const ro=new ResizeObserver(resize);ro.observe(host);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?start():stop();});io.observe(surface);
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('scroll',start,{passive:true});
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference);
  function lost(event){event.preventDefault();stop();stage.dataset.state='fallback';}
  function restored(){resize();start();}
  renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
  const unsubscribeReady=options.subscribeReady?.(()=>{presentationReady=true;if(loaded)readyTime=performance.now();start();});
  loader.load(options.modelUrl??`${base}/cycles-dressform.glb`,gltf=>{
    if(disposed){destroyObject(gltf.scene);for(const texture of textures)texture.dispose();return;}
    model=gltf.scene;model.scale.setScalar(1.4);model.position.y=-1.5;model.rotation.y=-Math.atan2(2.2,5.8);
    model.userData.appearMaterials=[];
    model.traverse(ob=>{
      if(!ob.isMesh)return;
      const old=ob.material;
      if(old.name.startsWith('Cycles baked linen')){
        const baked=new THREE.MeshBasicMaterial({map:old.map,color:0xffffff});baked.name=old.name;ob.material=baked;
        for(const value of Object.values(old))if(value?.isTexture)textures.add(value);old.dispose();
      }
      for(const value of Object.values(ob.material))if(value?.isTexture){value.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(value);}
      const mat=ob.material;if(mat.userData.appear)return;mat.userData.appear={value:0};model.userData.appearMaterials.push(mat);
      const sourceCompile=mat.onBeforeCompile;
      mat.onBeforeCompile=(shader,gl)=>{
        sourceCompile?.call(mat,shader,gl);shader.uniforms.uAppear=mat.userData.appear;
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vModelY;').replace('#include <begin_vertex>','#include <begin_vertex>\nvModelY=position.y;');
        // glTF vertices use the approved model's Y-up coordinates (0..1.63).
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uAppear;\nvarying float vModelY;')
          .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vModelY>mix(-0.15,1.8,uAppear))discard;');
      };
    });
    group.add(model);loaded=true;readyTime=presentationReady?performance.now():null;resize();start();
  },undefined,()=>{if(!disposed){stage.dataset.state='fallback';stop();}});
  resize();
  return ()=>{
    if(disposed)return;disposed=true;stop();unsubscribeReady?.();ro.disconnect();io.disconnect();draco.dispose();
    window.removeEventListener('pointermove',move);window.removeEventListener('scroll',start);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);
    renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);
    if(model)destroyObject(model);for(const ob of objects)destroyObject(ob);for(const texture of textures)texture.dispose();
    environment.dispose();renderer.dispose();renderer.forceContextLoss();stage.remove();
  };
}
