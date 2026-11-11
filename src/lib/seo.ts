/** Structured data for the home pages. */
export const SITE_URL = 'https://alfonsoramos.dev/';

export interface PersonJsonLdInput {
  /** Localized headline, used as `jobTitle`. */
  headline: string;
  /** Absolute URL of the photo. */
  image: string;
}

/**
 * schema.org Person for the Owner. The email is left out on purpose:
 * it would defeat the obfuscation in the HTML.
 */
export function buildPersonJsonLd({ headline, image }: PersonJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alfonso Ramos Rojas',
    url: SITE_URL,
    image,
    jobTitle: headline,
    affiliation: [
      {
        '@type': 'Organization',
        name: 'University of Málaga',
        url: 'https://www.uma.es/',
      },
      {
        '@type': 'Organization',
        name: 'Mobilenet',
        url: 'https://mobilenet.uma.es/',
      },
    ],
    sameAs: [
      'https://github.com/alraro',
      'https://www.linkedin.com/in/alfonso-ramos-rojas',
    ],
    knowsLanguage: ['es', 'en'],
  };
}
