/* ══════════════════════════════════════════════════════════
   STUDIO WEB — script.js
   Effets : parallax multi-couches · split-text · rotation
            scroll · color shift · glassmorphism dynamique
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════
   0. UTILITAIRES
   ════════════════════════════════════════════════════════════ */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp  = (a, b, t)     => a + (b - a) * t;

/* RAF loop partagé */
const tickers = new Set();
let rafId = null;
function tick() {
  tickers.forEach(fn => fn());
  rafId = requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ════════════════════════════════════════════════════════════
   1. LOADER
   ════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const loader = $('#loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    initSplitText();   // déclenche les animations hero
  }, 1500);
});

/* ════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR (RAF smoothing)
   ════════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursorTrail');
  let mx = 0, my = 0;   // mouse réel
  let tx = 0, ty = 0;   // trail interpolé

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = trail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = trail.style.opacity = '1';
  });

  tickers.add(() => {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    tx = lerp(tx, mx, 0.10);
    ty = lerp(ty, my, 0.10);
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
  });
})();

/* ════════════════════════════════════════════════════════════
   3. HEADER SCROLL
   ════════════════════════════════════════════════════════════ */
const header = $('#header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ════════════════════════════════════════════════════════════
   4. NAV OVERLAY
   ════════════════════════════════════════════════════════════ */
const navToggle  = $('#navToggle');
const navOverlay = $('#navOverlay');

navToggle.addEventListener('click', () => {
  const open = navOverlay.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navOverlay.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ════════════════════════════════════════════════════════════
   5. SPLIT-TEXT ANIMATION
   Découpe les éléments [data-split] en .split-char,
   puis les anime lettre par lettre avec stagger.
   ════════════════════════════════════════════════════════════ */
function initSplitText() {
  $$('[data-split]').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';

    // Garde les balises <em> en place
    const parts = el.getAttribute('data-original')
      ? JSON.parse(el.getAttribute('data-original'))
      : null;

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = (i * 28) + 'ms';
      el.appendChild(span);
    });

    // Observe pour déclencher dès que visible
    splitObserver.observe(el);
  });
}

const splitObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.split-char').forEach(s => s.classList.add('visible'));
    splitObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

/* ════════════════════════════════════════════════════════════
   6. SCROLL REVEAL (IntersectionObserver)
   ════════════════════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });

$$('.reveal-block').forEach(el => revealObs.observe(el));

/* ════════════════════════════════════════════════════════════
   7. PARALLAX MULTI-COUCHES (RAF)
   Chaque .parallax-layer a data-speed="0..1"
   ════════════════════════════════════════════════════════════ */
(function initParallax() {
  const layers = $$('.parallax-layer[data-speed]');
  if (!layers.length) return;

  let scrollY = 0, smoothY = 0;

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  tickers.add(() => {
    smoothY = lerp(smoothY, scrollY, 0.06);
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed);
      layer.style.transform = `translate3d(0, ${smoothY * speed}px, 0)`;
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   8. SCROLL-BASED ROTATION — logo header
   ════════════════════════════════════════════════════════════ */
(function initLogoRotation() {
  const logo = $('#logoRotate');
  if (!logo) return;

  let scrollY = 0, angle = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  tickers.add(() => {
    const targetAngle = scrollY * 0.08;
    angle = lerp(angle, targetAngle, 0.06);
    logo.style.transform = `rotate(${angle}deg)`;
  });
})();

/* ════════════════════════════════════════════════════════════
   9. SCROLL-BASED COLOR SHIFT
   Le fond passe subtilement entre 3 teintes selon la section
   Sections : hero → #f8f8ff · services → #fff · process → #e6e6fa
   ════════════════════════════════════════════════════════════ */
(function initColorShift() {
  const colorMap = [
    { id: 'hero',     color: [248, 248, 255] },
    { id: 'services', color: [255, 255, 255] },
    { id: 'projects', color: [248, 248, 255] },
    { id: 'process',  color: [230, 230, 250] },
    { id: 'contact',  color: [248, 248, 255] },
  ];

  let currentRGB = [248, 248, 255];
  let targetRGB  = [248, 248, 255];

  // Trouver la section courante
  function detectSection() {
    const mid = window.scrollY + window.innerHeight / 2;
    for (let i = colorMap.length - 1; i >= 0; i--) {
      const el = document.getElementById(colorMap[i].id);
      if (el && el.offsetTop <= mid) {
        return colorMap[i].color;
      }
    }
    return colorMap[0].color;
  }

  window.addEventListener('scroll', () => {
    targetRGB = detectSection();
  }, { passive: true });

  tickers.add(() => {
    let changed = false;
    for (let i = 0; i < 3; i++) {
      const v = lerp(currentRGB[i], targetRGB[i], 0.025);
      if (Math.abs(v - currentRGB[i]) > 0.05) changed = true;
      currentRGB[i] = v;
    }
    if (changed) {
      const r = Math.round(currentRGB[0]);
      const g = Math.round(currentRGB[1]);
      const b = Math.round(currentRGB[2]);
      document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
    }
  });
})();

/* ════════════════════════════════════════════════════════════
   10. GLASSMORPHISM DYNAMIQUE — reflets sur les cartes why
   Chaque carte .why-glass reçoit un reflet en fonction
   de la position de la souris par rapport à elle.
   ════════════════════════════════════════════════════════════ */
(function initGlassReflets() {
  const cards = $$('.why-glass, .glass-badge, .glass-form, .info-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0..1
      const y = (e.clientY - rect.top)  / rect.height;  // 0..1

      // Reflet dégradé
      const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
      card.style.background =
        `linear-gradient(${angle}deg,
           rgba(255,255,255,0.72) 0%,
           rgba(230,230,250,0.42) 60%,
           rgba(176,196,222,0.28) 100%)`;

      // Légère rotation 3D
      const rotX = (y - 0.5) * -6;
      const rotY = (x - 0.5) *  6;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background  = '';
      card.style.transform   = '';
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   11. PROJECT CARDS — tilt 3D au hover
   ════════════════════════════════════════════════════════════ */
(function initProjectTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform =
        `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-5px)`;
      card.style.boxShadow = `${-x * 12}px ${-y * 12}px 28px rgba(74,111,165,0.10)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.boxShadow  = '';
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   12. TIMELINE PROGRESS — la barre se remplit au scroll
   ════════════════════════════════════════════════════════════ */
(function initTimelineProgress() {
  const bar = $('#timelineProgress');
  if (!bar) return;
  const timeline = bar.closest('.timeline');
  if (!timeline) return;

  function updateBar() {
    const rect  = timeline.getBoundingClientRect();
    const total = timeline.offsetWidth;
    const progress = clamp(-rect.left / (rect.width - window.innerWidth), 0, 1);
    // Mode horizontal scroll détecté — sinon, progress vertical
    const vProgress = clamp(1 - (rect.bottom / window.innerHeight - 0.2) / 0.8, 0, 1);
    bar.style.width = (vProgress * 100) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();

/* ════════════════════════════════════════════════════════════
   13. HERO ORBS — mouvement doux avec la souris (parallax curseur)
   ════════════════════════════════════════════════════════════ */
(function initOrbsParallax() {
  const orbs = $$('.orb');
  if (!orbs.length) return;

  let mx = 0, my = 0;
  let ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  const strengths = [18, 28, 14];
  tickers.add(() => {
    ox = lerp(ox, mx, 0.04);
    oy = lerp(oy, my, 0.04);
    orbs.forEach((orb, i) => {
      const s = strengths[i] || 20;
      orb.style.transform = `translate(${ox * s}px, ${oy * s}px)`;
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   14. CONTACT FORM — Formspree AJAX
   ════════════════════════════════════════════════════════════ */
(function initForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  const btnLbl  = $('#btnLabel');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btnLbl.textContent = 'Envoi en cours…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.reset();
        success.classList.add('show');
        btnLbl.textContent = 'Envoyer le message';
        setTimeout(() => success.classList.remove('show'), 7000);
      } else {
        btnLbl.textContent = 'Erreur — réessayez';
        setTimeout(() => { btnLbl.textContent = 'Envoyer le message'; }, 4000);
      }
    } catch {
      btnLbl.textContent = 'Erreur réseau — réessayez';
      setTimeout(() => { btnLbl.textContent = 'Envoyer le message'; }, 4000);
    }
  });
})();

/* ════════════════════════════════════════════════════════════
   15. FOOTER YEAR
   ════════════════════════════════════════════════════════════ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
