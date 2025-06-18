import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.' // copies to dist/
        },
        {
          src: 'public/background.js',
          dest: '.' // copies to dist/
        },
        {
          src: 'public/rules.json',
          dest: '.' // copies to dist/
        }
      ]
    })
  ],
  build: {
    outDir: 'dist'
  }
});
