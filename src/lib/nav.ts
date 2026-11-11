import type { DictionaryKey } from '../i18n';

export type NavSection =
  'about' | 'experience' | 'projects' | 'events' | 'contact';

export interface NavItem {
  /** Id of the element the item points to (`#<id>`). */
  id: NavSection;
  labelKey: DictionaryKey;
}

const ALL_ITEMS: NavItem[] = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'events', labelKey: 'nav.events' },
  { id: 'contact', labelKey: 'nav.contact' },
];

/**
 * Nav items for the sections the page actually renders, in page order.
 * "More projects" has no item.
 */
export function buildNavItems(
  present: Partial<Record<NavSection, boolean>>,
): NavItem[] {
  return ALL_ITEMS.filter((item) => present[item.id] === true);
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
