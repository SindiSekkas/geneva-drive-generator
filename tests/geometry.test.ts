import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../src/geneva/geometry';
import type { Primitive } from '../src/geneva/primitives';

test('wheel profile has n rim arcs', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const rimArcs = profile.filter((p) => p.layer === 'wheel_outer');
  expect(rimArcs).toHaveLength(6);
  for (const a of rimArcs) expect(a.kind).toBe('arc');
});

test('wheel profile has n stop-disc cutout circles', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const stops = profile.filter((p) => p.layer === 'wheel_stop_cutouts');
  expect(stops).toHaveLength(6);
  for (const s of stops) expect(s.kind).toBe('circle');
});

test('wheel profile has n slot stadiums (2n lines + n inner arcs)', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const slotLines = profile.filter(
    (p) => p.layer === 'wheel_slots' && p.kind === 'line'
  );
  const slotArcs = profile.filter(
    (p) => p.layer === 'wheel_slots' && p.kind === 'arc'
  );
  expect(slotLines).toHaveLength(12); // 2 per slot
  expect(slotArcs).toHaveLength(6); // 1 per slot
});

test('crank profile has outer circle, pin circle, and 2 stop-disc arcs', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildCrankProfile(params);
  const outer = profile.filter((p) => p.layer === 'crank_outer');
  const pin = profile.filter((p) => p.layer === 'crank_pin');
  const stop = profile.filter((p) => p.layer === 'crank_stop_disc');
  expect(outer).toHaveLength(1);
  expect(outer[0].kind).toBe('circle');
  expect(pin).toHaveLength(1);
  expect(pin[0].kind).toBe('circle');
  expect(stop).toHaveLength(2);
  for (const arc of stop) expect(arc.kind).toBe('arc');
});

test('crank profile honors offsetX (defaults to c)', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildCrankProfile(params);
  const outer = profile.find((p) => p.layer === 'crank_outer') as
    | { cx: number }
    | undefined;
  expect(outer?.cx).toBeCloseTo(params.c, 6);
});

function allCoords(p: Primitive): number[] {
  if (p.kind === 'line') return [p.x1, p.y1, p.x2, p.y2];
  if (p.kind === 'arc') return [p.cx, p.cy, p.r, p.startAngle, p.endAngle];
  return [p.cx, p.cy, p.r];
}

test('every primitive in both profiles has finite coordinates', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const all = [...buildWheelProfile(params), ...buildCrankProfile(params)];
  for (const prim of all) {
    for (const v of allCoords(prim)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  }
});
