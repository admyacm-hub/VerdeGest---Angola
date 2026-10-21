// VerdeGest — Storage layer (substituir por API em produção)
'use strict';

const KEYS = {
  users: 'verdegest_users',
  sessions: 'verdegest_active_sessions',
  audit: 'verdegest_audit_log',
  teams: 'verdegest_teams',
  jobs: 'verdegest_jobs',
  stock: 'verdegest_stock',
  equip: 'verdegest_equipment',
  bookings: 'verdegest_bookings',
  reset: 'verdegest_reset',
  attempts: 'verdegest_attempts',
  lang: 'verdegest_lang',
  theme: 'verdegest_theme',
};

export const Storage = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  },
  remove: (key) => localStorage.removeItem(key),
};

export const KEYS_MAP = KEYS;

export const DB = {
  getUsers: () => Storage.get(KEYS.users, {}),
  saveUsers: (u) => Storage.set(KEYS.users, u),
  getSessions: () => Storage.get(KEYS.sessions, {}),
  saveSessions: (s) => Storage.set(KEYS.sessions, s),
  getAudit: () => Storage.get(KEYS.audit, []),
  saveAudit: (a) => Storage.set(KEYS.audit, a.slice(0, 200)),
  getTeams: () => Storage.get(KEYS.teams, []),
  saveTeams: (t) => Storage.set(KEYS.teams, t),
  getJobs: () => Storage.get(KEYS.jobs, []),
  saveJobs: (j) => Storage.set(KEYS.jobs, j),
  getStock: () => Storage.get(KEYS.stock, []),
  saveStock: (s) => Storage.set(KEYS.stock, s),
  getEquip: () => Storage.get(KEYS.equip, []),
  saveEquip: (e) => Storage.set(KEYS.equip, e),
};
