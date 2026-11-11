import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Runs axe on the page and fails with a readable list of violations. */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  const report = violations
    .map((v) => {
      const targets = v.nodes
        .map((n) => `    - ${n.target.join(' ')}`)
        .join('\n');
      return `${v.id} (${v.impact ?? 'unknown'}): ${v.help}\n${targets}`;
    })
    .join('\n\n');

  expect(violations, `Accessibility violations:\n\n${report}\n`).toEqual([]);
}
