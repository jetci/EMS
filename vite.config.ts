import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBase = env.VITE_API_URL || env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const apiTarget = (() => {
    try {
      return new URL(apiBase).origin;
    } catch {
      return 'http://localhost:3001';
    }
  })();
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      },
    },
    // Use root base by default to ensure asset paths resolve correctly in production
    // If you intentionally deploy under a subpath, set VITE_BASE before building.
    base: '/',
    build: {
      outDir: 'dist'
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
