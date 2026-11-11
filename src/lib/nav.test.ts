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

  it('shows Projects when only More projects exist, linking to it', () => {
    const items = buildNavItems({ about: true, moreProjects: true });
    expect(items).toEqual([
      { id: 'about', labelKey: 'nav.about' },
      { id: 'more-projects', labelKey: 'nav.projects' },
    ]);
  });

  it('links Projects to Featured when both exist', () => {
    const items = buildNavItems({ projects: true, moreProjects: true });
    expect(items).toEqual([{ id: 'projects', labelKey: 'nav.projects' }]);
  });

  it('hides Projects when neither exists', () => {
    expect(buildNavItems({ about: true, moreProjects: false })).toEqual([
      { id: 'about', labelKey: 'nav.about' },
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
