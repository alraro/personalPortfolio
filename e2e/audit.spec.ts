import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

// Launch audit: every page, in both themes. Pages are listed once here.
const PAGES = [
  '/en/',
  '/es/',
  '/en/design-system/',
  '/es/design-system/',
  '/this-does-not-exist',
];

for (const path of PAGES) {
  for (const theme of ['dark', 'light'] as const) {
    test.describe(`${path} in the ${theme} theme`, () => {
      test.use({ colorScheme: theme });

      test('has no axe violations', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoAxeViolations(page);
      });

      test('does not scroll horizontally at 320 px wide', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 });
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      });
    });
  }
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of PAGES) {
    test(`${path} has no running animation or autoplaying video`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const running = await page.evaluate(() => ({
        animations: document
          .getAnimations()
          .filter((a) => a.playState === 'running')
          .filter((a) => {
            const style =
              a.effect instanceof KeyframeEffect && a.effect.target
                ? getComputedStyle(a.effect.target as Element)
                : null;
            // Infinite loops are the problem; one-off transitions are fine.
            return (
              a.effect?.getComputedTiming().iterations === Infinity || !style
            );
          }).length,
        playingVideos: [...document.querySelectorAll('video')].filter(
          (v) => !v.paused,
        ).length,
        autoplayVideos: [...document.querySelectorAll('video')].filter(
          (v) => v.autoplay,
        ).length,
      }));
      expect(running).toEqual({
        animations: 0,
        playingVideos: 0,
        autoplayVideos: 0,
      });
    });
  }
});
