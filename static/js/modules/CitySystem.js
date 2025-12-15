// static/js/modules/CitySystem.js

export class CitySystem {
    constructor() {
        this.mountainFacets = [];
        this.buildings = [];
        this.initBuildings();
    }

    initBuildings() {
        this.buildings = [];
        for(let i=0; i<15; i++) { 
            let b = {
                xRel: Math.random() * 0.6, 
                yBase: Math.random() * 0.08, 
                width: 8 + Math.random() * 10, 
                height: 15 + Math.random() * 25, 
                floors: [], 
                antenna: Math.random() > 0.6
            };
            let numFloors = Math.floor(b.height / 5);
            for(let f=0; f<numFloors; f++) {
                b.floors.push({yOffset: f * 5 + 2, lights: Math.random() > 0.3, blinkSpeed: 0.02 + Math.random() * 0.05, phase: Math.random() * Math.PI});
            }
            this.buildings.push(b);
        }
    }

    resize(w, h) {
        this.generateLandscapeGeometry(w, h);
        this.buildings.forEach(b => { b.xRel = Math.random() * 0.6; });
    }

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

    render(ctx, w, h, time) {
        let horizonY = h * 0.82;
        // Suelo
        ctx.fillStyle = '#080101';
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // Montañas
        this.mountainFacets.forEach(facet => {
            ctx.fillStyle = facet.color;
            ctx.beginPath();
            ctx.moveTo(facet.points[0].x, facet.points[0].y);
            for(let i=1; i<facet.points.length; i++) {
                ctx.lineTo(facet.points[i].x, facet.points[i].y);
            }
            ctx.closePath();
            ctx.fill();
        });

        // Edificios
        const buildingBaseColor = '#1a0404';
        const windowColor = '#ffaa00';

        this.buildings.forEach(b => {
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
}