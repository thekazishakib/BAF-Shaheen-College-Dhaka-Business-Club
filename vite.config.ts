import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// SECURITY: Do NOT define server-side secrets here.
// Any key placed in `define` is baked into the client JS bundle and is
// visible to every user via browser DevTools.
// If you need Gemini or other AI APIs, route calls through a server-side
// function (e.g. a Vercel Edge Function) that holds the key privately.

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  // Prevent accidental exposure of env vars without VITE_ prefix
  envPrefix: 'VITE_',
});
