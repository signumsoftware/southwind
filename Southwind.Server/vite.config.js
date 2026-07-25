import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const port = 3000;
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, '../Framework/Signum/React'),
      '@extensions': path.resolve(__dirname, '../Framework/Extensions'),
    },
  },
  base: '', 
  build: {
    manifest: true, // Needed if you're using the manifest in .cshtml
    outDir: 'wwwroot/dist', // Or wherever your ASP.NET app serves static files
    emptyOutDir: true, // Clears old files on build
    rollupOptions: {
      input: '/main.tsx', // Full path relative to root
      output: {
        // Rolldown (Vite 8) may reorder side-effect imports. @lexical/code needs prismjs core
        // (which sets the global Prism) to run before its prismjs/components/prism-* imports,
        // otherwise the build throws "ReferenceError: Prism is not defined".
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: 'theme',
              test: /node_modules[\\/](\.\.[\\/]Southwind[\\/]SCSS[\\/]custom\.scss)/,
              priority: 10,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|react-router-dom|react-widgets-up|react-bootstrap|bootstrap|@azure|luxon|@fortawesome)/,
              priority: 10,
            },
          ],
        },
      }
    },
  },
  server: {
    port: port,
    strictPort: true,
    origin: `http://localhost:$3000`,
        watch: {
            ignored: ['**/obj/**', '**/bin/**'],
        },
  },
});
