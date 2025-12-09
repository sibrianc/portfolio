// Carlos Portfolio – base JS (mariobros)

// De momento solo activamos el menú básico. 
// Todo el sistema de escenas/animaciones tipo "Mario" lo agregamos después.

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const navOverlay = document.getElementById('nav-overlay');

  if (!menuBtn || !navOverlay) return;

  const toggleMenu = () => {
    navOverlay.classList.toggle('active');
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Cerrar al hacer click fuera
  navOverlay.addEventListener('click', (event) => {
    if (event.target === navOverlay) {
      navOverlay.classList.remove('active');
    }
  });
});
