import { showcaseItems } from './showcase-data.js';
import { translations } from './translations.js';
import { copyPhone, downloadVcard } from './contact.js';
import { landingUrl } from './site-config.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const supportedLanguages = ['en', 'fr', 'ar'];
const queryLanguage = new URLSearchParams(location.search).get('lang');
let storedLanguage;
try { storedLanguage = localStorage.getItem('hamza-language'); } catch { /* Private mode. */ }
const browserLanguage = (navigator.languages?.[0] || navigator.language || 'en').split('-')[0].toLowerCase();
let language = [queryLanguage, storedLanguage, browserLanguage, 'en'].find((value) => supportedLanguages.includes(value));
let copyFeedback = false;
const t = () => translations[language];

document.getElementById('year').textContent = new Date().getFullYear();
const contactFeedback = document.getElementById('contact-feedback');
const stage = document.getElementById('scan-stage');
const trigger = document.getElementById('scan-trigger');
const scanStatus = document.getElementById('scan-status');
const address = landingUrl();
let addressLabel;
try { addressLabel = new URL(address).host || address; } catch { addressLabel = address; }
for (const id of ['scan-phone-host', 'scan-notification-url', 'scan-browser-url']) {
  document.getElementById(id).textContent = addressLabel;
}

function translateStatic() {
  const strings = t();
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = strings.pageTitle;
  document.querySelector('meta[name="description"]').content = strings.metaDescription;
  document.querySelector('meta[property="og:title"]').content = strings.pageTitle;
  document.querySelector('meta[property="og:description"]').content = strings.metaDescription;
  document.querySelector('meta[name="twitter:title"]').content = strings.pageTitle;
  document.querySelector('meta[name="twitter:description"]').content = strings.metaDescription;
  document.querySelector('meta[property="og:image:alt"]').content = strings.portraitAlt;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = strings[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { element.innerHTML = strings[element.dataset.i18nHtml]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', strings[element.dataset.i18nAria]); });
  document.querySelectorAll('[data-i18n-roledescription]').forEach((element) => { element.setAttribute('aria-roledescription', strings[element.dataset.i18nRoledescription]); });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => { element.alt = strings[element.dataset.i18nAlt]; });
  document.querySelectorAll('[data-lang]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.lang === language)); });
  document.querySelector('.scan-phone-preview img').src = `assets/landing-preview-${language}.webp`;
  if (!copyFeedback) contactFeedback.querySelector('span').textContent = strings.contactHelp;
  scanStatus.textContent = strings[{ idle: 'scanIdle', scanning: 'scanScanning', prompt: 'scanPrompt', preview: 'scanPreview' }[stage.dataset.state]];
  trigger.textContent = strings[stage.dataset.state === 'idle' ? 'scanTry' : 'scanReplay'];
}

document.querySelector('.language-switch').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-lang]');
  if (!button || button.dataset.lang === language) return;
  language = button.dataset.lang;
  try { localStorage.setItem('hamza-language', language); } catch { /* Private mode. */ }
  copyFeedback = false;
  translateStatic();
  renderGallery();
});

document.getElementById('save-contact').addEventListener('click', async () => {
  copyFeedback = true;
  try {
    downloadVcard();
    contactFeedback.querySelector('span').textContent = t().contactSaved;
  } catch {
    const copied = await copyPhone();
    contactFeedback.querySelector('span').textContent = t()[copied ? 'numberCopied' : 'copyFailed'];
  }
});
document.getElementById('copy-number').addEventListener('click', async () => {
  copyFeedback = true;
  const copied = await copyPhone();
  contactFeedback.querySelector('span').textContent = t()[copied ? 'numberCopied' : 'copyFailed'];
});

let scanTimers = [];
let scanRun = 0;
let scanObserver;
function clearScanTimers() { scanTimers.forEach(clearTimeout); scanTimers = []; }
function setScanState(state) {
  stage.dataset.state = state;
  scanStatus.textContent = t()[{ idle: 'scanIdle', scanning: 'scanScanning', prompt: 'scanPrompt', preview: 'scanPreview' }[state]];
  trigger.textContent = t()[state === 'idle' ? 'scanTry' : 'scanReplay'];
}
function startScan() {
  scanObserver?.disconnect();
  const currentRun = ++scanRun;
  clearScanTimers();
  setScanState('idle');
  // The state change in a new frame lets replay restart the CSS movement.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (currentRun !== scanRun) return;
    setScanState('scanning');
    const promptAt = reduceMotion.matches ? 120 : 1050;
    const previewAt = reduceMotion.matches ? 800 : 2150;
    scanTimers.push(setTimeout(() => setScanState('prompt'), promptAt));
    scanTimers.push(setTimeout(() => setScanState('preview'), previewAt));
  }));
}
trigger.addEventListener('click', startScan);
if ('IntersectionObserver' in window) {
  scanObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) startScan();
  }, { threshold: 0.35 });
  scanObserver.observe(stage);
}

const track = document.getElementById('gallery-track');
const dots = document.getElementById('gallery-dots');
const status = document.getElementById('gallery-status');
const previous = document.getElementById('gallery-prev');
const next = document.getElementById('gallery-next');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
let items = [];
let dotButtons = [];
let activeIndex = window.innerWidth >= 900 ? 1 : 0;
let scrollFrame = 0;
let dragStartX = 0;
let dragStartScroll = 0;
let dragging = false;

function renderPhone(profile, index) {
  const strings = t();
  const content = strings.profiles[profile.id];
  const cover = profile.coverImage
    ? `<img class="phone-cover-image" src="${escapeHtml(profile.coverImage)}" alt="${escapeHtml(profile.coverImageAlt || '')}" loading="lazy" />`
    : `<span class="cover-monogram" aria-hidden="true">${escapeHtml(profile.monogram)}</span>`;
  const avatar = profile.portrait
    ? `<img src="${escapeHtml(profile.portrait)}" alt="${escapeHtml(profile.portraitAlt || '')}" loading="lazy" />`
    : `<span aria-hidden="true">${escapeHtml(profile.monogram)}</span>`;
  const actions = content.actions.map((action) => `<span class="screen-action">${escapeHtml(action)}</span>`).join('');
  const details = content.details.map((detail) => `<span class="screen-detail"><span class="detail-dot" aria-hidden="true"></span>${escapeHtml(detail)}</span>`).join('');
  const itemLabel = `${content.label} ${profile.demo ? strings.demoConcept : strings.digitalProfile}`;
  return `<article class="gallery-item theme-${escapeHtml(profile.theme)}" aria-label="${escapeHtml(itemLabel)}">
    <div class="phone-frame"><div class="phone-screen">
      <div class="phone-status" aria-hidden="true"><span>9:41</span><span class="status-bars">▮▮▮</span></div>
      <span class="phone-island" aria-hidden="true"></span>
      <div class="phone-cover">${cover}<span class="phone-cover-tag">${profile.demo ? strings.demoConcept : strings.digitalProfile} / ${String(index + 1).padStart(2, '0')}</span></div>
      <div class="phone-content"><div class="phone-avatar">${avatar}</div><p class="phone-type">${escapeHtml(content.label)}</p><h3>${escapeHtml(content.title)}</h3><p class="phone-role">${escapeHtml(content.role)}</p><p class="phone-note">${escapeHtml(content.note)}</p><div class="screen-actions">${actions}</div><div class="screen-details">${details}</div><p class="screen-foot">${strings.phoneFoot}</p></div>
    </div></div><p class="item-caption"><span>${String(index + 1).padStart(2, '0')} / ${escapeHtml(content.label)}</span><span>${profile.demo ? strings.demo : strings.profile}</span></p>
  </article>`;
}

function renderGallery() {
  track.innerHTML = showcaseItems.map(renderPhone).join('');
  dots.innerHTML = showcaseItems.map((profile, index) => `<button type="button" class="gallery-dot" aria-label="${escapeHtml(t().showDemo.replace('{name}', t().profiles[profile.id].label))}" data-index="${index}"></button>`).join('');
  items = [...track.querySelectorAll('.gallery-item')];
  dotButtons = [...dots.querySelectorAll('.gallery-dot')];
  status.textContent = '';
  updateActive(activeIndex);
  requestAnimationFrame(() => goTo(activeIndex, false));
}

function updateActive(index) {
  const nextIndex = Math.max(0, Math.min(index, items.length - 1));
  if (nextIndex === activeIndex && status.textContent) return;
  activeIndex = nextIndex;
  items.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === activeIndex));
  dotButtons.forEach((dot, dotIndex) => {
    if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  previous.disabled = activeIndex === 0;
  next.disabled = activeIndex === items.length - 1;
  status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')} — ${t().profiles[showcaseItems[activeIndex].id].label}`;
}
function closestIndex() {
  const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
  let closest = 0;
  let distance = Infinity;
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const delta = Math.abs(rect.left + rect.width / 2 - trackCenter);
    if (delta < distance) { closest = index; distance = delta; }
  });
  return closest;
}
function goTo(index, animated = true) {
  const target = Math.max(0, Math.min(index, items.length - 1));
  const item = items[target];
  const itemRect = item.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const left = track.scrollLeft + itemRect.left - trackRect.left - (track.clientWidth - itemRect.width) / 2;
  track.scrollTo({ left, behavior: animated && !reduceMotion.matches ? 'smooth' : 'auto' });
  updateActive(target);
}
previous.addEventListener('click', () => goTo(activeIndex - 1));
next.addEventListener('click', () => goTo(activeIndex + 1));
dots.addEventListener('click', (event) => { const button = event.target.closest('button[data-index]'); if (button) goTo(Number(button.dataset.index)); });
track.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    goTo(activeIndex + (language === 'ar' ? -direction : direction));
  }
});
track.addEventListener('scroll', () => {
  if (dragging) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => updateActive(closestIndex()));
}, { passive: true });
track.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  dragging = true;
  dragStartX = event.clientX;
  dragStartScroll = track.scrollLeft;
  track.classList.add('is-dragging');
  track.setPointerCapture(event.pointerId);
});
track.addEventListener('pointermove', (event) => { if (dragging) track.scrollLeft = dragStartScroll - (event.clientX - dragStartX); });
function endDrag() {
  if (!dragging) return;
  dragging = false;
  track.classList.remove('is-dragging');
  goTo(closestIndex());
}
track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);
track.addEventListener('lostpointercapture', endDrag);
translateStatic();
renderGallery();
