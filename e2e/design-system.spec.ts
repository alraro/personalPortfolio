import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

for (const locale of ['en', 'es'] as const) {
  for (const theme of ['dark', 'light'] as const) {
    test.describe(`/${locale}/design-system/ in ${theme} theme`, () => {
      test.use({ colorScheme: theme });

      test('has no axe violations', async ({ page }) => {
        await page.goto(`/${locale}/design-system/`);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoAxeViolations(page);
      });
    });
  }

  test(`/${locale}/design-system/ is noindex with one h1`, async ({ page }) => {
    await page.goto(`/${locale}/design-system/`);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute(
      'content',
      'noindex',
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  });
}

test('an external Link opens in a new tab and says so', async ({ page }) => {
  await page.goto('/en/design-system/');
  const link = page.locator('a[target=_blank]').first();
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link).toContainText('(opens in a new tab)');
});

test('the external Link hint is localized in Spanish', async ({ page }) => {
  await page.goto('/es/design-system/');
  await expect(page.locator('a[target=_blank]').first()).toContainText(
    '(se abre en una pestaña nueva)',
  );
});

test('an internal Link stays in the tab', async ({ page }) => {
  await page.goto('/en/design-system/');
  const internal = page.locator('[data-demo=internal-link]');
  await expect(internal).not.toHaveAttribute('target', '_blank');
});

test('a Button renders an anchor with href and a button without', async ({
  page,
}) => {
  await page.goto('/en/design-system/');
  await expect(page.locator('a[data-button]').first()).toBeVisible();
  await expect(page.locator('button[data-button]').first()).toBeVisible();
});

test('the focus ring uses the focus-ring token', async ({ page }) => {
  await page.goto('/en/design-system/');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, style: s.outlineStyle };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBe('2px');
});
