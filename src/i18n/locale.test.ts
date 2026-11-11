import { describe, expect, it } from 'vitest';
import { decideLocale, switchLocalePath } from './locale';

describe('decideLocale', () => {
  it('a stored es choice wins over an en browser', () => {
    expect(decideLocale('es', ['en-US'])).toBe('es');
  });
  it('a stored en choice wins over an es browser', () => {
    expect(decideLocale('en', ['es-ES'])).toBe('en');
  });
  it('ignores a stored garbage value', () => {
    expect(decideLocale('fr', ['es-MX'])).toBe('es');
    expect(decideLocale('ES', ['de'])).toBe('en');
  });
  it('picks es when it is first among supported browser languages', () => {
    expect(decideLocale(null, ['es-ES', 'en'])).toBe('es');
  });
  it('picks en when it comes before es', () => {
    expect(decideLocale(null, ['en-GB', 'es'])).toBe('en');
  });
  it('falls back to en when no language is supported', () => {
    expect(decideLocale(null, ['de-DE', 'en-GB'])).toBe('en');
    expect(decideLocale(null, ['de-DE'])).toBe('en');
  });
  it('skips unsupported languages before a supported one', () => {
    expect(decideLocale(null, ['fr', 'es'])).toBe('es');
  });
  it('falls back to en for an empty list', () => {
    expect(decideLocale(null, [])).toBe('en');
  });
});

describe('switchLocalePath', () => {
  it('swaps the first path segment', () => {
    expect(switchLocalePath('/en/x/', 'es')).toBe('/es/x/');
    expect(switchLocalePath('/es/', 'en')).toBe('/en/');
  });
});
