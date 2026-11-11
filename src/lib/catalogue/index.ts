/**
 * Content catalogue: the thin Astro adapter.
 *
 * The only module (with `src/content.config.ts`) that reads content
 * collections. It hands plain data to the pure core in `./core.ts`, so pages
 * and components get view models and never touch the collections.
 */
import { getCollection } from 'astro:content';
import type { Locale } from '../../i18n';
import {
  buildProjectLists,
  type Project,
  type ProjectMeta,
  type ProjectText,
} from './core';
import {
  buildEvents,
  type EventMeta,
  type EventText,
  type EventView,
} from './events';

export type {
  Project,
  ProjectAward,
  ProjectLink,
  GeneratedCover,
} from './core';
export type { EventView } from './events';

async function loadEvents(locale: Locale, projects: Project[]) {
  const [metaEntries, textEntries] = await Promise.all([
    getCollection('eventMeta'),
    getCollection('eventText'),
  ]);
  const metas: EventMeta[] = metaEntries.map((entry) => ({
    ...entry.data,
    slug: entry.id.split('/')[0]!,
  }));
  const texts: EventText[] = textEntries.map((entry) => {
    const [slug, entryLocale] = entry.id.split('/') as [string, Locale];
    return { ...entry.data, slug, locale: entryLocale, body: entry.body ?? '' };
  });
  return buildEvents({ metas, texts, projects, locale });
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
  // Validates Projects first; the Events then give each Project its Award.
  const plain = buildProjectLists({ metas, texts, locale });
  const { awards } = await loadEvents(locale, [
    ...plain.featured,
    ...plain.more,
  ]);
  return buildProjectLists({ metas, texts, locale, awards });
}

/** Featured Projects for `locale`, sorted by `order`. Throws ContentError. */
export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  return (await loadProjectLists(locale)).featured;
}

/** Non-featured Projects for `locale`, sorted by `order`. Throws ContentError. */
export async function getMoreProjects(locale: Locale): Promise<Project[]> {
  return (await loadProjectLists(locale)).more;
}

/** Events for `locale`, newest first. Throws ContentError. */
export async function getEvents(locale: Locale): Promise<EventView[]> {
  const { featured, more } = await loadProjectLists(locale);
  return (await loadEvents(locale, [...featured, ...more])).events;
}
