import { io } from 'socket.io-client';

// ── Single shared Socket.IO connection for the whole app ─────────────────
// Chat.js and the global notification listener (DashboardLayout) both use
// this one socket, so unread counts keep working on every dashboard page.
export const socket = io('http://localhost:5000', {
  transports:  ['websocket'],
  autoConnect: false,
});

let registeredUserId = null;

export function connectSocket(userId) {
  if (!userId) return;
  registeredUserId = String(userId);
  if (!socket.connected) socket.connect();
  socket.emit('user-online', registeredUserId);
}

// Re-announce presence after any reconnect
socket.on('connect', () => {
  if (registeredUserId) socket.emit('user-online', registeredUserId);
});

// ── Unread message store ──────────────────────────────────────────────────
// Shape in localStorage: { "group": 2, "<userId>": 1, ... }
const UNREAD_KEY = 'chatUnread';

export function getUnread() {
  try { return JSON.parse(localStorage.getItem(UNREAD_KEY) || '{}'); }
  catch { return {}; }
}

function saveUnread(counts) {
  localStorage.setItem(UNREAD_KEY, JSON.stringify(counts));
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  window.dispatchEvent(new CustomEvent('chat-unread-update', { detail: { counts, total } }));
}

export function incrementUnread(key) {
  const counts = getUnread();
  counts[key] = (counts[key] || 0) + 1;
  saveUnread(counts);
}

export function clearUnread(key) {
  const counts = getUnread();
  if (counts[key]) {
    delete counts[key];
    saveUnread(counts);
  }
}

export function getUnreadTotal() {
  return Object.values(getUnread()).reduce((s, n) => s + n, 0);
}
