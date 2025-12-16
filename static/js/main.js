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
        // CORRECCIÓN: Restaurada la lógica original robusta para detectar scroll
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
        // Notificar a los sistemas que hubo resize
        city.resize(w, h);
    }

    // --- EVENT LISTENERS GLOBALES ---
    window.addEventListener('resize', resize);
    // Escuchar scroll para actualizar inmediatamente, además del loop
    window.addEventListener('scroll', updateScrollState); 
    
    window.addEventListener('mousemove', e => {
        mouseX = (e.clientX - w/2) / (w/2);
        mouseY = (e.clientY - h/2) / (h/2);
        
        // Cursor para el cubo
        if (isHome && cube) {
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let hitRadius = cube.isMenuOpen ? 450 : 150;
            document.body.style.cursor = (dist < hitRadius) ? 'pointer' : 'default';
        }
    });

    // Iniciar
    resize();

    function animate() {
        // Calculamos scroll en cada frame para suavidad total
        updateScrollState();
        
        time++;
        ctx.clearRect(0, 0, w, h);

        // Renderizar por capas (Fondo -> Ciudad -> Cubo)
        // Pasamos scrollPercent explícitamente al cielo para que cambie de color y mueva el sol
        sky.render(ctx, w, h, time, scrollPercent);
        // Añade scrollPercent al final
        city.render(ctx, w, h, time, scrollPercent);
        
        if (isHome && cube) {
            cube.render(ctx, w, h, time, mouseX, mouseY, scrollPercent);
        }

        window.svAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// ... (resto del código de main.js) ...

// --- SISTEMA DE TARJETAS 3D (TILT EFFECT) ---
function init3DTiltCards() {
    const cards = document.querySelectorAll('.cyber-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calcular posición del mouse dentro de la tarjeta
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calcular el centro
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcular rotación (Max 15 grados)
            // Multiplicamos por -1 en X para que se incline hacia el mouse
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;

            // Aplicar transformación en tiempo real
            // "scale(1.05)" hace que se agrande un poquito
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            
            // Quitamos la transición mientras movemos para que sea instantáneo (sin lag)
            card.style.transition = 'box-shadow 0.3s, border-color 0.3s'; 
        });

        card.addEventListener('mouseleave', () => {
            // Al salir, devolvemos la tarjeta a su posición original
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
            
            // Devolvemos la transición suave para que regrese "flotando"
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.3s';
        });
    });
}

// Llamar a la función si existen tarjetas
if (document.querySelector('.cyber-card')) {
    init3DTiltCards();
}