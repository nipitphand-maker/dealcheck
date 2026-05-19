import { toBase, baseUnit, fmt, timeAgo, calcPromo, calcPPU } from './core.js';

const COLORS = ['#f472b6', '#2dd4bf', '#f59e0b', '#a78bfa', '#fb923c'];
const LABELS = ['A', 'B', 'C', 'D', 'E'];
const SITE_URL = 'https://dealcheck-app.pages.dev';

// Read initial language from <html lang="th|en">
let lang = document.documentElement.lang === 'en' ? 'en' : 'th';
let itemCount = 0, lastResult = null;

const T = {
  th: {
    addTxt: 'เพิ่มสินค้า', cta: 'เปรียบเลย!', back: '✏️ แก้ไข',
    winBadge: '🏆 คุ้มที่สุด', tieBadge: '🤝 เท่ากัน',
    tieMsg: 'ราคาต่อหน่วยเท่ากัน!',
    cheapBy: p => `ถูกกว่า <strong>${p}%</strong>`,
    share: 'แชร์', hist: 'ประวัติ', newCmp: 'เปรียบใหม่',
    dTitle: '📋 ประวัติ', clrBtn: 'ล้างทั้งหมด',
    emptyH: 'ยังไม่มีประวัติ',
    pLbl: 'ราคา', aLbl: 'ปริมาณ', promoLbl: 'โปรโมชั่น', nameLbl: 'ชื่อ',
    ph: i => `สินค้า ${LABELS[i]}`,
    pNone: 'ปกติ', pPct: 'ลด%', p1p1: '1แถม1', p2p1: '2แถม1', pCust: 'กำหนดเอง',
    isPack: 'เป็นแพค', pcs: 'ชิ้น',
    volH: (t, u) => `= ${t} ${u} รวม`,
    effP: (p, t) => `ราคาจริง ฿${p} (ต่อ ${t})`,
    barSub: (p, v, u) => `ราคา ฿${p} / ได้ ${v} ${u}`,
    buy: 'ซื้อ', get: 'แถม', pieces: 'ชิ้น',
    err: 'กรุณากรอกให้ครบ', errMin: 'ต้องมีอย่างน้อย 2 ชิ้น',
    maxItems: 'สูงสุด 5 ชิ้น', copied: 'คัดลอกแล้ว 📋',
    promoTag: {
      none: '', pct: d => `ลด ${d}%`, p1: '1แถม1', p2: '2แถม1',
      custom: (b, g) => `ซื้อ${b}แถม${g}`,
    },
    rmItem: 'นำสินค้าออก',
    fontIncrease: 'เพิ่มขนาดตัวอักษร', fontDecrease: 'ลดขนาดตัวอักษร',
    historyBtn: 'ประวัติการเปรียบเทียบ', installBtn: 'ติดตั้งเป็นแอป',
    histDrawer: 'ประวัติการเปรียบเทียบ', iosModal: 'วิธีติดตั้งบน iPhone',
  },
  en: {
    addTxt: 'Add Product', cta: 'Compare!', back: '✏️ Edit',
    winBadge: '🏆 Best Deal', tieBadge: '🤝 Tie',
    tieMsg: 'Same unit price!',
    cheapBy: p => `<strong>${p}% cheaper</strong>`,
    share: 'Share', hist: 'History', newCmp: 'Compare new',
    dTitle: '📋 History', clrBtn: 'Clear all',
    emptyH: 'No history yet',
    pLbl: 'Price', aLbl: 'Amount', promoLbl: 'Promotion', nameLbl: 'Name',
    ph: i => `Product ${LABELS[i]}`,
    pNone: 'Normal', pPct: '% off', p1p1: 'Buy1Get1', p2p1: '2for1', pCust: 'Custom',
    isPack: 'Pack', pcs: 'pcs',
    volH: (t, u) => `= ${t} ${u} total`,
    effP: (p, t) => `Eff. price ฿${p} (per ${t})`,
    barSub: (p, v, u) => `Price ฿${p} / Get ${v} ${u}`,
    buy: 'Buy', get: 'Get', pieces: 'pcs',
    err: 'Please fill in all fields', errMin: 'Need at least 2 items',
    maxItems: 'Max 5 items', copied: 'Copied! 📋',
    promoTag: {
      none: '', pct: d => `${d}% off`, p1: 'Buy1Get1', p2: 'Buy2Get1',
      custom: (b, g) => `Buy${b}Get${g}`,
    },
    rmItem: 'Remove item',
    fontIncrease: 'Increase font size', fontDecrease: 'Decrease font size',
    historyBtn: 'Comparison history', installBtn: 'Install as app',
    histDrawer: 'Comparison history', iosModal: 'How to install on iPhone',
  },
};

// ── FONT SIZE ──
const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;
let zoomLevel = isStandaloneMode ? 1.2 : 1.0;
document.getElementById('mainWrap').style.zoom = zoomLevel;

function adjFont(dir) {
  zoomLevel = Math.min(1.5, Math.max(0.7, +(zoomLevel + dir * 0.1).toFixed(1)));
  document.getElementById('mainWrap').style.zoom = zoomLevel;
}

// ── LANG ──
function setLang(l) {
  lang = l;
  document.querySelectorAll('.lbtn').forEach((b, i) =>
    b.classList.toggle('on', (i === 0 && l === 'th') || (i === 1 && l === 'en'))
  );
  applyLang();
}

function applyLang() {
  const t = T[lang];
  qi('addTxt', t.addTxt); qi('ctaTxt', t.cta); qi('backTxt', t.back);
  qi('newCmpTxt', t.newCmp); qi('shareTxt', t.share); qi('histTxt', t.hist);
  qi('dTitle', t.dTitle); qi('clrBtn', t.clrBtn);
  document.querySelectorAll('.card[data-idx]').forEach(c => refreshCardLang(c));
  renderHist();
}

function qi(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }

function refreshCardLang(card) {
  const t = T[lang], i = parseInt(card.dataset.idx);
  const n = card.querySelector('[data-name]');
  if (n) { n.placeholder = t.ph(i); n.setAttribute('aria-label', t.nameLbl); }
  const pl = card.querySelector('.plbl'); if (pl) pl.textContent = t.pLbl;
  const al = card.querySelector('.albl'); if (al) al.textContent = t.aLbl;
  const prl = card.querySelector('.prolbl'); if (prl) prl.textContent = t.promoLbl;
  const pk = card.querySelector('.packlbl'); if (pk) pk.textContent = t.isPack;
  const pcs = card.querySelector('option[value="pcs"]'); if (pcs) pcs.textContent = t.pcs;
  const priceIn = card.querySelector('[data-price]');
  if (priceIn) priceIn.setAttribute('aria-label', t.pLbl);
  const amtIn = card.querySelector('[data-amt]');
  if (amtIn) amtIn.setAttribute('aria-label', t.aLbl);
  const rmBtn = card.querySelector('.rm-btn');
  if (rmBtn) rmBtn.setAttribute('aria-label', t.rmItem);
  const sel = card.querySelector('[data-promo-sel]');
  if (sel) {
    sel.setAttribute('aria-label', t.promoLbl);
    const opts = [t.pNone, t.pPct, t.p1p1, t.p2p1, t.pCust];
    [...sel.options].forEach((o, i) => { if (opts[i]) o.text = opts[i]; });
  }
  liveUpdate(card.id);
}

// ── CARD CREATION ──
function makeCardHTML(idx, isExtra) {
  const t = T[lang], color = COLORS[idx % COLORS.length], id = 'item-' + idx;
  const canRM = idx >= 2;
  return `
    <div class="card${isExtra ? ' extra' : ''}" id="${id}" data-idx="${idx}">
      ${isExtra ? makeExtraCard(idx, color, t, canRM) : makeMainCard(idx, color, t, canRM)}
    </div>`;
}

function makeMainCard(idx, color, t, canRM) {
  const id = 'item-' + idx;
  return `
    <div class="card-label">
      <div class="dot" style="background:${color}">${LABELS[idx]}</div>
      <input type="text" data-name placeholder="${t.ph(idx)}" aria-label="${t.nameLbl}"
        style="flex:1;min-width:0;background:transparent;border:none;border-bottom:1.5px solid var(--border);color:var(--text);font-size:.82rem;font-weight:700;font-family:inherit;outline:none;padding:1px 2px;transition:border-color .2s">
      ${canRM ? `<button class="rm-btn" data-action="remove" aria-label="${t.rmItem}">✕</button>` : ''}
    </div>

    <div class="promo-row">
      <span class="fl prolbl">${t.promoLbl}</span>
      <select class="promo-sel" data-promo-sel aria-label="${t.promoLbl}">
        <option value="none">${t.pNone}</option>
        <option value="pct">${t.pPct}</option>
        <option value="1plus1">${t.p1p1}</option>
        <option value="2plus1">${t.p2p1}</option>
        <option value="custom">${t.pCust}</option>
      </select>
      <div class="promo-extra" data-promo-extra></div>
    </div>

    <span class="fl plbl">${t.pLbl}</span>
    <input type="number" class="num-in" data-price placeholder="0" min="0" step="any" aria-label="${t.pLbl}">

    <div class="pack-row" style="margin-top:6px">
      <label class="tgl"><input type="checkbox" data-pack aria-label="${t.isPack}"><span class="tslider"></span></label>
      <span class="packlbl" style="font-size:.62rem;font-weight:700;color:var(--sub);cursor:pointer">${t.isPack}</span>
    </div>
    <div class="pack-inputs" data-pack-inputs>
      <input type="number" class="pack-in" data-pack-qty placeholder="6" min="1" step="1" aria-label="Pack quantity">
      <span class="xsign">×</span>
      <input type="number" class="pack-in" data-pack-uvol placeholder="150" step="any" aria-label="Volume per piece">
    </div>
    <div class="vhint" data-vol-hint></div>

    <span class="fl albl" style="margin-top:4px">${t.aLbl}</span>
    <div class="unit-row">
      <input type="number" class="num-in" data-amt placeholder="0" min="0" step="any" aria-label="${t.aLbl}">
      <select class="unit-sel" data-unit aria-label="Unit">
        <option value="ml">ml</option><option value="l">L</option>
        <option value="g">g</option><option value="kg">kg</option>
        <option value="pcs">${t.pcs}</option>
      </select>
    </div>
    <div class="eff-price" data-eff></div>
  `;
}

function makeExtraCard(idx, color, t, canRM) {
  const id = 'item-' + idx;
  return `
    <div class="extra-left">
      <div class="dot" style="background:${color}">${LABELS[idx]}</div>
    </div>
    <div class="extra-mid">
      <div>
        <span class="fl" style="font-size:.55rem">${t.nameLbl}</span>
        <input type="text" data-name placeholder="${t.ph(idx)}" aria-label="${t.nameLbl}"
          style="width:100%;background:var(--surface2);border:2px solid var(--border);border-radius:var(--rs);color:var(--text);font-family:inherit;font-size:.78rem;font-weight:700;padding:5px 7px;outline:none;transition:border-color .2s">
      </div>
      <div>
        <span class="fl prolbl" style="font-size:.55rem">${t.promoLbl}</span>
        <select class="promo-sel" data-promo-sel aria-label="${t.promoLbl}" style="font-size:.72rem;padding:4px 22px 4px 6px">
          <option value="none">${t.pNone}</option>
          <option value="pct">${t.pPct}</option>
          <option value="1plus1">${t.p1p1}</option>
          <option value="2plus1">${t.p2p1}</option>
          <option value="custom">${t.pCust}</option>
        </select>
        <div class="promo-extra" data-promo-extra></div>
      </div>
      <div>
        <span class="fl plbl" style="font-size:.55rem">${t.pLbl}</span>
        <input type="number" class="num-in" data-price placeholder="0" min="0" step="any" aria-label="${t.pLbl}" style="font-size:.82rem;padding:5px 7px">
      </div>
      <div>
        <span class="fl albl" style="font-size:.55rem">${t.aLbl}</span>
        <div class="unit-row">
          <input type="number" class="num-in" data-amt placeholder="0" min="0" step="any" aria-label="${t.aLbl}" style="font-size:.82rem;padding:5px 7px">
          <select class="unit-sel" data-unit aria-label="Unit">
            <option value="ml">ml</option><option value="l">L</option>
            <option value="g">g</option><option value="kg">kg</option>
            <option value="pcs">${t.pcs}</option>
          </select>
        </div>
      </div>
      <div style="grid-column:span 2">
        <div class="pack-row">
          <label class="tgl"><input type="checkbox" data-pack aria-label="${t.isPack}"><span class="tslider"></span></label>
          <span class="packlbl" style="font-size:.6rem;font-weight:700;color:var(--sub)">${t.isPack}</span>
        </div>
        <div class="pack-inputs" data-pack-inputs>
          <input type="number" class="pack-in" data-pack-qty placeholder="6" min="1" step="1" aria-label="Pack quantity">
          <span class="xsign">×</span>
          <input type="number" class="pack-in" data-pack-uvol placeholder="150" step="any" aria-label="Volume per piece">
        </div>
        <div class="vhint" data-vol-hint></div>
        <div class="eff-price" data-eff></div>
      </div>
    </div>
    <div class="extra-right">
      <button class="rm-btn" data-action="remove" aria-label="${t.rmItem}">✕</button>
    </div>
  `;
}

function addItem() {
  if (itemCount >= 5) { showToast(T[lang].maxItems); return; }
  const idx = itemCount++;
  const isExtra = idx >= 2;
  const container = document.getElementById(isExtra ? 'extraList' : 'mainGrid');
  container.insertAdjacentHTML('beforeend', makeCardHTML(idx, isExtra));
}

function removeItem(id) { document.getElementById(id)?.remove(); }

// ── PROMO ──
function setPromo(id, type) {
  const card = document.getElementById(id); if (!card) return;
  card.dataset.promoType = type;

  const t = T[lang];
  const extra = card.querySelector('[data-promo-extra]');
  extra.classList.remove('show'); extra.innerHTML = '';

  if (type === 'pct') {
    extra.innerHTML = `<div class="pct-input-row">
      <input type="number" class="pack-in" data-pct placeholder="40" min="0" max="99" step="any" aria-label="Discount percentage">
      <span class="pct-sign">%</span>
    </div>`;
    extra.classList.add('show');
  } else if (type === 'custom') {
    extra.innerHTML = `<div class="custom-row">
      <span class="custom-sep">${t.buy}</span>
      <input type="number" class="pack-in" data-buy placeholder="3" min="1" step="1" aria-label="Buy quantity">
      <span class="custom-sep">${t.get}</span>
      <input type="number" class="pack-in" data-get placeholder="1" min="1" step="1" aria-label="Free quantity">
      <span class="custom-sep">${t.pieces}</span>
    </div>`;
    extra.classList.add('show');
  }
  liveUpdate(id);
}

// ── PACK ──
function togglePack(id) {
  const card = document.getElementById(id); if (!card) return;
  const on = card.querySelector('[data-pack]').checked;
  card.querySelector('[data-pack-inputs]').classList.toggle('show', on);
  if (!on) card.querySelector('[data-vol-hint]').textContent = '';
  liveUpdate(id);
}

// ── EFFECTIVE PRICE (DOM → core) ──
function calcEffective(card) {
  const price = parseFloat(card.querySelector('[data-price]')?.value) || 0;
  const sel = card.querySelector('[data-promo-sel]');
  const type = sel ? sel.value : (card.dataset.promoType || 'none');
  card.dataset.promoType = type;

  const pct = parseFloat(card.querySelector('[data-pct]')?.value) || 0;
  const buy = parseFloat(card.querySelector('[data-buy]')?.value) || 1;
  const get = parseFloat(card.querySelector('[data-get]')?.value) || 0;

  const { effPrice, unitQty } = calcPromo(price, type, { pct, buy, get });

  const t = T[lang];
  let tag = '';
  if (type === 'pct')     tag = t.promoTag.pct(pct);
  else if (type === '1plus1') tag = t.promoTag.p1;
  else if (type === '2plus1') tag = t.promoTag.p2;
  else if (type === 'custom') tag = t.promoTag.custom(buy, get);

  return { effPrice, unitQty, tag };
}

function getVolume(card) {
  const isPack = card.querySelector('[data-pack]')?.checked;
  const unit = card.querySelector('[data-unit]')?.value || 'ml';
  const pcsLabel = T[lang].pcs;
  if (isPack) {
    const qty = parseFloat(card.querySelector('[data-pack-qty]')?.value) || 0;
    const uvol = parseFloat(card.querySelector('[data-pack-uvol]')?.value) || 0;
    return { vol: toBase(qty * uvol, unit), rawVol: qty * uvol, unit: baseUnit(unit, pcsLabel) };
  }
  const amt = parseFloat(card.querySelector('[data-amt]')?.value) || 0;
  return { vol: toBase(amt, unit), rawVol: amt, unit: baseUnit(unit, pcsLabel) };
}

// ── LIVE UPDATE ──
function liveUpdate(id) {
  const card = document.getElementById(id); if (!card) return;
  const t = T[lang];
  const isPack = card.querySelector('[data-pack]')?.checked;
  const hint = card.querySelector('[data-vol-hint]');
  const unit = card.querySelector('[data-unit]')?.value || 'ml';
  if (isPack) {
    const qty = parseFloat(card.querySelector('[data-pack-qty]')?.value) || 0;
    const uvol = parseFloat(card.querySelector('[data-pack-uvol]')?.value) || 0;
    const total = qty * uvol;
    hint.textContent = qty && uvol
      ? t.volH(total % 1 === 0 ? total : total.toFixed(1), baseUnit(unit, t.pcs))
      : '';
  } else {
    hint.textContent = '';
  }
  const effEl = card.querySelector('[data-eff]');
  if (effEl) {
    const { effPrice, unitQty, tag } = calcEffective(card);
    const { unit: u } = getVolume(card);
    const type = card.dataset.promoType || 'none';
    if (effPrice > 0 && type !== 'none') {
      const perU = unitQty > 1 ? `${unitQty} ${u || t.pcs}` : (u || t.pcs);
      effEl.textContent = t.effP(fmt(effPrice), perU) + (tag ? ` · ${tag}` : '');
    } else {
      effEl.textContent = '';
    }
  }
}

// ── CALCULATE ──
function calculate() {
  const t = T[lang];
  const cards = [...document.querySelectorAll('.card[data-idx]')];
  if (cards.length < 2) { showToast(t.errMin); return; }

  const items = [];
  for (const card of cards) {
    const nameEl = card.querySelector('[data-name]');
    const name = nameEl?.value.trim() || nameEl?.placeholder || '?';
    const price = parseFloat(card.querySelector('[data-price]')?.value);
    const idx = parseInt(card.dataset.idx);
    let { vol, unit } = getVolume(card);
    const { effPrice, unitQty, tag } = calcEffective(card);

    if (!price) { showToast(t.err); return; }
    const noVol = !vol;
    if (noVol) { vol = 1; unit = lang === 'th' ? 'ชิ้น' : 'pcs'; }

    const ppu = calcPPU(effPrice, unitQty, vol);
    const totalVol = vol * unitQty;
    items.push({ name, price, effPrice, totalVol, vol, ppu, unit, color: COLORS[idx % COLORS.length], idx, tag, unitQty, noVol });
  }

  const sorted = [...items].sort((a, b) => a.ppu - b.ppu);
  const best = sorted[0].ppu, worst = sorted[sorted.length - 1].ppu;
  const isTie = Math.abs(best - worst) < 0.0001;
  const winner = sorted[0];

  document.getElementById('winBadge').textContent = isTie ? t.tieBadge : t.winBadge;
  document.getElementById('winName').textContent = winner.name;
  document.getElementById('winName').style.color = isTie ? '#f59e0b' : winner.color;
  document.getElementById('winNote').innerHTML = isTie
    ? t.tieMsg
    : t.cheapBy(((worst - best) / worst * 100).toFixed(1));

  const barsEl = document.getElementById('barsCard'); barsEl.innerHTML = '';
  sorted.forEach((item, rank) => {
    const fill = worst > 0 ? (item.ppu / worst * 100).toFixed(1) : 100;
    const promoLine = item.tag
      ? `<div class="bar-promo" style="color:${item.color}">${item.tag}</div>` : '';
    const div = document.createElement('div'); div.className = 'bar-item';
    div.innerHTML = `
      <div class="bar-top">
        <div class="bar-name"><div class="bdot" style="background:${item.color}"></div>${rank === 0 && !isTie ? '🏆 ' : ''}${item.name}</div>
        <div class="bar-ppu">฿${fmt(item.ppu)}/${item.unit}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="background:${item.color};width:0%" data-w="${fill}"></div></div>
      <div class="bar-sub">${t.barSub(fmt(item.effPrice), fmt(item.totalVol), item.unit)}</div>
      ${promoLine}
    `;
    barsEl.appendChild(div);
  });
  setTimeout(() =>
    document.querySelectorAll('.bar-fill[data-w]').forEach(e => e.style.width = e.dataset.w + '%'),
    80
  );

  document.querySelectorAll('.card[data-idx]').forEach(c => {
    c.classList.toggle('win', parseInt(c.dataset.idx) === winner.idx && !isTie);
  });

  lastResult = { items, sorted, isTie, winner, ts: Date.now() };
  saveHist(lastResult); renderHist();
  showView('result');
}

// ── VIEWS ──
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('on'));
  document.getElementById('v' + cap(v)).classList.add('on');
  const isR = v === 'result';
  document.getElementById('ctaBtn').style.display = isR ? 'none' : '';
  document.getElementById('backBtn').style.display = isR ? '' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function goBack() { showView('form'); }

function newComparison() {
  document.querySelectorAll('.card[data-idx]').forEach(card => {
    const nameEl = card.querySelector('[data-name]'); if (nameEl) nameEl.value = '';
    const priceEl = card.querySelector('[data-price]'); if (priceEl) priceEl.value = '';
    card.querySelectorAll('[data-amt]').forEach(i => i.value = '');
    card.querySelectorAll('[data-pack-qty],[data-pack-uvol]').forEach(i => i.value = '');
    card.querySelectorAll('[data-disc],[data-buy],[data-get]').forEach(i => i.value = '');
    const pack = card.querySelector('[data-pack]'); if (pack) pack.checked = false;
    const promoSel = card.querySelector('.promo-sel');
    if (promoSel) { promoSel.value = 'none'; promoSel.dispatchEvent(new Event('change')); }
    card.classList.remove('win');
    liveUpdate(card.id);
  });
  document.querySelectorAll('#extraList .card[data-idx]').forEach(c => c.remove());
  itemCount = 2;
  lastResult = null;
  showView('form');
}

// ── SHARE ──
function shareResult() {
  if (!lastResult) return;
  const { sorted, isTie, winner } = lastResult;
  const lines = sorted.map((it, i) => {
    const promo = it.tag ? ` (${it.tag})` : '';
    return `${i + 1}. ${it.name}${promo} → ฿${fmt(it.ppu)}/${it.unit}`;
  }).join('\n');
  const isEn = lang === 'en';
  const base = isEn ? SITE_URL + '/en/' : SITE_URL;
  const header = isTie
    ? (isEn ? '🤝 Same unit price!' : '🤝 ราคาต่อหน่วยเท่ากัน!')
    : (isEn ? `🏆 ${winner.name} is the best deal!` : `🏆 ${winner.name} คุ้มที่สุด!`);
  const text = `🛒 DealCheck\n${header}\n\n${lines}\n\n👉 ${isEn ? 'Compare yours at' : 'เปรียบเองได้ที่'} ${base}`;

  if (navigator.share) {
    navigator.share({ title: 'DealCheck', text, url: base }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast(T[lang].copied));
  }
}

// ── HISTORY ──
function saveHist(r) {
  const h = getHist();
  h.unshift({
    ts: r.ts, winner: r.winner.name, wc: r.winner.color, isTie: r.isTie,
    items: r.items.map(i => i.name + (i.tag ? ' [' + i.tag + ']' : '')),
  });
  localStorage.setItem('dc2', JSON.stringify(h.slice(0, 10)));
}
function getHist() { try { return JSON.parse(localStorage.getItem('dc2') || '[]'); } catch { return []; } }
function clearHist() { localStorage.removeItem('dc2'); renderHist(); }
function renderHist() {
  const t = T[lang], hist = getHist(), el = document.getElementById('histList');
  if (!el) return;
  if (!hist.length) { el.innerHTML = `<div class="empty-h">${t.emptyH}</div>`; return; }
  el.innerHTML = '';
  hist.forEach(h => {
    const d = document.createElement('div'); d.className = 'hi';
    d.innerHTML = `<div class="hi-top"><div class="hi-w" style="color:${h.isTie ? '#f59e0b' : h.wc}">${h.isTie ? '🤝' : '🏆'} ${h.winner}</div><div class="hi-t">${timeAgo(h.ts, lang)}</div></div><div class="hi-its">${h.items.join(' · ')}</div>`;
    el.appendChild(d);
  });
}

function openH() { renderHist(); document.getElementById('histOv').classList.add('open'); }
function closeH() { document.getElementById('histOv').classList.remove('open'); }

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2200);
}

// ── PWA INSTALL ──
let deferredPrompt = null;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;

function showInstallBtn() {
  if (isStandalone) return;
  const b = document.getElementById('installBtn');
  if (b) b.style.display = 'flex';
}
function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      const b = document.getElementById('installBtn');
      if (b) b.style.display = 'none';
    });
  } else if (isIOS) {
    document.getElementById('iosInstallModal').classList.add('show');
  }
}
function closeIosModal() {
  document.getElementById('iosInstallModal').classList.remove('show');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBtn();
});
window.addEventListener('appinstalled', () => {
  const b = document.getElementById('installBtn');
  if (b) b.style.display = 'none';
});
if (isIOS && !isStandalone) setTimeout(showInstallBtn, 800);

// ── SERVICE WORKER ──
if ('serviceWorker' in navigator) {
  const swRegister = () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
      setInterval(() => reg.update(), 30 * 60 * 1000);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showToast(lang === 'th' ? '✨ มีเวอร์ชั่นใหม่ — กำลังโหลด...' : '✨ New version — reloading...');
            setTimeout(() => window.location.reload(), 1800);
          }
        });
      });
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(swRegister, { timeout: 4000 });
  } else {
    window.addEventListener('load', swRegister);
  }
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// ── EVENT DELEGATION (replaces all inline on* handlers) ──
document.addEventListener('input', e => {
  const card = e.target.closest('.card[data-idx]');
  if (card) liveUpdate(card.id);
});

document.addEventListener('change', e => {
  const card = e.target.closest('.card[data-idx]');
  if (!card) return;
  if (e.target.matches('[data-promo-sel]')) setPromo(card.id, e.target.value);
  else if (e.target.matches('[data-pack]')) togglePack(card.id);
  else liveUpdate(card.id);
});

document.addEventListener('click', e => {
  if (e.target.closest('[data-action="remove"]')) {
    const card = e.target.closest('.card[data-idx]');
    if (card) removeItem(card.id);
  }
});

// Focus/blur border style for name text inputs (handled by CSS for number inputs)
document.addEventListener('focus', e => {
  if (e.target.matches('input[type="text"][data-name]'))
    e.target.style.borderColor = 'var(--pink)';
}, true);
document.addEventListener('blur', e => {
  if (e.target.matches('input[type="text"][data-name]'))
    e.target.style.borderColor = 'var(--border)';
}, true);

// Static button wiring
document.querySelector('.fbtn.fminus')?.addEventListener('click', () => adjFont(-1));
document.querySelector('.fbtn.fplus')?.addEventListener('click', () => adjFont(1));
document.querySelector('.hist-btn')?.addEventListener('click', openH);
document.getElementById('installBtn')?.addEventListener('click', installPWA);
document.getElementById('ctaBtn')?.addEventListener('click', calculate);
document.getElementById('backBtn')?.addEventListener('click', goBack);
document.querySelector('.add-btn')?.addEventListener('click', addItem);
document.querySelector('.new-cmp-btn')?.addEventListener('click', newComparison);
document.querySelector('[data-action="share"]')?.addEventListener('click', shareResult);
document.querySelector('[data-action="openHist"]')?.addEventListener('click', openH);
document.getElementById('clrBtn')?.addEventListener('click', clearHist);
document.querySelector('.hbdrop')?.addEventListener('click', closeH);
document.getElementById('iosInstallModal')?.addEventListener('click', closeIosModal);
document.querySelector('.ios-modal-content')?.addEventListener('click', e => e.stopPropagation());
document.querySelector('[data-action="closeIos"]')?.addEventListener('click', closeIosModal);

// ── INIT ──
addItem(); addItem();
renderHist();
