import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Target Safari 15+ / Chrome 90+ / Firefox 90+ for broad mobile support
    target: ['es2020', 'safari15', 'chrome90', 'firefox90'],
  },
})
