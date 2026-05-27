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
  // Crank: 1 outer circle + 1 pin circle + 2 stop-disc circles
  expect(circles).toBe(6 + 2 + 2); // wheel cutouts + crank outer + pin + crank stop disc
  expect(arcs).toBe(6 + 6); // wheel rim + slot inners
  expect(lines).toBe(12);
});

test('DXF declares AC1009 (R12) — matches the entity format we emit', () => {
  // The previous version declared AC1015 while emitting R12-style entities
  // (no handles, no AcDb subclass markers). That mismatch caused strict
  // parsers (Fusion 360 among them) to reject the file.
  expect(dxf()).toMatch(/\$ACADVER[\r\n]+\s*1[\r\n]+AC1009/);
});

test('DXF declares a CONTINUOUS linetype before any layer references it', () => {
  const s = dxf();
  const ltypeIdx = s.indexOf('CONTINUOUS');
  const firstLayerIdx = s.indexOf('LAYER\r\n2\r\nwheel_outer');
  expect(ltypeIdx).toBeGreaterThan(-1);
  expect(firstLayerIdx).toBeGreaterThan(ltypeIdx);
});

test('DXF emits no scientific-notation numbers (parser hostile)', () => {
  // Geometric near-zeros (e.g. cos(π/2) → 6e-17) were leaking into coordinate
  // fields as "6e-17", which several DXF importers refuse to parse.
  const s = dxf();
  expect(s).not.toMatch(/[0-9]e[-+][0-9]/);
});
