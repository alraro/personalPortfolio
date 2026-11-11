/**
 * Content catalogue: the thin Astro adapter.
 *
 * The only module (with `src/content.config.ts`) that reads content
 * collections. It hands plain data to the pure core in `./core.ts`, so pages
 * and components get view models and never touch the collections.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import type { Locale } from '../../i18n';
import {
  buildProjectLists,
  type Project,
  type ProjectMeta,
  type ProjectText,
} from './core';

export type {
  EducationItem,
  ExperienceItem,
  TimelineItemData,
} from './timeline';
export type {
  Project,
  ProjectLink,
  GeneratedCover,
  ProjectMedia,
} from './core';
import {
  buildEducationList,
  buildExperienceList,
  type EducationItem,
  type EducationMeta,
  type EducationText,
  type ExperienceItem,
  type ExperienceMeta,
  type ExperienceText,
} from './timeline';

/** Size of a file under `public/`, or undefined when it does not exist. */
function publicFileSize(publicPath: string): number | undefined {
  const file = join(process.cwd(), 'public', publicPath);
  return existsSync(file) ? statSync(file).size : undefined;
}

async function loadProjectLists(locale: Locale) {
  const [metaEntries, textEntries] = await Promise.all([
    getCollection('projectMeta'),
    getCollection('projectText'),
  ]);
  const metas: ProjectMeta[] = metaEntries.map((entry) => ({
    ...entry.data,
    slug: entry.id.split('/')[0]!,
  }));
  const texts: ProjectText[] = textEntries.map((entry) => {
    const [slug, entryLocale] = entry.id.split('/') as [string, Locale];
    return { ...entry.data, slug, locale: entryLocale, body: entry.body ?? '' };
  });
  return buildProjectLists({ metas, texts, locale, fileSize: publicFileSize });
}

/** Featured Projects for `locale`, sorted by `order`. Throws ContentError. */
export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  return (await loadProjectLists(locale)).featured;
}

/** Non-featured Projects for `locale`, sorted by `order`. Throws ContentError. */
export async function getMoreProjects(locale: Locale): Promise<Project[]> {
  return (await loadProjectLists(locale)).more;
}

function splitId(id: string): [string, string] {
  const [slug, rest] = id.split('/') as [string, string];
  return [slug, rest];
}

/** Experience for `locale`: current first, then by end and start descending. */
export async function getExperience(locale: Locale): Promise<ExperienceItem[]> {
  const [metaEntries, textEntries] = await Promise.all([
    getCollection('experienceMeta'),
    getCollection('experienceText'),
  ]);
  const metas: ExperienceMeta[] = metaEntries.map((entry) => ({
    ...entry.data,
    slug: splitId(entry.id)[0],
  }));
  const texts: ExperienceText[] = textEntries.map((entry) => {
    const [slug, entryLocale] = splitId(entry.id);
    return {
      ...entry.data,
      slug,
      locale: entryLocale as Locale,
      body: entry.body ?? '',
    };
  });
  return buildExperienceList({ metas, texts, locale });
}

/** Education for `locale`, sorted like Experience. Throws ContentError. */
export async function getEducation(locale: Locale): Promise<EducationItem[]> {
  const [metaEntries, textEntries] = await Promise.all([
    getCollection('educationMeta'),
    getCollection('educationText'),
  ]);
  const metas: EducationMeta[] = metaEntries.map((entry) => ({
    ...entry.data,
    slug: splitId(entry.id)[0],
  }));
  const texts: EducationText[] = textEntries.map((entry) => {
    const [slug, entryLocale] = splitId(entry.id);
    return {
      ...entry.data,
      slug,
      locale: entryLocale as Locale,
      body: entry.body ?? '',
    };
  });
  return buildEducationList({ metas, texts, locale });
}
