import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  // Also expose EXPO_PUBLIC_* env vars to client bundle (legacy Expo naming)
  envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
});