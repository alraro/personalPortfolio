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
