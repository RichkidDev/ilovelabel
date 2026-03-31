import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// Static site — deployed to Cloudflare Pages without adapter

// esbuild plugin to handle "canvas" — pdfjs-dist requires it for Node.js
// but it's not needed in the browser
const canvasExternalPlugin = {
  name: 'canvas-external',
  setup(build) {
    build.onResolve({ filter: /^canvas$/ }, () => ({
      path: 'canvas',
      external: true,
    }));
  },
};

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['pdfjs-dist'],
      external: ['canvas'],
    },
    resolve: {
      alias: {
        canvas: 'data:text/javascript,export default {}',
      },
    },
    build: {
      rollupOptions: {
        external: ['canvas'],
      },
    },
    optimizeDeps: {
      exclude: ['canvas'],
      esbuildOptions: {
        plugins: [canvasExternalPlugin],
      },
    },
  },
});
