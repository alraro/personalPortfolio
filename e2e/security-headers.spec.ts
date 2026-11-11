import { expect, test } from '@playwright/test';

// `astro preview` does not apply Cloudflare's `_headers`, so these checks only
// make sense against a deployed preview. Run with:
//   PREVIEW_URL=https://<branch>.<project>.pages.dev pnpm test:e2e security-headers
const previewUrl = process.env.PREVIEW_URL;

test.describe('security and caching headers on the deployed preview', () => {
  test.skip(!previewUrl, 'PREVIEW_URL is not set (deployed preview only)');

  test('home page sends the security headers and a strict CSP', async ({
    request,
  }) => {
    const response = await request.get(`${previewUrl}/en/`);
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['permissions-policy']).toContain('microphone=()');
    expect(headers['permissions-policy']).toContain('geolocation=()');
    expect(headers['permissions-policy']).toContain('interest-cohort=()');

    const csp = headers['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('https://static.cloudflareinsights.com');
    expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'none'");
    expect(csp.match(/script-src [^;]*/)?.[0]).not.toContain('unsafe-inline');
  });

  test('hashed build assets are cached immutably', async ({
    page,
    request,
  }) => {
    await page.goto(`${previewUrl}/en/`);
    const asset = await page.evaluate(
      () =>
        performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .find((name) => new URL(name).pathname.startsWith('/_astro/')) ?? '',
    );
    expect(asset).not.toBe('');
    const response = await request.get(asset);
    expect(response.headers()['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
  });

  for (const path of ['/en/', '/es/', '/en/design-system/', '/404.html']) {
    test(`${path} logs no CSP violations`, async ({ page }) => {
      const problems: string[] = [];
      page.on('console', (message) => {
        if (/content security policy|csp/i.test(message.text())) {
          problems.push(message.text());
        }
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          console.error(
            `CSP violation: ${event.violatedDirective} ${event.blockedURI}`,
          );
        });
      });
      await page.goto(`${previewUrl}${path}`);
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
    });
  }
});
