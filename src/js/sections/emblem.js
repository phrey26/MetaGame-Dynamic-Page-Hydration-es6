const DEFAULT_EMBLEM_STOPS = [
  { name: 'Red', hex: '#dc2626', meaning: 'Physical Sports' },
  { name: 'Yellow', hex: '#facc15', meaning: 'Mind Sports' },
  { name: 'White', hex: '#ffffff', meaning: 'Fair Play & Inclusivity' },
  { name: 'Green', hex: '#16a34a', meaning: 'Multi-Cultural Sports' },
  { name: 'Blue', hex: '#2563eb', meaning: 'Digital & Virtual Sports' },
  { name: 'Black', hex: '#111827', meaning: 'Esports' }
];

async function loadEmblemStops() {
  try {
    const res = await fetch('data/emblem.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/emblem.json responded ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : DEFAULT_EMBLEM_STOPS;
  } catch (err) {
    console.error('[emblem] using default color data —', err);
    return DEFAULT_EMBLEM_STOPS;
  }
}


function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function isLightColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export async function loadEmblemSection() {
  const emblemColorEl = document.getElementById('emblem-color');
  const emblemMeaningEl = document.getElementById('emblem-meaning');
  const emblemSwatchEl = document.getElementById('emblem-swatch');
  const emblemWheelEl = document.getElementById('emblem-wheel');
  const emblemWheelFrameEl = document.getElementById('emblem-wheel-frame');
  const emblemPanelEl = document.getElementById('emblem-panel');
  const emblemPrevBtn = document.getElementById('emblem-prev');
  const emblemNextBtn = document.getElementById('emblem-next');

  if (!emblemWheelEl && !emblemPanelEl) return;

  const emblemStops = await loadEmblemStops();
  const emblemWedgeDeg = 360 / emblemStops.length;
  let emblemStep = 3;

  if (emblemWheelEl) {
    emblemWheelEl.style.transformOrigin = 'center';
    emblemWheelEl.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    emblemWheelEl.style.willChange = 'transform';
  }

  function renderEmblem() {
    const emblemIndex = ((emblemStep % emblemStops.length) + emblemStops.length) % emblemStops.length;
    const stop = emblemStops[emblemIndex];
    const rotation = 60 - emblemWedgeDeg * emblemStep;
    if (emblemColorEl) emblemColorEl.textContent = stop.name;
    if (emblemMeaningEl) emblemMeaningEl.textContent = stop.meaning;
    if (emblemSwatchEl) emblemSwatchEl.style.backgroundColor = stop.hex;
    if (emblemWheelEl) emblemWheelEl.style.transform = `rotate(${rotation}deg)`;

    const light = isLightColor(stop.hex);
    const textColor = light ? '#0f172a' : '#ffffff';
    const subTextColor = light ? '#334155' : '#e2e8f0';
    if (emblemPanelEl) {
      emblemPanelEl.style.backgroundColor = stop.hex;
      emblemPanelEl.style.boxShadow = `0 20px 45px -15px ${stop.hex}99`;
      emblemPanelEl.style.color = textColor;
    }
    if (emblemMeaningEl) {
      emblemMeaningEl.style.color = subTextColor;
    }

    if (emblemWheelFrameEl) {
      emblemWheelFrameEl.style.boxShadow = `0 0 55px 12px ${stop.hex}80`;
    }
    const arrowColor = stop.hex.toLowerCase() === '#ffffff' ? '#0f172a' : stop.hex;
    [emblemPrevBtn, emblemNextBtn].forEach((btn) => {
      if (btn) btn.style.color = arrowColor;
    });
  }

  if (emblemPrevBtn) {
    emblemPrevBtn.addEventListener('click', () => {
      emblemStep -= 1;
      renderEmblem();
    });
  }
  if (emblemNextBtn) {
    emblemNextBtn.addEventListener('click', () => {
      emblemStep += 1;
      renderEmblem();
    });
  }
  renderEmblem();
}
