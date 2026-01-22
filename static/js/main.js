/* ==========================================================================
   MAIN SYSTEM CONTROLLER
   ========================================================================== */
import { SkySystem } from './modules/SkySystem.js';
import { CitySystem } from './modules/CitySystem.js';
import { CubeSystem } from './modules/CubeSystem.js';
import { CipitioSystem } from './modules/CipitioSystem.js';

/* ==========================================================================
   1. BACKGROUND SYSTEMS (SUN SCROLL, CITY, SKY)
   ========================================================================== */
const canvas = document.getElementById('canvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const menuContainer = document.getElementById('menu-container');

  // --- DETECCIÓN DE PÁGINA ---
  const isHome = !!menuContainer;
  const isAbout = window.location.pathname.includes('about');
  const isProjects = window.location.pathname.includes('projects');
  const isContact = window.location.pathname.includes('contact');

  // Definimos el tipo de escenario para enviarlo al CitySystem
  let pageType = 'generic';
  if (isHome) pageType = 'home';
  if (isAbout) pageType = 'about';
  if (isContact) pageType = 'contact';
  // Projects usa fondo genérico

  let w, h;
  let time = 0;
  let scrollPercent = 0;

  // --------------------------------------------------------------------------
  // Fake (virtual) scroll for ABOUT + CONTACT (solo desktop)
  // --------------------------------------------------------------------------
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isWideEnough = window.matchMedia('(min-width: 992px)').matches;
  const isFakeScrollPage = (isAbout || isContact) && isDesktopPointer && isWideEnough;

  let fakeScrollTarget = 0;   // 0..1
  let fakeScrollCurrent = 0;  // 0..1

  const FAKE_SCROLL_SENSITIVITY = 0.0012;
  const FAKE_SCROLL_EASE = 0.14;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  if (isFakeScrollPage) {
    document.documentElement.classList.add('fake-scroll');
    document.body.classList.add('fake-scroll');
    window.scrollTo(0, 0);

    const onWheel = (e) => {
      // Permite scroll nativo dentro de inputs/textarea si hace falta
      const allowNative = e.target.closest('textarea, input, select, [data-allow-native-scroll]');
      if (allowNative) return;

      e.preventDefault();
      fakeScrollTarget = clamp01(fakeScrollTarget + (e.deltaY * FAKE_SCROLL_SENSITIVITY));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
  }

  // Variables para el Parallax del fondo
  let bgMouseX = 0, bgMouseY = 0;

  // Instanciar Sistemas
  const sky = new SkySystem();
  const city = new CitySystem(pageType);
  const cube = isHome ? new CubeSystem(menuContainer) : null;

  // --- SCROLL STATE ---
  function updateScrollState() {
    // A) Fake scroll (About/Contact desktop)
    if (isFakeScrollPage) {
      fakeScrollCurrent += (fakeScrollTarget - fakeScrollCurrent) * FAKE_SCROLL_EASE;
      scrollPercent = clamp01(fakeScrollCurrent);
    } else {
      // B) Scroll real (Home/Projects/Otras)
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      ) - window.innerHeight;

      scrollPercent = (docHeight <= 0) ? 0 : Math.max(0, Math.min(1, scrollTop / docHeight));
    }

    // Cadejo: se esconde con la luz/scroll
    const cadejoEl = document.getElementById('cadejo-ghost');
    if (cadejoEl && (isAbout || isProjects)) {
      if (scrollPercent > 0.1) {
        cadejoEl.style.opacity = '0';
        cadejoEl.style.transition = 'opacity 0.5s ease';
      } else {
        cadejoEl.style.opacity = '1';
      }
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    city.resize(w, h);
  }

  // --- LISTENERS ---
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateScrollState);

  // Parallax + cursor interactivo (solo desktop real)
  const canShowHoverCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function updateBgMouseFromPoint(clientX, clientY) {
    if (!w || !h) return;
    bgMouseX = (clientX - w / 2) / (w / 2);
    bgMouseY = (clientY - h / 2) / (h / 2);
  }

  // Desktop: pointermove/mousemove
  window.addEventListener('pointermove', (e) => {
    // En móviles pointermove puede disparar; no pasa nada si no hay hover
    updateBgMouseFromPoint(e.clientX, e.clientY);

    if (isHome && cube && canShowHoverCursor) {
      const dx = e.clientX - w / 2;
      const dy = e.clientY - h / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = cube.isMenuOpen ? 450 : 160;
      document.body.style.cursor = (dist < hitRadius) ? 'pointer' : 'default';
    }
  }, { passive: true });

  // Mobile: touchstart/touchmove solo para parallax (no bloquea scroll)
  window.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    updateBgMouseFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    updateBgMouseFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // Iniciar
  resize();

  // --- LOOP DE ANIMACIÓN ---
  function animateBackground() {
    updateScrollState();
    time++;
    ctx.clearRect(0, 0, w, h);

    const menuLight = (isHome && cube) ? cube.expansion : 0;

    // 1) Cielo
    sky.render(ctx, w, h, time, scrollPercent);

    // 2) Ciudad/Paisaje
    city.render(ctx, w, h, time, scrollPercent, menuLight);

    // 3) Cubo (solo home)
    if (isHome && cube) {
      cube.render(ctx, w, h, time, bgMouseX, bgMouseY, scrollPercent);
    }

    requestAnimationFrame(animateBackground);
  }

  animateBackground();
}

/* ==========================================================================
   2. 3D TILT CARDS (EFECTO PROYECTOS)
   ========================================================================== */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.cyber-card');

  cards.forEach(card => {
    const handleTilt = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      card.style.transition = 'box-shadow 0.1s, border-color 0.3s';
    };

    const resetTilt = () => {
      card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.3s';
    };

    card.addEventListener('mousemove', (e) => handleTilt(e.clientX, e.clientY));
    card.addEventListener('mouseleave', resetTilt);

    card.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      handleTilt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    card.addEventListener('touchend', resetTilt);
  });
}
if (document.querySelector('.cyber-card')) {
  init3DTiltCards();
}

/* ==========================================================================
   3. CADEJO: GHOST FOLLOWER SYSTEM
   ========================================================================== */
function initCadejoFollower() {
  const cadejo = document.getElementById('cadejo-ghost');
  const eyes = document.querySelectorAll('.eye-socket');

  if (!cadejo) return;

  cadejo.style.position = 'fixed';

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;

  let currentX = targetX;
  let currentY = targetY;

  let isVisible = false;
  let isMobileTouch = false;

  const animateGhost = () => {
    const speed = 0.12;
    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;

    cadejo.style.left = `${currentX}px`;
    cadejo.style.top = `${currentY}px`;

    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 3);

    eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil');
      if (pupil) {
        const moveX = Math.cos(angle) * dist;
        const moveY = Math.sin(angle) * dist;
        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });

    requestAnimationFrame(animateGhost);
  };

  requestAnimationFrame(animateGhost);

  // Desktop mouse
  document.addEventListener('mousemove', (e) => {
    if (isMobileTouch) return;

    targetX = e.clientX;
    targetY = e.clientY;

    if (!isVisible) {
      cadejo.classList.add('is-summoned');
      isVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    cadejo.classList.remove('is-summoned');
    isVisible = false;
  });

  // Mobile touch
  const handleTouch = (e) => {
    isMobileTouch = true;
    const touch = e.touches && e.touches[0];
    if (!touch) return;

    targetX = touch.clientX;
    targetY = touch.clientY - 60;

    if (!isVisible) {
      currentX = targetX;
      currentY = targetY;
      cadejo.classList.add('is-summoned');
      isVisible = true;
    }
  };

  document.addEventListener('touchstart', handleTouch, { passive: true });
  document.addEventListener('touchmove', handleTouch, { passive: true });

  document.addEventListener('touchend', () => {
    cadejo.classList.remove('is-summoned');
    isVisible = false;
    setTimeout(() => { isMobileTouch = false; }, 500);
  });
}

/* ==========================================================================
   4. SMART NAVBAR (AUTO-HIDE & AUTO-CLOSE)
   ========================================================================== */
function initSmartNavbar() {
  let lastScrollTop = 0;
  const navbar = document.querySelector('.navbar-floating-container');
  const navCollapse = document.querySelector('.navbar-collapse');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - lastScrollTop) <= 5) return;

    if (scrollTop > lastScrollTop && scrollTop > 80) {
      navbar.classList.add('nav-hidden');

      if (navCollapse && navCollapse.classList.contains('show')) {
        navCollapse.classList.remove('show');
      }
    } else {
      navbar.classList.remove('nav-hidden');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });
}

/* ==========================================================================
   5. EJECUCIÓN SEGURA GLOBAL & INICIO DE SISTEMAS
   ========================================================================== */
const initApp = () => {
  if (typeof feather !== 'undefined') feather.replace();

  initCadejoFollower();
  initSmartNavbar();

  if (document.getElementById('contact-panel')) {
    try {
      new CipitioSystem();
      // console.log('Cipitio System Online');
    } catch (e) {
      // console.warn('Cipitio System not loaded yet', e);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.navbar-glass');
  const collapseEl = nav?.querySelector('.navbar-collapse');
  if (!collapseEl || typeof bootstrap === 'undefined') return;

  collapseEl.addEventListener('shown.bs.collapse', () => {
    document.body.classList.add('nav-open');
  });

  collapseEl.addEventListener('hidden.bs.collapse', () => {
    document.body.classList.remove('nav-open');
  });

  // Cierra el menú al tocar un link
  collapseEl.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const instance = bootstrap.Collapse.getInstance(collapseEl);
    if (instance) instance.hide();
  });
});
