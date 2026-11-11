import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const SITE = 'https://alfonsoramos.dev';

const copy = {
  en: {
    title: 'Alfonso Ramos Rojas — Software Engineering Student',
    description:
      'Software engineering student at the University of Málaga, research assistant at Mobilenet and student at 42 Málaga. Projects in systems, DevOps and more.',
    locale: 'en_US',
    alternate: 'es_ES',
  },
  es: {
    title: 'Alfonso Ramos Rojas — Estudiante de Ingeniería del Software',
    description:
      'Estudiante de Ingeniería del Software en la Universidad de Málaga, investigador en Mobilenet y alumno de 42 Málaga. Proyectos de sistemas, DevOps y más.',
    locale: 'es_ES',
    alternate: 'en_US',
  },
} as const;

const meta = (page: Page, selector: string) =>
  page.locator(`head meta[${selector}]`).getAttribute('content');

for (const locale of ['en', 'es'] as const) {
  test.describe(`/${locale}/ head`, () => {
    test('has localized title, description, canonical and hreflang', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page).toHaveTitle(copy[locale].title);
      expect(await meta(page, 'name="description"')).toBe(
        copy[locale].description,
      );
      expect(await meta(page, 'name="author"')).toBe('Alfonso Ramos Rojas');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${SITE}/${locale}/`,
      );
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((links) =>
          links.map((link) => [
            link.getAttribute('hreflang'),
            link.getAttribute('href'),
          ]),
        );
      expect(alternates).toEqual([
        ['en', `${SITE}/en/`],
        ['es', `${SITE}/es/`],
        ['x-default', `${SITE}/en/`],
      ]);
    });

    test('has Open Graph and Twitter tags', async ({ page }) => {
      await page.goto(`/${locale}/`);
      expect(await meta(page, 'property="og:type"')).toBe('website');
      expect(await meta(page, 'property="og:site_name"')).toBe(
        'Alfonso Ramos Rojas',
      );
      expect(await meta(page, 'property="og:title"')).toBe(copy[locale].title);
      expect(await meta(page, 'property="og:description"')).toBe(
        copy[locale].description,
      );
      expect(await meta(page, 'property="og:url"')).toBe(`${SITE}/${locale}/`);
      expect(await meta(page, 'property="og:image"')).toBe(
        `${SITE}/og/${locale}.png`,
      );
      expect(await meta(page, 'property="og:image:width"')).toBe('1200');
      expect(await meta(page, 'property="og:image:height"')).toBe('630');
      expect(await meta(page, 'property="og:image:alt"')).toBeTruthy();
      expect(await meta(page, 'property="og:locale"')).toBe(
        copy[locale].locale,
      );
      expect(await meta(page, 'property="og:locale:alternate"')).toBe(
        copy[locale].alternate,
      );
      expect(await meta(page, 'name="twitter:card"')).toBe(
        'summary_large_image',
      );
    });

    test('has a Person JSON-LD without the email', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const scripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      expect(scripts).toHaveLength(1);
      const data = JSON.parse(scripts[0]!);
      expect(data['@type']).toBe('Person');
      expect(data.sameAs).toEqual(
        expect.arrayContaining([
          'https://github.com/alraro',
          'https://www.linkedin.com/in/alfonso-ramos-rojas',
        ]),
      );
      expect(data.image).toMatch(/^https:\/\/alfonsoramos\.dev\/.+\.jpg/);
      expect(data).not.toHaveProperty('email');
      expect(scripts[0]).not.toContain('@alfonsoramos.dev');
    });

    test('serves a 1200x630 PNG as og:image', async ({ page, request }) => {
      await page.goto(`/${locale}/`);
      const url = new URL((await meta(page, 'property="og:image"'))!);
      const response = await request.get(url.pathname);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      const png = await response.body();
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    });

    test('design system is noindex and reuses the locale OG image', async ({
      page,
    }) => {
      await page.goto(`/${locale}/design-system/`);
      expect(await meta(page, 'name="robots"')).toBe('noindex');
      expect(await meta(page, 'property="og:image"')).toBe(
        `${SITE}/og/${locale}.png`,
      );
      await expect(
        page.locator('script[type="application/ld+json"]'),
      ).toHaveCount(0);
    });
  });
}

test('design system titles are localized', async ({ page }) => {
  await page.goto('/en/design-system/');
  await expect(page).toHaveTitle('Design system — Alfonso Ramos Rojas');
  await page.goto('/es/design-system/');
  await expect(page).toHaveTitle('Sistema de diseño — Alfonso Ramos Rojas');
});

test.describe('sitemap, robots and icons', () => {
  test('sitemap lists the two homes and nothing else', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);
    const sitemapPath = new URL(
      /<loc>([^<]+)<\/loc>/.exec(await index.text())![1]!,
    ).pathname;
    const xml = await (await request.get(sitemapPath)).text();
    expect(xml).toContain(`<loc>${SITE}/en/</loc>`);
    expect(xml).toContain(`<loc>${SITE}/es/</loc>`);
    expect(xml).not.toContain('design-system');
    expect(xml).not.toContain('404');
    expect(xml).not.toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain('hreflang="es-ES"');
  });

  test('robots.txt allows everything and names the sitemap', async ({
    request,
  }) => {
    const text = await (await request.get('/robots.txt')).text();
    expect(text).toContain('Allow: /');
    expect(text).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('favicons, apple touch icon and manifest exist', async ({
    page,
    request,
  }) => {
    const svg = await request.get('/favicon.svg');
    expect(svg.headers()['content-type']).toContain('image/svg+xml');
    expect(await svg.text()).toContain('prefers-color-scheme');
    for (const [path, size] of [
      ['/favicon-32.png', 32],
      ['/apple-touch-icon.png', 180],
    ] as const) {
      const png = await (await request.get(path)).body();
      expect(png.readUInt32BE(16)).toBe(size);
    }
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    expect(manifest.name).toBe('Alfonso Ramos Rojas');
    expect(manifest.icons.length).toBeGreaterThan(0);
    await page.goto('/en/');
    await expect(page.locator('link[rel="icon"]')).toHaveCount(2);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });
});

test.describe('404 page', () => {
  test('returns 404 and shows both languages with working links', async ({
    page,
  }) => {
    const response = await page.goto('/this-does-not-exist');
    expect(response?.status()).toBe(404);
    expect(await meta(page, 'name="robots"')).toBe('noindex');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeVisible();
    await expect(page.locator('section[lang="es"]')).toHaveCount(1);
    await expect(page.locator('header nav')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /theme|tema/i })).toHaveCount(
      1,
    );

    await page.getByRole('link', { name: 'Ir a la página en español' }).click();
    await expect(page).toHaveURL(/\/es\/$/);
    await page.goto('/this-does-not-exist');
    await page.getByRole('link', { name: 'Go to the English home' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('skip link comes first', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`passes axe in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('theme', value);
      }, theme);
      await page.goto('/this-does-not-exist');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expectNoAxeViolations(page);
    });
  }
});
