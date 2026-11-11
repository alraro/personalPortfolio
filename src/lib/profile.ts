/**
 * Profile adapter: reads the `profileMeta` / `profileText` collections and
 * the CV folder, and hands pages a plain view model. Pages never touch the
 * collections directly.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import type { Locale } from '../i18n';
import { getCv } from './cv';

export interface Profile {
  name: string;
  photo: ImageMetadata;
  photoAlt: string;
  headline: string;
  aboutHtml: string;
  github: string;
  linkedin: string;
  email: string;
  /** Public URL of the CV for this locale, or null if no file exists. */
  cvUrl: string | null;
}

/** File names present in `public/cv/` at build time. */
function listCvFiles(): string[] {
  try {
    return readdirSync(join(process.cwd(), 'public', 'cv'));
  } catch {
    return [];
  }
}

export async function getProfile(locale: Locale): Promise<Profile> {
  const [metas, texts] = await Promise.all([
    getCollection('profileMeta'),
    getCollection('profileText'),
  ]);
  const meta = metas.find((entry) => entry.id === 'meta');
  const text = texts.find((entry) => entry.id === locale);
  if (!meta)
    throw new Error('Profile: src/content/profile/meta.yaml is missing');
  if (!text)
    throw new Error(`Profile: missing "${locale}" translation (${locale}.md)`);
  return {
    name: meta.data.name,
    photo: meta.data.photo,
    photoAlt: text.data.photoAlt,
    headline: text.data.headline,
    aboutHtml: marked.parse(text.body ?? '', { async: false }),
    github: meta.data.github,
    linkedin: meta.data.linkedin,
    email: meta.data.email,
    cvUrl: getCv(locale, listCvFiles()),
  };
}
