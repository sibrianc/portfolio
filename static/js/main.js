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

    // Projects usa el fondo genérico (suelo oscuro simple) para no distraer

    let w, h;
    let time = 0;
    let scrollPercent = 0;

    // -----------------------------------------------------------------------------
// Fake (virtual) scroll for ABOUT + CONTACT
// Purpose: wheel mueve scrollPercent sin mover la pagina (no scroll real).
// -----------------------------------------------------------------------------
const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isWideEnough = window.matchMedia('(min-width: 992px)').matches; // ajusta si quieres
const isFakeScrollPage = (isAbout || isContact) && isDesktopPointer && isWideEnough;

let fakeScrollTarget = 0;   // 0..1 (lo que “queremos”)
let fakeScrollCurrent = 0;  // 0..1 (lo que se usa, suavizado)

const FAKE_SCROLL_SENSITIVITY = 0.0012; // ajusta si lo quieres mas rapido/lento
const FAKE_SCROLL_EASE = 0.14;          // suavizado (0.10–0.25)

const clamp01 = (v) => Math.max(0, Math.min(1, v));

if (isFakeScrollPage) {
  // Bloquea el scroll real
  document.documentElement.classList.add('fake-scroll');
  document.body.classList.add('fake-scroll');
  window.scrollTo(0, 0);

  // Wheel => cambia fakeScrollTarget
  const onWheel = (e) => {
    // Permite scroll natural dentro de inputs/textarea si lo necesitas
    const allowNative = e.target.closest('textarea, input, select, [data-allow-native-scroll]');
    if (allowNative) return;

    e.preventDefault();
    fakeScrollTarget = clamp01(fakeScrollTarget + (e.deltaY * FAKE_SCROLL_SENSITIVITY));
  };

  window.addEventListener('wheel', onWheel, { passive: false });
}
    
    // Variables para el Parallax del fondo
    let bgMouseX = 0, bgMouseY = 0; 

    // Instanciar Sistemas (Pasamos el pageType)
    const sky = new SkySystem();
    const city = new CitySystem(pageType); 
    const cube = isHome ? new CubeSystem(menuContainer) : null;

    // --- MANEJO DE SCROLL ---
    function updateScrollState() {

  // ============================
  // A) FAKE SCROLL (ABOUT/CONTACT)
  // ============================
  if (isFakeScrollPage) {
    // Suaviza el movimiento hacia el target
    fakeScrollCurrent += (fakeScrollTarget - fakeScrollCurrent) * FAKE_SCROLL_EASE;
    scrollPercent = clamp01(fakeScrollCurrent);
  }

  // ============================
  // B) SCROLL REAL (HOME/PROJECTS/OTRAS)
  // ============================
  else {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const docHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;

    // Cálculo seguro del porcentaje (0.0 a 1.0)
    scrollPercent = (docHeight <= 0) ? 0 : Math.max(0, Math.min(1, scrollTop / docHeight));
  }

  // --- LÓGICA DEL CADEJO (se esconde con la luz/scroll) ---
  const cadejoEl = document.getElementById('cadejo-ghost');

  // Si existe el cadejo (About o Projects)
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

    // Listeners del Fondo
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScrollState); 
    
    // Parallax del fondo (Normalizado de -1 a 1)
    window.addEventListener('mousemove', e => {
        bgMouseX = (e.clientX - w/2) / (w/2);
        bgMouseY = (e.clientY - h/2) / (h/2);
        
        // Cursor interactivo para el cubo (solo si está en home)
        if (isHome && cube) {
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let hitRadius = cube.isMenuOpen ? 450 : 160; 
            
            document.body.style.cursor = (dist < hitRadius) ? 'pointer' : 'default';
        }
    });

    // Iniciar
    resize();

    // --- LOOP DE ANIMACIÓN DEL FONDO ---
    function animateBackground() {
        updateScrollState();
        time++;
        ctx.clearRect(0, 0, w, h);

        // Calcular luz del menú
        let menuLight = (isHome && cube) ? cube.expansion : 0;

        // 1. Renderizar Cielo (Sol y Estrellas se mueven con scrollPercent)
        sky.render(ctx, w, h, time, scrollPercent);
        
        // 2. Renderizar Ciudad/Paisaje (Depende de pageType)
        city.render(ctx, w, h, time, scrollPercent, menuLight);
        
        // 3. Renderizar Cubo
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
        card.addEventListener('touchmove', (e) => handleTilt(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        card.addEventListener('touchend', resetTilt);
    });
}
if (document.querySelector('.cyber-card')) {
    init3DTiltCards();
}

/* ==========================================================================
   3. CADEJO: GHOST FOLLOWER SYSTEM (PREMIUM UX)
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

    // --- LOOP DE ANIMACIÓN CADEJO ---
    const animateGhost = () => {
        // Interpolación (Lerp) para movimiento suave
        const speed = 0.12; 
        currentX += (targetX - currentX) * speed;
        currentY += (targetY - currentY) * speed;

        cadejo.style.left = `${currentX}px`;
        cadejo.style.top = `${currentY}px`;

        // Lógica de Ojos (Mirar al cursor real)
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.sqrt(dx*dx + dy*dy) / 10, 3); 

        eyes.forEach(eye => {
            const pupil = eye.querySelector('.pupil');
            if(pupil) {
                const moveX = Math.cos(angle) * dist;
                const moveY = Math.sin(angle) * dist;
                pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        requestAnimationFrame(animateGhost);
    };
    
    requestAnimationFrame(animateGhost);

    // --- LISTENERS ---
    
    // PC: Mouse
    document.addEventListener('mousemove', (e) => {
        if(isMobileTouch) return;
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isVisible) {
            cadejo.classList.add('is-summoned'); // Usamos la clase de CSS para mostrarlo
            isVisible = true;
        }
    });

    // Si el mouse sale de la ventana, el fantasma desaparece
    document.addEventListener('mouseleave', () => {
        cadejo.classList.remove('is-summoned');
        isVisible = false;
    });

    // MÓVIL: Touch
    const handleTouch = (e) => {
        isMobileTouch = true;
        const touch = e.touches[0];
        targetX = touch.clientX;
        // Offset visual: El cadejo flota 60px arriba del dedo para que se vea
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
   4. SMART NAVBAR (AUTO-HIDE & AUTO-CLOSE) <--- NUEVA FUNCIÓN
   ========================================================================== */
function initSmartNavbar() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar-floating-container');
    const navCollapse = document.querySelector('.navbar-collapse'); // Menú móvil

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 1. Evitar "rebotes" molestos en móviles
        if (Math.abs(scrollTop - lastScrollTop) <= 5) return;

        // 2. Si bajamos más de 80px: OCULTAR
        if (scrollTop > lastScrollTop && scrollTop > 80) {
            navbar.classList.add('nav-hidden');
            
            // EXTRA: Si el menú móvil estaba abierto, ciérralo suavemente
            if (navCollapse && navCollapse.classList.contains('show')) {
                navCollapse.classList.remove('show');
            }
        } 
        // 3. Si subimos: MOSTRAR
        else {
            navbar.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
}

/* ==========================================================================
   5. EJECUCIÓN SEGURA GLOBAL & INICIO DE SISTEMAS
   ========================================================================== */
const initApp = () => {
    // 1. Iniciar Efectos Globales
    if (typeof feather !== 'undefined') feather.replace();

    // 2. Iniciar el Cadejo (si existe en el DOM)
    initCadejoFollower();

    // 3. Iniciar Navbar Inteligente (NUEVO)
    initSmartNavbar();

    // 4. INICIAR EL CIPITÍO 🍌 (Solo si estamos en la página de Contacto)
    if (document.getElementById('contact-panel')) {
        try {
            new CipitioSystem();
            console.log('🔮 Cipitio System Online');
        } catch (e) {
            console.warn('Cipitio System not loaded yet', e);
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}