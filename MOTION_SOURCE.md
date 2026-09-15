# Motion provenance / verification

Fetched the live deployment again on 2026-09-15. All 12 HTML-referenced and dynamically loaded JavaScript chunks matched the earlier capture byte-for-byte. The input controller, hero ScrollTrigger, full 3D component, ribbon vertex shader and source GLB bounds were inspected.

## Source chain

| Deployment file | Role |
| --- | --- |
| [20dr4tudoxnfd.js](https://915hirata.pages.dev/_next/static/chunks/20dr4tudoxnfd.js) | Lenis `lerp .09`, wheel multiplier `.95`; window pointer normalization, Y down |
| [3wmf8zg-a9epd.js](https://915hirata.pages.dev/_next/static/chunks/3wmf8zg-a9epd.js) | Module 48700: ScrollTrigger updates `heroState.scroll`; module 68544 owns `{scroll:0}`; module 63249 loads the 3D chunks |
| [1jotovuw826ui.js](https://915hirata.pages.dev/_next/static/chunks/1jotovuw826ui.js) | Module 44587: r9 rig/camera, r2 ribbon time+scroll, rz vertex shader, tN/tW particles; module 47378 exports the component |
| [dress_form.glb](https://915hirata.pages.dev/models/dress_form.glb) | Original model bounds and coordinate system |

3D chunk SHA-256: `efa402a0676793c65ea35bf9dec644ac0f65b4a21cf9d9abd85111db7566ba96`.

## Exact motion port

`src/reference-motion.js` preserves every rig target, damping constant, axis, responsive threshold and rotation speed. It uses a real PerspectiveCamera with FOV 32. `src/ribbon-motion.js` contains the captured GLSL path/tangent/twist/taper/flutter calculations, injected into a physical satin material; frequencies and scroll terms are unchanged. `src/sparkles.js` uses the original particle vertex/fragment animation.

The model is a detailed replacement, normalized into the original scene coordinates with scale 1.4 and Y offset -1.5. Its base facing angle reproduces the approved Blender view. The original motion operates on its parent group. Materials and model geometry are the intended change; the motion logic is not redesigned.

## Numerical test

`tests/fixtures/deployed-rig.js` is the actual function extracted from the deployment. `tests/reference-motion.test.mjs` runs it in an isolated context using Three.js and compares it against the port for 360 input/time steps at each of four viewport sizes, including both sides of the 1.05 portrait/landscape threshold. Every group transform and camera transform must agree to less than 1e-12. A fifth test verifies the ribbon's elapsed time and .08 scroll smoothing.

The preview's Lenis config matches the source. Real wheel input was checked in Chrome: at hero scroll 268/805, the camera approached `5.2 - 1.4*(268/805) = 4.733913...` while yaw kept increasing. The ribbon expanded in 3D at the same time. Returning to the top restores distance 5.2.

## Display constraints

The linen has Cycles-baked diffuse illumination attached to its UV surface. Other materials are physically shaded in the browser. This preserves the detailed fabric without pretending the browser runs Cycles. The original rotating rig and camera remain actual 3D transforms. No video, multi-view slideshow, CSS perspective substitute or altered loop frequencies are used.
