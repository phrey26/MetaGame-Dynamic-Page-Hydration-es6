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

export function initCarousels() {
  document.querySelectorAll('[data-carousel-prev]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselPrev, -1));
  });
  document.querySelectorAll('[data-carousel-next]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselNext, 1));
  });
}
