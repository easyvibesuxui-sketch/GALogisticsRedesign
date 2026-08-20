/* ==========================================================================
   Scroll & motion engine
   --------------------------------------------------------------------------
   Owns: smooth scroll (Lenis), enter reveals (IntersectionObserver),
   split-line headings, parallax, pinned/scrubbed sections, counters,
   velocity-linked marquees, the reading-progress bar, magnetic buttons and
   the custom cursor.

   Contract with the markup:
     [data-reveal="fade|up|blur|mask|rule|scale"]  enter reveal
     [data-reveal-delay="240"]                     delay in ms
     [data-reveal-group]                           stagger direct children
     [data-split]                                  split heading into lines
     [data-parallax] [data-parallax-speed="0.18"]  vertical drift
     [data-count="200"] [data-count-suffix="+"]    counting number
     [data-marquee] [data-marquee-speed="0.6"]     infinite ticker
     [data-pin-track]                              horizontal pinned track
     [data-stick-scale]                            stacked sticky panels
     [data-magnetic]                               cursor-attracted element
     [data-hero-media]                             hero clip/scale on scroll
   ========================================================================== */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* --------------------------------------------------------------------------
   1. Smooth scroll
   -------------------------------------------------------------------------- */

let lenis = null;

function initSmoothScroll() {
  if (reduced) return;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

/* In-page anchors have to go through Lenis, otherwise they jump. */
function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    const offset = -(parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 76);

    if (lenis) lenis.scrollTo(target, { offset, duration: 1.3 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   2. Enter reveals
   -------------------------------------------------------------------------- */

function initReveals() {
  // Stagger the children of a group before their triggers are created.
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const step = parseInt(group.dataset.revealGroup, 10) || 90;
    const base = parseInt(group.dataset.revealDelay, 10) || 0;
    [...group.children].forEach((child, i) => {
      const node = child.matches('[data-reveal]') ? child : child.querySelector('[data-reveal]');
      if (node) node.style.setProperty('--reveal-delay', `${base + i * step}ms`);
    });
  });

  document.querySelectorAll('[data-reveal][data-reveal-delay]').forEach((node) => {
    if (!node.closest('[data-reveal-group]')) {
      node.style.setProperty('--reveal-delay', `${node.dataset.revealDelay}ms`);
    }
  });

  // ScrollTrigger rather than IntersectionObserver: it shares one scroll source
  // with Lenis and the scrubbed effects, and it recalculates start positions
  // whenever a pinned section changes the document height — an observer silently
  // misses elements when that happens mid-scroll.
  document.querySelectorAll('[data-reveal], [data-split]').forEach((node) => {
    ScrollTrigger.create({
      trigger: node,
      start: 'top 94%',
      once: true,
      onEnter: () => node.classList.add('is-in'),
    });
  });
}

/* --------------------------------------------------------------------------
   3. Split headings into masked lines
   -------------------------------------------------------------------------- */

function splitToLines(el) {
  if (!el.dataset.splitSource) el.dataset.splitSource = el.innerHTML;
  el.innerHTML = el.dataset.splitSource;

  // Wrap every word so we can measure where the browser actually broke lines.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.className = 'split-word';
        span.style.display = 'inline-block';
        span.textContent = part;
        frag.appendChild(span);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });

  const words = [...el.querySelectorAll('.split-word')];
  if (!words.length) return;

  const rows = [];
  let lastTop = null;
  words.forEach((word) => {
    const top = Math.round(word.offsetTop);
    if (lastTop === null || Math.abs(top - lastTop) > 2) {
      rows.push([]);
      lastTop = top;
    }
    rows[rows.length - 1].push(word);
  });

  const delayStep = parseInt(el.dataset.splitStep, 10) || 95;
  const baseDelay = parseInt(el.dataset.revealDelay, 10) || 0;

  const built = document.createDocumentFragment();
  rows.forEach((row, index) => {
    const line = document.createElement('span');
    line.className = 'split-line';
    const inner = document.createElement('span');
    inner.className = 'split-line__inner';
    inner.style.setProperty('--line-delay', `${baseDelay + index * delayStep}ms`);

    row.forEach((word, i) => {
      inner.appendChild(word);
      if (i < row.length - 1) inner.appendChild(document.createTextNode(' '));
    });

    line.appendChild(inner);
    built.appendChild(line);
  });

  el.innerHTML = '';
  el.appendChild(built);
}

function initSplitText() {
  const targets = [...document.querySelectorAll('[data-split]')];
  if (!targets.length) return;

  if (reduced) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  targets.forEach(splitToLines);

  let width = window.innerWidth;
  let timer;
  window.addEventListener('resize', () => {
    if (window.innerWidth === width) return;   // ignore mobile URL-bar resizes
    width = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => {
      targets.forEach((el) => {
        const wasIn = el.classList.contains('is-in');
        splitToLines(el);
        if (wasIn) el.classList.add('is-in');
      });
      ScrollTrigger.refresh();
    }, 220);
  });
}

/* --------------------------------------------------------------------------
   4. Parallax
   -------------------------------------------------------------------------- */

function initParallax() {
  if (reduced) return;

  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.14;
    const distance = (el.offsetHeight || window.innerHeight) * speed;

    gsap.fromTo(el,
      { yPercent: 0, y: -distance },
      {
        y: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-scope]') || el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
  });
}

/* --------------------------------------------------------------------------
   5. Hero — media grows out of a frame as the page settles
   -------------------------------------------------------------------------- */

function initHero() {
  const media = document.querySelector('[data-hero-media]');
  if (!media || reduced) return;

  gsap.to(media, {
    scale: 1.12,
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: media.closest('section') || media,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  const veil = document.querySelector('[data-hero-veil]');
  if (veil) {
    gsap.to(veil, {
      opacity: 0.86,
      ease: 'none',
      scrollTrigger: { trigger: media, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  const copy = document.querySelector('[data-hero-copy]');
  if (copy) {
    gsap.to(copy, {
      yPercent: -14,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: copy, start: 'top top', end: '+=70%', scrub: true },
    });
  }
}

/* --------------------------------------------------------------------------
   6. Counters
   -------------------------------------------------------------------------- */

function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    if (Number.isNaN(end)) return;
    const decimals = (el.dataset.count.split('.')[1] || '').length;

    if (reduced) {
      el.textContent = end.toFixed(decimals);
      return;
    }

    const counter = { value: 0 };
    el.textContent = (0).toFixed(decimals);

    gsap.to(counter, {
      value: end,
      duration: 2.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => { el.textContent = counter.value.toFixed(decimals); },
    });
  });
}

/* --------------------------------------------------------------------------
   7. Marquee — constant drift, nudged by scroll velocity and direction
   -------------------------------------------------------------------------- */

function initMarquees() {
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('.marquee__track');
    if (!track) return;

    if (reduced) return;

    // One "unit" is the authored content plus its trailing gap. Repeat the unit
    // until it spans the viewport, then clone the whole lane once so the two
    // lanes can leapfrog each other for a seamless loop.
    const unit = track.innerHTML;
    let guard = 0;
    while (track.scrollWidth < marquee.offsetWidth + 200 && guard < 12) {
      track.innerHTML += unit;
      guard += 1;
    }

    const distance = track.scrollWidth;
    if (!distance) return;

    const baseSpeed = parseFloat(marquee.dataset.marqueeSpeed) || 0.55;
    const direction = marquee.dataset.marqueeDirection === 'right' ? 1 : -1;

    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.appendChild(clone);

    const lanes = [track, clone];
    let offset = 0;
    let velocityBoost = 0;

    gsap.ticker.add(() => {
      offset += (baseSpeed + velocityBoost) * direction;
      velocityBoost *= 0.92;
      // Normalise into [-distance, 0) so the pair always covers the viewport,
      // whichever way the lane is travelling.
      offset = ((offset % distance) + distance) % distance - distance;
      lanes.forEach((lane, i) => gsap.set(lane, { x: offset + i * distance }));
    });

    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        velocityBoost = Math.min(Math.abs(self.getVelocity()) / 260, 9);
      },
    });
  });
}

/* --------------------------------------------------------------------------
   7b. Scroll-driven video reel

   The playhead is tied to scroll position across a whole run of sections. The
   video never autoplays and never runs on its own: scrolling down advances the
   footage, scrolling up rewinds it.
   -------------------------------------------------------------------------- */

function initScrollReels() {
  document.querySelectorAll('[data-reel]').forEach((reel) => {
    const video = reel.querySelector('[data-reel-video]');
    if (!video) return;

    const from = parseFloat(video.dataset.reelStart) || 0;
    const to = parseFloat(video.dataset.reelEnd);

    const metadata = video.readyState >= 1
      ? Promise.resolve()
      : new Promise((resolve) => video.addEventListener('loadedmetadata', resolve, { once: true }));

    /* Some browsers decode nothing until a video has been played at least
       once, which would leave the section on its poster. Priming is deferred
       to the visitor's first interaction — a real user gesture — and the clip
       is paused in the same breath, so nothing ever plays on its own. */
    let primed = false;
    const prime = () => {
      if (primed) return;
      primed = true;
      const attempt = video.play();
      if (attempt && attempt.then) attempt.then(() => video.pause()).catch(() => {});
      else video.pause();
    };
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((type) => {
      window.addEventListener(type, prime, { once: true, passive: true });
    });

    metadata.then(() => {
      const last = Number.isFinite(to) ? Math.min(to, video.duration) : video.duration;
      const span = Math.max(0.05, last - from);

      const seek = (time) => {
        if (video.readyState < 1) return;
        if (Math.abs(video.currentTime - time) < 0.008) return;
        video.currentTime = time;
      };

      seek(from);
      if (reduced) return;   // hold the opening frame rather than moving

      const head = { at: 0 };

      gsap.to(head, {
        at: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: reel,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
        onUpdate: () => seek(from + head.at * span),
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. Pinned horizontal track
   -------------------------------------------------------------------------- */

function initPinnedTracks() {
  document.querySelectorAll('[data-pin-track]').forEach((section) => {
    const lane = section.querySelector('[data-pin-lane]');
    if (!lane) return;

    const progressBar = section.querySelector('[data-pin-progress]');
    const indexOut = section.querySelector('[data-pin-index]');
    const stage = section.querySelector('[data-pin-stage]') || section;
    const cards = [...lane.children];

    if (reduced || window.innerWidth < 900) {
      section.classList.add('is-static');
      return;
    }

    const getDistance = () => Math.max(0, lane.scrollWidth - window.innerWidth);

    /* Fraction of the pinned scroll spent holding still at each end. Without
       it the page stops scrolling and starts moving sideways in the same
       frame, which reads as the scroll being snatched away. The holds give the
       section a moment to arrive and a moment to finish. */
    const HOLD = 0.16;

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance() + window.innerHeight * 1.15}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const travel = gsap.utils.clamp(
            0, 1,
            (self.progress * (1 + HOLD * 2) - HOLD)
          );

          if (progressBar) gsap.set(progressBar, { scaleX: travel });

          if (indexOut && cards.length) {
            /* Report the card currently at the left edge of the stage rather
               than a number derived from progress — it stays true whatever the
               viewport does to the card width. The lane itself is the thing
               being moved, so its own box cannot be the reference. */
            const edge = stage.getBoundingClientRect().left;
            let current = 0;
            let nearest = Infinity;
            cards.forEach((card, i) => {
              const gap = Math.abs(card.getBoundingClientRect().left - edge);
              if (gap < nearest) { nearest = gap; current = i; }
            });
            const label = String(current + 1).padStart(2, '0');
            if (indexOut.textContent !== label) indexOut.textContent = label;
          }
        },
      },
    });

    timeline
      .to({}, { duration: HOLD })                                // arrive
      .to(lane, { x: () => -getDistance(), duration: 1 })        // travel
      .to({}, { duration: HOLD });                               // settle
  });
}

/* --------------------------------------------------------------------------
   9. Stacked sticky panels — each panel settles back as the next arrives
   -------------------------------------------------------------------------- */

function initStickStacks() {
  if (reduced) return;

  document.querySelectorAll('[data-stick-scale]').forEach((panel, index, all) => {
    const isLast = index === all.length - 1;
    if (isLast) return;

    gsap.to(panel, {
      scale: 0.94,
      filter: 'brightness(0.62)',
      ease: 'none',
      scrollTrigger: {
        trigger: panel,
        start: 'top top+=90',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* --------------------------------------------------------------------------
   10. Reading progress + header state
   -------------------------------------------------------------------------- */

function initProgress() {
  const bar = document.querySelector('[data-progress-bar]');
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  let previous = window.scrollY;

  const update = () => {
    const current = window.scrollY;
    header.classList.toggle('is-scrolled', current > 24);

    const menuOpen = document.documentElement.classList.contains('nav-open');
    const goingDown = current > previous && current > 320;
    header.classList.toggle('is-tucked', goingDown && !menuOpen);

    previous = current;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* --------------------------------------------------------------------------
   11. Magnetic elements + custom cursor
   -------------------------------------------------------------------------- */

function initMagnetic() {
  if (!finePointer || reduced) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.32;
    const label = el.querySelector('.btn__label');

    const move = (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);

      /* Capped travel: unclamped, a wide button leans far enough to sit on top
         of the control beside it. */
      const limit = Math.min(18, rect.height * 0.34);
      const pull = (value) => gsap.utils.clamp(-limit, limit, value * strength);

      gsap.to(el, { x: pull(x), y: pull(y), duration: 0.6, ease: 'power3.out' });
      if (label) {
        gsap.to(label, { x: pull(x) * 0.4, y: pull(y) * 0.4, duration: 0.6, ease: 'power3.out' });
      }
    };

    const reset = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      if (label) gsap.to(label, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
  });
}

function initCursor() {
  if (!finePointer || reduced) return;

  const cursor = document.querySelector('[data-cursor]');
  if (!cursor) return;

  const toX = gsap.quickTo(cursor, 'x', { duration: 0.42, ease: 'power3.out' });
  const toY = gsap.quickTo(cursor, 'y', { duration: 0.42, ease: 'power3.out' });

  window.addEventListener('pointermove', (event) => {
    cursor.classList.add('is-active');
    toX(event.clientX);
    toY(event.clientY);
  });

  window.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));

  const hoverables = 'a, button, [data-cursor-hover]';
  document.addEventListener('pointerover', (event) => {
    if (event.target.closest(hoverables)) cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest(hoverables)) cursor.classList.remove('is-hover');
  });
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */

function boot() {
  initSmoothScroll();
  initAnchors();
  initSplitText();
  initReveals();
  initParallax();
  initHero();
  initCounters();
  initMarquees();
  /* Pins first: pinning inserts a spacer that changes the height of the reel
     the pinned section sits inside, and the reel's trigger measures that. */
  initPinnedTracks();
  initScrollReels();
  initStickStacks();
  initProgress();
  initHeader();
  initMagnetic();
  initCursor();

  // Fonts change line breaks, which changes split-text geometry.
  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
