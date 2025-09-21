// Cablim LP — Header + Hero only
(function () {
  // Smooth scroll for in-page anchors (mouse icon)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Inline Hero Reel (autoplay once, muted; replay button)
  const box = document.querySelector('[data-reel-inline]');
  if (!box) return;
  const video = box.querySelector('video');
  const toggle = box.querySelector('.mute-toggle');
  const replay = box.querySelector('.replay-btn');
  const mp4 = box.getAttribute('data-reel-src');

  function setMutedUI() {
    if (!toggle) return;
    if (video.muted) toggle.classList.add('is-muted'); else toggle.classList.remove('is-muted');
  }

  if (mp4) {
    video.src = mp4;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = false;
    video.addEventListener('canplay', () => { video.play().catch(()=>{}); }, { once: true });
    setMutedUI();
    box.classList.add('is-playing');
    video.addEventListener('play', () => { box.classList.add('is-playing'); box.classList.remove('is-ended'); });
    video.addEventListener('pause', () => { box.classList.remove('is-playing'); });
    video.addEventListener('ended', () => { box.classList.remove('is-playing'); box.classList.add('is-ended'); });
    replay?.addEventListener('click', () => { video.play().catch(()=>{}); });
    toggle?.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.paused) video.play().catch(()=>{});
      setMutedUI();
    });
  } else {
    const ph = document.createElement('div');
    ph.style.cssText = 'display:grid;place-items:center;height:100%;text-align:center;padding:16px;border-radius:16px;background:linear-gradient(135deg,#E6B796,#FFC9A3);color:#3b372f;font-weight:600;';
    ph.textContent = 'Adicione seu vídeo MP4 9:16 em assets/videoreels.mp4 ou ajuste data-reel-src.';
    video.replaceWith(ph);
    if (toggle) toggle.style.display = 'none';
  }
})();

// Render 'Destaques da Semana' from inline JSON
(function renderProducts(){
  const target = document.querySelector('[data-products-target]');
  if (!target) return;
  let data = null;

  function render(items){
    const frag = document.createDocumentFragment();
    items.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'product-card';

      const media = document.createElement('div');
      media.className = 'product-card__media';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = item.title || `Produto ${idx+1}`;
      img.src = item.image || '';
      img.onerror = () => { img.style.opacity = '0.5'; img.alt += ' (imagem não encontrada)'; };
      media.appendChild(img);

      const title = document.createElement('h3');
      title.className = 'product-card__title';
      title.textContent = item.title || 'Produto';

      const subtitle = document.createElement('p');
      subtitle.className = 'product-card__subtitle';
      subtitle.textContent = item.subtitle || '';

      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'product-card__cta';
      const btn = document.createElement('a');
      btn.className = 'btn';
      btn.href = item.link || '#';
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.textContent = 'Ver produto';
      ctaWrap.appendChild(btn);

      card.appendChild(media);
      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(ctaWrap);
      frag.appendChild(card);
    });
    target.innerHTML = '';
    target.appendChild(frag);
  }

  // Try external JSON first (assets/destaques.json), then fallback to inline
  fetch('assets/destaques.json').then(r => r.ok ? r.json() : Promise.reject())
    .then(json => { if (Array.isArray(json.items)) render(json.items); else throw 0; })
    .catch(() => {
      try {
        const jsonEl = document.getElementById('week-products');
        if (jsonEl) data = JSON.parse(jsonEl.textContent.trim());
      } catch (e) { /* ignore */ }
      if (data && Array.isArray(data.items)) render(data.items);
    });
})();

// Simple testimonials carousel (one slide visible, up to 3 slides)
(function testimonials(){
  const car = document.querySelector('[data-t-carousel]');
  if (!car) return;
  const track = car.querySelector('.t-track');
  const slides = Array.from(car.querySelectorAll('.t-slide'));
  const prev = car.querySelector('.t-prev');
  const next = car.querySelector('.t-next');
  const dotsWrap = car.querySelector('.t-dots');
  let i = 0;
  let timer = null;

  function update() {
    const w = car.clientWidth;
    track.style.transform = `translateX(${-i * w}px)`;
    dotsWrap?.querySelectorAll('button').forEach((b, idx) => b.setAttribute('aria-current', String(idx === i)));
  }

  function go(n){
    i = (n + slides.length) % slides.length;
    update();
  }

  function auto(){
    clearInterval(timer);
    timer = setInterval(() => go(i+1), 5000);
  }

  // Build dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach((_, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => { go(idx); auto(); });
      dotsWrap.appendChild(b);
    });
  }

  prev?.addEventListener('click', () => { go(i-1); auto(); });
  next?.addEventListener('click', () => { go(i+1); auto(); });
  window.addEventListener('resize', update);

  // Initialize
  update();
  auto();
})();
// Update year in footer
(function(){
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
// Pause/resume hero video based on visibility
(function heroPauseOnScroll(){
  const video = document.querySelector('.hero .video-inline');
  if (!video) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        if (!video.paused && video.ended) return; // ended, keep ended
        video.play().catch(()=>{});
      } else {
        try { video.pause(); } catch(_) {}
      }
    });
  }, { threshold: [0, 0.5, 1] });
  io.observe(video);
})();

// Scroll reveal for landing page elements
(function scrollReveal(){
  const candidates = new Set([
    ...document.querySelectorAll('.hero__media, .hero__note, .hero__cta'),
    ...document.querySelectorAll('.section .container'),
    ...document.querySelectorAll('.product-card, .phone, .partner-media, .project-media, .t-carousel, .footer__grid')
  ]);
  const els = Array.from(candidates);
  els.forEach((el, i) => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
    el.style.setProperty('--reveal-delay', `${Math.min(i * 60, 240)}ms`);
  });
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();
