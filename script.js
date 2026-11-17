import { showcaseItems } from './showcase-data.js';

document.getElementById('year').textContent = new Date().getFullYear();

const track = document.getElementById('gallery-track');
const dots = document.getElementById('gallery-dots');
const status = document.getElementById('gallery-status');
const previous = document.getElementById('gallery-prev');
const next = document.getElementById('gallery-next');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function renderPhone(profile, index) {
  const cover = profile.coverImage
    ? `<img class="phone-cover-image" src="${escapeHtml(profile.coverImage)}" alt="${escapeHtml(profile.coverImageAlt || '')}" loading="lazy" />`
    : `<span class="cover-monogram" aria-hidden="true">${escapeHtml(profile.monogram)}</span>`;
  const avatar = profile.portrait
    ? `<img src="${escapeHtml(profile.portrait)}" alt="${escapeHtml(profile.portraitAlt || '')}" loading="lazy" />`
    : `<span aria-hidden="true">${escapeHtml(profile.monogram)}</span>`;
  const actions = profile.actions.map((action) => `<span class="screen-action">${escapeHtml(action)}</span>`).join('');
  const details = profile.details.map((detail) => `<span class="screen-detail"><span class="detail-dot" aria-hidden="true"></span>${escapeHtml(detail)}</span>`).join('');

  return `<article class="gallery-item theme-${escapeHtml(profile.theme)}" aria-label="${escapeHtml(profile.label)} ${profile.demo ? 'demo concept' : 'profile'}">
    <div class="phone-frame"><div class="phone-screen">
      <div class="phone-status" aria-hidden="true"><span>9:41</span><span class="status-bars">▮▮▮</span></div>
      <span class="phone-island" aria-hidden="true"></span>
      <div class="phone-cover">${cover}<span class="phone-cover-tag">${profile.demo ? 'DEMO CONCEPT' : 'DIGITAL PROFILE'} / ${String(index + 1).padStart(2, '0')}</span></div>
      <div class="phone-content"><div class="phone-avatar">${avatar}</div><p class="phone-type">${escapeHtml(profile.label)}</p><h3>${escapeHtml(profile.title)}</h3><p class="phone-role">${escapeHtml(profile.role)}</p><p class="phone-note">${escapeHtml(profile.note)}</p><div class="screen-actions">${actions}</div><div class="screen-details">${details}</div><p class="screen-foot">A little more than a card.</p></div>
    </div></div><p class="item-caption"><span>${String(index + 1).padStart(2, '0')} / ${escapeHtml(profile.label)}</span><span>${profile.demo ? 'DEMO' : 'PROFILE'}</span></p>
  </article>`;
}

track.innerHTML = showcaseItems.map(renderPhone).join('');
dots.innerHTML = showcaseItems.map((profile, index) => `<button type="button" class="gallery-dot" aria-label="Show ${escapeHtml(profile.label)} demo" data-index="${index}"></button>`).join('');

const items = [...track.querySelectorAll('.gallery-item')];
const dotButtons = [...dots.querySelectorAll('.gallery-dot')];
let activeIndex = 0;
let scrollFrame = 0;
let dragStartX = 0;
let dragStartScroll = 0;
let dragging = false;

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
  status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')} — ${showcaseItems[activeIndex].label}`;
}

function closestIndex() {
  const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
  let closest = 0;
  let closestDistance = Infinity;
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
    if (distance < closestDistance) { closest = index; closestDistance = distance; }
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
dots.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-index]');
  if (button) goTo(Number(button.dataset.index));
});
track.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goTo(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
track.addEventListener('scroll', () => {
  if (dragging) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => updateActive(closestIndex()));
}, { passive: true });

// Touch devices use native scrolling and CSS snapping. Mouse users can drag.
track.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  dragging = true;
  dragStartX = event.clientX;
  dragStartScroll = track.scrollLeft;
  track.classList.add('is-dragging');
  track.setPointerCapture(event.pointerId);
});
track.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
});
function endDrag() {
  if (!dragging) return;
  dragging = false;
  track.classList.remove('is-dragging');
  goTo(closestIndex());
}
track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);
track.addEventListener('lostpointercapture', endDrag);

const initialIndex = window.innerWidth >= 900 ? 1 : 0;
updateActive(initialIndex);
requestAnimationFrame(() => {
  goTo(initialIndex, false);
});
