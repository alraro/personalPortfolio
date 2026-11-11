/**
 * Content catalogue: Experience and Education (pure, no Astro imports).
 *
 * Same contract as `core.ts`: plain parsed data in, view models out, or one
 * `ContentError` listing EVERY problem found.
 */
import { marked } from 'marked';
import { locales, t, type Locale } from '../../i18n';
import { ContentError } from './core';

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YEAR_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Locale-independent data shared by Experience and Education. */
interface TimelineMetaBase {
  slug: string;
  location: string;
  /** `YYYY-MM`. */
  start: string;
  /** `YYYY-MM`, or `null` for current. */
  end: string | null;
}

export interface ExperienceMeta extends TimelineMetaBase {
  organization: string;
  organizationUrl?: string;
}

export interface EducationMeta extends TimelineMetaBase {
  institution: string;
  institutionUrl?: string;
}

interface TimelineTextBase {
  slug: string;
  locale: Locale;
  /** Markdown body: the description. */
  body: string;
}

export interface ExperienceText extends TimelineTextBase {
  role: string;
  /** Localized override of `location`. */
  location?: string;
  /** Localized override of `ExperienceMeta.organization`. */
  organization?: string;
}

export interface EducationText extends TimelineTextBase {
  programme: string;
  /** Localized override of `location`. */
  location?: string;
  /** Localized override of `EducationMeta.institution`. */
  institution?: string;
}

export interface TimelineItemData {
  slug: string;
  /** Role (Experience) or programme (Education). */
  title: string;
  /** Organization (Experience) or institution (Education). */
  organization: string;
  organizationUrl?: string;
  location: string;
  /** For example "Sep 2022 – Present". */
  dateRange: string;
  descriptionHtml: string;
}

export interface ExperienceItem extends TimelineItemData {
  role: string;
}
export interface EducationItem extends TimelineItemData {
  programme: string;
}

type Kind = 'Experience' | 'Education';

function formatMonth(value: string, locale: Locale): string {
  const [year, month] = value.split('-').map(Number) as [number, number];
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatRange(
  start: string,
  end: string | null,
  locale: Locale,
): string {
  const endLabel =
    end === null ? t(locale, 'timeline.present') : formatMonth(end, locale);
  return `${formatMonth(start, locale)} – ${endLabel}`;
}

/** Current entries first, then `end` descending, then `start` descending. */
function compareTimeline(a: TimelineMetaBase, b: TimelineMetaBase): number {
  if ((a.end === null) !== (b.end === null)) return a.end === null ? -1 : 1;
  if (a.end !== null && b.end !== null && a.end !== b.end) {
    return a.end < b.end ? 1 : -1;
  }
  if (a.start !== b.start) return a.start < b.start ? 1 : -1;
  return 0;
}

function validate(
  kind: Kind,
  metas: readonly TimelineMetaBase[],
  texts: readonly (TimelineTextBase & { slug: string })[],
  descriptionRequired: boolean,
): string[] {
  const problems: string[] = [];
  const metaSlugs = new Set(metas.map((meta) => meta.slug));

  for (const meta of metas) {
    const name = `${kind} "${meta.slug}"`;
    if (!KEBAB_CASE.test(meta.slug)) {
      problems.push(`${name}: slug must be lowercase kebab-case (folder name)`);
    }
    const startOk = YEAR_MONTH.test(meta.start);
    if (!startOk) {
      problems.push(`${name}: "start" must be YYYY-MM, got "${meta.start}"`);
    }
    const endOk = meta.end === null || YEAR_MONTH.test(meta.end);
    if (!endOk) {
      problems.push(
        `${name}: "end" must be YYYY-MM or null, got "${meta.end}"`,
      );
    }
    if (startOk && endOk && meta.end !== null && meta.end < meta.start) {
      problems.push(
        `${name}: "end" (${meta.end}) is before "start" (${meta.start})`,
      );
    }
  }

  for (const slug of new Set(texts.map((text) => text.slug))) {
    if (!metaSlugs.has(slug)) {
      problems.push(`${kind} "${slug}": missing metadata file`);
    }
  }

  for (const meta of metas) {
    for (const locale of locales) {
      const text = texts.find(
        (c) => c.slug === meta.slug && c.locale === locale,
      );
      if (!text) {
        problems.push(
          `${kind} "${meta.slug}": missing "${locale}" translation`,
        );
      } else if (descriptionRequired && text.body.trim() === '') {
        problems.push(
          `${kind} "${meta.slug}" ("${locale}"): description is empty`,
        );
      }
    }
  }
  return problems;
}

function html(body: string): string {
  return body.trim() === '' ? '' : marked.parse(body, { async: false });
}

/**
 * Validates all Experience entries (in every locale) and returns them for
 * `locale`, sorted current first, then by `end` and `start` descending.
 *
 * @throws ContentError listing every problem found.
 */
export function buildExperienceList(input: {
  metas: readonly ExperienceMeta[];
  texts: readonly ExperienceText[];
  locale: Locale;
}): ExperienceItem[] {
  const { metas, texts, locale } = input;
  const problems = validate('Experience', metas, texts, true);
  if (problems.length > 0) throw new ContentError(problems);

  return [...metas].sort(compareTimeline).map((meta) => {
    const text = texts.find(
      (c) => c.slug === meta.slug && c.locale === locale,
    )!;
    return {
      slug: meta.slug,
      role: text.role,
      title: text.role,
      organization: text.organization ?? meta.organization,
      organizationUrl: meta.organizationUrl,
      location: text.location ?? meta.location,
      dateRange: formatRange(meta.start, meta.end, locale),
      descriptionHtml: html(text.body),
    };
  });
}

/** Same as `buildExperienceList`, for Education (description optional). */
export function buildEducationList(input: {
  metas: readonly EducationMeta[];
  texts: readonly EducationText[];
  locale: Locale;
}): EducationItem[] {
  const { metas, texts, locale } = input;
  const problems = validate('Education', metas, texts, false);
  if (problems.length > 0) throw new ContentError(problems);

  return [...metas].sort(compareTimeline).map((meta) => {
    const text = texts.find(
      (c) => c.slug === meta.slug && c.locale === locale,
    )!;
    return {
      slug: meta.slug,
      programme: text.programme,
      title: text.programme,
      organization: text.institution ?? meta.institution,
      organizationUrl: meta.institutionUrl,
      location: text.location ?? meta.location,
      dateRange: formatRange(meta.start, meta.end, locale),
      descriptionHtml: html(text.body),
    };
  });
}
