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

## Architecture

- **Astro static output with React islands.** Pages are rendered to plain HTML at build time. React is used only for the animated hero (dithered background and decrypted name), loaded lazily and only when the Visitor allows motion.
- **Content catalogue (core and adapter).** Content files are read in one place, `src/lib/catalogue/index.ts` (the Astro adapter, the only module besides `src/content.config.ts` that touches the content collections). It hands plain data to the pure core (`core.ts`, `timeline.ts`, `events.ts`), which validates everything and builds the view models. Pages and components never read collections themselves. A broken or half-translated item fails the build with one message listing every problem.
- **i18n.** English and Spanish live under `/en/` and `/es/`. UI strings are in the typed dictionaries in `src/i18n/` (a missing key fails the build); content has one Markdown file per language. The root page redirects by stored choice, then browser language, then English.
- **Tokens and theme.** Colours, fonts and motion are design tokens in `src/styles/tokens.css` (dark by default, a light override on `data-theme`). Tailwind classes read the tokens, and an inline script sets the theme before first paint. The design-system page at `/en/design-system/` shows every component.
- **Security headers.** `src/integrations/security-headers.mjs` runs at build time: it hashes the inline scripts of the built pages and writes `dist/_headers` with a Content Security Policy and other headers for Cloudflare Pages.

## Pipeline

On every pull request and on merge to `main`:

1. Lint (ESLint and Prettier) and typecheck (`astro check`)
2. Build, which includes content validation: the catalogue fails the build on any invalid Project, Experience, Education or Event
3. Unit tests (Vitest)
4. Browser and accessibility tests (Playwright with axe), in a job that runs in the official Playwright container image
5. Lighthouse (mobile and desktop) with a minimum score of 95 in performance, accessibility, best practices and SEO
6. Link check (lychee). Absolute links to this site are remapped to the fresh build, so new pages in a pull request are not reported as broken
7. Preview deploy (pull requests)
8. Production deploy (merge to `main`)

A separate weekly workflow checks the links of the production site.

## Editing content

Content lives in versioned files in this repository, in `src/content/`. Every item has a `meta.yaml` (data shared by both languages) and an `en.md` and `es.md` (localized fields in the frontmatter, the Markdown body is the description). Both languages are required. HTML comments in Markdown are removed from the output. The build fails with a clear message if a rule is broken.

### Profile (name, photo, headline, About)

`src/content/profile/` holds `meta.yaml` (name, photo, GitHub, LinkedIn and email), `photo.jpg`, and `en.md` / `es.md` (frontmatter `headline` and `photoAlt`; the body is the About text). Edit these files; both languages are required.

### Adding a Project

Create `src/content/projects/<slug>/` with:

- `meta.yaml`: `order` (integer, 1 or more; lower comes first), `featured` (`true` shows it in the large Featured list, `false` in the compact "More projects" list), `tags` (1 to 6), `links.primary` (`type` is `repository`, `website`, `demo` or `paper`, with an `https://` `url`) and optional `links.secondary` (up to 3), and optional `media` (see below).
- `en.md` and `es.md`: frontmatter `title` (up to 60 characters) and `subtitle` (up to 120), plus `mediaAlt` when the Project has media. The body is the long description.

To reorder, change `order`. To move a Project between lists, change `featured`.

### Adding Experience or Education

Create `src/content/experience/<slug>/` or `src/content/education/<slug>/`, again with `meta.yaml`, `en.md` and `es.md`. There is no `order`: items are sorted with the current one first (`end: null`), then by end and start date, newest first.

- Experience `meta.yaml`: `organization`, optional `organizationUrl`, `location`, `start` and `end` (`YYYY-MM`, `end: null` for ongoing). Each language file has `role` in the frontmatter.
- Education `meta.yaml`: `institution`, optional `institutionUrl`, `location`, `start`, `end`. Each language file has `programme`.
- Language files may override `organization` / `institution` and `location` for that language. The body is an optional description.

### Adding an Event (and linking it to a Project)

Create `src/content/events/<slug>/` with `meta.yaml`: `date` (`YYYY-MM` or `YYYY-MM-DD`), `role` (`participant` or `volunteer`), optional `url`, and optional `project` (the slug of a Project). `en.md` and `es.md` have `name` and an optional `award` (up to 40 characters); the body is an optional one-sentence note, shown as plain text. Events are listed newest first.

To record an Award, set `project` to the Project's slug and `award` in each language file (for example "1st place"). The Project then shows an Award badge with the Event name. An unknown `project` slug fails the build, and only one Event may point to a given Project; both language files need the `award` or neither.

### Adding a CV

Put the PDF in `public/cv/` named `cv-en.pdf` and/or `cv-es.pdf`. The "Download CV" button then appears automatically on `/en/` and/or `/es/`, one language at a time. With no file for a language, no button is shown. Do not commit a placeholder PDF.

### Adding Media to a Project

A Project can have optional `media` in its `meta.yaml`, plus a `mediaAlt` (1 to 160 characters) in **both** `en.md` and `es.md`. Without `media`, the Project keeps its generated cover.

- `kind: image`: `src` is an image file inside the Project's folder (for example `./cover.png`). It is optimised automatically.
- `kind: video`: `mp4` (required) and `webm` (optional) are paths under `public/media/projects/<slug>/`, for example `/media/projects/minirt/demo.mp4`, and `poster` is an image file inside the Project's folder.
- Media is shown in a 16:10 frame (cropped to fit, so keep the subject centred).
- Videos must be at most 4 MB, ideally at most 15 seconds and silent. They play on hover or keyboard focus on desktop, and when scrolled into view on touch devices; never with reduced motion.
- Always provide a poster and alt text in both languages.
- Prefer MP4/WebM over GIF.

The build fails with a clear message if a rule is broken.

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

- **Pure logic (Vitest, `node` environment, no DOM or Astro runtime).** Test files sit next to the module they test as `src/**/*.test.ts` (for example `src/lib/nav.ts` and `src/lib/nav.test.ts`).
- **The built site in a real browser (Playwright with axe).** Tests live in `e2e/*.spec.ts` and run in two projects, `desktop` (1280x800) and `mobile` (390x844, touch). They run against the production build served by `pnpm preview`, so run `pnpm build` first. Call `expectNoAxeViolations(page)` from `e2e/helpers/axe.ts` for accessibility checks (WCAG 2.0 to 2.2 A/AA).

First time only: `pnpm exec playwright install chromium`. After a failing run, open the report with `pnpm exec playwright show-report`.

## Contributing

Pull requests are squash-merged only, so the PR title becomes the commit message. The title must follow [Conventional Commits](https://www.conventionalcommits.org/) with one of these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. A CI check enforces this.

## Privacy

This site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) to count Visitors. It is cookie-free, collects no personal data and does no cross-site tracking, so no cookie banner is needed. No other analytics or tracking code is included.

## Licence

The source code is released under the [MIT licence](LICENSE).

The content (texts, photos, images, videos and CV) is © Alfonso Ramos Rojas, all rights reserved, and is not covered by the MIT licence.
