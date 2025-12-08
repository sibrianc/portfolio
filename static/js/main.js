// Main entry point for redesigned theme
(function () {
  const body = document.body;
  if (body && !body.dataset.pageId) {
    body.dataset.pageId = body.className || 'page';
  }
})();
