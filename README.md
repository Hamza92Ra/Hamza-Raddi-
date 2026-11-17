# Hamza Raddi — personal NFC card landing page

A lightweight, static page built with HTML, CSS, and native JavaScript. It has no runtime dependencies.

## Run locally

```sh
npm run dev
```

Open <http://localhost:4173>. The server serves the source files directly.

## Check and build

```sh
npm run lint
npm run build
```

The build copies the deployable site into `dist/`. There is no TypeScript, so there is no type-check step. `vercel.json` points Vercel at the build output. If connecting the parent Git repository, set `landing-page-of-me` as the Vercel project root.

## Replace the demo profiles

The phone gallery's content lives in [`showcase-data.js`](showcase-data.js). Each entry controls its title, colors, labels, and optional `portrait` and `coverImage` paths. Add approved images to `assets/`, set their local paths and descriptive `portraitAlt` or `coverImageAlt` text in the entry, and change `demo` to `false` only when the content represents a real, approved profile. The gallery controls and scrolling code in `script.js` do not need to change.

The current screens are clearly labeled illustrative concepts. No client names, photos, or results are claimed.

## Contact and social links

The main CTA uses Instagram's `ig.me` messaging link for `@hamzaraddi`. Instagram's profile is also linked separately. The existing portfolio confirms the LinkedIn and GitHub URLs. It only has a Facebook search URL, so this page displays “Hamza Ra” without a clickable Facebook link until a direct profile URL is available.

The portrait is a resized, metadata-free local copy of Hamza's existing portfolio image. The Open Graph image points to the public original so social crawlers can resolve an absolute URL before this site has its own domain. Asset sources and licenses are in [`assets/LICENSES.md`](assets/LICENSES.md).
