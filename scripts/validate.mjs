import { readFile, access } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');
const assetPaths = [
  ...html.matchAll(/(?:src|href)="(assets\/[^\"]+)"/g),
  ...css.matchAll(/url\("(assets\/[^\"]+)"\)/g),
].map((match) => match[1]);

for (const path of assetPaths) await access(path);

const externalLinks = [...html.matchAll(/<a\b[^>]*href="https?:[^\"]+"[^>]*>/g)].map((match) => match[0]);
for (const link of externalLinks) {
  if (!link.includes('target="_blank"') || !link.includes('rel="noopener noreferrer"')) {
    throw new Error(`External link needs safe new-tab attributes: ${link}`);
  }
}

if (/<(?:img)\b(?![^>]*\balt=)[^>]*>/i.test(html)) throw new Error('An image is missing alt text');
if (/\bproject(?:s)?\b/i.test(html.replace(/full portfolio/gi, ''))) throw new Error('Unexpected project content');
console.log(`Validated ${assetPaths.length} asset references and ${externalLinks.length} external links.`);
