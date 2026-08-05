import {loadHeaderSection} from "./sections/header.js";
import {loadNavbarSection} from "./sections/navbar.js";
import {loadNewsSection} from "./sections/news.js";
import {loadSportsGamesSection} from "./sections/sports-games.js";
import {loadMetaMovementSection} from "./sections/meta-movement.js";
import {loadEmblemSection} from "./sections/emblem.js";
import {loadThemeSongSection} from "./sections/theme-song.js";
import {loadScrollReveal} from "./effects/scroll-reveal.js";
import {loadInteractiveFx} from "./effects/interactive-fx.js";
import {loadPageProgress} from "./effects/page-progress.js";
import {loadMarquee} from "./effects/marquee.js";
import {initSectionSizing} from "./core/layout.js";
import {initCarousels} from "./core/carousel.js";


document.addEventListener('DOMContentLoaded', async () => {

  await loadHeaderSection();
  await loadNavbarSection();


  await loadScrollReveal();
  await loadPageProgress();
  loadInteractiveFx();


  initSectionSizing();
  initCarousels();


  await loadNewsSection();
  loadSportsGamesSection();
  loadMetaMovementSection();
  await loadEmblemSection();
  loadThemeSongSection();

  loadMarquee();
});
