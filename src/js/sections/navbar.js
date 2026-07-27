/**
 * ---------------------------------------------------------------
 * Navbar section: hydration + behavior
 * ---------------------------------------------------------------
 * Owns everything about the nav bar: rendering it from navbar.json
 * (logo, links, CTA), the mobile menu open/close logic, and the
 * nav-link hover-lift / CTA pulse / hamburger morph / mobile-menu
 * slide effects. Fully self-contained — fetches navbar.json itself
 * and falls back to the static markup already in the page if that
 * fetch fails.
 *
 * Effects and colors are exactly what shipped before; only
 * relocated here so navbar concerns live in one place.
 */

/**
 * Same rationale as header.js's style injector: these need to be
 * real CSS (not just Tailwind utility classes) because they're
 * driven by classes toggled at runtime (menu-open, stagger delays).
 */
function injectNavbarFxStyles() {
  if (document.getElementById('navbar-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'navbar-fx-styles';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {

      /* Nav links lift slightly on hover/focus */
      .nav-fx-link {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .nav-fx-link:hover,
      .nav-fx-link:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.45);
      }

      /* Join MetaGames CTA — soft attention pulse */
      @keyframes ctaPulseRing {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
        50%      { box-shadow: 0 0 0 9px rgba(239, 68, 68, 0); }
      }
      .cta-pulse {
        animation: ctaPulseRing 2.4s ease-out infinite;
      }

      /* Hamburger icon morphs into an X */
      #mobile-menu-btn span {
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      #mobile-menu-btn.menu-open span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      #mobile-menu-btn.menu-open span:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      #mobile-menu-btn.menu-open span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }

      /* Mobile menu slides + fades open, links cascade in */
      #mobile-menu {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
        transition: max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease;
      }
      #mobile-menu.menu-open {
        max-height: 32rem;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      #mobile-menu a {
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      #mobile-menu.menu-open a {
        opacity: 1;
        transform: translateY(0);
      }
      ${Array.from({ length: 10 }, (_, i) =>
        `#mobile-menu.menu-open a:nth-child(${i + 1}) { transition-delay: ${i * 40}ms; }`
      ).join('\n      ')}
    }
  `;
  document.head.appendChild(style);
}

/**
 * navbar.json drives the logo, the 8 nav links, and the CTA. The
 * existing markup already has the right structure/classes (including
 * one-off touches like the bold "Home" link and the "News" red dot) —
 * hydration only ever swaps href/text via data-nav-* hooks, so those
 * one-offs are untouched regardless of what the JSON contains.
 */
function renderNavLinks(links) {
  if (!Array.isArray(links)) return;
  links.forEach((link, i) => {
    document.querySelectorAll(`[data-nav-index="${i}"]`).forEach((a) => {
      if (link.url) a.href = link.url;
      const label = a.querySelector('[data-nav-text]');
      if (label && link.text) label.textContent = link.text;
    });
  });
}

function renderNavCta(cta) {
  if (!cta) return;
  document.querySelectorAll('[data-nav-cta]').forEach((a) => {
    if (cta.url) a.href = cta.url;
    const label = a.querySelector('[data-nav-cta-text]');
    if (label && cta.text) label.textContent = cta.text;
  });
}

function renderNavLogo(logo) {
  if (!logo) return;
  document.querySelectorAll('[data-nav-logo]').forEach((img) => {
    if (logo.src) img.src = logo.src;
    if (logo.alt) img.alt = logo.alt;
  });
}

function renderNavbar(config) {
  const data = Array.isArray(config) ? config[0] : config;
  if (!data) return;

  renderNavLogo(data.logo);
  renderNavLinks(data.links);
  renderNavCta(data.cta);
}

async function hydrateNavbar() {
  try {
    const res = await fetch('data/navbar.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/navbar.json responded ${res.status}`);
    const data = await res.json();
    renderNavbar(data);
  } catch (err) {
    // Fetch failed — the static markup already in the page is left
    // untouched, so the navbar still renders, just not data-driven.
    console.error('[navbar] falling back to static markup —', err);
  }
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.getElementById('site-header');
  const MENU_TRANSITION_MS = 350;
  let menuCloseTimer = null;

  if (!mobileMenuBtn || !mobileMenu) return;

  function openMobileMenu() {
    clearTimeout(menuCloseTimer);
    if (header) header.classList.remove('header-hidden');
    mobileMenu.classList.remove('hidden');
    // Double rAF: let 'hidden' (display:none) clear and paint once in the
    // collapsed fx state, THEN add menu-open so the transition actually runs.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mobileMenu.classList.add('menu-open');
      });
    });
    mobileMenuBtn.classList.add('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    clearTimeout(menuCloseTimer);
    mobileMenu.classList.remove('menu-open');
    menuCloseTimer = setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, MENU_TRANSITION_MS);
    mobileMenuBtn.classList.remove('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('menu-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
    window.dispatchEvent(new Event('resize'));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
      window.dispatchEvent(new Event('resize'));
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMobileMenu();
  });
}

// Nav link hover-lift + CTA pulse — marker classes only (see injected
// fx styles above); no Tailwind config changes required.
function initNavFx() {
  document.querySelectorAll('#site-header nav a, #mobile-menu a').forEach((link) => {
    link.classList.add('nav-fx-link');
  });
  document.querySelectorAll('[data-nav-cta]').forEach((link) => {
    link.classList.add('cta-pulse');
  });
}

export async function loadNavbarSection() {
  injectNavbarFxStyles();
  await hydrateNavbar();

  // Nav content is now in place — recalculate header height / section
  // sizing, in case link text length changed how the nav wraps.
  window.dispatchEvent(new Event('resize'));

  initMobileMenu();
  initNavFx();
}