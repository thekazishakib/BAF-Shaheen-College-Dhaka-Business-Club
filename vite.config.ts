import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// SECURITY: Do not put secrets in this file. Anything added to `define` is
// compiled into the public client bundle. Server-side keys belong in Vercel
// environment variables and are only used from the api/ functions.

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Only variables prefixed with VITE_ are exposed to the client.
  envPrefix: 'VITE_',
});
