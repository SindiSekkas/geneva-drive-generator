import type { GenevaParams } from './params';
import type { Profile, Arc, Circle, Line } from './primitives';

/**
 * Builds the 2D profile of the Geneva wheel centered at (0, 0).
 * Layers: wheel_outer, wheel_slots, wheel_stop_cutouts
 */
export function buildWheelProfile(params: GenevaParams): Profile {
  const { b, c, s, w, y, n } = params;
  const out: Profile = [];

  const slotHalfAngle = Math.asin((w / 2) / b);

  for (let i = 0; i < n; i++) {
    const slotCenter = (i * 2 * Math.PI) / n;
    const arcStart = slotCenter + slotHalfAngle;
    const arcEnd = slotCenter + (2 * Math.PI) / n - slotHalfAngle;
    out.push({
      kind: 'arc',
      cx: 0,
      cy: 0,
      r: b,
      startAngle: arcStart,
      endAngle: arcEnd,
      layer: 'wheel_outer',
    } satisfies Arc);
  }

  // Each slot is a stadium opened to the wheel rim — built in canonical
  // orientation (along +x), then rotated per slot.
  const halfW = w / 2;
  // b - s == b - (a + b - c) == c - a: radial depth of the slot's inner end.
  const innerCenterX = b - s;
  const lineOuterX = Math.sqrt(b * b - halfW * halfW);
  for (let i = 0; i < n; i++) {
    const slotAngle = (i * 2 * Math.PI) / n;
    const cosA = Math.cos(slotAngle);
    const sinA = Math.sin(slotAngle);
    const rotate = (x: number, ry: number) => ({
      x: x * cosA - ry * sinA,
      y: x * sinA + ry * cosA,
    });
    const a1 = rotate(lineOuterX, +halfW);
    const a2 = rotate(innerCenterX, +halfW);
    const b1 = rotate(lineOuterX, -halfW);
    const b2 = rotate(innerCenterX, -halfW);
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y,
    } satisfies Line);
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: b1.x, y1: b1.y, x2: b2.x, y2: b2.y,
    } satisfies Line);
    // Closed end of the stadium: sweep +90° to +270°.
    out.push({
      kind: 'arc', layer: 'wheel_slots',
      cx: innerCenterX * cosA,
      cy: innerCenterX * sinA,
      r: halfW,
      startAngle: slotAngle + Math.PI / 2,
      endAngle: slotAngle + (3 * Math.PI) / 2,
    } satisfies Arc);
  }

  // Stop-disc cutouts: rotated by half-slot-pitch so they sit between slots.
  const halfPitch = Math.PI / n;
  for (let i = 0; i < n; i++) {
    const angle = halfPitch + (i * 2 * Math.PI) / n;
    out.push({
      kind: 'circle',
      cx: c * Math.cos(angle),
      cy: c * Math.sin(angle),
      r: y,
      layer: 'wheel_stop_cutouts',
    } satisfies Circle);
  }

  return out;
}

/**
 * Builds the 2D profile of the drive crank. Defaults to (c, 0) so wheel
 * and crank ship in assembly position.
 * Layers: crank_outer, crank_pin, crank_stop_disc
 */
export function buildCrankProfile(
  params: GenevaParams,
  offsetX: number = params.c
): Profile {
  const { a, b, p, z, v } = params;
  const out: Profile = [];

  out.push({
    kind: 'circle',
    cx: offsetX,
    cy: 0,
    r: a + p,
    layer: 'crank_outer',
  } satisfies Circle);

  // Pin at the far-side dwell position: π − atan(b/a) places it on the far
  // side of the line of centers, between slots and just clear of the wheel.
  const pinStart = Math.PI - Math.atan(b / a);
  out.push({
    kind: 'circle',
    cx: offsetX + a * Math.cos(pinStart),
    cy: a * Math.sin(pinStart),
    r: p / 2,
    layer: 'crank_pin',
  } satisfies Circle);

  // Stop disc: z-circle at crank center, v-circle clearance cutout at
  // (offsetX - z, +v). +v (not −v) is intentional: the v-circle sits at
  // driver-local (180 − 180/n)° so the cut sweeps through world 180° during
  // engagement, exactly when the wheel rim intrudes into the stop disc most.
  // Mirrors the rationale in Preview.tsx's stop-disc mask. Emitted as Circle
  // primitives (not full-circle arcs) so strict DXF parsers and Fusion accept them.
  out.push({
    kind: 'circle',
    cx: offsetX,
    cy: 0,
    r: z,
    layer: 'crank_stop_disc',
  } satisfies Circle);
  out.push({
    kind: 'circle',
    cx: offsetX - z,
    cy: v,
    r: v,
    layer: 'crank_stop_disc',
  } satisfies Circle);

  return out;
}
