// VerdeGest — Charts
'use strict';

import { $, fmtKz } from './utils.js';

let initialized = false;

export function inicializarGraficos() {
  if (initialized) return;
  const c1 = $('#chartServico');
  const c2 = $('#chartMRR');
  if (!c1 || !c2 || typeof Chart === 'undefined') return;

  new Chart(c1, {
    type: 'doughnut',
    data: {
      labels: ['Manutenção', 'Poda', 'Plantio', 'Paisagismo'],
      datasets: [{ data: [45, 20, 15, 20], backgroundColor: ['#16a34a', '#4ade80', '#86efac', '#14532d'] }],
    },
    options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false },
  });

  new Chart(c2, {
    type: 'line',
    data: {
      labels: ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'],
      datasets: [
        {
          label: 'MRR',
          data: [5.6e6, 6.2e6, 6.7e6, 7.2e6, 7.9e6, 8.45e6],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,.15)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => 'MRR: ' + fmtKz(ctx.parsed.y) } },
      },
      scales: { y: { beginAtZero: false, ticks: { callback: (v) => (v / 1e6).toFixed(1) + 'M Kz' } } },
    },
  });

  initialized = true;
}
