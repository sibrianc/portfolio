document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('intro-overlay');
  const enterButton = document.getElementById('enter-button');

  if (!overlay || !enterButton) return;

  const requestFullscreen = () => {
    const docEl = document.documentElement;

    if (docEl.requestFullscreen) return docEl.requestFullscreen();
    if (docEl.webkitRequestFullscreen) return docEl.webkitRequestFullscreen();
    if (docEl.msRequestFullscreen) return docEl.msRequestFullscreen();
    return null;
  };

  const triggerFullscreen = () => {
    if (document.fullscreenElement) return;

    const wantsFullscreen = window.confirm('View the experience in fullscreen?');
    if (!wantsFullscreen) return;

    const result = requestFullscreen();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  };

  enterButton.addEventListener('click', () => {
    overlay.classList.add('fade-out');
    triggerFullscreen();
  });
});
