import type { Locale } from '../i18n/locale';

/** Folder (under `public/`) that holds the CV PDFs, as a URL path. */
export const CV_DIR = '/cv';

/**
 * Public URL of the CV for `locale` if `files` (the file names present in
 * the CV folder) contains `cv-<locale>.pdf`; otherwise null.
 */
export function getCv(locale: Locale, files: readonly string[]): string | null {
  const name = `cv-${locale}.pdf`;
  return files.includes(name) ? `${CV_DIR}/${name}` : null;
}
