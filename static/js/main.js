import { SkySystem } from './modules/SkySystem.js';
import { CitySystem } from './modules/CitySystem.js';
import { CubeSystem } from './modules/CubeSystem.js';

// --- INICIALIZACIÓN ---
const canvas = document.getElementById('canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    const menuContainer = document.getElementById('menu-container');
    const isHome = !!menuContainer;

    let w, h;
    let time = 0;
    let scrollPercent = 0;
    let mouseX = 0, mouseY = 0;

    // Instanciar Sistemas
    const sky = new SkySystem();
    const city = new CitySystem();
    // El cubo solo se crea si estamos en home
    const cube = isHome ? new CubeSystem(menuContainer) : null;

    // --- MANEJO DE ESTADO ---
    function updateScrollState() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        
        const docHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        ) - window.innerHeight;

        // Cálculo seguro del porcentaje (0.0 a 1.0)
        scrollPercent = (docHeight <= 0) ? 0 : Math.max(0, Math.min(1, scrollTop / docHeight));
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        city.resize(w, h);
    }

    // --- EVENT LISTENERS GLOBALES ---
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScrollState); 
    
    window.addEventListener('mousemove', e => {
        // Normalizar mouse de -1 a 1 para efectos de parallax
        mouseX = (e.clientX - w/2) / (w/2);
        mouseY = (e.clientY - h/2) / (h/2);
        
        // Cursor interactivo para el cubo
        if (isHome && cube) {
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let hitRadius = cube.isMenuOpen ? 450 : 160; // Radio expandido si está abierto
            document.body.style.cursor = (dist < hitRadius) ? 'pointer' : 'default';
        }
    });

    // Iniciar
    resize();

    function animate() {
        updateScrollState();
        time++;
        ctx.clearRect(0, 0, w, h);

        // --- CALCULAR LUZ DEL MENÚ ---
        // Obtenemos qué tan abierto está el menú (0.0 a 1.0)
        let menuLight = (isHome && cube) ? cube.expansion : 0;

        // 1. Cielo
        sky.render(ctx, w, h, time, scrollPercent);
        
        // 2. Ciudad (Aquí pasamos menuLight)
        // CitySystem usará este valor para iluminar edificios pero ignorar montañas
        city.render(ctx, w, h, time, scrollPercent, menuLight);
        
        // 3. Artefacto/Cubo
        if (isHome && cube) {
            cube.render(ctx, w, h, time, mouseX, mouseY, scrollPercent);
        }

        window.svAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// ... (resto del código de main.js para las tarjetas) ...

// --- SISTEMA DE TARJETAS 3D (TILT EFFECT) ---
function init3DTiltCards() {
    const cards = document.querySelectorAll('.cyber-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            card.style.transition = 'box-shadow 0.3s, border-color 0.3s'; 
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.3s';
        });
    });
}

if (document.querySelector('.cyber-card')) {
    init3DTiltCards();
}