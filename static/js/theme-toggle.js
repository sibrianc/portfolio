// theme-toggle.js - simple localStorage-backed theme switch
(function () {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const root = document.body;
  const saved = localStorage.getItem("cy-theme");

  // Initialize from storage
  if (saved === "light") {
    root.setAttribute("data-theme", "light");
    btn.textContent = "LIGHT";
  } else {
    root.setAttribute("data-theme", "dark");
    btn.textContent = "DARK";
  }

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("cy-theme", next);
    btn.textContent = next.toUpperCase();
  });
})();
