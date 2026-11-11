import { describe, expect, it } from 'vitest';
import {
  ContentError,
  buildProjectLists,
  type ProjectMeta,
  type ProjectText,
} from './core';
import { buildEvents, type EventMeta, type EventText } from './events';

const projects = [
  { slug: 'alpha', title: 'Alpha' },
  { slug: 'beta', title: 'Beta' },
];

function meta(slug: string, overrides: Partial<EventMeta> = {}): EventMeta {
  return { slug, date: '2025-07', role: 'participant', ...overrides };
}

function text(
  slug: string,
  locale: 'en' | 'es',
  overrides: Partial<EventText> = {},
): EventText {
  return { slug, locale, name: `${slug} ${locale}`, body: '', ...overrides };
}

function both(slug: string, award?: [string, string]): EventText[] {
  return [
    text(slug, 'en', award ? { award: award[0] } : {}),
    text(slug, 'es', award ? { award: award[1] } : {}),
  ];
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

function projectInputs(): { metas: ProjectMeta[]; texts: ProjectText[] } {
  const slugs = ['alpha', 'beta'];
  return {
    metas: slugs.map((slug, i) => ({
      slug,
      order: i + 1,
      featured: i === 0,
      tags: ['C'],
      links: {
        primary: { type: 'repository', url: `https://example.com/${slug}` },
      },
    })),
    texts: slugs.flatMap((slug) =>
      (['en', 'es'] as const).map((locale) => ({
        slug,
        locale,
        title: slug,
        subtitle: 's',
        body: 'Body',
      })),
    ),
  };
}

describe('buildEvents', () => {
  it('sorts by date descending, with the day when given', () => {
    const { events } = buildEvents({
      metas: [
        meta('old', { date: '2024-01' }),
        meta('new', { date: '2025-11-03' }),
        meta('mid', { date: '2025-07' }),
      ],
      texts: [...both('old'), ...both('new'), ...both('mid')],
      projects,
      locale: 'en',
    });
    expect(events.map((e) => e.slug)).toEqual(['new', 'mid', 'old']);
    expect(events.map((e) => e.dateLabel)).toEqual([
      'Nov 3, 2025',
      'Jul 2025',
      'Jan 2024',
    ]);
  });

  it('formats dates and role labels per locale', () => {
    const input = {
      metas: [
        meta('a', { role: 'volunteer' }),
        meta('b', { date: '2025-03', role: 'participant' }),
      ],
      texts: [...both('a'), ...both('b')],
      projects,
    };
    const en = buildEvents({ ...input, locale: 'en' }).events;
    const es = buildEvents({ ...input, locale: 'es' }).events;
    expect(en.map((e) => e.roleLabel)).toEqual(['Volunteer', 'Participant']);
    expect(es.map((e) => e.roleLabel)).toEqual(['Voluntario', 'Participante']);
    expect(en[0]!.dateLabel).toBe('Jul 2025');
    expect(es[0]!.dateLabel).toMatch(/^jul\.? 2025$/);
  });

  it('returns award, url, note and a Project anchor', () => {
    const { events } = buildEvents({
      metas: [
        meta('hack', { url: 'https://example.com/hack', project: 'alpha' }),
      ],
      texts: [
        text('hack', 'en', { award: '2nd place', body: 'A note.\n' }),
        text('hack', 'es', { award: '2º puesto' }),
      ],
      projects,
      locale: 'en',
    });
    expect(events[0]).toMatchObject({
      name: 'hack en',
      award: '2nd place',
      url: 'https://example.com/hack',
      note: 'A note.',
      project: { title: 'Alpha', anchor: '#project-alpha' },
    });
  });

  it('omits optional fields when absent', () => {
    const { events } = buildEvents({
      metas: [meta('plain')],
      texts: both('plain'),
      projects,
      locale: 'en',
    });
    expect(Object.keys(events[0]!).sort()).toEqual([
      'dateLabel',
      'name',
      'roleLabel',
      'slug',
    ]);
  });

  it('errors on a dangling Project reference', () => {
    const problems = problemsOf(() =>
      buildEvents({
        metas: [meta('hack', { project: 'ghost' })],
        texts: both('hack'),
        projects,
        locale: 'en',
      }),
    );
    expect(problems).toEqual([
      'Event "hack": project "ghost" does not match any Project slug',
    ]);
  });

  it('errors when two Events point to the same Project, naming both', () => {
    const problems = problemsOf(() =>
      buildEvents({
        metas: [
          meta('one', { project: 'alpha' }),
          meta('two', { project: 'alpha' }),
        ],
        texts: [...both('one'), ...both('two')],
        projects,
        locale: 'en',
      }),
    );
    expect(problems).toEqual([
      'Events "one" and "two": both point to Project "alpha"',
    ]);
  });

  it('errors when an award is in one locale only', () => {
    const problems = problemsOf(() =>
      buildEvents({
        metas: [meta('hack')],
        texts: [text('hack', 'en', { award: '1st place' }), text('hack', 'es')],
        projects,
        locale: 'es',
      }),
    );
    expect(problems).toEqual([
      'Event "hack": "award" is present in "en" but missing in "es"',
    ]);
  });

  it('aggregates problems: bad date, missing translation, orphan text', () => {
    const problems = problemsOf(() =>
      buildEvents({
        metas: [meta('hack', { date: '2025-13' })],
        texts: [text('hack', 'en'), text('stray', 'en')],
        projects,
        locale: 'en',
      }),
    );
    expect(problems).toHaveLength(3);
  });
});

describe('Award inheritance', () => {
  it('is inherited by the referenced Project, and only by it', () => {
    const { awards } = buildEvents({
      metas: [meta('hack', { project: 'alpha' }), meta('other')],
      texts: [...both('hack', ['2nd place', '2º puesto']), ...both('other')],
      projects,
      locale: 'en',
    });
    const { metas, texts } = projectInputs();
    const lists = buildProjectLists({ metas, texts, locale: 'en', awards });
    expect(lists.featured[0]!.award).toEqual({
      text: '2nd place',
      eventName: 'hack en',
    });
    expect(lists.more[0]!.award).toBeUndefined();
  });

  it('uses the locale of the build', () => {
    const { awards } = buildEvents({
      metas: [meta('hack', { project: 'beta' })],
      texts: both('hack', ['2nd place', '2º puesto']),
      projects,
      locale: 'es',
    });
    const { metas, texts } = projectInputs();
    const lists = buildProjectLists({ metas, texts, locale: 'es', awards });
    expect(lists.more[0]!.award).toEqual({
      text: '2º puesto',
      eventName: 'hack es',
    });
  });
});
