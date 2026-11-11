import { describe, expect, it } from 'vitest';
import { switchLocalePath } from './locale';

describe('switchLocalePath', () => {
  it('swaps the first path segment', () => {
    expect(switchLocalePath('/en/x/', 'es')).toBe('/es/x/');
    expect(switchLocalePath('/es/', 'en')).toBe('/en/');
  });
});
