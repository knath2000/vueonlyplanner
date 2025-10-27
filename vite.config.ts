import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type PluginOption } from 'vite' // Import PluginOption type
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer' // Import visualizer
import vitePurgeCss from 'vite-plugin-purgecss' // Use default import

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly type the plugins array
  const plugins: PluginOption[] = [
    vue(),
    { ...viteCompression(), apply: 'build' }, // Add compression plugin only for build
    { ...visualizer({ filename: 'stats.html', open: true }), apply: 'build' }, // Add visualizer only for build
    // Explicitly apply PurgeCSS only for build, pass empty options object
    mode === 'production' ? vitePurgeCss({}) : null,
  ].filter(Boolean) as PluginOption[] // Filter out null in dev mode and assert type

  if (mode === 'development') {
    plugins.push(vueDevTools())
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Add other config options here if needed
  } // Added missing closing brace for return object
}) // Added missing closing parenthesis for defineConfig
