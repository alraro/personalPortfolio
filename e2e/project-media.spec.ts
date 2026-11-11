import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/axe';

const CARD = '#project-ds-video';
const VIDEO = `${CARD} video`;

const paused = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).evaluate((v: HTMLVideoElement) => v.paused);

test.describe('Project Media on /en/design-system/', () => {
  test('the image renders an optimised picture with alt text', async ({
    page,
  }) => {
    await page.goto('/en/design-system/');
    const picture = page.locator('#ds-media-image picture');
    await expect(picture).toHaveCount(1);
    await expect(picture.locator('source[type="image/avif"]')).toHaveCount(1);
    const alt = await picture.locator('img').getAttribute('alt');
    expect(alt?.length).toBeGreaterThan(0);
  });

  test('the video frame is a labelled image and the video is hidden from AT', async ({
    page,
  }) => {
    await page.goto('/en/design-system/');
    const frame = page.locator('#ds-media-video [role="img"]');
    await expect(frame).toHaveAttribute('aria-label', /.+/);
    const video = frame.locator('video');
    await expect(video).toHaveAttribute('aria-hidden', 'true');
    await expect(video).not.toHaveAttribute('controls', /.*/);
    await expect(video).not.toHaveAttribute('autoplay', /.*/);
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video.locator('source').first()).toHaveAttribute(
      'type',
      'video/webm',
    );
  });

  test('desktop: hover plays, leaving pauses and resets', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.goto('/en/design-system/');
    await page.locator(CARD).scrollIntoViewIfNeeded();
    await page.locator(CARD).hover();
    await expect.poll(() => paused(page, VIDEO)).toBe(false);
    await page.mouse.move(0, 0);
    await expect.poll(() => paused(page, VIDEO)).toBe(true);
    const time = await page
      .locator(VIDEO)
      .evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(time).toBeLessThan(0.3);
  });

  test('desktop: keyboard focus on the card link plays', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop behaviour');
    await page.goto('/en/design-system/');
    await page.locator(`${CARD} h3 a`).focus();
    await expect.poll(() => paused(page, VIDEO)).toBe(false);
    await page.locator(`${CARD} h3 a`).blur();
    await expect.poll(() => paused(page, VIDEO)).toBe(true);
  });

  test('touch: scrolling into view plays, scrolling away pauses', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'touch behaviour');
    await page.goto('/en/design-system/');
    await page.locator(VIDEO).scrollIntoViewIfNeeded();
    await expect.poll(() => paused(page, VIDEO)).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => paused(page, VIDEO)).toBe(true);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('never plays on hover, focus or scroll', async ({
      page,
      isMobile,
    }) => {
      await page.goto('/en/design-system/');
      await page.locator(VIDEO).scrollIntoViewIfNeeded();
      if (!isMobile) {
        await page.locator(CARD).hover();
        await page.locator(`${CARD} h3 a`).focus();
      }
      await page.waitForTimeout(600);
      expect(await paused(page, VIDEO)).toBe(true);
    });
  });

  test('has no axe violations', async ({ page }) => {
    await page.goto('/en/design-system/');
    await expectNoAxeViolations(page);
  });
});
