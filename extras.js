/* Dantá & Desrica Gym: feature pack
   PRs · auto progression · warm-ups · plate calculator · deload · notes · routine editor
   streaks · scoreboard · nudges · partner mode · measurements · photo slider · ghost camera
   monthly recap card · Fuel tab (calories/protein/water/steps/cardio) · calendar reminders */
'use strict';

/* ---------- small helpers ---------- */
const other = () => PROF === 'king' ? 'qxeen' : 'king';
const barW = () => +S.settings.bar || (unit() === 'kg' ? 20 : 45);
const roundW = w => { const st = unit() === 'kg' ? 1.25 : 2.5; return Math.round(w / st) * st; };
const e1rm = (w, r) => w * (1 + r / 30);
const isDeload = wk => !!((S.settings.deloads || {})[wk]);
const todayKey = () => dk(new Date());
const isWeekday = d => d.getDay() >= 1 && d.getDay() <= 5;
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const GOAL_DEFAULTS = { king: { water: 10, steps: 8000, cardio: 60, weekDays: 4 }, qxeen: { water: 8, steps: 10000, cardio: 150, weekDays: 4 } };
const goals = () => ({ ...GOAL_DEFAULTS[PROF], ...(S.settings.goals || {}) });
const PAT_NAMES = { squat: 'Squat', hinge: 'Hinge / deadlift', lunge: 'Lunge / step-up', legcurl: 'Leg curl', thrust: 'Hip thrust / bridge', calf: 'Calf raise', bench: 'Bench / chest press', ohp: 'Overhead press', landmine: 'Landmine press', row: 'Bent-over row', seatedrow: 'Seated / cable row', pullup: 'Pull-up / pulldown', straightarm: 'Straight-arm pulldown', facepull: 'Face pull', curl: 'Curl / arm', legpress: 'Leg press', legraise: 'Leg raise', legext: 'Leg extension', crunch: 'Crunch', twist: 'Twist', plank: 'Plank', fly: 'Fly', dip: 'Dip', kickback: 'Glute kickback', abduct: 'Hip abduction', swing: 'Kettlebell swing', latraise: 'Lateral raise', walk: 'Walk / cardio', deadbug: 'Dead bug / core', thruster: 'Thruster' };

/* ---------- DOM additions ---------- */
document.querySelector('header').insertAdjacentHTML('afterend', '<div id="pbar" class="hide"></div>');
$('weekline').insertAdjacentHTML('afterend', '<div id="nudge"></div>');
document.body.insertAdjacentHTML('beforeend', `
  <button id="rother" class="hide"></button>
  <div id="pr" class="hide"><div class="prbox"><div class="trophy">🏆</div><b id="prT"></b><span id="prS"></span></div><div id="conf"></div></div>
  <div id="cam" class="hide"></div>`);

/* =====================================================================
   ROUTINE: custom edits + deload weeks
   ===================================================================== */
function baseRoutine() { return S.routine || PROFILES[PROF].days; }
function refreshFigures() { if (S.routine) for (const d of S.routine) for (const sl of d.slots) for (const o of sl.opts) { const l = libFind(o.n); o.pat = l ? l.pat : figFor(o.n, o.pat); } }
function applyRoutine() {
  refreshFigures(); const base = baseRoutine();
  DAYS = isDeload(curWeek) ? base.map(d => ({ ...d, slots: d.slots.map(sl => ({ ...sl, sets: Math.max(1, Math.ceil(sl.sets / 2)) })) })) : base;
}
function consecutiveTrainingWeeks() {
  let n = 0, wk = dk(addDays(parseDk(curWeek), -7));
  for (let i = 0; i < 52; i++) {
    const days = new Set(); const W = S.logs[wk] || {};
    for (const di in W) for (const id in W[di]) for (const s of (W[di][id].sets || [])) if (s && s.t) days.add(dk(new Date(s.t)));
    if (days.size >= 3 && !isDeload(wk)) { n++; wk = dk(addDays(parseDk(wk), -7)); } else break;
  }
  return n;
}
function setDeload(on) { S.settings.deloads = S.settings.deloads || {}; if (on) S.settings.deloads[curWeek] = true; else delete S.settings.deloads[curWeek]; touchSettings(); applyRoutine(); renderAll(); toast(on ? '🧘 Deload week on: half the sets, ~60% weights' : 'Deload week off'); }

/* =====================================================================
   AUTO PROGRESSION (suggested weight per exercise)
   ===================================================================== */
function autoSuggest(sl, last, id) {
  if (sl.time) return { w: '', html: '' };
  const dl = isDeload(curWeek), tgt = S.settings.targets[id];
  if (!last) {
    if (dl && tgt) { const w = roundW(tgt * .6); return { w, html: `<div class="sug">Deload week<br>→ ${w} ${unit()} (60%)</div>`, deload: true }; }
    return { w: '', html: '' };
  }
  const top = repTop(sl.reps), low = repLow(sl.reps), maxW = Math.max(...last.sets.map(s => +s.w || 0));
  if (!maxW) return { w: '', html: '' };
  if (dl) { const w = roundW(maxW * .6); return { w, html: `<div class="sug">Deload week<br>→ ${w} ${unit()} (60%)</div>`, deload: true }; }
  const base = baseRoutine()[cur] && baseRoutine()[cur].slots.find(x => x.reps === sl.reps) || sl;
  let w = maxW, html;
  const prev = sessions(id).filter(x => !(x.wk === curWeek && x.di === cur));
  if (top && last.sets.length >= base.sets && last.sets.every(s => +s.r >= top)) { w = maxW + inc(); html = `<div class="sug up">Hit the top of the range last time<br>→ ${w} ${unit()} today</div>`; }
  else if (low && last.sets.some(s => +s.r < low)) {
    const p2 = prev[prev.length - 2];
    const missedTwice = p2 && p2.sets.some(s => +s.r < low) && Math.max(...p2.sets.map(s => +s.w || 0)) >= maxW;
    if (missedTwice) { w = roundW(maxW * .9); html = `<div class="sug">Missed reps twice<br>→ reset to ${w} ${unit()}</div>`; }
    else html = `<div class="sug">Missed reps last time<br>→ stay at ${maxW} ${unit()}</div>`;
  } else html = `<div class="sug">Building reps<br>→ stay at ${maxW} ${unit()}</div>`;
  return { w: S.settings.autoFill === false ? '' : w, html };
}

/* =====================================================================
   PERSONAL RECORDS
   ===================================================================== */
function bestOf(id) {
  let w = 0, e = 0, any = false;
  for (const x of sessions(id)) { if (x.timed) continue; for (const s of x.sets) { any = true; const sw = +s.w || 0; if (sw > w) w = sw; const v = e1rm(sw, +s.r || 0); if (v > e) e = v; } }
  return { w, e, any };
}
function checkPR(name, before, set, timed) {
  if (!before.any || timed) return;
  const w = +set.w || 0, r = +set.r || 0; if (!w) return;
  if (w > before.w) celebrate(`NEW PR · ${name}`, `${w} ${unit()} × ${r}  (old best ${before.w})`);
  else if (e1rm(w, r) > before.e + .01) celebrate(`REP PR · ${name}`, `${w} × ${r} is your strongest set yet`);
}
let prT;
function celebrate(title, sub) {
  beep(784, .12, .3); setTimeout(() => beep(1046, .3, .3), 140); buzz([80, 60, 80, 60, 180]);
  $('prT').textContent = title; $('prS').textContent = sub;
  const cols = [TH.acc, TH.acc2, '#ffffff', '#3ecf8e'];
  $('conf').innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${cols[i % 4]};animation-delay:${Math.random() * .4}s;animation-duration:${1.4 + Math.random() * 1.2}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join('');
  const el = $('pr'); el.classList.remove('hide'); el.classList.add('show');
  clearTimeout(prT); prT = setTimeout(() => { el.classList.remove('show'); el.classList.add('hide'); }, 2800);
}
$('pr').addEventListener('click', () => { $('pr').classList.remove('show'); $('pr').classList.add('hide'); });
/* chronological scan → every set that beat the previous best weight (first day of an exercise is the baseline) */
function prScan(st = S) {
  const by = {};
  for (const wk in st.logs) for (const di in st.logs[wk]) for (const id in st.logs[wk][di]) {
    const e = st.logs[wk][di][id]; if (e.timed) continue;
    for (const s of (e.sets || [])) if (s && +s.w) { (by[id] = by[id] || { n: e.n, sets: [] }).sets.push({ w: +s.w, r: +s.r || 0, t: s.t || parseDk(wk).getTime() }); }
  }
  const prs = [], best = {};
  for (const id in by) {
    const L = by[id].sets.sort((a, b) => a.t - b.t), firstDay = dk(new Date(L[0].t)); let bw = 0, be = 0;
    for (const s of L) {
      const v = e1rm(s.w, s.r);
      if (dk(new Date(s.t)) !== firstDay && (s.w > bw || v > be + .01)) prs.push({ id, n: by[id].n, ...s, kind: s.w > bw ? 'weight' : 'reps' });
      if (s.w > bw) bw = s.w; if (v > be) be = v;
      if (!best[id] || s.w > best[id].w || (s.w === best[id].w && s.r > best[id].r)) best[id] = { n: by[id].n, w: s.w, r: s.r, t: s.t };
    }
    if (best[id]) best[id].e = Math.round(be);
  }
  return { prs: prs.sort((a, b) => b.t - a.t), best };
}

/* =====================================================================
   WORKOUT CARD EXTRAS: warm-up, plates, notes
   ===================================================================== */
const isBarbell = ex => /barbell|smith|bench press|back squat|hip thrust|good morning|pendlay|t-bar|landmine|deadlift|overhead press|\brdl\b|hack squat/i.test(ex.n) && !/dumbbell|\bdb\b|cable|machine|goblet|band|single-arm/i.test(ex.n);
function extraChips(sl, ex, si) {
  if (sl.time) return '';
  let h = '';
  if (si === 0 || sl.rest >= 120) h += `<button class="chip" data-warm="${si}">🔥 Warm-up</button>`;
  if (isBarbell(ex)) h += `<button class="chip" data-plates="${si}">🏋️ Plates</button>`;
  return h;
}
function noteHtml(si, id, last) {
  const e = entry(curWeek, cur, id), v = e && e.note || '';
  return `${last && last.note ? `<div class="last">📝 Last note: ${esc(last.note)}</div>` : ''}<textarea class="note" data-note="${si}" rows="1" placeholder="📝 Notes (e.g. felt it in lower back, use blue band)">${esc(v)}</textarea>`;
}
function workWeight(si) {
  const inp = document.querySelector(`[data-w="${si}:0"]`); const id = exId(exOf(cur, si));
  return num(inp && inp.value) || num(S.settings.targets[id]) || 0;
}
function warmupSets(work, barbell) {
  const bar = barbell ? barW() : 0;
  if (!work) return [];
  const steps = barbell ? [[0, 10], [.5, 5], [.7, 3], [.85, 1]] : [[.5, 8], [.75, 3]];
  const out = [];
  for (const [p, r] of steps) {
    let w = p === 0 ? bar : Math.max(bar, Math.round(work * p / inc()) * inc());
    if (w >= work || (out.length && w <= out[out.length - 1].w)) continue;
    out.push({ w, r });
  }
  return out;
}
function warmSheet(si) {
  const ex = exOf(cur, si), bb = isBarbell(ex), work = workWeight(si);
  const sets = warmupSets(work, bb);
  openSheet(`<h3>Warm-up · ${esc(ex.n)}</h3><div class="sub">${work ? `Ramp up to your working weight of <b>${work} ${unit()}</b>. Rest about 60 sec between these, and don't log them.` : 'Enter a weight in set 1 (or a target) first and the warm-up builds from it.'}</div>
    ${sets.map((s, i) => `<button class="wu" data-wu><span class="wn">${i + 1}</span><b>${s.w ? s.w + ' ' + unit() : 'Light'} × ${s.r}</b><span class="wp">${bb ? plateText(s.w) : ''}</span><span class="wc">✓</span></button>`).join('')}
    ${work ? `<div class="wu work"><span class="wn">→</span><b>${work} ${unit()} working sets</b><span class="wp">${bb ? plateText(work) : ''}</span></div>` : ''}
    <div class="muted" style="margin-top:10px">Tap each one as you finish it.</div>`);
}
/* ---------- plate calculator ---------- */
const PLATES = { lb: [45, 35, 25, 10, 5, 2.5], kg: [25, 20, 15, 10, 5, 2.5, 1.25] };
const PCOL = { 45: '#d23b3b', 25: '#d23b3b', 35: '#e3b341', 20: '#3a6fd8', 15: '#e3b341', 10: '#3fae5a', 5: '#e8e8e8', 2.5: '#8b8b93', 1.25: '#8b8b93' };
function plateSplit(total) {
  const bar = barW(); let side = (total - bar) / 2; if (side < 0) return null;
  const out = []; for (const p of PLATES[unit()]) while (side >= p - 1e-9) { out.push(p); side -= p; }
  return { out, rem: Math.round(side * 2 * 100) / 100 };
}
function plateText(w) { const r = plateSplit(w); if (!r) return 'Empty bar'; return r.out.length ? r.out.join(' + ') + ' /side' : 'Empty bar'; }
function plateViz(total) {
  const r = plateSplit(total);
  if (!total) return '<div class="muted">Type a weight above.</div>';
  if (!r) return `<div class="muted">That's lighter than the ${barW()} ${unit()} bar.</div>`;
  const max = Math.max(...PLATES[unit()]);
  const pl = r.out.map(p => `<i style="height:${40 + 90 * p / max}px;background:${PCOL[p] || '#aaa'};width:${p >= 10 ? 16 : 11}px" title="${p}"></i>`).join('');
  return `<div class="bar-viz"><div class="sleeve"></div>${pl}<div class="collar"></div><div class="shaft"></div></div>
    <div class="ptxt"><b>Each side:</b> ${r.out.length ? r.out.map(p => `<span class="pp" style="--pc:${PCOL[p] || '#aaa'}">${p}</span>`).join(' ') : 'nothing, just the bar'}</div>
    ${r.rem ? `<div class="muted">⚠️ Can't make it exactly. ${r.rem} ${unit()} short with standard plates.</div>` : ''}`;
}
function plateSheet(si) {
  const w = si != null ? workWeight(si) : '';
  const bars = unit() === 'kg' ? [20, 15, 10] : [45, 35, 15];
  openSheet(`<h3>Plate calculator</h3><div class="sub">What to load on each side of the bar.</div>
    <label class="fld">Total weight (${unit()})<input id="plW" inputmode="decimal" value="${w || ''}" placeholder="e.g. 185"></label>
    <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><span class="muted">Bar:</span>${bars.map(b => `<button class="chip ${barW() === b ? 'on' : ''}" data-bar="${b}">${b} ${unit()}</button>`).join('')}</div>
    <div id="plOut" style="margin-top:14px">${plateViz(num(w))}</div>`);
}

/* =====================================================================
   STREAKS · SUMMARIES · NUDGES · SCOREBOARD
   ===================================================================== */
function trainedDates(st) { const set = new Set(); for (const wk in st.logs) for (const di in st.logs[wk]) for (const id in st.logs[wk][di]) for (const s of (st.logs[wk][di][id].sets || [])) if (s && s.t) set.add(dk(new Date(s.t))); return set; }
function dayStreak(dates) {
  let d = new Date(), n = 0; if (!dates.has(dk(d))) d = addDays(d, -1);
  for (let i = 0; i < 500; i++) { if (!isWeekday(d)) { if (dates.has(dk(d))) n++; d = addDays(d, -1); continue; } if (dates.has(dk(d))) { n++; d = addDays(d, -1); } else break; }
  return n;
}
function weekStreak(dates, goal) {
  const cnt = wk => { let c = 0; for (let i = 0; i < 7; i++) if (dates.has(dk(addDays(parseDk(wk), i)))) c++; return c; };
  let wk = weekKeyOf(new Date()), n = 0; if (cnt(wk) < goal) wk = dk(addDays(parseDk(wk), -7));
  for (let i = 0; i < 104; i++) { if (cnt(wk) >= goal) { n++; wk = dk(addDays(parseDk(wk), -7)); } else break; }
  return n;
}
function summaryOf(st, prof) {
  const dates = trainedDates(st), now2 = new Date(), wk = weekKeyOf(now2), mk = monthKey(now2), td = dk(now2);
  let lastT = 0, todayTitle = '', todayDi = null, todaySets = 0, last = null;
  const days = st.routine || PROFILES[prof].days;
  for (const w in st.logs) for (const di in st.logs[w]) for (const id in st.logs[w][di]) {
    const e2 = st.logs[w][di][id];
    (e2.sets || []).forEach((s, i) => {
      if (!s || !s.t) return;
      if (s.t > lastT) { lastT = s.t; last = { e: e2, di: +di, i, s }; }
      if (dk(new Date(s.t)) === td) { todaySets++; todayDi = +di; todayTitle = days[di] ? days[di].title : 'a workout'; }
    });
  }
  const set2 = st.settings || {}, sw = set2.swaps || {}, dl = (set2.deloads || {})[wk];
  const slotSets = sl => dl ? Math.max(1, Math.ceil(sl.sets / 2)) : sl.sets;
  const todayTotal = todayDi != null && days[todayDi] ? days[todayDi].slots.reduce((a, sl) => a + slotSets(sl), 0) : 0;
  let lastSet = null;
  if (last) {
    const D = days[last.di]; let of = (last.e.sets || []).filter(Boolean).length;
    if (D) D.slots.forEach((sl, si) => { const v = sw[last.di + '-' + si]; const nm = typeof v === 'string' && v.startsWith('n:') ? v.slice(2) : (sl.opts[+v || 0] || sl.opts[0]).n; if (nm === last.e.n || sl.opts.some(o => o.n === last.e.n)) of = slotSets(sl); });
    lastSet = { n: last.e.n, w: last.s.w, r: last.s.r, i: last.i + 1, of, t: last.s.t, timed: !!last.e.timed };
  }
  let weekDays = 0; for (let i = 0; i < 7; i++) if (dates.has(dk(addDays(parseDk(wk), i)))) weekDays++;
  const monthDays = [...dates].filter(d => d.startsWith(mk)).length;
  const g = { ...GOAL_DEFAULTS[prof], ...(set2.goals || {}) };
  const sc = prScan(st), prsMonth = sc.prs.filter(p => monthKey(new Date(p.t)) === mk).length, p0 = sc.prs[0];
  return { prof, name: PROFILES[prof].name, lastT, todayTitle, todaySets, todayTotal, lastSet, lastPR: p0 ? { n: p0.n, w: p0.w, r: p0.r, t: p0.t } : null, weekDays, monthDays, dayStreak: dayStreak(dates), weekStreak: weekStreak(dates, g.weekDays), prsMonth, workouts: dates.size, at: Date.now(), wk, mk, td };
}
function freshen(sm) { // a summary computed earlier: zero out counters from a past week/month/day
  if (!sm) return null; const now2 = new Date(), x = { ...sm };
  if (x.wk !== weekKeyOf(now2)) x.weekDays = 0;
  if (x.mk !== monthKey(now2)) { x.monthDays = 0; x.prsMonth = 0; }
  if (x.td !== dk(now2)) { x.todayTitle = ''; x.todaySets = 0; x.todayTotal = 0; x.restEnd = 0; }
  const lastD = x.lastT ? new Date(x.lastT) : null;
  if (lastD) { let d = addDays(new Date(), -1); while (!isWeekday(d)) d = addDays(d, -1); if (dk(lastD) < dk(d)) x.dayStreak = 0; }
  return x;
}
function partnerSummary() {
  const o = other(); let local = null, cloud = null;
  try { const raw = localStorage.getItem('gym.v2.' + o); if (raw) { const st = readState(o); if (trainedDates(st).size) local = summaryOf(st, o); } } catch (e) { }
  try { cloud = freshen((JSON.parse(localStorage.getItem('gym.pub') || '{}'))[o]); } catch (e) { }
  if (local && cloud) return (cloud.lastT >= local.lastT) ? cloud : local;
  return local || cloud;
}
async function publishSummary(prof, uid, cl, st) {
  try {
    const sm = shareable(summaryOf(st, prof), prof, st);
    const { error } = await cl.from('gym_public').upsert({ user_id: uid, profile: prof, data: sm, updated_at: new Date().toISOString() });
    if (error) throw error;
    const { data, error: e2 } = await cl.from('gym_public').select('profile,data');
    if (e2) throw e2;
    for (const r of data || []) onLive(r);
    localStorage.removeItem('gym.pubMissing'); ensureRealtime();
  } catch (e) { if (/gym_public|relation|schema cache|does not exist/i.test(String(e && (e.message || e.code || e)))) localStorage.setItem('gym.pubMissing', '1'); }
}
function renderNudges() {
  const el = $('nudge'); if (!el) return;
  const me = summaryOf(S, PROF), pt = partnerSummary(), oName = PROFILES[other()].name;
  const lines = [];
  const g = goals(), today = new Date(), todayIdx2 = isWeekday(today) ? today.getDay() - 1 : -1;
  // deload
  if (isDeload(curWeek)) lines.push(`<div class="banner">🧘 <b>Deload week.</b> Half the sets at about 60% weight, so your joints and nervous system recover and you come back stronger. <button class="chip" data-deload="off">End deload</button></div>`);
  else { const n = consecutiveTrainingWeeks(); if (n >= 6) lines.push(`<div class="banner">📉 <b>${n} straight weeks of training.</b> A lighter deload week now helps you keep progressing. <button class="chip" data-deload="on">Make this a deload week</button></div>`); }
  // couple nudges
  if (pt) lines.push(liveCard(pt));
  if (pt) {
    if (me.todayTitle && pt.todayTitle) lines.push(`<div class="nud both">🔥 You both trained today. Locked in.</div>`);
    else if (me.todayTitle && !pt.todayTitle && todayIdx2 >= 0) lines.push(`<div class="nud">✅ You're done today. ${oName} hasn't trained yet, go hype them up 😤</div>`);
  } else if (!me.todayTitle && todayIdx2 >= 0) lines.push(`<div class="nud">📅 Today is <b>${esc((DAYS[todayIdx2] || {}).title || '')}</b>. Let's get it.</div>`);
  if (me.dayStreak || me.weekStreak) lines.push(`<div class="streaks"><span>🔥 <b>${me.dayStreak}</b> day streak</span><span>📆 <b>${me.weekStreak}</b> week streak <small>(${g.weekDays}+ days/wk)</small></span>${pt ? `<span class="vs">${oName}: 🔥${pt.dayStreak}</span>` : ''}</div>`);
  el.innerHTML = lines.join('');
}
function renderScore() {
  const me = summaryOf(S, PROF), pt = partnerSummary(), mine = PROFILES[PROF], theirs = PROFILES[other()];
  let h = `<div class="dayhead"><div><h2>Scoreboard</h2><div class="sub">${fmtMonth(monthKey(new Date()))}${rtStatus === 'SUBSCRIBED' ? ' · <span class="lvtag">● Live</span>' : ''}</div></div><button class="chip acc" data-recap>📤 Monthly recap</button></div>`;
  if (!pt) {
    h += `<div class="card muted">${theirs.name}'s stats show up here once they've logged a workout${getCfg().url ? ' and synced' : ' on this phone'}.${localStorage.getItem('gym.pubMissing') ? '<br><br>⚠️ Run the <b>scoreboard SQL</b> from the setup guide in Supabase to share stats between your accounts.' : ''}</div>`;
  }
  const rows = [['This week', 'weekDays', 'days'], ['This month', 'monthDays', 'days'], ['Day streak', 'dayStreak', ''], ['Week streak', 'weekStreak', 'wks'], ['PRs this month', 'prsMonth', ''], ['All-time workouts', 'workouts', '']];
  const L = PROF === 'king' ? me : pt, R = PROF === 'king' ? pt : me;
  let lw = 0, rw = 0;
  h += `<div class="card score"><div class="sc-h"><span class="kq k">${PROFILES.king.name}</span><span></span><span class="kq q">${PROFILES.qxeen.name}</span></div>` + rows.map(([lab, k, u]) => {
    const a = L ? L[k] || 0 : null, b = R ? R[k] || 0 : null;
    if (a != null && b != null && k !== 'workouts') { if (a > b) lw++; else if (b > a) rw++; }
    return `<div class="sc-r"><b class="${a != null && b != null && a > b ? 'lead' : ''}">${a ?? '—'}</b><span>${lab}</span><b class="${a != null && b != null && b > a ? 'lead' : ''}">${b ?? '—'}</b></div>`;
  }).join('') + (L && R ? `<div class="sc-f">${lw === rw ? '🤝 Dead even right now' : (lw > rw ? PROFILES.king.name : PROFILES.qxeen.name) + ' is winning ' + Math.max(lw, rw) + '–' + Math.min(lw, rw)}</div>` : '') + `</div>`;
  h += `<div class="muted" style="font-size:12px;text-align:center">Streaks count weekdays. Weekends never break a streak.</div>`;
  $('histBody').innerHTML = h;
}
function renderPRs() {
  const { prs, best } = prScan(S);
  const ids = Object.keys(best).sort((a, b) => best[a].n.localeCompare(best[b].n));
  let h = `<div class="dayhead"><div><h2>Personal records</h2><div class="sub">${prs.length} PR${prs.length === 1 ? '' : 's'} hit so far</div></div></div>`;
  if (!ids.length) h += `<div class="card muted">Log a few sessions and your best lifts show up here. Beat one and you'll know about it 🏆</div>`;
  if (prs.length) h += `<div class="card"><h3>Recent PRs</h3>${prs.slice(0, 8).map(p => `<div class="hrow"><span>${fmtD(new Date(p.t), { month: 'short', day: 'numeric' })}</span><b style="flex:1">${esc(p.n)}</b><b class="acc2">${p.w}×${p.r}</b></div>`).join('')}</div>`;
  if (ids.length) h += `<div class="card"><h3>Best lifts</h3>${ids.map(id => { const b = best[id]; return `<div class="hrow"><b style="flex:1">${esc(b.n)}</b><span>${b.w} ${unit()} × ${b.r}<br><small>est. 1RM ${b.e} · ${fmtD(new Date(b.t), { month: 'short', day: 'numeric', year: '2-digit' })}</small></span></div>`; }).join('')}</div>`;
  $('histBody').innerHTML = h;
}
let histSeg = 'weeks';
function renderHistory() {
  $('hist').innerHTML = `<div class="seg">${[['weeks', 'Weeks'], ['prs', 'PRs 🏆'], ['score', 'Scoreboard']].map(([k, l]) => `<button class="${histSeg === k ? 'on' : ''}" data-hseg="${k}">${l}</button>`).join('')}</div><div id="histBody"></div>`;
  if (histSeg === 'prs') renderPRs(); else if (histSeg === 'score') renderScore(); else renderWeeks();
}

/* =====================================================================
   PARTNER MODE (train together on one phone)
   ===================================================================== */
const partnerOn = () => localStorage.getItem('gym.partnerMode') === '1';
function renderPBar() {
  const el = $('pbar'); if (!el) return;
  if (!partnerOn() || tab !== 'workout') { el.classList.add('hide'); return; }
  el.classList.remove('hide');
  el.innerHTML = ['king', 'qxeen'].map(p => `<button class="${p} ${p === PROF ? 'on' : ''}" data-pswitch="${p}">${PROFILES[p].name}${RT[p] && !RT[p].done && p !== PROF ? ' · resting' : ''}</button>`).join('');
}
$('rother').addEventListener('click', () => { const p = $('rother').dataset.prof; if (p && p !== PROF) quickSwitch(p); });
function quickSwitch(p) { const keepTab = tab; selectProfile(p); if (keepTab !== 'workout') showTab(keepTab); }

/* =====================================================================
   BODY: measurements, compare slider, ghost camera, photo saving
   ===================================================================== */
const MEAS = [['waist', 'Waist'], ['chest', 'Chest'], ['arms', 'Arms'], ['thighs', 'Thighs'], ['hips', 'Hips / glutes'], ['bf', 'Body fat %']];
function measureCard() {
  const ds = Object.keys(S.body).filter(d => !S.body[d].del).sort();
  const rows = MEAS.map(([k, lab]) => { const v = ds.filter(d => num(S.body[d][k])); if (!v.length) return ''; const f = num(S.body[v[0]][k]), l = num(S.body[v[v.length - 1]][k]), d = Math.round((l - f) * 10) / 10; return `<button class="hrow mrow" data-mchart="${k}"><span>${lab}</span><b>${l}${k === 'bf' ? '%' : '"'}</b><span class="${d < 0 ? 'down' : d > 0 ? 'upc' : ''}">${v.length > 1 ? (d > 0 ? '+' : '') + d : 'first entry'}</span></button>`; }).join('');
  return `<div class="card"><h3>Measurements</h3>${rows || '<div class="muted">Add measurements in the form above. Monthly is plenty, same time of day, tape snug but not tight.</div>'}${rows ? '<div class="muted" style="font-size:12px;margin-top:6px">Change shown since your first entry. Tap a row for its chart.</div>' : ''}</div>`;
}
function measureChart(k) {
  const lab = (MEAS.find(m => m[0] === k) || [])[1];
  const pts = Object.keys(S.body).filter(d => !S.body[d].del && num(S.body[d][k])).sort().map(d => ({ x: parseDk(d).getTime(), y: num(S.body[d][k]) }));
  openSheet(`<h3>${lab}</h3><div class="sub">${pts.length} entries</div>${lineChart(pts, { title: lab + (k === 'bf' ? ' (%)' : ' (in)') })}`);
}
let cmpMode = 'side';
async function renderCompare() {
  const A = $('cA'), B = $('cB'); if (!A) return;
  const ua = photoMeta(A.value, cmpPose) ? await photoURL(A.value, cmpPose) : null, ub = photoMeta(B.value, cmpPose) ? await photoURL(B.value, cmpPose) : null;
  if (cmpMode === 'slider' && ua && ub) {
    $('cmp').className = 'sldwrap';
    $('cmp').innerHTML = `<div class="sld" id="sld"><img src="${ua}" alt=""><div class="sld-top" id="sldTop"><img src="${ub}" alt=""></div><div class="sld-line" id="sldLine"><i>⟷</i></div><span class="sl a">${fmtMonth(A.value)}</span><span class="sl b">${fmtMonth(B.value)}</span></div>`;
    setSlider(50);
  } else {
    $('cmp').className = 'cmp';
    const one = (u, m) => `<figure>${u ? `<img src="${u}">` : `<div class="empty">No ${cmpPose} photo</div>`}<figcaption>${fmtMonth(m)}</figcaption></figure>`;
    $('cmp').innerHTML = one(ua, A.value) + one(ub, B.value);
    if (cmpMode === 'slider') $('cmp').insertAdjacentHTML('beforeend', '<div class="muted" style="grid-column:1/-1;font-size:12px">The slider needs a photo of this pose in both months.</div>');
  }
}
function setSlider(pct) { const t = $('sldTop'), l = $('sldLine'); if (!t) return; pct = Math.max(0, Math.min(100, pct)); t.style.clipPath = `inset(0 0 0 ${pct}%)`; l.style.left = pct + '%'; }
let sldDrag = false;
document.addEventListener('pointerdown', e => { const s = e.target.closest('#sld'); if (!s) return; sldDrag = true; s.setPointerCapture && s.setPointerCapture(e.pointerId); moveSld(e, s); });
document.addEventListener('pointermove', e => { if (!sldDrag) return; const s = $('sld'); if (s) moveSld(e, s); });
document.addEventListener('pointerup', () => sldDrag = false);
function moveSld(e, s) { const r = s.getBoundingClientRect(); setSlider((e.clientX - r.left) / r.width * 100); }

async function savePhotoBlob(m, p, fileOrBlob) {
  toast('Saving photo…');
  try {
    const blob = await compressImage(fileOrBlob), u = Date.now(), old = photoMeta(m, p);
    if (old) await idbDel(`${m}-${p}-${old.u}`);
    await idbPut(`${m}-${p}-${u}`, blob);
    S.photos[m] = S.photos[m] || {}; S.photos[m][p] = { u, up: false, path: null };
    if (old && old.path) S.photos[m][p].oldPath = old.path;
    save(); closeSheet(); renderBody(); toast('📸 Photo saved' + (session ? ', uploading…' : ''));
  } catch (e) { toast('Could not save that photo'); }
}
function photoChoice(mp) {
  const [m, p] = mp.split('|');
  const g = ghostFor(m, p);
  openSheet(`<h3>${fmtMonth(m)} · ${p}</h3><div class="sub">For a fair comparison, use the same spot, lighting and time of day each month.</div>
    <button class="btn acc" data-camopen="${mp}">📷 Camera${g ? ' with ghost overlay' : ''}</button>
    <button class="btn" data-libpick="${mp}">🖼 Choose from photos</button>
    ${g ? `<div class="muted" style="margin-top:8px;font-size:12px">The ghost shows your ${fmtMonth(g)} ${p} photo faintly over the camera, so you can line up the same way.</div>` : ''}`);
}
function ghostFor(m, p) { return Object.keys(S.photos).filter(x => x < m && photoMeta(x, p)).sort().pop() || null; }
let camStream = null, camFacing = 'user', camTimer = 0, camTarget = null, camShot = null;
async function openCam(mp) {
  closeSheet(); camTarget = mp.split('|'); camShot = null;
  const [m, p] = camTarget, g = ghostFor(m, p), gurl = g ? await photoURL(g, p) : null;
  const el = $('cam'); el.classList.remove('hide');
  el.innerHTML = `<div class="cam-top"><button class="cbtn" data-camx>✕</button><b>${p[0].toUpperCase() + p.slice(1)} · ${fmtMonth(m)}</b><button class="cbtn" data-camflip>⟲</button></div>
    <div class="cam-view" id="camView"><video id="camV" playsinline autoplay muted></video>${gurl ? `<img id="camG" src="${gurl}" alt="">` : ''}<div class="cam-grid"></div><div id="camCount"></div><img id="camShot" class="hide" alt=""></div>
    <div class="cam-ctl" id="camCtl">
      ${gurl ? `<label class="ghostctl">Ghost <input type="range" id="camGO" min="0" max="80" value="35"></label>` : '<div class="muted" style="text-align:center;font-size:12px">No earlier photo of this pose yet. Next month you get a ghost overlay to line up with.</div>'}
      <div class="row" style="justify-content:center;gap:6px">${[0, 3, 10].map(t => `<button class="chip ${camTimer === t ? 'on' : ''}" data-camt="${t}">${t ? t + 's timer' : 'No timer'}</button>`).join('')}</div>
      <button class="shutter" data-camsnap aria-label="Take photo"></button>
    </div>
    <div class="cam-ctl hide" id="camAfter"><div class="grid2"><button class="btn" data-camretake>Retake</button><button class="btn acc" data-camuse>Use photo</button></div></div>`;
  if ($('camG')) $('camG').style.opacity = .35;
  await startCam();
}
async function startCam() {
  stopCam();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: camFacing, width: { ideal: 1440 }, height: { ideal: 1920 } }, audio: false });
    const v = $('camV'); v.srcObject = camStream; await v.play().catch(() => { });
    const mir = camFacing === 'user'; v.style.transform = mir ? 'scaleX(-1)' : ''; if ($('camG')) $('camG').style.transform = mir ? 'scaleX(-1)' : '';
  } catch (e) { closeCam(); toast('Camera unavailable. Choose a photo instead', 3500); if (camTarget) { pendingPhoto = camTarget; $('photoInput').click(); } }
}
function stopCam() { if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
function closeCam() { stopCam(); $('cam').classList.add('hide'); $('cam').innerHTML = ''; }
function snapCam() {
  const go = () => {
    const v = $('camV'); if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    const x = c.getContext('2d'); if (camFacing === 'user') { x.translate(c.width, 0); x.scale(-1, 1); } x.drawImage(v, 0, 0);
    c.toBlob(b => { camShot = b; const im = $('camShot'); im.src = URL.createObjectURL(b); im.classList.remove('hide'); $('camCtl').classList.add('hide'); $('camAfter').classList.remove('hide'); }, 'image/jpeg', .92);
    beep(1200, .05, .2);
  };
  if (!camTimer) return go();
  let n = camTimer; const cc = $('camCount'); cc.textContent = n; beep(660, .06, .2);
  const iv = setInterval(() => { n--; if (n <= 0) { clearInterval(iv); cc.textContent = ''; go(); } else { cc.textContent = n; beep(660, .06, .2); } }, 1000);
}

/* =====================================================================
   MONTHLY RECAP CARD (shareable image)
   ===================================================================== */
function monthStats(mk) {
  const dates = [...trainedDates(S)].filter(d => d.startsWith(mk));
  let sets = 0, vol = 0;
  for (const wk in S.logs) for (const di in S.logs[wk]) for (const id in S.logs[wk][di]) for (const s of (S.logs[wk][di][id].sets || [])) if (s && s.t && monthKey(new Date(s.t)) === mk) { sets++; vol += num(s.w) * num(s.r); }
  const prs = prScan(S).prs.filter(p => monthKey(new Date(p.t)) === mk);
  const topPR = {}; for (const p of prs) if (!topPR[p.id] || p.w > topPR[p.id].w) topPR[p.id] = p;
  const bw = bodyList().filter(d => d.startsWith(mk)).map(d => num(S.body[d].w));
  return { workouts: dates.length, sets, vol: Math.round(vol), prs: prs.length, top: Object.values(topPR).sort((a, b) => b.w - a.w).slice(0, 3), bwChange: bw.length > 1 ? Math.round((bw[bw.length - 1] - bw[0]) * 10) / 10 : null, streak: summaryOf(S, PROF).dayStreak };
}
async function drawRecap(mk) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  try { await document.fonts.load('80px "Bebas Neue"'); await document.fonts.load('700 30px Inter'); } catch (e) { }
  const BEB = '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif', INT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif', st = monthStats(mk), k = PROF === 'king';
  const g = x.createLinearGradient(0, 0, W, H);
  if (k) { g.addColorStop(0, '#b56a00'); g.addColorStop(.4, '#2a1700'); g.addColorStop(1, '#000'); } else { g.addColorStop(0, '#8a3fc4'); g.addColorStop(.45, '#24103a'); g.addColorStop(1, '#05030a'); }
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 3; roundRect(x, 36, 36, W - 72, H - 72, 60); x.stroke();
  x.textAlign = 'center'; x.fillStyle = '#fff';
  x.font = `800 120px ${BEB}`; x.fillText(PROFILES[PROF].name, W / 2, 270);
  x.font = `600 34px ${INT}`; x.fillStyle = '#fff'; x.globalAlpha = .8; x.fillText(fmtMonth(mk) + ' recap', W / 2, 340); x.globalAlpha = 1;
  const tiles = [[st.workouts, 'WORKOUTS'], [st.sets, 'SETS'], [st.prs, "PR'S HIT"], [st.vol >= 10000 ? Math.round(st.vol / 1000) + 'K' : st.vol, unit().toUpperCase() + ' LIFTED'], [st.bwChange == null ? '—' : (st.bwChange > 0 ? '+' : '') + st.bwChange, 'BODYWEIGHT ' + unit().toUpperCase()], [st.streak, 'DAY STREAK']];
  tiles.forEach(([v, l], i) => {
    const cx = 110 + (i % 3) * 300, cy = 460 + Math.floor(i / 3) * 250;
    x.fillStyle = 'rgba(255,255,255,.1)'; roundRect(x, cx - 10, cy, 280, 220, 40); x.fill();
    x.fillStyle = TH.acc; x.font = `800 84px ${BEB}`; x.fillText(String(v), cx + 130, cy + 128);
    x.fillStyle = '#fff'; x.globalAlpha = .75; x.font = `600 24px ${INT}`; x.fillText(l, cx + 130, cy + 186); x.globalAlpha = 1;
  });
  x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = `800 46px ${BEB}`; x.fillText('Top lifts', 100, 1060);
  x.font = `600 32px ${INT}`;
  (st.top.length ? st.top : [{ n: 'Keep pushing. PRs are coming', w: '', r: '' }]).forEach((p, i) => {
    const y = 1115 + i * 52; x.fillStyle = '#fff'; x.fillText((p.w ? '🏆 ' : '') + p.n.slice(0, 30), 100, y);
    if (p.w) { x.textAlign = 'right'; x.fillStyle = TH.acc; x.fillText(`${p.w} × ${p.r}`, W - 100, y); x.textAlign = 'left'; }
  });
  x.textAlign = 'center'; x.globalAlpha = .6; x.fillStyle = '#fff'; x.font = `500 24px ${INT}`; x.fillText('DANTÁ & DESRICA · GYM', W / 2, H - 70); x.globalAlpha = 1;
  return new Promise(r => c.toBlob(r, 'image/png'));
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
let recapBlob = null, recapMonth = null;
async function recapSheet(mk) {
  recapMonth = mk || monthKey(new Date());
  const thisM = monthKey(new Date()), lastM = monthKey(addDays(parseDk(thisM + '-01'), -1));
  openSheet(`<h3>Monthly recap</h3><div class="row" style="gap:6px;margin-bottom:10px">${[thisM, lastM].map(m => `<button class="chip ${m === recapMonth ? 'on' : ''}" data-recapm="${m}">${fmtMonth(m)}</button>`).join('')}</div><div id="recapImg" class="muted">Drawing…</div>`);
  recapBlob = await drawRecap(recapMonth);
  const u = URL.createObjectURL(recapBlob);
  $('recapImg').innerHTML = `<img class="bigimg" src="${u}" alt="Recap card"><div class="grid2"><button class="btn acc" data-recapshare>📤 Share</button><button class="btn" data-recapsave>⬇ Save</button></div>`;
}
async function shareRecap() {
  if (!recapBlob) return;
  const f = new File([recapBlob], `${PROF}-recap-${recapMonth}.png`, { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: PROFILES[PROF].label + ' recap' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  download(f.name, recapBlob); toast('Saved. Share it from your photos/files');
}

/* =====================================================================
   FUEL TAB
   ===================================================================== */
let fuelDate = todayKey();
const fuelOf = d => (S.fuel || {})[d] || {};
function setFuel(d, k, v) { S.fuel = S.fuel || {}; const f = { ...fuelOf(d) }; f[k] = Math.max(0, Math.round(num(v) * 10) / 10); f.u = Date.now(); S.fuel[d] = f; save(); }
function workoutCardioMin(fromKey, toKey) {
  let m = 0;
  for (const wk in S.logs) for (const di in S.logs[wk]) for (const id in S.logs[wk][di]) {
    const e = S.logs[wk][di][id]; if (!e.timed) continue;
    for (const s of (e.sets || [])) if (s && s.t && +s.r >= 120) { const d = dk(new Date(s.t)); if (d >= fromKey && d <= toKey) m += Math.round(+s.r / 60); }
  }
  return m;
}
function ring(val, goal, label, unitLbl, k, step) {
  const pct = goal ? Math.min(1, val / goal) : 0, C = 2 * Math.PI * 34;
  return `<div class="fring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" stroke="var(--line)" stroke-width="8" fill="none"/><circle cx="40" cy="40" r="34" stroke="${pct >= 1 ? '#3ecf8e' : 'var(--acc)'}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 40 40)"/></svg>
    <div class="fv"><b>${val.toLocaleString()}</b><small>${goal ? '/ ' + goal.toLocaleString() : 'no goal'}</small></div><div class="fl">${label}${unitLbl ? ` <small>${unitLbl}</small>` : ''}</div></div>`;
}
function renderFuel() {
  const g = goals(), f = fuelOf(fuelDate), d = parseDk(fuelDate), isToday = fuelDate === todayKey();
  const wk = weekKeyOf(d), wkEnd = dk(addDays(parseDk(wk), 6));
  const wCardio = workoutCardioMin(wk, wkEnd); let cardioWeek = wCardio;
  for (let i = 0; i < 7; i++) cardioWeek += num(fuelOf(dk(addDays(parseDk(wk), i))).cardio);
  let h = `<div class="dayhead"><div><h2>Fuel</h2><div class="sub">Calories, protein, water, steps & cardio</div></div></div>
    <div class="fdate"><button class="cbtn" data-fday="-1">‹</button><b>${isToday ? 'Today' : fmtD(d, { weekday: 'long', month: 'short', day: 'numeric' })}</b><button class="cbtn" data-fday="1" ${isToday ? 'disabled' : ''}>›</button></div>
    <div class="card"><div class="frings">${ring(num(f.cal), g.cal, 'Calories', '', 'cal')}${ring(num(f.protein), g.protein, 'Protein', 'g', 'protein')}${ring(num(f.water), g.water, 'Water', 'glasses', 'water')}${ring(num(f.steps), g.steps, 'Steps', '', 'steps')}</div></div>`;
  const q = (k, lab, unitL, adds) => `<div class="card fq"><div class="fqh"><b>${lab}</b><input inputmode="decimal" data-fset="${k}" value="${num(f[k]) || ''}" placeholder="0"><span class="muted">${unitL}</span></div><div class="chips">${adds.map(a => `<button class="chip" data-fadd="${k}:${a}">${a > 0 ? '+' : ''}${a}</button>`).join('')}</div></div>`;
  h += q('cal', '🍽 Calories', 'kcal', [100, 250, 500, -100]) + q('protein', '🥩 Protein', 'g', [10, 25, 40, -10]) + q('water', '💧 Water', 'glasses (8 oz)', [1, 2, -1]) + q('steps', '👟 Steps', 'steps', [1000, 2500, 5000]) + q('cardio', '🏃 Extra cardio', 'min', [10, 20, 30, -10]);
  h += `<div class="card"><h3>Cardio this week</h3><div class="fbar"><i style="width:${Math.min(100, cardioWeek / (g.cardio || 1) * 100)}%"></i></div><div class="muted" style="margin-top:6px"><b style="color:var(--txt)">${cardioWeek}</b> / ${g.cardio} min${wCardio ? ` · includes ${wCardio} min from your workouts` : ''}</div></div>`;
  // 7-day averages
  const days7 = Array.from({ length: 7 }, (_, i) => dk(addDays(d, -i))).filter(x => (S.fuel || {})[x]);
  if (days7.length) {
    const avg = k => { const v = days7.map(x => num(fuelOf(x)[k])).filter(Boolean); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : '—'; };
    h += `<div class="card"><h3>7-day average</h3><div class="stats" style="grid-template-columns:repeat(4,1fr)"><div class="stat"><b>${avg('cal')}</b><span>kcal</span></div><div class="stat"><b>${avg('protein')}</b><span>protein g</span></div><div class="stat"><b>${avg('water')}</b><span>glasses</span></div><div class="stat"><b>${avg('steps')}</b><span>steps</span></div></div></div>`;
  }
  h += `<div class="card"><h3>Goals</h3><div class="grid2">
    <label class="fld">Calories / day<input inputmode="numeric" data-goal="cal" value="${g.cal || ''}" placeholder="use calculator"></label>
    <label class="fld">Protein g / day<input inputmode="numeric" data-goal="protein" value="${g.protein || ''}" placeholder="use calculator"></label>
    <label class="fld">Water glasses / day<input inputmode="numeric" data-goal="water" value="${g.water}"></label>
    <label class="fld">Steps / day<input inputmode="numeric" data-goal="steps" value="${g.steps}"></label>
    <label class="fld">Cardio min / week<input inputmode="numeric" data-goal="cardio" value="${g.cardio}"></label>
    <label class="fld">Training days / week<input inputmode="numeric" data-goal="weekDays" value="${g.weekDays}"></label></div>
    <button class="btn" data-calc>🧮 Calculate my calories & protein</button></div>`;
  $('fuel').innerHTML = h;
}
function calcSheet() {
  const last = bodyList().pop(), bw = last ? num(S.body[last].w) : '', c = S.settings.calc || {};
  const sex = c.sex || (PROF === 'king' ? 'm' : 'f');
  openSheet(`<h3>Calorie & protein calculator</h3><div class="sub">An estimate to start from (Mifflin-St Jeor). Adjust after 2–3 weeks based on how your weight actually moves.</div>
    <div class="grid2">
      <label class="fld">Sex<select id="cSex"><option value="m" ${sex === 'm' ? 'selected' : ''}>Male</option><option value="f" ${sex === 'f' ? 'selected' : ''}>Female</option></select></label>
      <label class="fld">Age<input id="cAge" inputmode="numeric" value="${c.age || ''}"></label>
      <label class="fld">Height (ft)<input id="cFt" inputmode="numeric" value="${c.ft || ''}" placeholder="5"></label>
      <label class="fld">Height (in)<input id="cIn" inputmode="numeric" value="${c.inch ?? ''}" placeholder="8"></label>
      <label class="fld">Weight (${unit()})<input id="cW" inputmode="decimal" value="${bw}"></label>
      <label class="fld">Activity<select id="cAct">${[[1.375, 'Light: gym 3x'], [1.55, 'Moderate: gym 4–5x'], [1.725, 'Very active job + gym']].map(([v, l]) => `<option value="${v}" ${num(c.act || 1.55) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <label class="fld" style="margin-top:10px">Goal<select id="cGoal">${[['lose', 'Lose fat'], ['tone', 'Recomp / tone (slight deficit)'], ['keep', 'Maintain'], ['gain', 'Build muscle (lean gain)']].map(([v, l]) => `<option value="${v}" ${(c.goal || (PROF === 'king' ? 'gain' : 'lose')) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <button class="btn acc" data-calcgo>Calculate</button><div id="cOut"></div>`);
}
function calcGo() {
  const sex = $('cSex').value, age = num($('cAge').value), ft = num($('cFt').value), inch = num($('cIn').value), w = num($('cW').value), act = num($('cAct').value), goal = $('cGoal').value;
  if (!age || !(ft || inch) || !w) return toast('Fill in age, height and weight');
  const kg = unit() === 'kg' ? w : w * .4536, cm = (ft * 12 + inch) * 2.54;
  const bmr = 10 * kg + 6.25 * cm - 5 * age + (sex === 'm' ? 5 : -161), tdee = bmr * act;
  const adj = { lose: -Math.min(500, tdee * .2), tone: -Math.min(300, tdee * .1), keep: 0, gain: Math.min(300, tdee * .1) }[goal];
  const floor = sex === 'm' ? 1500 : 1200;
  const cal = Math.max(floor, Math.round((tdee + adj) / 10) * 10);
  const protein = Math.round((unit() === 'kg' ? kg * 2.2 : w) * (goal === 'gain' ? 1 : .8));
  S.settings.calc = { sex, age, ft, inch, act, goal }; touchSettings();
  $('cOut').innerHTML = `<div class="stats" style="margin-top:12px"><div class="stat"><b>${Math.round(tdee).toLocaleString()}</b><span>Maintenance</span></div><div class="stat"><b>${cal.toLocaleString()}</b><span>Your target</span></div><div class="stat"><b>${protein}g</b><span>Protein</span></div></div>
    <div class="muted" style="font-size:12px">${goal === 'lose' ? 'About 0.5–1 lb a week of fat loss at this target. ' : ''}Protein is set around ${goal === 'gain' ? '1 g' : '0.8 g'} per lb of bodyweight to hold on to muscle.${cal === floor ? ' Capped at a safe minimum.' : ''}</div>
    <button class="btn acc" data-calcuse="${cal}|${protein}">Use these goals</button>`;
}

/* =====================================================================
   ROUTINE EDITOR
   ===================================================================== */
let edDay = 0;
function editRoutine() {
  const R = baseRoutine(), D = R[edDay];
  openSheet(`<h3>Edit routine</h3><div class="sub">Changes apply to ${PROFILES[PROF].name}'s profile only. History is kept per exercise name.</div>
    <div class="days" style="margin:0 0 10px">${R.map((d, i) => `<button class="${i === edDay ? 'on' : ''}" data-edday="${i}">${d.d}</button>`).join('')}</div>
    <label class="fld">Day name<input id="edTitle" value="${esc(D.title)}"></label>
    <div style="margin-top:10px">${D.slots.map((sl, si) => `<div class="edrow"><div class="edn"><b>${esc(sl.opts[0].n)}</b><span>${sl.sets} × ${esc(sl.reps)} · rest ${fmtT(sl.rest)}${sl.opts.length > 1 ? ` · ${sl.opts.length - 1} swaps` : ''}</span></div>
      <button class="cbtn" data-edmv="${si}:-1" ${si === 0 ? 'disabled' : ''}>↑</button><button class="cbtn" data-edmv="${si}:1" ${si === D.slots.length - 1 ? 'disabled' : ''}>↓</button><button class="cbtn" data-ededit="${si}">✎</button><button class="cbtn" data-eddel="${si}">✕</button></div>`).join('')}</div>
    <button class="btn acc" data-ededit="new">＋ Add exercise</button>
    ${S.routine ? '<button class="btn ghost" data-edreset>Reset to the original routine</button>' : ''}`);
}
function mutRoutine(fn) {
  const R = clone(baseRoutine()); fn(R); S.routine = R; S.routineU = Date.now(); save(); applyRoutine(); if (tab === 'workout') renderWorkout();
}
function remapSwaps(di, mapFn) { // mapFn(oldIndex) → newIndex | null
  const sw = S.settings.swaps, nw = {};
  for (const k in sw) { const [d, s] = k.split('-').map(Number); if (d !== di) { nw[k] = sw[k]; continue; } const n = mapFn(s); if (n != null) nw[d + '-' + n] = sw[k]; }
  S.settings.swaps = nw; S.settings.u = Date.now();
}
function editSlot(si) {
  const isNew = si === 'new', sl = isNew ? { sets: 3, reps: '10–12', rest: 60, opts: [{ n: '', pat: 'squat', cues: [] }] } : baseRoutine()[edDay].slots[si], o = sl.opts[0];
  openSheet(`<h3>${isNew ? 'Add exercise' : 'Edit exercise'}</h3><div class="sub">${isNew ? baseRoutine()[edDay].title : 'Edits the main exercise. Its swaps stay as they are.'}</div>
    <label class="fld">Exercise name<input id="esN" list="libNames" value="${esc(o.n)}" placeholder="Start typing, e.g. Leg Press"></label><datalist id="libNames">${LIB_ALL.map(x => `<option value="${esc(x.n)}">`).join('')}</datalist>
    <div class="grid2" style="margin-top:8px"><label class="fld">Sets<input id="esS" inputmode="numeric" value="${sl.sets}"></label><label class="fld">Reps<input id="esR" value="${esc(sl.reps)}" placeholder="8–10, 15, failure"></label>
    <label class="fld">Rest (sec)<input id="esRest" inputmode="numeric" value="${sl.rest}"></label><label class="fld">Timed? (sec)<input id="esT" inputmode="numeric" value="${sl.time || ''}" placeholder="blank = reps"></label></div>
    <label class="fld" style="margin-top:8px">Form figure<select id="esP">${Object.keys(PAT_NAMES).filter(k => P[k]).map(k => `<option value="${k}" ${o.pat === k ? 'selected' : ''}>${PAT_NAMES[k]}</option>`).join('')}</select></label>
    <label class="fld" style="margin-top:8px">Form tips (one per line)<textarea id="esC" rows="3">${esc((o.cues || []).join('\n'))}</textarea></label>
    <button class="btn acc" data-edsave="${si}">Save</button><button class="btn ghost" data-edback>Back</button>`);
}
function saveSlot(si) {
  const n = $('esN').value.trim(); if (!n) return toast('Give it a name');
  const t = Math.round(num($('esT').value));
  const vals = { sets: Math.max(1, Math.min(10, Math.round(num($('esS').value)) || 3)), reps: $('esR').value.trim() || (t ? t + ' sec' : '10'), rest: Math.max(0, Math.round(num($('esRest').value))) };
  const opt = { n, pat: $('esP').value, cues: $('esC').value.split('\n').map(x => x.trim()).filter(Boolean) };
  if (!opt.cues.length) opt.cues = ['Controlled reps, full range of motion'];
  mutRoutine(R => {
    const D = R[edDay];
    if (si === 'new') D.slots.push({ ...vals, ...(t ? { time: t } : {}), opts: [opt] });
    else { const s = D.slots[+si]; Object.assign(s, vals); if (t) s.time = t; else delete s.time; s.opts[0] = opt; }
  });
  toast('✅ Routine updated'); editRoutine();
}

/* =====================================================================
   CALENDAR REMINDERS (.ics)
   ===================================================================== */
function icsSheet() {
  const r = S.settings.rem || { time: '17:30', days: [1, 1, 1, 1, 1], photo: true };
  openSheet(`<h3>Reminders</h3><div class="sub">Adds repeating events with alerts to your phone's calendar: one for each gym day, plus a monthly photo check-in. Web apps can't send scheduled notifications on their own, so your calendar does it.</div>
    <label class="fld">Gym time<input type="time" id="rmT" value="${r.time}"></label>
    <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap">${baseRoutine().map((d, i) => `<button class="chip ${r.days[i] ? 'on' : ''}" data-rmday="${i}">${d.d}</button>`).join('')}</div>
    <div class="hrow" style="margin-top:8px"><span>Photo check-in on the 1st of each month</span><button class="chip ${r.photo ? 'on' : ''}" data-rmphoto>${r.photo ? 'On' : 'Off'}</button></div>
    <button class="btn acc" data-rmgo>📅 Add to calendar</button>
    <div class="muted" style="font-size:12px;margin-top:8px">iPhone: it opens Calendar, tap <b>Add All</b>. Android: open the downloaded file with Google Calendar.</div>`);
}
function buildICS() {
  const r = S.settings.rem, [hh, mm] = r.time.split(':').map(Number), now2 = new Date();
  const stamp2 = now2.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const fmtL = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  const BY = ['MO', 'TU', 'WE', 'TH', 'FR'], crown = '🏋️';
  const ev = [];
  baseRoutine().forEach((d, i) => {
    if (!r.days[i]) return;
    let s = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), hh, mm); while ((s.getDay() + 6) % 7 !== i || s < now2) s = addDays(s, 1);
    ev.push(['BEGIN:VEVENT', `UID:${PROF}-gym-${i}-${stamp2}@kingqxeen`, `DTSTAMP:${stamp2}`, `DTSTART:${fmtL(s)}`, 'DURATION:PT1H15M', `RRULE:FREQ=WEEKLY;BYDAY=${BY[i]}`, `SUMMARY:${crown} Gym: ${d.title}`, `DESCRIPTION:${PROFILES[PROF].label} split · ${d.slots.length} exercises`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT30M', `DESCRIPTION:${d.title} in 30 min`, 'END:VALARM', 'END:VEVENT'].join('\r\n'));
  });
  if (r.photo) {
    const s = new Date(now2.getFullYear(), now2.getMonth() + 1, 1, 9, 0);
    ev.push(['BEGIN:VEVENT', `UID:${PROF}-photo-${stamp2}@kingqxeen`, `DTSTAMP:${stamp2}`, `DTSTART:${fmtL(s)}`, 'DURATION:PT15M', 'RRULE:FREQ=MONTHLY;BYMONTHDAY=1', `SUMMARY:📸 ${PROFILES[PROF].name} monthly photo check-in`, 'DESCRIPTION:Front, side, back. Same spot, same lighting. Log weight & measurements too.', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M', 'DESCRIPTION:Photo check-in day', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Danta & Desrica Gym//EN', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
function addToCalendar() {
  const r = S.settings.rem = S.settings.rem || { time: '17:30', days: [1, 1, 1, 1, 1], photo: true };
  r.time = $('rmT').value || r.time; touchSettings();
  if (!r.days.some(Boolean) && !r.photo) return toast('Pick at least one day');
  const ics = buildICS(), name = `gym-reminders-${PROF}.ics`;
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) { location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics); return; }
  download(name, new Blob([ics], { type: 'text/calendar' })); toast('Downloaded. Open it to add to your calendar', 4000);
}

/* =====================================================================
   MORE tab extras
   ===================================================================== */
function moreExtras() {
  const pm = partnerOn(), af = S.settings.autoFill !== false;
  return `<div class="card"><h3>Training tools</h3>
    <div class="hrow"><span>✏️ Edit my routine</span><button class="chip acc" data-edopen>Edit</button></div>
    <div class="hrow"><span>⭐ Exercise library & favorites</span><button class="chip" data-libopen>Open</button></div>
    <div class="hrow"><span>🧠 Remembered preferences</span><button class="chip" data-prefopen>View</button></div>
    <div class="hrow"><span>🏋️ Plate calculator</span><button class="chip" data-plates="">Open</button></div>
    <div class="hrow"><span>📅 Gym & photo reminders</span><button class="chip" data-icsopen>Set up</button></div>
    <div class="hrow"><span>📤 Monthly recap card</span><button class="chip" data-recap>Make</button></div>
    <div class="hrow"><span>Auto-fill suggested weights</span><button class="chip ${af ? 'on' : ''}" data-autofill>${af ? 'On' : 'Off'}</button></div>
    <div class="hrow"><span>Deload this week (half sets, ~60%)</span><button class="chip ${isDeload(curWeek) ? 'on' : ''}" data-deload="${isDeload(curWeek) ? 'off' : 'on'}">${isDeload(curWeek) ? 'On' : 'Off'}</button></div>
    <div class="hrow"><span>📡 Share live activity (your latest set, PRs & rest timer show on ${PROFILES[other()].name}'s app)</span><button class="chip ${S.settings.shareLive !== false ? 'on' : ''}" data-sharelive>${S.settings.shareLive !== false ? 'On' : 'Off'}</button></div>
    <div class="hrow"><span>👥 Partner mode: train together on this phone, quick-switch with separate rest timers</span><button class="chip ${pm ? 'on' : ''}" data-partner>${pm ? 'On' : 'Off'}</button></div>
    <div class="muted" style="font-size:12px;margin-top:6px">Health apps: web apps can't connect to Apple Health, and Google has shut down Google Fit's API. Use the CSV exports below to move your data anywhere.</div></div>`;
}


/* =====================================================================
   SWAP SHEET + EXERCISE LIBRARY: favorites pinned per muscle group, search
   ===================================================================== */
Object.assign(PAT_NAMES, { legext: 'Leg extension', pushup: 'Push-up', inclinepress: 'Incline press', seatedpress: 'Seated shoulder press', pulldown: 'Lat pulldown', pushdown: 'Tricep pushdown', ohext: 'Overhead tricep extension', skull: 'Skull crusher', pullover: 'Pullover', seatedfly: 'Pec deck / seated fly', bridge: 'Glute bridge (floor)', lyingraise: 'Lying leg raise', situp: 'Sit-up', sideplank: 'Side plank', backext: 'Back extension', uprow: 'Upright row', frontraise: 'Front raise', jack: 'Jumping jack', jumprope: 'Jump rope', bike: 'Bike', rower: 'Rowing machine', burpee: 'Burpee', sled: 'Sled push', ropes: 'Battle ropes', latlunge: 'Lateral lunge', stepup: 'Step-up', rollout: 'Ab wheel rollout' });
const favs = () => S.settings.favs || {};
const isFav = n => !!favs()[String(n).toLowerCase()];
const optHtml = (o, attr, tag, cls) => `<${attr ? 'button' : 'div'} class="opt ${cls || ''}" data-name="${esc(o.n.toLowerCase())}" ${attr || ''}><div class="thumb"><div data-anim="${o.pat}"></div></div><div class="ot">${tag || ''}<b>${esc(o.n)}</b><span>${esc(o.cues[0] || '')}</span></div><span class="fav ${isFav(o.n) ? 'on' : ''}" data-fav="${esc(o.n)}" role="button" aria-label="Pin as favorite">★</span></${attr ? 'button' : 'div'}>`;
const favFirst = list => [...list.filter(o => isFav(o.n)), ...list.filter(o => !isFav(o.n))];
function swapSheet(si) {
  const sl = DAYS[cur].slots[si], curEx = exOf(cur, si), cats = PAT_CATS[sl.opts[0].pat] || ['quads'];
  const pick = o => `data-pickn="${si}|${esc(o.n)}"`, on = o => o.n === curEx.n ? 'on' : '';
  const seen = new Set();
  const pool = [...sl.opts, ...cats.flatMap(c => LIB[c])].filter(o => { const k = o.n.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const fv = pool.filter(o => isFav(o.n)), fvSet = new Set(fv.map(o => o.n.toLowerCase()));
  const shown = new Set(fvSet);
  let h = `<h3>Swap exercise</h3><div class="sub">Tap ★ to pin a favorite to the top of its muscle group. Each exercise keeps its own weight log.</div>
    <input class="swsearch" id="swq" placeholder="🔍 Search all ${LIB_ALL.length}+ exercises" autocomplete="off"><div id="swList">`;
  if (fv.length) h += `<div class="swh">⭐ Your favorites · ${cats.map(c => LIB_CAT_NAMES[c].toLowerCase()).join(' & ')}</div>` + fv.map(o => optHtml(o, pick(o), o.n === sl.opts[0].n ? '<div class="cur">YOUR ORIGINAL</div>' : '', on(o))).join('');
  const use = S.settings.swapUse || {};
  const usual = pool.filter(o => use[o.n.toLowerCase()] && !shown.has(o.n.toLowerCase())).sort((x, y) => (use[y.n.toLowerCase()].c - use[x.n.toLowerCase()].c) || (use[y.n.toLowerCase()].t - use[x.n.toLowerCase()].t)).slice(0, 4);
  usual.forEach(o => shown.add(o.n.toLowerCase()));
  if (usual.length) h += `<div class="swh">🧠 Your usual swaps</div>` + usual.map(o => optHtml(o, pick(o), `<div class="cur">PICKED ${use[o.n.toLowerCase()].c}×</div>`, on(o))).join('');
  const cur8 = sl.opts.filter(o => !shown.has(o.n.toLowerCase())); cur8.forEach(o => shown.add(o.n.toLowerCase()));
  if (cur8.length) h += `<div class="swh">Best picks for this slot</div>` + cur8.map(o => optHtml(o, pick(o), o.n === sl.opts[0].n ? '<div class="cur">YOUR ORIGINAL</div>' : '', on(o))).join('');
  for (const c of cats) {
    const list = LIB[c].filter(o => !shown.has(o.n.toLowerCase())); list.forEach(o => shown.add(o.n.toLowerCase()));
    if (list.length) h += `<div class="swh">More ${LIB_CAT_NAMES[c].toLowerCase()}</div>` + list.map(o => optHtml(o, pick(o), '', on(o))).join('');
  }
  h += `<div class="swrest hide">` + Object.keys(LIB).filter(c => !cats.includes(c)).map(c => { const list = favFirst(LIB[c].filter(o => !shown.has(o.n.toLowerCase()))); list.forEach(o => shown.add(o.n.toLowerCase())); return list.length ? `<div class="swh">${LIB_CAT_NAMES[c]}</div>` + list.map(o => optHtml(o, pick(o), '', on(o))).join('') : ''; }).join('') + `</div>`;
  h += `<button class="btn ghost" data-swall>Show every muscle group</button><div class="muted swnone hide" style="padding:16px 0;text-align:center">No match. Add your own in More → Edit my routine.</div></div>`;
  openSheet(h);
}
function libSheet() {
  const n = Object.keys(favs()).length, seen = new Set();
  let h = `<h3>Exercise library</h3><div class="sub">${LIB_ALL.length} exercises. Tap ★ to pin favorites. They show first in their muscle group whenever you swap. <b>${n}</b> pinned so far.</div>
    <input class="swsearch" id="swq" placeholder="🔍 Search exercises" autocomplete="off"><div id="swList">`;
  for (const c in LIB) { const list = favFirst(LIB[c].filter(o => !seen.has(o.n.toLowerCase()))); list.forEach(o => seen.add(o.n.toLowerCase())); h += `<div class="swh">${LIB_CAT_NAMES[c]}${list.some(o => isFav(o.n)) ? ' · ⭐ ' + list.filter(o => isFav(o.n)).length : ''}</div>` + list.map(o => optHtml(o, '', '')).join(''); }
  h += `<div class="muted swnone hide" style="padding:16px 0;text-align:center">No match.</div></div>`;
  openSheet(h);
}
function filterSwaps(q) {
  q = q.trim().toLowerCase(); const list = $('swList'); if (!list) return;
  const rest = list.querySelector('.swrest'); if (q && rest) rest.classList.remove('hide');
  let any = 0;
  list.querySelectorAll('.opt').forEach(b => { const m = !q || b.dataset.name.includes(q); b.classList.toggle('hide', !m); if (m) any++; });
  list.querySelectorAll('.swh').forEach(hd => { let n = hd.nextElementSibling, vis = false; while (n && n.classList.contains('opt')) { if (!n.classList.contains('hide')) vis = true; n = n.nextElementSibling; } hd.classList.toggle('hide', !vis); });
  const all = list.querySelector('[data-swall]'); if (all) all.classList.toggle('hide', !!q || (rest && !rest.classList.contains('hide')));
  list.querySelector('.swnone').classList.toggle('hide', any > 0);
}
// ★ runs in the capture phase so tapping the star never also picks the exercise
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fav]'); if (!f) return; e.stopPropagation(); e.preventDefault();
  const k = f.dataset.fav.toLowerCase(), F = { ...favs() }; const on = !F[k]; if (on) F[k] = 1; else delete F[k];
  S.settings.favs = F; touchSettings();
  document.querySelectorAll('[data-fav]').forEach(x => { if (x.dataset.fav.toLowerCase() === k) x.classList.toggle('on', on); });
  const cat = Object.keys(LIB).find(c => LIB[c].some(o => o.n.toLowerCase() === k));
  toast(on ? `⭐ Pinned${cat ? ' to the top of ' + LIB_CAT_NAMES[cat].toLowerCase() : ''}` : 'Unpinned', 1600);
}, true);
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.pickn) { const [si, n] = d.pickn.split('|'), key = slotKey(cur, +si); if (n === DAYS[cur].slots[+si].opts[0].n) delete S.settings.swaps[key]; else S.settings.swaps[key] = 'n:' + n; { const U = { ...(S.settings.swapUse || {}) }, k = n.toLowerCase(); U[k] = { c: ((U[k] || {}).c || 0) + 1, t: Date.now() }; S.settings.swapUse = U; } touchSettings(); closeSheet(); renderWorkout(); toast('↻ ' + n); return; }
  if (d.swall !== undefined) { $('swList').querySelector('.swrest').classList.remove('hide'); t.classList.add('hide'); return; }
  if (d.libopen !== undefined) return libSheet();
  if (d.prefopen !== undefined) return prefSheet();
  if (d.prefdel) { const P2 = { ...(S.settings.prefs || {}) }; delete P2[d.prefdel]; S.settings.prefs = P2; touchSettings(); prefSheet(); if (tab === 'workout') renderWorkout(); return; }
  if (d.swapdel) { delete S.settings.swaps[d.swapdel]; touchSettings(); prefSheet(); if (tab === 'workout') renderWorkout(); return; }
  if (d.prefclear !== undefined) { S.settings.prefs = {}; touchSettings(); prefSheet(); return; }
  if (d.preftoggle !== undefined) { S.settings.remember = S.settings.remember === false; touchSettings(); prefSheet(); return; }
});
document.addEventListener('input', e => { if (e.target.id === 'swq') filterSwaps(e.target.value); });

/* =====================================================================
   REMEMBERED PREFERENCES: your own rest time and rep pace per exercise
   ===================================================================== */
const prefOf = id => (S.settings.remember === false ? {} : (S.settings.prefs || {})[id]) || {};
function setPref(id, name, k, v) { if (S.settings.remember === false) return; const P2 = { ...(S.settings.prefs || {}) }; P2[id] = { ...(P2[id] || {}), n: name, [k]: v }; S.settings.prefs = P2; }
function restPrefSave() { const r = RT[PROF]; if (!r || !r.exid || r.done || S.settings.remember === false) return; const v = Math.max(15, Math.round(r.dur)); setPref(r.exid, r.exn, 'rest', v); touchSettings(); $('rsub').textContent = `★ ${fmtT(v)} rest remembered for ${r.exn}`; r.sub = $('rsub').textContent; }
$('rminus').addEventListener('click', restPrefSave); $('rplus').addEventListener('click', restPrefSave);
function prefSheet() {
  const on = S.settings.remember !== false, P2 = S.settings.prefs || {}, ids = Object.keys(P2).sort((a, b) => (P2[a].n || a).localeCompare(P2[b].n || b));
  const fv = Object.keys(favs()).length, R = baseRoutine();
  const swaps = Object.keys(S.settings.swaps || {}).map(k => { const [di, si] = k.split('-').map(Number), sl = R[di] && R[di].slots[si]; if (!sl) return null; const now2 = exOf(di, si); return now2.n === sl.opts[0].n ? null : { k, day: R[di].d, from: sl.opts[0].n, to: now2.n }; }).filter(Boolean).sort((a, b) => a.k.localeCompare(b.k));
  const use = S.settings.swapUse || {}, top = Object.keys(use).sort((a, b) => use[b].c - use[a].c).slice(0, 5);
  openSheet(`<h3>Remembered preferences</h3><div class="sub">The app learns how you train: the swaps you prefer, plus your rest time and rep pace for each exercise.</div>
    <div class="hrow"><span>Remember my rest & pace changes</span><button class="chip ${on ? 'on' : ''}" data-preftoggle>${on ? 'On' : 'Off'}</button></div>
    <div class="hrow"><span>Favorites pinned</span><button class="chip" data-libopen>${fv} · Open library</button></div>
    <div class="swh">Your preferred swaps</div>
    ${swaps.length ? swaps.map(x => `<div class="hrow"><span style="min-width:34px">${x.day}</span><div style="flex:1;min-width:0"><b>${esc(x.to)}</b><div class="muted" style="font-size:11px">instead of ${esc(x.from)}</div></div><button class="x" data-swapdel="${x.k}" aria-label="Undo swap">✕</button></div>`).join('') : '<div class="muted">No swaps yet. Swap an exercise and it stays swapped every week until you change it back.</div>'}
    ${top.length ? `<div class="muted" style="font-size:12px;margin-top:8px">Picked most: ${top.map(k => { const o = libFind(k); return esc(o ? o.n : k) + ' (' + use[k].c + '×)'; }).join(', ')}. These show first whenever you swap.</div>` : ''}
    <div class="swh">Rest & pace per exercise</div>
    ${ids.length ? ids.map(id => `<div class="hrow"><b style="flex:1">${esc(P2[id].n || id)}</b><span>${[P2[id].rest ? 'rest ' + fmtT(P2[id].rest) : '', P2[id].tempo ? 'pace ' + Math.round(100 / P2[id].tempo) + '%' : ''].filter(Boolean).join(' · ')}</span><button class="x" data-prefdel="${esc(id)}">✕</button></div>`).join('') + '<button class="btn ghost" data-prefclear>Clear all remembered rest & pace</button>' : '<div class="muted">Nothing yet. Adjust a rest timer or the rep pace during a workout and it shows up here.</div>'}`);
}
// routine editor: pick a library name and the figure + tips fill in
document.addEventListener('change', e => {
  if (e.target.id !== 'esN') return; const o = libFind(e.target.value); if (!o) return;
  $('esP').value = o.pat; if (!$('esC').value.trim()) $('esC').value = o.cues.join('\n');
});


/* =====================================================================
   LIVE: realtime partner activity (Supabase Realtime + polling fallback)
   ===================================================================== */
const LIVE = (() => { try { return JSON.parse(localStorage.getItem('gym.pub') || '{}'); } catch (e) { return {}; } })();
let rtCh = null, rtCl = null, rtStatus = 'off', flashNext = false, pulseT = null, lastHype = 0, pollTick = 0;
const isFresh = t => !!t && Date.now() - t < 10 * 60e3;
const fmtSec = r => r >= 120 ? Math.round(r / 60) + ' min' : r + 's';
const setTxt = L => L.timed ? fmtSec(L.r) : `${L.w || 'BW'}×${L.r}`;
const ago = t => { const s = (Date.now() - t) / 1000; return s < 45 ? 'just now' : s < 3600 ? Math.round(s / 60) + 'm ago' : Math.round(s / 3600) + 'h ago'; };
const signedHere = p => !!(clients[p] && clients[p].session);
function shareable(sm, prof, st) {
  if (prof === PROF && RT[prof] && !RT[prof].done) sm.restEnd = RT[prof].end;
  if (((st || {}).settings || {}).shareLive === false) { delete sm.lastSet; delete sm.lastPR; delete sm.restEnd; }
  const ss = getSess(); if (ss) sm.session = ss;
  return sm;
}
function onLive(row) {
  if (!row || !row.profile || !row.data || !PROFILES[row.profile]) return;
  const p = row.profile, nw = row.data, old = LIVE[p];
  if (old && (old.at || 0) > (nw.at || 0)) return;
  LIVE[p] = nw;
  if (nw.session) sessIngest(nw.session);
  try { const map = JSON.parse(localStorage.getItem('gym.pub') || '{}'); if (!map[p] || (map[p].at || 0) <= (nw.at || 0)) { map[p] = nw; localStorage.setItem('gym.pub', JSON.stringify(map)); } } catch (e) { }
  if (p !== PROF && !signedHere(p) && old) announce(p, old, nw);
  refreshLiveViews();
}
function announce(p, o, n) {
  const nm = PROFILES[p].name, L = n.lastSet;
  let msg = null, big = false;
  if (n.lastPR && isFresh(n.lastPR.t) && (!o.lastPR || n.lastPR.t > o.lastPR.t)) { msg = `🏆 ${nm} just hit a PR · ${n.lastPR.n} ${n.lastPR.w}×${n.lastPR.r}`; big = true; }
  else if (L && isFresh(L.t) && n.todayTotal && n.todaySets >= n.todayTotal && !(o.td === n.td && o.todayTotal && o.todaySets >= o.todayTotal)) { msg = `🔥 ${nm} finished ${n.todayTitle}!`; big = true; }
  else if (L && isFresh(L.t) && (!o.lastSet || L.t > o.lastSet.t)) msg = `${nm} · ${L.n} · set ${L.i}/${L.of} · ${setTxt(L)}`;
  if (!msg) return;
  toast(msg, big ? 4200 : 2800);
  beep(big ? 880 : 1175, .07, .14); if (big) setTimeout(() => beep(1320, .14, .14), 120);
  buzz(big ? [60, 50, 60] : 30);
  flashNext = true;
}
function refreshLiveViews() {
  if (tab === 'workout') renderNudges();
  else if (tab === 'history' && histSeg === 'score' && $('histBody')) renderScore();
}
function liveCard(pt) {
  const o = pt.prof, P0 = PROFILES[o], th = resolveMode() === 'light' ? P0.thL : P0.th;
  const L = pt.lastSet, today = pt.td === dk(new Date()) && pt.todaySets > 0;
  const live = !!L && today && Date.now() - L.t < 15 * 60e3;
  const done = today && pt.todayTotal && pt.todaySets >= pt.todayTotal;
  const resting = live && pt.restEnd && pt.restEnd > Date.now();
  const pct = pt.todayTotal ? Math.min(100, pt.todaySets / pt.todayTotal * 100) : 0;
  const status = done ? `Finished ${esc(pt.todayTitle)} ✅` : resting ? `Resting · <span data-restend="${pt.restEnd}">${fmtT(Math.ceil((pt.restEnd - Date.now()) / 1000))}</span>` : live ? 'Training now' : today ? `Trained today · ${esc(pt.todayTitle)}` : `Hasn't trained yet today`;
  const fl = flashNext; flashNext = false;
  return `<div class="live ${fl ? 'flash' : ''}" style="--pc:${th.acc}"><div class="lv-top"><span class="lv-av">${P0.mono}</span>
    <div class="lv-t"><b>${P0.name}${live && !done ? '<i class="lv-dot"></i>' : ''}</b><span>${status}</span></div>
    <button class="chip lv-hype" data-hype>${today ? '🔥 Hype' : '👊 Nudge'}</button></div>
    ${today ? `<div class="lv-bar"><i style="width:${pct}%"></i></div><div class="lv-sub"><span>${esc(pt.todayTitle)} · ${pt.todaySets}/${pt.todayTotal || '?'} sets</span>${L ? `<span>Last: ${esc(L.n)} · set ${L.i}/${L.of} · ${setTxt(L)} · <span data-ago="${L.t}">${ago(L.t)}</span></span>` : ''}</div>` : ''}</div>`;
}
function ensureRealtime() {
  const x = signedHere(PROF) ? clients[PROF] : Object.values(clients).find(c => c.session);
  if (!x) { if (rtCh && rtCl) { try { rtCl.removeChannel(rtCh); } catch (e) { } } rtCh = rtCl = null; rtStatus = 'off'; return; }
  if (rtCl === x.cl && rtCh && !/CLOSED|ERROR|TIMED_OUT/.test(rtStatus)) return;
  if (rtCh && rtCl) { try { rtCl.removeChannel(rtCh); } catch (e) { } }
  rtCl = x.cl; rtStatus = 'connecting';
  try {
    rtCh = x.cl.channel('gym-live', { config: { broadcast: { self: false } } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_public' }, pl => onLive(pl.new))
      .on('broadcast', { event: 'hype' }, m => onHype(m.payload))
      .subscribe(st => { rtStatus = st; if (st === 'SUBSCRIBED') pollPublic(); if (tab === 'history') refreshLiveViews(); });
  } catch (e) { rtCh = null; rtStatus = 'off'; }
}
async function pollPublic() {
  const c = signedHere(PROF) ? clients[PROF] : Object.values(clients).find(x => x.session);
  if (!c || document.hidden || !navigator.onLine) return;
  try { const { data, error } = await c.cl.from('gym_public').select('profile,data'); if (!error) for (const r of data || []) onLive(r); } catch (e) { }
}
function pulse() { clearTimeout(pulseT); const p = PROF; pulseT = setTimeout(() => doPulse(p), 300); }
async function doPulse(prof) {
  const x = clients[prof]; if (!x) return; await x.ready; if (!x.session || !navigator.onLine) return;
  try {
    const st = readState(prof), sm = shareable(summaryOf(st, prof), prof, st);
    const { error } = await x.cl.from('gym_public').upsert({ user_id: x.session.user.id, profile: prof, data: sm, updated_at: new Date().toISOString() });
    if (!error) onLive({ profile: prof, data: sm });
  } catch (e) { }
}
async function sendHype() {
  const o = other(), pt = partnerSummary(), today = pt && pt.td === dk(new Date()) && pt.todaySets > 0;
  if (!rtCh) return toast(getCfg().url ? 'Sign in (More tab) to send hype' : 'Connect cloud sync to send hype', 2600);
  if (Date.now() - lastHype < 4000) return toast('Easy 😅 give it a sec', 1400);
  lastHype = Date.now();
  try {
    const r = await rtCh.send({ type: 'broadcast', event: 'hype', payload: { from: PROF, to: o, kind: today ? 'hype' : 'nudge', at: Date.now() } });
    if (r && r !== 'ok') throw r;
    toast(today ? `🔥 Sent ${PROFILES[o].name} some hype` : `👊 Nudged ${PROFILES[o].name}`, 2000); buzz(20); burst(today ? '🔥' : '👊', 6);
  } catch (e) { toast("Couldn't send. Check your connection"); }
}
function onHype(p) {
  if (!p || !PROFILES[p.from] || p.from === PROF || signedHere(p.from)) return;
  const nm = PROFILES[p.from].name;
  toast(p.kind === 'nudge' ? `👊 ${nm} says get to the gym` : `🔥 ${nm} is hyping you up`, 3500);
  beep(988, .08, .16); setTimeout(() => beep(1318, .16, .16), 110); buzz([40, 40, 40, 40, 120]);
  burst(p.kind === 'nudge' ? '👊' : '🔥', 18);
}
function burst(ch, n) {
  const d = document.createElement('div'); d.className = 'hyp';
  d.innerHTML = Array.from({ length: n }, () => `<i style="left:${5 + Math.random() * 90}%;animation-delay:${Math.random() * .5}s;font-size:${26 + Math.random() * 22}px">${ch}</i>`).join('');
  document.body.appendChild(d); setTimeout(() => d.remove(), 3000);
}
setInterval(ensureRealtime, 4000);
setInterval(() => { pollTick++; if (rtStatus === 'SUBSCRIBED' && pollTick % 3) return; pollPublic(); }, 20000);
setInterval(() => {
  document.querySelectorAll('[data-restend]').forEach(el => { const left = Math.ceil((+el.dataset.restend - Date.now()) / 1000); if (left <= 0) { if (tab === 'workout') renderNudges(); } else el.textContent = fmtT(left); });
  if (Date.now() % 30000 < 1000) document.querySelectorAll('[data-ago]').forEach(el => el.textContent = ago(+el.dataset.ago));
}, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { ensureRealtime(); pollPublic(); } });
$('rskip').addEventListener('click', pulse); $('rplus').addEventListener('click', pulse); $('rminus').addEventListener('click', pulse);
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.hype !== undefined) return sendHype();
  if (t.dataset.sharelive !== undefined) { S.settings.shareLive = S.settings.shareLive === false; touchSettings(); renderMore(); }
});


/* =====================================================================
   CAFFEINE: keep the phone awake while the app is open
   Screen Wake Lock API first; a tiny silent looping video as the backup (older iOS / home-screen apps)
   ===================================================================== */
const NOSLEEP_SRC = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAW+bW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAld0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAAAAABAAAAAAHPbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAgABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABem1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAATpzdGJsAAAAtnN0c2QAAAAAAAAAAQAAAKZhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAALGF2Y0MBQsAK/+EAFWdCwAraewEQAAADABAAAAMAIPEiagEABGjOD8gAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAAKMAAACjAAAAAYc3R0cwAAAAAAAAABAAAAAgAAQAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAoMAAAAJAAAAGHN0Y28AAAAAAAAAAgAABgMAAAimAAACkXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAIAAAAAAAAH0AAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAAAQAAAEAAAAAAgltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAB9AAABCgFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAG0bWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAF4c3RibAAAAH5zdHNkAAAAAAAAAAEAAABubXA0YQAAAAAAAAABAAAAAAAAAAAAAQAQAAAAAB9AAAAAAAA2ZXNkcwAAAAADgICAJQACAASAgIAXQBUAAAAAAB9AAAABPwWAgIAFFYhW5QAGgICAAQIAAAAUYnRydAAAAAAAAB9AAAABPwAAACBzdHRzAAAAAAAAAAIAAAAQAAAEAAAAAAEAAAKAAAAAKHN0c2MAAAAAAAAAAgAAAAEAAAABAAAAAQAAAAIAAAAIAAAAAQAAAFhzdHN6AAAAAAAAAAAAAAARAAAAFQAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAcc3RjbwAAAAAAAAADAAAF7gAACIYAAAivAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAABEAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDAAAAAIZnJlZQAAAultZGF03gIATGF2YzYwLjMxLjEwMgACMEAOAAACbQYF//9p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDEgbWU9aGV4IHN1Ym1lPTIgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MCBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTAgOHg4ZGN0PTAgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9MCB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MjUwIGtleWludF9taW49MSBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTEwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA5liIQFv///D0UAAU9/gAEYIAcBGCAHARggBwEYIAcBGCAHARggBwEYIAcBGCAHAAAABUGaIBX1ARggBwEYIAcBGCAHARggBwEYIAcBGCAHARggBwEYIAc=';
let cafVideo = null, cafState = 'off';
const cafOn = () => { const v = localStorage.getItem('gym.caffeine'); return v == null ? S.settings.wake !== false : v === '1'; };
function cafPaint() {
  const b = $('cafBtn'); if (!b) return;
  const on = cafOn() && (cafState === 'lock' || cafState === 'video');
  b.classList.toggle('on', on); b.classList.toggle('warn', cafOn() && cafState === 'failed');
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.title = !cafOn() ? 'Caffeine off: screen can sleep' : on ? 'Caffeine on: screen stays awake' : cafState === 'failed' ? 'This browser blocks staying awake' : 'Tap anywhere to start Caffeine';
}
async function cafStart() {
  if (!cafOn() || document.hidden) { cafPaint(); return; }
  if ('wakeLock' in navigator) {
    if (wakeLock) { cafState = 'lock'; cafPaint(); return; }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; if (cafState === 'lock') cafState = 'off'; cafPaint(); });
      cafState = 'lock'; cafPaint(); return;
    } catch (e) { /* fall through to video */ }
  }
  try {
    if (!cafVideo) {
      cafVideo = document.createElement('video');
      Object.assign(cafVideo, { muted: true, loop: true, playsInline: true, src: NOSLEEP_SRC });
      cafVideo.setAttribute('playsinline', ''); cafVideo.setAttribute('muted', ''); cafVideo.setAttribute('aria-hidden', 'true');
      cafVideo.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;bottom:0';
      document.body.appendChild(cafVideo);
    }
    if (cafVideo.paused) await cafVideo.play();
    cafState = 'video';
  } catch (e) { cafState = 'failed'; }
  cafPaint();
}
function cafStop() {
  if (wakeLock) { try { wakeLock.release(); } catch (e) { } wakeLock = null; }
  if (cafVideo) { try { cafVideo.pause(); } catch (e) { } }
  cafState = 'off'; cafPaint();
}
async function setCaffeine(on) {
  localStorage.setItem('gym.caffeine', on ? '1' : '0');
  if (on) { await cafStart(); toast(cafState === 'failed' ? '☕ This browser won\'t let the app stay awake. Try opening it from the home screen' : '☕ Caffeine on. Screen stays awake while the app is open', 2600); }
  else { cafStop(); toast('😴 Caffeine off. Screen sleeps normally', 1800); }
}
keepAwake = cafStart;
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (cafState === 'lock') cafState = 'off'; } else cafStart(); });
$('switchBtn').insertAdjacentHTML('beforebegin', '<button class="cafbtn" id="cafBtn" aria-label="Caffeine: keep screen awake"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="steam" d="M8 3c-1 1 1 2 0 3M12 2c-1 1 1 2 0 3M16 3c-1 1 1 2 0 3"/><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/></svg></button>');
$('cafBtn').addEventListener('click', () => setCaffeine(!cafOn()));
cafPaint(); cafStart();


/* =====================================================================
   SESSION TIMER: one time limit for the gym session, synced to both phones
   Newest change wins (field u); either person can start, pause, extend or end it.
   ===================================================================== */
const SESS_KEY = 'gym.session';
const getSess = () => { try { return JSON.parse(localStorage.getItem(SESS_KEY) || 'null'); } catch (e) { return null; } };
const putSess = s => { try { localStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (e) { } };
const sessLeft = s => s.state === 'pause' ? s.left : (s.end - Date.now()) / 1000;
const sessActive = s => !!s && (s.state === 'run' || s.state === 'pause') && !(s.state === 'run' && Date.now() - s.end > 2 * 3600e3);
const fmtHMS = sec => { sec = Math.max(0, Math.round(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s2 = sec % 60; return h ? `${h}:${pad(m)}:${pad(s2)}` : `${m}:${pad(s2)}`; };
const whoName = p => PROFILES[p] ? PROFILES[p].name : 'Someone';
const fromPartner = s => s && s.who && s.who !== PROF && !signedHere(s.who);
function mutSess(fn) { const s = { ...(getSess() || {}) }; fn(s); s.who = PROF; s.u = Date.now(); putSess(s); pulse(); renderSess(true); }
function sessStart(min) {
  const dur = Math.round(min * 60);
  localStorage.setItem('gym.sessLast', String(min));
  mutSess(s => { for (const k in s) delete s[k]; Object.assign(s, { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), by: PROF, dur, end: Date.now() + dur * 1000, state: 'run', started: Date.now() }); });
  closeSheet(); beep(880, .08, .18); buzz(30);
  toast(`⏱ ${min} min session started${clients[PROF] && clients[PROF].session ? ' for both of you' : ''}`, 2400);
}
function sessPause() { mutSess(s => { s.left = sessLeft(s); s.state = 'pause'; }); }
function sessResume() { mutSess(s => { s.end = Date.now() + s.left * 1000; s.state = 'run'; }); }
function sessAdd(min) { mutSess(s => { if (s.state === 'pause') s.left += min * 60; else s.end = Math.max(s.end, Date.now()) + min * 60e3; s.dur += min * 60; }); toast(`+${min} min added`, 1500); }
function sessStop() { mutSess(s => { s.state = 'stop'; }); closeSheet(); toast('⏹ Session ended', 1600); }
function sessIngest(ns) {
  const cur2 = getSess();
  if (!ns || !ns.u || (cur2 && (cur2.u || 0) >= ns.u)) return;
  putSess(ns);
  if (fromPartner(ns)) {
    const nm = whoName(ns.who), same = cur2 && cur2.id === ns.id;
    let msg = null;
    if (!same && ns.state === 'run') msg = `⏱ ${nm} started a ${Math.round(ns.dur / 60)} min session`;
    else if (same && ns.state === 'pause' && cur2.state !== 'pause') msg = `⏸ ${nm} paused the session timer`;
    else if (same && ns.state === 'run' && cur2.state === 'pause') msg = `▶️ ${nm} resumed the session timer`;
    else if (same && ns.state === 'stop' && cur2.state !== 'stop') msg = `⏹ ${nm} ended the session`;
    else if (same && ns.dur > cur2.dur) msg = `⏱ ${nm} added ${Math.round((ns.dur - cur2.dur) / 60)} min`;
    if (msg) { toast(msg, 2800); beep(1046, .07, .14); buzz(30); }
  }
  renderSess(true);
}
function sessSheet() {
  const last = +localStorage.getItem('gym.sessLast') || 60, cloud = !!(clients[PROF] && clients[PROF].session);
  openSheet(`<h3>Session timer</h3><div class="sub">Set a time limit for today. ${cloud ? `It counts down on ${PROFILES[other()].name}'s phone too, and either of you` : 'Sign in to share it with the other phone. You'} can pause, add time or end it. Heads-ups at 10, 5 and 1 minute left.</div>
    <div class="sess-presets">${[30, 45, 60, 75, 90, 120].map(m => `<button class="chip ${m === last ? 'on' : ''}" data-sesspick="${m}">${m >= 60 && m % 60 === 0 ? m / 60 + ' hr' : m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m + ' min'}</button>`).join('')}</div>
    <label class="fld" style="margin-top:12px">Custom (minutes)<input id="sessMin" inputmode="numeric" value="${last}"></label>
    <button class="btn acc" data-sessgo>${cloud ? 'Start for both of us' : 'Start'}</button>`);
}
function sessStopSheet() {
  openSheet(`<h3>End the session?</h3><div class="sub">${clients[PROF] && clients[PROF].session ? `This stops the timer on ${PROFILES[other()].name}'s phone too.` : 'This stops the timer.'}</div><button class="btn acc" data-sessstopyes>End session</button><button class="btn ghost" data-sessback>Keep going</button>`);
}
let sessKey = '';
function renderSess(force) {
  const el = $('sessBar'); if (!el) return;
  const s = getSess(), act = sessActive(s);
  const key = act ? `${s.id}|${s.state}|${s.dur}|${s.who}|${s.end}|${s.left}` : `idle|${tab}`;
  if (!force && key === sessKey) return sessTick();
  sessKey = key;
  if (!act) { el.innerHTML = tab === 'workout' ? `<button class="sess-idle" data-sessopen>⏱ Set a session time limit</button>` : ''; return; }
  const by = s.by === PROF ? 'you' : whoName(s.by);
  el.innerHTML = `<div class="sess ${s.state}"><svg class="ss-ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="bg"/><circle cx="20" cy="20" r="16" class="fg" data-ssring/></svg>
    <div class="ss-t"><b data-sstime>${fmtHMS(sessLeft(s))}</b><span data-sssub></span></div>
    ${s.state === 'pause' ? '<button class="cbtn" data-sessresume aria-label="Resume">▶</button>' : '<button class="cbtn" data-sesspause aria-label="Pause">❚❚</button>'}
    <button class="cbtn ss-add" data-sessadd aria-label="Add 10 minutes">+10</button><button class="cbtn" data-sessstop aria-label="End session">✕</button></div>`;
  el.dataset.by = by;
  sessTick();
}
function sessTick() {
  const el = $('sessBar'), s = getSess(); if (!el || !sessActive(s)) return;
  const left = sessLeft(s), over = left < 0, box = el.querySelector('.sess'); if (!box) return;
  box.classList.toggle('over', over); box.classList.toggle('low', !over && left <= 300);
  el.querySelector('[data-sstime]').textContent = over ? '+' + fmtHMS(-left) : fmtHMS(left);
  const endT = s.state === 'run' ? new Date(s.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  el.querySelector('[data-sssub]').textContent = over ? "Time's up · over the limit" : s.state === 'pause' ? `Paused · by ${el.dataset.by}` : `ends ${endT} · by ${el.dataset.by}`;
  const C = 2 * Math.PI * 16, pct = Math.max(0, Math.min(1, left / (s.dur || 1)));
  const ring = el.querySelector('[data-ssring]'); ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - pct);
  if (s.state !== 'run') return;
  let fired = {}; try { fired = JSON.parse(localStorage.getItem('gym.sessFired') || '{}'); } catch (e) { }
  const F = fired[s.id] = fired[s.id] || [];
  const due = [600, 300, 60, 0].filter(t => left <= t && left > t - 3600 && !F.includes(t));
  if (!due.length) return;
  F.push(...due); for (const k in fired) if (k !== s.id) delete fired[k];
  localStorage.setItem('gym.sessFired', JSON.stringify(fired));
  const t = Math.min(...due);
  if (t === 0) { toast("⏰ Time's up! Finish your last set", 5000); beep(880, .2, .35); setTimeout(() => beep(880, .2, .35), 300); setTimeout(() => beep(1175, .4, .35), 600); buzz([250, 120, 250, 120, 500]); burst('⏰', 10); }
  else { toast(t === 60 ? '⏱ 1 minute left' : `⏱ ${t / 60} minutes left`, 3000); beep(988, .1, .25); setTimeout(() => beep(988, .1, .25), 180); buzz([80, 60, 80]); }
}
document.querySelector('header').insertAdjacentHTML('afterend', '<div id="sessBar"></div>');
setInterval(() => renderSess(false), 1000);
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.sessopen !== undefined) return sessSheet();
  if (d.sesspick) { $('sessMin').value = d.sesspick; document.querySelectorAll('[data-sesspick]').forEach(b => b.classList.toggle('on', b === t)); return; }
  if (d.sessgo !== undefined) { const m = Math.round(num($('sessMin').value)); if (m < 1 || m > 300) return toast('Pick 1 to 300 minutes'); return sessStart(m); }
  if (d.sesspause !== undefined) return sessPause();
  if (d.sessresume !== undefined) return sessResume();
  if (d.sessadd !== undefined) return sessAdd(10);
  if (d.sessstop !== undefined) return sessStopSheet();
  if (d.sessstopyes !== undefined) return sessStop();
  if (d.sessback !== undefined) return closeSheet();
});

/* =====================================================================
   EVENTS
   ===================================================================== */
document.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.hseg) { histSeg = d.hseg; renderHistory(); return; }
  if (d.appear) { S.settings.appearance = d.appear; touchSettings(); applyTheme(); renderAll(); toast(d.appear === 'auto' ? 'Appearance follows your phone' : (d.appear === 'light' ? '☀️ Light mode' : '🌙 Dark mode'), 1500); return; }
  if (d.warm !== undefined) return warmSheet(+d.warm);
  if (d.wu !== undefined) { t.classList.toggle('done'); return; }
  if (d.plates !== undefined) return plateSheet(d.plates === '' ? null : +d.plates);
  if (d.bar) { S.settings.bar = +d.bar; touchSettings(); document.querySelectorAll('[data-bar]').forEach(b => b.classList.toggle('on', b === t)); $('plOut').innerHTML = plateViz(num($('plW').value)); return; }
  if (d.deload) return setDeload(d.deload === 'on');
  if (d.recap !== undefined) return recapSheet();
  if (d.recapm) return recapSheet(d.recapm);
  if (d.recapshare !== undefined) return shareRecap();
  if (d.recapsave !== undefined) { if (recapBlob) download(`${PROF}-recap-${recapMonth}.png`, recapBlob); return; }
  if (d.pswitch) { if (d.pswitch !== PROF) quickSwitch(d.pswitch); return; }
  if (d.partner !== undefined) { if (partnerOn()) localStorage.removeItem('gym.partnerMode'); else { localStorage.setItem('gym.partnerMode', '1'); localStorage.removeItem('gym.autoProfile'); toast('👥 Partner mode on. Switch people at the top of the Workout tab', 3500); } renderMore(); return; }
  if (d.autofill !== undefined) { S.settings.autoFill = S.settings.autoFill === false; touchSettings(); renderMore(); return; }
  if (d.mchart) return measureChart(d.mchart);
  if (d.cmpmode) { cmpMode = d.cmpmode; document.querySelectorAll('[data-cmpmode]').forEach(b => b.classList.toggle('on', b === t)); renderCompare(); return; }
  if (d.libpick) { pendingPhoto = d.libpick.split('|'); closeSheet(); $('photoInput').click(); return; }
  if (d.camopen) return openCam(d.camopen);
  if (d.camx !== undefined) return closeCam();
  if (d.camflip !== undefined) { camFacing = camFacing === 'user' ? 'environment' : 'user'; return startCam(); }
  if (d.camt !== undefined) { camTimer = +d.camt; document.querySelectorAll('[data-camt]').forEach(b => b.classList.toggle('on', b === t)); return; }
  if (d.camsnap !== undefined) return snapCam();
  if (d.camretake !== undefined) { camShot = null; $('camShot').classList.add('hide'); $('camCtl').classList.remove('hide'); $('camAfter').classList.add('hide'); return; }
  if (d.camuse !== undefined) { const [m, p] = camTarget, b = camShot; closeCam(); if (b) await savePhotoBlob(m, p, b); return; }
  // fuel
  if (d.fday) { const nd = addDays(parseDk(fuelDate), +d.fday); if (dk(nd) <= todayKey()) { fuelDate = dk(nd); renderFuel(); } return; }
  if (d.fadd) { const [k, a] = d.fadd.split(':'); setFuel(fuelDate, k, num(fuelOf(fuelDate)[k]) + num(a)); renderFuel(); if (k === 'water' && +a > 0) beep(990, .05, .15); return; }
  if (d.calc !== undefined) return calcSheet();
  if (d.calcgo !== undefined) return calcGo();
  if (d.calcuse) { const [c, p] = d.calcuse.split('|').map(Number); S.settings.goals = { ...(S.settings.goals || {}), cal: c, protein: p }; touchSettings(); closeSheet(); renderFuel(); toast('🎯 Goals set'); return; }
  // routine editor
  if (d.edopen !== undefined) { edDay = cur; return editRoutine(); }
  if (d.edday) { saveTitle(); edDay = +d.edday; return editRoutine(); }
  if (d.edmv) { saveTitle(); const [si, dir] = d.edmv.split(':').map(Number), j = si + dir; mutRoutine(R => { const sl = R[edDay].slots; [sl[si], sl[j]] = [sl[j], sl[si]]; }); remapSwaps(edDay, s => s === si ? j : s === j ? si : s); save(); return editRoutine(); }
  if (d.eddel) { saveTitle(); const si = +d.eddel; if (baseRoutine()[edDay].slots.length <= 1) return toast('A day needs at least one exercise'); mutRoutine(R => R[edDay].slots.splice(si, 1)); remapSwaps(edDay, s => s === si ? null : s > si ? s - 1 : s); save(); toast('Removed'); return editRoutine(); }
  if (d.ededit) { saveTitle(); return editSlot(d.ededit === 'new' ? 'new' : +d.ededit); }
  if (d.edsave) return saveSlot(d.edsave === 'new' ? 'new' : +d.edsave);
  if (d.edback !== undefined) return editRoutine();
  if (d.edreset !== undefined) { S.routine = null; S.routineU = Date.now(); S.settings.swaps = {}; touchSettings(); applyRoutine(); renderAll(); closeSheet(); toast('Routine reset to the original'); return; }
  // reminders
  if (d.icsopen !== undefined) return icsSheet();
  if (d.rmday) { const r = S.settings.rem = S.settings.rem || { time: '17:30', days: [1, 1, 1, 1, 1], photo: true }; r.days[+d.rmday] = r.days[+d.rmday] ? 0 : 1; t.classList.toggle('on'); return; }
  if (d.rmphoto !== undefined) { const r = S.settings.rem = S.settings.rem || { time: '17:30', days: [1, 1, 1, 1, 1], photo: true }; r.photo = !r.photo; t.classList.toggle('on'); t.textContent = r.photo ? 'On' : 'Off'; return; }
  if (d.rmgo !== undefined) return addToCalendar();
});
function saveTitle() { const el = $('edTitle'); if (!el) return; const v = el.value.trim(); if (v && v !== baseRoutine()[edDay].title) mutRoutine(R => { R[edDay].title = v; }); }
document.addEventListener('change', e => {
  const d = e.target.dataset;
  if (d.note !== undefined) { const si = +d.note, ex = exOf(cur, si), en = ensureEntry(curWeek, cur, ex); en.note = e.target.value.trim(); en.u = Date.now(); save(); return; }
  if (d.fset) { setFuel(fuelDate, d.fset, e.target.value); renderFuel(); return; }
  if (d.goal) { S.settings.goals = { ...(S.settings.goals || {}), [d.goal]: Math.max(0, Math.round(num(e.target.value))) || undefined }; touchSettings(); renderFuel(); return; }
  if (e.target.id === 'camGO') return;
});
document.addEventListener('input', e => {
  if (e.target.id === 'plW') $('plOut').innerHTML = plateViz(num(e.target.value));
  if (e.target.id === 'camGO' && $('camG')) $('camG').style.opacity = e.target.value / 100;
  if (e.target.classList.contains('note')) { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
});
