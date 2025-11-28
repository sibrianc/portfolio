// space.js — background space sprites (nebula first, astronaut/comet later)
(function () {
  // Main layer where all space sprites will live
  const layer = document.querySelector(".cy-space");
  if (!layer) return;

  // ------------------------------------------------------------
  // 1) Nebula sprite sheet config (for this 1024x1024 PNG)
  // ------------------------------------------------------------
  const NEBULA_SHEET = {
    imageWidth: 1024,
    imageHeight: 1024,
    frameCount: 8,
    frameWidth: 128,   // 1024 / 8
    frameHeight: 128,
    // vertical offset where the row of nebulas starts (in pixels)
    rowY: 448
  };

  const NEBULA_COUNT =1;              // how many nebulas on each page load
  const NEBULA_FRAME_DURATION = 140;   // ms per frame (~7 fps, soft breathing)
  const NEBULA_MIN_DISTANCE = 220;     // minimal distance between nebulas

  // Store placed nebulas (their centers) to avoid overlapping
  const placedNebulas = [];

  // Zones where we do NOT want nebulas (hero text area, etc.)
  const avoidZones = [];

  // Keep track of starting frames so each nebula can have a different sequence
  const usedStartFrames = new Set();

  // ------------------------------------------------------------
  // Helper: register zones to avoid (hero tagline text)
  // ------------------------------------------------------------
  function computeAvoidZones() {
    // This <p> is your hero tagline:
    // <p class="lead text-light-75">{{ t('hero_tagline') }}</p>
    const heroText = document.querySelector(".hero-cyber p.lead");
    if (heroText) {
      const r = heroText.getBoundingClientRect();

      // Add some padding around the text so nebulas stay at a safe distance
      const padding = 60; // tweak if needed

      avoidZones.push({
        x: r.left - padding,
        y: r.top - padding,
        w: r.width + padding * 2,
        h: r.height + padding * 2
      });
    }
  }

  function intersectsZone(x, y, w, h, zone) {
    return !(
      x + w < zone.x ||
      x > zone.x + zone.w ||
      y + h < zone.y ||
      y > zone.y + zone.h
    );
  }

  // ------------------------------------------------------------
  // Helper: get a non-overlapping, non-forbidden random position
  // ------------------------------------------------------------
  function getRandomNebulaPosition() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const w = NEBULA_SHEET.frameWidth;
    const h = NEBULA_SHEET.frameHeight;

    // Avoid sticking to the very edges
    const marginX = 0.10;
    const marginY = 0.10;

    const maxAttempts = 30;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = vw * (marginX + Math.random() * (1 - 2 * marginX));
      const y = vh * (marginY + Math.random() * (1 - 2 * marginY));

      const cx = x + w / 2;
      const cy = y + h / 2;

      // 1) Check distance to other nebulas
      let tooClose = false;
      for (const p of placedNebulas) {
        const dx = cx - p.cx;
        const dy = cy - p.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < NEBULA_MIN_DISTANCE) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // 2) Check forbidden zones (hero text area, etc.)
      let inForbiddenZone = false;
      for (const zone of avoidZones) {
        if (intersectsZone(x, y, w, h, zone)) {
          inForbiddenZone = true;
          break;
        }
      }
      if (inForbiddenZone) continue;

      // Position is good
      placedNebulas.push({ cx, cy });
      return { x, y };
    }

    // Fallback: place it anywhere within margins if we run out of attempts
    const fallbackX = vw * (marginX + Math.random() * (1 - 2 * marginX));
    const fallbackY = vh * (marginY + Math.random() * (1 - 2 * marginY));
    const fallbackCx = fallbackX + w / 2;
    const fallbackCy = fallbackY + h / 2;
    placedNebulas.push({ cx: fallbackCx, cy: fallbackCy });

    return { x: fallbackX, y: fallbackY };
  }

  // ------------------------------------------------------------
  // Helper: get a unique starting frame so sequences are offset
  // ------------------------------------------------------------
  function getUniqueStartFrame() {
    // Try to pick a frame that is not used yet
    const available = [];
    for (let i = 0; i < NEBULA_SHEET.frameCount; i++) {
      if (!usedStartFrames.has(i)) {
        available.push(i);
      }
    }
    let chosen;
    if (available.length > 0) {
      chosen = available[Math.floor(Math.random() * available.length)];
    } else {
      // If we used all, fall back to any frame (still fine visually)
      chosen = Math.floor(Math.random() * NEBULA_SHEET.frameCount);
    }
    usedStartFrames.add(chosen);
    return chosen;
  }

  // ------------------------------------------------------------
  // 2) Create one nebula instance and animate its frames
  // ------------------------------------------------------------
  function createNebulaInstance() {
    const nebula = document.createElement("div");
    nebula.className = "cy-nebula-sprite";

    // Get a random non-overlapping position that avoids hero text
    const pos = getRandomNebulaPosition();
    nebula.style.left = pos.x + "px";
    nebula.style.top = pos.y + "px";

    // Different starting frame per nebula so sequences are offset
    let frameIndex = getUniqueStartFrame();

    function applyFrame() {
      const xOffset = frameIndex * NEBULA_SHEET.frameWidth;
      nebula.style.backgroundPosition = `-${xOffset}px -${NEBULA_SHEET.rowY}px`;
    }

    applyFrame();
    layer.appendChild(nebula);

    // Per-instance animation loop using requestAnimationFrame
    let lastTime = performance.now();

    function animate(now) {
      const delta = now - lastTime;

      if (delta >= NEBULA_FRAME_DURATION) {
        // All nebulas walk frames in the same direction (+1),
        // but because each one starts at a different frame,
        // their visible sequence is offset:
        //   nebula 1: 1-2-3-4-5...
        //   nebula 2: 3-4-5-6-7-8...
        //   nebula 3: 7-8-1-2-3...
        frameIndex = (frameIndex + 1) % NEBULA_SHEET.frameCount;
        applyFrame();
        lastTime = now;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ------------------------------------------------------------
  // 3) Initialize nebulas on page load
  // ------------------------------------------------------------
  function initNebulas() {
    computeAvoidZones();
    for (let i = 0; i < NEBULA_COUNT; i++) {
      createNebulaInstance();
    }
  }

  // Run after everything is laid out
  window.addEventListener("load", initNebulas);

  // ------------------------------------------------------------
  // NOTE:
  // Later we can add:
  // - floating astronaut sprite
  // - pixel comets
  // reusing the same `layer` (.cy-space) to keep things organized.
  // ------------------------------------------------------------
})();
