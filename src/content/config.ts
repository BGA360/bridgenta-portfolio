import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: z.string(),
    technologies: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  projects: projectCollection,
};
