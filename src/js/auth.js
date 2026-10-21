// VerdeGest — Autenticação
'use strict';

import { $, $$, sha256, gerarToken, detectDevice } from './utils.js';
import { DB, Storage, KEYS_MAP } from './storage.js';
import { toast } from './ui.js';

const SESSION_KEY = 'verdegest_session';
const REFRESH_KEY = 'verdegest_refresh';
const SESSION_DURATION = 30 * 60 * 1000;

/* Seed users */
export async function seedUsers() {
  if (Object.keys(DB.getUsers()).length > 0) return;

  const seed = [
    { email: 'admin@verdegest.ao', nome: 'Administrador', role: 'admin', senha: 'admin123', status: 'active' },
    { email: 'gestor@verdegest.ao', nome: 'Gestor Operacional', role: 'gestor', senha: 'gestor123', status: 'active' },
    { email: 'cliente@verdegest.ao', nome: 'Cliente Demo', role: 'cliente', senha: 'cliente123', status: 'active' },
    { email: 'tecnico@verdegest.ao', nome: 'Técnico Campo', role: 'tecnico', senha: 'tecnico123', status: 'active' },
  ];

  const users = {};
  for (const u of seed) {
    users[u.email] = {
      ...u,
      senha: await sha256(u.senha),
      createdAt: Date.now(),
      lastLogin: null,
    };
  }
  DB.saveUsers(users);
}

/* Session */
export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s.exp < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  const session = {
    token: gerarToken(),
    email: user.email,
    nome: user.nome,
    role: user.role,
    exp: Date.now() + SESSION_DURATION,
    createdAt: Date.now(),
    refresh: gerarToken(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(
    REFRESH_KEY,
    JSON.stringify({ email: user.email, token: session.refresh, exp: Date.now() + 7 * 24 * 3600 * 1000 })
  );
  registarSessaoAtiva(session);
  return session;
}

export function refreshSession() {
  const r = JSON.parse(localStorage.getItem(REFRESH_KEY) || 'null');
  if (!r || r.exp < Date.now()) return null;
  const users = DB.getUsers();
  const u = users[r.email];
  if (!u || u.status === 'banned') return null;
  return saveSession(u);
}

export function clearSession() {
  const s = getSession();
  if (s) removerSessaoAtiva(s.token);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/* Active sessions */
export function registarSessaoAtiva(session) {
  const all = DB.getSessions();
  all[session.token] = {
    token: session.token,
    email: session.email,
    nome: session.nome,
    role: session.role,
    createdAt: session.createdAt || Date.now(),
    exp: session.exp,
    lastActivity: Date.now(),
    userAgent: navigator.userAgent,
    device: detectDevice(),
    ip: `197.229.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)} (sim.)`,
  };
  DB.saveSessions(all);
}

export function removerSessaoAtiva(token) {
  const all = DB.getSessions();
  delete all[token];
  DB.saveSessions(all);
}

export function atualizarAtividadeSessao(token) {
  const all = DB.getSessions();
  if (all[token]) {
    all[token].lastActivity = Date.now();
    DB.saveSessions(all);
  }
}

/* Audit */
export function logAudit(action, details, actor = null) {
  const log = DB.getAudit();
  log.unshift({
    id: Date.now() + Math.random(),
    action,
    details,
    actor: actor || 'system',
    actorEmail: actor,
    timestamp: Date.now(),
  });
  DB.saveAudit(log);
}

/* Login */
export async function fazerLogin(form) {
  const btn = $('#btnSubmitLogin');
  const errBox = $('#loginError');
  if (errBox) errBox.hidden = true;

  const email = $('#loginEmail').value.trim().toLowerCase();
  const pass = $('#loginPass').value;

  let invalid = false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    setFieldError('loginEmail', 'E-mail inválido');
    invalid = true;
  } else setFieldError('loginEmail', '');

  if (!pass) {
    setFieldError('loginPass', 'Obrigatório');
    invalid = true;
  } else setFieldError('loginPass', '');

  if (invalid) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> A verificar...';

  try {
    const users = DB.getUsers();
    const u = users[email];
    const hash = await sha256(pass);

    if (!u || u.senha !== hash) throw new Error('Credenciais incorretas.');
    if (u.status === 'banned') throw new Error('Conta banida.');

    u.lastLogin = Date.now();
    DB.saveUsers(users);

    saveSession(u);
    logAudit('login', `Login: ${u.nome} (${u.role})`, u.email);

    if (typeof window.fecharLogin === 'function') window.fecharLogin();
    if (typeof window.aplicarEstadoAuth === 'function') window.aplicarEstadoAuth();
    toast(`Bem-vindo, ${u.nome}!`, 'success');
  } catch (e) {
    if (errBox) {
      errBox.textContent = e.message;
      errBox.hidden = false;
    }
    const card = $('#loginCard');
    card?.classList.add('shake');
    setTimeout(() => card?.classList.remove('shake'), 400);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
  }
}

/* Helpers */
export function setFieldError(id, msg) {
  const input = document.getElementById(id);
  const box = document.querySelector(`[data-error-for="${id}"]`);
  if (input) input.classList.toggle('error', !!msg);
  if (box) box.textContent = msg || '';
}

export function preencherDemo(tipo) {
  const map = {
    admin: ['admin@verdegest.ao', 'admin123'],
    gestor: ['gestor@verdegest.ao', 'gestor123'],
    tecnico: ['tecnico@verdegest.ao', 'tecnico123'],
  };
  const [e, p] = map[tipo] || ['', ''];
  $('#loginEmail').value = e;
  $('#loginPass').value = p;
  setFieldError('loginEmail', '');
  setFieldError('loginPass', '');
}

export function togglePass(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp || !icon) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fa-regular fa-eye-slash';
  } else {
    inp.type = 'password';
    icon.className = 'fa-regular fa-eye';
  }
}
