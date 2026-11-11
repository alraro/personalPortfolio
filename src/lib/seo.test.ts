import { describe, expect, it } from 'vitest';
import { t } from '../i18n';
import { buildPersonJsonLd } from './seo';

describe('meta descriptions', () => {
  it('fit in 155 characters in both languages', () => {
    for (const locale of ['en', 'es'] as const) {
      const description = t(locale, 'meta.description');
      expect(description.length).toBeLessThanOrEqual(155);
      expect(description.length).toBeGreaterThan(100);
    }
  });
});

describe('buildPersonJsonLd', () => {
  const person = buildPersonJsonLd({
    headline: 'Software engineering student',
    image: 'https://alfonsoramos.dev/_astro/photo.jpg',
  });

  it('describes the Owner as a schema.org Person', () => {
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Alfonso Ramos Rojas');
    expect(person.url).toBe('https://alfonsoramos.dev/');
    expect(person.jobTitle).toBe('Software engineering student');
    expect(person.image).toBe('https://alfonsoramos.dev/_astro/photo.jpg');
  });

  it('lists both affiliations and both profiles', () => {
    expect(person.affiliation).toEqual([
      {
        '@type': 'Organization',
        name: 'University of Málaga',
        url: 'https://www.uma.es/',
      },
      {
        '@type': 'Organization',
        name: 'Mobilenet',
        url: 'https://mobilenet.uma.es/',
      },
    ]);
    expect(person.sameAs).toEqual([
      'https://github.com/alraro',
      'https://www.linkedin.com/in/alfonso-ramos-rojas',
    ]);
    expect(person.knowsLanguage).toEqual(['es', 'en']);
  });

  it('never includes the email address', () => {
    expect(JSON.stringify(person)).not.toMatch(/@alfonsoramos|mailto|email/i);
  });
});
