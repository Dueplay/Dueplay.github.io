import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const isPC = () => !/Android|iPhone|Windows Phone|iPad|iPod/.test(navigator.userAgent);

initExternalLinks();
initLazyImages();
initCodeCopy();
initLightbox();
initPostToc();
initHeaderTitleFit();
if (isPC()) {
  initHeaderAutoHide();
  initFirework();
}

// 站外链接新窗口打开
function initExternalLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    if (link.hostname && link.hostname !== location.hostname) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
}

// 首屏之后的图片延迟加载
function initLazyImages() {
  document.querySelectorAll<HTMLImageElement>('.entry-content img').forEach((img, i) => {
    if (i > 1) {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
  });
}

function initCodeCopy() {
  document.querySelectorAll<HTMLElement>('.highlight').forEach((block) => {
    const btn = block.querySelector<HTMLButtonElement>('.copy-btn');
    const pre = block.querySelector('pre');
    if (!btn || !pre) return;
    let timer: number | undefined;
    btn.addEventListener('click', () => {
      const reset = () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('is-copied');
        }, 2000);
      };
      navigator.clipboard.writeText(pre.innerText).then(
        () => {
          btn.textContent = '✓ Copied';
          btn.classList.add('is-copied');
          reset();
        },
        () => {
          btn.textContent = '✗ Failed';
          reset();
        },
      );
    });
  });
}

// 点击正文图片放大预览，alt 作为图片说明
function initLightbox() {
  const imgs = document.querySelectorAll<HTMLImageElement>('.entry-content img');
  if (imgs.length === 0) return;

  const lightbox = new PhotoSwipeLightbox({
    gallery: '.entry-content',
    children: 'img:not(.no-zoom)',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.9,
    padding: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  lightbox.addFilter('domItemData', (itemData, element) => {
    const img = element as HTMLImageElement;
    itemData.src = img.dataset.pswpSrc || img.currentSrc || img.src;
    itemData.msrc = img.currentSrc || img.src;
    itemData.width = Number(img.dataset.width) || img.naturalWidth || window.innerWidth;
    itemData.height = Number(img.dataset.height) || img.naturalHeight || window.innerHeight;
    itemData.alt = img.alt;
    return itemData;
  });

  lightbox.on('uiRegister', () => {
    lightbox.pswp?.ui?.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (el, pswp) => {
        pswp.on('change', () => {
          const caption = (pswp.currSlide?.data.element as HTMLImageElement | undefined)?.alt || '';
          el.innerHTML = '';
          if (caption) {
            const div = document.createElement('div');
            div.className = 'pswp-caption-content';
            div.textContent = caption;
            el.appendChild(div);
          }
        });
      },
    });
  });

  lightbox.init();
}

// 右侧目录：根据滚动位置高亮当前章节
function initPostToc() {
  const nav = document.getElementById('J_post_toc_nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('.post-toc-link'));
  const items = links
    .map((link) => ({ link, heading: document.getElementById(link.dataset.tocId || '') }))
    .filter((item): item is { link: HTMLAnchorElement; heading: HTMLElement } => !!item.heading);
  if (items.length === 0) return;

  const update = () => {
    const pivot = window.innerHeight * 0.22;
    let active = items[0];
    for (const item of items) {
      if (item.heading.getBoundingClientRect().top <= pivot) active = item;
    }
    items.forEach((item) => item.link.classList.toggle('is-active', item === active));
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

// 横幅标语走 SVG textPath 不能换行，过长时整体等比缩小
function initHeaderTitleFit() {
  const svg = document.querySelector<SVGSVGElement>('.entry-header svg');
  const text = svg?.querySelector('text');
  if (!svg || !text) return;

  const MIN_SIZE = 20;
  const base = {
    size: parseFloat(text.getAttribute('font-size') || '36'),
    letter: parseFloat(text.getAttribute('letter-spacing') || '0'),
    word: parseFloat(text.getAttribute('word-spacing') || '0'),
  };
  const apply = (scale: number) => {
    text.setAttribute('font-size', String(base.size * scale));
    text.setAttribute('letter-spacing', String(base.letter * scale));
    text.setAttribute('word-spacing', String(base.word * scale));
  };
  const fit = () => {
    const avail = svg.clientWidth - 48;
    if (avail <= 0) return;
    apply(1);
    const natural = text.getComputedTextLength();
    if (natural > avail) apply(Math.max(MIN_SIZE / base.size, avail / natural));
  };

  document.fonts?.ready.then(fit);
  fit();
  let pending: number | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(pending);
    pending = window.setTimeout(fit, 150);
  });
}

// 向下滚动隐藏导航，向上滚动显示
function initHeaderAutoHide() {
  const header = document.getElementById('J_header');
  if (!header) return;
  let last = document.documentElement.scrollTop;
  document.addEventListener(
    'scroll',
    () => {
      const now = document.documentElement.scrollTop;
      header.classList.toggle('header-menu-overflow', now - last > 0 && now > 0);
      last = now;
    },
    { passive: true },
  );
}

// 横幅区域跟随鼠标飘落的光点
function initFirework() {
  const canvas = document.getElementById('J_firework_canvas') as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const HEIGHT = 260;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = HEIGHT;
  };
  resize();
  window.addEventListener('resize', resize);

  type Point = { x: number; y: number; speed: number; alpha: number };
  let points: Point[] = [];
  const mouse = { x: 0, y: 9999 };
  let visible = true;

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(canvas);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = 0;
    mouse.y = 9999;
  });

  const draw = () => {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mouse.y < HEIGHT) {
      for (let i = 0; i < 5; i++) {
        points.push({ x: mouse.x + Math.random() * 10, y: mouse.y + Math.random() * 10, speed: 1 + Math.random() * 2, alpha: Math.random() - 0.1 });
      }
    }
    ctx.fillStyle = '#f3ebdb';
    for (const p of points) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
    }
    ctx.globalAlpha = 1;
    points = points.filter((p) => p.y <= canvas.height);
  };
  draw();
}
