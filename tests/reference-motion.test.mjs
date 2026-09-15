import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import {updateReferenceRig,updateReferenceRibbon} from '../src/reference-motion.js';

// Run the actual captured deployment's function, not a hand-written expectation.
const original=readFileSync(new URL('./fixtures/deployed-rig.js',import.meta.url),'utf8');
for(const [width,height] of [[1512,805],[390,844],[1050,1000],[1051,1000]]){
 test(`deployed rig equivalence ${width}x${height}`,()=>{
  const left=new THREE.Group(),right=new THREE.Group();
  const ca=new THREE.PerspectiveCamera(32,width/height,.1,100),cb=ca.clone();ca.position.set(0,.15,5.2);cb.position.copy(ca.position);
  const view=2*Math.tan(16*Math.PI/180)*ca.position.length()*width/height;
  let callback;const state={scroll:0},pointer={nx:0,ny:0};
  vm.runInNewContext(original+'\nr9({children:null});',{u:THREE,l:{useRef:()=>({current:left})},s:{useThree:()=>({viewport:{width:view},camera:ca,size:{width,height}})},i:{useFrame:fn=>{callback=fn}},a:{jsx:()=>null},rX:{heroState:state},rj:{runtime:{pointer}}});
  for(let step=0;step<360;step++){
   state.scroll=(step%90)/89;pointer.nx=Math.sin(step*.11);pointer.ny=Math.cos(step*.07);
   const dt=[1/60,1/120,1/30,.08][step%4];
   callback({},dt);updateReferenceRig(right,cb,{width,height,viewportWidth:view,scroll:state.scroll,pointer},dt);
   for(const [a,b] of [[left.position,right.position],[left.rotation,right.rotation],[left.scale,right.scale],[ca.position,cb.position],[ca.quaternion,cb.quaternion]]){
    const one=a.toArray(),two=b.toArray();for(let i=0;i<one.length;i++)if(typeof one[i]==='number')assert.ok(Math.abs(one[i]-two[i])<1e-12,`step ${step} axis ${i}: ${one[i]} vs ${two[i]}`);
   }
  }
 });
}
test('ribbon time and scroll use the deployed update unchanged',()=>{
 const uniforms={uTime:{value:0},uScroll:{value:0}};
 for(let i=0;i<120;i++){
  const before=uniforms.uScroll.value,scroll=i/119;
  updateReferenceRibbon(uniforms,i/60,scroll);
  assert.equal(uniforms.uTime.value,i/60);assert.equal(uniforms.uScroll.value,THREE.MathUtils.lerp(before,scroll,.08));
 }
});
