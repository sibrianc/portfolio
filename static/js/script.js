// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Typewriter effect for Hero description
  var descEl = document.getElementById('hero-desc');
  if (descEl && descEl.dataset.text) {
    var fullText = descEl.dataset.text;
    descEl.textContent = "";
    var i = 0;
    var typing = setInterval(function() {
      if (i < fullText.length) {
        descEl.textContent += fullText.charAt(i);
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);
  }

  // Launch Project button interaction
  var launchButtons = document.querySelectorAll('.project-launch-btn');
  launchButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var item = btn.closest('.project-item');
      if (item) {
        // Add launching animation class
        item.classList.add('launching');
        // After animation, go to the project link (if href is set)
        var targetUrl = btn.getAttribute('href');
        if (targetUrl && targetUrl !== "#") {
          setTimeout(function() {
            window.location.href = targetUrl;
          }, 1000);  // 1 second delay for animation
        }
      }
    });
  });
});
