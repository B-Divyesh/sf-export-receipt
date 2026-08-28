import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: false,
    manifest: true,
    rollupOptions: { output: { entryFileNames: 'assets/app-[hash].js', chunkFileNames: 'assets/chunk-[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
