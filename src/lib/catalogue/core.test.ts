import { describe, expect, it } from 'vitest';
import {
  ContentError,
  buildProjectLists,
  type ProjectMeta,
  type ProjectText,
} from './core';

function meta(slug: string, overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return {
    slug,
    order: 1,
    featured: true,
    tags: ['C'],
    links: {
      primary: { type: 'repository', url: `https://example.com/${slug}` },
    },
    ...overrides,
  };
}

function text(
  slug: string,
  locale: 'en' | 'es',
  overrides: Partial<ProjectText> = {},
): ProjectText {
  return {
    slug,
    locale,
    title: `${slug} ${locale}`,
    subtitle: `Subtitle ${locale}`,
    body: `Long **description** ${locale}.`,
    ...overrides,
  };
}

function both(slug: string): ProjectText[] {
  return [text(slug, 'en'), text(slug, 'es')];
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

describe('buildProjectLists', () => {
  it('splits Featured Projects from More Projects', () => {
    const lists = buildProjectLists({
      metas: [
        meta('a', { order: 1, featured: true }),
        meta('b', { order: 2, featured: false }),
      ],
      texts: [...both('a'), ...both('b')],
      locale: 'en',
    });
    expect(lists.featured.map((p) => p.slug)).toEqual(['a']);
    expect(lists.more.map((p) => p.slug)).toEqual(['b']);
  });

  it('sorts each list by order ascending, whatever the input order', () => {
    const lists = buildProjectLists({
      metas: [
        meta('c', { order: 30 }),
        meta('a', { order: 10 }),
        meta('b', { order: 20 }),
        meta('y', { order: 9, featured: false }),
        meta('x', { order: 2, featured: false }),
      ],
      texts: ['a', 'b', 'c', 'x', 'y'].flatMap(both),
      locale: 'en',
    });
    expect(lists.featured.map((p) => p.slug)).toEqual(['a', 'b', 'c']);
    expect(lists.more.map((p) => p.slug)).toEqual(['x', 'y']);
  });

  it('uses the localized texts of the requested locale', () => {
    const input = { metas: [meta('a')], texts: both('a') };
    const en = buildProjectLists({ ...input, locale: 'en' }).featured[0]!;
    const es = buildProjectLists({ ...input, locale: 'es' }).featured[0]!;
    expect(en.title).toBe('a en');
    expect(es.subtitle).toBe('Subtitle es');
  });

  it('renders the description Markdown to HTML', () => {
    const [project] = buildProjectLists({
      metas: [meta('a')],
      texts: both('a'),
      locale: 'en',
    }).featured;
    expect(project!.descriptionHtml).toContain('<strong>description</strong>');
  });

  it('builds the generated cover tagline from the tags', () => {
    const [project] = buildProjectLists({
      metas: [meta('a', { tags: ['C', 'Ray tracing', '42'] })],
      texts: both('a'),
      locale: 'en',
    }).featured;
    expect(project!.cover).toEqual({
      kind: 'generated',
      title: 'a en',
      tagline: 'C · Ray tracing · 42',
    });
  });

  it('labels links with the localized link-type name', () => {
    const metas = [
      meta('a', {
        links: {
          primary: { type: 'repository', url: 'https://github.com/x/a' },
          secondary: [{ type: 'demo', url: 'https://demo.example.com' }],
        },
      }),
    ];
    const pick = (locale: 'en' | 'es') =>
      buildProjectLists({ metas, texts: both('a'), locale }).featured[0]!;
    expect(pick('en').primaryLink.label).toBe('Repository');
    expect(pick('es').primaryLink.label).toBe('Repositorio');
    expect(pick('es').secondaryLinks).toEqual([
      { type: 'demo', url: 'https://demo.example.com', label: 'Demo' },
    ]);
    expect(
      buildProjectLists({
        metas: [meta('a')],
        texts: both('a'),
        locale: 'en',
      }).featured[0]!.secondaryLinks,
    ).toEqual([]);
  });

  it('throws when two Projects share an order, naming both slugs', () => {
    const problems = problemsOf(() =>
      buildProjectLists({
        metas: [meta('a', { order: 3 }), meta('b', { order: 3 })],
        texts: [...both('a'), ...both('b')],
        locale: 'en',
      }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('"a"');
    expect(problems[0]).toContain('"b"');
    expect(problems[0]).toContain('order');
  });

  it('throws when a translation is missing, naming Project and locale', () => {
    const problems = problemsOf(() =>
      buildProjectLists({
        metas: [meta('minirt')],
        texts: [text('minirt', 'en')],
        locale: 'en',
      }),
    );
    expect(problems).toEqual(['Project "minirt": missing "es" translation']);
  });

  it('throws when a description is empty or blank', () => {
    const problems = problemsOf(() =>
      buildProjectLists({
        metas: [meta('a')],
        texts: [text('a', 'en', { body: '  \n ' }), text('a', 'es')],
        locale: 'en',
      }),
    );
    expect(problems).toEqual(['Project "a" ("en"): description is empty']);
  });

  it('throws when texts exist for a Project without metadata', () => {
    const problems = problemsOf(() =>
      buildProjectLists({ metas: [], texts: both('ghost'), locale: 'en' }),
    );
    expect(problems).toEqual(['Project "ghost": missing metadata file']);
  });

  it('throws when a slug is not lowercase kebab-case', () => {
    const problems = problemsOf(() =>
      buildProjectLists({
        metas: [meta('Mini_RT')],
        texts: both('Mini_RT'),
        locale: 'en',
      }),
    );
    expect(problems[0]).toContain('"Mini_RT"');
    expect(problems[0]).toContain('kebab-case');
  });

  it('reports every problem together, not just the first', () => {
    let error: unknown;
    try {
      buildProjectLists({
        metas: [meta('a', { order: 1 }), meta('b', { order: 1 })],
        texts: [
          text('a', 'en'),
          text('b', 'en'),
          text('b', 'es', { body: '' }),
        ],
        locale: 'en',
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(ContentError);
    const { problems, message } = error as ContentError;
    expect(problems).toHaveLength(3);
    expect(problems.join('\n')).toContain(
      'Project "a": missing "es" translation',
    );
    expect(problems.join('\n')).toContain(
      'Project "b" ("es"): description is empty',
    );
    for (const problem of problems) expect(message).toContain(problem);
  });

  it('validates every locale even when only one is requested', () => {
    const problems = problemsOf(() =>
      buildProjectLists({
        metas: [meta('a')],
        texts: [text('a', 'en')],
        locale: 'en',
      }),
    );
    expect(problems).toHaveLength(1);
  });
});
