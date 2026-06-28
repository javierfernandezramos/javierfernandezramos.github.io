import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articulos = await getCollection('articulos');
  
  return rss({
    title: 'JaviPhoto - Fotógrafo Profesional en Valencia',
    description: 'Artículos, guías y consejos sobre fotografía de retratos, eventos deportivos y marca personal en Valencia.',
    site: context.site || 'https://javiphoto.es',
    items: articulos.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/articulos/${post.id}/`,
    })),
    customData: `<language>es-es</language>`,
  });
}
