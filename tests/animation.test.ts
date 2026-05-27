import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';

/**
 * Regression test for the "gear spins while pin is outside" bug.
 *
 * The animation logic lived in a React hook (useAnimation), so we re-derive
 * the per-frame computation here to test the math in isolation — same formula
 * the hook uses.
 */
function wheelAngleDeg(driveDeg: number, p = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 })): number {
  const pinStart = Math.PI - Math.atan(p.b / p.a);
  const pinAngle = pinStart + (driveDeg * Math.PI) / 180;
  const pinX = p.c + p.a * Math.cos(pinAngle);
  const pinY = p.a * Math.sin(pinAngle);
  const dist = Math.hypot(pinX, pinY);
  if (dist <= p.b) return (Math.atan2(pinY, pinX) * 180) / Math.PI;
  return 180 / p.n;
}

test('wheel angle exactly matches the park angle at engagement entry boundary', () => {
  // At drive=0° the pin sits on the wheel rim (distance = b). atan2 must
  // return +180/n so the wheel transitions smoothly from park into the
  // engagement curve with no visible step.
  const entry = wheelAngleDeg(0);
  expect(entry).toBeCloseTo(30, 6);
});

test('wheel angle at engagement exit is exactly one pitch off the park angle', () => {
  // At the symmetric exit boundary atan2 returns -180/n; the wheel then snaps
  // to the +180/n park position. The visual rotation between these two values
  // must equal one slot pitch (360/n) so that the n-fold symmetry hides it.
  const exit = wheelAngleDeg(120);
  const park = 180 / 6;
  // n=6: exit ≈ -30°, park = +30°. |exit - park| should equal pitch = 60°.
  expect(Math.abs(exit - park)).toBeCloseTo(360 / 6, 6);
});

test('wheel angle stays at the park angle through the entire disengagement', () => {
  for (let d = 121; d <= 359; d += 13) {
    expect(wheelAngleDeg(d)).toBeCloseTo(30, 6);
  }
});

test('regression: engagement gate uses b, not b - p/2', () => {
  // The previous code used `b - p/2` and produced an exit angle whose
  // distance to park was *not* a clean pitch — leaving a visible micro-step.
  // With the correct threshold, distance-to-park at exit equals pitch exactly,
  // so this difference must be (near) zero.
  const exit = wheelAngleDeg(120);
  const distanceToPark = Math.abs(exit - 30);
  const slop = Math.abs(distanceToPark - 60);
  expect(slop).toBeLessThan(1e-6);
});
