/**
 * The "AR" icon, drawn once with satori (the letters become paths, so no font
 * is needed where the icon is shown) and reused for the SVG favicon and the
 * PNG fallbacks. Colours come from tokens.css.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { loadDarkTokens, loadFonts } from './og';

const VIEWBOX = 64;

/** Accent colour of the light theme (second `--color-accent` in tokens.css). */
function lightAccent(): string {
  const css = readFileSync(
    join(process.cwd(), 'src/styles/tokens.css'),
    'utf8',
  );
  const light = css.slice(css.indexOf("data-theme='light'"));
  const match = light.match(/--color-accent:\s*(#[0-9a-fA-F]{6})/);
  if (!match) throw new Error('tokens.css: light --color-accent not found');
  return match[1]!;
}

/** Letters as SVG paths, black, on a 64 x 64 canvas. */
async function lettersSvg(): Promise<string> {
  const fraunces = loadFonts().find((font) => font.name === 'Fraunces')!;
  return satori(
    {
      type: 'div',
      props: {
        style: {
          width: VIEWBOX,
          height: VIEWBOX,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Fraunces',
          fontWeight: 600,
          fontSize: 30,
          color: 'black',
        },
        children: 'AR',
      },
    } as never,
    { width: VIEWBOX, height: VIEWBOX, fonts: [fraunces] },
  );
}

/** Pulls the `<g>` with the letter paths out of satori's output. */
function glyphs(svg: string): string {
  return svg.match(/<g>.*<\/g>/s)![0];
}

/** Transparent SVG; the letters follow the light/dark colour scheme. */
export async function renderIconSvg(): Promise<string> {
  const dark = loadDarkTokens();
  const body = glyphs(await lettersSvg()).replaceAll(
    'fill="black"',
    'class="ar"',
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">` +
    `<style>.ar{fill:${lightAccent()}}@media (prefers-color-scheme: dark){.ar{fill:${dark.accent}}}</style>` +
    `${body}</svg>`
  );
}

/** Square PNG: accent letters on the dark background. */
export async function renderIconPng(size: number): Promise<Buffer> {
  const dark = loadDarkTokens();
  const body = glyphs(await lettersSvg()).replaceAll(
    'fill="black"',
    `fill="${dark.accent}"`,
  );
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">` +
    `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="${dark.background}"/>${body}</svg>`;
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } })
    .render()
    .asPng();
}
