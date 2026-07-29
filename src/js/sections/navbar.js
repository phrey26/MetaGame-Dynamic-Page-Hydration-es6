function injectNavbarFxStyles() {
  if (document.getElementById('navbar-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'navbar-fx-styles';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {

      .nav-fx-link {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .nav-fx-link:hover,
      .nav-fx-link:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.45);
      }

      @keyframes ctaPulseRing {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
        50%      { box-shadow: 0 0 0 9px rgba(239, 68, 68, 0); }
      }
      .cta-pulse {
        animation: ctaPulseRing 2.4s ease-out infinite;
      }

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

      #mobile-menu-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 40;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      #mobile-menu-overlay.menu-open {
        opacity: 1;
        pointer-events: auto;
      }

      #mobile-menu {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 50;
        width: 78%;
        max-width: 320px;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 60%, #172554 100%);
        transform: translateX(100%);
        transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        overflow: hidden;
        box-shadow: -12px 0 32px -8px rgba(0, 0, 0, 0.5);
      }
      #mobile-menu.menu-open {
        transform: translateX(0);
      }

      #mobile-menu .nav-fx-link.nav-active {
        background-color: transparent;
        color: inherit;
      }

      #navbar-mobile-links {
        flex: 1 1 auto;
        overflow-y: auto;
      }
      #navbar-mobile-links > a {
        border-top-width: 0 !important;
      }

      #mobile-menu [data-nav-cta] {
        flex-shrink: 0;
        display: block;
        width: fit-content;
        margin: 0.9rem auto 1.1rem;
        text-align: center;
        padding: 0.55rem 1.5rem;
        border-radius: 9999px;
        background: #dc2626;
        color: #fff;
        font-weight: 700;
        font-size: 0.875rem;
      }
      #mobile-menu [data-nav-cta]:hover {
        background: #b91c1c;
      }

      #mobile-menu-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 2.25rem;
        height: 2.25rem;
        background: transparent;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        line-height: 1;
        border: none;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      #mobile-menu-close:hover {
        transform: rotate(90deg);
      }

      #navbar-mobile-links {
        padding-top: 3.5rem;
      }
      #mobile-menu a {
        opacity: 0;
        transform: translateX(24px);
        transition: opacity 0.35s ease, transform 0.35s ease;
      }
      #mobile-menu.menu-open a {
        opacity: 1;
        transform: translateX(0);
      }
      ${Array.from({ length: 10 }, (_, i) =>
        `#mobile-menu.menu-open a:nth-child(${i + 1}) { transition-delay: ${i * 45}ms; }`
      ).join('\n      ')}

      body.mobile-menu-locked {
        overflow: hidden;
      }

      @media (min-width: 768px) {
        #mobile-menu,
        #mobile-menu-overlay {
          display: none !important;
        }
      }
    }
  `;
  document.head.appendChild(style);
}


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
    console.error('[navbar] falling back to static markup —', err);
  }
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.getElementById('site-header');

  if (!mobileMenuBtn || !mobileMenu) return;

  mobileMenu.classList.remove('hidden');

  if (mobileMenu.parentElement !== document.body) {
    document.body.appendChild(mobileMenu);
  }

  let overlay = document.getElementById('mobile-menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobile-menu-overlay';
    document.body.appendChild(overlay);
  }

  let closeBtn = document.getElementById('mobile-menu-close');
  if (!closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.id = 'mobile-menu-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '&times;';
    mobileMenu.prepend(closeBtn);
  }

  const ctaLink = mobileMenu.querySelector('[data-nav-cta]');
  if (ctaLink && ctaLink.parentElement !== mobileMenu) {
    mobileMenu.appendChild(ctaLink);
  }

  function openMobileMenu() {
    if (header) header.classList.remove('header-hidden');
    mobileMenu.classList.add('menu-open');
    overlay.classList.add('menu-open');
    mobileMenuBtn.classList.add('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-locked');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('menu-open');
    overlay.classList.remove('menu-open');
    mobileMenuBtn.classList.remove('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-locked');
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

  closeBtn.addEventListener('click', () => {
    closeMobileMenu();
    window.dispatchEvent(new Event('resize'));
  });

  overlay.addEventListener('click', closeMobileMenu);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
      window.dispatchEvent(new Event('resize'));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('menu-open')) closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMobileMenu();
  });
}

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

  window.dispatchEvent(new Event('resize'));

  initMobileMenu();
  initNavFx();
}
