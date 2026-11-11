import { describe, expect, it } from 'vitest';
import {
  ContentError,
  buildProjectLists,
  type ImageAsset,
  type ProjectMeta,
  type ProjectText,
} from './core';

const image: ImageAsset = {
  src: '/_astro/a.hash.png',
  width: 800,
  height: 500,
  format: 'png',
};
const poster: ImageAsset = {
  src: '/_astro/p.hash.png',
  width: 800,
  height: 500,
  format: 'png',
};
const MP4 = '/media/projects/a/demo.mp4';
const WEBM = '/media/projects/a/demo.webm';

function meta(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return {
    slug: 'a',
    order: 1,
    featured: true,
    tags: ['C'],
    links: { primary: { type: 'repository', url: 'https://example.com/a' } },
    ...overrides,
  };
}

function texts(
  en: Partial<ProjectText> = {},
  es: Partial<ProjectText> = {},
): ProjectText[] {
  const base = { slug: 'a', title: 'A', subtitle: 'S', body: 'Body' };
  return [
    { ...base, locale: 'en', ...en },
    { ...base, locale: 'es', ...es },
  ];
}

function build(
  m: ProjectMeta,
  t: ProjectText[],
  fileSize: (path: string) => number | undefined = () => 1000,
) {
  return buildProjectLists({ metas: [m], texts: t, locale: 'en', fileSize });
}

function problemsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  throw new Error('expected a ContentError');
}

const alt = { mediaAlt: 'Alt text' };

describe('Project Media', () => {
  it('keeps the generated cover when there is no media', () => {
    expect(build(meta(), texts()).featured[0]!.media).toEqual({
      kind: 'generated',
      title: 'A',
      tagline: 'C',
    });
  });

  it('builds an image view model with the localized alt', () => {
    const lists = build(
      meta({ media: { kind: 'image', src: image } }),
      texts({ mediaAlt: 'English alt' }, { mediaAlt: 'Texto alternativo' }),
    );
    expect(lists.featured[0]!.media).toEqual({
      kind: 'image',
      image,
      alt: 'English alt',
    });
  });

  it('builds a video view model with optional webm', () => {
    const lists = build(
      meta({ media: { kind: 'video', mp4: MP4, webm: WEBM, poster } }),
      texts(alt, alt),
    );
    expect(lists.featured[0]!.media).toEqual({
      kind: 'video',
      mp4: MP4,
      webm: WEBM,
      poster,
      alt: 'Alt text',
    });
    const noWebm = build(
      meta({ media: { kind: 'video', mp4: MP4, poster } }),
      texts(alt, alt),
    );
    expect(noWebm.featured[0]!.media).toEqual({
      kind: 'video',
      mp4: MP4,
      poster,
      alt: 'Alt text',
    });
  });

  it('errors when a video has no poster', () => {
    const problems = problemsOf(() =>
      build(meta({ media: { kind: 'video', mp4: MP4 } }), texts(alt, alt)),
    );
    expect(problems).toEqual([expect.stringContaining('poster')]);
  });

  it('errors when media lacks mediaAlt in one locale', () => {
    const problems = problemsOf(() =>
      build(meta({ media: { kind: 'image', src: image } }), texts(alt, {})),
    );
    expect(problems).toEqual([
      expect.stringMatching(/"es".*mediaAlt|mediaAlt.*"es"/),
    ]);
  });

  it('errors when mediaAlt exists without media', () => {
    const problems = problemsOf(() => build(meta(), texts(alt, {})));
    expect(problems).toEqual([
      expect.stringMatching(/"en".*mediaAlt.*without/),
    ]);
  });

  it('errors when a video is larger than 4 MB, naming the file', () => {
    const problems = problemsOf(() =>
      build(
        meta({ media: { kind: 'video', mp4: MP4, poster } }),
        texts(alt, alt),
        () => 4 * 1024 * 1024 + 1,
      ),
    );
    expect(problems).toEqual([expect.stringContaining(MP4)]);
    expect(problems[0]).toMatch(/4 MB/);
  });

  it('accepts a video of exactly 4 MB', () => {
    expect(() =>
      build(
        meta({ media: { kind: 'video', mp4: MP4, poster } }),
        texts(alt, alt),
        () => 4 * 1024 * 1024,
      ),
    ).not.toThrow();
  });

  it('errors when a video file does not exist', () => {
    const problems = problemsOf(() =>
      build(
        meta({ media: { kind: 'video', mp4: MP4, webm: WEBM, poster } }),
        texts(alt, alt),
        (path) => (path === WEBM ? undefined : 10),
      ),
    );
    expect(problems).toEqual([expect.stringContaining(WEBM)]);
  });

  it('errors on a wrong path prefix', () => {
    const problems = problemsOf(() =>
      build(
        meta({
          media: { kind: 'video', mp4: '/media/projects/other/x.mp4', poster },
        }),
        texts(alt, alt),
      ),
    );
    expect(problems).toEqual([expect.stringContaining('/media/projects/a/')]);
  });
});
