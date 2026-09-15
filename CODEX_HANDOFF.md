# TASK: Replace ONLY the existing FV mannequin, retaining the original interaction

- Demo: https://159265moneys.github.io/doclasse-fv-mannequin/
- Public repo: https://github.com/159265moneys/doclasse-fv-mannequin
- Latest ZIP: https://github.com/159265moneys/doclasse-fv-mannequin/releases/latest/download/doclasse-fv-mannequin.zip
- Reference deployment: https://915hirata.pages.dev/

## Mandatory scope

Replace only the FV mannequin renderer. Preserve the existing hero, copy, typography, colors, navigation, CTA, routes, all other sections, Lenis, GSAP, ScrollTrigger, global pointer state and intro curtain. Do not overwrite the website with the preview HTML. Do not rebuild the model from primitives. Do not use the v1.0 static/multi-view implementation or a prerecorded movie: the user explicitly rejected those because they do not reproduce the interaction.

## Correct behavior (verified from deployed JavaScript)

1. `pointermove`: normalize against the browser window: `nx = clientX / innerWidth * 2 - 1`, `ny = clientY / innerHeight * 2 - 1` (Y is DOWN).
2. Wheel input goes through the EXISTING Lenis controller (`lerp: .09`, `wheelMultiplier: .95`). It scrolls the page normally.
3. The existing GSAP ScrollTrigger maps hero `top top` -> `bottom top` to `heroState.scroll` 0 -> 1, scrub true.
4. `src/reference-motion.js` directly ports the original rig. Camera Z target is `5.2 - 1.4 * scroll`; pointer controls pitch/roll and camera X/Y; Y rotation independently increases by `.12 * dt`. Do not replace this with drag OrbitControls, arbitrary scroll rotation, a video, image swapping, or CSS zoom.
5. `src/ribbon-motion.js` retains the source vertex equations, all frequencies, 2.3 turns, .085 width, time, twist and scroll-dependent loosening. No loop-frequency approximations. The final ribbon is actually deformed in 3D.
6. The particle animation also retains the reference shader and 36 / 2.2 / .25 / .55 parameters.
7. The real perspective camera, full 3D model and depth ordering respond together. Reduced-motion disables animation; invisible/hidden views stop drawing.

See `MOTION_SOURCE.md` for exact provenance and the numerical comparison test.

## Assets and material quality

`public/mannequin/cycles-dressform.glb` is exported from the approved, detailed Blender master. Geometry includes the shaped linen body, arm bindings, seams, stitches, fibre geometry, turned walnut, hardware and brass. The body contains a 4096px Cycles diffuse bake (fabric and illumination). Wood uses separately baked color/roughness/normal maps. Brass, wood and satin use physical materials; browser display uses Three.js. This is actual interactive geometry, not realtime Cycles path tracing. The linen's baked studio illumination is attached to its surface; it is not recomputed when the model rotates.

`cycles-mannequin.webp` remains the approved high-resolution loading/error fallback. Draco decoder files and the satin normal map are local; no external CDN is needed. Preserve all these assets.

## Integrate

1. Find the existing FV renderer and runtime modules:
   ```sh
   rg -n 'hero3d|heroState|runtime.pointer|onReady|Hero3D' app src components
   ```
2. Copy `public/mannequin/` as a complete directory into the target public directory. Do not copy `public/demo`, the preview HTML, or its blank scroll room into the client site.
3. Copy ALL files in `integration/` together. Runtime dependencies: `three` 0.180.0 (the source renderer uses Three.js/addons). Reuse a compatible existing version if the target already has it; run its typecheck/build.
4. Replace only the old renderer component/dynamic import with `HeroMannequin`. Preserve its existing SSR-disabled dynamic boundary.
5. Connect the existing state using stable module-level functions (or useCallback). Resolve actual import paths from the target repo:
   ```tsx
   // Import heroState, runtime and onReady FROM THE EXISTING SITE MODULES.
   const getHeroScroll = () => heroState.scroll;
   const getHeroPointer = () => runtime.pointer;
   // Within the existing hero, replacing only the old renderer:
   <HeroMannequin
     assetBase="/mannequin"
     getScroll={getHeroScroll}
     getPointer={getHeroPointer}
     subscribeReady={onReady}
   />
   ```
   `onReady` is the existing callback-registration function returning an unsubscribe function. It keeps the curtain/entrance timing. If the target has no such lifecycle, omit `subscribeReady` and the model begins after loading.
6. Keep the parent ScrollTrigger that updates `heroState.scroll`. Keep the parent `.hero__copy` scroll animation. Keep global Lenis and pointer listeners. Do not install a second smooth-scroll controller in production.
7. Remove/unmount the previous FV Canvas. Do not run two renderers. Leave Three.js/GSAP uses in all other sections unchanged.
8. The parent hero remains `position:relative`; the supplied `.hero3d` wrapper fills it. CSS only targets `.mannequin-*`. Assets support an explicit base path.

If `getScroll` is omitted, the renderer derives progress from the hero's bounding rectangle. If `getPointer` is omitted it reads window pointer events. The standalone preview adds empty scroll space because it contains no following sections; the real site already provides scroll distance.

## Plain HTML alternative

```html
<link rel="stylesheet" href="/mannequin/hero.css">
<div id="mannequin-fv" style="position:absolute;inset:0" aria-hidden="true"></div>
<script type="module">
  import {mountMannequin} from '/mannequin/mannequin.js';
  const dispose = mountMannequin(document.getElementById('mannequin-fv'));
  // Call dispose on view teardown. Keep existing page scrolling.
</script>
```

## Verify before finishing

- Run the target build/typecheck. For this source package: `npm ci && npm run build && npm test`.
- Desktop: without input the model turns slowly. Move the pointer: pitch/roll/camera follow. Wheel down: perspective zooms while the model keeps rotating and ribbon expands outward/upward. Wheel up restores camera distance and ribbon shape. Page scrolling must work normally.
- Mobile: compare the source's portrait placement; scroll to see the model. Do not rewrite the source mobile layout just to fit the full stand in the initial viewport.
- No horizontal overflow; copy and CTAs remain usable; no shader/network errors.
- Check reduced motion, offscreen suspension, unmount/remount and fallback on failed model loading. No duplicate model/Canvas.
- All GLB, WebP, normal-map and Draco URLs return 200; .wasm MIME is application/wasm.
- Changes outside mannequin integration/assets must not enter the client patch.

## Rebuild Blender transfer

`blender/doclasse-cycles-final.blend` is the unchanged approved master with packed textures. Run `blender --background --python tools/export_interactive.py` to bake and export the interactive asset. This takes CPU time. Blender 5.2 was used. `tools/render_from_master.py` recreates the still render. `ASSET_MANIFEST.json` records the shipped files and SHA-256 hashes.
