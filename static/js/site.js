(function () {
  // Overlay navigation handling
  const overlay = document.getElementById('menuOverlay');
  const toggle = document.querySelector('.menu-toggle');
  const closeBtn = document.querySelector('.overlay-close');
  const navLinks = overlay ? overlay.querySelectorAll('[data-nav]') : [];

  function setMenu(open) {
    if (!overlay || !toggle) return;
    overlay.classList.toggle('active', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
  }

  toggle && toggle.addEventListener('click', () => setMenu(!overlay.classList.contains('active')));
  closeBtn && closeBtn.addEventListener('click', () => setMenu(false));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Parallax for elements with data-depth
  const scenes = document.querySelectorAll('.scene');
  scenes.forEach(scene => {
    const items = scene.querySelectorAll('[data-depth]');
    if (!items.length) return;
    scene.addEventListener('mousemove', (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      items.forEach(el => {
        const depth = parseFloat(el.getAttribute('data-depth') || '0');
        const moveX = x * depth * 60;
        const moveY = y * depth * 40;
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    });
    scene.addEventListener('mouseleave', () => {
      items.forEach(el => el.style.transform = 'translate3d(0,0,0)');
    });
  });

  // GSAP entrance animations
  if (window.gsap) {
    gsap.from('.scene .badge-name, .scene h1', {
      y: 24,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.2
    });
    gsap.from('.floating-card', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      stagger: 0.12,
      delay: 0.4
    });
    gsap.to('.rockets .rocket', { y: -24, repeat: -1, yoyo: true, ease: 'sine.inOut', duration: 2.2 });
  }

  // Optional AJAX contact submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm && contactForm.dataset.ajax === 'true') {
    const status = document.createElement('div');
    status.className = 'text-center mt-2 text-light-75';
    contactForm.appendChild(status);

    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      status.textContent = 'Sending...';
      try {
        const res = await fetch(contactForm.action || window.location.href, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'X-Requested-With': 'fetch' }
        });
        if (res.ok) {
          status.textContent = 'Message sent. I will reply soon!';
          contactForm.reset();
        } else {
          status.textContent = 'Could not send right now. Please try again.';
        }
      } catch (err) {
        status.textContent = 'Connection issue. Please retry.';
      }
    });
  }
})();
