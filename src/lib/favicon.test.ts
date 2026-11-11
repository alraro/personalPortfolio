import { describe, expect, it } from 'vitest';
import { renderIconPng, renderIconSvg } from './favicon';

describe('renderIconSvg', () => {
  it('adapts to light and dark tabs with a prefers-color-scheme block', async () => {
    const svg = await renderIconSvg();
    expect(svg).toContain('<style>');
    expect(svg).toContain('prefers-color-scheme: dark');
    expect(svg).toMatch(/viewBox="0 0 64 64"/);
  });
});

describe('renderIconPng', () => {
  it.each([32, 180])('renders a %ipx square PNG', async (size) => {
    const png = await renderIconPng(size);
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
  });
});
