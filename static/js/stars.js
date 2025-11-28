// stars.js — random flickering starfield
(function(){
  const layer = document.querySelector('.cy-stars');
  if(!layer) return;

  const STAR_COUNT = 180;   // adjust density
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  function addStars(){
    layer.innerHTML = "";
    for(let i=0;i<STAR_COUNT;i++){
      const s = document.createElement('span');
      s.className = 'cy-star';
      const x = Math.random()*W();
      const y = Math.random()*H();
      const size = 1 + Math.random()*2; // 1–3px
      s.style.left = x + 'px';
      s.style.top  = y + 'px';
      s.style.width = size + 'px';
      s.style.height= size + 'px';
      const dur = 2 + Math.random()*5;  // 2–7s
      const delay = Math.random()*5;    // 0–5s
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = delay + 's';
      layer.appendChild(s);
    }
  }

  addStars();
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t); t=setTimeout(addStars, 200);
  });
})();

  