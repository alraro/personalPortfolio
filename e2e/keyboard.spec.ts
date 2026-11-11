import { expect, test } from '@playwright/test';

// Keyboard pass: the first Tab reaches the skip link, then every stop has a
// visible focus indicator and a non-empty accessible name.
for (const path of [
  '/en/',
  '/es/',
  '/en/design-system/',
  '/this-does-not-exist',
]) {
  test(`${path}: tab order, visible focus and names`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '#main');

    const stops: { tag: string; name: string; visible: boolean }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 120; i++) {
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const ring =
          (style.outlineStyle !== 'none' &&
            parseFloat(style.outlineWidth) > 0) ||
          (style.boxShadow !== 'none' && style.boxShadow !== '');
        const labelledBy = el
          .getAttribute('aria-labelledby')
          ?.split(' ')
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ');
        const name = (
          el.getAttribute('aria-label') ||
          labelledBy ||
          el.textContent ||
          el.getAttribute('title') ||
          ''
        ).trim();
        return {
          id: `${el.tagName}|${name}|${el.getAttribute('href')}`,
          tag: el.tagName,
          name,
          visible: ring,
        };
      });
      if (!stop || seen.has(stop.id)) break;
      seen.add(stop.id);
      stops.push(stop);
      await page.keyboard.press('Tab');
    }

    expect(stops.length).toBeGreaterThan(3);
    expect(stops.filter((s) => s.name === '')).toEqual([]);
    expect(stops.filter((s) => !s.visible)).toEqual([]);
  });
}
