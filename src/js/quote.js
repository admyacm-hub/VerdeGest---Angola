// VerdeGest — Orçamentador Inteligente
'use strict';

import { $, fmtKz } from './utils.js';

const SERVICOS = {
  manutencao: { horasPorM2: 0.05, custoHora: 4500, materialM2: 80 },
  poda: { horasPorM2: 0.10, custoHora: 5500, materialM2: 30 },
  plantio: { horasPorM2: 0.15, custoHora: 5000, materialM2: 240 },
  paisagismo: { horasPorM2: 0.30, custoHora: 7000, materialM2: 800 },
};

const FREQ_DESC = { semanal: 0.85, quinzenal: 0.92, mensal: 1.0 };
const MARGEM = 0.35;

export function calcular() {
  const area = +$('#area').value;
  const tipo = $('#servico').value;
  const terreno = $('#terreno').value;
  const acesso = $('#acesso').value;
  const freq = $('#frequencia').value;
  const prov = $('#provincia');
  const fatorLog = +prov.options[prov.selectedIndex].dataset.fator;

  const s = SERVICOS[tipo];
  const horas = area * s.horasPorM2;
  let complexity = 1.0;
  if (terreno === 'declive') complexity += 0.3;
  if (terreno === 'pedras') complexity += 0.5;
  if (acesso === 'dificil') complexity += 0.2;

  const labor = horas * s.custoHora * complexity;
  const materials = area * s.materialM2 * complexity;
  const baseCost = (labor + materials) * fatorLog;
  let final = baseCost * (1 + MARGEM) * FREQ_DESC[freq];
  final = Math.round(final / 1000) * 1000 - 100;

  const priceEl = $('#precoFinal');
  priceEl.style.transform = 'scale(1.08)';
  setTimeout(() => (priceEl.style.transform = 'scale(1)'), 200);

  priceEl.textContent = fmtKz(final);
  $('#precoInfo').textContent = `${tipo[0].toUpperCase() + tipo.slice(1)} · ${freq} · ${area} m² · ${prov.value}`;
  $('#custoMao').textContent = fmtKz(labor * fatorLog);
  $('#custoInsumos').textContent = fmtKz(materials * fatorLog);
  $('#fatorLog').textContent = '×' + fatorLog.toFixed(2).replace('.', ',');
  $('#horas').textContent = horas.toFixed(1) + ' h';
  $('#margem').textContent = fmtKz(final - baseCost);

  sessionStorage.setItem(
    'verdegest_last_quote',
    JSON.stringify({ area, tipo, terreno, acesso, freq, provincia: prov.value, preco: final, horas })
  );
}

export function exportarPDF() {
  const q = JSON.parse(sessionStorage.getItem('verdegest_last_quote') || '{}');
  if (!q.preco) {
    alert('Calcule primeiro.');
    return;
  }
  const html = `<html><head><title>Orçamento</title>
    <style>body{font-family:Arial;padding:2rem}h1{color:#15803d}table{width:100%;border-collapse:collapse;margin:1rem 0}td,th{border:1px solid #ddd;padding:.5rem}.price{font-size:1.8rem;font-weight:800;color:#15803d}</style>
    </head><body><h1>🌱 VerdeGest Angola</h1><h2>Orçamento</h2>
    <p>Data: ${new Date().toLocaleDateString('pt-AO')}</p>
    <table><tr><th>Área</th><td>${q.area} m²</td></tr>
    <tr><th>Serviço</th><td>${q.tipo}</td></tr>
    <tr><th>Terreno</th><td>${q.terreno}</td></tr>
    <tr><th>Acesso</th><td>${q.acesso}</td></tr>
    <tr><th>Frequência</th><td>${q.freq}</td></tr>
    <tr><th>Província</th><td>${q.provincia}</td></tr></table>
    <p class="price">Total: ${fmtKz(q.preco)}</p></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}
