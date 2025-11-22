import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@blog': resolve(__dirname, './tests/fixtures')
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globals: true
  }
})
