import { lerpColor } from './Utils.js';

export class CitySystem {
    constructor(pageType) {
        this.pageType = pageType;
        
        // --- COMÚN: MONTAÑAS ---
        this.mountainFacets = [];

        // --- HOME: CIUDAD ---
        this.buildingsBack = []; this.buildingsMid = []; this.buildings = [];
        this.monumentImg = new Image();
        if (this.pageType === 'home') {
            this.monumentImg.src = '/static/img/salvador_del_mundo.png'; 
            this.imageLoaded = false;
            this.monumentImg.onload = () => { this.imageLoaded = true; };
            this.initCityBuildings(); 
        }

        // --- ABOUT: LAGO Y PUEBLO ---
        this.villageLights = []; 
        this.hillSilhouette = []; 
        this.distantVillage = []; // Estructuras físicas de las casas lejanas
        this.foregroundHouses = []; // Casas en la tierra de abajo
        this.maquilishuatPetals = []; // Pétalos para el día
        
        if (this.pageType === 'about') {
            this.initRuralLandscape();
        }
    }

    resize(w, h) {
        this.generateLandscapeGeometry(w, h);
        if (this.pageType === 'about') {
            this.initRuralLandscape(w, h);
        } else if (this.pageType === 'home') {
             this.initCityBuildings(); 
        }
    }

    // ============================================================
    // GENERADORES
    // ============================================================

    initCityBuildings() {
        const isMobile = window.innerWidth < 768;
        const countBack = isMobile ? 12 : 40; const countMid = isMobile ? 8 : 25; const countFront = isMobile ? 5 : 12;
        this.buildingsBack = []; for(let i=0; i<countBack; i++) this.buildingsBack.push({xRel: Math.random(), width: 4+Math.random()*6, height: 8+Math.random()*20});
        this.buildingsMid = []; for(let i=0; i<countMid; i++) this.buildingsMid.push({xRel: Math.random(), width: 5+Math.random()*10, height: 15+Math.random()*30});
        this.buildings = []; for(let i=0; i<countFront; i++) { 
            let posX = Math.random()*0.6; if(Math.random()>0.5) posX+=0.4; if(posX>0.82 && posX<0.98) posX-=0.15;
            let b = {xRel: posX, yBase: Math.random()*0.05, width: 15+Math.random()*20, height: 30+Math.random()*60, floors: [], antenna: Math.random()>0.7};
            let numFloors = Math.floor(b.height/7); for(let f=0; f<numFloors; f++) b.floors.push({yOffset: f*7+5, lights: Math.random()>0.3, blinkSpeed: 0.02+Math.random()*0.05, phase: Math.random()*Math.PI});
            this.buildings.push(b);
        }
    }

    // --- ABOUT: GENERAR PAISAJE (DENSO) ---
    initRuralLandscape(w = window.innerWidth, h = window.innerHeight) {
        this.villageLights = [];
        this.distantVillage = [];
        this.hillSilhouette = [];
        this.foregroundHouses = [];
        this.maquilishuatPetals = [];

        // 1. CERROS + PUEBLO LEJANO (MUY DENSO)
        let step = 4; 
        let baseY = h * 0.55; 

        for (let x = 0; x <= w + step; x += step) {
            let y = baseY - Math.sin(x * 0.003) * 40 - Math.sin(x * 0.01) * 15 + (Math.random() * 5);
            if (x % 20 === 0) this.hillSilhouette.push({ x, y });

            if (Math.sin(x * 0.005) > -0.4) { 
                let housesInCluster = Math.floor(Math.random() * 5) + 1; 
                for(let k=0; k<housesInCluster; k++) {
                    let houseX = x + (Math.random() - 0.5) * 10;
                    let houseY = y + (Math.random() * 50) + (k * 6); 
                    
                    this.distantVillage.push({
                        x: houseX, y: houseY,
                        w: 3 + Math.random() * 4, h: 3 + Math.random() * 3,
                        roof: Math.random() > 0.5, blockColor: Math.random() > 0.5 ? '#1a1a1f' : '#15151a'
                    });

                    if (Math.random() > 0.3) {
                        this.villageLights.push({
                            x: houseX + Math.random(), y: houseY + Math.random(),
                            size: 0.8 + Math.random() * 1.2,
                            color: Math.random() > 0.7 ? '#ffcc66' : '#ffaa44',
                            blinkSpeed: 0.005 + Math.random() * 0.02, phase: Math.random() * Math.PI * 2
                        });
                    }
                }
            }
        }

        // 2. CASAS FRONTALES
        const frontY = h * 0.9; 
        const numFrontHouses = Math.floor(w / 15); 
        for(let i=0; i<numFrontHouses; i++) {
            let hasLight = Math.random() > 0.4;
            this.foregroundHouses.push({
                x: Math.random() * w, y: frontY + Math.random() * 50, 
                w: 8 + Math.random() * 10, h: 6 + Math.random() * 8, roofH: 4 + Math.random() * 4,
                color: Math.random() > 0.5 ? '#15151a' : '#1a1a20',
                hasLight: hasLight,
                lightColor: Math.random() > 0.5 ? 'rgba(255, 200, 100, ' : 'rgba(255, 180, 80, ',
                blinkSpeed: 0.01 + Math.random() * 0.04, phase: Math.random() * Math.PI * 2
            });
        }
        this.foregroundHouses.sort((a, b) => a.y - b.y);

        // 3. PÉTALOS MAQUILISHUAT
        const numPetals = 40;
        for(let i=0; i<numPetals; i++) {
            this.maquilishuatPetals.push({
                x: Math.random() * w,
                y: Math.random() * h,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: 0.5 + Math.random() * 1.5, // Caen hacia abajo
                size: 2 + Math.random() * 3,
                rotation: Math.random() * Math.PI,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                color: Math.random() > 0.5 ? '#ffb7c5' : '#ffc0cb' // Rosa pastel
            });
        }
    }

    generateSharpGeometricVolcano(startX, startY, peakStartX, peakEndX, peakY, endX, endY, w) {
        const facets = [];
        let ridges = [{x: startX, y: startY}, {x: startX+(peakStartX-startX)*0.4, y: startY-(startY-peakY)*0.3}, {x: peakStartX, y: peakY}, {x: peakEndX, y: peakY}, {x: endX-(endX-peakEndX)*0.4, y: startY-(startY-peakY)*0.4}, {x: endX, y: endY}];
        const palette = {shadowDeep: '#050508', shadowSoft: '#0a0a10', midTone: '#151520', lightWarm: '#202030', highlight: '#2a2a40'};
        facets.push({points: [{x: startX, y: startY}, ridges[1], {x: ridges[1].x-(w*0.05), y: startY}], color: palette.shadowDeep});
        facets.push({points: [ridges[1], ridges[2], {x: ridges[1].x+(w*0.08), y: startY}], color: palette.shadowSoft});
        facets.push({points: [ridges[1], {x: ridges[1].x+(w*0.08), y: startY}, {x: ridges[1].x-(w*0.05), y: startY}], color: palette.shadowDeep});
        let baseCenter = {x: (startX+endX)/2, y: startY};
        facets.push({points: [ridges[2], ridges[3], baseCenter], color: palette.midTone});
        facets.push({points: [ridges[2], baseCenter, {x: ridges[1].x+(w*0.08), y: startY}], color: palette.shadowSoft});
        facets.push({points: [ridges[3], ridges[4], baseCenter], color: palette.lightWarm});
        facets.push({points: [ridges[4], {x: endX, y: endY}, {x: baseCenter.x+(w*0.1), y: startY}], color: palette.highlight});
        facets.push({points: [ridges[4], {x: baseCenter.x+(w*0.1), y: startY}, baseCenter], color: palette.lightWarm});
        return facets;
    }

    generateLandscapeGeometry(w, h) {
        let horizonY = this.pageType === 'about' ? h * 0.70 : h * 0.82;
        this.mountainFacets = [];
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*-0.05, horizonY, w*0.1, w*0.13, horizonY-h*0.25, w*0.25, horizonY, w));
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*0.15, horizonY, w*0.42, w*0.48, horizonY-h*0.45, w*0.75, horizonY, w));
        this.mountainFacets.push(...this.generateSharpGeometricVolcano(w*0.65, horizonY, w*0.72, w*0.75, horizonY-h*0.2, w*0.85, horizonY, w));
    }

    // ============================================================
    // RENDERIZADO (DRAW LOOP)
    // ============================================================

    render(ctx, w, h, time, scrollPercent, menuLight) {
        // Dibujamos las montañas primero (Fondo)
        this.drawBackgroundMountains(ctx, w, h, scrollPercent);

        if (this.pageType === 'home') {
            this.drawUrbanScene(ctx, w, h, time, scrollPercent, menuLight);
        } else if (this.pageType === 'about') {
            this.drawRuralScene(ctx, w, h, time, scrollPercent);
        } else {
            let horizonY = h * 0.82; ctx.fillStyle = '#080101'; ctx.fillRect(0, horizonY - 2, w, h - horizonY + 2);
        }
    }

    drawBackgroundMountains(ctx, w, h, scrollPercent) {
        let parallaxY = 0; 
        ctx.save(); 
        ctx.translate(0, parallaxY); 
        
        // --- ARREGLO IMPORTANTE: Asegurar que NO haya brillo en las montañas ---
        ctx.shadowBlur = 0; 
        ctx.shadowColor = 'transparent';
        
        ctx.lineJoin = 'round'; ctx.lineWidth = 1; 
        this.mountainFacets.forEach(facet => {
            ctx.fillStyle = facet.color; ctx.strokeStyle = facet.color; 
            ctx.beginPath(); ctx.moveTo(facet.points[0].x, facet.points[0].y);
            for(let i=1; i<facet.points.length; i++) ctx.lineTo(facet.points[i].x, facet.points[i].y);
            ctx.closePath(); ctx.fill(); ctx.stroke(); 
        });
        ctx.restore();
    }

    drawUrbanScene(ctx, w, h, time, scrollPercent, menuLight) {
        let horizonY = h * 0.82; const nightFactor = Math.max(0, 1 - (scrollPercent * 2.5));
        
        // Edificios Fondo
        ctx.fillStyle = lerpColor('#050505', '#151515', scrollPercent); 
        this.buildingsBack.forEach(b => { ctx.fillRect(b.xRel*w-b.width/2, horizonY-2-b.height, b.width, b.height); });
        
        // Edificios Medios
        ctx.fillStyle = lerpColor('#0a0a0a', '#202025', scrollPercent); 
        this.buildingsMid.forEach(b => { ctx.fillRect(b.xRel*w-b.width/2, horizonY-b.height, b.width, b.height); });
        
        // Suelo
        ctx.fillStyle = '#080101'; ctx.fillRect(0, horizonY-2, w, h-horizonY+2); 
        // Calle Neon
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = 'cyan'; // Brillo solo para la calle
        ctx.fillStyle = lerpColor('#111', '#333', scrollPercent); ctx.fillRect(0, horizonY, w, 4);
        ctx.restore();

        const buildingFill = lerpColor('#1a0404', '#2b2b35', scrollPercent);
        this.buildings.forEach(b => {
            let x = b.xRel*w; let y = horizonY+5; ctx.fillStyle = buildingFill; ctx.fillRect(x-b.width/2, y-b.height, b.width, b.height);
            if(b.antenna){ctx.fillStyle='#151515';ctx.fillRect(x-1, y-b.height-10, 2, 10);}
            
            // Ventanas con brillo
            if(nightFactor>0.01){ 
                ctx.save();
                ctx.shadowBlur = 5; ctx.shadowColor = '#ffaa00'; // Brillo ventanas
                b.floors.forEach(floor=>{ 
                    if(floor.lights){ 
                        let blink=0.3+Math.sin(time*floor.blinkSpeed+floor.phase)*0.3; 
                        ctx.globalAlpha=blink*nightFactor; 
                        ctx.fillStyle='#ffaa00'; 
                        ctx.fillRect(x-b.width/2+2, y-floor.yOffset, 2, 2); 
                    }
                }); 
                ctx.restore();
                ctx.globalAlpha=1; 
            }
        });
        
        if(this.imageLoaded){ let mx=w*0.9; let my=horizonY; let targetHeight=h*0.10; let targetWidth=targetHeight*(this.monumentImg.width/this.monumentImg.height); ctx.save(); ctx.filter=`brightness(${Math.max(0, 1-nightFactor)})`; ctx.drawImage(this.monumentImg, mx-targetWidth/2, my-targetHeight, targetWidth, targetHeight); ctx.restore(); }
    }

    // --- ESCENARIO ABOUT ---
    drawRuralScene(ctx, w, h, time, scrollPercent) {
        const waterLineY = h * 0.65; 
        let dayFactor = Math.max(0, Math.min(1, (scrollPercent - 0.1) * 3)); 

        // 1. CERROS MEDIOS
        ctx.fillStyle = lerpColor('#030508', '#0e1218', dayFactor); 
        ctx.beginPath();
        ctx.moveTo(0, h); 
        this.hillSilhouette.forEach((p, i) => {
            if(i===0) ctx.lineTo(0, p.y);
            ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(w, h); 
        ctx.fill();

        // 2. PUEBLO DISTANTE
        
        // A. CASITAS (APARECEN DE DÍA)
        if (dayFactor > 0.0) {
            ctx.globalAlpha = dayFactor * 0.8; 
            this.distantVillage.forEach(house => {
                let ly = house.y;
                if (ly > -10 && ly < waterLineY && ly < h) {
                    ctx.fillStyle = house.blockColor;
                    ctx.fillRect(house.x, ly, house.w, house.h);
                    if (house.roof) {
                        ctx.beginPath();
                        ctx.moveTo(house.x, ly);
                        ctx.lineTo(house.x + house.w/2, ly - 2);
                        ctx.lineTo(house.x + house.w, ly);
                        ctx.fill();
                    }
                }
            });
            ctx.globalAlpha = 1.0;
        }

        // B. LUCES (SE APAGAN DE DÍA)
        if (dayFactor < 1.0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; 
            this.villageLights.forEach(light => {
                let ly = light.y;
                if (ly > -10 && ly < waterLineY && ly < h) {
                    let blink = 0.7 + Math.sin(time * light.blinkSpeed + light.phase) * 0.3;
                    ctx.globalAlpha = blink * (1 - dayFactor); 
                    ctx.fillStyle = light.color;
                    ctx.beginPath();
                    ctx.arc(light.x, ly, light.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            ctx.restore(); 
        }

        // 3. EL LAGO
        const lakeHeight = h - waterLineY;
        if (lakeHeight > 0) {
            const lakeGradient = ctx.createLinearGradient(0, waterLineY, 0, h);
            let topColor = lerpColor('#050a14', '#0a1020', dayFactor);
            let midColor = lerpColor('#0f1928', '#152035', dayFactor);
            lakeGradient.addColorStop(0, topColor);  
            lakeGradient.addColorStop(0.5, midColor); 
            lakeGradient.addColorStop(1, 'rgba(10, 15, 30, 1)');     
            ctx.fillStyle = lakeGradient;
            ctx.fillRect(0, waterLineY, w, lakeHeight);
        }

        // 4. REFLEJOS
        if (lakeHeight > 10 && dayFactor < 0.8) {
            ctx.save();
            ctx.beginPath(); ctx.rect(0, waterLineY, w, lakeHeight); ctx.clip();
            ctx.translate(0, waterLineY * 2); ctx.scale(1, -1.2); 
            ctx.globalAlpha = 0.3 * (1 - dayFactor); 
            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < this.villageLights.length; i += 3) {
                 let light = this.villageLights[i];
                 let relativeY = waterLineY - light.y; 
                 if (relativeY > 0 && relativeY < h * 0.35) {
                    ctx.fillStyle = light.color; 
                    ctx.beginPath();
                    ctx.ellipse(light.x, waterLineY + relativeY, light.size * 2, light.size * 6, 0, 0, Math.PI*2);
                    ctx.fill();
                 }
            }
            ctx.restore();
        }

        // 5. TIERRA PLANA FRONTAL
        const groundY = h * 0.85; 
        ctx.fillStyle = '#010101'; 
        ctx.beginPath();
        ctx.moveTo(0, h); ctx.lineTo(0, groundY);
        for(let x=0; x<=w; x+=100) { ctx.lineTo(x, groundY + Math.sin(x*0.02)*10 + 5); }
        ctx.lineTo(w, h);
        ctx.fill();

        // 6. CASAS FRONTALES
        this.foregroundHouses.forEach(house => {
            let hy = house.y; 
            if (hy > groundY - 20) { 
                ctx.fillStyle = house.color;
                ctx.fillRect(house.x, hy, house.w, house.h);
                ctx.beginPath();
                ctx.moveTo(house.x - 2, hy);
                ctx.lineTo(house.x + house.w/2, hy - house.roofH);
                ctx.lineTo(house.x + house.w + 2, hy);
                ctx.fill();

                if (house.hasLight) {
                    let blink = 0.6 + Math.sin(time * house.blinkSpeed + house.phase) * 0.4;
                    let alpha = blink * (1 - dayFactor);
                    if (alpha > 0.01) {
                        ctx.fillStyle = house.lightColor + alpha + ')'; 
                        ctx.fillRect(house.x + 2, hy + 2, 3, 3);
                    }
                }
            }
        });

        // 7. PÉTALOS DE MAQUILISHUAT (SOLO DE DÍA)
        if (dayFactor > 0.1) {
            ctx.save();
            ctx.globalAlpha = dayFactor * 0.9; // Aparecen suavemente
            
            this.maquilishuatPetals.forEach(petal => {
                // Actualizar posición
                petal.y += petal.speedY;
                petal.x += Math.sin(time * 0.01 + petal.y * 0.01) * 0.5 + petal.speedX * 0.1;
                petal.rotation += petal.rotationSpeed;

                // Reset si sale de pantalla
                if (petal.y > h) { petal.y = -10; petal.x = Math.random() * w; }
                if (petal.x > w) petal.x = 0;
                if (petal.x < 0) petal.x = w;

                // Dibujar pétalo (óvalo rotado)
                ctx.translate(petal.x, petal.y);
                ctx.rotate(petal.rotation);
                
                ctx.fillStyle = petal.color;
                ctx.beginPath();
                // Forma de pétalo simple
                ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.rotate(-petal.rotation); // Restaurar rotación
                ctx.translate(-petal.x, -petal.y); // Restaurar posición
            });
            ctx.restore();
        }
    }
}