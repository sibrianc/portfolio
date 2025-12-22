import { lerpColor } from './Utils.js';

export class CitySystem {
    constructor() {
        this.mountainFacets = [];
        this.buildingsBack = []; // Fondo
        this.buildingsMid = [];  // Medio
        this.buildings = [];     // Frente
        
        // --- CARGA DE LA IMAGEN ---
        this.monumentImg = new Image();
        this.monumentImg.src = '/static/img/salvador_del_mundo.png'; 
        this.imageLoaded = false;
        this.monumentImg.onload = () => { this.imageLoaded = true; };

        this.initWorld();
    }

    initWorld() {
        // DETECCIÓN DE MÓVIL
        const isMobile = window.innerWidth < 768;

        // CONFIGURACIÓN DE CANTIDAD DE EDIFICIOS
        const countBack = isMobile ? 12 : 40;  
        const countMid = isMobile ? 8 : 25;    
        const countFront = isMobile ? 5 : 12;  

        // 1. FONDO LEJANO
        this.buildingsBack = [];
        for(let i=0; i<countBack; i++) {
            this.buildingsBack.push({
                xRel: Math.random(),
                width: 4 + Math.random() * 6, 
                height: 8 + Math.random() * 20,
            });
        }

        // 2. CAPA MEDIA
        this.buildingsMid = [];
        for(let i=0; i<countMid; i++) {
            this.buildingsMid.push({
                xRel: Math.random(),
                width: 5 + Math.random() * 10, 
                height: 15 + Math.random() * 30,
            });
        }

        // 3. PRIMER PLANO
        this.buildings = [];
        for(let i=0; i<countFront; i++) { 
            let posX = Math.random() * 0.6; 
            if (Math.random() > 0.5) posX += 0.4; // Hueco al centro
            
            // Evitar tapar el monumento
            if (posX > 0.82 && posX < 0.98) posX -= 0.15;

            let b = {
                xRel: posX, 
                yBase: Math.random() * 0.05, 
                width: 15 + Math.random() * 20, 
                height: 30 + Math.random() * 60, 
                floors: [], 
                antenna: Math.random() > 0.7
            };
            
            let numFloors = Math.floor(b.height / 7);
            for(let f=0; f<numFloors; f++) {
                b.floors.push({
                    yOffset: f * 7 + 5, 
                    lights: Math.random() > 0.3, 
                    blinkSpeed: 0.02 + Math.random() * 0.05, 
                    phase: Math.random() * Math.PI
                });
            }
            this.buildings.push(b);
        }
    }

    resize(w, h) {
        this.generateLandscapeGeometry(w, h);
    }

    // --- VOLCANES ORIGINALES ---
    generateSharpGeometricVolcano(startX, startY, peakStartX, peakEndX, peakY, endX, endY, w) {
        const facets = [];
        let ridges = [
            {x: startX, y: startY}, 
            {x: startX + (peakStartX - startX) * 0.4, y: startY - (startY - peakY) * 0.3}, 
            {x: peakStartX, y: peakY}, 
            {x: peakEndX, y: peakY}, 
            {x: endX - (endX - peakEndX) * 0.4, y: startY - (startY - peakY) * 0.4}, 
            {x: endX, y: endY}
        ];
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

    generateLandscapeGeometry(w, h) {
        let horizonY = h * 0.82;
        this.mountainFacets = [];
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*-0.05, horizonY, w*0.1, w*0.13, horizonY - h*0.2, w*0.25, horizonY, w));
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*0.15, horizonY, w*0.42, w*0.48, horizonY - h*0.4, w*0.75, horizonY, w));
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*0.65, horizonY, w*0.72, w*0.75, horizonY - h*0.15, w*0.85, horizonY, w));
    }

    render(ctx, w, h, time, scrollPercent) {
        let horizonY = h * 0.82;
        
        const nightFactor = Math.max(0, 1 - (scrollPercent * 2.5));
        
        // --- 1. MONTAÑAS (FONDO) ---
        // AQUI ESTA EL CAMBIO: "Guardamos" el brillo, lo apagamos para las montañas, y luego lo restauramos.
        ctx.save(); 
        ctx.shadowBlur = 0; // Apagar brillo
        ctx.shadowColor = 'transparent';
        
        ctx.lineJoin = 'round';
        ctx.lineWidth = 1; 

        this.mountainFacets.forEach(facet => {
            ctx.fillStyle = facet.color;
            ctx.strokeStyle = facet.color; 
            
            ctx.beginPath();
            ctx.moveTo(facet.points[0].x, facet.points[0].y);
            for(let i=1; i<facet.points.length; i++) {
                ctx.lineTo(facet.points[i].x, facet.points[i].y);
            }
            ctx.closePath();
            ctx.fill();   
            ctx.stroke(); 
        });
        
        ctx.restore(); // RESTAURAR EL BRILLO (Para que afecte a lo que sigue)

        // --- 2. EDIFICIOS FONDO (Siluetas) ---
        ctx.fillStyle = lerpColor('#050505', '#151515', scrollPercent);
        this.buildingsBack.forEach(b => {
            let x = b.xRel * w;
            let y = horizonY - 2; 
            ctx.fillRect(x - b.width/2, y - b.height, b.width, b.height);
        });

        // --- 3. EDIFICIOS MEDIOS ---
        ctx.fillStyle = lerpColor('#0a0a0a', '#202025', scrollPercent);
        this.buildingsMid.forEach(b => {
            let x = b.xRel * w;
            let y = horizonY; 
            ctx.fillRect(x - b.width/2, y - b.height, b.width, b.height);
        });

        // --- 4. SUELO Y CALLE ---
        ctx.fillStyle = '#080101';
        ctx.fillRect(0, horizonY - 2, w, h - horizonY + 2);
        
        // Línea de calle
        ctx.fillStyle = lerpColor('#111', '#333', scrollPercent);
        ctx.fillRect(0, horizonY, w, 4);

        // --- 5. EDIFICIOS FRENTE (SOMBREADOS DE DÍA) ---
        const buildingFill = lerpColor('#1a0404', '#2b2b35', scrollPercent);
        
        this.buildings.forEach(b => {
            let x = b.xRel * w;
            let y = horizonY + 5; 
            
            ctx.fillStyle = buildingFill;
            ctx.fillRect(x - b.width/2, y - b.height, b.width, b.height);
            
            // Antenas
            if (b.antenna) {
                ctx.fillStyle = '#151515';
                ctx.fillRect(x - 1, y - b.height - 10, 2, 10);
            }

            // Ventanas
            if (nightFactor > 0.01) {
                b.floors.forEach(floor => {
                    if (floor.lights) {
                        let blink = 0.3 + Math.sin(time * floor.blinkSpeed + floor.phase) * 0.3;
                        ctx.globalAlpha = blink * nightFactor; 
                        ctx.fillStyle = '#ffaa00'; 
                        let winSize = 2;
                        let numWins = Math.floor((b.width - 2) / (winSize + 1));
                        for(let k=0; k<numWins; k++) {
                            ctx.fillRect(x - b.width/2 + 2 + k*(winSize+1), y - floor.yOffset, winSize, winSize);
                        }
                    }
                });
                ctx.globalAlpha = 1; 
            } else {
                // De día: Ventanas casi negras
                ctx.fillStyle = lerpColor('#0f0f0f', '#1a1a20', scrollPercent);
                b.floors.forEach(floor => {
                    let winSize = 2;
                    let numWins = Math.floor((b.width - 2) / (winSize + 1));
                    for(let k=0; k<numWins; k++) {
                        ctx.fillRect(x - b.width/2 + 2 + k*(winSize+1), y - floor.yOffset, winSize, winSize);
                    }
                });
            }
        });

        // --- 6. MONUMENTO ---
        if (this.imageLoaded) {
            let mx = w * 0.9; 
            let my = horizonY;
            
            // TAMAÑO: Pequeño (10%)
            let targetHeight = h * 0.10; 
            let aspectRatio = this.monumentImg.width / this.monumentImg.height;
            let targetWidth = targetHeight * aspectRatio;

            let drawX = mx - targetWidth / 2;
            let drawY = my - targetHeight; 

            ctx.save();
            
            // Halo Celeste Neón [ELIMINADO]
            
            // Imagen con filtro de brillo (Silueta)
            let brightness = Math.max(0, 1 - nightFactor); 
            ctx.filter = `brightness(${brightness})`;
            
            ctx.drawImage(this.monumentImg, drawX, drawY, targetWidth, targetHeight);
            
            ctx.filter = 'none';
            ctx.restore();
            
        } else {
            // Fallback
            ctx.fillStyle = '#333';
            ctx.fillRect(w * 0.9 - 5, horizonY - 50, 10, 50);
        }
    }
}