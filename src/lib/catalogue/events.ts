/**
 * Content catalogue: Events and Awards.
 *
 * Pure like `./core.ts` (no Astro imports). It validates Events, builds their
 * view models and works out which Project inherits which Award, so an Award
 * is recorded once, on the Event, and never in the Project's files.
 * Throws the same `ContentError`, listing every problem found.
 */
import { locales, t, type DictionaryKey, type Locale } from '../../i18n';
import {
  ContentError,
  findText,
  stripHtmlComments,
  type ProjectAward,
} from './core';

export const EVENT_ROLES = ['participant', 'volunteer'] as const;
export type EventRole = (typeof EVENT_ROLES)[number];

/** `YYYY-MM` or `YYYY-MM-DD`. */
export const EVENT_DATE =
  /^\d{4}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?$/;

/** Locale-independent data of one Event (its `meta.yaml`). */
export interface EventMeta {
  slug: string;
  date: string;
  role: EventRole;
  url?: string | undefined;
  /** Slug of the Project built at this Event. */
  project?: string | undefined;
}

/** Localized data of one Event (its `en.md` or `es.md`). */
export interface EventText {
  slug: string;
  locale: Locale;
  name: string;
  award?: string | undefined;
  /** Markdown body: an optional one-sentence note (shown as plain text). */
  body: string;
}

export interface EventView {
  slug: string;
  name: string;
  /** "Jul 2025" style; with the day when the date has one. */
  dateLabel: string;
  roleLabel: string;
  award?: string;
  url?: string;
  note?: string;
  project?: { title: string; anchor: string };
}

export interface EventsResult {
  events: EventView[];
  /** Award per Project slug, to hand to `buildProjectLists`. */
  awards: Map<string, ProjectAward>;
}

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateEvents(
  metas: readonly EventMeta[],
  texts: readonly EventText[],
  projectSlugs: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  const metaSlugs = new Set(metas.map((meta) => meta.slug));

  for (const meta of metas) {
    if (!KEBAB_CASE.test(meta.slug)) {
      problems.push(
        `Event "${meta.slug}": slug must be lowercase kebab-case (folder name)`,
      );
    }
    if (!EVENT_DATE.test(meta.date)) {
      problems.push(
        `Event "${meta.slug}": date "${meta.date}" must be YYYY-MM or YYYY-MM-DD`,
      );
    }
    if (meta.project !== undefined && !projectSlugs.has(meta.project)) {
      problems.push(
        `Event "${meta.slug}": project "${meta.project}" does not match any Project slug`,
      );
    }
  }

  const eventsByProject = new Map<string, string[]>();
  for (const meta of metas) {
    if (meta.project === undefined) continue;
    eventsByProject.set(meta.project, [
      ...(eventsByProject.get(meta.project) ?? []),
      meta.slug,
    ]);
  }
  for (const [project, slugs] of eventsByProject) {
    if (slugs.length > 1) {
      const names = slugs.map((slug) => `"${slug}"`).join(' and ');
      problems.push(`Events ${names}: both point to Project "${project}"`);
    }
  }

  for (const slug of new Set(texts.map((text) => text.slug))) {
    if (!metaSlugs.has(slug)) {
      problems.push(`Event "${slug}": missing metadata file`);
    }
  }

  for (const meta of metas) {
    const found = locales.map((locale) => ({
      locale,
      text: findText(texts, meta.slug, locale),
    }));
    for (const { locale, text } of found) {
      if (!text) {
        problems.push(`Event "${meta.slug}": missing "${locale}" translation`);
      }
    }
    const withAward = found.filter(({ text }) => text?.award !== undefined);
    if (withAward.length > 0 && withAward.length < found.length) {
      const has = withAward.map(({ locale }) => `"${locale}"`).join(', ');
      const lacks = found
        .filter(({ text }) => text && text.award === undefined)
        .map(({ locale }) => `"${locale}"`)
        .join(', ');
      problems.push(
        `Event "${meta.slug}": "award" is present in ${has} but missing in ${lacks}`,
      );
    }
  }

  return problems;
}

function formatDate(date: string, locale: Locale): string {
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number | undefined,
  ];
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    ...(day === undefined ? {} : { day: 'numeric' }),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day ?? 1)));
}

/**
 * Validates all Events (in every locale) and returns the Event view models for
 * `locale`, newest first, plus the Award each referenced Project inherits.
 * `projects` lists every Project (slug and its title in `locale`).
 *
 * @throws ContentError listing every problem found.
 */
export function buildEvents(input: {
  metas: readonly EventMeta[];
  texts: readonly EventText[];
  projects: readonly { slug: string; title: string }[];
  locale: Locale;
}): EventsResult {
  const { metas, texts, projects, locale } = input;
  const problems = validateEvents(
    metas,
    texts,
    new Set(projects.map((project) => project.slug)),
  );
  if (problems.length > 0) throw new ContentError(problems);

  const awards = new Map<string, ProjectAward>();
  const events = [...metas]
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    )
    .map((meta): EventView => {
      const text = findText(texts, meta.slug, locale)!;
      const note = stripHtmlComments(text.body).trim();
      const project = projects.find((p) => p.slug === meta.project);
      if (project && text.award !== undefined) {
        awards.set(project.slug, { text: text.award, eventName: text.name });
      }
      return {
        slug: meta.slug,
        name: text.name,
        dateLabel: formatDate(meta.date, locale),
        roleLabel: t(locale, `event.role.${meta.role}` as DictionaryKey),
        ...(text.award === undefined ? {} : { award: text.award }),
        ...(meta.url === undefined ? {} : { url: meta.url }),
        ...(note === '' ? {} : { note }),
        ...(project
          ? {
              project: {
                title: project.title,
                anchor: `#project-${project.slug}`,
              },
            }
          : {}),
      };
    });

  return { events, awards };
}
