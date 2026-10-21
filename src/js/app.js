// VerdeGest — App bootstrap
'use strict';

import { $, $$ } from './utils.js';
import { seedUsers, getSession, refreshSession, clearSession, logAudit, atualizarAtividadeSessao, togglePass, preencherDemo } from './auth.js';
import { calcular, exportarPDF } from './quote.js';
import { gerarSlots, confirmarAgenda, sincronizarOffline } from './schedule.js';
import { inicializarGraficos } from './charts.js';
import { renderAdmin, mudarAdminTab } from './admin.js';
import { renderGestor, mudarGestorTab } from './gestor.js';
import { toast, initTheme, toggleTheme, initScrollReveal, initNavbarScroll } from './ui.js';
import { DB } from './storage.js';

/* Expose globals para onclick inline */
window.abrirLogin = abrirLogin;
window.fecharLogin = fecharLogin;
window.mudarTab = mudarTab;
window.togglePass = togglePass;
window.preencherDemo = preencherDemo;
window.logout = logout;
window.protegerAcesso = protegerAcesso;
window.calcular = calcular;
window.exportarPDF = exportarPDF;
window.gerarSlots = gerarSlots;
window.confirmarAgenda = confirmarAgenda;
window.sincronizarOffline = sincronizarOffline;
window.toggleUserDropdown = toggleUserDropdown;
window.fecharDropdown = fecharDropdown;
window.mudarAdminTab = mudarAdminTab;
window.mudarGestorTab = mudarGestorTab;
window.toast = toast;
window.forcarLogout = forcarLogout;

const ROLE_ACESSO = {
  admin: ['agendamento', 'portal', 'operacoes', 'bi', 'gestor', 'admin'],
  gestor: ['agendamento', 'portal', 'operacoes', 'bi', 'gestor'],
  cliente: ['agendamento', 'portal'],
  tecnico: ['operacoes'],
};

let sessionTimerId = null;

function aplicarEstadoAuth() {
  let session = getSession();
  if (!session) session = refreshSession();

  const protectedZone = $('#protectedZone');
  const btnLoginNav = $('#btnLoginNav');
  const userMenu = $('#userMenu');

  if (session) {
    protectedZone.hidden = false;
    btnLoginNav.hidden = true;
    userMenu.hidden = false;

    const avatar = $('#userAvatar');
    avatar.textContent = session.nome.charAt(0).toUpperCase();
    avatar.style.background =
      session.role === 'admin' ? '#8b5cf6' : session.role === 'gestor' ? '#3b82f6' : '#15803d';

    $('#bannerUser').textContent = session.nome;
    $('#bannerRole').textContent = session.role.toUpperCase();
    $('#ddNome').textContent = session.nome;
    $('#ddEmail').textContent = session.email;
    $('#ddRole').textContent = session.role.toUpperCase();

    const permitido = ROLE_ACESSO[session.role] || [];
    $$('.auth-link').forEach((a) => (a.hidden = !permitido.includes(a.dataset.section)));
    $$('[data-section]').forEach((s) => (s.hidden = !permitido.includes(s.dataset.section)));
    $$('[data-admin-only]').forEach((el) => (el.hidden = session.role !== 'admin'));
    $$('[data-gestor-only]').forEach((el) => (el.hidden = !['admin', 'gestor'].includes(session.role)));

    iniciarTimerSessao();
    inicializarGraficos();

    if (session.role === 'admin') renderAdmin();
    if (['admin', 'gestor'].includes(session.role)) renderGestor();

    atualizarAtividadeSessao(session.token);
  } else {
    protectedZone.hidden = true;
    btnLoginNav.hidden = false;
    userMenu.hidden = true;
    $$('.auth-link').forEach((a) => (a.hidden = true));
    $$('[data-section]').forEach((s) => (s.hidden = true));
    clearInterval(sessionTimerId);
  }
}

window.aplicarEstadoAuth = aplicarEstadoAuth;

function iniciarTimerSessao() {
  clearInterval(sessionTimerId);
  sessionTimerId = setInterval(() => {
    const s = getSession();
    if (!s) {
      aplicarEstadoAuth();
      return;
    }
    const restante = Math.max(0, s.exp - Date.now());
    const m = Math.floor(restante / 60000);
    const sec = Math.floor((restante % 60000) / 1000);
    const el = $('#sessionTimer');
    if (el) el.textContent = `expira em ${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    if (restante === 0) {
      clearSession();
      aplicarEstadoAuth();
      toast('Sessão expirada', 'warning');
    }
  }, 1000);
}

function abrirLogin() {
  const modal = $('#loginModal');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#loginEmail')?.focus(), 100);
}

function fecharLogin() {
  $('#loginModal').hidden = true;
  document.body.style.overflow = '';
}

function mudarTab(t) {
  $$('.modal-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  const forms = { login: '#formLogin', registo: '#formRegisto', recuperar: '#formRecuperar' };
  Object.entries(forms).forEach(([k, sel]) => {
    const el = $(sel);
    if (el) el.hidden = k !== t;
  });
}

function logout() {
  if (!confirm('Terminar sessão?')) return;
  const s = getSession();
  if (s) logAudit('logout', `Logout: ${s.nome}`, s.email);
  clearSession();
  aplicarEstadoAuth();
  toast('Sessão terminada', 'info');
}

function protegerAcesso(targetId) {
  const session = getSession() || refreshSession();
  if (!session) {
    abrirLogin();
    return;
  }
  const permitido = ROLE_ACESSO[session.role] || [];
  if (!permitido.includes(targetId)) {
    toast('Sem permissão.', 'error');
    return;
  }
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
}

function toggleUserDropdown() {
  const dd = $('#userDropdown');
  dd.hidden = !dd.hidden;
  $('#userMenu button').setAttribute('aria-expanded', !dd.hidden);
}

function fecharDropdown() {
  $('#userDropdown').hidden = true;
}

function forcarLogout(token, nome) {
  if (!confirm(`Terminar sessão de ${nome}?`)) return;
  const s = DB.getSessions();
  delete s[token];
  DB.saveSessions(s);
  toast(`Sessão de ${nome} terminada`, 'success');
  if (typeof renderAdmin === 'function') renderAdmin();
}

/* Bootstrap */
(async function init() {
  await seedUsers();

  initTheme();
  initScrollReveal();
  initNavbarScroll();

  const themeBtn = $('#themeToggle');
  themeBtn?.addEventListener('click', toggleTheme);

  // Login form
  $('#formLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { fazerLogin } = await import('./auth.js');
    await fazerLogin(e.target);
  });

  // Login modal close
  $('#loginModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') fecharLogin();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharLogin();
  });

  // Logout dropdown close on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#userMenu')) fecharDropdown();
  });

  aplicarEstadoAuth();
  calcular();

  const hoje = new Date().toISOString().slice(0, 10);
  const dataAgenda = $('#dataAgenda');
  if (dataAgenda) {
    dataAgenda.value = hoje;
    gerarSlots();
  }

  // Online/offline
  window.addEventListener('online', () => toast('Ligação restabelecida', 'success'));
  window.addEventListener('offline', () => toast('Modo offline ativado', 'warning'));
})();
