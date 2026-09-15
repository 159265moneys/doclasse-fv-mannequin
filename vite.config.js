import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public/mannequin',
    emptyOutDir: false,
    lib: { entry: resolve('src/mannequin.js'), formats: ['es'], fileName: () => 'mannequin.js' },
    target: 'es2020',
  },
});
