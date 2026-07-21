## Print-friendly CV

Personal CV site built with Astro and Tailwind CSS. Content is data-driven from `cv.json`, with a light/dark theme switch and an exportable PDF version.

## Stack

- [**Astro**](https://astro.build/)
- [**Tailwind CSS 4**](https://tailwindcss.com/)
- [**Alpine.js**](https://alpinejs.dev/)
- **TypeScript**

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) to view the result.

## Commands

|     | Command   | Action                                                          |
| :-- | :-------- | :--------------------------------------------------------------- |
| ⚙️  | `dev`     | Launches a local development server at `localhost:4321`.        |
| ⚙️  | `build`   | Checks for errors and creates a production build in `./dist/`.  |
| ⚙️  | `preview` | Local preview of the production build.                          |

## Content

Edit `cv.json` to update the CV content. The `theme` property in `cv.json` selects one of the available colour themes (`default`, `blue`, `red`, `green`, `cyber`); each has light and dark variants defined in `src/styles/global.css`.
