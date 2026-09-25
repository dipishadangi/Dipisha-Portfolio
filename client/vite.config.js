import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The API is proxied so the browser only ever talks to one origin in
    // development, same as in production. Images come straight from Supabase.
    proxy: {
      '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Legacy: only for files not yet migrated to Supabase Storage.
      '/uploads': { target: 'http://127.0.0.1:4000', changeOrigin: true },
    },
  },
});
