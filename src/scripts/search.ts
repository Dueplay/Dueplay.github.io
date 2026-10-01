type SearchItem = {
  title: string;
  url: string;
  date: string;
  categories: string[];
  summary: string;
  content: string;
};

const modal = document.getElementById('search-modal');
const input = document.getElementById('search-input') as HTMLInputElement | null;
const results = document.getElementById('search-results');
const openBtn = document.getElementById('search-btn');
const closeBtn = document.getElementById('search-close');

let data: SearchItem[] | null = null;
let selected = -1;

if (modal && input && results) {
  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    const typing = e.target instanceof HTMLElement && e.target.matches('input, textarea, [contenteditable]');
    if (e.key === '/' && !isOpen() && !typing) {
      e.preventDefault();
      open();
      return;
    }
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault();
      const item = items()[selected];
      if (item) location.href = item.href;
    }
  });

  let timer: number | undefined;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(search, 200);
  });
}

function isOpen() {
  return modal!.classList.contains('active');
}

function open() {
  modal!.classList.add('active');
  modal!.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showMessage('search-empty-state', 'Type to search articles...');
  setTimeout(() => input!.focus(), 100);
  if (!data) load();
}

function close() {
  input!.blur();
  modal!.classList.remove('active');
  modal!.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  input!.value = '';
  results!.innerHTML = '';
  selected = -1;
}

function load() {
  fetch('/search.json')
    .then((res) => res.json())
    .then((json: SearchItem[]) => {
      data = json;
      if (input!.value.trim()) search();
    })
    .catch(() => showMessage('search-error', 'Failed to load search data'));
}

function search() {
  const query = input!.value.trim().toLowerCase();
  if (!query) return showMessage('search-empty-state', 'Type to search articles...');
  if (!data) return showMessage('search-loading', 'Loading...');

  const matched = data.filter(
    (post) =>
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.categories.some((c) => c.toLowerCase().includes(query)),
  );
  render(matched.slice(0, 10), query);
}

function render(list: SearchItem[], query: string) {
  selected = -1;
  if (list.length === 0) return showMessage('search-no-results', 'No results found');

  results!.innerHTML = list
    .map((post, i) => {
      const category = post.categories[0];
      return `
        <a href="${post.url}" class="search-result-item" data-index="${i}" role="option">
          <div class="search-result-title">${highlight(post.title, query)}</div>
          <div class="search-result-summary">${highlight(snippet(post, query), query)}</div>
          <div class="search-result-meta">
            ${category ? `<span class="search-result-category">${escapeHtml(category)}</span>` : ''}
            <span class="search-result-date">${post.date}</span>
          </div>
        </a>`;
    })
    .join('');

  items().forEach((item, i) =>
    item.addEventListener('mouseenter', () => {
      selected = i;
      updateSelection();
    }),
  );
}

// 摘要里没有关键词时，从正文截取命中位置附近的文字
function snippet(post: SearchItem, query: string) {
  if (post.summary.toLowerCase().includes(query)) return post.summary;
  const idx = post.content.toLowerCase().indexOf(query);
  if (idx < 0) return post.summary;
  const start = Math.max(0, idx - 30);
  return (start > 0 ? '…' : '') + post.content.slice(start, idx + 90);
}

function items() {
  return Array.from(results!.querySelectorAll<HTMLAnchorElement>('.search-result-item'));
}

function move(step: number) {
  const list = items();
  if (list.length === 0) return;
  selected = (selected + step + list.length) % list.length;
  updateSelection();
  list[selected].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function updateSelection() {
  items().forEach((item, i) => {
    item.classList.toggle('selected', i === selected);
    item.setAttribute('aria-selected', String(i === selected));
  });
}

function showMessage(className: string, text: string) {
  results!.innerHTML = `<div class="${className}">${text}</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function highlight(text: string, query: string) {
  const safe = escapeHtml(text);
  const pattern = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}
