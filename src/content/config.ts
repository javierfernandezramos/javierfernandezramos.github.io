import { defineCollection, z } from 'astro:content';

const articulosCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    image: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'articulos': articulosCollection,
};
