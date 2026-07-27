import {loadHeaderSection} from "./sections/header.js";
import {loadNavbarSection} from "./sections/navbar.js";

/**
 * ---------------------------------------------------------------
 * App bootstrap + shared page layout/behavior
 * ---------------------------------------------------------------
 * Header and navbar are fully self-contained sections (see
 * ./sections/header.js and ./sections/navbar.js) — app.js just
 * loads them, then handles everything else on the page: section
 * sizing, carousels, the news feature, the emblem wheel, the
 * lyrics scrollbar, and the marquee.
 */

document.addEventListener('DOMContentLoaded', async () => {

  await loadHeaderSection();
  await loadNavbarSection();

  const header = document.getElementById('site-header');
  const sections = document.querySelectorAll('.screen-section');

  function sizeSections() {
    const headerH = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', headerH + 'px');


    const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const usableH = viewportH - headerH;

    sections.forEach((section) => {
      section.style.minHeight = usableH + 'px';
    });
  }

  sizeSections();
  window.addEventListener('resize', sizeSections);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', sizeSections);
  }

  const PAGE_TRACK_IDS = ['sg-track'];

  function scrollTrack(trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const isPagedCarousel = PAGE_TRACK_IDS.includes(trackId);
    const amount = isPagedCarousel
      ? track.clientWidth * direction
      : track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-carousel-prev]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselPrev, -1));
  });
  document.querySelectorAll('[data-carousel-next]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselNext, 1));
  });

  const sgTrack = document.getElementById('sg-track');
  const sgDots = document.querySelectorAll('#sg-dots span');
  if (sgTrack && sgDots.length) {
    let sgScrollTimer = null;
    sgTrack.addEventListener('scroll', () => {
      clearTimeout(sgScrollTimer);
      sgScrollTimer = setTimeout(() => {
        const page = Math.round(sgTrack.scrollLeft / sgTrack.clientWidth);
        sgDots.forEach((dot, i) => {
          dot.classList.toggle('bg-white', i === page);
          dot.classList.toggle('bg-slate-600', i !== page);
        });
      }, 60);
    });


    sgDots.forEach((dot, i) => {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', () => {
        sgTrack.scrollTo({ left: sgTrack.clientWidth * i, behavior: 'smooth' });
      });
    });
  }

  const newsItems = [
    {
      img: 'assets/news-featured-host-nations.jpg',
      alt: 'MetaGames host nations announced',
      title: 'MetaGames Host Nations Announced',
      desc: 'Discover the countries leading the global MetaGames experience.'
    },
    {
      img: 'assets/news-thumb-new-categories.jpg',
      alt: 'New sports and game categories added',
      title: 'New Sports & Game Categories Added',
      desc: 'Fresh disciplines have joined the roster across mind, digital, and physical sports.'
    },
    {
      img: 'assets/news-thumb-registration-updates.jpg',
      alt: 'Registration updates',
      title: 'Registration Updates',
      desc: 'Key dates and requirements for athlete and team registration.'
    },
    {
      img: 'assets/news-thumb-partnerships.jpg',
      alt: 'Official partnerships and collaborations',
      title: 'Official Partnerships & Collaborations',
      desc: 'MetaGames welcomes new federations and technology partners.'
    }
  ];

  const newsFeature = document.getElementById('news-feature');
  if (newsFeature) {
    const newsImg = newsFeature.querySelector('img');
    const newsTitle = newsFeature.querySelector('[data-news-title]');
    const newsDesc = newsFeature.querySelector('[data-news-desc]');

    function renderNews(index) {
      const i = ((index % newsItems.length) + newsItems.length) % newsItems.length;
      const item = newsItems[i];
      newsFeature.dataset.index = i;
      newsImg.src = item.img;
      newsImg.alt = item.alt;
      newsTitle.textContent = item.title;
      newsDesc.textContent = item.desc;
    }

    document.querySelectorAll('[data-news-select]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        renderNews(parseInt(el.dataset.newsSelect, 10));
      });
    });

    const newsPrev = newsFeature.querySelector('[data-news-prev]');
    const newsNext = newsFeature.querySelector('[data-news-next]');
    if (newsPrev) newsPrev.addEventListener('click', () => renderNews(parseInt(newsFeature.dataset.index, 10) - 1));
    if (newsNext) newsNext.addEventListener('click', () => renderNews(parseInt(newsFeature.dataset.index, 10) + 1));
  }

  const audienceButtons = document.querySelectorAll('.audience-btn');

  audienceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audienceButtons.forEach((b) => {
        b.classList.remove('bg-white', 'text-blue-700');
        b.classList.add('bg-blue-900', 'text-white');
      });
      btn.classList.remove('bg-blue-900', 'text-white');
      btn.classList.add('bg-white', 'text-blue-700');
    });
  });

  const emblemStops = [
    { name: 'Red', hex: '#dc2626', meaning: 'Physical Sports' },
    { name: 'Yellow', hex: '#facc15', meaning: 'Mind Sports' },
    { name: 'White', hex: '#ffffff', meaning: 'Fair Play & Inclusivity' },
    { name: 'Green', hex: '#16a34a', meaning: 'Multi-Cultural Sports' },
    { name: 'Blue', hex: '#2563eb', meaning: 'Digital & Virtual Sports' },
    { name: 'Black', hex: '#111827', meaning: 'Esports' }
  ];

  const emblemColorEl = document.getElementById('emblem-color');
  const emblemMeaningEl = document.getElementById('emblem-meaning');
  const emblemSwatchEl = document.getElementById('emblem-swatch');
  const emblemWheelEl = document.getElementById('emblem-wheel');
  const emblemPrevBtn = document.getElementById('emblem-prev');
  const emblemNextBtn = document.getElementById('emblem-next');

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

  const lyricsScroll = document.getElementById('lyrics-scroll');
  const lyricsTrack = document.getElementById('lyrics-scrollbar-track');
  const lyricsThumb = document.getElementById('lyrics-scrollbar-thumb');

  if (lyricsScroll && lyricsTrack && lyricsThumb) {
    function updateLyricsThumb() {
      const { scrollTop, scrollHeight, clientHeight } = lyricsScroll;
      const trackHeight = lyricsTrack.clientHeight;

      if (scrollHeight <= clientHeight) {
        lyricsThumb.style.height = '100%';
        lyricsThumb.style.top = '0px';
        return;
      }

      const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 16);
      const maxThumbTravel = trackHeight - thumbHeight;
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);

      lyricsThumb.style.height = thumbHeight + 'px';
      lyricsThumb.style.top = (scrollRatio * maxThumbTravel) + 'px';
    }

    lyricsScroll.addEventListener('scroll', updateLyricsThumb);
    window.addEventListener('resize', updateLyricsThumb);
    updateLyricsThumb();

    lyricsTrack.addEventListener('click', (e) => {
      const trackRect = lyricsTrack.getBoundingClientRect();
      const clickRatio = (e.clientY - trackRect.top) / trackRect.height;
      const { scrollHeight, clientHeight } = lyricsScroll;
      lyricsScroll.scrollTo({
        top: clickRatio * (scrollHeight - clientHeight),
        behavior: 'smooth'
      });
    });
  }

  const themePlayBtn = document.getElementById('theme-play');
  if (themePlayBtn) {
    let playing = false;
    themePlayBtn.addEventListener('click', () => {
      playing = !playing;
      themePlayBtn.querySelector('span').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    });
  }

  const marqueeTrack = document.getElementById('marquee-track');
  if (marqueeTrack) {
    const MARQUEE_DURATION_MS = 25000; 
    let marqueeOffset = 0;
    let marqueeLastTime = null;

    function stepMarquee(timestamp) {
      if (marqueeLastTime === null) marqueeLastTime = timestamp;
      const delta = timestamp - marqueeLastTime;
      marqueeLastTime = timestamp;

      const loopWidth = marqueeTrack.scrollWidth / 2;
      if (loopWidth > 0) {
        const speed = loopWidth / MARQUEE_DURATION_MS; 
        marqueeOffset += speed * delta;
        if (marqueeOffset >= loopWidth) marqueeOffset -= loopWidth;
        marqueeTrack.style.transform = `translateX(-${marqueeOffset}px)`;
      }

      requestAnimationFrame(stepMarquee);
    }

    requestAnimationFrame(stepMarquee);
  }

});