(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  var loader = document.getElementById('loader');
  var bar = document.getElementById('loaderBar');
  var progress = 0;
  var loadTimer = setInterval(function () {
    progress = Math.min(100, progress + Math.random() * 22 + 8);
    bar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(loadTimer);
      setTimeout(function () {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
        startReveals();
      }, 250);
    }
  }, 140);

  /* ---------- Scroll reveals ---------- */
  function startReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = el.closest('.hero') ? '' : (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Nav + wanted-level HUD ---------- */
  var nav = document.getElementById('nav');
  var starsWrap = document.getElementById('stars');
  var stars = starsWrap.querySelectorAll('span');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? y / max : 0;
    var level = Math.min(5, Math.floor(p * 5.99));
    stars.forEach(function (s, i) { s.classList.toggle('on', i < level); });
    starsWrap.classList.toggle('flash', level >= 4);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Cover card tilt ---------- */
  var tilt = document.getElementById('tilt');
  var hero = document.querySelector('.hero');
  if (tilt && !reduce && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { tilt.style.transform = ''; });
  }

  /* ---------- Copy contract ---------- */
  var copyBtn = document.getElementById('copyBtn');
  var caText = document.getElementById('caText');
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(big, small) {
    toast.querySelector('.toast__big').textContent = big;
    toast.querySelector('.toast__small').textContent = small;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyCA() {
    var text = caText.textContent.trim();
    var done = function (ok) {
      if (ok) {
        showToast('MISSION PASSED', 'Contract copied');
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800);
      } else {
        showToast('WASTED', 'Copy failed. Select it manually');
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else {
      done(fallbackCopy(text));
    }
  }
  copyBtn.addEventListener('click', copyCA);

  // "Copy Contract" hero button scrolls to the section; clicking the address also copies
  caText.style.cursor = 'pointer';
  caText.addEventListener('click', copyCA);
})();
