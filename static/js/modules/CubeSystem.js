// static/js/modules/CubeSystem.js
import { rotateIso } from './Utils.js';

export class CubeSystem {
    constructor(menuContainer) {
        this.menuContainer = menuContainer;
        this.cubes = [];
        this.isMenuOpen = false;
        this.expansion = 0;
        this.targetExpansion = 0;
        this.cubeRotationBase = 0;
        this.init();
    }

    init() {
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) {
                for(let z=-1; z<=1; z++) {
                    if(x===0 && y===0 && z===0) continue;
                    this.cubes.push({ ox: x, oy: y, oz: z, x: x, y: y, z: z });
                }
            }
        }
        this.setupEvents();
    }

    setupEvents() {
        window.addEventListener('click', (e) => {
            // Solo actuar si no se hizo clic en un link del menú
            if(e.target.classList.contains('menu-item')) return;
            
            // Verificamos si estamos cerca del centro (el cubo)
            const w = window.innerWidth;
            const h = window.innerHeight;
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let hitRadius = this.isMenuOpen ? 450 : 150;
            
            if (dist < hitRadius) {
                this.isMenuOpen = !this.isMenuOpen;
                this.targetExpansion = this.isMenuOpen ? 3.0 : 0; 
                if(this.isMenuOpen && this.menuContainer) {
                    this.menuContainer.classList.add('menu-active');
                } else if (this.menuContainer) {
                    this.menuContainer.classList.remove('menu-active');
                }
            }
        });
    }

    render(ctx, w, h, time, mouseX, mouseY, scrollPercent) {
        if (scrollPercent > 0.5) return;

        this.cubeRotationBase += 0.005;
        this.expansion += (this.targetExpansion - this.expansion) * 0.1;

        let cx = w/2;
        let cy = h/2;
        let blockSize = Math.min(w, h) * 0.055; 
        let gap = blockSize * 2.0;
        let rx = -mouseY * 0.3 + Math.sin(time * 0.01) * 0.05;
        let ry = mouseX * 0.3 + this.cubeRotationBase;

        let projectedCubes = this.cubes.map(cube => {
            let dist = gap + (this.expansion * (blockSize * 0.5));
            let tx = cube.ox * dist;
            let ty = cube.oy * dist;
            let tz = cube.oz * dist;
            let p = rotateIso(tx, ty, tz, rx, ry);
            return { ...cube, px: p.x, py: p.y, pz: p.z };
        });
        projectedCubes.sort((a, b) => b.pz - a.pz);

        projectedCubes.forEach(cube => {
            let vertices = [
                {x:-1,y:-1,z:-1}, {x:1,y:-1,z:-1}, {x:1,y:1,z:-1}, {x:-1,y:1,z:-1},
                {x:-1,y:-1,z:1}, {x:1,y:-1,z:1}, {x:1,y:1,z:1}, {x:-1,y:1,z:1}
            ];

            let projVerts = vertices.map(v => {
                let vx = v.x * (blockSize * 0.96) + cube.px;
                let vy = v.y * (blockSize * 0.96) + cube.py;
                let vz = v.z * (blockSize * 0.96) + cube.pz;
                let depth = 800;
                let scale = depth / (depth - vz); 
                return { x: cx + vx * scale, y: cy + vy * scale };
            });

            ctx.lineWidth = 1;
            ctx.lineJoin = 'miter';
            ctx.strokeStyle = '#00aaff'; 
            ctx.fillStyle = 'rgba(5, 15, 25, 0.9)';

            const faces = [[0,1,2,3], [4,5,6,7], [0,1,5,4], [2,3,7,6], [0,3,7,4], [1,2,6,5]];
            faces.forEach(face => {
                ctx.beginPath();
                ctx.moveTo(projVerts[face[0]].x, projVerts[face[0]].y);
                ctx.lineTo(projVerts[face[1]].x, projVerts[face[1]].y);
                ctx.lineTo(projVerts[face[2]].x, projVerts[face[2]].y);
                ctx.lineTo(projVerts[face[3]].x, projVerts[face[3]].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
        });

        if (this.expansion < 0.2) {
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#00aaff';
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.arc(cx, cy, blockSize * 3.5, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy - 6); ctx.lineTo(cx + 10, cy - 6);
            ctx.moveTo(cx - 10, cy);     ctx.lineTo(cx + 10, cy);
            ctx.moveTo(cx - 10, cy + 6); ctx.lineTo(cx + 10, cy + 6);
            ctx.stroke();
        }
    }
}