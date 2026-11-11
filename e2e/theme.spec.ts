import { expect, test } from '@playwright/test';

const PAGE = '/en/design-system/';

test.describe('system light preference', () => {
  test.use({ colorScheme: 'light' });
  test('uses the light theme when nothing is stored', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('system dark preference', () => {
  test.use({ colorScheme: 'dark' });
  test('uses the dark theme when nothing is stored', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('is set before DOMContentLoaded (no flash)', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as Record<string, unknown>).__themeAtDcl =
          document.documentElement.dataset.theme;
      });
    });
    await page.goto(PAGE);
    const atDcl = await page.evaluate(
      () => (window as unknown as Record<string, unknown>).__themeAtDcl,
    );
    expect(atDcl).toBe('dark');
  });

  test('the toggle flips the theme, persists it and renames itself', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const html = page.locator('html');
    await page
      .getByRole('button', { name: 'Switch to light theme' })
      .first()
      .click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(
      page.getByRole('button', { name: 'Switch to dark theme' }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(
      page.getByRole('button', { name: 'Switch to dark theme' }).first(),
    ).toBeVisible();
  });

  test('a stored choice wins over the system preference', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('follows live system changes while no choice is stored', async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('ignores live system changes once the Visitor has chosen', async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page
      .getByRole('button', { name: 'Switch to light theme' })
      .first()
      .click();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test('the Spanish toggle label is localized', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/es/design-system/');
  await expect(
    page.getByRole('button', { name: 'Cambiar a tema claro' }).first(),
  ).toBeVisible();
});
