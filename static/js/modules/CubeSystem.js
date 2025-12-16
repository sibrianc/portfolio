// static/js/modules/CubeSystem.js

export class CubeSystem {
    constructor(menuContainer) {
        this.menuContainer = menuContainer;
        this.isMenuOpen = false;
        
        // Variables de animación
        this.expansion = 0;
        this.targetExpansion = 0;
        this.time = 0;
        
        this.scrollPercent = 0;
        this.init();
    }

    init() {
        this.setupEvents();
    }

    setupEvents() {
        window.addEventListener('click', (e) => {
            if (this.scrollPercent > 0.5) return;
            if (e.target.classList.contains('menu-item')) return;

            const w = window.innerWidth;
            const h = window.innerHeight;
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            let hitRadius = 150; 

            if (dist < hitRadius) {
                this.isMenuOpen = !this.isMenuOpen;
                this.targetExpansion = this.isMenuOpen ? 1.0 : 0; 
                
                if(this.isMenuOpen && this.menuContainer) {
                    this.menuContainer.classList.add('menu-active');
                } else if (this.menuContainer) {
                    this.menuContainer.classList.remove('menu-active');
                }
            }
        });
    }

    drawOrbit(ctx, cx, cy, radiusX, radiusY, angle, color, lineWidth, dash) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        if (dash) ctx.setLineDash(dash);
        ctx.stroke();
        
        ctx.restore();
    }

    drawElectron(ctx, cx, cy, radiusX, radiusY, angle, orbitProgress, color) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        
        let x = radiusX * Math.cos(orbitProgress);
        let y = radiusY * Math.sin(orbitProgress);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        
        ctx.restore();
    }

    render(ctx, w, h, time, mouseX, mouseY, scrollPercent) {
        this.scrollPercent = scrollPercent;

        // --- AUTO-CIERRE AL HACER SCROLL ---
        // Si el menú está abierto y el usuario baja un poco (más del 1%), lo cerramos a la fuerza.
        if (this.isMenuOpen && scrollPercent > 0.01) {
            this.isMenuOpen = false;
            this.targetExpansion = 0; // Regresar animación
            if(this.menuContainer) {
                this.menuContainer.classList.remove('menu-active'); // Ocultar HTML
            }
        }

        if (scrollPercent > 0.5) return;
        
        let globalAlpha = 1 - (scrollPercent * 2);
        ctx.globalAlpha = Math.max(0, globalAlpha);

        this.time += 0.02; 
        this.expansion += (this.targetExpansion - this.expansion) * 0.1;

        let cx = w / 2;
        let cy = h / 2;
        let baseSize = Math.min(w, h) * 0.14; 

        let expansionOffset = this.expansion * 40;

        // --- PALETA DE COLOR "ICE WHITE" ---
        const mainColor = '#e0ffff'; // Blanco Hielo
        const accentColor = '#ffffff'; // Blanco Puro
        
        // --- 1. NÚCLEO CENTRAL ---
        ctx.beginPath();
        ctx.arc(cx, cy, baseSize * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#000000'; // Fondo negro
        ctx.fill();
        
        // Botón brillante
        ctx.beginPath();
        ctx.arc(cx, cy, baseSize * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = this.isMenuOpen ? accentColor : mainColor;
        ctx.shadowBlur = 20; 
        ctx.shadowColor = this.isMenuOpen ? accentColor : mainColor;
        ctx.fill();
        ctx.shadowBlur = 0; 

        // Icono (Hamburguesa)
        ctx.strokeStyle = '#050f19'; 
        ctx.lineWidth = 2.5; 
        let iconSize = baseSize * 0.05; 
        let lineGap = 6; 

        ctx.beginPath();
        if(this.isMenuOpen) {
            ctx.moveTo(cx - iconSize, cy - iconSize); ctx.lineTo(cx + iconSize, cy + iconSize);
            ctx.moveTo(cx + iconSize, cy - iconSize); ctx.lineTo(cx - iconSize, cy + iconSize);
        } else {
            ctx.moveTo(cx - iconSize, cy - lineGap); ctx.lineTo(cx + iconSize, cy - lineGap);
            ctx.moveTo(cx - iconSize, cy);           ctx.lineTo(cx + iconSize, cy);
            ctx.moveTo(cx - iconSize, cy + lineGap); ctx.lineTo(cx + iconSize, cy + lineGap);
        }
        ctx.stroke();


        // --- 2. ORBITALES (3 ELECTRONES) ---
        
        // Orbital 1: Vertical (Lento)
        let angle1 = this.time * 0.5; 
        let thickness1 = baseSize * 0.4 + (Math.abs(mouseX) * 20);
        this.drawOrbit(ctx, cx, cy, baseSize + expansionOffset, thickness1, angle1, mainColor, 1.5, []);
        this.drawElectron(ctx, cx, cy, baseSize + expansionOffset, thickness1, angle1, this.time * 2, accentColor);

        // Orbital 2: Diagonal 1
        let angle2 = (Math.PI / 3) + (this.time * 0.3);
        let thickness2 = baseSize * 0.4 + (Math.abs(mouseY) * 20);
        this.drawOrbit(ctx, cx, cy, baseSize * 0.9 + expansionOffset, thickness2, angle2, mainColor, 1.5, []); 
        this.drawElectron(ctx, cx, cy, baseSize * 0.9 + expansionOffset, thickness2, angle2, this.time * 2.5, accentColor);
        
        // Orbital 3: Diagonal 2
        let angle3 = -(Math.PI / 3) - (this.time * 0.4);
        this.drawOrbit(ctx, cx, cy, baseSize * 0.8 + expansionOffset, thickness1, angle3, mainColor, 1.5, []);
        this.drawElectron(ctx, cx, cy, baseSize * 0.8 + expansionOffset, thickness1, angle3, -this.time * 3, accentColor);


        // --- 3. ANILLOS EXTERNOS HUD ---
        let hudAlpha = 0.3 + (this.expansion * 0.7); 
        ctx.globalAlpha = Math.min(1, globalAlpha * hudAlpha);
        let baseRadius = baseSize * 1.5 + expansionOffset;

        // Anillo 1
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, -this.time * 0.5, -this.time * 0.5 + Math.PI * 1.5); 
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();

        // Anillo 2
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + 15, this.time * 0.3, this.time * 0.3 + Math.PI); 
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 10, 2, 10]); 
        ctx.stroke();

        // Anillo 3
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + 35, -this.time * 0.1, -this.time * 0.1 + Math.PI * 1.8); 
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([40, 20]);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
}