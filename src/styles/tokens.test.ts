import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../lib/contrast';
import { themeColors } from '../lib/theme';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `missing ${selector}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf('{', start);
  const close = css.indexOf('\n}', open);
  return css.slice(open, close);
}

function colours(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

const required = [
  'background',
  'surface',
  'surface-raised',
  'text',
  'text-muted',
  'border',
  'accent',
  'accent-contrast',
  'focus-ring',
];

const themes = {
  dark: colours(block('@theme')),
  light: colours(block(":root[data-theme='light']")),
};

describe.each(Object.entries(themes))('%s theme tokens', (_name, t) => {
  it('defines every semantic colour token', () => {
    for (const key of required) expect(t[key], key).toBeDefined();
  });
  it('text and text-muted reach 4.5:1 on background and surface', () => {
    for (const fg of ['text', 'text-muted'])
      for (const bg of ['background', 'surface'])
        expect(
          contrastRatio(t[fg], t[bg]),
          `${fg} on ${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
  });
  it('accent reaches 4.5:1 on background and surface (body-size use)', () => {
    for (const bg of ['background', 'surface'])
      expect(contrastRatio(t.accent, t[bg]), bg).toBeGreaterThanOrEqual(4.5);
  });
  it('focus-ring reaches 3:1 on background and surface', () => {
    for (const bg of ['background', 'surface'])
      expect(contrastRatio(t['focus-ring'], t[bg]), bg).toBeGreaterThanOrEqual(
        3,
      );
  });
  it('accent-contrast reaches 4.5:1 on accent', () => {
    expect(
      contrastRatio(t['accent-contrast'], t.accent),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

it('keeps the theme-color meta values equal to the background tokens', () => {
  expect(themeColors.dark).toBe(themes.dark.background);
  expect(themeColors.light).toBe(themes.light.background);
});

it('uses the Hero decision accents', () => {
  expect(themes.dark.accent).toBe('#f2a93b');
  expect(themes.light.accent).toBe('#9a4506');
});

it('uses the L3 light palette chosen by the Owner', () => {
  expect(themes.light).toMatchObject({
    background: '#f6efe2',
    surface: '#ffffff',
    'surface-raised': '#ffffff',
    border: '#a89a80',
    text: '#120f0a',
    'text-muted': '#574f42',
    accent: '#9a4506',
    'accent-contrast': '#ffffff',
    'focus-ring': '#9a4506',
  });
});

it('shows the photo in natural colour in both themes', () => {
  // Owner choice: no duotone in either theme (light L3, dark option 3), so no
  // photo tokens exist and the component applies no filter, blend or overlay.
  expect(css).not.toMatch(/--photo-|--color-photo-/);
  const photo = readFileSync(
    new URL('../components/ProfilePhoto.astro', import.meta.url),
    'utf8',
  );
  expect(photo).not.toMatch(/filter|mix-blend-mode|::before|::after|<style>/);
  expect(block(":root[data-theme='light']")).toMatch(
    /--dither-opacity:\s*0\.12/,
  );
  expect(css).toMatch(/--dither-opacity:\s*0\.14/);
});
