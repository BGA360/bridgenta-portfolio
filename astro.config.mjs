import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

const siteUrl = process.env.PUBLIC_SITE_URL?.trim() || 'https://bridgenta.de';
const outDir = process.env.ASTRO_OUT_DIR?.trim() || './dist';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  outDir,
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
