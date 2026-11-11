import { createHash } from 'node:crypto';

// Builds the Cloudflare Pages `_headers` file. The CSP hashes every inline
// script found in the built HTML, so adding or editing an inline script needs
// no manual update: `pnpm build` recomputes them (see security-headers.mjs).

const INLINE_SCRIPT = /<script((?:\s[^>]*)?)>([\s\S]*?)<\/script>/gi;
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript']);

/** Returns CSP source expressions for the executable inline scripts of one page. */
export function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const [, attributes = '', code = ''] of html.matchAll(INLINE_SCRIPT)) {
    if (/\ssrc\s*=/i.test(attributes) || code === '') continue;
    const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attributes)?.[1] ?? '';
    if (!EXECUTABLE_TYPES.has(type.toLowerCase())) continue;
    const digest = createHash('sha256').update(code).digest('base64');
    hashes.push(`'sha256-${digest}'`);
  }
  return hashes;
}

/** Distinct, sorted hashes across all pages (stable output between builds). */
export function collectInlineScriptHashes(pages: string[]): string[] {
  return [...new Set(pages.flatMap(inlineScriptHashes))].sort();
}

export function buildHeadersFile(scriptHashes: string[]): string {
  const csp = [
    "default-src 'self'",
    [
      "script-src 'self'",
      ...scriptHashes,
      'https://static.cloudflareinsights.com',
    ].join(' '),
    // Astro and the hero effects set style attributes, hence 'unsafe-inline'.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "media-src 'self'",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');

  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;
}
