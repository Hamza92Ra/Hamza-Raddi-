# Hamza Raddi — personal landing page

A small, static personal introduction built with HTML, CSS, and a few lines of JavaScript. It uses no runtime dependencies.

## Run locally

```sh
npm run dev
```

Open <http://localhost:4173>.

## Check and build

```sh
npm run lint
npm run build
```

The build copies the site into `dist/`. It can also be served directly from the repository root by a static host. There is no TypeScript, so there is no type-check step.

For Vercel, [`vercel.json`](vercel.json) runs this build and serves `dist/`. If connecting the parent Git repository, set this directory (`landing-page-of-me`) as the Vercel project root.

## Assets and links

The portrait is downloaded from Hamza's existing portfolio. The Facebook link is the people-search URL used there; replace it with a direct profile URL when one is available. The social sharing image currently points to that same public portrait URL so crawlers can resolve an absolute image URL before this site has its own domain.

Font and icon sources and licenses are recorded in [`assets/LICENSES.md`](assets/LICENSES.md).
# Hamza-Raddi-
