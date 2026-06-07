import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://javiphoto.es',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => 
        !page.endsWith('/personalizar-pack') && 
        !page.endsWith('/debug')
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  server: {
    host: true,
    port: 4321
  }
});
