import { dictionaries, type DictionaryKey } from './dictionaries';
import type { Locale } from './locale';

export * from './locale';
export type { DictionaryKey } from './dictionaries';

export function t(locale: Locale, key: DictionaryKey): string {
  return dictionaries[locale][key];
}
