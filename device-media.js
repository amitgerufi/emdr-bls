// ══════════════════════════════════════════
//  Media on this device — the patient's own videos, images and music.
//
//  Files are kept in this browser's IndexedDB, on this device only — nothing is uploaded.
//  What is shared with the therapist's dashboard is just a small list (name, type, length and a
//  tiny thumbnail), so the therapist can pick a file as the background or the music mid-session.
//  Files are added with a normal file picker, so on a Quest they can come from the headset's
//  Downloads folder (for example a file saved from Google Drive in the headset browser).
// ══════════════════════════════════════════

const DB_NAME = 'emdr-bls-media';
const DB_VERSION = 1;
const MAX_IMAGE_WIDTH = 4096;     // wider photos are scaled down when added (GPU memory on a headset)
const THUMB_WIDTH = 240;
const PROBE_TIMEOUT_MS = 12000;
const MAX_PUBLISHED_ITEMS = 60;
const UNSUPPORTED = "This device can't play that file. Try MP4 (H.264) video, JPG/PNG images or MP3/M4A music.";

// ── small helpers ───────────────────────────────────────────────────────────

function h(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

function kindOf(file) {
  const t = (file.type || '').toLowerCase();
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('audio/')) return 'audio';
  const n = file.name.toLowerCase();   // some file pickers report no type at all
  if (/\.(mp4|m4v|webm|mov)$/.test(n)) return 'video';
  if (/\.(jpe?g|png|webp|gif|avif)$/.test(n)) return 'image';
  if (/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac)$/.test(n)) return 'audio';
  return null;
}

const fmtTime = s => { const t = Math.round(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };   // same rounding as the dashboard
const fmtSize = b => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.max(0.1, b / 1e6).toFixed(1)} MB`);

function metaOf(it) {
  const kind = { video: 'Video', image: 'Image', audio: 'Music' }[it.kind];
  const detail = it.kind === 'image' ? `${it.w}×${it.h}` : it.dur ? fmtTime(it.dur) : '';
  return [kind, detail, fmtSize(it.size)].filter(Boolean).join(' · ');
}

// ── IndexedDB (two stores: small metadata records, and the file blobs) ─────

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('items', { keyPath: 'id' });
      req.result.createObjectStore('blobs', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const request = r => new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
const finished = tx => new Promise((resolve, reject) => {
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error);
  tx.onabort = () => reject(tx.error);
});

// ── checking that this device can really play a file, and reading its details ──

function waitFor(el, okEvent, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('timeout')), ms);
    const onOk = () => finish();
    const onErr = () => finish(new Error('cannot be played'));
    function finish(err) {
      clearTimeout(timer);
      el.removeEventListener(okEvent, onOk);
      el.removeEventListener('error', onErr);
      if (err) reject(err); else resolve();
    }
    el.addEventListener(okEvent, onOk, { once: true });
    el.addEventListener('error', onErr, { once: true });
  });
}

function thumbOf(source, w, h) {
  const c = document.createElement('canvas');
  c.width = THUMB_WIDTH;
  c.height = Math.max(1, Math.round(THUMB_WIDTH * h / w));
  c.getContext('2d').drawImage(source, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.6);
}

async function probeVideo(url) {
  const v = document.createElement('video');
  v.muted = true; v.preload = 'auto'; v.playsInline = true;
  v.src = url;
  try {
    await waitFor(v, 'loadeddata', PROBE_TIMEOUT_MS);
    if (!v.videoWidth || !v.videoHeight) throw new Error('no picture');
    const dur = Number.isFinite(v.duration) ? v.duration : 0;
    const at = Math.min(1, dur / 2);
    if (at > 0.05) {                          // a frame a little way in makes a better thumbnail than the first one
      v.currentTime = at;
      try { await waitFor(v, 'seeked', 5000); } catch { /* the first frame will do */ }
    }
    return { w: v.videoWidth, h: v.videoHeight, dur, thumb: thumbOf(v, v.videoWidth, v.videoHeight) };
  } finally {
    v.removeAttribute('src'); v.load();
  }
}

async function probeImage(url, file) {
  const img = new Image();
  img.src = url;
  await img.decode();                          // rejects when the picture can't be decoded
  let blob = file, w = img.naturalWidth, h = img.naturalHeight;
  if (w > MAX_IMAGE_WIDTH) {                   // keeps huge panoramas from exhausting the headset's memory
    const c = document.createElement('canvas');
    c.width = MAX_IMAGE_WIDTH;
    c.height = Math.round(h * MAX_IMAGE_WIDTH / w);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.9));
    if (!blob) throw new Error('cannot be resized');
    w = c.width; h = c.height;
  }
  return { blob, w, h, thumb: thumbOf(img, w, h) };
}

async function probeAudio(url) {
  const a = document.createElement('audio');
  a.preload = 'metadata';
  a.src = url;
  try {
    await waitFor(a, 'loadedmetadata', PROBE_TIMEOUT_MS);
    return { dur: Number.isFinite(a.duration) ? a.duration : 0 };
  } finally {
    a.removeAttribute('src'); a.load();
  }
}

// ── the library ─────────────────────────────────────────────────────────────

export function createDeviceMedia({ onChange = () => {} } = {}) {
  const supported = typeof indexedDB !== 'undefined';
  let dbPromise = null;
  let items = [];                              // metadata records, newest first
  let panel = null;                            // DOM of the panel, built the first time it is opened
  let busy = false;

  const getDb = () => dbPromise || (dbPromise = openDb());

  const ready = (async () => {
    if (!supported) return;
    try {
      const db = await getDb();
      const all = await request(db.transaction('items').objectStore('items').getAll());
      items = all.sort((a, b) => b.added - a.added);
    } catch (err) {
      console.warn('Device media is unavailable:', err);
      items = [];
    }
  })();

  function changed() {
    renderList();
    onChange(items);
  }

  const get = id => items.find(i => i.id === id);

  async function getBlob(id) {
    await ready;
    try {
      const db = await getDb();
      const rec = await request(db.transaction('blobs').objectStore('blobs').get(id));
      return rec ? rec.blob : null;
    } catch { return null; }
  }

  // what the dashboard sees: id → small record (no file data, just a thumbnail)
  function publicList() {
    const out = {};
    for (const it of items.slice(0, MAX_PUBLISHED_ITEMS)) {
      out[it.id] = {
        kind: it.kind, name: it.name, size: it.size, added: it.added, proj: it.proj,
        ...(it.dur ? { dur: Math.round(it.dur) } : {}),
        ...(it.w ? { w: it.w, h: it.h } : {}),
        ...(it.thumb ? { thumb: it.thumb } : {}),
      };
    }
    return out;
  }

  async function ensureSpace(bytes) {
    if (!navigator.storage || !navigator.storage.estimate) return;
    const { quota = 0, usage = 0 } = await navigator.storage.estimate();
    if (quota && quota - usage < bytes * 1.1 + 5e6) throw new Error('Not enough free space on this device');
  }

  async function addFile(file) {
    if (!supported) throw new Error('Storage is not available in this browser mode');
    await ready;
    const kind = kindOf(file);
    if (!kind) throw new Error('Not a video, image or music file');
    const name = file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 80) || 'Untitled';
    if (items.some(i => i.name === name && i.size === file.size)) throw new Error('Already added');
    await ensureSpace(file.size);

    const url = URL.createObjectURL(file);
    let meta, blob = file;
    try {
      if (kind === 'video') meta = await probeVideo(url);
      else if (kind === 'image') { const p = await probeImage(url, file); blob = p.blob; meta = { w: p.w, h: p.h, thumb: p.thumb }; }
      else meta = await probeAudio(url);
    } catch {
      throw new Error(UNSUPPORTED);
    } finally {
      URL.revokeObjectURL(url);
    }

    let id;
    do { id = (Math.random().toString(36) + '00000000').slice(2, 10); } while (get(id));
    const item = {
      id, kind, name, size: blob.size, mime: blob.type || file.type || '', added: Date.now(),
      ...meta,
      proj: meta.w && Math.abs(meta.w / meta.h - 2) < 0.08 ? '360' : 'flat',   // 2:1 pictures are usually 360° panoramas
    };

    const db = await getDb();
    const tx = db.transaction(['items', 'blobs'], 'readwrite');
    tx.objectStore('blobs').put({ id, blob });
    tx.objectStore('items').put(item);
    try { await finished(tx); }
    catch (err) { throw new Error(err && err.name === 'QuotaExceededError' ? 'Not enough free space on this device' : 'Could not save the file'); }

    items.unshift(item);
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});   // ask the browser not to evict the library
    changed();
    return item;
  }

  async function remove(id) {
    const db = await getDb();
    const tx = db.transaction(['items', 'blobs'], 'readwrite');
    tx.objectStore('items').delete(id);
    tx.objectStore('blobs').delete(id);
    await finished(tx);
    items = items.filter(i => i.id !== id);
    changed();
  }

  async function addFiles(files) {
    const errors = [];
    let added = 0;
    for (let i = 0; i < files.length; i++) {
      setStatus(`Adding ${files[i].name} (${i + 1}/${files.length})…`);
      try { await addFile(files[i]); added++; }
      catch (err) { errors.push(`${files[i].name}: ${err.message}`); }
    }
    return { added, errors };
  }

  async function handleFiles(files) {
    if (busy || !files.length) return;
    busy = true;
    try {
      const { added, errors } = await addFiles(files);
      const lines = added ? [`Added ${added} file${added === 1 ? '' : 's'}.`] : [];
      setStatus([...lines, ...errors].join('\n'), errors.length > 0);
    } finally {
      busy = false;
    }
  }

  // ── the panel ──
  function setStatus(text, isError = false) {
    if (!panel) return;
    panel.status.textContent = text;
    panel.status.classList.toggle('err', isError);
  }

  async function showSpace() {
    if (!panel || !navigator.storage || !navigator.storage.estimate) return;
    try {
      const { quota = 0, usage = 0 } = await navigator.storage.estimate();
      if (quota) panel.space.textContent = `Free space on this device: ${fmtSize(Math.max(0, quota - usage))}`;
    } catch { /* not important */ }
  }

  function renderList() {
    if (!panel) return;
    panel.list.replaceChildren();
    if (!items.length) {
      panel.list.append(h('div', 'dm-empty', 'Nothing here yet. Tap “Add files” to choose videos, images or music from this device.'));
      return;
    }
    for (const it of items) {
      const row = h('div', 'dm-row');
      const thumb = h('div', 'dm-thumb');
      if (it.thumb) thumb.style.backgroundImage = `url("${it.thumb}")`; else thumb.textContent = '♪';
      const info = h('div', 'dm-info');
      info.append(h('div', 'dm-name', it.name), h('div', 'dm-meta', metaOf(it)));
      const del = h('button', 'dm-del', 'Delete');
      del.type = 'button';
      let armed = 0;                           // two taps are needed, so a stray tap can't delete a file
      del.addEventListener('click', () => {
        if (!armed) {
          del.textContent = 'Tap again';
          armed = setTimeout(() => { armed = 0; del.textContent = 'Delete'; }, 3000);
          return;
        }
        clearTimeout(armed);
        remove(it.id).catch(() => setStatus('Could not delete the file', true));
      });
      row.append(thumb, info, del);
      panel.list.append(row);
    }
  }

  function injectStyles() {
    if (document.getElementById('dm-style')) return;
    const s = document.createElement('style');
    s.id = 'dm-style';
    s.textContent = `
      .dm-overlay { position: fixed; inset: 0; z-index: 60; display: none; align-items: center; justify-content: center;
        background: rgba(4,10,16,0.82); font-family: Arial, sans-serif; direction: ltr; }
      .dm-overlay.open { display: flex; }
      .dm-card { width: min(92vw, 560px); max-height: 86vh; display: flex; flex-direction: column; color: #fff;
        background: #11222e; border: 1px solid #ffffff1a; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
      .dm-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 6px; }
      .dm-head h2 { margin: 0; font-size: 18px; font-weight: 700; }
      .dm-x { background: none; border: none; color: #9bb4c0; font-size: 22px; cursor: pointer; padding: 4px 8px; }
      .dm-note { margin: 0; padding: 0 20px 12px; font-size: 12.5px; line-height: 1.5; color: #9bb4c0; }
      .dm-list { flex: 1; min-height: 60px; overflow-y: auto; padding: 0 12px; }
      .dm-row { display: flex; align-items: center; gap: 12px; padding: 8px; }
      .dm-row + .dm-row { border-top: 1px solid #ffffff10; }
      .dm-thumb { flex: none; width: 64px; height: 36px; border-radius: 6px; background: #0a1622 center / cover no-repeat;
        display: flex; align-items: center; justify-content: center; color: #5fa8c4; font-size: 16px; }
      .dm-info { flex: 1; min-width: 0; }
      .dm-name { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dm-meta { margin-top: 2px; font-size: 11.5px; color: #9bb4c0; }
      .dm-del { flex: none; border: 1px solid #ffffff2a; background: transparent; color: #f87171; border-radius: 10px;
        padding: 8px 12px; font-size: 12.5px; cursor: pointer; }
      .dm-empty { padding: 22px 12px; text-align: center; font-size: 13px; line-height: 1.5; color: #9bb4c0; }
      .dm-foot { display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 18px; }
      .dm-add { display: block; text-align: center; padding: 14px 0; border-radius: 12px; background: #0891b2; color: #fff;
        font-size: 15px; font-weight: 700; cursor: pointer; }
      .dm-status { min-height: 16px; font-size: 12.5px; color: #9bb4c0; white-space: pre-line; }
      .dm-status.err { color: #f87171; }
      .dm-space { font-size: 11.5px; color: #6d8794; }
    `;
    document.head.append(s);
  }

  function buildPanel() {
    injectStyles();
    const overlay = h('div', 'dm-overlay');
    const card = h('div', 'dm-card');
    const head = h('div', 'dm-head');
    const close = h('button', 'dm-x', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    head.append(h('h2', '', 'Media on this device'), close);
    const note = h('p', 'dm-note', 'Your own videos, images and music, kept on this device only — nothing is uploaded. Your therapist can use them as the background or the music during a session.');
    const list = h('div', 'dm-list');
    const foot = h('div', 'dm-foot');
    const add = h('label', 'dm-add', 'Add files');
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept = 'video/*,image/*,audio/*'; input.hidden = true;
    add.append(input);
    const status = h('div', 'dm-status');
    const space = h('div', 'dm-space');
    foot.append(add, status, space);
    card.append(head, note, list, foot);
    overlay.append(card);
    document.body.append(overlay);

    close.addEventListener('click', closePanel);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
    input.addEventListener('change', () => { const files = Array.from(input.files || []); input.value = ''; handleFiles(files); });
    overlay.addEventListener('dragover', e => e.preventDefault());                       // dropping files works on a computer
    overlay.addEventListener('drop', e => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files || [])); });

    panel = { overlay, list, status, space, input };
  }

  async function openPanel() {
    if (!panel) buildPanel();
    await ready;
    setStatus(supported ? '' : 'Storage is not available in this browser mode.', !supported);
    panel.overlay.classList.add('open');
    renderList();
    showSpace();
  }

  function closePanel() {
    if (panel) panel.overlay.classList.remove('open');
  }

  return { supported, ready, get, getBlob, publicList, addFiles, remove, openPanel, closePanel, list: () => items.slice() };
}
