import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.jsx']
    }
    ,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'monaco';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('tippy.js') || id.includes('@tippyjs')) return 'tippy';
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'postprocessing']
  }
})