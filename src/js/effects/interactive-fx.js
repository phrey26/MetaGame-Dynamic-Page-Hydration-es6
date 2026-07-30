const DEFAULT_MAX_TILT = 8;

function injectInteractiveFxStyles() {
  if (document.getElementById('interactive-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'interactive-fx-styles';
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {
      [data-tilt] {
        transform: perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1));
        transition: transform 0.15s ease-out;
        position: relative;
        overflow: hidden;
      }
      [data-tilt]::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        background: radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 255, 255, 0.35), transparent 70%);
      }
      [data-tilt]:hover::after,
      [data-tilt]:focus-within::after {
        opacity: 1;
      }
    }

    [data-ripple] {
      position: relative;
      overflow: hidden;
    }
    .ripple-fx {
      position: absolute;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.55);
      transform: scale(0);
      animation: rippleFxAnim 0.6s ease-out;
      pointer-events: none;
    }
    @keyframes rippleFxAnim {
      to { transform: scale(2.6); opacity: 0; }
    }

    @media (prefers-reduced-motion: no-preference) {
      /* Diagonal light sweep on hover for cards/images marked data-shine */
      [data-shine] {
        position: relative;
        overflow: hidden;
      }
      [data-shine]::before {
        content: '';
        position: absolute;
        top: 0;
        left: -60%;
        width: 35%;
        height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.5), transparent);
        transform: skewX(-20deg);
        transition: left 0.65s ease;
        pointer-events: none;
        z-index: 5;
      }
      [data-shine]:hover::before,
      [data-shine]:focus-within::before {
        left: 130%;
      }
    }

    /* Magnetic hover pull for buttons/links marked data-magnetic */
    [data-magnetic] {
      display: inline-block;
      transition: transform 0.2s ease-out;
      will-change: transform;
    }
  `;
  document.head.appendChild(style);
}

function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const maxTilt = parseFloat(el.dataset.tiltMax) || DEFAULT_MAX_TILT;

    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltY = (x - 0.5) * maxTilt * 2;
      const tiltX = (0.5 - y) * maxTilt * 2;
      el.style.setProperty('--tilt-x', `${tiltX}deg`);
      el.style.setProperty('--tilt-y', `${tiltY}deg`);
      el.style.setProperty('--tilt-scale', '1.02');
      el.style.setProperty('--glow-x', `${x * 100}%`);
      el.style.setProperty('--glow-y', `${y * 100}%`);
    });

    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      el.style.setProperty('--tilt-scale', '1');
    });
  });
}

function initMagnetic() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength) || 0.3;

    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

function initRipple() {
  document.querySelectorAll('[data-ripple]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple-fx';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

export function loadInteractiveFx() {
  injectInteractiveFxStyles();
  initTilt();
  initMagnetic();
  initRipple();
}