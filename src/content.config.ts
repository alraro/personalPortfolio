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
  schema: ({ image }) =>
    z.strictObject({
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
      // Image files live inside the Project folder (relative paths); video
      // files live under public/media/projects/<slug>/ (checked by the core).
      media: z
        .discriminatedUnion('kind', [
          z.strictObject({ kind: z.literal('image'), src: image() }),
          z.strictObject({
            kind: z.literal('video'),
            mp4: z.string(),
            webm: z.string().optional(),
            poster: image(),
          }),
        ])
        .optional(),
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
    mediaAlt: z.string().min(1).max(160).optional(),
  }),
});

export const collections = { projectMeta, projectText };
