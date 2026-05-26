import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../src/geneva/geometry';
import { profilesToDxf } from '../src/geneva/exporters/dxf';

const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
const dxf = () => profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);

test('DXF starts with SECTION and ends with EOF', () => {
  const s = dxf();
  expect(s).toMatch(/^0\r?\nSECTION/);
  expect(s.trimEnd()).toMatch(/EOF$/);
});

test('DXF contains a LAYER table with every layer used', () => {
  const s = dxf();
  for (const layer of [
    'wheel_outer', 'wheel_slots', 'wheel_stop_cutouts',
    'crank_outer', 'crank_pin', 'crank_stop_disc',
  ]) {
    expect(s).toContain(layer);
  }
  expect(s).toContain('LAYER');
});

test('DXF declares millimeter units ($INSUNITS 4)', () => {
  expect(dxf()).toMatch(/\$INSUNITS[\r\n]+\s*70[\r\n]+\s*4/);
});

test('DXF contains the expected entity counts', () => {
  const s = dxf();
  const circles = (s.match(/^CIRCLE$/gm) ?? []).length;
  const arcs = (s.match(/^ARC$/gm) ?? []).length;
  const lines = (s.match(/^LINE$/gm) ?? []).length;
  // Wheel: 6 rim arcs + 12 slot lines + 6 slot inner arcs + 6 stop cutout circles
  // Crank: 1 outer circle + 1 pin circle + 2 stop-disc arcs
  expect(circles).toBe(6 + 2); // wheel cutouts + crank outer + pin
  expect(arcs).toBe(6 + 6 + 2); // wheel rim + slot inners + crank stop disc
  expect(lines).toBe(12);
});
