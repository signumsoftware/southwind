import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true, // Needed if you're using the manifest in .cshtml
    outDir: 'wwwroot/dist', // Or wherever your ASP.NET app serves static files
    emptyOutDir: true, // Clears old files on build
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
