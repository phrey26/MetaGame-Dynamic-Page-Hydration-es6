
const DEFAULT_CONFIG = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
  defaultDistance: 32,
  defaultDuration: 700
};

function injectRevealStyles(distance, duration) {
  if (document.getElementById('reveal-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'reveal-fx-styles';
  style.textContent = `
    /* Elements stay fully visible with no JS / reduced-motion — the
       hidden starting state only exists when animation will run. */
    [data-reveal] { opacity: 1; }

    @media (prefers-reduced-motion: no-preference) {
      [data-reveal] {
        opacity: 0;
        transition: opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1);
        will-change: opacity, transform;
      }
      [data-reveal="fade-up"]    { transform: translateY(${distance}px); }
      [data-reveal="fade-down"]  { transform: translateY(-${distance}px); }
      [data-reveal="fade-left"]  { transform: translateX(${distance}px); }
      [data-reveal="fade-right"] { transform: translateX(-${distance}px); }
      [data-reveal="zoom-in"]    { transform: scale(0.92); }
      [data-reveal="fade-in"]    { transform: none; }

      [data-reveal].is-visible {
        opacity: 1;
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}

async function loadRevealConfig() {
  try {
    const res = await fetch('data/effects.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/effects.json responded ${res.status}`);
    const data = await res.json();
    return { ...DEFAULT_CONFIG, ...(data.reveal || {}) };
  } catch (err) {
    // Fetch failed — fall back to defaults so the effect still runs.
    console.error('[reveal] using default config —', err);
    return DEFAULT_CONFIG;
  }
}

export async function loadScrollReveal() {
  const config = await loadRevealConfig();
  injectRevealStyles(config.defaultDistance, config.defaultDuration);

  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  items.forEach((el) => {
    const delay = el.dataset.revealDelay;
    if (delay) el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: config.threshold, rootMargin: config.rootMargin });

  items.forEach((el) => observer.observe(el));
}