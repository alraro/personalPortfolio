import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LINK_TYPES } from './lib/catalogue/core';

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

/** `src/content/profile/meta.yaml`: the Owner's data shared by both languages. */
const profileMeta = defineCollection({
  loader: glob({
    base: './src/content/profile',
    pattern: 'meta.yaml',
    generateId,
  }),
  schema: ({ image }) =>
    z.strictObject({
      name: z.string().min(1),
      photo: image(),
      github: z.url(),
      linkedin: z.url(),
      email: z.email(),
    }),
});

/** `src/content/profile/{en,es}.md`: headline, photo alt text and About body. */
const profileText = defineCollection({
  loader: glob({
    base: './src/content/profile',
    pattern: '{en,es}.md',
    generateId,
  }),
  schema: z.strictObject({
    headline: z.string().min(1).max(120),
    photoAlt: z.string().min(1).max(120),
  }),
});

export const collections = {
  projectMeta,
  projectText,
  profileMeta,
  profileText,
};
