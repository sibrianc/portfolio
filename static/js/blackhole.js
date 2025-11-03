(function(){
  const body = document.body;
  let animating = false;

  // Utility: get center coordinates of an element
  function getElementCenter(elem) {
    const rect = elem.getBoundingClientRect();
    return {
      x: rect.left + rect.width/2,
      y: rect.top + rect.height/2
    };
  }

  // Determine if a link should trigger the black hole effect
  function isBlackHoleLink(anchor) {
    if (!anchor.href) return false;
    const url = new URL(anchor.href);
    const sameOrigin = (url.origin === window.location.origin);
    const targetSelf = (anchor.target !== '_blank');
    const notAdmin = !url.pathname.startsWith('/admin');
    // Removed notLangSwitch to include language switch links
    return sameOrigin && targetSelf && notAdmin;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a').forEach(anchor => {
      if (isBlackHoleLink(anchor)) {
        anchor.addEventListener('click', function(event) {
          event.preventDefault();
          if (animating) return;
          animating = true;
          const linkTarget = this.href;
          const clickX = event.clientX;
          const clickY = event.clientY;
          
          // Create black hole at click position
          const bh = document.createElement('div');
          bh.classList.add('black-hole');
          bh.style.position = 'fixed';
          bh.style.left = clickX + 'px';
          bh.style.top = clickY + 'px';
          document.body.appendChild(bh);

          // Signal next page to play emergence animation
          localStorage.setItem('blackhole', 'true');
          localStorage.setItem('bhX', clickX);
          localStorage.setItem('bhY', clickY);

          // Select elements to animate (expanded selectors)
          const contentElems = [];
          const mainArea = document.querySelector('main');
          if (mainArea) {
            // Include headers, text, images, cards, columns, buttons, form controls, etc.
            let elems = mainArea.querySelectorAll(
              'h1, h2, h3, p, img, .card, .col-md-4, .btn-cta, ' +
              'input, textarea, select, button, label, .alert'
            );
            elems.forEach(elem => contentElems.push(elem));
          }
          // Include nav bar links (home, about, etc.), language toggle, and corner decorations
          document.querySelectorAll('nav a, .corner, footer.navbar-brand').forEach(elem => {
            contentElems.push(elem);
          });
          // Include background stars
          const starElems = Array.from(document.querySelectorAll('.cy-star'));
          starElems.forEach(star => contentElems.push(star));

          // Remove duplicates/nested elements (if parent is in list, skip child)
          contentElems.forEach((elem, i) => {
            for (let j = 0; j < contentElems.length; j++) {
              if (j !== i && contentElems[j].contains(elem)) {
                elem._skip = true;
                break;
              }
            }
          });
          const animElems = contentElems.filter(elem => !elem._skip);

          // Pause star flickering during suction
          starElems.forEach(star => {
            star.style.animationPlayState = 'paused';
          });

          // Calculate distance of each element to black hole and sort by closest first
          const bhPos = { x: clickX, y: clickY };
          const elementsWithDist = animElems.map(elem => {
            const center = getElementCenter(elem);
            const dx = bhPos.x - center.x;
            const dy = bhPos.y - center.y;
            return { 
              elem, dx, dy, 
              distance: Math.hypot(dx, dy) 
            };
          });
          elementsWithDist.sort((a, b) => a.distance - b.distance);

          // Animation timing
          const baseDelay = 300;
          const duration = 600;
          const totalSeq = 500;
          const count = elementsWithDist.length;
          const delayStep = count > 1 ? totalSeq / (count - 1) : 0;

          // Animate each element into the black hole
          elementsWithDist.forEach((item, index) => {
            const { elem, dx, dy } = item;
            // Increase random rotation for more spin (360° to 720°)
            const angle = (Math.random() * 360 + 360) * (Math.random() < 0.5 ? 1 : -1);
            const delay = baseDelay + index * delayStep;
            // Keyframe animation: move 80% of the way visible, then vanish at end
            const keyframes = [
              { offset: 0, transform: 'none', opacity: 1 },
              { 
                offset: 0.8, 
                transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) rotate(${angle}deg) scale(0.2)`, 
                opacity: 1, 
                easing: 'ease-in'  // accelerate into BH
              },
              { 
                offset: 1, 
                transform: `translate(${dx}px, ${dy}px) rotate(${angle}deg) scale(0)`, 
                opacity: 0 
              }
            ];
            elem.animate(keyframes, {
              duration: duration,
              delay: delay,
              fill: 'forwards'  // keep final state (hidden):contentReference[oaicite:3]{index=3}
            });
          });

          // Animate the black hole growing slightly during suction
          const maxDelay = baseDelay + delayStep * (count - 1);
          const lastAnimationTime = maxDelay + duration;
          setTimeout(() => {
            bh.animate(
              [
                { transform: 'translate(-50%, -50%) scale(1)' },
                { transform: 'translate(-50%, -50%) scale(1.2)' }
              ],
              { duration: lastAnimationTime - 400, easing: 'ease-out', fill: 'forwards' }
            );
          }, 400);

          // Navigate to next page after all animations complete
          setTimeout(() => {
            window.location.href = linkTarget;
          }, lastAnimationTime);
        });
      }
    });
  });

  // On new page load after blackhole navigation, animate content emerging
  window.addEventListener('load', () => {
    if (localStorage.getItem('blackhole') === 'true') {
      const bhX = parseFloat(localStorage.getItem('bhX')) || window.innerWidth/2;
      const bhY = parseFloat(localStorage.getItem('bhY')) || window.innerHeight/2;
      const bhPos = { x: bhX, y: bhY };
      document.body.style.opacity = '0';
      localStorage.removeItem('blackhole');
      localStorage.removeItem('bhX');
      localStorage.removeItem('bhY');

      // Create black hole at stored position on new page
      const bh = document.createElement('div');
      bh.classList.add('black-hole');
      bh.style.position = 'fixed';
      bh.style.left = bhX + 'px';
      bh.style.top = bhY + 'px';
      document.body.appendChild(bh);

      // Select elements to animate out of the black hole (same selectors as before)
      const contentElems = [];
      const mainArea = document.querySelector('main');
      if (mainArea) {
        let elems = mainArea.querySelectorAll(
          'h1, h2, h3, p, img, .card, .col-md-4, .btn-cta, ' +
          'input, textarea, select, button, label, .alert'
        );
        elems.forEach(elem => contentElems.push(elem));
      }
      document.querySelectorAll('nav a, .corner, footer.navbar-brand').forEach(elem => {
        contentElems.push(elem);
      });
      const starElems = Array.from(document.querySelectorAll('.cy-star'));
      starElems.forEach(star => contentElems.push(star));
      contentElems.forEach((elem, i) => {
        for (let j = 0; j < contentElems.length; j++) {
          if (j !== i && contentElems[j].contains(elem)) {
            elem._skip = true;
            break;
          }
        }
      });
      const animElems = contentElems.filter(elem => !elem._skip);

      // Pause star flickering during emergence
      starElems.forEach(star => {
        star.style.animationPlayState = 'paused';
      });

      // Hide all animElems initially
      animElems.forEach(elem => {
        elem.style.opacity = '0';
        elem.style.transform = 'scale(0)';
        elem.style.transition = 'none';
      });
      // Also hide navbar background initially to fade it in
      const navElem = document.querySelector('nav.nav-cyber');
      if (navElem) {
        navElem.style.opacity = '0';
        navElem.style.transition = 'none';
      }
      // Reveal body (content still hidden by transforms)
      body.style.opacity = '1';
      body.style.transform = 'none';

      // Compute distance of each element from BH and sort by farthest first
      const elementsWithDist = animElems.map(elem => {
        const center = getElementCenter(elem);
        const dx = bhPos.x - center.x;
        const dy = bhPos.y - center.y;
        return { 
          elem, dx, dy, 
          distance: Math.hypot(dx, dy) 
        };
      });
      elementsWithDist.sort((a, b) => b.distance - a.distance);

      // Animation timing for emergence
      const baseDelay = 200;
      const duration = 600;
      const totalSeq = 500;
      const count = elementsWithDist.length;
      const delayStep = count > 1 ? totalSeq / (count - 1) : 0;

      // Animate each element from the black hole to its position
      elementsWithDist.forEach((item, index) => {
        const { elem, dx, dy } = item;
        const angle = (Math.random() * 360 + 360) * (Math.random() < 0.5 ? -1 : 1);
        const delay = baseDelay + index * delayStep;
        elem.animate([
          { transform: `translate(${dx}px, ${dy}px) rotate(${angle}deg) scale(0)`, opacity: 0 },
          { transform: 'none', opacity: 1 }
        ], {
          duration: duration,
          delay: delay,
          easing: 'ease-out',
          fill: 'forwards'
        });
      });

      // Fade in navbar background during content emergence
      if (navElem) {
        navElem.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: (delayStep * (count - 1) + duration) - baseDelay, delay: baseDelay, fill: 'forwards' }
        );
      }

      // Prevent scrolling during the animation
      document.body.style.overflow = 'hidden';

      // Remove black hole with explosion effect after all elements have emerged
      const maxDelay = baseDelay + delayStep * (count - 1);
      const lastAnimationTime = maxDelay + duration;
      setTimeout(() => {
        bh.animate(
            [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }
            ],
            { duration: 400, easing: 'ease-out' }
        );
        setTimeout(() => {
            bh.remove();
            document.body.style.overflow = '';
            starElems.forEach(star => {
                star.style.animationPlayState = 'running';
            });
        }, 400);
    }, lastAnimationTime);
    }
  });
})();
