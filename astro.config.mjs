// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { securityHeaders } from './src/integrations/security-headers.mjs';

export default defineConfig({
  site: 'https://alfonsoramos.dev',
  output: 'static',
  integrations: [
    react(),
    securityHeaders(),
    sitemap({
      // Only the two home pages are indexable: not `/`, the design system or the 404.
      filter: (page) => /\/(en|es)\/$/.test(new URL(page).pathname),
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-ES' } },
    }),
  ],
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // The root page `/` detects the language in the browser instead.
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
