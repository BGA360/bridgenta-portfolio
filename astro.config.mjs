import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
  site: 'https://bridgenta.de',
  // Enable static site generation (default in Astro)
  output: 'static',
  vite: {
    resolve: {
      alias: [
        {
          find: /.*flowchart-elk-definition.*\.js$/,
          replacement: fileURLToPath(new URL('./src/lib/mermaid-elk-stub.js', import.meta.url))
        }
      ]
    }
  }
});
