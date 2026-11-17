# Hamza Raddi — personal NFC card landing page

A lightweight, single-page website built with HTML, CSS, and native JavaScript. It introduces Hamza, his NFC card service, and four clearly marked demo profile concepts. No runtime dependencies or animation libraries are used.

## Run locally

```sh
npm run dev
```

Open <http://localhost:4173>. The local server serves the source files directly.

## Check and build

```sh
npm run lint
npm run build
```

The build copies the deployable site into `dist/`. There is no TypeScript, so there is no type-check command. `vercel.json` points Vercel at the build output. If connecting the parent Git repository, set `landing-page-of-me` as the Vercel project root.

## Contact and public URL

After the personal introduction, the contact area presents Call, WhatsApp, Instagram, and Facebook in two columns, followed by full-width My Website and Save My Contact cards. A small copy-number fallback stays below the cards. LinkedIn and GitHub are linked in the footer. The vCard is generated as UTF-8 vCard 3.0 with CRLF line endings and includes Hamza's name, phone, social URLs, and this landing page's URL. On supported phones, opening the downloaded `.vcf` offers contact import; visitors still confirm saving it in their contacts.

`site-config.js` holds the phone and social links. Its `publicSiteUrl` is currently empty, so the vCard and NFC phone address use the page's current URL. After choosing a permanent public domain, set `publicSiteUrl` there to keep saved contacts on the canonical URL. On local development the vCard uses localhost.

The main sales CTA opens Instagram direct messages for `@hamzaraddi`. The direct Facebook profile URL was supplied by Hamza. LinkedIn, GitHub, and the existing development portfolio are also linked.

## Languages and NFC demo

English, French, and Arabic copy lives in `translations.js`. The switcher changes the page without a reload, saves the selection in local storage, and starts from the browser's language when there is no prior selection. `?lang=en`, `?lang=fr`, and `?lang=ar` can be used for review. Arabic sets `dir="rtl"` and uses local Arabic fonts.

The scan section is an interactive *simulation*. It starts once when the phone mockup enters view, and the button replays it. The sequence moves a card toward a phone, shows an NFC link prompt, and reveals a screenshot of this page. Actual NFC use requires a physical tag programmed with the landing page URL. The three optimized screenshots in `assets/landing-preview-*.webp` are captures of this site, one per language; regenerate them after major changes to the hero or contact area.

## Replace the demo profiles

The phone gallery's configuration lives in `showcase-data.js`; translated words are in `translations.js`. Each entry controls its colors and optional `portrait` and `coverImage` paths. Add approved images to `assets/`, set their local paths and descriptive `portraitAlt` or `coverImageAlt` text, and change `demo` to `false` only for real, approved profiles. The gallery interaction does not need to change.

The current screens are illustrative concepts. No client names, photos, or results are claimed. The portrait is a resized, metadata-free local copy of Hamza's existing portfolio image. Asset sources and licenses are in `assets/LICENSES.md`.
