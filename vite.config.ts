import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Tests de domaine/application en node ; les tests UI déclarent
    // `// @vitest-environment jsdom` en tête de fichier.
    environment: 'node',
    // Les tests exercent le mode localStorage : on neutralise la config
    // Firebase que Vitest lirait sinon dans .env.local (mode test inclus).
    env: {
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_PROJECT_ID: '',
    },
  },
})
