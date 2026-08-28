import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROUTES = new Set(['/', '/demo', '/privacy', '/terms', '/receipt']);

export default defineConfig({
  plugins: [{
    name: 'preview-static-404',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://preview.local').pathname;
        const acceptsHtml = request.headers.accept?.includes('text/html');
        if (request.method !== 'GET' || !acceptsHtml || APP_ROUTES.has(pathname) || /\.[^/]+$/.test(pathname)) return next();
        response.statusCode = 404;
        response.statusMessage = 'Not Found';
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(readFileSync(resolve('dist/404.html')));
      });
    },
  }],
  build: {
    target: 'es2022',
    sourcemap: false,
    manifest: true,
    rollupOptions: { output: { entryFileNames: 'assets/app-[hash].js', chunkFileNames: 'assets/chunk-[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
