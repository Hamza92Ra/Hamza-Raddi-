import { readFile, access } from 'node:fs/promises';
import { translations } from '../translations.js';
import { createVcard } from '../contact.js';

const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');
const sectionOrder = ['class="hero wrap"', 'class="quick-contact"', 'class="scan-demo"', 'class="showcase"', 'class="service wrap"', '<footer'];
const sectionPositions = sectionOrder.map((marker) => html.indexOf(marker));
if (sectionPositions.some((position, index) => position < 0 || (index > 0 && position <= sectionPositions[index - 1]))) {
  throw new Error('Unexpected section order');
}
if (translations.ar.nameDisplay !== 'حمزة الرادي' || translations.ar.facebookSubtitle !== 'Hamza Ra') {
  throw new Error('Arabic name or Facebook display name is incorrect');
}
if (JSON.stringify(translations.ar).includes('حمزة راضي')) throw new Error('Old Arabic family name remains');
const assetPaths = [
  ...html.matchAll(/(?:src|href)="(assets\/[^\"]+)"/g),
  ...css.matchAll(/url\("(assets\/[^\"]+)"\)/g),
].map((match) => match[1]);

for (const path of assetPaths) await access(path);
for (const lang of ['en', 'fr', 'ar']) await access(`assets/landing-preview-${lang}.webp`);

const translationKeys = [...html.matchAll(/data-i18n(?:-html|-aria|-alt|-roledescription)?="([^"]+)"/g)].map((match) => match[1]);
for (const lang of ['en', 'fr', 'ar']) {
  for (const key of translationKeys) {
    if (!translations[lang][key]) throw new Error(`Missing ${lang} translation: ${key}`);
  }
  for (const profile of ['personal', 'studio', 'business', 'professional']) {
    if (!translations[lang].profiles[profile]) throw new Error(`Missing ${lang} profile: ${profile}`);
  }
}

const vcard = createVcard('https://example.test/');
for (const field of ['BEGIN:VCARD\r\nVERSION:3.0\r\n', 'N:Raddi;Hamza;;;', 'FN:Hamza Raddi', 'TEL;TYPE=CELL,VOICE:+212673046307', 'URL;TYPE=HOME:https://example.test/', 'hamza.ra.3192/directory_intro', 'END:VCARD\r\n']) {
  if (!vcard.includes(field)) throw new Error(`Missing vCard field: ${field}`);
}

const externalLinks = [...html.matchAll(/<a\b[^>]*href="https?:[^\"]+"[^>]*>/g)].map((match) => match[0]);
for (const link of externalLinks) {
  if (!link.includes('target="_blank"') || !link.includes('rel="noopener noreferrer"')) {
    throw new Error(`External link needs safe new-tab attributes: ${link}`);
  }
}

if (/<(?:img)\b(?![^>]*\balt=)[^>]*>/i.test(html)) throw new Error('An image is missing alt text');
if (/\bproject(?:s)?\b/i.test(html.replace(/full portfolio/gi, ''))) throw new Error('Unexpected project content');
if (/[↗✳]/.test(html)) throw new Error('Unexpected shortcut glyph');
console.log(`Validated ${assetPaths.length} asset references, ${externalLinks.length} external links, 3 languages, and the vCard.`);
