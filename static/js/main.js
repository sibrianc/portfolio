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

const shouldHandleInternalNavigation = link => {
  const href = link.getAttribute('href');

  if (!href || href.startsWith('#')) {
    return false;
  }

  let url;

  try {
    url = new URL(href, window.location.origin);
  } catch (error) {
    return false;
  }

  const isInternal = url.origin === window.location.origin;
  const isSamePageAnchor = url.pathname === window.location.pathname && Boolean(url.hash);

  return isInternal && !isSamePageAnchor;
};

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('preload');

  document.querySelectorAll('a[href]').forEach(link => {
    if (!shouldHandleInternalNavigation(link)) {
      return;
    }

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

      event.preventDefault();
      document.body.classList.add('fade-out');
      const targetUrl = new URL(link.getAttribute('href'), window.location.origin);

      setTimeout(() => {
        window.location.href = targetUrl.href;
      }, TRANSITION_DURATION);
    });
  });
});
