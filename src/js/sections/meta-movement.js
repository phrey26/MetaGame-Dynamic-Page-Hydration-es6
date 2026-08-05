export function loadMetaMovementSection() {
  const audienceButtons = document.querySelectorAll('.audience-btn');
  if (!audienceButtons.length) return;

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
}
