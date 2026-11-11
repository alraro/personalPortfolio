import type { APIRoute } from 'astro';
import { themeColors } from '../lib/theme';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: 'Alfonso Ramos Rojas',
      short_name: 'Alfonso Ramos',
      start_url: '/',
      display: 'browser',
      theme_color: themeColors.dark,
      background_color: themeColors.dark,
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
