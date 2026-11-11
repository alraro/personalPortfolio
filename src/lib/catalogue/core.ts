/**
 * Content catalogue: the pure core.
 *
 * No Astro imports. It takes plain, already-parsed data (one `ProjectMeta` per
 * Project folder, one `ProjectText` per Project and locale) and returns view
 * models, or throws a `ContentError` listing EVERY problem found.
 *
 * Extending it (Experience, Education, Events, Media...): add the new input
 * types next to the Project ones, collect problems into the same `problems`
 * array, and throw once at the end so the Owner sees all of them in one build.
 * Pages and components never read collections; they use the adapter in
 * `./index.ts`, which calls this module.
 */
import { marked } from 'marked';
import { locales, t, type DictionaryKey, type Locale } from '../../i18n';

export const LINK_TYPES = ['repository', 'website', 'demo', 'paper'] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export interface ProjectLinkInput {
  type: LinkType;
  url: string;
}

/** Locale-independent data of one Project (its `meta.yaml`). */
export interface ProjectMeta {
  slug: string;
  order: number;
  featured: boolean;
  tags: string[];
  links: { primary: ProjectLinkInput; secondary?: ProjectLinkInput[] };
}

/** Localized data of one Project (its `en.md` or `es.md`). */
export interface ProjectText {
  slug: string;
  locale: Locale;
  title: string;
  subtitle: string;
  /** Markdown body: the long description. */
  body: string;
}

export interface ProjectLink extends ProjectLinkInput {
  /** Localized link-type name, for example "Repositorio". */
  label: string;
}

export interface GeneratedCover {
  kind: 'generated';
  title: string;
  tagline: string;
}

/** Award a Project inherits from the Event it was built at. */
export interface ProjectAward {
  /** For example "2nd place". */
  text: string;
  eventName: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  descriptionHtml: string;
  tags: string[];
  primaryLink: ProjectLink;
  secondaryLinks: ProjectLink[];
  cover: GeneratedCover;
  /** Inherited from the Event that references this Project. */
  award?: ProjectAward;
}

export interface ProjectLists {
  featured: Project[];
  more: Project[];
}

/** Thrown with every content problem found; `message` lists them all. */
export class ContentError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(
      `Invalid content (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n` +
        problems.map((problem) => `  - ${problem}`).join('\n'),
    );
    this.name = 'ContentError';
    this.problems = problems;
  }
}

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProjects(
  metas: readonly ProjectMeta[],
  texts: readonly ProjectText[],
): string[] {
  const problems: string[] = [];
  const metaSlugs = new Set(metas.map((meta) => meta.slug));

  for (const meta of metas) {
    if (!KEBAB_CASE.test(meta.slug)) {
      problems.push(
        `Project "${meta.slug}": slug must be lowercase kebab-case (folder name)`,
      );
    }
  }

  const slugsByOrder = new Map<number, string[]>();
  for (const meta of metas) {
    slugsByOrder.set(meta.order, [
      ...(slugsByOrder.get(meta.order) ?? []),
      meta.slug,
    ]);
  }
  for (const [order, slugs] of slugsByOrder) {
    if (slugs.length > 1) {
      const names = slugs.map((slug) => `"${slug}"`).join(' and ');
      problems.push(`Projects ${names}: duplicate "order" ${order}`);
    }
  }

  for (const slug of new Set(texts.map((text) => text.slug))) {
    if (!metaSlugs.has(slug)) {
      problems.push(`Project "${slug}": missing metadata file`);
    }
  }

  for (const meta of metas) {
    for (const locale of locales) {
      const text = texts.find(
        (candidate) =>
          candidate.slug === meta.slug && candidate.locale === locale,
      );
      if (!text) {
        problems.push(
          `Project "${meta.slug}": missing "${locale}" translation`,
        );
      } else if (text.body.trim() === '') {
        problems.push(
          `Project "${meta.slug}" ("${locale}"): description is empty`,
        );
      }
    }
  }

  return problems;
}

function toLink(input: ProjectLinkInput, locale: Locale): ProjectLink {
  return {
    ...input,
    label: t(locale, `linkType.${input.type}` as DictionaryKey),
  };
}

function toProject(
  meta: ProjectMeta,
  text: ProjectText,
  award: ProjectAward | undefined,
): Project {
  return {
    slug: meta.slug,
    title: text.title,
    subtitle: text.subtitle,
    descriptionHtml: marked.parse(text.body, { async: false }),
    tags: meta.tags,
    primaryLink: toLink(meta.links.primary, text.locale),
    secondaryLinks: (meta.links.secondary ?? []).map((link) =>
      toLink(link, text.locale),
    ),
    cover: {
      kind: 'generated',
      title: text.title,
      tagline: meta.tags.join(' · '),
    },
    ...(award ? { award } : {}),
  };
}

/**
 * Validates all Projects (in every locale, so a half-translated Project fails
 * even when only one locale is rendered) and returns the Featured and More
 * Projects for `locale`, each sorted by `order` ascending.
 *
 * @throws ContentError listing every problem found.
 */
export function buildProjectLists(input: {
  metas: readonly ProjectMeta[];
  texts: readonly ProjectText[];
  locale: Locale;
  /** Award per Project slug, from `buildEvents` in `./events.ts`. */
  awards?: ReadonlyMap<string, ProjectAward>;
}): ProjectLists {
  const { metas, texts, locale, awards } = input;
  const problems = validateProjects(metas, texts);
  if (problems.length > 0) throw new ContentError(problems);

  const projects = [...metas]
    .sort((a, b) => a.order - b.order)
    .map((meta) => {
      const text = texts.find(
        (candidate) =>
          candidate.slug === meta.slug && candidate.locale === locale,
      )!;
      return {
        featured: meta.featured,
        project: toProject(meta, text, awards?.get(meta.slug)),
      };
    });

  return {
    featured: projects.filter((p) => p.featured).map((p) => p.project),
    more: projects.filter((p) => !p.featured).map((p) => p.project),
  };
}
