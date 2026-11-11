/**
 * Build-time image rendering with satori (JSX-less element tree to SVG) and
 * resvg (SVG to PNG). Fonts come from the installed Fontsource packages (static
 * WOFF files, since satori cannot read WOFF2 or variable fonts); nothing is
 * fetched from the network.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { SITE_URL } from './seo';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface DarkTokens {
  background: string;
  text: string;
  textMuted: string;
  accent: string;
}

/**
 * Reads the dark theme colours from tokens.css. The dark values are the
 * first declarations in the file (the `@theme` block); the light override
 * comes later, so the first match wins.
 */
export function readDarkTokens(css: string): DarkTokens {
  const pick = (name: string) => {
    const match = css.match(
      new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`),
    );
    if (!match) throw new Error(`tokens.css: --color-${name} not found`);
    return match[1]!;
  };
  return {
    background: pick('background'),
    text: pick('text'),
    textMuted: pick('text-muted'),
    accent: pick('accent'),
  };
}

export function loadDarkTokens(): DarkTokens {
  return readDarkTokens(
    readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8'),
  );
}

type FontSpec = {
  name: string;
  data: Buffer;
  weight: 400 | 600;
  style: 'normal';
};

let fonts: FontSpec[] | undefined;
export function loadFonts(): FontSpec[] {
  fonts ??= (
    [
      ['Fraunces', 'fraunces', 600],
      ['Inter', 'inter', 400],
      ['JetBrains Mono', 'jetbrains-mono', 400],
    ] as const
  ).map(([name, pkg, weight]) => ({
    name,
    weight,
    style: 'normal' as const,
    data: readFileSync(
      join(
        process.cwd(),
        `node_modules/@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff`,
      ),
    ),
  }));
  return fonts;
}

type Node = {
  type: string;
  props: { style?: Record<string, unknown>; children?: unknown };
};
const el = (
  style: Record<string, unknown>,
  children?: unknown,
  type = 'div',
): Node => ({ type, props: { style, children } });

export interface OgInput {
  name: string;
  headline: string;
}

/** 1200x630 PNG for one locale, in the dark theme. */
export async function renderOgImage({
  name,
  headline,
}: OgInput): Promise<Buffer> {
  const tokens = loadDarkTokens();
  const tree = el(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 96,
      backgroundColor: tokens.background,
      color: tokens.text,
    },
    [
      el({ width: 120, height: 8, backgroundColor: tokens.accent }),
      el(
        {
          fontFamily: 'Fraunces',
          fontWeight: 600,
          fontSize: 104,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          marginTop: 48,
        },
        name,
      ),
      el(
        {
          fontFamily: 'Inter',
          fontSize: 40,
          lineHeight: 1.3,
          color: tokens.textMuted,
          marginTop: 32,
          maxWidth: 900,
        },
        headline,
      ),
      el(
        {
          fontFamily: 'JetBrains Mono',
          fontSize: 32,
          color: tokens.text,
          marginTop: 72,
        },
        new URL(SITE_URL).host,
      ),
    ],
  );
  const svg = await satori(tree as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: loadFonts(),
  });
  return new Resvg(svg).render().asPng();
}
