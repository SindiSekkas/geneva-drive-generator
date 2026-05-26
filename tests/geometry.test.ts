import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';
import { buildWheelProfile } from '../src/geneva/geometry';

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
