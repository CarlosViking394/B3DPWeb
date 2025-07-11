import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Disable native modules usage which causes issues on Vercel
      context: 'globalThis',
      treeshake: {
        moduleSideEffects: false
      },
      output: {
        manualChunks: undefined
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  }
})
