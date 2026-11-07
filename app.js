/* Gym Routine PWA — app logic. Routine + movement patterns live in data.js (P, DAYS, X). */
'use strict';
for (const k in P) P[k].B = { ...P[k].A, ...P[k].B };

/* ================= utils ================= */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dk = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseDk = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekKeyOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const g = (x.getDay() + 6) % 7; return dk(addDays(x, -g)); };
const monthKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1);
const fmtD = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString(undefined, o);
const fmtMonth = k => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); };
const fmtT = s => Math.floor(s / 60) + ':' + pad(Math.max(0, Math.floor(s % 60)));
const exId = ex => ex.n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const nums = r => (String(r).match(/\d+/g) || []).map(Number);
const repTop = r => /fail/i.test(r) ? 0 : (nums(r).pop() || 0);
const repLow = r => nums(r)[0] || 0;
const clone = o => JSON.parse(JSON.stringify(o));
let toastT;
function toast(msg, ms = 2600) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }

/* ================= state ================= */
const PROFILES = {
  king: { name: 'King', label: "KING'S", days: DAYS_KING, tagline: 'Strength & size',
    th: { bg: '#0a0a0a', card: '#141310', card2: '#1c1a15', line: '#2f2a1e', txt: '#f5efe0', mut: '#a39a85', acc: '#d4af37', acc2: '#f0cf6a', onacc: '#17120a', dim: '#5c5544', limb: '#8f866f', navbg: 'rgba(12,11,9,.97)', bannerbg: 'linear-gradient(135deg,#2a2210,#15120b)', bannerline: '#4d3f1c' } },
  qxeen: { name: 'Qxeen', label: "QXEEN'S", days: DAYS_QXEEN, tagline: 'Glutes, tone & burn',
    th: { bg: '#120a1c', card: '#1d122c', card2: '#271839', line: '#3a2654', txt: '#f7f0ff', mut: '#ab98c6', acc: '#b45cff', acc2: '#dba8ff', onacc: '#ffffff', dim: '#5e4b7a', limb: '#9b86b8', navbg: 'rgba(20,11,32,.97)', bannerbg: 'linear-gradient(135deg,#3a1d5c,#1f1131)', bannerline: '#5b3488' } }
};
let PROF = 'king', DAYS = DAYS_KING, TH = PROFILES.king.th, KEY = 'gym.v2.king';
const LWS = () => 'gym.lastWeekSeen.' + PROF;
const blank = () => ({ v: 2, settings: { unit: 'lb', swaps: {}, targets: {}, tempoScale: 1, wake: true, u: 0 }, logs: {}, body: {}, photos: {}, updated: 0 });
let S = blank();
function loadState() {
  S = blank();
  try {
    if (PROF === 'king' && !localStorage.getItem(KEY) && localStorage.getItem('gym.v2')) { // migrate pre-profile data to King
      localStorage.setItem(KEY, localStorage.getItem('gym.v2')); localStorage.removeItem('gym.v2');
      if (localStorage.getItem(LWS())) { localStorage.setItem(LWS(), localStorage.getItem(LWS())); localStorage.removeItem('gym.lastWeekSeen'); }
    }
    const r = localStorage.getItem(KEY); if (r) { const d = JSON.parse(r); S = { ...blank(), ...d, settings: { ...blank().settings, ...(d.settings || {}) } }; }
  } catch (e) { }
}
const todayIdx = () => { const g = new Date().getDay(); return g >= 1 && g <= 5 ? g - 1 : 0; };
let now = new Date(), curWeek = weekKeyOf(now);
let cur = todayIdx();
let tab = 'workout';
const fmtSet = (timed, s) => timed ? (s.r >= 120 ? Math.round(s.r / 60) + ' min' : s.r + 's') + (s.w ? ' @' + s.w : '') : `${s.w || 'BW'}×${s.r}`;

function persist() { S.updated = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Phone storage is full. Export a backup!'); } }
function save() { persist(); scheduleSync(); }
function touchSettings() { S.settings.u = Date.now(); save(); }

/* routine access */
const slotKey = (di, si) => di + '-' + si;
const exOf = (di, si) => { const sl = DAYS[di].slots[si]; const i = S.settings.swaps[slotKey(di, si)] || 0; return sl.opts[Math.min(i, sl.opts.length - 1)]; };
const entry = (wk, di, id) => (((S.logs[wk] || {})[di] || {})[id]) || null;
const setsOf = (wk, di, id) => (entry(wk, di, id) || {}).sets || [];
function ensureEntry(wk, di, ex) {
  const id = exId(ex);
  S.logs[wk] = S.logs[wk] || {}; S.logs[wk][di] = S.logs[wk][di] || {};
  return S.logs[wk][di][id] = S.logs[wk][di][id] || { n: ex.n, sets: [], u: 0 };
}
/* all past sessions for an exercise, oldest → newest */
function sessions(id) {
  const out = [];
  for (const wk in S.logs) for (const di in S.logs[wk]) {
    const e = S.logs[wk][di][id]; if (!e) continue;
    const sets = (e.sets || []).filter(Boolean); if (!sets.length) continue;
    const t = Math.min(...sets.map(s => s.t || parseDk(wk).getTime()));
    out.push({ wk, di: +di, t, date: dk(new Date(t)), sets, timed: !!e.timed });
  }
  return out.sort((a, b) => a.t - b.t);
}
const dayDone = (wk, di) => DAYS[di].slots.every((sl, si) => setsOf(wk, di, exId(exOf(di, si))).filter(Boolean).length >= sl.sets);
const dayAny = (wk, di) => { const d = (S.logs[wk] || {})[di]; return !!d && Object.values(d).some(e => (e.sets || []).some(Boolean)); };
const unit = () => S.settings.unit;
const inc = () => unit() === 'kg' ? 2.5 : 5;

/* ================= figure drawing ================= */
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function poseAt(pat, t) { const A = P[pat].A, B = P[pat].B, o = {}; for (const k in A) o[k] = [A[k][0] + (B[k][0] - A[k][0]) * t, A[k][1] + (B[k][1] - A[k][1]) * t]; return o; }
const ln = (a, b, w, c) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
function figure(pat, t) {
  const p = poseAt(pat, ease(t)), B = TH.txt, D = TH.dim, A = TH.acc; let g = '';
  for (const pr of P[pat].props) {
    const a = pr.split(':'); switch (a[0]) {
      case 'floor': g += ln([2, 112], [118, 112], 2, D); break;
      case 'incline': g += ln([2, 114], [118, 104], 3, D); break;
      case 'bench': g += `<rect x="${a[1]}" y="${a[3]}" width="${a[2] - a[1]}" height="6" rx="2" fill="${D}"/>` + ln([+a[1] + 6, +a[3] + 6], [+a[1] + 6, 112], 3, D) + ln([a[2] - 6, +a[3] + 6], [a[2] - 6, 112], 3, D); break;
      case 'step': g += `<rect x="50" y="108" width="26" height="4" fill="${D}"/>`; break;
      case 'seat': g += `<rect x="30" y="92" width="34" height="5" rx="2" fill="${D}"/>` + ln([47, 97], [47, 112], 3, D) + ln([96, 82], [96, 98], 3, D) + ln([2, 112], [118, 112], 2, D); break;
      case 'lpseat': g += ln([10, 48], [36, 98], 5, D) + ln([36, 98], [60, 98], 5, D) + ln([2, 112], [118, 112], 2, D); break;
      case 'platform': { const f = p[a[1]]; g += ln([f[0] + 4, f[1] - 16], [f[0] + 4, f[1] + 14], 5, D); break; }
      case 'pullbar': g += ln([30, 0], [94, 0], 4, D); break;
      case 'dipbars': g += ln([44, 64], [78, 64], 4, D) + ln([48, 64], [48, 112], 2, D) + ln([2, 112], [118, 112], 2, D); break;
      case 'cable': { const f = p[a[1]]; g += `<line x1="${f[0]}" y1="${f[1]}" x2="${a[2]}" y2="${a[3]}" stroke="${A}" stroke-width="1.2" stroke-dasharray="3 2"/><circle cx="${a[2]}" cy="${a[3]}" r="3" fill="${D}"/>`; break; }
      case 'landmine': { const f = p[a[1]]; g += ln([6, 110], f, 3, D); break; }
    }
  }
  if (p.k2) g += ln(p.p, p.k2, 4.5, TH.limb) + ln(p.k2, p.f2, 4.5, TH.limb);
  if (p.e2) g += ln(p.s, p.e2, 4, TH.limb) + ln(p.e2, p.w2, 4, TH.limb);
  g += ln(p.s, p.p, 6, B) + ln(p.p, p.k, 5, B) + ln(p.k, p.f, 5, B);
  if (p.t) g += ln(p.f, p.t, 4, B);
  g += ln(p.s, p.e, 4.5, B) + ln(p.e, p.w, 4.5, B);
  g += `<circle cx="${p.h[0].toFixed(1)}" cy="${p.h[1].toFixed(1)}" r="7" fill="${B}"/>`;
  for (const pr of P[pat].props) {
    const a = pr.split(':'); const f = p[a[1]];
    if (a[0] === 'barbell') g += `<circle cx="${f[0]}" cy="${f[1]}" r="10" fill="none" stroke="${A}" stroke-width="3"/><circle cx="${f[0]}" cy="${f[1]}" r="2.5" fill="${A}"/>`;
    if (a[0] === 'db') g += `<rect x="${f[0] - 7}" y="${f[1] - 3}" width="14" height="6" rx="2" fill="${A}"/>`;
    if (a[0] === 'plate') g += `<circle cx="${f[0]}" cy="${f[1]}" r="7" fill="none" stroke="${A}" stroke-width="3"/>`;
  }
  return g;
}
const svgWrap = inner => `<svg viewBox="0 -14 120 132" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
function loopT(pat, ms) { const [a, h, b] = P[pat].tempo.map(x => x * .8); const tot = a + h + b + .5, s = (ms / 1000) % tot; if (s < a) return s / a; if (s < a + h) return 1; if (s < a + h + b) return 1 - (s - a - h) / b; return 0; }
let lastFrame = 0;
function anim(ms) {
  if (ms - lastFrame > 40 && !document.hidden) {
    lastFrame = ms;
    document.querySelectorAll('[data-anim]').forEach(el => { if (el.offsetParent !== null) el.innerHTML = svgWrap(figure(el.dataset.anim, loopT(el.dataset.anim, ms))); });
  }
  requestAnimationFrame(anim);
}
requestAnimationFrame(anim);

/* ================= audio / haptics / wake ================= */
let AC = null;
function beep(f = 880, d = .12, v = .25) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f; g.gain.setValueAtTime(v, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d + .02); } catch (e) { } }
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };
let wakeLock = null;
async function keepAwake() { if (!S.settings.wake || !('wakeLock' in navigator) || wakeLock || document.hidden) return; try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => wakeLock = null); } catch (e) { } }

/* ================= header ================= */
function renderHeader() {
  const s = parseDk(curWeek), e = addDays(s, 6);
  $('wkpill').textContent = s.getMonth() === e.getMonth() ? `${fmtD(s)}–${e.getDate()}` : `${fmtD(s)} – ${fmtD(e)}`;
}

/* ================= WORKOUT ================= */
function renderWorkout() {
  const todayIdx = (() => { const g = new Date().getDay(); return g >= 1 && g <= 5 ? g - 1 : -1; })();
  $('days').innerHTML = DAYS.map((d, i) => {
    const date = addDays(parseDk(curWeek), i);
    return `<button class="${i === cur ? 'on' : ''} ${i === todayIdx ? 'today' : ''}" data-day="${i}">${dayDone(curWeek, i) ? '<span class="dot"></span>' : ''}${d.d}<small>${date.getDate()} · ${d.title.split(' ')[0]}</small></button>`;
  }).join('');
  const done = DAYS.filter((_, i) => dayDone(curWeek, i)).length;
  $('weekline').textContent = `This week: ${done} / 5 days complete`;

  // new week banner
  const lastSeen = localStorage.getItem(LWS());
  const prevKey = dk(addDays(parseDk(curWeek), -7));
  if (lastSeen && lastSeen !== curWeek && S.logs[prevKey]) {
    const st = weekStats(prevKey);
    $('newweek').innerHTML = `<div class="banner">🔄 <b>New week, fresh sheet.</b> Last week (${st.days}/5 days, ${st.sets} sets, ${st.vol.toLocaleString()} ${unit()} moved) is saved in History. <button class="chip" data-dismiss style="margin-top:8px">Got it</button></div>`;
  } else { $('newweek').innerHTML = ''; if (lastSeen !== curWeek) localStorage.setItem(LWS(), curWeek); }

  const D = DAYS[cur], date = addDays(parseDk(curWeek), cur);
  $('dtitle').textContent = D.title;
  $('ddate').textContent = fmtD(date, { weekday: 'long', month: 'short', day: 'numeric' });
  let tot = 0, dn = 0;
  $('list').innerHTML = D.slots.map((sl, si) => {
    const ex = exOf(cur, si), id = exId(ex), tl = setsOf(curWeek, cur, id), done = tl.filter(Boolean).length;
    tot += sl.sets; dn += Math.min(done, sl.sets);
    const past = sessions(id).filter(s => !(s.wk === curWeek && s.di === cur)), last = past[past.length - 1];
    const tgt = S.settings.targets[id] ?? '';
    let sug = '';
    if (last && !sl.time) {
      const top = repTop(sl.reps), low = repLow(sl.reps), maxW = Math.max(...last.sets.map(s => +s.w || 0));
      if (top && last.sets.length >= sl.sets && last.sets.every(s => +s.r >= top)) sug = `<div class="sug up">Hit the top of the range last time<br>→ try ${maxW + inc()} ${unit()}</div>`;
      else if (low && last.sets.some(s => +s.r < low)) sug = `<div class="sug">Missed reps last time<br>→ stay at ${maxW} ${unit()}</div>`;
      else sug = `<div class="sug">Last top set<br>${maxW} ${unit()}</div>`;
    }
    const ph = sl.time ? 'sec' : (repTop(sl.reps) || 'max');
    const rows = Array.from({ length: sl.sets }, (_, i) => {
      const s = tl[i]; const lw = last && last.sets[i] ? last.sets[i].w : '';
      return `<div class="set ${s ? 'ok' : ''}"><div class="n">${i + 1}</div>
      <input inputmode="decimal" data-w="${si}:${i}" value="${esc(s ? s.w : (tgt !== '' ? tgt : lw))}" placeholder="${unit()}">
      <input inputmode="numeric" data-r="${si}:${i}" value="${esc(s ? s.r : '')}" placeholder="${ph}">
      <button class="chk" data-chk="${si}:${i}" aria-label="Log set">✓</button></div>`;
    }).join('');
    return `<div class="card ${done >= sl.sets ? 'done' : ''}">
      <div class="top"><div class="info"><div class="num">EXERCISE ${si + 1}${S.settings.swaps[slotKey(cur, si)] ? ' · SWAPPED' : ''}</div>
       <div class="name">${esc(ex.n)}</div>
       <div class="meta"><span><b>${sl.sets} × ${sl.reps}</b></span><span>Rest ${fmtT(sl.rest)}</span><span>Tempo ${P[ex.pat].tempo.join('-')}</span></div></div>
       <button class="thumb" data-form="${si}"><div data-anim="${ex.pat}"></div><div class="lbl">FORM</div></button></div>
      <div class="chips"><button class="chip acc" data-pace="${si}">▶ ${sl.time ? 'Start timer' : 'Pace set'}</button><button class="chip" data-swap="${si}">↻ Swap</button><button class="chip" data-exhist="${si}">📈 Progress</button></div>
      <div class="target">🎯 Target <input inputmode="decimal" data-tgt="${si}" value="${esc(tgt)}" placeholder="—"> ${unit()}${sug}</div>
      <div class="sets"><div class="sethdr"><span>Set</span><span>Weight</span><span>${sl.time ? 'Secs' : 'Reps'}</span><span></span></div>${rows}</div>
      ${last ? `<div class="last">Last time (${fmtD(new Date(last.t), { weekday: 'short', month: 'short', day: 'numeric' })}): ${last.sets.map(s => fmtSet(last.timed, s)).join(', ')}</div>` : ''}
    </div>`;
  }).join('');
  $('dprog').textContent = `${dn} / ${tot} sets`;
  $('dbar').style.width = (tot ? dn / tot * 100 : 0) + '%';
}

function logSet(si, i, w, r) {
  const ex = exOf(cur, si), e = ensureEntry(curWeek, cur, ex);
  e.n = ex.n; if (DAYS[cur].slots[si].time) e.timed = true; e.sets[i] = { w: w === '' ? '' : +w, r: +r, t: (e.sets[i] && e.sets[i].t) || Date.now() }; e.u = Date.now(); save();
}
function unlogSet(si, i) { const e = entry(curWeek, cur, exId(exOf(cur, si))); if (e) { e.sets[i] = null; e.u = Date.now(); save(); } }
function readRow(si, i) {
  const w = document.querySelector(`[data-w="${si}:${i}"]`).value.trim();
  const sl = DAYS[cur].slots[si]; let r = document.querySelector(`[data-r="${si}:${i}"]`).value.trim();
  if (r === '') r = sl.time || repTop(sl.reps) || 0; return { w, r };
}
function nextSetIdx(si) { const sl = DAYS[cur].slots[si], tl = setsOf(curWeek, cur, exId(exOf(cur, si))); for (let i = 0; i < sl.sets; i++) if (!tl[i]) return i; return -1; }
function afterLog(si) {
  const sl = DAYS[cur].slots[si], ex = exOf(cur, si), more = nextSetIdx(si);
  const nxt = DAYS[cur].slots[si + 1] ? exOf(cur, si + 1).n : null;
  if (more < 0 && !nxt && dayDone(curWeek, cur)) { toast(`🔥 ${DAYS[cur].title} done! Logged for ${fmtD(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}.`, 3500); }
  startRest(sl.rest, more < 0 ? 'Exercise done · rest' : 'Rest', more < 0 ? (nxt ? 'Next: ' + nxt : 'Last exercise, you\'re finished today 🔥') : `${ex.n} · set ${more + 1} next`);
}

/* ================= rest timer ================= */
let rEnd = 0, rDur = 0, rInt = null, rGoT = null, rLastBeep = null;
function startRest(sec, label, sub) {
  rDur = sec; rEnd = Date.now() + sec * 1000; const el = $('rest'); el.classList.add('show'); el.classList.remove('go');
  $('rlab').textContent = label || 'Rest'; $('rsub').textContent = sub || ''; clearInterval(rInt); clearTimeout(rGoT); rInt = setInterval(tickRest, 200); tickRest(); keepAwake();
}
function tickRest() {
  const left = (rEnd - Date.now()) / 1000;
  $('rt').textContent = fmtT(Math.ceil(Math.max(0, left)));
  $('rpb').style.width = Math.max(0, Math.min(100, (1 - left / rDur) * 100)) + '%';
  if (left <= 3.05 && left > 0 && Math.ceil(left) !== rLastBeep) { rLastBeep = Math.ceil(left); beep(660, .08, .2); }
  if (left <= 0) {
    clearInterval(rInt); rLastBeep = null; beep(990, .35, .35); buzz([200, 100, 200]);
    const el = $('rest'); el.classList.add('go'); $('rt').textContent = 'GO'; $('rlab').textContent = 'Next set!';
    rGoT = setTimeout(() => el.classList.remove('show'), 5000);
  }
}
$('rminus').onclick = () => { rEnd -= 15000; rDur = Math.max(1, rDur - 15); tickRest(); };
$('rplus').onclick = () => { rEnd += 15000; rDur += 15; tickRest(); };
$('rskip').onclick = () => { clearInterval(rInt); $('rest').classList.remove('show'); };

/* ================= sheets ================= */
function openSheet(html) { $('sheetin').innerHTML = html; $('ov').classList.add('show'); $('sheet').classList.add('show'); $('sheet').scrollTop = 0; }
function closeSheet() { $('ov').classList.remove('show'); $('sheet').classList.remove('show'); setTimeout(() => { if (!$('sheet').classList.contains('show')) $('sheetin').innerHTML = ''; }, 300); }
$('ov').onclick = closeSheet; $('sx').onclick = closeSheet;

function swapSheet(si) {
  const sl = DAYS[cur].slots[si], sel = S.settings.swaps[slotKey(cur, si)] || 0;
  openSheet(`<h3>Swap exercise</h3><div class="sub">Same muscles, different movement. Each one keeps its own weight log.</div>` +
    sl.opts.map((o, i) => `<button class="opt ${i === sel ? 'on' : ''}" data-pick="${si}:${i}"><div class="thumb"><div data-anim="${o.pat}"></div></div><div>${i === 0 ? '<div class="cur">YOUR ORIGINAL</div>' : ''}<b>${esc(o.n)}</b><span>${esc(o.cues[0])}</span></div></button>`).join(''));
}
function formSheet(si) {
  const ex = exOf(cur, si), pt = P[ex.pat];
  openSheet(`<h3>${esc(ex.n)}</h3><div class="sub">Form guide · the figure moves at the rep tempo</div><div class="bigfig" data-anim="${ex.pat}"></div><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul><div class="tempo">Tempo ${pt.tempo.join('-')}: ${pt.ph[0]} ${pt.tempo[0]}s${pt.tempo[1] ? ` · ${pt.ph[1]} ${pt.tempo[1]}s` : ''} · ${pt.ph[2]} ${pt.tempo[2]}s</div>`);
}
function lineChart(pts, opts = {}) {
  // pts: [{x:Date ms, y:number, label}]
  if (!pts.length) return '';
  const W = 320, H = 150, L = 34, R = 10, T = 22, Bm = 22;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) { x0 -= 864e5; x1 += 864e5; }
  let y0 = Math.min(...ys), y1 = Math.max(...ys); const padY = (y1 - y0) * .15 || 2; y0 -= padY; y1 += padY;
  const X = x => L + (x - x0) / (x1 - x0) * (W - L - R), Y = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - Bm);
  const poly = pts.map(p => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const grid = [y0 + padY, (y0 + y1) / 2, y1 - padY].map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${TH.line}"/><text x="${L - 4}" y="${Y(v) + 3}" fill="${TH.mut}" font-size="9" text-anchor="end">${Math.round(v * 10) / 10}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${grid}
    <text x="${L}" y="14" fill="${TH.mut}" font-size="10">${esc(opts.title || '')}</text>
    <text x="${L}" y="${H - 6}" fill="${TH.mut}" font-size="9">${fmtD(new Date(xs[0]))}</text>
    <text x="${W - R}" y="${H - 6}" fill="${TH.mut}" font-size="9" text-anchor="end">${fmtD(new Date(xs[xs.length - 1]))}</text>
    <polyline points="${poly}" fill="none" stroke="${TH.acc}" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.length < 40 ? pts.map(p => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3" fill="${TH.txt}"/>`).join('') : ''}</svg>`;
}
function exHistSheet(si) {
  const ex = exOf(cur, si), id = exId(ex), h = sessions(id);
  let body = '<div class="muted" style="padding:30px 0;text-align:center">Nothing logged yet. Tick off some sets and your progress shows up here.</div>';
  if (h.length) {
    const timed = h.some(x => x.timed), pts = h.map(x => ({ x: x.t, y: Math.max(...x.sets.map(s => timed ? +s.r || 0 : +s.w || 0)) }));
    const best = Math.max(...pts.map(p => p.y)), first = pts[0].y;
    body = `<div class="stats"><div class="stat"><b>${best}</b><span>Best ${timed ? 'secs' : unit()}</span></div><div class="stat"><b class="${best > first ? 'up' : ''}">${best - first >= 0 ? '+' : ''}${best - first}</b><span>Since start</span></div><div class="stat"><b>${h.length}</b><span>Sessions</span></div></div>` +
      lineChart(pts, { title: timed ? 'Longest set each session (sec)' : 'Heaviest set each session' }) +
      `<div style="margin-top:8px">` + h.slice().reverse().slice(0, 15).map(x => `<div class="hrow"><span>${fmtD(new Date(x.t), { weekday: 'short', month: 'short', day: 'numeric', year: '2-digit' })}</span><b>${x.sets.map(s => fmtSet(x.timed, s)).join(' · ')}</b></div>`).join('') + `</div>`;
  }
  openSheet(`<h3>${esc(ex.n)}</h3><div class="sub">Weight progress over time</div>${body}`);
}

/* ================= rep pacer ================= */
let PC = null;
function openPacer(si) {
  const i = nextSetIdx(si), sl = DAYS[cur].slots[si], ex = exOf(cur, si);
  if (i < 0) { openSheet(`<h3>All sets done 💪</h3><div class="sub">Untick a set if you want to redo it.</div>`); return; }
  beep(1, .01, .001); keepAwake();
  PC = { si, i, sl, ex, pat: ex.pat, target: sl.time ? 0 : repTop(sl.reps), time: sl.time || 0, reps: 0, start: performance.now() + 3000, paused: false, pauseAt: 0, last: '', done: false };
  const w = document.querySelector(`[data-w="${si}:${i}"]`).value.trim();
  $('pn').textContent = `Set ${i + 1} of ${sl.sets} · ${w ? w + ' ' + unit() : 'Bodyweight'}`;
  $('ptitle').textContent = ex.n; $('ppause').textContent = 'Pause'; updTempo();
  $('pacer').classList.add('show'); requestAnimationFrame(pace);
}
function updTempo() { if (!PC) return; $('tval').textContent = PC.time ? '—' : P[PC.pat].tempo.map(x => +(x * S.settings.tempoScale).toFixed(1)).join('-'); }
function pace(nowMs) {
  if (!PC || PC.done) return;
  if (PC.paused) { requestAnimationFrame(pace); return; }
  const el = $('pphase'), pb = $('ppb'), fig = $('pfig'), rp = $('preps');
  const tgtTxt = PC.time ? ' <small>sec</small>' : (PC.target ? `<small> / ${PC.target}</small>` : '<small> reps</small>');
  const e = (nowMs - PC.start) / 1000;
  if (e < 0) {
    const c = Math.ceil(-e); el.className = 'phase'; el.textContent = 'Get ready · ' + c; pb.style.width = ((3 + e) / 3 * 100) + '%';
    fig.innerHTML = svgWrap(figure(PC.pat, 0)); rp.innerHTML = (PC.time || 0) + tgtTxt;
    if (PC.last !== 'c' + c) { PC.last = 'c' + c; beep(520, .08, .2); }
    requestAnimationFrame(pace); return;
  }
  if (PC.time) {
    const left = PC.time - e; fig.innerHTML = svgWrap(figure(PC.pat, loopT(PC.pat, e * 1000)));
    el.className = 'phase hold'; el.textContent = 'HOLD STRONG'; pb.style.width = (e / PC.time * 100) + '%'; rp.innerHTML = Math.ceil(Math.max(0, left)) + tgtTxt;
    if (left <= 3 && left > 0 && PC.last !== 't' + Math.ceil(left)) { PC.last = 't' + Math.ceil(left); beep(660, .08, .2); }
    if (left <= 0) { PC.reps = PC.time; finishPace(); return; }
    requestAnimationFrame(pace); return;
  }
  const [a, h, b] = P[PC.pat].tempo.map(x => x * S.settings.tempoScale), cyc = a + h + b, rep = Math.floor(e / cyc), s = e - rep * cyc;
  if (PC.target && rep >= PC.target) { PC.reps = PC.target; finishPace(); return; }
  PC.reps = rep; let t, ph, cls, frac;
  if (s < a) { t = s / a; ph = P[PC.pat].ph[0]; cls = 'phase'; frac = s / a; }
  else if (s < a + h) { t = 1; ph = P[PC.pat].ph[1]; cls = 'phase hold'; frac = (s - a) / h; }
  else { t = 1 - (s - a - h) / b; ph = P[PC.pat].ph[2]; cls = 'phase up'; frac = (s - a - h) / b; }
  const key = rep + ph; if (PC.last !== key) { PC.last = key; if (ph === P[PC.pat].ph[0]) beep(880, .1, .25); else beep(cls === 'phase hold' ? 600 : 740, .07, .18); }
  el.className = cls; el.textContent = ph.toUpperCase(); pb.style.width = (frac * 100) + '%';
  fig.innerHTML = svgWrap(figure(PC.pat, t)); rp.innerHTML = rep + tgtTxt;
  requestAnimationFrame(pace);
}
function finishPace() {
  if (!PC) return; PC.done = true; const { si, i } = PC; let reps = PC.reps;
  if (PC.time && !reps) reps = Math.max(0, Math.round((performance.now() - PC.start) / 1000));
  $('pacer').classList.remove('show'); beep(990, .25, .3); buzz(150);
  const w = (document.querySelector(`[data-w="${si}:${i}"]`) || {}).value || '';
  if (reps > 0) { logSet(si, i, w.trim(), reps); renderWorkout(); afterLog(si); }
  PC = null;
}
$('pdone').onclick = finishPace;
$('pcancel').onclick = () => { if (PC) { PC.done = true; PC = null; } $('pacer').classList.remove('show'); };
$('ppause').onclick = e => { if (!PC) return; if (!PC.paused) { PC.paused = true; PC.pauseAt = performance.now(); e.target.textContent = 'Resume'; } else { PC.start += performance.now() - PC.pauseAt; PC.paused = false; e.target.textContent = 'Pause'; } };
function scaleTempo(f) { if (!PC) return; const n = performance.now(), el = n - PC.start, ns = Math.max(.5, Math.min(2, S.settings.tempoScale * f)); if (el > 0) PC.start = n - el * (ns / S.settings.tempoScale); S.settings.tempoScale = ns; touchSettings(); updTempo(); }
$('tslow').onclick = () => scaleTempo(1.25);
$('tfast').onclick = () => scaleTempo(.8);

/* ================= HISTORY ================= */
function weekStats(wk) {
  let sets = 0, vol = 0, days = 0; const W = S.logs[wk] || {};
  for (const di in W) { let any = false; for (const id in W[di]) for (const s of (W[di][id].sets || [])) if (s) { sets++; vol += (+s.w || 0) * (+s.r || 0); any = true; } if (any) days++; }
  return { sets, vol: Math.round(vol), days };
}
function renderHistory() {
  const weeks = Object.keys(S.logs).filter(wk => weekStats(wk).sets > 0).sort().reverse();
  const totalSets = weeks.reduce((a, w) => a + weekStats(w).sets, 0);
  let h = `<div class="dayhead"><div><h2>History</h2><div class="sub">${weeks.length} week${weeks.length === 1 ? '' : 's'} logged · ${totalSets} sets total</div></div></div>`;
  if (!weeks.length) h += `<div class="card muted">Nothing here yet. Each week you train gets saved here automatically, and a fresh week starts every Monday.</div>`;
  h += weeks.map((wk, idx) => {
    const st = weekStats(wk), s = parseDk(wk), e = addDays(s, 6), W = S.logs[wk];
    const bw = Object.keys(S.body).filter(d => !S.body[d].del && d >= wk && d <= dk(e)).map(d => +S.body[d].w).filter(Boolean);
    const days = Object.keys(W).map(Number).sort((a, b) => a - b).map(di => {
      const exs = Object.values(W[di]).filter(x => (x.sets || []).some(Boolean)); if (!exs.length) return '';
      const ts = exs.flatMap(x => x.sets.filter(Boolean).map(s => s.t)).filter(Boolean);
      const when = ts.length ? fmtD(new Date(Math.min(...ts)), { weekday: 'short', month: 'short', day: 'numeric' }) : '';
      return `<div class="wday"><div class="dh">${DAYS[di] ? DAYS[di].d + ' · ' + DAYS[di].title : 'Day ' + (di + 1)} <span>· done ${when}</span></div>` +
        exs.map(x => `<div class="wex"><b>${esc(x.n)}</b><span>${x.sets.filter(Boolean).map(s => fmtSet(x.timed, s)).join(', ')}</span></div>`).join('') + `</div>`;
    }).join('');
    return `<div class="wk ${idx === 0 ? 'open' : ''}"><button data-wk>
      <div class="wt"><b>${wk === curWeek ? 'This week' : 'Week of ' + fmtD(s, { month: 'short', day: 'numeric', year: 'numeric' })}</b><span>${fmtD(s)} – ${fmtD(e)} · ${st.sets} sets · ${st.vol.toLocaleString()} ${unit()}${bw.length ? ` · BW ${(bw.reduce((a, b) => a + b, 0) / bw.length).toFixed(1)}` : ''}</span></div>
      <div class="dots">${DAYS.map((_, i) => `<i class="${dayAny(wk, i) ? 'on' : ''}"></i>`).join('')}</div></button>
      <div class="body">${days}</div></div>`;
  }).join('');
  $('hist').innerHTML = h;
}

/* ================= BODY ================= */
const POSES = ['front', 'side', 'back'];
const bodyList = () => Object.keys(S.body).filter(d => !S.body[d].del && S.body[d].w !== '' && S.body[d].w != null).sort();
const photoMeta = (m, p) => { const x = (S.photos[m] || {})[p]; return x && !x.del ? x : null; };
async function renderBody() {
  const list = bodyList(), today = dk(new Date()), mk = monthKey(new Date());
  const pts = list.map(d => ({ x: parseDk(d).getTime(), y: +S.body[d].w }));
  const last = pts[pts.length - 1], first = pts[0];
  const ago30 = (() => { const cut = Date.now() - 30 * 864e5; const p = pts.filter(p => p.x <= cut).pop(); return p; })();
  const dlt = (a, b) => (a && b) ? (Math.round((a.y - b.y) * 10) / 10) : null;
  const sg = v => v == null ? '—' : (v > 0 ? '+' : '') + v;
  const te = S.body[today] && !S.body[today].del ? S.body[today] : {};
  const haveThisMonth = POSES.some(p => photoMeta(mk, p));
  let h = `<div class="dayhead"><div><h2>Body</h2><div class="sub">Bodyweight, measurements and monthly photos</div></div></div>`;
  if (!haveThisMonth) h += `<div class="banner">📸 <b>${fmtMonth(mk)} check-in is due.</b> Add your front, side and back photos below. Same spot, same lighting and same time of day each month makes the comparison honest.</div>`;
  h += `<div class="card"><h3>Log body stats</h3>
    <div class="grid2"><label class="fld">Date<input type="date" id="bDate" value="${today}" max="${today}"></label>
    <label class="fld">Weight (${unit()})<input id="bW" inputmode="decimal" value="${esc(te.w ?? '')}" placeholder="e.g. 175"></label>
    <label class="fld">Waist (in)<input id="bWaist" inputmode="decimal" value="${esc(te.waist ?? '')}" placeholder="optional"></label>
    <label class="fld">Body fat %<input id="bBf" inputmode="decimal" value="${esc(te.bf ?? '')}" placeholder="optional"></label></div>
    <label class="fld" style="margin-top:10px">Note<input id="bNote" value="${esc(te.note ?? '')}" placeholder="optional, e.g. felt strong, slept bad"></label>
    <button class="btn acc" id="bSave">Save</button></div>`;
  h += `<div class="card"><h3>Weight trend</h3>
    <div class="stats"><div class="stat"><b>${last ? last.y : '—'}</b><span>Current ${unit()}</span></div><div class="stat"><b>${sg(dlt(last, ago30))}</b><span>30 days</span></div><div class="stat"><b>${sg(dlt(last, first))}</b><span>Since start</span></div></div>
    ${pts.length ? lineChart(pts, { title: `Bodyweight (${unit()})` }) : '<div class="muted">Log your weight a few times a week (same time, ideally in the morning) to see a trend.</div>'}
    ${list.length ? `<div style="margin-top:8px">${list.slice().reverse().slice(0, 12).map(d => { const b = S.body[d]; return `<div class="hrow"><span>${fmtD(parseDk(d), { weekday: 'short', month: 'short', day: 'numeric', year: '2-digit' })}</span><b>${b.w} ${unit()}${b.waist ? ` · ${b.waist}"` : ''}${b.bf ? ` · ${b.bf}%` : ''}</b><button class="x" data-bdel="${d}">✕</button></div>${b.note ? `<div class="muted" style="font-size:12px;margin:-4px 0 6px 2px">${esc(b.note)}</div>` : ''}`; }).join('')}${list.length > 12 ? `<div class="muted" style="font-size:12px;padding-top:6px">+ ${list.length - 12} older entries (all included in export)</div>` : ''}</div>` : ''}
  </div>`;
  // photos
  const months = Object.keys(S.photos).filter(m => POSES.some(p => photoMeta(m, p))).sort().reverse();
  const avgW = m => { const ws = list.filter(d => d.startsWith(m)).map(d => +S.body[d].w); return ws.length ? (ws.reduce((a, b) => a + b, 0) / ws.length).toFixed(1) + ' ' + unit() : ''; };
  h += `<div class="card"><h3>Monthly photo check-in</h3><div class="muted" style="margin-bottom:10px">${fmtMonth(mk)}: tap a slot to add or replace a photo.</div>
    <div class="poses">${POSES.map(p => slotHtml(mk, p, true)).join('')}</div>`;
  if (months.length > 1) {
    const a = months[months.length - 1], b = months[0];
    h += `<h3 style="margin-top:16px">Compare</h3><div class="grid2"><label class="fld">From<select id="cA">${months.map(m => `<option value="${m}" ${m === a ? 'selected' : ''}>${fmtMonth(m)}</option>`).join('')}</select></label><label class="fld">To<select id="cB">${months.map(m => `<option value="${m}" ${m === b ? 'selected' : ''}>${fmtMonth(m)}</option>`).join('')}</select></label></div>
      <div class="chips" id="cPose">${POSES.map((p, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-cpose="${p}">${p[0].toUpperCase() + p.slice(1)}</button>`).join('')}</div><div class="cmp" id="cmp"></div>`;
  }
  h += months.filter(m => m !== mk).map(m => `<div class="month"><div class="mh">${fmtMonth(m)}<span>${avgW(m)}</span></div><div class="poses">${POSES.map(p => slotHtml(m, p, false)).join('')}</div></div>`).join('');
  h += `</div>`;
  $('body').innerHTML = h;
  hydratePhotos();
  if (months.length > 1) renderCompare();
}
function slotHtml(m, p, editable) {
  const meta = photoMeta(m, p);
  const lbl = p[0].toUpperCase() + p.slice(1);
  if (meta) return `<button class="pslot has" data-photo="${m}|${p}"><img data-img="${m}|${p}" alt=""><span class="pl">${lbl}</span></button>`;
  if (!editable) return `<div class="pslot"><span>${lbl}</span><span style="font-size:10px">—</span></div>`;
  return `<button class="pslot" data-addphoto="${m}|${p}"><span class="plus">＋</span><span>${lbl}</span></button>`;
}
let cmpPose = 'front';
async function renderCompare() {
  const A = $('cA'), B = $('cB'); if (!A) return;
  const one = async m => { const meta = photoMeta(m, cmpPose); const url = meta ? await photoURL(m, cmpPose) : null; return `<figure>${url ? `<img src="${url}">` : '<div class="empty">No ' + cmpPose + ' photo</div>'}<figcaption>${fmtMonth(m)}</figcaption></figure>`; };
  $('cmp').innerHTML = (await one(A.value)) + (await one(B.value));
}
async function hydratePhotos() {
  for (const img of document.querySelectorAll('img[data-img]')) {
    const [m, p] = img.dataset.img.split('|'); const url = await photoURL(m, p); if (url) img.src = url;
  }
}
function photoSheet(m, p) {
  photoURL(m, p).then(url => {
    const b = S.body; const ws = Object.keys(b).filter(d => d.startsWith(m) && !b[d].del && b[d].w).map(d => +b[d].w);
    openSheet(`<h3>${fmtMonth(m)} · ${p}</h3><div class="sub">${ws.length ? 'Avg bodyweight that month: ' + (ws.reduce((x, y) => x + y, 0) / ws.length).toFixed(1) + ' ' + unit() : 'No bodyweight logged that month'}</div>
      ${url ? `<img class="bigimg" src="${url}">` : '<div class="muted">Photo is still downloading. Try again in a moment.</div>'}
      <div class="grid2"><button class="btn" data-addphoto="${m}|${p}">Replace</button><button class="btn ghost" data-pdel="${m}|${p}" style="color:var(--acc2)">Delete</button></div>`);
  });
}

/* ---- photo storage: IndexedDB locally, Supabase Storage in the cloud ---- */
let idbP = null;
function idb() { return idbP = idbP || new Promise((res, rej) => { const r = indexedDB.open('gym-photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function idbRaw(k) { const db = await idb(); return new Promise(r => { const q = db.transaction('photos').objectStore('photos').get(k); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); }
async function idbGet(k) { return (await idbRaw(PROF + ':' + k)) || (PROF === 'king' ? await idbRaw(k) : null); }
async function idbClearProfile() { const db = await idb(); return new Promise(r => { const t = db.transaction('photos', 'readwrite'), st = t.objectStore('photos'); const q = st.openCursor(); q.onsuccess = () => { const c = q.result; if (c) { if (String(c.key).startsWith(PROF + ':') || (PROF === 'king' && !String(c.key).includes(':'))) c.delete(); c.continue(); } }; t.oncomplete = () => r(); t.onerror = () => r(); }); }
async function idbPut(k, v) { const db = await idb(); return new Promise((r, j) => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put(v, PROF + ':' + k); t.oncomplete = () => r(); t.onerror = () => j(t.error); }); }
async function idbDel(k) { const db = await idb(); return new Promise(r => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').delete(PROF + ':' + k); t.objectStore('photos').delete(k); t.oncomplete = () => r(); t.onerror = () => r(); }); }
const urlCache = {};
async function photoBlob(m, p) {
  const meta = photoMeta(m, p); if (!meta) return null;
  const k = `${m}-${p}-${meta.u}`; let blob = await idbGet(k);
  if (!blob && sb && session && meta.path && meta.up) {
    try { const { data, error } = await sb.storage.from(BUCKET).download(meta.path); if (!error && data) { blob = data; await idbPut(k, blob); } } catch (e) { }
  }
  return blob;
}
async function photoURL(m, p) {
  const meta = photoMeta(m, p); if (!meta) return null; const k = `${PROF}:${m}-${p}-${meta.u}`;
  if (urlCache[k]) return urlCache[k];
  const b = await photoBlob(m, p); if (!b) return null; return urlCache[k] = URL.createObjectURL(b);
}
async function compressImage(file) {
  let bmp; try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {
    bmp = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  }
  const max = 1440, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, 'image/jpeg', .85));
}
let pendingPhoto = null;
$('photoInput').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || !pendingPhoto) return;
  const [m, p] = pendingPhoto; pendingPhoto = null; toast('Saving photo…');
  try {
    const blob = await compressImage(f); const u = Date.now();
    const old = photoMeta(m, p);
    if (old) await idbDel(`${m}-${p}-${old.u}`);
    await idbPut(`${m}-${p}-${u}`, blob);
    S.photos[m] = S.photos[m] || {}; S.photos[m][p] = { u, up: false, path: null };
    if (old && old.path) S.photos[m][p].oldPath = old.path;
    save(); closeSheet(); renderBody(); toast('📸 Photo saved' + (session ? ', uploading…' : ''));
  } catch (err) { toast('Could not read that photo'); }
});
async function deletePhoto(m, p) {
  const meta = photoMeta(m, p); if (!meta) return;
  await idbDel(`${m}-${p}-${meta.u}`);
  S.photos[m][p] = { del: true, u: Date.now(), oldPath: meta.path || null }; save(); closeSheet(); renderBody(); toast('Photo deleted');
}

/* ================= MORE (account, export, settings) ================= */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (tab === 'more') renderMore(); });
function renderMore() {
  const cfg = getCfg(), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const auto = localStorage.getItem('gym.autoProfile') === PROF;
  let h = `<div class="dayhead"><div><h2>More</h2><div class="sub">Account, backups and settings</div></div></div>`;
  h += `<div class="card"><h3>👑 ${PROFILES[PROF].name}</h3><div class="muted">You're on ${PROFILES[PROF].name}'s profile: ${PROFILES[PROF].tagline}. Each profile has its own routine, history, photos and login.</div>
    <button class="btn acc" id="switchBtn2">Switch profile</button>
    <div class="hrow" style="margin-top:6px"><span>Skip the picker and always open as ${PROFILES[PROF].name} on this phone</span><button class="chip ${auto ? 'on' : ''}" id="autoT">${auto ? 'On' : 'Off'}</button></div></div>`;
  // account
  h += `<div class="card"><h3>Cloud sync</h3>`;
  if (!cfg.url || !cfg.key) {
    h += `<div class="muted">Not connected. Everything saves on this phone only. Paste your Supabase project URL and anon key (see the setup guide) to sync across devices and back up your photos.</div>
      <label class="fld" style="margin-top:10px">Project URL<input id="cfgUrl" placeholder="https://xxxx.supabase.co" autocapitalize="off" autocorrect="off"></label>
      <label class="fld" style="margin-top:8px">Anon / publishable key<input id="cfgKey" placeholder="eyJhbGciOi… or sb_publishable_…" autocapitalize="off" autocorrect="off"></label>
      <button class="btn acc" id="cfgSave">Connect</button>`;
  } else if (!session) {
    h += `<div class="muted">Connected to <b>${esc(cfg.url.replace(/^https?:\/\//, ''))}</b>. Sign in with <b>${PROFILES[PROF].name}'s</b> own account to sync. Your data on this phone gets merged in, nothing is lost.</div>
      <label class="fld" style="margin-top:10px">Email<input id="auEmail" type="email" autocomplete="email" autocapitalize="off"></label>
      <label class="fld" style="margin-top:8px">Password<input id="auPass" type="password" autocomplete="current-password"></label>
      <div class="grid2"><button class="btn acc" id="auIn">Sign in</button><button class="btn" id="auUp">Create account</button></div>
      <button class="btn ghost small" id="cfgClear" style="margin-top:10px">Change project</button>`;
  } else {
    h += `<div class="muted">Signed in as <b>${esc(session.user.email)}</b>.<br>${lastSync ? 'Last synced ' + new Date(lastSync).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not synced yet'}</div>
      <div class="grid2"><button class="btn acc" id="syncNow">Sync now</button><button class="btn" id="auOut">Sign out</button></div>`;
  }
  h += `</div>`;
  // export
  h += `<div class="card"><h3>Export &amp; backup</h3><div class="muted">Download everything you've ever logged. The full backup can be imported back in on any phone.</div>
    <button class="btn acc" data-exp="json">⬇ Full backup (.json)</button>
    <div class="grid2"><button class="btn" data-exp="sets">Workouts (.csv)</button><button class="btn" data-exp="body">Body log (.csv)</button></div>
    <button class="btn" data-exp="photos">Progress photos (.zip)</button>
    <button class="btn ghost" id="impBtn">⬆ Import a backup</button></div>`;
  // settings
  h += `<div class="card"><h3>Settings</h3>
    <div class="hrow"><span>Weight unit</span><div class="row"><button class="chip ${unit() === 'lb' ? 'on' : ''}" data-unit="lb">LB</button><button class="chip ${unit() === 'kg' ? 'on' : ''}" data-unit="kg">KG</button></div></div>
    <div class="hrow"><span>Keep screen awake while training</span><button class="chip ${S.settings.wake ? 'on' : ''}" id="wakeT">${S.settings.wake ? 'On' : 'Off'}</button></div>
    <div class="hrow"><span>Rep pacer speed</span><div class="row"><b>${Math.round(100 / S.settings.tempoScale)}%</b><button class="chip" id="tReset">Reset</button></div></div>
    <div class="hrow"><span>Reset all swaps to your originals</span><button class="chip" id="swReset">Reset</button></div></div>`;
  if (!standalone) h += `<div class="card"><h3>Install on your phone</h3>${deferredInstall ? `<button class="btn acc" id="instBtn">Add to Home Screen</button>` : `<div class="muted"><b>iPhone:</b> Safari → Share button → <i>Add to Home Screen</i>.<br><b>Android:</b> Chrome → ⋮ menu → <i>Install app</i>.<br>It then opens full screen like a normal app and works offline at the gym.</div>`}</div>`;
  h += `<div class="foot">Gym Routine · data stays yours. Local data: ${(JSON.stringify(S).length / 1024).toFixed(0)} KB<br><button class="chip" id="wipe" style="margin-top:10px;color:var(--acc2)">Clear data on this phone</button></div>`;
  $('more').innerHTML = h;
}

function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\n');
const stamp = () => dk(new Date());
let JSZipP = null;
const loadJSZip = () => JSZipP = JSZipP || new Promise((res, rej) => { if (window.JSZip) return res(window.JSZip); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = () => res(window.JSZip); s.onerror = () => { JSZipP = null; rej(); }; document.head.appendChild(s); });
async function doExport(kind) {
  if (kind === 'json') { download(`gym-${PROF}-backup-${stamp()}.json`, new Blob([JSON.stringify({ exported: new Date().toISOString(), app: 'gym-routine', profile: PROF, ...S }, null, 1)], { type: 'application/json' })); }
  if (kind === 'sets') {
    const rows = [['week_start', 'routine_day', 'date', 'time', 'exercise', 'set', 'weight', 'unit', 'reps_or_secs']];
    for (const wk of Object.keys(S.logs).sort()) for (const di of Object.keys(S.logs[wk]).sort()) for (const id in S.logs[wk][di]) {
      const e = S.logs[wk][di][id]; (e.sets || []).forEach((s, i) => { if (!s) return; const d = new Date(s.t || parseDk(wk)); rows.push([wk, DAYS[di] ? DAYS[di].d + ' ' + DAYS[di].title : di, dk(d), d.toTimeString().slice(0, 5), e.n, i + 1, s.w, unit(), s.r]); });
    }
    download(`gym-${PROF}-workouts-${stamp()}.csv`, new Blob([csv(rows)], { type: 'text/csv' }));
  }
  if (kind === 'body') {
    const rows = [['date', 'weight', 'unit', 'waist_in', 'body_fat_pct', 'note']];
    for (const d of Object.keys(S.body).sort()) { const b = S.body[d]; if (b.del) continue; rows.push([d, b.w, unit(), b.waist, b.bf, b.note]); }
    download(`gym-${PROF}-body-${stamp()}.csv`, new Blob([csv(rows)], { type: 'text/csv' }));
  }
  if (kind === 'photos') {
    const list = []; for (const m in S.photos) for (const p of POSES) if (photoMeta(m, p)) list.push([m, p]);
    if (!list.length) return toast('No photos yet');
    toast('Packing photos…', 6000);
    try {
      const JSZip = await loadJSZip(); const z = new JSZip();
      for (const [m, p] of list) { const b = await photoBlob(m, p); if (b) z.file(`${m}-${p}.jpg`, b); }
      download(`gym-${PROF}-photos-${stamp()}.zip`, await z.generateAsync({ type: 'blob' })); toast('Photos exported');
    } catch (e) { toast('Need internet once to build the zip. Try again online.'); }
  }
}
$('importInput').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const d = JSON.parse(await f.text()); if (!d || d.v !== 2 || !d.logs) throw 0;
    S = merge(S, d); save(); renderAll(); toast('✅ Backup imported and merged');
  } catch (err) { toast('That file isn\'t a Gym backup'); }
});

/* ================= cloud sync (Supabase) ================= */
const BUCKET = 'progress-photos';
let sb = null, session = null, syncing = false, again = false, syncT = null, lastSync = 0;
const clients = {};
function getCfg() {
  let c = {}; try { c = JSON.parse(localStorage.getItem('gym.cfg') || '{}'); } catch (e) { }
  const g = window.GYM_CONFIG || {}; return { url: c.url || g.supabaseUrl || '', key: c.key || g.supabaseAnonKey || '' };
}
function setSync(state, text) { const el = $('sync'); el.className = 'sync ' + state; el.querySelector('span').textContent = text; }
function initCloud() {
  sb = null; session = null; lastSync = 0;
  const c = getCfg();
  if (!c.url || !c.key) { setSync('', 'On this device'); return; }
  if (!window.supabase || !window.supabase.createClient) { setSync('err', 'Offline · saved on device'); return; }
  const prof = PROF;
  if (!clients[prof] || clients[prof].url !== c.url || clients[prof].key !== c.key) {
    try {
      const cl = window.supabase.createClient(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'gym-auth-' + prof } });
      clients[prof] = { cl, url: c.url, key: c.key };
      cl.auth.onAuthStateChange((ev, s) => { if (PROF !== prof) return; const was = !!session; session = s; if (!!s !== was) afterAuth(); });
    } catch (e) { setSync('err', 'Bad Supabase settings'); return; }
  }
  sb = clients[prof].cl;
  sb.auth.getSession().then(({ data }) => { if (PROF !== prof) return; session = data.session; afterAuth(); });
}
function afterAuth() { if (session) { setSync('busy', 'Syncing…'); sync(); } else setSync('', 'Signed out · on this device'); if (tab === 'more') renderMore(); }
function scheduleSync() { clearTimeout(syncT); syncT = setTimeout(sync, 1500); }
async function sync() {
  if (!sb || !session) return; if (!navigator.onLine) { setSync('err', 'Offline · will sync later'); return; }
  if (syncing) { again = true; return; } syncing = true; setSync('busy', 'Syncing…');
  const prof = PROF, client = sb;
  try {
    const uid = session.user.id;
    const { data, error } = await client.from('gym_state').select('data').eq('user_id', uid).maybeSingle();
    if (error) throw error;
    if (prof !== PROF) throw 'switched';
    if (data && data.data) { S = merge(S, data.data); persist(); }
    await syncPhotos(uid);
    if (prof !== PROF) throw 'switched';
    const { error: e2 } = await client.from('gym_state').upsert({ user_id: uid, data: S, updated_at: new Date().toISOString() });
    if (e2) throw e2;
    lastSync = Date.now(); setSync('ok', 'Synced'); renderAll(true);
  } catch (e) { if (e !== 'switched') { console.warn(e); setSync('err', 'Sync failed · saved on device'); } }
  syncing = false; if (again) { again = false; sync(); }
}
async function syncPhotos(uid) {
  for (const m in S.photos) for (const p of POSES) {
    const meta = S.photos[m][p]; if (!meta) continue;
    if (meta.oldPath) { try { await sb.storage.from(BUCKET).remove([meta.oldPath]); } catch (e) { } delete meta.oldPath; }
    if (meta.del || meta.up) continue;
    const blob = await idbGet(`${m}-${p}-${meta.u}`); if (!blob) continue;
    const path = `${uid}/${m}-${p}-${meta.u}.jpg`;
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (!error) { meta.path = path; meta.up = true; persist(); }
  }
}
/* merge two states: newest wins per exercise-session, per body entry, per photo slot, settings as a block */
function merge(a, b) {
  const o = clone(a); b = clone(b);
  if ((b.settings && b.settings.u || 0) > (o.settings.u || 0)) o.settings = { ...o.settings, ...b.settings };
  for (const wk in b.logs || {}) for (const di in b.logs[wk]) for (const id in b.logs[wk][di]) {
    const x = b.logs[wk][di][id]; o.logs[wk] = o.logs[wk] || {}; o.logs[wk][di] = o.logs[wk][di] || {};
    const y = o.logs[wk][di][id]; if (!y || (x.u || 0) > (y.u || 0)) o.logs[wk][di][id] = x;
  }
  for (const d in b.body || {}) { const x = b.body[d], y = o.body[d]; if (!y || (x.u || 0) > (y.u || 0)) o.body[d] = x; }
  for (const m in b.photos || {}) for (const p in b.photos[m]) {
    o.photos[m] = o.photos[m] || {}; const x = b.photos[m][p], y = o.photos[m][p];
    if (!y || (x.u || 0) > (y.u || 0)) o.photos[m][p] = x;
    else if (y && x.u === y.u && x.up && !y.up) o.photos[m][p] = { ...y, up: true, path: x.path };
  }
  return o;
}

/* ================= render & events ================= */
function renderAll(quiet) {
  renderHeader();
  if (tab === 'workout') { if (!(quiet && document.activeElement && document.activeElement.matches('input'))) renderWorkout(); }
  if (tab === 'history') renderHistory();
  if (tab === 'body' && !(quiet && document.activeElement && document.activeElement.matches('input,select'))) renderBody();
  if (tab === 'more' && !quiet) renderMore();
}
function showTab(t) {
  tab = t; document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('on', s.id === 't-' + t));
  $('htitle').innerHTML = PROFILES[PROF].label + ' <span>' + { workout: 'SPLIT', history: 'LOG', body: 'BODY', more: 'APP' }[t] + '</span>';
  renderAll(); window.scrollTo(0, 0);
}

document.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.tab) return showTab(d.tab);
  if (d.day !== undefined) { cur = +d.day; renderWorkout(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (d.dismiss !== undefined) { localStorage.setItem(LWS(), curWeek); renderWorkout(); return; }
  if (d.swap !== undefined) return swapSheet(+d.swap);
  if (d.form !== undefined) return formSheet(+d.form);
  if (d.exhist !== undefined) return exHistSheet(+d.exhist);
  if (d.pace !== undefined) return openPacer(+d.pace);
  if (d.pick) { const [si, i] = d.pick.split(':').map(Number); if (i) S.settings.swaps[slotKey(cur, si)] = i; else delete S.settings.swaps[slotKey(cur, si)]; touchSettings(); closeSheet(); renderWorkout(); return; }
  if (d.chk) {
    const [si, i] = d.chk.split(':').map(Number);
    if (setsOf(curWeek, cur, exId(exOf(cur, si)))[i]) { unlogSet(si, i); renderWorkout(); }
    else { const { w, r } = readRow(si, i); beep(1, .01, .001); logSet(si, i, w, r); renderWorkout(); afterLog(si); }
    return;
  }
  if (d.wk !== undefined) { t.parentElement.classList.toggle('open'); return; }
  // body
  if (t.id === 'bSave') {
    const date = $('bDate').value || dk(new Date()), w = $('bW').value.trim();
    if (!w) return toast('Enter your weight first');
    S.body[date] = { w: +w, waist: $('bWaist').value.trim(), bf: $('bBf').value.trim(), note: $('bNote').value.trim(), u: Date.now() };
    save(); renderBody(); toast('✅ Saved for ' + fmtD(parseDk(date), { weekday: 'short', month: 'short', day: 'numeric' })); return;
  }
  if (d.bdel) { S.body[d.bdel] = { del: true, u: Date.now() }; save(); renderBody(); return; }
  if (d.addphoto) { pendingPhoto = d.addphoto.split('|'); $('photoInput').click(); return; }
  if (d.photo) { const [m, p] = d.photo.split('|'); return photoSheet(m, p); }
  if (d.pdel) { const [m, p] = d.pdel.split('|'); return deletePhoto(m, p); }
  if (d.cpose) { cmpPose = d.cpose; document.querySelectorAll('[data-cpose]').forEach(b => b.classList.toggle('on', b === t)); renderCompare(); return; }
  // more
  if (d.exp) return doExport(d.exp);
  if (d.unit) { S.settings.unit = d.unit; touchSettings(); renderMore(); return; }
  switch (t.id) {
    case 'impBtn': $('importInput').click(); break;
    case 'wakeT': S.settings.wake = !S.settings.wake; touchSettings(); if (!S.settings.wake && wakeLock) { wakeLock.release(); wakeLock = null; } renderMore(); break;
    case 'tReset': S.settings.tempoScale = 1; touchSettings(); renderMore(); break;
    case 'swReset': S.settings.swaps = {}; touchSettings(); toast('All exercises back to your originals'); break;
    case 'instBtn': if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; renderMore(); } break;
    case 'cfgSave': {
      const url = $('cfgUrl').value.trim().replace(/\/+$/, ''), key = $('cfgKey').value.trim();
      if (!/^https:\/\/.+/.test(url) || key.length < 20) return toast('Check the URL and key');
      localStorage.setItem('gym.cfg', JSON.stringify({ url, key })); initCloud(); renderMore(); toast('Connected. Now sign in'); break;
    }
    case 'cfgClear': localStorage.removeItem('gym.cfg'); if (sb) await sb.auth.signOut().catch(() => { }); for (const k in clients) delete clients[k]; sb = null; session = null; setSync('', 'On this device'); renderMore(); break;
    case 'auIn': case 'auUp': {
      if (!sb) return toast('Supabase didn\'t load. Check your connection');
      const email = $('auEmail').value.trim(), password = $('auPass').value;
      if (!email || password.length < 6) return toast('Email + password (6+ characters)');
      t.textContent = '…';
      const r = t.id === 'auIn' ? await sb.auth.signInWithPassword({ email, password }) : await sb.auth.signUp({ email, password });
      if (r.error) { toast(r.error.message, 4500); renderMore(); return; }
      if (t.id === 'auUp' && !r.data.session) { toast('Check your email to confirm, then sign in', 5000); renderMore(); return; }
      toast('✅ Signed in, syncing'); break;
    }
    case 'auOut': await sb.auth.signOut(); session = null; afterAuth(); break;
    case 'syncNow': sync(); break;
    case 'wipe': openSheet(`<h3>Clear this phone?</h3><div class="sub">Removes ${PROFILES[PROF].name}'s workouts, body logs and photos from this phone (the other profile isn't touched). ${session ? 'Your cloud copy is kept and will come back when you sign in again.' : '<b>You are not synced, so this can\'t be undone.</b> Export a backup first.'}</div><button class="btn acc" id="wipeYes">Yes, clear it</button>`); break;
    case 'wipeYes': localStorage.removeItem(KEY); localStorage.removeItem(LWS()); await idbClearProfile(); if (sb) await sb.auth.signOut().catch(() => { }); if (localStorage.getItem('gym.autoProfile') === PROF) localStorage.removeItem('gym.autoProfile'); location.reload(); break;
    case 'switchBtn': case 'switchBtn2': showPicker(); break;
    case 'autoT': if (localStorage.getItem('gym.autoProfile') === PROF) localStorage.removeItem('gym.autoProfile'); else localStorage.setItem('gym.autoProfile', PROF); renderMore(); break;
  }
});
document.addEventListener('change', e => {
  const d = e.target.dataset;
  if (d.tgt !== undefined) { const id = exId(exOf(cur, +d.tgt)); const v = e.target.value.trim(); if (v === '') delete S.settings.targets[id]; else S.settings.targets[id] = +v; touchSettings(); renderWorkout(); return; }
  if (d.w || d.r) { const [si, i] = (d.w || d.r).split(':').map(Number); if (setsOf(curWeek, cur, exId(exOf(cur, si)))[i]) { const { w, r } = readRow(si, i); logSet(si, i, w, r); } return; }
  if (e.target.id === 'cA' || e.target.id === 'cB') renderCompare();
  if (e.target.id === 'bDate') { const b = S.body[e.target.value]; const v = b && !b.del ? b : {}; $('bW').value = v.w ?? ''; $('bWaist').value = v.waist ?? ''; $('bBf').value = v.bf ?? ''; $('bNote').value = v.note ?? ''; }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const nw = weekKeyOf(new Date()); if (nw !== curWeek) { curWeek = nw; cur = (() => { const g = new Date().getDay(); return g >= 1 && g <= 5 ? g - 1 : 0; })(); renderAll(); }
  keepAwake(); sync();
});
window.addEventListener('online', () => sync());
document.addEventListener('pointerdown', () => keepAwake(), { once: true });

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
function applyTheme() {
  const r = document.documentElement.style; for (const k in TH) r.setProperty('--' + k, TH[k]);
  document.querySelector('meta[name=theme-color]').setAttribute('content', TH.bg);
  document.body.dataset.prof = PROF;
}
function selectProfile(p) {
  PROF = p; DAYS = PROFILES[p].days; TH = PROFILES[p].th; KEY = 'gym.v2.' + p;
  loadState(); now = new Date(); curWeek = weekKeyOf(now); cur = todayIdx();
  for (const k in urlCache) delete urlCache[k];
  clearInterval(rInt); $('rest').classList.remove('show'); closeSheet();
  if (PC) { PC.done = true; PC = null; $('pacer').classList.remove('show'); }
  applyTheme(); showTab('workout'); initCloud();
}
function lastSessionOf(p) {
  try {
    const d = JSON.parse(localStorage.getItem('gym.v2.' + p) || (p === 'king' ? localStorage.getItem('gym.v2') : null) || 'null'); if (!d) return null;
    let t = 0; for (const wk in d.logs) for (const di in d.logs[wk]) for (const id in d.logs[wk][di]) for (const s of (d.logs[wk][di][id].sets || [])) if (s && s.t > t) t = s.t;
    return t || null;
  } catch (e) { return null; }
}
const CROWN = '<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M6 40 2 10l16 12L32 2l14 20 16-12-4 30z" fill="currentColor"/><rect x="6" y="42" width="52" height="5" rx="2" fill="currentColor"/></svg>';
function showPicker() {
  const pk = $('picker');
  pk.innerHTML = ['king', 'qxeen'].map(p => {
    const t = lastSessionOf(p), P0 = PROFILES[p];
    return `<button class="half ${p}" data-prof="${p}"><div class="crown">${CROWN}</div><b>${P0.name.toUpperCase()}</b><span>${P0.tagline}</span><small>${t ? 'Last session ' + fmtD(new Date(t), { weekday: 'short', month: 'short', day: 'numeric' }) : 'Tap to start'}</small></button>`;
  }).join('') + `<div class="who">WHO'S TRAINING?</div>`;
  pk.className = 'show';
}
$('picker').addEventListener('click', e => {
  const b = e.target.closest('[data-prof]'); if (!b) return;
  const p = b.dataset.prof, pk = $('picker'); beep(1, .01, .001);
  pk.classList.add('pick-' + p);
  setTimeout(() => selectProfile(p), 380);
  setTimeout(() => { pk.className = ''; pk.innerHTML = ''; }, 820);
});
const autoP = localStorage.getItem('gym.autoProfile');
if (autoP && PROFILES[autoP]) selectProfile(autoP); else { applyTheme(); showPicker(); }
