export type VariantId = 'a' | 'b' | 'c';
export type Theme = 'dark' | 'light';

export interface Palette {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
}

export interface Variant {
  display: string;
  body: string;
  mono: string;
  fontsLabel: string;
  dark: Palette;
  light: Palette;
  background: string;
  textEffect: string;
}

export const VARIANTS: Record<VariantId, Variant> = {
  a: {
    display: "'Fraunces Variable', serif",
    body: "'Inter Variable', sans-serif",
    mono: "'JetBrains Mono Variable', monospace",
    fontsLabel: 'Fraunces (display) + Inter (body) + JetBrains Mono (mono)',
    dark: { bg: '#0d0c0a', fg: '#f4efe6', muted: '#a39b8c', accent: '#f2a93b' },
    light: {
      bg: '#faf6ef',
      fg: '#1b1813',
      muted: '#6b6355',
      accent: '#b45309',
    },
    background: 'Dither',
    textEffect: 'Decrypted Text (name)',
  },
  b: {
    display: "'Space Grotesk Variable', sans-serif",
    body: "'Space Grotesk Variable', sans-serif",
    mono: "'IBM Plex Mono', monospace",
    fontsLabel: 'Space Grotesk (display + body) + IBM Plex Mono (mono)',
    dark: { bg: '#080d09', fg: '#e6f0e8', muted: '#8fa393', accent: '#4ade80' },
    light: {
      bg: '#f2f7f3',
      fg: '#0f1a12',
      muted: '#566a5b',
      accent: '#15803d',
    },
    background: 'Faulty Terminal',
    textEffect: 'Split Text (headline)',
  },
  c: {
    display: "'Geist Variable', sans-serif",
    body: "'Geist Variable', sans-serif",
    mono: "'Geist Mono Variable', monospace",
    fontsLabel: 'Geist (display + body) + Geist Mono (mono)',
    dark: { bg: '#090b11', fg: '#eaeef8', muted: '#8d96ab', accent: '#5b8cff' },
    light: {
      bg: '#f5f7fb',
      fg: '#0d1220',
      muted: '#566079',
      accent: '#1d4ed8',
    },
    background: 'none (CSS grid lines only)',
    textEffect: 'Blur Text (name)',
  },
};
