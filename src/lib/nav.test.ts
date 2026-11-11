import { describe, expect, it } from 'vitest';
import { buildNavItems, initials } from './nav';

describe('buildNavItems', () => {
  it('lists every present section in the fixed order', () => {
    const items = buildNavItems({
      about: true,
      experience: true,
      projects: true,
      events: true,
      contact: true,
    });
    expect(items.map((item) => item.id)).toEqual([
      'about',
      'experience',
      'projects',
      'events',
      'contact',
    ]);
    expect(items.map((item) => item.labelKey)).toEqual([
      'nav.about',
      'nav.experience',
      'nav.projects',
      'nav.events',
      'nav.contact',
    ]);
  });

  it('omits the sections that are not rendered', () => {
    const items = buildNavItems({
      about: true,
      experience: false,
      projects: true,
      events: false,
      contact: true,
    });
    expect(items.map((item) => item.id)).toEqual([
      'about',
      'projects',
      'contact',
    ]);
  });

  it('treats a missing key as an absent section', () => {
    expect(buildNavItems({ contact: true }).map((item) => item.id)).toEqual([
      'contact',
    ]);
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Alfonso Ramos Rojas')).toBe('AR');
  });

  it('copes with a single word', () => {
    expect(initials('Alfonso')).toBe('A');
  });
});
