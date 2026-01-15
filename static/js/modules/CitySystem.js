/* ==========================================================================
   CITY & LANDSCAPE SYSTEM (FINAL: FADING GROUND NEON - NO CODE CHANGES)
   ========================================================================== */
import { lerpColor } from './Utils.js';

export class CitySystem {
    constructor(pageType) {
        this.pageType = pageType;
        this.assetsLoaded = false; 

        // --- 1. DEFINICIÓN DE RUTAS ---
        this.assetPaths = {
            pyramids: [
                '/static/img/maya-pyramid.png',  
                '/static/img/maya-pyramid2.png' 
            ],
            huts: [
                '/static/img/mayan_house.png', 
                '/static/img/mayan_house2.png'
            ],
            monument: '/static/img/salvador_del_mundo.png'
        };

        this.loadedImages = {
            pyramids: [],
            huts: [],
            monument: null
        };

        // Buffers para optimización
        this.cachedLayers = {
            mayanBack: null,
            mayanFront: null
        };

        // --- INICIALIZACIÓN ---
        this.mountainFacets = [];
        this.initGenericStructures(); 

        // --- CARGA DE IMÁGENES ---
        this.loadAllAssets();
    }

    initGenericStructures() {
        this.buildingsBack = []; this.buildingsMid = []; this.buildings = [];
        this.villageLights = []; this.hillSilhouette = []; this.distantVillage = [];
        this.foregroundHouses = []; this.maquilishuatPetals = [];
        this.mayanGlyphs = [];
    }

    async loadAllAssets() {
        const promises = [];
        this.assetPaths.pyramids.forEach(src => promises.push(this.loadImage(src).then(img => this.loadedImages.pyramids.push(img)).catch(e => console.warn("Falta:", src))));
        this.assetPaths.huts.forEach(src => promises.push(this.loadImage(src).then(img => this.loadedImages.huts.push(img)).catch(e => console.warn("Falta:", src))));
        if (this.pageType === 'home') promises.push(this.loadImage(this.assetPaths.monument).then(img => this.loadedImages.monument = img).catch(e => console.warn("Falta monumento")));

        await Promise.allSettled(promises);
        this.assetsLoaded = true;
        this.refreshScene();
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(src); 
            img.src = src;
        });
    }

    refreshScene() {
        if (this.pageType === 'home') this.initCityBuildings();
        if (this.pageType === 'about') this.initRuralLandscape(window.innerWidth, window.innerHeight);
        if (this.pageType === 'contact') this.initMayanMetropolis(window.innerWidth, window.innerHeight);
    }

    resize(w, h) {
        this.generateLandscapeGeometry(w, h);
        this.refreshScene();
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

    // --- CONTACT: GENERADOR MAYA (TAMAÑOS CORREGIDOS) ---
    initMayanMetropolis(w = window.innerWidth, h = window.innerHeight) {
        this.mayanGlyphs = [];
        const horizonY = h * 0.82; 
        const useImages = this.loadedImages.pyramids.length > 0;

        // 1. CAPA DE FONDO (INTACTA)
        const backCanvas = document.createElement('canvas');
        backCanvas.width = w;
        backCanvas.height = h;
        const bCtx = backCanvas.getContext('2d');

        const numBack = Math.floor(w / 5); 
        for(let i=0; i<numBack; i++) {
            let width = 15 + Math.random() * 25; 
            let x = Math.random() * w;
            let y = horizonY + 10; 
            let height;
            bCtx.save();
            bCtx.globalAlpha = 0.5 + Math.random() * 0.3; 
            if (useImages) {
                let imgRef = this.loadedImages.pyramids[Math.floor(Math.random() * this.loadedImages.pyramids.length)];
                let ratio = imgRef.height / imgRef.width;
                height = width * ratio;
                bCtx.filter = 'brightness(0%)'; 
                bCtx.drawImage(imgRef, x - width/2, y - height, width, height);
            } else {
                height = width * 1.5;
                bCtx.fillStyle = '#080808';
                bCtx.fillRect(x - width/2, y - height, width, height);
            }
            bCtx.restore();
        }
        this.cachedLayers.mayanBack = backCanvas;

        // 2. CAPA PRINCIPAL (FRONTAL)
        const frontCanvas = document.createElement('canvas');
        frontCanvas.width = w;
        frontCanvas.height = h;
        const fCtx = frontCanvas.getContext('2d');

        const numPyramids = 18; // Cantidad

        for (let i = 0; i < numPyramids; i++) {
            // --- LÓGICA DE TAMAÑO SOLICITADA ---
            // Base pequeña (35px - 40px)
            let width = 35 + Math.random() * 5; 
            
            // 30% de probabilidad de ser 15% más grande
            if (Math.random() > 0.7) {
                width = width * 1.15;
            }

            let posY = horizonY + 5; 
            // Distribución uniforme + aleatoriedad local
            let posX = (i / numPyramids) * w + (Math.random() * 40 - 20);
            let height;

            if (useImages) {
                let imgRef = this.loadedImages.pyramids[Math.floor(Math.random() * this.loadedImages.pyramids.length)];
                let ratio = imgRef.height / imgRef.width;
                height = width * ratio;
                
                // Dibujamos en el buffer (ESTO GARANTIZA QUE SE VEAN)
                fCtx.drawImage(imgRef, posX - width/2, posY - height, width, height);

            } else {
                 height = width * 1.2;
                 fCtx.fillStyle = '#0a0a0e';
                 fCtx.fillRect(posX - width/2, posY - height, width, height);
            }
        }
        this.cachedLayers.mayanFront = frontCanvas;

        // 3. Glifos
        for(let i=0; i<30; i++) {
            this.mayanGlyphs.push({
                x: Math.random() * w,
                y: h * 0.6 + Math.random() * (h * 0.3),
                size: 1 + Math.random() * 2,
                speedY: 0.1 + Math.random() * 0.3,
                opacity: Math.random() * 0.5,
                blinkSpeed: 0.01 + Math.random() * 0.04
            });
        }
    }

    // --- ABOUT: GENERADOR RURAL ---
    initRuralLandscape(w = window.innerWidth, h = window.innerHeight) {
        this.villageLights = [];
        this.distantVillage = [];
        this.hillSilhouette = [];
        this.foregroundHouses = [];
        this.maquilishuatPetals = [];

        const useImages = this.loadedImages.huts.length > 0;

        let step = 4; let baseY = h * 0.55; 
        for (let x = 0; x <= w + step; x += step) {
            let y = baseY - Math.sin(x * 0.003) * 40 - Math.sin(x * 0.01) * 15 + (Math.random() * 5);
            if (x % 20 === 0) this.hillSilhouette.push({ x, y });
            
            if (Math.sin(x * 0.005) > -0.4) { 
                let housesInCluster = Math.floor(Math.random() * 3) + 1; 
                for(let k=0; k<housesInCluster; k++) {
                    let houseX = x + (Math.random() - 0.5) * 20;
                    let houseY = y + (Math.random() * 30) + (k * 5); 
                    let width = 8 + Math.random() * 6;
                    let height = width * 0.8;
                    let imgRef = null;
                    let type = 'rect';

                    if (useImages) {
                        imgRef = this.loadedImages.huts[Math.floor(Math.random() * this.loadedImages.huts.length)];
                        let ratio = imgRef.height / imgRef.width;
                        height = width * ratio;
                        type = 'image';
                    }

                    this.distantVillage.push({
                        x: houseX, y: houseY, w: width, h: height, img: imgRef,
                        type: type, blockColor: Math.random() > 0.5 ? '#1a1a1f' : '#15151a'
                    });

                    if (Math.random() > 0.5) this.villageLights.push({x: houseX, y: houseY + height*0.5, size: 0.8 + Math.random() * 1.2, color: Math.random() > 0.7 ? '#ffcc66' : '#ffaa44', blinkSpeed: 0.005 + Math.random() * 0.02, phase: Math.random() * Math.PI * 2});
                }
            }
        }
        
        const frontY = h * 0.9; const numFrontHouses = Math.floor(w / 30); 
        for(let i=0; i<numFrontHouses; i++) {
            let hy = frontY + Math.random() * 30;
            let width = 20 + Math.random() * 15;
            let height = width * 0.8;
            let imgRef = null;
            let type = 'rect';
            let fallbackColor = Math.random() > 0.5 ? '#1a1a20' : '#22222a'; 

            if (useImages) {
                imgRef = this.loadedImages.huts[Math.floor(Math.random() * this.loadedImages.huts.length)];
                let ratio = imgRef.height / imgRef.width;
                height = width * ratio;
                type = 'image';
            }

            this.foregroundHouses.push({
                x: Math.random() * w, y: hy, w: width, h: height, img: imgRef,
                type: type, color: fallbackColor
            });
        }
        this.foregroundHouses.sort((a, b) => a.y - b.y);

        const numPetals = 40; for(let i=0; i<numPetals; i++) this.maquilishuatPetals.push({x: Math.random() * w, y: Math.random() * h, speedX: (Math.random() - 0.5) * 1.5, speedY: 0.5 + Math.random() * 1.5, size: 2 + Math.random() * 3, rotation: Math.random() * Math.PI, rotationSpeed: (Math.random() - 0.5) * 0.1, color: Math.random() > 0.5 ? '#ffb7c5' : '#ffc0cb'});
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
        this.drawBackgroundMountains(ctx, w, h, scrollPercent);

        if (this.pageType === 'home') {
            this.drawUrbanScene(ctx, w, h, time, scrollPercent, menuLight);
        } else if (this.pageType === 'about') {
            this.drawRuralScene(ctx, w, h, time, scrollPercent);
        } else if (this.pageType === 'contact') {
            this.drawMayanMetropolis(ctx, w, h, time, scrollPercent);
        } else {
            let horizonY = h * 0.82; ctx.fillStyle = '#080101'; ctx.fillRect(0, horizonY - 2, w, h - horizonY + 2);
        }
    }

    drawBackgroundMountains(ctx, w, h, scrollPercent) {
        let parallaxY = 0; 
        ctx.save(); ctx.translate(0, parallaxY); 
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
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
        let horizonY = h * 0.82;
        const nightFactor = Math.max(0, 1 - (scrollPercent * 2.5));

        // --- CAMBIO CLAVE ---
        // Ya no usamos un color fijo. Usamos 'menuLight', que es el color
        // dinámico que viene del estado del menú (click/no click).
        // const neonColor = '#00aaff'; <--- LÍNEA ELIMINADA

        // 1. EDIFICIOS TRASEROS
        ctx.fillStyle = lerpColor('#050505', '#151515', scrollPercent); 
        this.buildingsBack.forEach(b => { ctx.fillRect(b.xRel*w-b.width/2, horizonY-2-b.height, b.width, b.height); });
        
        ctx.fillStyle = lerpColor('#0a0a0a', '#202025', scrollPercent); 
        this.buildingsMid.forEach(b => { ctx.fillRect(b.xRel*w-b.width/2, horizonY-b.height, b.width, b.height); });
        
        ctx.fillStyle = '#080101'; ctx.fillRect(0, horizonY-2, w, h-horizonY+2); 
        
        // 2. SUELO (Reactivo al Menú)
        if (nightFactor > 0.01) {
            ctx.save();
            ctx.globalAlpha = nightFactor; 
            ctx.shadowBlur = 10 * nightFactor; 
            // USAMOS menuLight AQUÍ
            ctx.shadowColor = menuLight; 
            ctx.fillStyle = lerpColor('#111', '#333', scrollPercent); 
            ctx.fillRect(0, horizonY, w, 4); 
            ctx.restore();
        } else {
            ctx.fillStyle = lerpColor('#111', '#333', scrollPercent); 
            ctx.fillRect(0, horizonY, w, 4);
        }
        
        const buildingFill = lerpColor('#1a0404', '#2b2b35', scrollPercent);
        this.buildings.forEach(b => {
            let x = b.xRel*w; let y = horizonY+5; 
            
            // BORDE NEON EDIFICIOS (Reactivo al Menú)
            ctx.shadowBlur = 10 * nightFactor; 
            // USAMOS menuLight AQUÍ
            ctx.shadowColor = menuLight; 

            // Cuerpo Sólido
            ctx.fillStyle = buildingFill; 
            ctx.fillRect(x-b.width/2, y-b.height, b.width, b.height);
            
            ctx.shadowBlur = 0; 
            if(b.antenna){ctx.fillStyle='#151515';ctx.fillRect(x-1, y-b.height-10, 2, 10);}
            
            // 3. VENTANAS (LÓGICA BINARIA LENTA - Intacta)
            if(nightFactor > 0.01){ 
                ctx.save(); 
                
                let startX = x - b.width/2 + 4;
                let endX = x + b.width/2 - 4;
                
                b.floors.forEach(floor => { 
                    for (let wx = startX; wx < endX; wx += 8) { 
                        
                        // FÓRMULA ANTI-PATRONES
                        let randomSeed = Math.sin((wx * 12.9898) + (floor.yOffset * 78.233)) * 43758.5453;
                        
                        // Velocidad lenta (0.0015)
                        let cycle = Math.sin(time * 0.0015 + randomSeed);

                        let val = (cycle + 1) / 2;
                        let color, alpha, blur;

                        // LÓGICA BINARIA (ON / OFF)
                        if (val > 0.7) {
                            color = '#ffaa00';
                            alpha = 0.95;
                            blur = 8; 
                        } else {
                            color = '#222';
                            alpha = 0.5;
                            blur = 0; 
                        }

                        ctx.shadowBlur = blur * nightFactor;
                        ctx.shadowColor = color;
                        ctx.globalAlpha = alpha * nightFactor; 
                        ctx.fillStyle = color; 
                        
                        ctx.fillRect(wx, y - floor.yOffset - 1, 3, 5); 
                    } 
                }); 
                ctx.restore(); 
                ctx.globalAlpha = 1; 
            }
        });

        // 4. MONUMENTO (Reactivo al Menú)
        if(this.loadedImages.monument){ 
            let mx=w*0.9; let my=horizonY; 
            let targetHeight=h*0.10; 
            let targetWidth=targetHeight*(this.loadedImages.monument.width/this.loadedImages.monument.height); 
            
            ctx.save(); 
            ctx.filter=`brightness(${Math.max(0, 1-nightFactor)})`; 
            
            // Agregamos el glow reactivo
            if (nightFactor > 0.01) {
                ctx.shadowBlur = 10 * nightFactor;
                // USAMOS menuLight AQUÍ
                ctx.shadowColor = menuLight; 
            }

            ctx.drawImage(this.loadedImages.monument, mx-targetWidth/2, my-targetHeight, targetWidth, targetHeight); 
            ctx.restore(); 
        }
    }

    drawRuralScene(ctx, w, h, time, scrollPercent) {
        const waterLineY = h * 0.65; 
        
        // Calculamos factores de Día y Noche
        let dayFactor = Math.max(0, Math.min(1, (scrollPercent - 0.1) * 3)); 
        let nightFactor = 1 - dayFactor;

        // 1. SILUETA DE MONTAÑAS
        ctx.fillStyle = lerpColor('#030508', '#0e1218', dayFactor); 
        ctx.beginPath(); ctx.moveTo(0, h); 
        this.hillSilhouette.forEach((p, i) => { if(i===0) ctx.lineTo(0, p.y); ctx.lineTo(p.x, p.y); }); 
        ctx.lineTo(w, h); ctx.fill();
        
        // 2. CASAS DEL FONDO (Aparecen de día)
        if (dayFactor > 0.01) { 
            ctx.globalAlpha = dayFactor * 0.8; 
            this.distantVillage.forEach(house => { 
                if (house.y > -10 && house.y < waterLineY && house.y < h) {
                    if (house.type === 'image' && house.img) {
                        ctx.drawImage(house.img, house.x, house.y, house.w, house.h);
                    } else {
                        ctx.fillStyle = house.blockColor; 
                        ctx.fillRect(house.x, house.y, house.w, house.h); 
                    }
                }
            }); 
            ctx.globalAlpha = 1.0; 
        }

        // 3. LUCES DEL FONDO (Bolitas de luz nocturnas)
        if (nightFactor > 0.01) { 
            ctx.save(); 
            ctx.globalCompositeOperation = 'lighter'; 
            this.villageLights.forEach(light => { 
                let ly = light.y; 
                if (ly > -10 && ly < waterLineY && ly < h) { 
                    // Mantenemos el parpadeo leve del fondo si te gusta, 
                    // o puedes poner 'let blink = 1.0' si quieres todo estático.
                    let blink = 0.7 + Math.sin(time * light.blinkSpeed + light.phase) * 0.3; 
                    
                    ctx.globalAlpha = blink * nightFactor; 
                    ctx.fillStyle = light.color; 
                    ctx.beginPath(); 
                    ctx.arc(light.x, ly, light.size, 0, Math.PI * 2); 
                    ctx.fill(); 
                }
            }); 
            ctx.restore(); 
        }
        
        // 4. LAGO Y REFLEJOS
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

        if (lakeHeight > 10 && nightFactor > 0.01) { 
            ctx.save(); 
            ctx.beginPath(); ctx.rect(0, waterLineY, w, lakeHeight); ctx.clip(); 
            ctx.translate(0, waterLineY * 2); ctx.scale(1, -1.2); 
            
            ctx.globalAlpha = 0.3 * nightFactor; 
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
        
        // 5. SUELO PRIMER PLANO
        const groundY = h * 0.85; 
        ctx.fillStyle = '#010101'; 
        ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, groundY); 
        for(let x=0; x<=w; x+=100) { ctx.lineTo(x, groundY + Math.sin(x*0.02)*10 + 5); } 
        ctx.lineTo(w, groundY + Math.sin(w*0.02)*10 + 5);
        
        ctx.lineTo(w, h); // Bajar a la esquina inferior derecha
        ctx.fill();
        
        // 6. CASAS DEL FRENTE (ESTÁTICAS DE NOCHE)
        this.foregroundHouses.forEach((house, index) => { 
            if (house.y > groundY - 20) { 
                
                // A) MODO DÍA: Estructura
                if (dayFactor > 0.01) {
                    ctx.save();
                    ctx.globalAlpha = dayFactor; 
                    if (house.type === 'image' && house.img) {
                        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
                        ctx.drawImage(house.img, house.x, house.y - house.h, house.w, house.h);
                    } else {
                        ctx.fillStyle = house.color; 
                        ctx.fillRect(house.x, house.y, house.w, house.h); 
                    }
                    ctx.restore();
                }

                // B) MODO NOCHE: Bolita de Luz ESTÁTICA
                if (nightFactor > 0.01) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    
                    // --- CAMBIO AQUÍ: Eliminamos el Math.sin (Parpadeo) ---
                    // Ahora la intensidad es fija (1.0), solo afectada por el scroll.
                    let intensity = 1.0; 
                    
                    ctx.globalAlpha = intensity * nightFactor; // Se apaga suavemente al bajar
                    
                    ctx.fillStyle = '#ffcc66'; 
                    ctx.shadowBlur = 15 * nightFactor;
                    ctx.shadowColor = '#ffaa00';

                    let lightX = house.x + house.w / 2;
                    let lightY = house.y - house.h / 3; 
                    let lightSize = 3; // Tamaño fijo o random sutil (ej: house.w * 0.1)

                    ctx.beginPath();
                    ctx.arc(lightX, lightY, lightSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.restore();
                }
            } 
        });

        // 7. PÉTALOS (Día)
        if (dayFactor > 0.1) { 
            ctx.save(); 
            ctx.globalAlpha = dayFactor * 0.9; 
            this.maquilishuatPetals.forEach(petal => { 
                petal.y += petal.speedY; 
                petal.x += Math.sin(time * 0.01 + petal.y * 0.01) * 0.5 + petal.speedX * 0.1; 
                petal.rotation += petal.rotationSpeed; 
                if (petal.y > h) { petal.y = -10; petal.x = Math.random() * w; } 
                if (petal.x > w) petal.x = 0; if (petal.x < 0) petal.x = w; 
                ctx.translate(petal.x, petal.y); ctx.rotate(petal.rotation); 
                ctx.fillStyle = petal.color; 
                ctx.beginPath(); 
                ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2); 
                ctx.fill(); 
                ctx.rotate(-petal.rotation); ctx.translate(-petal.x, -petal.y); 
            }); 
            ctx.restore(); 
        }
    }

    // --- RENDERIZADO CONTACT OPTIMIZADO ---
    drawMayanMetropolis(ctx, w, h, time, scrollPercent) {
        let horizonY = h * 0.82;
        
        ctx.fillStyle = '#040405'; 
        ctx.fillRect(0, horizonY - 5, w, h - horizonY + 5);

        // DIBUJAR LOS BUFFERS PRE-RENDERIZADOS
        if (this.cachedLayers.mayanBack) {
            ctx.drawImage(this.cachedLayers.mayanBack, 0, 0);
        }
        if (this.cachedLayers.mayanFront) {
            ctx.drawImage(this.cachedLayers.mayanFront, 0, 0);
        }

        // Glifos Flotantes
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 10; ctx.shadowColor = 'cyan';
        this.mayanGlyphs.forEach(g => {
            g.y -= g.speedY; if(g.y < h * 0.4) g.y = h * 0.9; 
            let blink = 0.5 + Math.sin(time * g.blinkSpeed) * 0.5;
            ctx.globalAlpha = g.opacity * blink;
            ctx.fillStyle = 'cyan';
            ctx.fillRect(g.x, g.y, g.size, g.size); 
        });
        ctx.restore();
    }
}