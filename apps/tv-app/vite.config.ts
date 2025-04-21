import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/index.html'),
        init: resolve(__dirname, 'src/renderer/initialization.html')
      }
    }
  },
  server: {
    port: 3001,
    strictPort: true,
    watch: {
      usePolling: true
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001
    }
  },
  optimizeDeps: {
    include: ['@mui/system', '@mui/material', 'react', 'react-dom'],
    exclude: ['electron']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  publicDir: 'public',
  clearScreen: false,
  logLevel: 'info'
}); 