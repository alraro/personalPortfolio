import { describe, expect, it } from 'vitest';
import { en, es } from './dictionaries';
import { t } from './index';

describe('t', () => {
  it('returns the string for the locale', () => {
    expect(t('en', 'language.switchLabel')).toBe('Language');
    expect(t('es', 'language.switchLabel')).toBe('Idioma');
  });

  it('has the same keys in both dictionaries', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });
});
