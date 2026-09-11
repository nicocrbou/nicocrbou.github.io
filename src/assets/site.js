// Progressive enhancement only: every page and archive record is already HTML.
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const mobile = window.matchMedia('(max-width: 960px)');
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuButton.focus();
}
menuButton.hidden = false;
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
mobile.addEventListener('change', () => closeMenu());

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
for (const list of document.querySelectorAll('[data-filter-list]')) {
  const form = list.querySelector('[data-filters]');
  const items = [...list.querySelectorAll('[data-filter-item]')];
  const searchable = new Map(items.map(item => [item, normalize(item.textContent)]));
  const count = list.querySelector('[data-result-count]');
  const empty = list.querySelector('[data-empty-state]');
  form.hidden = false;
  const keys = ['q', 'year', 'type'].filter(key => form.elements.namedItem(key));
  function restore() {
    const params = new URLSearchParams(location.search);
    for (const key of keys) form.elements.namedItem(key).value = params.get(key) || '';
  }
  function filter(updateUrl = true) {
    const query = normalize(form.elements.namedItem('q').value);
    const year = form.elements.namedItem('year').value;
    const type = form.elements.namedItem('type')?.value || '';
    const words = query.split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const item of items) {
      const matches = (!year || item.dataset.year === year) && (!type || item.dataset.type === type) && words.every(word => searchable.get(item).includes(word));
      item.hidden = !matches;
      if (matches) visible++;
    }
    for (const group of list.querySelectorAll('[data-filter-group]')) group.hidden = !group.querySelector('[data-filter-item]:not([hidden])');
    count.textContent = `${visible} of ${items.length} ${list.querySelector('.publication-list') ? 'publications' : 'entries'}`;
    empty.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      for (const key of keys) {
        const value = form.elements.namedItem(key).value.trim();
        if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      }
      history.replaceState(null, '', url);
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  form.addEventListener('input', () => filter());
  form.addEventListener('change', () => filter());
  form.addEventListener('reset', event => {
    event.preventDefault();
    for (const key of keys) form.elements.namedItem(key).value = '';
    filter();
  });
  list.querySelector('[data-reset]')?.addEventListener('click', () => { form.reset(); form.elements.namedItem('q').focus(); });
  window.addEventListener('popstate', () => { restore(); filter(false); });
  restore(); filter(false);
}

// Preserve incoming fragment links, including the original space-containing IDs.
function revealFragment() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  for (let parent = target.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
  target.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', revealFragment);
revealFragment();

// A quiet location cue for long Research and Team pages.
const sectionLinks = [...document.querySelectorAll('.section-nav a')];
if (sectionLinks.length && 'IntersectionObserver' in window) {
  const sections = sectionLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const active = entries.find(entry => entry.isIntersecting);
    if (!active) return;
    for (const link of sectionLinks) {
      const current = decodeURIComponent(link.hash.slice(1)) === active.target.id;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
