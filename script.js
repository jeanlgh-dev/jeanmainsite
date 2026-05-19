/* ══════════════════════════════════════════════════════════
   STUDIO WEB — script.js
   ══════════════════════════════════════════════════════════ */

/* ─── Loader ─────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    // Trigger hero reveal
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  }, 1400);
});

/* ─── Custom Cursor ──────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Trail follows with RAF for smoothness
function animateTrail() {
  trailX += (parseFloat(cursor.style.left || 0) - trailX) * 0.12;
  trailY += (parseFloat(cursor.style.top  || 0) - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.addEventListener('mouseleave', () => {
  cursor.style.opacity      = '0';
  cursorTrail.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity      = '1';
  cursorTrail.style.opacity = '1';
});

/* ─── Header scroll ──────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── Nav overlay ────────────────────────────────────────── */
const navToggle  = document.getElementById('navToggle');
const navOverlay = document.getElementById('navOverlay');

navToggle.addEventListener('click', () => {
  const isOpen = navOverlay.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav on link click
navOverlay.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Scroll Reveal (IntersectionObserver) ───────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

// Observe all reveal targets
document.querySelectorAll(
  '.service-card, .why-card, .project-card, .timeline-item, .section-header, .section-title, .section-sub'
).forEach(el => revealObserver.observe(el));

/* ─── Parallax on hero grid ──────────────────────────────── */
const heroGrid = document.querySelector('.hero-grid');
if (heroGrid) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroGrid.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
}

/* ─── Contact form (Formspree AJAX) ──────────────────────── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"] span');
    btn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.reset();
        formSuccess.classList.add('show');
        btn.textContent = 'Envoyer le message';
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      } else {
        btn.textContent = 'Erreur — réessayez';
      }
    } catch {
      btn.textContent = 'Erreur — réessayez';
    }
  });
}

/* ─── Footer year ────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─── Smooth hover on project cards ──────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
