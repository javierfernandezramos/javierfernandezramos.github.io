import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articulos = defineCollection({
  // Usamos glob para cargar los archivos markdown de la carpeta actual
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/articulos" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    image: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { articulos };
