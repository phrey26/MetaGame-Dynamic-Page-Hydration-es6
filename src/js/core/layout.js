export function initSectionSizing() {
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
}
