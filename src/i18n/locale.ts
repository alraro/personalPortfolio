export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Same page in another locale: swaps the first path segment (`/en/x/` -> `/es/x/`). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const prefix = new RegExp(`^/(?:${locales.join('|')})(?=/|$)`);
  return pathname.replace(prefix, `/${target}`);
}
