async function loadPageFxConfig() {
  try {
    const res = await fetch('data/effects.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/effects.json responded ${res.status}`);
    const data = await res.json();
    return data.progressBar || {};
  } catch (err) {
    console.error('[page-progress] using default config —', err);
    return {};
  }
}

function injectPageFxStyles(color, height) {
  if (document.getElementById('page-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'page-fx-styles';
  style.textContent = `
    #scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: ${height}px;
      width: 0%;
      background: ${color};
      z-index: 60;
      transition: width 0.1s linear;
    }

    #back-to-top {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 9999px;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.55);
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
      z-index: 55;
    }
    #back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    #back-to-top:hover { background: #1d4ed8; }

    #navbar-desktop-links a.nav-active,
    #navbar-mobile-links a.nav-active {
      background-color: #fff;
      color: #0f172a;
    }
  `;
  document.head.appendChild(style);
}

function buildScrollChrome() {
  let bar = document.getElementById('scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  let topBtn = document.getElementById('back-to-top');
  if (!topBtn) {
    topBtn = document.createElement('button');
    topBtn.id = 'back-to-top';
    topBtn.type = 'button';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>`;
    document.body.appendChild(topBtn);
  }

  return { bar, topBtn };
}

function initProgressAndBackToTop(bar, topBtn) {
  let ticking = false;

  function update() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
    topBtn.classList.toggle('visible', scrollTop > window.innerHeight * 0.6);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  update();
}

function initScrollspy() {
  const navLinks = document.querySelectorAll('#navbar-desktop-links [data-nav-index]');
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  const linkGroups = new Map(); 

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const target = document.getElementById(href.slice(1));
    if (!target || linkGroups.has(target)) return;
    const group = document.querySelectorAll(`[data-nav-index="${link.dataset.navIndex}"]`);
    linkGroups.set(target, group);
  });

  if (!linkGroups.size) return;

  function setActive(activeTarget) {
    linkGroups.forEach((group) => group.forEach((l) => l.classList.remove('nav-active')));
    const activeGroup = linkGroups.get(activeTarget);
    if (activeGroup) activeGroup.forEach((l) => l.classList.add('nav-active'));
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target);
  }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20), rootMargin: '-30% 0px -40% 0px' });

  linkGroups.forEach((_, target) => observer.observe(target));
}

export async function loadPageProgress() {
  const cfg = await loadPageFxConfig();
  injectPageFxStyles(cfg.color || '#2563eb', cfg.height || 3);
  const { bar, topBtn } = buildScrollChrome();
  initProgressAndBackToTop(bar, topBtn);
  initScrollspy();
}