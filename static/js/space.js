// space.js — SOLO COMETA (limpio, diagonal bonita, random y sin acumulación)
(function () {
  const layer = document.querySelector(".cy-space");
  if (!layer) return;

  // ============================================================
  // 1) Config del spritesheet del cometa (3 frames, 1024x1024)
  // ============================================================
  const COMET_SHEET = {
    sheetWidth: 1024,
    sheetHeight: 1024,
    frameCount: 3,
    frameWidth: Math.floor(1024 / 3), // ~341px por frame
    frameHeight: 1024,
    rowY: 300                            // ya lo tenías así
  };

  const COMET_FRAME_DURATION = 110; // ms por frame (llama fluida)
  const COMET_MIN_DELAY = 6;        // mínimo 6 s entre cometas
  const COMET_MAX_DELAY = 14;       // máximo 14 s entre cometas

  // ============================================================
  // 2) Crea UN cometa: anima frames + vuelo diagonal
  // ============================================================
  function spawnComet() {
    const comet = document.createElement("div");
    comet.className = "cy-comet-sprite";

       const vw = window.innerWidth;
    const vh = window.innerHeight;

        const size = 380; // debe coincidir con width/height del CSS

    // --- PUNTO DE INICIO RANDOM DENTRO DE LA PANTALLA ---
    // Margen para no pegarse a los lados
    const marginX = size * 0.4;

    // X: random en casi todo el ancho
    const startX = marginX + Math.random() * (vw - 2 * marginX);

    // Y: random entre 5% y 75% de la altura de la pantalla
    const minY = vh * 0.01;
    const maxY = vh * 0.9;

    const startY = minY + Math.random() * (maxY - minY);

    comet.style.left = startX + "px";
    comet.style.top  = startY + "px";

    // --- 2.1 Animación de frames (0,1,2,0,1,2,...) ---
    let frameIndex = 0;
    let lastFrameTime = performance.now();

    function applyCometFrame() {
      const xOffset = frameIndex * COMET_SHEET.frameWidth;
      comet.style.backgroundPosition =
        `-${xOffset}px -${COMET_SHEET.rowY}px`;
    }

    applyCometFrame();
    layer.appendChild(comet);

    function animateFrames(now) {
      const delta = now - lastFrameTime;
      if (delta >= COMET_FRAME_DURATION) {
        frameIndex = (frameIndex + 1) % COMET_SHEET.frameCount;
        applyCometFrame();
        lastFrameTime = now;
      }
      requestAnimationFrame(animateFrames);
    }
    requestAnimationFrame(animateFrames);

    // --- 2.2 Vuelo diagonal derecha -> izquierda, hacia abajo ---
    const flightDuration = 3.2 + Math.random() * 1.5; // 3.2–4.7 s

    // Distancia horizontal (del borde derecho hasta bien fuera del izquierdo)
    const travelX = -(vw + size * 1.8);

    // MISMA DIAGONAL QUE TE GUSTABA
    const slope = 0.55; // si quieres más inclinación, sube a 0.6–0.7

    // Avance vertical en función de travelX y slope
    const travelY = Math.abs(travelX) * slope * 0.55;

    const endX = startX + travelX;
    const endY = startY + travelY;

    // Movimiento suave con transición CSS
    requestAnimationFrame(() => {
      comet.style.transition =
        `left ${flightDuration}s linear, top ${flightDuration}s linear`;
      comet.style.left = endX + "px";
      comet.style.top = endY + "px";
    });

    // Eliminar cuando termina la transición
    comet.addEventListener(
      "transitionend",
      () => {
        comet.remove();
      },
      { once: true }
    );

    // Fallback extra por si por alguna razón no dispara transitionend
    setTimeout(() => {
      if (comet.parentNode) {
        comet.remove();
      }
    }, (flightDuration + 0.8) * 1000);
  }

    // ============================================================
  // 3) Programar cometas con intervalo aleatorio
  // ============================================================
  function scheduleNextComet() {
    const delayMs =
      (COMET_MIN_DELAY +
        Math.random() * (COMET_MAX_DELAY - COMET_MIN_DELAY)) * 250;

    // Solo para debug: ver en consola cuándo viene el siguiente
    // console.log("[space.js] Siguiente cometa en", delayMs.toFixed(0), "ms");

    setTimeout(() => {
      spawnComet();
      scheduleNextComet(); // vuelve a programar el siguiente
    }, delayMs);
  }

  // ============================================================
  // 4) Init al cargar la página
  // ============================================================
  window.addEventListener("load", () => {
    // Uno inmediato al entrar
    spawnComet();
    // Y luego infinitos con delay random
    scheduleNextComet();
  });
})();

