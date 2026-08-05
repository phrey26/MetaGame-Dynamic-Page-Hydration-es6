export function loadMarquee() {
  const marqueeTrack = document.getElementById('marquee-track');
  if (!marqueeTrack) return;

  const MARQUEE_DURATION_MS = 25000;
  let marqueeOffset = 0;
  let marqueeLastTime = null;
  let marqueePaused = false;

  function stepMarquee(timestamp) {
    if (marqueeLastTime === null) marqueeLastTime = timestamp;
    const delta = timestamp - marqueeLastTime;
    marqueeLastTime = timestamp;

    const loopWidth = marqueeTrack.scrollWidth / 2;
    if (loopWidth > 0 && !marqueePaused) {
      const speed = loopWidth / MARQUEE_DURATION_MS;
      marqueeOffset += speed * delta;
      if (marqueeOffset >= loopWidth) marqueeOffset -= loopWidth;
      marqueeTrack.style.transform = `translateX(-${marqueeOffset}px)`;
    }

    requestAnimationFrame(stepMarquee);
  }

  const marqueeParent = marqueeTrack.parentElement;
  if (marqueeParent) {
    marqueeParent.addEventListener('pointerenter', () => { marqueePaused = true; });
    marqueeParent.addEventListener('pointerleave', () => { marqueePaused = false; });
  }

  requestAnimationFrame(stepMarquee);
}
