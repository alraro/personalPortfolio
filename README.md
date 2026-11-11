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
5. Unit tests (planned)
6. Browser and accessibility tests (planned)
7. Lighthouse thresholds (planned)
8. Link check (planned)
9. Preview deploy (pull requests)
10. Production deploy (merge to `main`)

## Editing content

Content lives in versioned content files in this repository. (Details to be completed by the content tickets.)

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

## Contributing

Pull requests are squash-merged only, so the PR title becomes the commit message. The title must follow [Conventional Commits](https://www.conventionalcommits.org/) with one of these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. A CI check enforces this.

## Privacy

This site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) to count Visitors. It is cookie-free, collects no personal data and does no cross-site tracking, so no cookie banner is needed. No other analytics or tracking code is included.

## Licence

The source code is released under the [MIT licence](LICENSE).

The content (texts, photos, images, videos and CV) is © Alfonso Ramos Rojas, all rights reserved, and is not covered by the MIT licence.
