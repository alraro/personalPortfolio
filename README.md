# personalPortfolio

Personal portfolio of Alfonso Ramos Rojas, built with Astro, Tailwind CSS v4 and TypeScript. Deployed to https://alfonsoramos.dev.

## Development

Prerequisites:

- Node.js 26 (see `.nvmrc`)
- pnpm (version pinned by the `packageManager` field; enable it with `corepack enable`)

```sh
pnpm install
pnpm dev
```

Scripts:

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start the dev server                              |
| `pnpm build`        | Type-check with `astro check`, then `astro build` |
| `pnpm preview`      | Serve the production build locally                |
| `pnpm lint`         | Run ESLint                                        |
| `pnpm format`       | Format all files with Prettier                    |
| `pnpm format:check` | Check formatting without writing                  |
| `pnpm typecheck`    | Run `astro check`                                 |
| `pnpm test`         | Run the Vitest unit tests once                    |
| `pnpm test:watch`   | Run Vitest in watch mode                          |
| `pnpm test:e2e`     | Run the Playwright tests against the built site   |

### Tests

There are two test seams:

- **Pure logic (Vitest, `node` environment, no DOM or Astro runtime).** Test files sit next to the module they test as `src/**/*.test.ts` (for example `src/lib/format-year.ts` and `src/lib/format-year.test.ts`).
- **The built site in a real browser (Playwright with axe).** Tests live in `e2e/*.spec.ts` and run in two projects, `desktop` (1280x800) and `mobile` (390x844, touch). They run against the production build served by `pnpm preview`, so run `pnpm build` first. Call `expectNoAxeViolations(page)` from `e2e/helpers/axe.ts` for accessibility checks (WCAG 2.0 to 2.2 A/AA).

First time only: `pnpm exec playwright install chromium`. After a failing run, open the report with `pnpm exec playwright show-report`.
