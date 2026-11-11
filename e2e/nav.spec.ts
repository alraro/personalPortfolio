import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const REPO = 'https://github.com/alraro/personalPortfolio';
const PAGES = ['/en/', '/es/', '/en/design-system/', '/es/design-system/'];

/** The visible Main nav (the other layout's nav is display: none). */
const mainNav = (page: Page) =>
  page.getByRole('navigation', { name: /^(Main|Principal)$/ });

test.describe('skip link', () => {
  for (const path of PAGES) {
    test(`is the first focusable element on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press('Tab');
      const skip = page.locator('a[href="#main"]');
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await expect(skip).toHaveText(/Skip to content|Saltar al contenido/);
      await page.keyboard.press('Enter');
      await expect(page.locator('main#main')).toBeFocused();
    });
  }

  test('is hidden until focused', async ({ page }) => {
    await page.goto('/en/');
    const box = await page.locator('a[href="#main"]').boundingBox();
    expect(box === null || box.width <= 1).toBe(true);
  });
});

test.describe('landmarks and headings', () => {
  for (const path of PAGES) {
    test(`${path} has one banner, main and contentinfo`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
    });

    test(`${path} heading levels never skip`, async ({ page }) => {
      await page.goto(path);
      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level).toBeLessThanOrEqual(levels[i - 1]! + 1);
      });
    });
  }
});

test.describe('nav items', () => {
  for (const path of ['/en/', '/es/']) {
    test(`${path}: every item points to an existing id, in page order`, async ({
      page,
    }) => {
      await page.goto(path);
      const hrefs = await page
        .locator('[data-nav] [data-nav-link]')
        .evaluateAll((links) =>
          links.map((l) => (l as HTMLAnchorElement).getAttribute('href')!),
        );
      // About and Contact always exist; "More projects" never has an item.
      expect(hrefs).toContain('#about');
      expect(hrefs).toContain('#contact');
      expect(hrefs).not.toContain('#more-projects');
      for (const href of new Set(hrefs)) {
        await expect(page.locator(href)).toHaveCount(1);
      }
      // Every rendered section with a nav-able id has an item, and no other.
      for (const id of ['about', 'experience', 'projects', 'events']) {
        const rendered = (await page.locator(`h2#${id}`).count()) > 0;
        expect(hrefs.includes(`#${id}`), id).toBe(rendered);
      }
    });
  }
});

test.describe('desktop nav', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'desktop layout only');
  });

  test('Tab reaches the nav links in visual order', async ({ page }) => {
    await page.goto('/en/');
    const hrefs = await mainNav(page)
      .getByRole('link')
      .evaluateAll((links) =>
        links.map((l) => (l as HTMLAnchorElement).getAttribute('href')),
      );
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // name
    await expect(
      page.getByRole('link', { name: /back to the top/ }),
    ).toBeFocused();
    for (const href of hrefs) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('href', href!);
    }
  });

  test('is fixed to the top while scrolling', async ({ page }) => {
    await page.goto('/en/');
    await page.evaluate(() => window.scrollTo(0, 1500));
    const box = await page.locator('[data-nav]').first().boundingBox();
    expect(box!.y).toBe(0);
  });

  test('Projects scrolls the heading below the nav and marks it current', async ({
    page,
  }) => {
    await page.goto('/en/');
    const link = mainNav(page).getByRole('link', { name: 'Projects' });
    test.skip((await link.count()) === 0, 'no Featured Projects rendered');
    await link.click();
    const heading = page.locator('h2#projects');
    const navBox = await page.locator('[data-nav]').first().boundingBox();
    await expect
      .poll(async () => (await heading.boundingBox())!.y, { timeout: 5000 })
      .toBeGreaterThan(navBox!.y + navBox!.height);
    await expect(link).toHaveAttribute('aria-current', 'location');
  });

  test('menu button is not shown', async ({ page }) => {
    await page.goto('/en/');
    await expect(
      page.locator('[data-nav] [data-nav-button]').first(),
    ).toBeHidden();
  });
});

test.describe('mobile menu', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, 'mobile layout only');
  });

  test('follows the disclosure pattern', async ({ page }) => {
    await page.goto('/en/');
    const button = page.locator('[data-nav] [data-nav-button]').first();
    const about = page.locator('[data-nav-panel]').first().getByRole('link', {
      name: 'About',
    });

    await expect(button).toHaveText(/Menu/);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(about).toBeHidden();

    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(about).toBeVisible();
    // Language and theme controls stay outside the panel.
    await expect(
      page.locator('[data-nav]').first().locator('[data-theme-toggle]'),
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();

    await button.click();
    await expect(about).toBeVisible();
    await about.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(about).toBeHidden();

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.click(195, 700);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('shows the initials below 400 px', async ({ page }) => {
    await page.goto('/en/');
    await expect(
      page.locator('[data-nav] a[href="/en/"]').first().getByText('AR'),
    ).toBeVisible();
  });
});

test.describe('footer', () => {
  test('source code link and copyright in English', async ({ page }) => {
    await page.goto('/en/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toHaveAttribute('id', 'contact');
    await expect(
      footer.getByRole('link', { name: /Source code/ }),
    ).toHaveAttribute('href', REPO);
    await expect(
      footer.getByRole('link', { name: /Design system/ }),
    ).toHaveAttribute('href', '/en/design-system/');
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} Alfonso Ramos Rojas`,
    );
    await expect(footer.getByText('How this site is built')).toBeVisible();
  });

  test('design system link is locale-correct on /es/', async ({ page }) => {
    await page.goto('/es/');
    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: /Sistema de diseño/ }),
    ).toHaveAttribute('href', '/es/design-system/');
    await expect(
      footer.getByRole('link', { name: /Código fuente/ }),
    ).toHaveAttribute('href', REPO);
    await expect(footer.getByText('Cómo está hecha esta web')).toBeVisible();
  });

  test('contains the contact links', async ({ page }) => {
    await page.goto('/en/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: /GitHub/ })).toBeVisible();
    await expect(footer.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
  });
});

for (const path of PAGES) {
  for (const theme of ['dark', 'light'] as const) {
    test.describe(`${path} in ${theme} theme`, () => {
      test.use({ colorScheme: theme });
      test('has no axe violations', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoAxeViolations(page);
      });
    });
  }
}
