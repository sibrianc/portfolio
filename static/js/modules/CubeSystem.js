// static/js/modules/CubeSystem.js

export class CubeSystem {
    constructor(menuContainer) {
        this.menuContainer = menuContainer;
        this.isMenuOpen = false;
        
        this.expansion = 0;
        this.targetExpansion = 0;
        this.time = 0;
        this.scrollPercent = 0;
        
        this.vertices = [];
        this.edges = [];
        this.initArtifactGeometry(); 
        this.init();
    }

    init() { this.setupEvents(); }

    initArtifactGeometry() {
        // Octaedro (6 Vértices)
        this.vertices = [
            {x: 0, y: -1, z: 0},  // 0. Arriba
            {x: 1, y: 0, z: 0},   // 1. Derecha
            {x: 0, y: 0, z: 1},   // 2. Frente
            {x: -1, y: 0, z: 0},  // 3. Izquierda
            {x: 0, y: 0, z: -1},  // 4. Atrás
            {x: 0, y: 1, z: 0},   // 5. Abajo
        ];

        this.edges = [
            [0, 1], [0, 2], [0, 3], [0, 4], 
            [1, 2], [2, 3], [3, 4], [4, 1], 
            [5, 1], [5, 2], [5, 3], [5, 4]  
        ];
    }

    setupEvents() {
        window.addEventListener('click', (e) => {
            if (this.scrollPercent > 0.5) return;
            if (e.target.classList.contains('menu-item')) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            if (Math.sqrt(dx*dx + dy*dy) < 160) {
                this.isMenuOpen = !this.isMenuOpen;
                this.targetExpansion = this.isMenuOpen ? 1.0 : 0; 
                if(this.isMenuOpen && this.menuContainer) this.menuContainer.classList.add('menu-active');
                else if (this.menuContainer) this.menuContainer.classList.remove('menu-active');
            }
        });
    }

    project(v, w, h, scale) {
        let angleX = this.time * 0.5;
        let angleY = this.time * 0.8;
        
        let x1 = v.x * Math.cos(angleY) - v.z * Math.sin(angleY);
        let z1 = v.x * Math.sin(angleY) + v.z * Math.cos(angleY);
        let y2 = v.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = v.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        let fov = 4; 
        let perspective = fov / (fov + z2); 
        
        return {
            x: x1 * perspective * scale + w/2,
            y: y2 * perspective * scale + h/2,
            z: z2, // Profundidad Z para el sorting
            scale: perspective
        };
    }

    // --- ARO MEJORADO (NEO-GLYPH TECH) ---
    drawAztecPattern(ctx, cx, cy, radius, startAngle, endAngle, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2; 
        
        let totalArc = endAngle - startAngle;
        let segments = 20; 
        let step = totalArc / segments;

        ctx.beginPath();
        for(let i=0; i < segments; i++) {
            let a1 = startAngle + i * step;
            let a2 = a1 + step * 0.7; 
            
            let type = i % 4; 
            let r = radius;

            if (type === 0 || type === 3) {
                ctx.moveTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
                ctx.lineTo(cx + Math.cos(a2)*r, cy + Math.sin(a2)*r);
            } else {
                let rHigh = radius + 6;
                ctx.moveTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
                ctx.lineTo(cx + Math.cos(a1)*rHigh, cy + Math.sin(a1)*rHigh);
                ctx.lineTo(cx + Math.cos(a2)*rHigh, cy + Math.sin(a2)*rHigh);
                ctx.lineTo(cx + Math.cos(a2)*r, cy + Math.sin(a2)*r);
            }
        }
        ctx.stroke();
        
        ctx.fillStyle = color;
        for(let i=0; i < segments; i++) {
            if (i % 2 !== 0) { 
                let a = startAngle + i * step + step*0.35;
                let rx = cx + Math.cos(a) * (radius - 5);
                let ry = cy + Math.sin(a) * (radius - 5);
                ctx.beginPath();
                ctx.arc(rx, ry, 1.5, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    render(ctx, w, h, time, mouseX, mouseY, scrollPercent) {
        this.scrollPercent = scrollPercent;
        if (this.isMenuOpen && scrollPercent > 0.01) {
            this.isMenuOpen = false; this.targetExpansion = 0; 
            if(this.menuContainer) this.menuContainer.classList.remove('menu-active'); 
        }
        if (scrollPercent > 0.5) return;
        
        let globalAlpha = 1 - (scrollPercent * 2);
        ctx.globalAlpha = Math.max(0, globalAlpha);

        let speedMult = this.isMenuOpen ? 0.3 : 1.0; 
        this.time += 0.01 * speedMult; 
        this.expansion += (this.targetExpansion - this.expansion) * 0.1;

        let baseSize = Math.min(w, h) * 0.14; 
        let scale = baseSize * (0.8 + this.expansion * 0.4); 
        const colorPrimary = this.isMenuOpen ? '#00ffcc' : '#00aaff'; 
        const colorCore = '#ffd700'; 

        // 1. FONDO
        ctx.beginPath(); ctx.arc(w/2, h/2, baseSize * 0.5, 0, Math.PI * 2);
        let glow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, baseSize * 1.5);
        glow.addColorStop(0, 'rgba(0, 20, 40, 0.8)'); glow.addColorStop(0.5, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = glow; ctx.fill();

        // --- PROYECCIÓN Y SORTING ---
        let pVerts = this.vertices.map(v => this.project(v, w, h, scale));

        // Clasificar líneas en Traseras (Fondo) y Frontales
        let backEdges = [];
        let frontEdges = [];

        this.edges.forEach(edge => {
            let p1 = pVerts[edge[0]];
            let p2 = pVerts[edge[1]];
            // Si la profundidad promedio es positiva, está atrás (z > 0 es lejos)
            let zDepth = (p1.z + p2.z) / 2;
            if (zDepth > 0) backEdges.push({p1, p2});
            else frontEdges.push({p1, p2});
        });

        // Función auxiliar de dibujo para no repetir código
        const drawEdgeBatch = (edgesList) => {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            edgesList.forEach(e => {
                ctx.beginPath(); ctx.moveTo(e.p1.x, e.p1.y); ctx.lineTo(e.p2.x, e.p2.y);
                let grad = ctx.createLinearGradient(e.p1.x, e.p1.y, e.p2.x, e.p2.y);
                grad.addColorStop(0, colorPrimary); grad.addColorStop(1, 'rgba(255,255,255,0.5)'); 
                ctx.strokeStyle = grad;
                ctx.shadowBlur = this.isMenuOpen ? 15 : 5;
                ctx.shadowColor = colorPrimary;
                ctx.stroke();
            });
        };

        // 2. DIBUJAR ARISTAS TRASERAS (Detrás del núcleo)
        drawEdgeBatch(backEdges);

        // 3. NÚCLEO INTERNO (Sólido, tapa lo de atrás)
        let pulse = 1 + Math.sin(this.time * 5) * 0.2;
        ctx.beginPath();
        let coreSize = baseSize * 0.15 * pulse;
        ctx.moveTo(w/2, h/2 - coreSize); ctx.lineTo(w/2 + coreSize, h/2);
        ctx.lineTo(w/2, h/2 + coreSize); ctx.lineTo(w/2 - coreSize, h/2);
        ctx.closePath();
        ctx.fillStyle = colorCore; 
        ctx.shadowBlur = 20; ctx.shadowColor = colorCore; ctx.fill();

        // 4. DIBUJAR ARISTAS FRONTALES (Delante del núcleo)
        drawEdgeBatch(frontEdges);

        // 5. DIBUJAR LAS "BOLITAS" (Siempre visibles)
        pVerts.forEach(p => {
            let nodeSize = 4 * p.scale; 
            ctx.beginPath(); ctx.arc(p.x, p.y, nodeSize, 0, Math.PI*2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff'; ctx.fill();
            
            ctx.beginPath(); ctx.arc(p.x, p.y, nodeSize * 1.5, 0, Math.PI*2);
            ctx.strokeStyle = colorCore; ctx.lineWidth = 1; ctx.stroke();
        });

        // 6. ARO AZTECA (Neo-Glyph)
        let hudR = baseSize * 1.4 + (this.expansion * 30);
        ctx.shadowBlur = 5; ctx.shadowColor = colorPrimary;
        ctx.save(); ctx.translate(w/2, h/2); ctx.rotate(this.time * 0.1); 
        
        this.drawAztecPattern(ctx, 0, 0, hudR, 0, Math.PI * 0.8, colorPrimary);
        this.drawAztecPattern(ctx, 0, 0, hudR, Math.PI, Math.PI * 1.8, colorPrimary);
        
        ctx.restore();

        // Aro externo
        ctx.beginPath(); ctx.arc(w/2, h/2, hudR + 10, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.stroke();
    }
}