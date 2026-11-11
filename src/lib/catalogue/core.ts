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

/** An optimised image as Astro's `image()` helper resolves it. */
export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  format:
    'svg' | 'avif' | 'png' | 'webp' | 'jpeg' | 'jpg' | 'apng' | 'tiff' | 'gif';
}

/** Media as written in `meta.yaml` (images already resolved by `image()`). */
export type MediaInput =
  | { kind: 'image'; src: ImageAsset }
  | {
      kind: 'video';
      mp4: string;
      webm?: string;
      /** Required; optional here only so a missing poster is reported. */
      poster?: ImageAsset;
    };

/** Largest accepted Media video, in bytes. */
export const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

/** Locale-independent data of one Project (its `meta.yaml`). */
export interface ProjectMeta {
  slug: string;
  order: number;
  featured: boolean;
  tags: string[];
  links: { primary: ProjectLinkInput; secondary?: ProjectLinkInput[] };
  media?: MediaInput;
}

/** Localized data of one Project (its `en.md` or `es.md`). */
export interface ProjectText {
  slug: string;
  locale: Locale;
  title: string;
  subtitle: string;
  /** Alt text of the Project's Media. */
  mediaAlt?: string;
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

export type ProjectMedia =
  | { kind: 'image'; image: ImageAsset; alt: string }
  | {
      kind: 'video';
      mp4: string;
      webm?: string;
      poster: ImageAsset;
      alt: string;
    }
  | GeneratedCover;

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
  media: ProjectMedia;
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

/** Size in bytes of a file under `public/`, or undefined if it is missing. */
export type FileSize = (publicPath: string) => number | undefined;

function validateMedia(
  metas: readonly ProjectMeta[],
  texts: readonly ProjectText[],
  fileSize: FileSize,
): string[] {
  const problems: string[] = [];
  for (const meta of metas) {
    const { media } = meta;
    for (const locale of locales) {
      const alt = texts.find(
        (text) => text.slug === meta.slug && text.locale === locale,
      )?.mediaAlt;
      if (media && (alt === undefined || alt.trim() === '')) {
        problems.push(
          `Project "${meta.slug}" ("${locale}"): "mediaAlt" is required when the Project has media`,
        );
      } else if (!media && alt !== undefined) {
        problems.push(
          `Project "${meta.slug}" ("${locale}"): "mediaAlt" is set without media`,
        );
      }
    }
    if (media?.kind !== 'video') continue;
    if (!media.poster) {
      problems.push(`Project "${meta.slug}": video media needs a "poster"`);
    }
    const prefix = `/media/projects/${meta.slug}/`;
    for (const path of [media.mp4, media.webm]) {
      if (path === undefined) continue;
      if (!path.startsWith(prefix) || path.includes('..')) {
        problems.push(
          `Project "${meta.slug}": video path "${path}" must start with ${prefix}`,
        );
        continue;
      }
      const size = fileSize(path);
      if (size === undefined) {
        problems.push(
          `Project "${meta.slug}": video file "${path}" does not exist under public/`,
        );
      } else if (size > MAX_VIDEO_BYTES) {
        problems.push(
          `Project "${meta.slug}": video file "${path}" is larger than 4 MB`,
        );
      }
    }
  }
  return problems;
}

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

function toMedia(meta: ProjectMeta, text: ProjectText): ProjectMedia {
  const { media } = meta;
  const alt = text.mediaAlt ?? '';
  if (media?.kind === 'image') {
    return { kind: 'image', image: media.src, alt };
  }
  if (media?.kind === 'video') {
    return {
      kind: 'video',
      mp4: media.mp4,
      ...(media.webm !== undefined && { webm: media.webm }),
      poster: media.poster!,
      alt,
    };
  }
  return {
    kind: 'generated',
    title: text.title,
    tagline: meta.tags.join(' \u00b7 '),
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
    media: toMedia(meta, text),
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
  /** Reports video file sizes; the adapter reads them from `public/`. */
  fileSize?: FileSize;
  /** Award per Project slug, from `buildEvents` in `./events.ts`. */
  awards?: ReadonlyMap<string, ProjectAward>;
}): ProjectLists {
  const { metas, texts, locale, fileSize = () => undefined, awards } = input;
  const problems = [
    ...validateProjects(metas, texts),
    ...validateMedia(metas, texts, fileSize),
  ];
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
