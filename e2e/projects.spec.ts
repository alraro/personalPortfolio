import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const PRIMARY_LINK = 'https://github.com/alraro/miniRT';

const copy = {
  en: {
    subtitle:
      'A ray tracer in C that renders 3D scenes from a text description.',
  },
  es: {
    subtitle:
      'Un ray tracer en C que renderiza escenas 3D a partir de una descripción en texto.',
  },
} as const;

for (const locale of ['en', 'es'] as const) {
  test.describe(`/${locale}/ Featured Projects`, () => {
    test('shows the miniRT card with the localized subtitle', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const card = page.locator('#project-minirt');
      await expect(card).toBeVisible();
      await expect(card).toContainText(copy[locale].subtitle);
      await expect(
        card.getByRole('heading', { level: 3, name: /miniRT/ }),
      ).toBeVisible();
    });

    test('the main link is the Primary Link and opens a new tab', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const link = page.locator('#project-minirt h3 a');
      await expect(link).toHaveAttribute('href', PRIMARY_LINK);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    });

    test('clicking an empty area of the card activates the main link', async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'desktop behaviour');
      await page.goto(`/${locale}/`);
      const popupPromise = page.waitForEvent('popup');
      // Top-left padding of the card: no text or control there.
      await page.locator('#project-minirt').click({ position: { x: 6, y: 6 } });
      const popup = await popupPromise;
      expect(popup.url()).toContain('github.com/alraro/miniRT');
    });

    test('has no nested anchors', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('#project-minirt a a')).toHaveCount(0);
    });

    test('has no axe violations', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('#project-minirt')).toBeVisible();
      await expectNoAxeViolations(page);
    });

    test('on mobile the media is above the text', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'mobile layout');
      await page.goto(`/${locale}/`);
      const media = await page
        .locator('#project-minirt [data-project-media]')
        .boundingBox();
      const title = await page.locator('#project-minirt h3').boundingBox();
      expect(media).not.toBeNull();
      expect(title).not.toBeNull();
      expect(media!.y + media!.height).toBeLessThanOrEqual(title!.y);
    });
  });
}

test('on desktop the media column follows the side prop', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'desktop layout');
  await page.goto('/en/design-system/');
  const right = page.locator('#project-ds-right');
  const left = page.locator('#project-ds-left');
  const box = async (locator: typeof right, selector: string) =>
    (await locator.locator(selector).first().boundingBox())!;

  const rightMedia = await box(right, '[data-generated-cover]');
  const rightTitle = await box(right, 'h3');
  expect(rightMedia.x).toBeGreaterThan(rightTitle.x);

  const leftMedia = await box(left, '[data-generated-cover]');
  const leftTitle = await box(left, 'h3');
  expect(leftMedia.x).toBeLessThan(leftTitle.x);
});

test('secondary links are independent and have accessible names', async ({
  page,
}) => {
  await page.goto('/es/design-system/');
  const card = page.locator('#project-ds-right');
  const demo = card.getByRole('link', { name: /^Demo: Sample Project/ });
  await expect(demo).toHaveAttribute('href', 'https://example.com/demo');
  await expect(demo).toHaveAttribute('target', '_blank');
  await expect(
    card.getByRole('link', { name: /^Artículo: Sample Project/ }),
  ).toBeVisible();
});

test('the design-system spine demo has no axe violations in either card side', async ({
  page,
}) => {
  await page.goto('/en/design-system/');
  await expect(page.locator('#project-ds-spine-a')).toBeVisible();
  await expectNoAxeViolations(page);
});
