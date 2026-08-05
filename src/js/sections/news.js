const DEFAULT_NEWS_ITEMS = [
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

async function loadNewsItems() {
  try {
    const res = await fetch('data/news.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/news.json responded ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : DEFAULT_NEWS_ITEMS;
  } catch (err) {
    console.error('[news] using default data —', err);
    return DEFAULT_NEWS_ITEMS;
  }
}

export async function loadNewsSection() {
  const newsFeature = document.getElementById('news-feature');
  if (!newsFeature) return;

  const newsItems = await loadNewsItems();

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
