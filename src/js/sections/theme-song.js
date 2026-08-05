export function loadThemeSongSection() {
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
}
