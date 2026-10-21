// VerdeGest — Agendamento
'use strict';

import { $, $$ } from './utils.js';
import { DB } from './storage.js';
import { toast } from './ui.js';

let slotSelecionado = null;

export function gerarSlots() {
  const container = $('#slots');
  if (!container) return;
  container.innerHTML = '';
  const date = $('#dataAgenda').value;
  if (!date) return;

  const bookings = DB.get('verdegest_bookings', {});
  const ocupados = bookings[date] || [];
  const horas = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];

  slotSelecionado = null;
  const btn = $('#btnConfirmarAgenda');
  if (btn) btn.disabled = true;

  horas.forEach((h) => {
    const disp = !ocupados.includes(h);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot';
    b.textContent = h;
    b.disabled = !disp;
    if (disp) {
      b.addEventListener('click', () => {
        $$('#slots .slot').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        slotSelecionado = h;
        atualizarResumo();
        const confirmBtn = $('#btnConfirmarAgenda');
        if (confirmBtn) confirmBtn.disabled = false;
      });
    }
    container.appendChild(b);
  });
  atualizarResumo();
}

function atualizarResumo() {
  const date = $('#dataAgenda').value || '—';
  const resumo = $('#resumoAgenda');
  if (!resumo) return;
  resumo.innerHTML = `
    <p><i class="fa-regular fa-calendar"></i> Data: ${date}</p>
    <p><i class="fa-regular fa-clock"></i> Hora: ${slotSelecionado || '—'}</p>
    <p><i class="fa-solid fa-location-dot"></i> Zona: Luanda</p>
  `;
}

export async function confirmarAgenda(btn) {
  const date = $('#dataAgenda').value;
  if (!date || !slotSelecionado) return;

  btn.disabled = true;
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> A confirmar...';

  try {
    await new Promise((r) => setTimeout(r, 700));
    const bookings = DB.get('verdegest_bookings', {});
    bookings[date] = bookings[date] || [];
    bookings[date].push(slotSelecionado);
    DB.set('verdegest_bookings', bookings);
    toast(`Reserva confirmada: ${date} às ${slotSelecionado}`, 'success');
    gerarSlots();
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

export function sincronizarOffline(btn) {
  btn.disabled = true;
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> A sincronizar...';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = original;
    toast('Dados sincronizados', 'success');
  }, 900);
}
