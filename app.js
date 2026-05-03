// ── APP.JS — Shared logic for RepPic ──

const DB_KEY = 'reppic_photos';

// ── Storage ──
function getPhotos() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
  catch { return []; }
}
function savePhotos(photos) { localStorage.setItem(DB_KEY, JSON.stringify(photos)); }
function addPhoto(photo) {
  const photos = getPhotos();
  photo.id = Date.now().toString();
  photo.createdAt = new Date().toISOString();
  photos.unshift(photo);
  savePhotos(photos);
  return photo;
}
function deletePhoto(id) { savePhotos(getPhotos().filter(p => p.id !== id)); }
function getPhotoById(id) { return getPhotos().find(p => p.id === id) || null; }

// ── Utilities ──
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatMonth(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
function groupByMonth(photos) {
  const groups = {};
  for (const p of photos) {
    const month = formatMonth(p.createdAt);
    if (!groups[month]) groups[month] = [];
    groups[month].push(p);
  }
  return groups;
}

// ── Toast ──
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Modal ──
function openModal(src) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <button class="modal-close" id="modal-close">✕</button>
      <img id="modal-img" src="" alt="Full size photo" />
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }
  document.getElementById('modal-img').src = src;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  const info = document.getElementById('lightbox-info');
  if (info) info.style.display = 'none';
}

// ── File to Base64 ──
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Active nav ──
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

// ── Cursor glow effect ──
function initCursorGlow() {
  if (window.innerWidth < 700) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── Scroll reveal ──
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ── Page transition out ──
function navigateTo(url) {
  document.body.style.transition = 'opacity 0.25s ease';
  document.body.style.opacity = '0';
  setTimeout(() => window.location.href = url, 250);
}

// ── Page fade in ──
function initPageEntrance() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.4s ease';
      document.body.style.opacity = '1';
    });
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initCursorGlow();
  initScrollReveal();
  initPageEntrance();

  // Intercept nav links for smooth transitions
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        e.preventDefault();
        navigateTo(href);
      }
    });
  });
});
