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
      // Only the two home pages are indexable: not the `/` redirect, the design system or the 404.
      filter: (page) => /\/(en|es)\/$/.test(new URL(page).pathname),
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-ES' } },
    }),
  ],
  // `/` has no page: Cloudflare Pages serves the 302 from `public/_redirects`;
  // this entry builds a meta-refresh page for `astro preview` and the link check.
  redirects: { '/': '/en/' },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
