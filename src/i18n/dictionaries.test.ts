import { describe, expect, it } from 'vitest';
import { t } from './index';

describe('t', () => {
  it('returns the string for the locale', () => {
    expect(t('en', 'home.comingSoon')).toBe('Portfolio coming soon.');
    expect(t('es', 'home.comingSoon')).toBe('Portfolio próximamente.');
  });
});
