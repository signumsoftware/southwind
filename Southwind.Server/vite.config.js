import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, '../Framework/Signum/React'),
      '@extensions': path.resolve(__dirname, '../Framework/Extensions'),
    },
  },
  base: '/dist/',
  build: {
    manifest: true, // Needed if you're using the manifest in .cshtml
    outDir: 'wwwroot/dist', // Or wherever your ASP.NET app serves static files
    emptyOutDir: true, // Clears old files on build
    rollupOptions: {
      input: '/main.tsx', // Full path relative to root
      output: {
        manualChunks: {
          // All dependencies in node_modules go into vendor.[hash].js
          theme: [
            '../Southwind/SCSS/custom.scss'
          ],
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'react-widgets-up',
            'react-bootstrap',
            'bootstrap',
            "@azure/msal-browser",
            "luxon",
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-regular-svg-icons",
            "@fortawesome/free-brands-svg-icons",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/react-fontawesome",
            //"d3"
          ]
        }
      }
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
