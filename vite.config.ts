import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      // Colons in "UX:UI" break Vite's default path matching on macOS.
      strict: false,
      allow: [root, path.resolve(root, '..'), path.resolve(root, '../..')],
    },
  },
})
