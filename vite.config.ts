import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: { output: { entryFileNames: 'app.js', chunkFileNames: 'chunk-[name].js', assetFileNames: 'app.[ext]' } }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
