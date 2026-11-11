import { describe, expect, it } from 'vitest';
import { formatYear } from './format-year';

describe('formatYear', () => {
  it('returns the four-digit year of an ISO date', () => {
    expect(formatYear('2026-03-14')).toBe('2026');
  });

  it('keeps the year of a date at the very start of the year', () => {
    expect(formatYear('2025-01-01')).toBe('2025');
  });
});
