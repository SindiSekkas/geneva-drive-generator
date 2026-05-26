import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';

test('n=6, b=55, p=4, t=0.1 produces the screenshot reference values', () => {
  const out = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  expect(out.a).toBeCloseTo(31.7543, 4);
  expect(out.b).toBe(55);
  expect(out.c).toBeCloseTo(63.5085, 4);
  expect(out.s).toBeCloseTo(23.2457, 4);
  expect(out.w).toBeCloseTo(4.1, 4);
  expect(out.y).toBeCloseTo(25.7543, 4);
  expect(out.z).toBeCloseTo(25.6543, 4);
  expect(out.v).toBeCloseTo(44.4345, 4);
  expect(out.warnings).toEqual([]);
});

test('n=4, b=105 produces c ≈ 148.49 (blog comment)', () => {
  const out = deriveParams({ mode: 'b', b: 105, n: 4, p: 1, t: 0.05 });
  expect(out.c).toBeCloseTo(148.49, 2);
});

test('a-mode and b-mode are equivalent for the same geometry', () => {
  const bMode = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const aMode = deriveParams({ mode: 'a', a: bMode.a, n: 6, p: 4, t: 0.1 });
  expect(aMode.b).toBeCloseTo(bMode.b, 6);
  expect(aMode.c).toBeCloseTo(bMode.c, 6);
  expect(aMode.s).toBeCloseTo(bMode.s, 6);
  expect(aMode.y).toBeCloseTo(bMode.y, 6);
});

test('n < 3 produces a warning', () => {
  const out = deriveParams({ mode: 'b', b: 55, n: 2, p: 4, t: 0.1 });
  expect(out.warnings.some((w) => /n must be at least 3/i.test(w))).toBe(true);
});

test('pin too large for crank radius (y negative) warns', () => {
  const out = deriveParams({ mode: 'b', b: 10, n: 6, p: 20, t: 0.1 });
  expect(out.warnings.some((w) => /stop arc radius/i.test(w))).toBe(true);
});

test('negative or zero radius input warns', () => {
  const out = deriveParams({ mode: 'b', b: 0, n: 6, p: 4, t: 0.1 });
  expect(out.warnings.length).toBeGreaterThan(0);
});
