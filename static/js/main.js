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
        city.render(ctx, w, h, time);
        
        if (isHome && cube) {
            cube.render(ctx, w, h, time, mouseX, mouseY, scrollPercent);
        }

        window.svAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}