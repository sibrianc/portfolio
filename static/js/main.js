// Main entry point for redesigned theme
(function () {
  const body = document.body;
  if (body && !body.dataset.pageId) {
    body.dataset.pageId = body.className || 'page';
  }
})();

// Menu toggle script
const menuBtn = document.getElementById('menu-btn');
const navOverlay = document.getElementById('nav-overlay');

if (menuBtn && navOverlay) {
  const closeMenu = () => {
    menuBtn.classList.remove('open');
    navOverlay.classList.remove('active');
  };

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navOverlay.classList.toggle('active');
  });

  // Close menu when a link is clicked (for single-page experience or just to hide after navigation)
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  navOverlay.addEventListener('click', event => {
    if (event.target === navOverlay) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}

const TRANSITION_DURATION = 500;

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('preload');

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', event => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === '_blank'
      ) {
        return;
      }

      const href = link.getAttribute('href');

      if (!href || href.startsWith('#')) {
        return;
      }

      event.preventDefault();
      document.body.classList.add('fade-out');

      setTimeout(() => {
        window.location.href = link.href;
      }, TRANSITION_DURATION);
    });
  });
});
