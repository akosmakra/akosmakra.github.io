## CV

Personal CV site built with Astro and Tailwind CSS. Content is data-driven from `cv.json`, with a light/dark theme switch, an exportable PDF version, and a real, live-triggerable smoke test suite baked into the page itself.

## Stack

- [**Astro**](https://astro.build/)
- [**Tailwind CSS 4**](https://tailwindcss.com/)
- [**Alpine.js**](https://alpinejs.dev/)
- **TypeScript**
- [**Playwright**](https://playwright.dev/) — smoke tests, the cross-browser CI gate, and the live "Run Smoke Tests" trigger

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) to view the result.

## Commands

|     | Command         | Action                                                                                                                                                     |
| :-- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️  | `dev`            | Launches a local development server at `localhost:4321`.                                                                                                |
| ⚙️  | `build`          | Type-checks, builds the production site to `./dist/`, and generates the downloadable CV PDF.                                                            |
| ⚙️  | `preview`        | Local preview of the production build.                                                                                                                  |
| 🧪  | `test:e2e`       | Runs the Playwright smoke tests across chromium/firefox/webkit.                                                                                         |
| 🩺  | `quality-check`  | Runs the smoke tests plus a Lighthouse audit against the live site and writes `src/data/status.json` (powers the "Last updated" / smoke-test line at the bottom of the page). |

## Content

Edit `cv.json` to update the CV content. The `theme` property selects one of the available colour themes (`default`, `blue`, `red`, `green`, `cyber`); each has light and dark variants defined in `src/styles/global.css`.

`basics.metaDescription` is a separate, shorter field used for `<meta name="description">` and the Open Graph/Twitter tags — keep it under ~155 characters so Google doesn't truncate it in search results. `basics.summary` is the longer bio text and isn't rendered anywhere on the page currently.

## Testing & CI

- `tests/smoke.spec.ts` — the 8 smoke tests, run against chromium/firefox/webkit.
- `.github/workflows/deploy.yml` — builds, runs the full cross-browser suite as a gate, then deploys to GitHub Pages. A failing test blocks the deploy.
- `.github/workflows/quality-check.yml` — a scheduled daily run of `quality-check` against the live site, committing the refreshed `status.json`.
- `.github/workflows/live-smoke-tests.yml` — powers the "Run Smoke Tests Live" button in the header: a `workflow_dispatch`-only matrix of 8 jobs (one per test), triggered via a Cloudflare Worker, so a visitor can watch the real tests run against the real deployed site. Posts to a Discord webhook (`DISCORD_WEBHOOK_URL` repo secret) if any test fails.
- In dev mode only (`pnpm dev`), a "Simulate Failure" button next to it renders the failure UI locally — a randomly chosen row marked failed — without triggering a real run or spending CI minutes.

## SEO

- `@astrojs/sitemap` generates `sitemap-index.xml` at build time; `public/robots.txt` points to it.
- `src/layouts/Layout.astro` sets the canonical URL, JSON-LD `Person` structured data, and Open Graph/Twitter tags using `public/og-image.png` — a generated 1200×630 share card, not the profile photo (social platforms crop portrait images awkwardly).
- Verified in Google Search Console and Bing Webmaster Tools.
