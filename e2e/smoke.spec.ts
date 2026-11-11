import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

test('home page loads, has one h1 and no axe violations', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText('Alfonso Ramos Rojas');

  await expectNoAxeViolations(page);
});
