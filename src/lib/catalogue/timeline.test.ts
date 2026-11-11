import { describe, expect, it } from 'vitest';
import { ContentError } from './core';
import {
  buildEducationList,
  buildExperienceList,
  type EducationMeta,
  type EducationText,
  type ExperienceMeta,
  type ExperienceText,
} from './timeline';

function exp(slug: string, o: Partial<ExperienceMeta> = {}): ExperienceMeta {
  return {
    slug,
    organization: `Org ${slug}`,
    location: 'Málaga, Spain',
    start: '2020-01',
    end: null,
    ...o,
  };
}
function expText(
  slug: string,
  locale: 'en' | 'es',
  o: Partial<ExperienceText> = {},
): ExperienceText {
  return {
    slug,
    locale,
    role: `Role ${locale}`,
    body: `Did **things**.`,
    ...o,
  };
}
function expBoth(slug: string): ExperienceText[] {
  return [expText(slug, 'en'), expText(slug, 'es')];
}

describe('buildExperienceList', () => {
  it('sorts current first, then end descending, then start descending', () => {
    const metas = [
      exp('old', { start: '2015-01', end: '2016-01' }),
      exp('cur-early', { start: '2019-01', end: null }),
      exp('recent', { start: '2017-01', end: '2022-06' }),
      exp('cur-late', { start: '2021-01', end: null }),
      exp('recent-later-start', { start: '2018-01', end: '2022-06' }),
    ];
    const texts = metas.flatMap((m) => expBoth(m.slug));
    const list = buildExperienceList({ metas, texts, locale: 'en' });
    expect(list.map((e) => e.slug)).toEqual([
      'cur-late',
      'cur-early',
      'recent-later-start',
      'recent',
      'old',
    ]);
  });

  it('formats date ranges in English with "Present"', () => {
    const metas = [exp('a', { start: '2022-09', end: null })];
    const [item] = buildExperienceList({
      metas,
      texts: expBoth('a'),
      locale: 'en',
    });
    expect(item!.dateRange).toBe('Sep 2022 – Present');
  });

  it('formats date ranges in Spanish with "actualidad"', () => {
    const metas = [exp('a', { start: '2022-09', end: null })];
    const [item] = buildExperienceList({
      metas,
      texts: expBoth('a'),
      locale: 'es',
    });
    expect(item!.dateRange).toBe('sept 2022 – actualidad');
  });

  it('formats a closed range', () => {
    const metas = [exp('a', { start: '2020-01', end: '2021-03' })];
    const [item] = buildExperienceList({
      metas,
      texts: expBoth('a'),
      locale: 'en',
    });
    expect(item!.dateRange).toBe('Jan 2020 – Mar 2021');
  });

  it('errors when end is before start', () => {
    const metas = [exp('a', { start: '2022-05', end: '2022-01' })];
    expect(() =>
      buildExperienceList({ metas, texts: expBoth('a'), locale: 'en' }),
    ).toThrow(/Experience "a".*"end".*before.*"start"/);
  });

  it('errors on a malformed date', () => {
    const metas = [exp('a', { start: '2022-13' })];
    expect(() =>
      buildExperienceList({ metas, texts: expBoth('a'), locale: 'en' }),
    ).toThrow(/Experience "a".*"start".*YYYY-MM/);
  });

  it('errors on a missing translation', () => {
    const metas = [exp('a')];
    expect(() =>
      buildExperienceList({
        metas,
        texts: [expText('a', 'en')],
        locale: 'en',
      }),
    ).toThrow(/Experience "a": missing "es" translation/);
  });

  it('errors on an empty description (required for Experience)', () => {
    const metas = [exp('a')];
    expect(() =>
      buildExperienceList({
        metas,
        texts: [expText('a', 'en', { body: ' ' }), expText('a', 'es')],
        locale: 'en',
      }),
    ).toThrow(/Experience "a" \("en"\): description is empty/);
  });

  it('aggregates every problem into one ContentError', () => {
    const metas = [exp('a', { start: '2022-05', end: '2022-01' }), exp('b')];
    try {
      buildExperienceList({ metas, texts: expBoth('a'), locale: 'en' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      expect((error as ContentError).problems).toHaveLength(3);
    }
  });

  it('uses the localized organization override when present', () => {
    const metas = [exp('a', { organization: 'Shared Name' })];
    const texts = [
      expText('a', 'en'),
      expText('a', 'es', { organization: 'Nombre local' }),
    ];
    const es = buildExperienceList({ metas, texts, locale: 'es' });
    const en = buildExperienceList({ metas, texts, locale: 'en' });
    expect(es[0]!.organization).toBe('Nombre local');
    expect(en[0]!.organization).toBe('Shared Name');
  });
});

describe('buildEducationList', () => {
  const meta = (
    slug: string,
    o: Partial<EducationMeta> = {},
  ): EducationMeta => ({
    slug,
    institution: `Inst ${slug}`,
    location: 'Málaga',
    start: '2020-01',
    end: null,
    ...o,
  });
  const text = (
    slug: string,
    locale: 'en' | 'es',
    o: Partial<EducationText> = {},
  ): EducationText => ({
    slug,
    locale,
    programme: `Prog ${locale}`,
    body: '',
    ...o,
  });

  it('allows an empty description and renders an empty string', () => {
    const [item] = buildEducationList({
      metas: [meta('a')],
      texts: [text('a', 'en'), text('a', 'es')],
      locale: 'en',
    });
    expect(item!.descriptionHtml).toBe('');
    expect(item!.programme).toBe('Prog en');
  });

  it('sorts like Experience and applies the institution override', () => {
    const metas = [
      meta('x', { start: '2018-01', end: '2020-01' }),
      meta('y', { start: '2021-01' }),
    ];
    const texts = [
      text('x', 'en'),
      text('x', 'es', { institution: 'Universidad' }),
      text('y', 'en'),
      text('y', 'es'),
    ];
    const list = buildEducationList({ metas, texts, locale: 'es' });
    expect(list.map((e) => e.slug)).toEqual(['y', 'x']);
    expect(list[1]!.organization).toBe('Universidad');
  });

  it('errors on a missing translation', () => {
    expect(() =>
      buildEducationList({
        metas: [meta('a')],
        texts: [text('a', 'en')],
        locale: 'en',
      }),
    ).toThrow(/Education "a": missing "es" translation/);
  });
});
