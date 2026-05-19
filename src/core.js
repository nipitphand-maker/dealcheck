// Pure calculation functions — no DOM, no globals, fully testable

export function toBase(v, u) {
  return u === 'l' ? v * 1000 : u === 'kg' ? v * 1000 : v;
}

export function baseUnit(u, pcsLabel = 'pcs') {
  return u === 'l' ? 'ml' : u === 'kg' ? 'g' : u === 'pcs' ? pcsLabel : u;
}

export function fmt(n) {
  return n < 1 ? n.toFixed(3) : n.toFixed(2);
}

export function timeAgo(ts, lang = 'en') {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  if (m < 1)  return lang === 'th' ? 'เมื่อกี้' : 'just now';
  if (m < 60) return lang === 'th' ? `${m} นาทีที่แล้ว` : `${m}m ago`;
  if (h < 24) return lang === 'th' ? `${h} ชั่วโมงที่แล้ว` : `${h}h ago`;
  return new Date(ts).toLocaleDateString(
    lang === 'th' ? 'th-TH' : 'en-GB',
    { day: 'numeric', month: 'short' }
  );
}

/**
 * Calculate effective price and unit quantity after promotion.
 * @param {number} price  - original price
 * @param {string} type   - 'none' | 'pct' | '1plus1' | '2plus1' | 'custom'
 * @param {object} opts   - { pct, buy, get } — relevant fields per type
 * @returns {{ effPrice: number, unitQty: number }}
 */
export function calcPromo(price, type, { pct = 0, buy = 1, get = 0 } = {}) {
  if (!price) return { effPrice: 0, unitQty: 1 };
  switch (type) {
    case 'pct':
      return { effPrice: price * (1 - pct / 100), unitQty: 1 };
    case '1plus1':
      return { effPrice: price / 2, unitQty: 2 };
    case '2plus1':
      return { effPrice: (price / 3) * 2, unitQty: 3 };
    case 'custom': {
      const total = buy + get;
      return { effPrice: (price / total) * buy, unitQty: total };
    }
    default:
      return { effPrice: price, unitQty: 1 };
  }
}

/**
 * Calculate price-per-unit given effective price, unit quantity, and volume.
 * @param {number} effPrice  - price paid (after promo, before promo-qty multiplier)
 * @param {number} unitQty   - number of units included in the promo
 * @param {number} vol       - volume of one unit (in base units)
 * @returns {number} price per base unit
 */
export function calcPPU(effPrice, unitQty, vol) {
  const totalVol = vol * unitQty;
  return totalVol > 0 ? effPrice / totalVol : Infinity;
}
