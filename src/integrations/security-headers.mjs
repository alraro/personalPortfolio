// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildHeadersFile, collectInlineScriptHashes } from '../lib/headers.ts';

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

/** Writes dist/_headers with a CSP that hashes the inline scripts of the build. */
export function securityHeaders() {
  return {
    name: 'security-headers',
    hooks: {
      /** @param {{ dir: URL }} options */
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const pages = await Promise.all(
          (await htmlFiles(root)).map((file) => readFile(file, 'utf8')),
        );
        const hashes = collectInlineScriptHashes(pages);
        await writeFile(join(root, '_headers'), buildHeadersFile(hashes));
      },
    },
  };
}
