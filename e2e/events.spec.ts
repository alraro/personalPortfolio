import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const copy = {
  en: { heading: 'Hackathons & Events', role: 'Volunteer', see: 'See project' },
  es: {
    heading: 'Hackatones y eventos',
    role: 'Voluntario',
    see: 'Ver proyecto',
  },
} as const;

for (const locale of ['en', 'es'] as const) {
  test(`/${locale}/ lists the GECCO Event with its localized role`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(
      page.getByRole('heading', { level: 2, name: copy[locale].heading }),
    ).toHaveCount(1);
    const row = page.locator(
      'section[aria-labelledby="events"] [data-event-row]',
      {
        hasText: 'GECCO 2025',
      },
    );
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(copy[locale].role);
    await expect(row).toContainText('2025');
    await expect(row.locator('a')).toHaveAttribute('target', '_blank');
  });
}

test('sample featured card shows the Award in CSS uppercase, normal-case text', async ({
  page,
}) => {
  await page.goto('/en/design-system/');
  const badge = page
    .locator('#project-ds-award-featured [data-award-badge]')
    .first();
  await expect(badge).toBeVisible();
  const text = (await badge.textContent())!.trim();
  expect(text).toBe('2nd place — Sample Hackathon');
  expect(text).not.toBe(text.toUpperCase());
  await expect(badge).toHaveCSS('text-transform', 'uppercase');
  await expect(
    page.locator('#project-ds-award-compact [data-award-badge]'),
  ).toHaveCount(1);
  await expect(
    page.locator('#project-ds-grid-a [data-award-badge]'),
  ).toHaveCount(0);
});

test('EventRow "See project" links to the Project anchor', async ({ page }) => {
  await page.goto('/en/design-system/');
  const link = page.locator('#ds-event-rows').getByRole('link', {
    name: /See project/,
  });
  await expect(link).toHaveAttribute('href', '#project-ds-award-featured');
  await expect(page.locator('#project-ds-award-featured')).toHaveCount(1);
});

for (const path of ['/en/', '/es/', '/en/design-system/']) {
  test(`${path} has no axe violations with Events`, async ({ page }) => {
    await page.goto(path);
    await expectNoAxeViolations(page);
  });
}
