// VerdeGest — UI utilities (toasts, modals, theme)
'use strict';

export function toast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation',
  };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.style.setProperty('--toast-duration', `${duration}ms`);
  el.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i>
    <div class="toast-body">${message}</div>
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(120%)';
    el.style.transition = 'all 300ms ease';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* Theme */
export function initTheme() {
  const saved = localStorage.getItem('verdegest_theme');
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('verdegest_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('[data-theme-icon]');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* Scroll reveal */
export function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* Navbar scroll effect */
export function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener(
    'scroll',
    () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    },
    { passive: true }
  );
}
