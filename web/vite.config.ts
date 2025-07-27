import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    fs: {
      allow: ['..'] // Allow serving files from parent directory
    }
  },
  optimizeDeps: {
    exclude: ['your-wasm-package'] // Prevent Vite from pre-bundling
  }
})
