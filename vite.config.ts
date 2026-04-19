import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path is configurable via VITE_BASE (set to "/gangetester/" for GitHub Pages).
// When running in GitHub Codespaces we bind to 0.0.0.0 so the forwarded port
// can reach the dev server, and we tell Vite's HMR client to use the public
// HTTPS port (443) that Codespaces proxies.
const isCodespaces = process.env.CODESPACES === 'true';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: isCodespaces
      ? { clientPort: 443, protocol: 'wss' }
      : undefined,
  },
});
