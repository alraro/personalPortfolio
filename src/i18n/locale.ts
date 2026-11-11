export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const LANG_STORAGE_KEY = 'lang';

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'es';
}

/**
 * Decides the target locale for the root page.
 * 1. A stored choice of exactly `en` or `es` wins.
 * 2. Otherwise the first browser language whose primary subtag is `es` or `en`.
 * 3. Otherwise `en`. Never uses IP or location.
 */
export function decideLocale(
  stored: string | null,
  browserLanguages: readonly string[],
): Locale {
  if (isLocale(stored)) return stored;
  for (const language of browserLanguages) {
    const primary = language.toLowerCase().split('-')[0] ?? '';
    if (primary === 'es' || primary === 'en') return primary;
  }
  return defaultLocale;
}

/** Same page in another locale: swaps the first path segment (`/en/x/` -> `/es/x/`). */
export function switchLocalePath(pathname: string, target: Locale): string {
  return pathname.replace(/^\/(?:en|es)(?=\/|$)/, `/${target}`);
}
