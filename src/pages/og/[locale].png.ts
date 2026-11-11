import type { APIRoute } from 'astro';
import { locales, type Locale } from '../../i18n';
import { renderOgImage } from '../../lib/og';
import { getProfile } from '../../lib/profile';

export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

/** Open Graph image of one locale: /og/en.png and /og/es.png. */
export const GET: APIRoute = async ({ params }) => {
  const profile = await getProfile(params.locale as Locale);
  const png = await renderOgImage({
    name: profile.name,
    headline: profile.headline,
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
