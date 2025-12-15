// static/js/modules/SkySystem.js
import { lerpColor } from './Utils.js';

export class SkySystem {
    constructor() {
        this.stars = [];
        this.clouds = [];
        this.sunParticles = [];
        this.init();
    }

    init() {
        // --- ESTRELLAS (60) ---
        for(let i=0; i<60; i++) {
            this.stars.push({
                x: Math.random(), 
                y: Math.random() * 0.75, 
                size: Math.random() * 2.0, 
                baseAlpha: Math.random(), 
                blinkSpeed: 0.02 + Math.random() * 0.04, 
                blinkOffset: Math.random() * Math.PI * 2
            });
        }

        // --- NUBES REALISTAS Y DISTRIBUIDAS ---
        const numClouds = 8;
        // Dividimos el ancho de la pantalla entre el número de nubes
        // para asegurar que cada una tenga su propio espacio.
        const stepX = window.innerWidth / numClouds;

        for(let i=0; i<numClouds; i++) {
            
            // --- Creación de puffs (forma de la nube) ---
            let puffs = [];
            let numPuffs = 6 + Math.random() * 5; 
            
            for(let j=0; j<numPuffs; j++) {
                puffs.push({
                    xOff: (Math.random() - 0.5) * 120, 
                    yOff: (Math.random() - 0.5) * 40,  
                    radius: 25 + Math.random() * 30    
                });
            }

            // --- POSICIONAMIENTO DISTRIBUIDO ---
            // X: Posición base según el índice (i) + un desplazamiento aleatorio dentro de su sector
            let posX = (i * stepX) + (Math.random() * stepX * 0.8);
            
            // Y: Altura aleatoria, pero ampliamos el rango para que no se vean en fila india
            // Entre el 10% y el 55% de la altura de la pantalla
            let posY = window.innerHeight * (0.10 + Math.random() * 0.45);

            this.clouds.push({
                x: posX,
                y: posY, 
                speed: 0.15 + Math.random() * 0.2, // Velocidad suave
                scale: 0.6 + Math.random() * 0.6,
                puffs: puffs 
            });
        }
    }

    render(ctx, w, h, time, scrollPercent) {
        this.drawBackground(ctx, w, h, time, scrollPercent);
        this.drawSun(ctx, w, h, scrollPercent);
        this.drawClouds(ctx, w, scrollPercent);
    }

    drawBackground(ctx, w, h, time, scrollPercent) {
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        
        const night = ['#020005', '#2e0a0a', '#7a1515', '#ff6600'];
        const day = ['#004e92', '#603f83', '#fd5e53', '#ffe066'];

        const c0 = lerpColor(night[0], day[0], scrollPercent);
        const c1 = lerpColor(night[1], day[1], scrollPercent);
        const c2 = lerpColor(night[2], day[2], scrollPercent);
        const c3 = lerpColor(night[3], day[3], scrollPercent);

        grad.addColorStop(0, c0);
        grad.addColorStop(0.5, c1);
        grad.addColorStop(0.75, c2);
        grad.addColorStop(1, c3);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Estrellas
        const dayFade = Math.max(0, 1 - scrollPercent * 1.5); 
        
        if (dayFade > 0.01) {
            ctx.fillStyle = '#ffffff';
            this.stars.forEach(s => {
                const flicker = (Math.sin(time * s.blinkSpeed + s.blinkOffset) + 1) / 2;
                ctx.globalAlpha = s.baseAlpha * flicker * dayFade; 
                ctx.beginPath();
                ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }

    drawSun(ctx, w, h, scrollPercent) {
        let sunX = w * 0.9;
        let sunYBase = h * 0.85;
        let sunYTarget = h * 0.25; 
        
        let sunY = sunYBase - (scrollPercent * (sunYBase - sunYTarget));
        let sunSize = h * 0.28;
        
        let sunGrad = ctx.createLinearGradient(sunX, sunY-sunSize, sunX, sunY+sunSize);
        sunGrad.addColorStop(0, '#ffcc00');
        sunGrad.addColorStop(0.6, '#ff4400');
        sunGrad.addColorStop(1, '#ff0055');
        
        ctx.save();
        ctx.fillStyle = sunGrad;
        ctx.beginPath(); 
        ctx.arc(sunX, sunY, sunSize, 0, Math.PI*2); 
        ctx.fill();
        ctx.restore();

        // Partículas Solares
        if(Math.random() > 0.8) {
            this.sunParticles.push({
                x: sunX + (Math.random()-0.5)*sunSize, 
                y: sunY + (Math.random()-0.5)*sunSize*0.5, 
                vx: 0, vy: -0.5 - Math.random(), life: 1, color: '#ffcc00'
            });
        }
        this.sunParticles.forEach((p, i) => {
            p.y += p.vy;
            p.life -= 0.01;
            if(p.life <= 0) this.sunParticles.splice(i, 1);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        ctx.globalAlpha = 1;
    }

    drawClouds(ctx, w, scrollPercent) {
        // Hacemos que aparezcan suavemente al bajar
        let cloudAlpha = (scrollPercent - 0.15) * 1.5; 
        cloudAlpha = Math.max(0, Math.min(0.85, cloudAlpha)); 

        if (cloudAlpha <= 0) return;

        this.clouds.forEach(c => {
            // Movimiento
            c.x += c.speed;
            
            // Cuando la nube sale por la derecha, la reiniciamos a la izquierda
            // Y le damos una nueva altura aleatoria para variar
            if (c.x > w + 200) {
                c.x = -200;
                c.y = window.innerHeight * (0.10 + Math.random() * 0.45);
            }

            c.puffs.forEach(puff => {
                const px = c.x + puff.xOff * c.scale;
                const py = c.y + puff.yOff * c.scale;
                const radius = puff.radius * c.scale;

                // Degradado Radial para realismo
                const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
                grad.addColorStop(0, `rgba(255, 255, 255, ${cloudAlpha})`); 
                grad.addColorStop(0.4, `rgba(255, 255, 255, ${cloudAlpha * 0.8})`);
                grad.addColorStop(1, `rgba(255, 255, 255, 0)`); 

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        
        ctx.globalAlpha = 1;
    }
}