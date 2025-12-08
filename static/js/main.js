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
