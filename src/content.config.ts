import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LINK_TYPES } from './lib/catalogue/core';
import { EVENT_DATE, EVENT_ROLES } from './lib/catalogue/events';

// Id = path without extension, e.g. "minirt/meta" or "minirt/es".
// The adapter in src/lib/catalogue/index.ts splits it into slug and locale.
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\.(?:ya?ml|md)$/, '');

const link = z.strictObject({
  type: z.enum(LINK_TYPES),
  url: z
    .url()

    .refine((url) => url.startsWith('https://'), 'must be an https:// URL'),
});

/** `src/content/projects/<slug>/meta.yaml`: data shared by both languages. */
const projectMeta = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '*/meta.yaml',
    generateId,
  }),
  schema: z.strictObject({
    order: z.number().int().min(1),
    featured: z.boolean(),
    tags: z.array(z.string().min(1).max(24)).min(1).max(6),
    links: z
      .strictObject({
        primary: link,
        secondary: z.array(link).max(3).optional(),
      })
      .superRefine((links, ctx) => {
        if (links.secondary?.some((l) => l.url === links.primary.url)) {
          ctx.addIssue({
            code: 'custom',
            message: 'secondary links must not repeat the primary URL',
            path: ['secondary'],
          });
        }
      }),
  }),
});

/** `src/content/projects/<slug>/{en,es}.md`: localized fields + long description. */
const projectText = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '*/{en,es}.md',
    generateId,
  }),
  schema: z.strictObject({
    title: z.string().min(1).max(60),
    subtitle: z.string().min(1).max(120),
  }),
});

/** `src/content/events/<slug>/meta.yaml`: data shared by both languages. */
const eventMeta = defineCollection({
  loader: glob({
    base: './src/content/events',
    pattern: '*/meta.yaml',
    generateId,
  }),
  schema: z.strictObject({
    date: z.string().regex(EVENT_DATE, 'must be YYYY-MM or YYYY-MM-DD'),
    role: z.enum(EVENT_ROLES),
    url: z
      .url()
      .refine((url) => url.startsWith('https://'), 'must be an https:// URL')
      .optional(),
    project: z.string().min(1).optional(),
  }),
});

/** `src/content/events/<slug>/{en,es}.md`: localized fields + optional note. */
const eventText = defineCollection({
  loader: glob({
    base: './src/content/events',
    pattern: '*/{en,es}.md',
    generateId,
  }),
  schema: z.strictObject({
    name: z.string().min(1).max(80),
    award: z.string().min(1).max(40).optional(),
  }),
});

export const collections = {
  projectMeta,
  projectText,
  eventMeta,
  eventText,
};
