import type { DictionaryKey } from '../i18n';

export type NavSection =
  'about' | 'experience' | 'projects' | 'events' | 'contact';

/** Id of the "More projects" section heading. */
export type NavTarget = NavSection | 'more-projects';

export interface NavItem {
  /** Id of the element the item points to (`#<id>`). */
  id: NavTarget;
  labelKey: DictionaryKey;
}

const ALL_ITEMS: { id: NavSection; labelKey: DictionaryKey }[] = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'events', labelKey: 'nav.events' },
  { id: 'contact', labelKey: 'nav.contact' },
];

/**
 * Nav items for the sections the page actually renders, in page order.
 * "More projects" has no item of its own: the Projects item shows when either
 * Featured (`projects`) or More projects exist, and links to whichever renders
 * first.
 */
export function buildNavItems(
  present: Partial<Record<NavSection | 'moreProjects', boolean>>,
): NavItem[] {
  return ALL_ITEMS.filter(
    (item) =>
      present[item.id] === true ||
      (item.id === 'projects' && present.moreProjects === true),
  ).map((item) =>
    item.id === 'projects' && present.projects !== true
      ? { ...item, id: 'more-projects' }
      : item,
  );
}

/** First letter of the first two words, uppercased: "Alfonso Ramos Rojas" -> "AR". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}
