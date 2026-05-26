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
