// VerdeGest — Utilities
'use strict';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const fmtKz = (v) =>
  'Kz ' + Math.round(v).toLocaleString('pt-AO', { maximumFractionDigits: 0 });

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function gerarToken() {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function detectDevice() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return '📱 Mobile';
  if (/tablet|ipad/i.test(ua)) return '📲 Tablet';
  if (/Windows/i.test(ua)) return '💻 Windows';
  if (/Mac/i.test(ua)) return '💻 Mac';
  if (/Linux/i.test(ua)) return '💻 Linux';
  return '💻 Outro';
}

export function formatDate(ts) {
  return new Date(ts).toLocaleString('pt-AO');
}
