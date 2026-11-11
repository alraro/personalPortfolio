import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const headings = { en: 'More projects', es: 'Más proyectos' } as const;

for (const locale of ['en', 'es'] as const) {
  test(`/${locale}/ shows the "More projects" section only when there are compact cards`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    const compactCards = await page.locator('[data-variant="compact"]').count();
    const sectionHeadings = page.getByRole('heading', {
      level: 2,
      name: headings[locale],
    });
    await expect(sectionHeadings).toHaveCount(compactCards > 0 ? 1 : 0);
    await expect(page.locator('#more-projects')).toHaveCount(
      compactCards > 0 ? 1 : 0,
    );
  });
}

test('compact card: Primary Link, no description, ordered parts', async ({
  page,
}) => {
  await page.goto('/en/design-system/');
  const card = page.locator('#project-ds-compact-cover');
  await expect(card).toBeVisible();
  await expect(card.locator('h3 a')).toHaveAttribute(
    'href',
    'https://example.com/primary',
  );
  await expect(card.locator('p:not([data-generated-cover] p)')).toHaveCount(1); // subtitle only
  await expect(card.locator('.prose')).toHaveCount(0);
  await expect(card.locator('a a')).toHaveCount(0);
  const media = (await card.locator('[data-project-media]').boundingBox())!;
  const title = (await card.locator('h3').boundingBox())!;
  expect(media.y + media.height).toBeLessThanOrEqual(title.y);
});

test('compact grid shows 1, 2 and 3 columns by width', async ({ page }) => {
  await page.goto('/en/design-system/');
  const cards = page.locator('#ds-more-grid > li');
  await expect(cards).toHaveCount(3);
  const columns = async (width: number) => {
    await page.setViewportSize({ width, height: 900 });
    const xs = await cards.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().x)),
    );
    return new Set(xs).size;
  };
  expect(await columns(390)).toBe(1);
  expect(await columns(800)).toBe(2);
  expect(await columns(1280)).toBe(3);
});

test('compact cards on the design-system page have no axe violations', async ({
  page,
}) => {
  await page.goto('/en/design-system/');
  await expect(page.locator('#project-ds-compact-cover')).toBeVisible();
  await expectNoAxeViolations(page);
});
