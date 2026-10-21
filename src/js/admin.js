// VerdeGest — Painel Admin (versão compacta)
'use strict';

import { $, $$ } from './utils.js';
import { DB } from './storage.js';
import { toast } from './ui.js';

let tabAtiva = 'sessions';

export function renderAdmin() {
  mudarAdminTab(tabAtiva);
}

export function mudarAdminTab(tab) {
  tabAtiva = tab;
  $$('#adminTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.atab === tab));
  const content = $('#adminContent');
  if (!content) return;

  if (tab === 'sessions') renderSessions(content);
  else if (tab === 'users') renderUsers(content);
  else if (tab === 'audit') renderAudit(content);
}

function renderSessions(el) {
  const sessions = DB.getSessions();
  const lista = Object.values(sessions);
  el.innerHTML = `
    <div class="card">
      <h3 class="card-title">🟢 Sessões ativas (${lista.length})</h3>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Utilizador</th><th>Role</th><th>Dispositivo</th><th>Ações</th></tr></thead>
          <tbody>
            ${lista
              .map(
                (s) => `
              <tr>
                <td><b>${s.nome}</b><br><span class="text-xs text-muted">${s.email}</span></td>
                <td>${s.role}</td>
                <td>${s.device}</td>
                <td><button class="btn btn-danger btn-sm" onclick="forcarLogout('${s.token}','${s.nome}')">Forçar saída</button></td>
              </tr>
            `
              )
              .join('') || '<tr><td colspan="4" class="text-center text-muted">Sem sessões ativas.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderUsers(el) {
  const users = DB.getUsers();
  el.innerHTML = `
    <div class="card">
      <h3 class="card-title">👥 Utilizadores (${Object.keys(users).length})</h3>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            ${Object.values(users)
              .map(
                (u) => `
              <tr>
                <td><b>${u.nome}</b></td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.status === 'banned' ? '🚫 Banido' : '✅ Ativo'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAudit(el) {
  const log = DB.getAudit().slice(0, 50);
  el.innerHTML = `
    <div class="card">
      <h3 class="card-title">📜 Auditoria (últimos 50 eventos)</h3>
      ${log
        .map(
          (a) => `
        <div class="list-row">
          <span>${a.details}</span>
          <span class="text-xs text-muted">${new Date(a.timestamp).toLocaleString('pt-AO')}</span>
        </div>
      `
        )
        .join('') || '<p class="text-center text-muted">Sem eventos.</p>'}
    </div>
  `;
}
