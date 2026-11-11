import type { Locale } from './locale';

export const en = {
  'home.comingSoon': 'Portfolio coming soon.',
  'meta.description': 'Portfolio of Alfonso Ramos Rojas.',
  'language.switchLabel': 'Language',
  'language.en.name': 'English',
  'language.es.name': 'Español',
  'language.en.short': 'EN',
  'language.es.short': 'ES',
} as const;

export type DictionaryKey = keyof typeof en;
export type Dictionary = Record<DictionaryKey, string>;

// Typed against the keys of `en`: a missing or extra key fails `pnpm build`.
export const es: Dictionary = {
  'home.comingSoon': 'Portfolio próximamente.',
  'meta.description': 'Portfolio de Alfonso Ramos Rojas.',
  'language.en.name': 'English',
  'language.es.name': 'Español',
  'language.en.short': 'EN',
  'language.es.short': 'ES',
  'language.switchLabel': 'Idioma',
};

export const dictionaries: Record<Locale, Dictionary> = { en, es };
