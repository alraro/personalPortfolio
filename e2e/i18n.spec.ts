import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

test.describe('root redirect', () => {
  for (const locale of ['es-ES', 'de-DE']) {
    test.describe(`browser locale ${locale}`, () => {
      test.use({ locale });
      test('ends on /en/ whatever the browser language', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/en\/$/);
      });
    });
  }

  test.describe('JavaScript disabled', () => {
    test.use({ javaScriptEnabled: false });
    test('ends on /en/ without scripts', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\/$/);
    });
  });
});

for (const locale of ['en', 'es'] as const) {
  test.describe(`/${locale}/`, () => {
    test('has correct html lang, one h1 and localized text', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('main')).toContainText(
        locale === 'en'
          ? 'Software engineering student'
          : 'Estudiante de Ingeniería',
      );
    });

    test('has absolute canonical and hreflang tags', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const href = (sel: string) => page.locator(sel).getAttribute('href');
      expect(await href('link[rel=canonical]')).toBe(
        `https://alfonsoramos.dev/${locale}/`,
      );
      expect(await href('link[rel=alternate][hreflang=en]')).toBe(
        'https://alfonsoramos.dev/en/',
      );
      expect(await href('link[rel=alternate][hreflang=es]')).toBe(
        'https://alfonsoramos.dev/es/',
      );
      expect(await href('link[rel=alternate][hreflang=x-default]')).toBe(
        'https://alfonsoramos.dev/en/',
      );
    });

    test('language switch links to the other locale and marks the current one', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const other = locale === 'en' ? 'es' : 'en';
      await expect(page.locator(`a[hreflang=${other}]`)).toHaveAttribute(
        'href',
        `/${other}/`,
      );
      await expect(page.locator(`a[hreflang=${locale}]`)).toHaveAttribute(
        'aria-current',
        'true',
      );
    });

    test('has no axe violations', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expectNoAxeViolations(page);
    });
  });
}
