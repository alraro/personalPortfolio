import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  buildHeadersFile,
  collectInlineScriptHashes,
  inlineScriptHashes,
} from './headers';

const sha = (code: string) =>
  `'sha256-${createHash('sha256').update(code).digest('base64')}'`;

describe('inlineScriptHashes', () => {
  it('hashes the exact content of executable inline scripts', () => {
    const html = '<head><script>let a = 1;</script></head>';
    expect(inlineScriptHashes(html)).toEqual([sha('let a = 1;')]);
  });

  it('keeps attributes out of the hash and handles type=module', () => {
    const html = '<script type="module">import "x";</script>';
    expect(inlineScriptHashes(html)).toEqual([sha('import "x";')]);
  });

  it('ignores external scripts and data blocks such as JSON-LD', () => {
    const html =
      '<script src="/a.js"></script><script type="application/ld+json">{"a":1}</script>';
    expect(inlineScriptHashes(html)).toEqual([]);
  });

  it('hashes multi-line content including whitespace', () => {
    const code = '\n  foo();\n  bar();\n';
    expect(inlineScriptHashes(`<script>${code}</script>`)).toEqual([sha(code)]);
  });
});

describe('collectInlineScriptHashes', () => {
  it('returns each distinct hash once, sorted', () => {
    const a = '<script>a()</script>';
    const b = '<script>b()</script>';
    const hashes = collectInlineScriptHashes([a + b, b]);
    expect(hashes).toEqual([sha('a()'), sha('b()')].sort());
  });
});

describe('buildHeadersFile', () => {
  const file = buildHeadersFile(["'sha256-abc='"]);

  it('applies the security headers to all paths', () => {
    expect(file).toMatch(/^\/\*\n/);
    expect(file).toContain('  X-Content-Type-Options: nosniff');
    expect(file).toContain(
      '  Referrer-Policy: strict-origin-when-cross-origin',
    );
    expect(file).toContain(
      '  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
  });

  it('builds a strict CSP with hashes and no unsafe-inline for scripts', () => {
    const csp = file
      .split('\n')
      .find((l) => l.includes('Content-Security-Policy'))!;
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain(
      "script-src 'self' 'sha256-abc=' https://static.cloudflareinsights.com",
    );
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("media-src 'self'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'none'");
    const script = csp.match(/script-src [^;]*/)![0];
    expect(script).not.toContain('unsafe-inline');
  });

  it('caches hashed build assets immutably', () => {
    expect(file).toContain(
      '/_astro/*\n  Cache-Control: public, max-age=31536000, immutable',
    );
  });
});
