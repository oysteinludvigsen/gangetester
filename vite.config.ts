import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path is configurable via VITE_BASE (set to "/gangetester/" for GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
});
