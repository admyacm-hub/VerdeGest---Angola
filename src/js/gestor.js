// VerdeGest — Painel Gestor (versão compacta para exemplo)
'use strict';

import { $, $$, fmtKz } from './utils.js';
import { DB } from './storage.js';
import { toast } from './ui.js';

let tabAtiva = 'teams';

export function renderGestor() {
  mudarGestorTab(tabAtiva);
}

export function mudarGestorTab(tab) {
  tabAtiva = tab;
  $$('#gestorTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.gtab === tab));
  const content = $('#gestorContent');
  if (!content) return;

  if (tab === 'teams') renderTeams(content);
  else if (tab === 'jobs') renderJobs(content);
  else if (tab === 'routes') renderRotas(content);
  else if (tab === 'stock') renderStock(content);
  else if (tab === 'kpis') renderKpis(content);
}

function renderTeams(el) {
  const teams = DB.getTeams();
  if (!teams.length) {
    el.innerHTML = '<div class="card"><p class="text-center text-muted">Sem equipas registadas.</p></div>';
    return;
  }

  el.innerHTML = `
    <div class="grid-2">
      ${teams
        .map((t) => {
          const jobs = DB.getJobs().filter((j) => j.equipa === t.id);
          return `
          <div class="card">
            <h3 class="card-title">👥 ${t.nome}</h3>
            <p class="text-sm text-muted"><i class="fa-solid fa-location-dot"></i> ${t.zona}</p>
            <p class="text-sm mt-2"><b>${t.tecnicos.length}</b> técnicos alocados</p>
            <div class="list-row mt-3"><span>Pendentes</span><b>${jobs.filter((j) => j.status === 'pendente').length}</b></div>
            <div class="list-row"><span>Em curso</span><b>${jobs.filter((j) => j.status === 'em_curso').length}</b></div>
            <div class="list-row"><span>Concluídos</span><b>${jobs.filter((j) => j.status === 'concluido').length}</b></div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

function renderJobs(el) {
  const jobs = DB.getJobs();
  if (!jobs.length) {
    el.innerHTML = '<div class="card"><p class="text-center text-muted">Sem jobs.</p></div>';
    return;
  }

  el.innerHTML = jobs
    .map(
      (j) => `
    <div class="card mb-3">
      <div class="card--row">
        <div>
          <b>${j.titulo}</b>
          <p class="text-sm text-muted">${j.cliente} · ${j.endereco}</p>
          <p class="text-xs text-muted">${j.data} ${j.hora} · ${j.duracao}min</p>
        </div>
        <span class="tag-green">${j.status}</span>
      </div>
    </div>
  `
    )
    .join('');
}

function renderRotas(el) {
  el.innerHTML = `
    <div class="card card--info">
      <b>🗺️ Otimização TSP</b>
      <p class="text-sm text-muted mt-2">Agrupamento por zona ativo. Economia estimada: 18 km / 1h15.</p>
      <button class="btn btn-primary btn-sm mt-3" onclick="toast('Rotas otimizadas','success')">Otimizar agora</button>
    </div>
  `;
}

function renderStock(el) {
  const stock = DB.getStock();
  el.innerHTML = `
    <div class="card">
      ${stock
        .map(
          (s) => `
        <div class="list-row">
          <span>${s.nome}</span>
          <b class="${s.qtd <= s.min ? 'tag-red' : 'tag-green'}">${s.qtd} ${s.unidade}</b>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderKpis(el) {
  const jobs = DB.getJobs();
  const concluidos = jobs.filter((j) => j.status === 'concluido').length;
  const taxa = jobs.length ? Math.round((concluidos / jobs.length) * 100) : 0;

  el.innerHTML = `
    <div class="grid-4">
      <div class="card card--kpi">
        <p class="kpi-label">Taxa conclusão</p>
        <p class="kpi-value">${taxa}%</p>
      </div>
      <div class="card card--kpi">
        <p class="kpi-label">Total jobs</p>
        <p class="kpi-value">${jobs.length}</p>
      </div>
      <div class="card card--kpi">
        <p class="kpi-label">Concluídos</p>
        <p class="kpi-value">${concluidos}</p>
      </div>
      <div class="card card--kpi">
        <p class="kpi-label">Em curso</p>
        <p class="kpi-value">${jobs.filter((j) => j.status === 'em_curso').length}</p>
      </div>
    </div>
  `;
}
