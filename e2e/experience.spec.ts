import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const copy = {
  en: {
    heading: 'Experience & Education',
    groups: ['Experience', 'Education'],
    role: 'Research Assistant',
    programme: 'BSc in Software Engineering',
    present: 'Present',
  },
  es: {
    heading: 'Experiencia y formación',
    groups: ['Experiencia', 'Formación'],
    role: 'Investigador (Research Assistant)',
    programme: 'Grado en Ingeniería del Software',
    present: 'actualidad',
  },
} as const;

for (const locale of ['en', 'es'] as const) {
  test.describe(`/${locale}/ Experience & Education`, () => {
    test('the section comes before the Projects heading', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(
        page.getByRole('heading', { level: 2, name: copy[locale].heading }),
      ).toBeVisible();
      const ids = await page
        .locator('main h2')
        .evaluateAll((nodes) => nodes.map((node) => node.id));
      expect(ids.indexOf('experience')).toBeGreaterThanOrEqual(0);
      expect(ids.indexOf('experience')).toBeLessThan(ids.indexOf('projects'));
    });

    test('has two sub-groups with ordered lists of the seed entries', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const section = page.locator('section[aria-labelledby="experience"]');
      for (const name of copy[locale].groups) {
        await expect(
          section.getByRole('heading', { level: 3, name }),
        ).toBeVisible();
      }
      await expect(section.locator('ol')).toHaveCount(2);
      await expect(section.locator('ol > li')).toHaveCount(3);
      await expect(
        section.getByRole('heading', { level: 4, name: copy[locale].role }),
      ).toBeVisible();
      await expect(
        section.getByRole('heading', {
          level: 4,
          name: copy[locale].programme,
        }),
      ).toBeVisible();
      await expect(section).toContainText(copy[locale].present);
    });

    test('Mobilenet links to its website', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const link = page
        .locator('section[aria-labelledby="experience"]')
        .getByRole('link', { name: /Mobilenet/ });
      await expect(link).toHaveAttribute('href', 'https://mobilenet.uma.es/');
    });

    test('has no axe violations', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expectNoAxeViolations(page);
    });
  });
}

test('the Spanish page uses the localized institution name', async ({
  page,
}) => {
  await page.goto('/es/');
  await expect(
    page
      .locator('section[aria-labelledby="experience"]')
      .getByRole('link', { name: /Universidad de Málaga/ }),
  ).toHaveAttribute('href', 'https://www.uma.es/');
});
