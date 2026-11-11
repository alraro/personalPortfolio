import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const NAME = 'Alfonso Ramos Rojas';
const EMAIL = 'hello@alfonsoramos.dev';

const copy = {
  en: {
    headline: 'Software engineering student · Systems & DevOps',
    about: 'About',
    copyLabel: 'Copy email address',
    copied: 'Email copied',
  },
  es: {
    headline: 'Estudiante de Ingeniería del Software · Sistemas y DevOps',
    about: 'Sobre mí',
    copyLabel: 'Copiar dirección de email',
    copied: 'Email copiado',
  },
} as const;

for (const locale of ['en', 'es'] as const) {
  test.describe(`/${locale}/ Hero and About`, () => {
    test('has exactly one h1 with the name and the localized headline', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(NAME);
      await expect(page.getByText(copy[locale].headline)).toBeVisible();
    });

    test('shows no CV button while no CV file exists', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('a[download]')).toHaveCount(0);
      await expect(
        page.getByRole('link', { name: /Download CV|Descargar CV/ }),
      ).toHaveCount(0);
    });

    test('GitHub and LinkedIn links point to the right profiles', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const links = page.locator('[data-hero] [data-contact-links]');
      await expect(links.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
        'href',
        'https://github.com/alraro',
      );
      await expect(
        links.getByRole('link', { name: /LinkedIn/ }),
      ).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/alfonso-ramos-rojas',
      );
    });

    test('the email link is decoded after load', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const link = page.locator('[data-hero] [data-email-link]');
      await expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
      await expect(link).toHaveText(EMAIL);
    });

    test('the raw HTML does not contain the email address', async ({
      request,
    }) => {
      const response = await request.get(`/${locale}/`);
      expect(await response.text()).not.toContain(EMAIL);
    });

    test('has the About section with the localized heading', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(
        page.getByRole('heading', { level: 2, name: copy[locale].about }),
      ).toHaveAttribute('id', 'about');
    });

    test('is "animated" with default motion', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('[data-hero]').first()).toHaveAttribute(
        'data-motion',
        'animated',
      );
    });

    for (const theme of ['dark', 'light'] as const) {
      test(`passes axe in the ${theme} theme`, async ({ page }) => {
        await page.addInitScript((value) => {
          localStorage.setItem('theme', value);
        }, theme);
        await page.goto(`/${locale}/`);
        await expect(page.locator('h1')).toContainText(NAME);
        await expectNoAxeViolations(page);
      });
    }
  });
}

test.describe('copy email', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copies the address and announces it', async ({ page }) => {
    await page.goto('/en/');
    const hero = page.locator('[data-hero]');
    await hero.getByRole('button', { name: copy.en.copyLabel }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      EMAIL,
    );
    await expect(hero.locator('[data-copy-status]')).toHaveText(copy.en.copied);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero stays "static" and the name remains plain text', async ({
    page,
  }) => {
    await page.goto('/en/');
    // Give the idle islands time to hydrate before asserting nothing changed.
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-hero]').first()).toHaveAttribute(
      'data-motion',
      'static',
    );
    await expect(page.locator('[data-hero] canvas')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveText(NAME);
  });
});
