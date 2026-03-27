import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    docType: z.enum(['pdf', 'markdown', 'external', 'download']),
    summary: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    pdfPath: z.string().optional(),
    coverPath: z.string().optional(),
    publishedAt: z.string().min(1),
    updatedAt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  docs: docsCollection,
};
