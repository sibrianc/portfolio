(function() {
    // 1. Verificamos si existe el canvas
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    if (window.svAnimationId) {
        cancelAnimationFrame(window.svAnimationId);
    }

    const ctx = canvas.getContext('2d');
    
    // 2. DETECCIÓN INTELIGENTE: ¿Estamos en el Home?
    const menuContainer = document.getElementById('menu-container');
    const isHome = !!menuContainer; 

    let w, h;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    
    // Estado del cubo
    let isMenuOpen = false;
    let expansion = 0; 
    let targetExpansion = 0;
    let cubeRotationBase = 0;

    let mountainFacets = [];
    const stars = [];
    const sunParticles = [];
    const buildings = [];
    const cubes = [];

    // --- CONFIGURACIÓN DE ELEMENTOS ---
    for(let i=0; i<120; i++) {
        stars.push({x: Math.random(), y: Math.random() * 0.6, size: Math.random() * 1.3, alpha: Math.random()});
    }

    for(let i=0; i<15; i++) { 
        let b = {xRel: Math.random() * 0.6, yBase: Math.random() * 0.08, width: 8 + Math.random() * 10, height: 15 + Math.random() * 25, floors: [], antenna: Math.random() > 0.6};
        let numFloors = Math.floor(b.height / 5);
        for(let f=0; f<numFloors; f++) {
            b.floors.push({yOffset: f * 5 + 2, lights: Math.random() > 0.3, blinkSpeed: 0.02 + Math.random() * 0.05, phase: Math.random() * Math.PI});
        }
        buildings.push(b);
    }

    // Generamos los cubos
    for(let x=-1; x<=1; x++) {
        for(let y=-1; y<=1; y++) {
            for(let z=-1; z<=1; z++) {
                if(x===0 && y===0 && z===0) continue;
                cubes.push({ ox: x, oy: y, oz: z, x: x, y: y, z: z });
            }
        }
    }

    function generateSharpGeometricVolcano(startX, startY, peakStartX, peakEndX, peakY, endX, endY) {
        const facets = [];
        let ridges = [{x: startX, y: startY}, {x: startX + (peakStartX - startX) * 0.4, y: startY - (startY - peakY) * 0.3}, {x: peakStartX, y: peakY}, {x: peakEndX, y: peakY}, {x: endX - (endX - peakEndX) * 0.4, y: startY - (startY - peakY) * 0.4}, {x: endX, y: endY}];
        const palette = {shadowDeep: '#0F0F12', shadowSoft: '#1A1A1E', midTone: '#2E2828', lightWarm: '#4A3B3B', highlight: '#5E4848'};
        
        facets.push({points: [{x: startX, y: startY}, ridges[1], {x: ridges[1].x - (w*0.05), y: startY}], color: palette.shadowDeep});
        facets.push({points: [ridges[1], ridges[2], {x: ridges[1].x + (w*0.08), y: startY}], color: palette.shadowSoft});
        facets.push({points: [ridges[1], {x: ridges[1].x + (w*0.08), y: startY}, {x: ridges[1].x - (w*0.05), y: startY}], color: palette.shadowDeep});
        let baseCenter = {x: (startX + endX)/2, y: startY};
        facets.push({points: [ridges[2], ridges[3], baseCenter], color: palette.midTone});
        facets.push({points: [ridges[2], baseCenter, {x: ridges[1].x + (w*0.08), y: startY}], color: palette.shadowSoft});
        facets.push({points: [ridges[3], ridges[4], baseCenter], color: palette.lightWarm});
        facets.push({points: [ridges[4], {x: endX, y: endY}, {x: baseCenter.x + (w*0.1), y: startY}], color: palette.highlight});
        facets.push({points: [ridges[4], {x: baseCenter.x + (w*0.1), y: startY}, baseCenter], color: palette.lightWarm});
        return facets;
    }

    function generateLandscapeGeometry() {
        if(!w || !h) return;
        let horizonY = h * 0.82;
        mountainFacets = [];
        mountainFacets.push(...generateSharpGeometricVolcano(w*-0.05, horizonY, w*0.1, w*0.13, horizonY - h*0.2, w*0.25, horizonY));
        mountainFacets.push(...generateSharpGeometricVolcano(w*0.15, horizonY, w*0.42, w*0.48, horizonY - h*0.4, w*0.75, horizonY));
        mountainFacets.push(...generateSharpGeometricVolcano(w*0.65, horizonY, w*0.72, w*0.75, horizonY - h*0.15, w*0.85, horizonY));
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        generateLandscapeGeometry();
        buildings.forEach(b => { b.xRel = Math.random() * 0.6; });
    }
    
    window.addEventListener('resize', resize);
    
    window.addEventListener('mousemove', e => {
        mouseX = (e.clientX - w/2) / (w/2);
        mouseY = (e.clientY - h/2) / (h/2);

        // --- MANITA EN EL CUBO ---
        if (isHome) {
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Radio dinámico: Si está abierto, detectamos clics mucho más lejos
            let hitRadius = isMenuOpen ? 450 : 150;

            if (dist < hitRadius) {
                document.body.style.cursor = 'pointer'; 
            } else {
                document.body.style.cursor = 'default'; 
            }
        }
    });

    // Click listener
    if (isHome) {
        window.addEventListener('click', (e) => {
            if(e.target.classList.contains('menu-item')) return;
            
            let dx = e.clientX - w/2; 
            let dy = e.clientY - h/2;
            let dist = Math.sqrt(dx*dx + dy*dy);

            // CORRECCIÓN: Usamos el mismo radio dinámico para el clic
            // Así puedes hacer clic en las piezas flotantes para cerrar
            let hitRadius = isMenuOpen ? 450 : 150;

            if (dist < hitRadius) {
                isMenuOpen = !isMenuOpen;
                targetExpansion = isMenuOpen ? 3.0 : 0; 
                
                if(isMenuOpen && menuContainer) {
                    menuContainer.classList.add('menu-active');
                } else if (menuContainer) {
                    menuContainer.classList.remove('menu-active');
                }
            }
        });
    }

    resize();

    function rotateIso(x, y, z, rx, ry) {
        let x1 = x * Math.cos(ry) - z * Math.sin(ry);
        let z1 = x * Math.sin(ry) + z * Math.cos(ry);
        let y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
        return {x: x1, y: y1, z: z2};
    }

    function drawBackground() {
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#020005');
        grad.addColorStop(0.5, '#2e0a0a');
        grad.addColorStop(0.75, '#7a1515');
        grad.addColorStop(1, '#ff6600');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
            ctx.globalAlpha = s.alpha * 0.6;
            ctx.beginPath();
            ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawSun() {
        let sunX = w * 0.9;
        let sunY = h * 0.85; 
        let sunSize = h * 0.28;
        
        let sunGrad = ctx.createLinearGradient(sunX, sunY-sunSize, sunX, sunY+sunSize);
        sunGrad.addColorStop(0, '#ffcc00');
        sunGrad.addColorStop(0.6, '#ff4400');
        sunGrad.addColorStop(1, '#ff0055');
        
        ctx.save();
        ctx.fillStyle = sunGrad;
        ctx.beginPath(); ctx.arc(sunX, sunY, sunSize, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for(let i=0; i<10; i++) {
            let yPos = sunY + i * (h*0.02);
            if (yPos > sunY + sunSize) break;
            ctx.fillRect(sunX - sunSize, yPos, sunSize*2, h*0.005);
        }
        ctx.restore();

        if(Math.random() > 0.8) {
            sunParticles.push({x: sunX + (Math.random()-0.5)*sunSize, y: sunY + (Math.random()-0.5)*sunSize*0.5, vx: 0, vy: -0.5 - Math.random(), life: 1, color: '#ffcc00'});
        }
        
        sunParticles.forEach((p, i) => {
            p.y += p.vy;
            p.life -= 0.01;
            if(p.life <= 0) sunParticles.splice(i, 1);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        ctx.globalAlpha = 1;
    }

    function drawStaticLandscape() {
        let horizonY = h * 0.82;
        ctx.fillStyle = '#080101';
        ctx.fillRect(0, horizonY, w, h - horizonY);

        mountainFacets.forEach(facet => {
            ctx.fillStyle = facet.color;
            ctx.beginPath();
            ctx.moveTo(facet.points[0].x, facet.points[0].y);
            for(let i=1; i<facet.points.length; i++) {
                ctx.lineTo(facet.points[i].x, facet.points[i].y);
            }
            ctx.closePath();
            ctx.fill();
        });

        const buildingBaseColor = '#1a0404';
        const windowColor = '#ffaa00';

        buildings.forEach(b => {
            let x = b.xRel * w;
            let y = horizonY - b.yBase * (h * 0.05);
            ctx.fillStyle = buildingBaseColor;
            ctx.fillRect(x - b.width/2, y - b.height, b.width, b.height);
            if (b.antenna) ctx.fillRect(x - 1, y - b.height - 5, 2, 5);
            b.floors.forEach(floor => {
                if (floor.lights) {
                    let alpha = 0.3 + Math.sin(time * floor.blinkSpeed + floor.phase) * 0.3;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = windowColor;
                    let winSize = 2;
                    let numWins = Math.floor((b.width - 2) / (winSize + 1));
                    for(let k=0; k<numWins; k++) {
                        ctx.fillRect(x - b.width/2 + 2 + k*(winSize+1), y - floor.yOffset, winSize, winSize);
                    }
                    ctx.globalAlpha = 1;
                }
            });
        });

        // Monumento
        let mx = w * 0.9;
        let my = horizonY;
        let ms = h * 0.00035; 
        ctx.save();
        ctx.translate(mx, my);
        ctx.scale(ms, ms);
        ctx.fillStyle = '#000';
        ctx.fillRect(-20, -120, 40, 120);
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(25, -20); ctx.lineTo(-25, -20); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-25, -20); ctx.lineTo(25, -20); ctx.lineTo(20, -40); ctx.lineTo(-20, -40); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -160, 35, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(-10, -230, 20, 70); 
        ctx.fillRect(-35, -220, 70, 12); 
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 25; ctx.shadowColor = '#ffaa00'; 
        ctx.beginPath(); ctx.arc(0, -235, 5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    function drawCube() {
        cubeRotationBase += 0.005;
        expansion += (targetExpansion - expansion) * 0.1;

        let cx = w/2;
        let cy = h/2;
        let blockSize = Math.min(w, h) * 0.055; 
        let gap = blockSize * 2.0;
        let rx = -mouseY * 0.3 + Math.sin(time * 0.01) * 0.05;
        let ry = mouseX * 0.3 + cubeRotationBase;

        let projectedCubes = cubes.map(cube => {
            let dist = gap + (expansion * (blockSize * 0.5));
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

        if (expansion < 0.2) {
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

    function animate() {
        time++;
        ctx.clearRect(0, 0, w, h);
        drawBackground();
        drawSun(); 
        drawStaticLandscape(); 
        if (isHome) {
            drawCube();
        }
        window.svAnimationId = requestAnimationFrame(animate);
    }
    animate();
})();