import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toBase, baseUnit, fmt, timeAgo, calcPromo, calcPPU } from './core.js';

// ── toBase ──
describe('toBase', () => {
  it('converts litres to ml', () => expect(toBase(1, 'l')).toBe(1000));
  it('converts 1.5L to 1500ml', () => expect(toBase(1.5, 'l')).toBe(1500));
  it('converts kg to g', () => expect(toBase(2, 'kg')).toBe(2000));
  it('converts 0.5kg to 500g', () => expect(toBase(0.5, 'kg')).toBe(500));
  it('passes ml through unchanged', () => expect(toBase(330, 'ml')).toBe(330));
  it('passes g through unchanged', () => expect(toBase(500, 'g')).toBe(500));
  it('passes pcs through unchanged', () => expect(toBase(6, 'pcs')).toBe(6));
  it('handles zero', () => expect(toBase(0, 'l')).toBe(0));
});

// ── baseUnit ──
describe('baseUnit', () => {
  it('maps l → ml', () => expect(baseUnit('l')).toBe('ml'));
  it('maps kg → g', () => expect(baseUnit('kg')).toBe('g'));
  it('maps ml → ml (pass-through)', () => expect(baseUnit('ml')).toBe('ml'));
  it('maps g → g (pass-through)', () => expect(baseUnit('g')).toBe('g'));
  it('maps pcs → default pcsLabel', () => expect(baseUnit('pcs')).toBe('pcs'));
  it('maps pcs → custom pcsLabel', () => expect(baseUnit('pcs', 'ชิ้น')).toBe('ชิ้น'));
});

// ── fmt ──
describe('fmt', () => {
  it('formats numbers ≥ 1 to 2 decimal places', () => {
    expect(fmt(1)).toBe('1.00');
    expect(fmt(25)).toBe('25.00');
    expect(fmt(1.5)).toBe('1.50');
    expect(fmt(9.999)).toBe('10.00');
  });
  it('formats numbers < 1 to 3 decimal places', () => {
    expect(fmt(0.5)).toBe('0.500');
    expect(fmt(0.123)).toBe('0.123');
    expect(fmt(0.1234)).toBe('0.123');
  });
  it('handles zero', () => expect(fmt(0)).toBe('0.000'));
  it('boundary: exactly 1', () => expect(fmt(1)).toBe('1.00'));
});

// ── timeAgo ──
describe('timeAgo', () => {
  let now;
  beforeEach(() => { now = Date.now(); vi.spyOn(Date, 'now').mockReturnValue(now); });
  afterEach(() => vi.restoreAllMocks());

  const sec = 1000, min = 60 * sec, hr = 60 * min, day = 24 * hr;

  it('returns "just now" for < 1 min (en)', () => {
    expect(timeAgo(now - 30 * sec, 'en')).toBe('just now');
  });
  it('returns "เมื่อกี้" for < 1 min (th)', () => {
    expect(timeAgo(now - 30 * sec, 'th')).toBe('เมื่อกี้');
  });
  it('returns minutes ago (en)', () => {
    expect(timeAgo(now - 5 * min, 'en')).toBe('5m ago');
  });
  it('returns minutes ago (th)', () => {
    expect(timeAgo(now - 5 * min, 'th')).toBe('5 นาทีที่แล้ว');
  });
  it('returns hours ago (en)', () => {
    expect(timeAgo(now - 3 * hr, 'en')).toBe('3h ago');
  });
  it('returns hours ago (th)', () => {
    expect(timeAgo(now - 3 * hr, 'th')).toBe('3 ชั่วโมงที่แล้ว');
  });
  it('returns formatted date for ≥ 24h (en)', () => {
    const ts = now - 2 * day;
    const result = timeAgo(ts, 'en');
    expect(result).toMatch(/\d+/); // has a number (day)
  });
  it('boundary: exactly 60 minutes returns hours', () => {
    expect(timeAgo(now - 60 * min, 'en')).toBe('1h ago');
  });
});

// ── calcPromo ──
describe('calcPromo', () => {
  it('none: returns original price, qty 1', () => {
    expect(calcPromo(100, 'none')).toEqual({ effPrice: 100, unitQty: 1 });
  });
  it('pct 0%: no change', () => {
    expect(calcPromo(100, 'pct', { pct: 0 })).toEqual({ effPrice: 100, unitQty: 1 });
  });
  it('pct 20%: reduces price by 20%', () => {
    expect(calcPromo(100, 'pct', { pct: 20 })).toEqual({ effPrice: 80, unitQty: 1 });
  });
  it('pct 50%: half price', () => {
    expect(calcPromo(200, 'pct', { pct: 50 })).toEqual({ effPrice: 100, unitQty: 1 });
  });
  it('pct 100%: price is 0', () => {
    expect(calcPromo(100, 'pct', { pct: 100 })).toEqual({ effPrice: 0, unitQty: 1 });
  });
  it('1plus1: half price, qty 2', () => {
    expect(calcPromo(100, '1plus1')).toEqual({ effPrice: 50, unitQty: 2 });
  });
  it('2plus1: 2/3 price, qty 3', () => {
    const { effPrice, unitQty } = calcPromo(90, '2plus1');
    expect(effPrice).toBeCloseTo(60);
    expect(unitQty).toBe(3);
  });
  it('custom buy3get1: pay 3/4 price, qty 4', () => {
    const { effPrice, unitQty } = calcPromo(100, 'custom', { buy: 3, get: 1 });
    expect(effPrice).toBeCloseTo(75);
    expect(unitQty).toBe(4);
  });
  it('custom buy2get2: half price, qty 4', () => {
    const { effPrice, unitQty } = calcPromo(100, 'custom', { buy: 2, get: 2 });
    expect(effPrice).toBeCloseTo(50);
    expect(unitQty).toBe(4);
  });
  it('returns zero effPrice when price is 0', () => {
    expect(calcPromo(0, '1plus1')).toEqual({ effPrice: 0, unitQty: 1 });
  });
});

// ── calcPPU ──
describe('calcPPU', () => {
  it('basic: 100 baht / 500ml = 0.2 per ml', () => {
    expect(calcPPU(100, 1, 500)).toBeCloseTo(0.2);
  });
  it('1plus1: 100 baht → 50 effPrice, qty 2, 500ml → 0.05 per ml', () => {
    const { effPrice, unitQty } = calcPromo(100, '1plus1');
    expect(calcPPU(effPrice, unitQty, 500)).toBeCloseTo(0.05);
  });
  it('with unit conversion: 1.5L at 30 baht', () => {
    // toBase(1.5, 'l') = 1500ml
    expect(calcPPU(30, 1, toBase(1.5, 'l'))).toBeCloseTo(0.02);
  });
  it('returns Infinity when vol is 0', () => {
    expect(calcPPU(100, 1, 0)).toBe(Infinity);
  });
  it('ppu ranking: cheaper item has lower ppu', () => {
    const ppuA = calcPPU(100, 1, 500);   // 0.2/ml
    const ppuB = calcPPU(100, 1, 1000);  // 0.1/ml
    expect(ppuB).toBeLessThan(ppuA);
  });
});
