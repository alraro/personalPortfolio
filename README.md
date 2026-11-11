# alfonsoramos.dev

The personal portfolio site of Alfonso Ramos Rojas, a fast static site in English and Spanish.

[![CI](https://github.com/alraro/personalPortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/alraro/personalPortfolio/actions/workflows/ci.yml)

## What this is

A portfolio that presents the Owner's Projects, Experience, Education, Events and Awards to Visitors. The source is public so that the way the site is built can be read and checked.

## Stack

- **Astro with React islands**: static HTML for speed and SEO, JavaScript only where a page is interactive.
- **TypeScript**: typed content and components catch mistakes at build time.
- **Tailwind CSS v4**: design tokens drive styling, so the look changes in one place.
- **pnpm**: a fast package manager with a reproducible lockfile.
- **Cloudflare Pages**: hosting and the deploy pipeline are under version control.

## Pipeline

On every pull request and on merge to `main`:

1. Lint (ESLint and Prettier)
2. Typecheck
3. Content validation (planned)
4. Build
5. Unit tests
6. Browser and accessibility tests
7. Lighthouse thresholds (planned)
8. Link check (planned)
9. Preview deploy (pull requests)
10. Production deploy (merge to `main`)

## Editing content

Content lives in versioned content files in this repository. (Details to be completed by the content tickets.)

### Profile (name, photo, headline, About)

`src/content/profile/` holds `meta.yaml` (name, photo, GitHub, LinkedIn and email), `photo.jpg`, and `en.md` / `es.md` (frontmatter `headline` and `photoAlt`; the body is the About text). Edit these files; both languages are required.

### Adding a CV

Put the PDF in `public/cv/` named `cv-en.pdf` and/or `cv-es.pdf`. The "Download CV" button then appears automatically on `/en/` and/or `/es/`, one language at a time. With no file for a language, no button is shown. Do not commit a placeholder PDF.

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

## Contributing

Pull requests are squash-merged only, so the PR title becomes the commit message. The title must follow [Conventional Commits](https://www.conventionalcommits.org/) with one of these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. A CI check enforces this.

## Privacy

This site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) to count Visitors. It is cookie-free, collects no personal data and does no cross-site tracking, so no cookie banner is needed. No other analytics or tracking code is included.

## Licence

The source code is released under the [MIT licence](LICENSE).

The content (texts, photos, images, videos and CV) is © Alfonso Ramos Rojas, all rights reserved, and is not covered by the MIT licence.
