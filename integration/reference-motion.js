import { MathUtils } from 'three';

/** Direct port of the deployed FV's r9/useFrame. Units, axes, rates and damping are unchanged. */
export function updateReferenceRig(group, camera, { width, height, viewportWidth, scroll, pointer }, dt) {
  const wide = width / height > 1.05;
  const x = wide ? Math.min(.22 * viewportWidth, 1.25) : 0;
  group.position.x = MathUtils.damp(group.position.x, x - .2 * scroll, 4, dt);
  group.position.y = MathUtils.damp(group.position.y, (wide ? -.02 : -1.05) + .5 * scroll, 4, dt);
  group.scale.setScalar(MathUtils.damp(group.scale.x, wide ? 1 : .62, 4, dt));
  group.rotation.y += .12 * dt;
  group.rotation.x = MathUtils.damp(group.rotation.x, .06 * pointer.ny, 3, dt);
  group.rotation.z = MathUtils.damp(group.rotation.z, -(.04 * pointer.nx), 3, dt);
  camera.position.x = MathUtils.damp(camera.position.x, .25 * pointer.nx, 2.5, dt);
  camera.position.y = MathUtils.damp(camera.position.y, .15 - .15 * pointer.ny, 2.5, dt);
  camera.position.z = MathUtils.damp(camera.position.z, 5.2 - 1.4 * scroll, 3, dt);
  camera.lookAt(0, 0, 0);
}

/** Direct port of r2's per-frame ribbon scroll smoothing. */
export function updateReferenceRibbon(uniforms, elapsedTime, scroll) {
  uniforms.uTime.value = elapsedTime;
  uniforms.uScroll.value = MathUtils.lerp(uniforms.uScroll.value, scroll, .08);
}
