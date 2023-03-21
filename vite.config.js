/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: './',
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
});
