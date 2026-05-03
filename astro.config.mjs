import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://javiphoto.es',
  trailingSlash: 'never',
  integrations: [sitemap()],
  server: {
    host: true,
    port: 4321
  }
});
