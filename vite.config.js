import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    historyApiFallback: true, // Enable SPA fallback for client-side routing
    proxy: {
      '/api': {
        target: 'https://shortnewsappback.onrender.com',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    historyApiFallback: true, // Also for preview mode
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
