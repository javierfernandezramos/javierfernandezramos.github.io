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
  image: {
    service: {
      config: {
        webp: {
          quality: 92,
        },
        jpeg: {
          quality: 92,
        },
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => 
        !page.endsWith('/personalizar-pack') && 
        !page.endsWith('/debug') &&
        !page.includes('/admin') &&
        !page.includes('/local-tools')
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
  },
  vite: {
    build: {
      modulePreload: false
    }
  }
});

// Sync timestamp: 1782937801847
