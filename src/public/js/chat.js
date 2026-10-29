/*
 * Chat - SOLO FRONT-END
 * Por ahora "todos los conectados" se simula con BroadcastChannel:
 * abre la página en varias pestañas y verás los mensajes en todas.
 * Cuando hagan el back-end, se reemplaza el canal por Socket.io (ver comentarios "BACK-END").
 */
(() => {
  const $ = (id) => document.getElementById(id);

  const form = $('chatForm');
  const input = $('msgInput');
  const list = $('messages');
  const userNameEl = $('userName');
  const onlineEl = $('onlineCount');
  const modal = $('nameModal');
  const nameForm = $('nameForm');
  const nameInput = $('nameInput');

  const myId = Math.random().toString(36).slice(2);
  let username = '';

  // ---------- Canal (simula el servidor) ----------
  // BACK-END: const socket = io();
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('chat-sala-general') : null;

  function emit(type, data) {
    // BACK-END: socket.emit(type, data);
    if (channel) channel.postMessage({ type, data });
  }

  // ---------- Nombre ----------
  function setName(name) {
    const old = username;
    username = name.trim().slice(0, 24);
    userNameEl.textContent = username;
    try { localStorage.setItem('chat-username', username); } catch (e) {}
    if (old && old !== username) {
      const text = `${old} ahora se llama ${username}`;
      addSystem(text);
      emit('system', text);
    }
  }

  let saved = '';
  try { saved = localStorage.getItem('chat-username') || ''; } catch (e) {}

  if (saved) {
    setName(saved);
    announceJoin();
  } else {
    modal.showModal();
  }

  nameForm.addEventListener('submit', () => {
    const first = !username;
    if (nameInput.value.trim()) setName(nameInput.value);
    if (first) announceJoin();
    input.focus();
  });

  $('editName').addEventListener('click', () => {
    nameInput.value = username;
    modal.showModal();
  });

  function announceJoin() {
    const text = `${username} se unió al chat`;
    addSystem(text);
    emit('system', text);
  }

  // ---------- Enviar mensaje ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = input.value.trim();
    if (!mensaje) return;
    if (!username) { modal.showModal(); return; }

    const msg = {
      id: myId,
      username,
      mensaje,
      fecha: new Date().toISOString(),
    };

    addMessage(msg, true);   // aparece en MI pantalla
    emit('mensaje', msg);    // y en la de todos los conectados
    input.value = '';
    input.focus();
  });

  // ---------- Recibir ----------
  // BACK-END: socket.on('mensaje', (msg) => addMessage(msg, msg.id === myId));
  if (channel) {
    channel.onmessage = ({ data: { type, data } }) => {
      if (type === 'mensaje') addMessage(data, false);
      if (type === 'system') addSystem(data);
      if (type === 'ping') presence.set(data, Date.now());
      if (type === 'bye') presence.delete(data);
    };
  }

  // ---------- Pintar en pantalla ----------
  const hora = (iso) =>
    new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  function clearEmpty() {
    const empty = $('emptyState');
    if (empty) empty.remove();
  }

  function addMessage({ username, mensaje, fecha }, mine) {
    clearEmpty();
    const li = document.createElement('li');
    li.className = 'msg' + (mine ? ' msg--mine' : '');

    const meta = document.createElement('div');
    meta.className = 'msg__meta';

    const author = document.createElement('span');
    author.className = 'msg__author';
    author.textContent = mine ? `${username} (tú)` : username; // textContent evita inyección de HTML

    const time = document.createElement('time');
    time.className = 'msg__time';
    time.dateTime = fecha;
    time.textContent = hora(fecha);

    const text = document.createElement('p');
    text.className = 'msg__text';
    text.textContent = mensaje;

    meta.append(author, time);
    li.append(meta, text);
    list.append(li);
    list.scrollTop = list.scrollHeight;
  }

  function addSystem(text) {
    clearEmpty();
    const li = document.createElement('li');
    li.className = 'msg msg--system';
    li.textContent = text;
    list.append(li);
    list.scrollTop = list.scrollHeight;
  }

  // ---------- Conectados ----------
  // BACK-END: socket.on('usuarios', (n) => onlineEl.textContent = n);
  const presence = new Map();
  function tick() {
    emit('ping', myId);
    const now = Date.now();
    for (const [id, t] of presence) if (now - t > 5000) presence.delete(id);
    onlineEl.textContent = presence.size + 1;
  }
  setInterval(tick, 2000);
  tick();
  window.addEventListener('beforeunload', () => emit('bye', myId));

  // ---------- Publicidad rotativa ----------
  const track = $('adTrack');
  const ads = track.children.length;
  let i = 0;
  if (ads > 1) {
    setInterval(() => {
      i = (i + 1) % ads;
      track.style.transform = `translateY(-${i * 56}px)`;
    }, 4000);
  }
})();
