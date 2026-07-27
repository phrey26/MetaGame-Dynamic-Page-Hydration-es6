/**
 * ---------------------------------------------------------------
 * Header section: hydration + scroll behavior
 * ---------------------------------------------------------------
 * Owns everything about the sticky top stripe bar and the
 * site-header's scroll hide/reveal + elevation shadow. Fully
 * self-contained — fetches header.json itself and falls back to
 * the static markup already in the page if that fetch fails.
 *
 * Effects and colors are exactly what shipped before; only
 * relocated here so header concerns live in one place.
 */

/**
 * header.json ships raw Tailwind class names (e.g. "bg-brand-green")
 * so the color stripe is data-driven, and that class name is still
 * applied to each segment (useful once/if the theme defines those
 * colors). But relying on the class ALONE means the stripe silently
 * disappears the moment a class like "bg-brand-green" isn't defined
 * in the consuming project's Tailwind theme — exactly what happened.
 * This map resolves the same class names to real paint values so the
 * stripe renders correctly regardless of the Tailwind build.
 */
const HEADER_STRIPE_COLOR_MAP = {
  'bg-brand-green': '#16a34a',
  'bg-brand-blue': '#2563eb',
  'bg-brand-yellow': '#facc15',
  'bg-brand-red': '#dc2626',
  'bg-white': '#ffffff',
  'bg-black': '#111827'
};

// Populated from header.json's optional "scrollEffect" block — falls
// back to these defaults if the field is missing, so the hide/reveal
// behavior still works even against an older header.json.
const headerScrollConfig = {
  hideOnScrollDown: true,
  revealThreshold: 72
};

/**
 * These are plain CSS keyframes/rules injected at runtime instead of
 * Tailwind utility classes, on purpose: Tailwind only compiles classes
 * it can see as literal text in a scanned source file at build time.
 * Anything applied dynamically here (scroll state) needs real CSS
 * that exists regardless of the Tailwind build.
 *
 * Scope is strictly the sticky top stripe bar and the site-header's
 * scroll hide/reveal + elevation shadow.
 */
function injectHeaderFxStyles() {
  if (document.getElementById('header-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'header-fx-styles';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {

      /* Stripe segments grow in from the center, staggered per-segment */
      @keyframes headerStripeGrow {
        from { transform: scaleX(0); opacity: 0; }
        to   { transform: scaleX(1); opacity: 1; }
      }
      #header-stripe-left > div,
      #header-stripe-right > div {
        transform-origin: center;
        animation: headerStripeGrow 0.6s ease both;
      }

      /* Title reveals with a blur-in, then settles into a slow shimmer sweep */
      @keyframes headerTitleReveal {
        from { opacity: 0; filter: blur(4px); letter-spacing: -0.1em; }
        to   { opacity: 1; filter: blur(0); letter-spacing: 0.4em; }
      }
      @keyframes headerTitleShimmer {
        to { background-position: -200% center; }
      }
      #header-title.title-fx {
        background-image: linear-gradient(90deg, #fff 0%, #93c5fd 25%, #fff 50%, #93c5fd 75%, #fff 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation:
          headerTitleReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both,
          headerTitleShimmer 6s linear 0.8s infinite;
      }

      /* Header hides on scroll-down past the reveal threshold, and
         slides back the instant you scroll up — same element handles
         both breakpoints, so mobile and desktop get identical behavior
         for free. transform-only: it never changes the header's box
         size, so there's no layout/scroll feedback loop the way a
         padding/height shrink would cause. */
      #site-header {
        transition: transform 0.35s ease, box-shadow 0.35s ease;
        will-change: transform;
      }
      #site-header.header-hidden {
        transform: translateY(-100%);
      }
      #site-header.header-elevated:not(.header-hidden) {
        box-shadow: 0 10px 28px -10px rgba(0, 0, 0, 0.6);
      }
    }
  `;
  document.head.appendChild(style);
}

function buildStripe(container, classNames) {
  if (!container) return;
  container.innerHTML = '';
  classNames.forEach((cls, i) => {
    const segment = document.createElement('div');
    segment.className = `flex-1 ${cls}`;
    segment.style.animationDelay = `${i * 70}ms`;
    const paint = HEADER_STRIPE_COLOR_MAP[cls];
    if (paint) segment.style.backgroundColor = paint;
    container.appendChild(segment);
  });
}

function renderHeader(payload) {
  const config = Array.isArray(payload) ? payload[0] : payload;
  if (!config) return;

  const titleEl = document.getElementById('header-title');
  if (titleEl && config.title) {
    titleEl.textContent = config.title;
    titleEl.classList.add('title-fx');
  }

  const colors = Array.isArray(config.colors) ? config.colors : [];
  if (colors.length) {
    // Split the flag stripe evenly across the two accent bars flanking
    // the title — data-driven, so it adapts if the color count changes.
    const mid = Math.ceil(colors.length / 2);
    buildStripe(document.getElementById('header-stripe-left'), colors.slice(0, mid));
    buildStripe(document.getElementById('header-stripe-right'), colors.slice(mid));
  }

  const scrollEffect = config.scrollEffect;
  if (scrollEffect && typeof scrollEffect === 'object') {
    if (typeof scrollEffect.hideOnScrollDown === 'boolean') {
      headerScrollConfig.hideOnScrollDown = scrollEffect.hideOnScrollDown;
    }
    if (typeof scrollEffect.revealThreshold === 'number') {
      headerScrollConfig.revealThreshold = scrollEffect.revealThreshold;
    }
  }
}

async function hydrateHeader() {
  try {
    const res = await fetch('data/header.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/header.json responded ${res.status}`);
    const data = await res.json();
    renderHeader(data);
  } catch (err) {
    // Fetch failed — the static markup already in the page is left
    // untouched, so the header still renders, just not data-driven.
    console.error('[header] falling back to static markup —', err);
  }
}

// Header hides on scroll-down past the reveal threshold, and slides
// back in the moment you scroll up — driven by header.json's
// scrollEffect config, with a sane default if that field is absent.
// Stays visible while the mobile menu is open so it's never yanked
// out from under an open menu (read straight off the DOM — no
// dependency on navbar.js needed for that).
function initHeaderScrollEffect() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function applyHeaderScrollState() {
    const y = window.scrollY;
    const goingDown = y > lastScrollY;
    const pastThreshold = y > headerScrollConfig.revealThreshold;
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpen = mobileMenu && mobileMenu.classList.contains('menu-open');

    header.classList.toggle('header-elevated', y > 8);

    if (headerScrollConfig.hideOnScrollDown && !menuOpen) {
      if (goingDown && pastThreshold) {
        header.classList.add('header-hidden');
      } else if (!goingDown) {
        header.classList.remove('header-hidden');
      }
    } else {
      header.classList.remove('header-hidden');
    }

    lastScrollY = y;
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(applyHeaderScrollState);
  }, { passive: true });

  applyHeaderScrollState();
}

export async function loadHeaderSection() {
  injectHeaderFxStyles();
  await hydrateHeader();
  initHeaderScrollEffect();
}