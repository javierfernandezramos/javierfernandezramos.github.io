import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://javiphoto.es',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
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
