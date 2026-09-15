# TASK: Replace ONLY the DoCLASSE FV mannequin

## Published preview

- Demo: https://159265moneys.github.io/doclasse-fv-mannequin/
- Public repository: https://github.com/159265moneys/doclasse-fv-mannequin
- ZIP: https://github.com/159265moneys/doclasse-fv-mannequin/releases/latest/download/doclasse-fv-mannequin.zip

## User-approved scope

The user approved the visual direction in this package. Integrate the supplied Blender/Cycles mannequin into the existing DoCLASSE recruitment landing page. The reference deployment is https://915hirata.pages.dev/ . This ZIP is a component/asset patch, NOT a replacement website.

**Do not redesign, regenerate, rewrite or replace any other part of the site.** Preserve existing copy, typography, colors, header, navigation, buttons, spacing, other sections, GSAP/scroll/entrance animations, metadata and routes. Do not copy a preview HTML file over the existing page. Do not rebuild this model from Three.js primitives. Do not ask the user to approve the already-approved visual direction again.

## Rendering decision — preserve it

- The final FV displays transparent images rendered by Blender Cycles.
- Scanned fabric, physical stitch geometry, cloth seam deformation, wood grain, brushed brass and indirect light are baked into the images.
- `cycles-mannequin.webp` is the initial, high-quality image.
- `views/view-00.webp` … `view-08.webp` are 9 Cycles-rendered camera angles (1.5° intervals; centre = 04). Desktop pointer movement blends adjacent views. This is a rendered multi-view asset, not a freely rotatable WebGL scene.
- Mobile, coarse pointers, reduced-motion and save-data use the static image.
- Do not replace the final images with the earlier GLB/WebGL approximation. That approach was rejected by the user.
- No external CDN, WebGL renderer or new Three.js dependency is required.

## Package

```text
public/mannequin/
  cycles-mannequin.webp
  views/view-00.webp ... view-08.webp
  mannequin.js                    # built ES module for plain HTML integration
  hero.css
integration/
  HeroMannequin.tsx                # preferred React/Next.js integration
  mannequin.js                    # source ES module used by the component
  mannequin.d.ts
  hero.css
blender/doclasse-cycles-final.blend # final source; images packed into .blend
renders/                           # full-resolution PNGs, not needed at runtime
CODEX_HANDOFF.md
ASSET_MANIFEST.json
```

## Integrate into the real source tree

1. Inspect the repository and find the existing FV mannequin component. Useful landmarks:
   ```sh
   rg -n 'hero3d|heroState|LatheGeometry|DoCLASSE CAREERS|Hero3D' app src components
   ```
   The reference page has a `section.hero` containing a `.hero3d` renderer, `.hero__grain`, `.hero__inner` and `.hero__foot`. The old 3D renderer is dynamically imported with SSR disabled.

2. Copy `public/mannequin/` into the existing project's public directory. Keep paths stable; the default asset base is `/mannequin`. If the deployment uses a base path, pass the correct `assetBase` into the component.

3. Copy the 4 files from `integration/` together into a small component subdirectory, preserving their relative imports.

4. Replace ONLY the old FV renderer's JSX with `<HeroMannequin />`. Keep the existing parent hero, all sibling elements, and their classes untouched. You may preserve the existing `dynamic(..., { ssr: false })` boundary and point it at `HeroMannequin`.
   ```tsx
   import dynamic from 'next/dynamic';
   const HeroMannequin = dynamic(() => import('./mannequin/HeroMannequin'), { ssr: false });
   // Existing hero:
   <section className="hero" /* existing props */>
     <HeroMannequin />
     {/* EXISTING grain/copy/CTA/footer remain exactly as they are */}
   </section>
   ```
   If the original component already has a stable import path, adapting/replacing its implementation while preserving that path is also fine.

5. Remove/unmount the old FV Canvas/Three.js scene. Do not leave a hidden second renderer running. Retain Three.js/GSAP dependencies used by other sections. Keep unrelated scroll/animation logic intact.

6. The existing `.hero` needs `position:relative` (already true in the reference page). The new component creates an absolute full-hero wrapper. All shipped CSS selectors begin with `.mannequin-`; do not apply them globally to `canvas`, `img`, `.hero`, body or other site elements.

## Plain HTML fallback (only if the project is not React)

```html
<link rel="stylesheet" href="/mannequin/hero.css">
<!-- Inside existing .hero, replacing only the old mannequin renderer: -->
<div id="mannequin-fv" style="position:absolute;inset:0" aria-hidden="true"></div>
<script type="module">
  import { mountMannequin } from '/mannequin/mannequin.js';
  const dispose = mountMannequin(document.getElementById('mannequin-fv'));
  // Call dispose() when the containing view unmounts.
</script>
```

## Required verification

- Run the project's normal build/typecheck.
- Check desktop (~1440px) and mobile (~390px): model is visible, not stretched, no horizontal overflow; copy/CTAs remain legible and clickable.
- Check all model assets return HTTP 200 and there are no browser errors.
- Hover/move the pointer over the hero on desktop; after the 9 views load, the mannequin turns subtly. The static image remains visible if optional views cannot load.
- Confirm reduced-motion/coarse-pointer/save-data settings do not start the turn effect.
- Confirm old FV renderer is unmounted and only one mannequin is visible.
- Review git diff: changes must be confined to the mannequin integration and added assets. Do not modify unrelated parts of the page.
- This package author did not deploy to the client URL. Do not claim a production deployment unless you actually deploy through the user's existing authorized workflow.

## Source / licenses

The dress form, ribbon, stand and sewing geometry were created for this task in Blender 5.2. The final `.blend` has textures packed inside. PBR material scans are CC0 from Poly Haven: https://polyhaven.com/a/hessian_380 , https://polyhaven.com/a/american_walnut_veneer , https://polyhaven.com/a/crepe_satin . License: https://polyhaven.com/license . Runtime files are local and require no third-party account.
