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

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must be YYYY-MM');
const httpsUrl = z
  .url()
  .refine((url) => url.startsWith('https://'), 'must be an https:// URL');

// Experience and Education: `src/content/<kind>/<slug>/{meta.yaml,en.md,es.md}`.
// Cross-field rules (end >= start) are checked by the catalogue core, which
// reports every problem at once.
const experienceMeta = defineCollection({
  loader: glob({
    base: './src/content/experience',
    pattern: '*/meta.yaml',
    generateId,
  }),
  schema: z.strictObject({
    organization: z.string().min(1).max(80),
    organizationUrl: httpsUrl.optional(),
    location: z.string().min(1).max(60),
    start: yearMonth,
    end: yearMonth.nullable(),
  }),
});
const experienceText = defineCollection({
  loader: glob({
    base: './src/content/experience',
    pattern: '*/{en,es}.md',
    generateId,
  }),
  schema: z.strictObject({
    role: z.string().min(1).max(80),
    organization: z.string().min(1).max(80).optional(),
    location: z.string().min(1).max(60).optional(),
  }),
});
const educationMeta = defineCollection({
  loader: glob({
    base: './src/content/education',
    pattern: '*/meta.yaml',
    generateId,
  }),
  schema: z.strictObject({
    institution: z.string().min(1).max(80),
    institutionUrl: httpsUrl.optional(),
    location: z.string().min(1).max(60),
    start: yearMonth,
    end: yearMonth.nullable(),
  }),
});
const educationText = defineCollection({
  loader: glob({
    base: './src/content/education',
    pattern: '*/{en,es}.md',
    generateId,
  }),
  schema: z.strictObject({
    programme: z.string().min(1).max(100),
    institution: z.string().min(1).max(80).optional(),
    location: z.string().min(1).max(60).optional(),
  }),
});

export const collections = {
  projectMeta,
  projectText,
  experienceMeta,
  experienceText,
  educationMeta,
  educationText,
};
