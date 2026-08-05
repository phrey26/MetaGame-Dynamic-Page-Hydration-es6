export function loadSportsGamesSection() {
  const sgTrack = document.getElementById('sg-track');
  const sgDots = document.querySelectorAll('#sg-dots span');
  if (!sgTrack || !sgDots.length) return;

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
