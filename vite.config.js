import { defineConfig } from 'vite';

// Vite config for PitchCraft & Eloquence Studio.
// - Serves index.html and the js/ ES modules during `vite dev`
// - Injects VITE_* env vars (from .env) into import.meta.env at build time
// - Builds a static bundle into dist/ for deployment
//
// The /api serverless functions are handled by Vercel, not Vite. During local
// development use `vercel dev` to run the functions, or `vite` for the frontend.
export default defineConfig({
  // Env vars must be prefixed VITE_ to be exposed to client code.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020'
  },
  server: {
    port: 3000
  }
});
