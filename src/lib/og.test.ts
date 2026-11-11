import { describe, expect, it } from 'vitest';
import { readDarkTokens, renderOgImage } from './og';

describe('readDarkTokens', () => {
  it('reads the dark theme colours that come first in the token file', () => {
    const css = `@theme { --color-background: #0d0c0a; --color-text: #f4efe6; --color-text-muted: #a39b8c; --color-accent: #f2a93b; }
:root[data-theme='light'] { --color-background: #faf6ef; --color-accent: #b45309; }`;
    expect(readDarkTokens(css)).toEqual({
      background: '#0d0c0a',
      text: '#f4efe6',
      textMuted: '#a39b8c',
      accent: '#f2a93b',
    });
  });
});

describe('renderOgImage', () => {
  it('renders a 1200x630 PNG', async () => {
    const png = await renderOgImage({
      name: 'Alfonso Ramos Rojas',
      headline: 'Estudiante de Ingeniería del Software',
    });
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
