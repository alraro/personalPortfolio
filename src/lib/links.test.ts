import { describe, expect, it } from 'vitest';
import { isExternalHref } from './links';

const site = 'https://alfonsoramos.dev';

describe('isExternalHref', () => {
  it('treats another origin as external', () => {
    expect(isExternalHref('https://github.com/alraro', site)).toBe(true);
    expect(isExternalHref('http://alfonsoramos.dev/', site)).toBe(true);
  });
  it('treats paths, anchors and the same origin as internal', () => {
    expect(isExternalHref('/en/', site)).toBe(false);
    expect(isExternalHref('#projects', site)).toBe(false);
    expect(isExternalHref('https://alfonsoramos.dev/es/', site)).toBe(false);
  });
  it('treats protocol-relative URLs to another host as external', () => {
    expect(isExternalHref('//example.com/x', site)).toBe(true);
  });
  it('treats mailto: and tel: as internal (no new tab)', () => {
    expect(isExternalHref('mailto:a@b.dev', site)).toBe(false);
    expect(isExternalHref('tel:+34123', site)).toBe(false);
  });
});
