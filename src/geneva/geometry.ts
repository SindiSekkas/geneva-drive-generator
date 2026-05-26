import type { GenevaParams } from './params';
import type { Profile, Arc, Circle, Line } from './primitives';

/**
 * Builds the 2D profile of the Geneva wheel centered at (0, 0).
 * Layers: wheel_outer, wheel_slots, wheel_stop_cutouts
 */
export function buildWheelProfile(params: GenevaParams): Profile {
  const { b, c, s, w, y, n } = params;
  const out: Profile = [];

  // Half-angle subtended by the slot opening at the wheel center.
  const slotHalfAngle = Math.asin((w / 2) / b);

  // 1. Rim: n arcs between slot openings.
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

  // 2. Slots: each is a stadium opened to the wheel rim.
  // Loop-invariant geometry: build in canonical orientation (along +x), rotate per slot.
  const halfW = w / 2;
  // b - s == b - (a + b - c) == c - a: radial depth of the slot's inner end.
  const innerCenterX = b - s;
  // x-coordinate of the rim edge where each slot opens.
  const lineOuterX = Math.sqrt(b * b - halfW * halfW);
  for (let i = 0; i < n; i++) {
    const slotAngle = (i * 2 * Math.PI) / n;
    // Cache trig values; each is used 4 times (two rotate calls per side).
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
    // Two parallel lines from rim opening inward to the semicircle tangent.
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y,
    } satisfies Line);
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: b1.x, y1: b1.y, x2: b2.x, y2: b2.y,
    } satisfies Line);
    // Inner semicircle: centered at (innerCenterX, 0), radius halfW,
    // sweeping from +90° to +270° (closed end of the stadium).
    out.push({
      kind: 'arc', layer: 'wheel_slots',
      cx: innerCenterX * cosA,
      cy: innerCenterX * sinA,
      r: halfW,
      startAngle: slotAngle + Math.PI / 2,
      endAngle: slotAngle + (3 * Math.PI) / 2,
    } satisfies Arc);
  }

  // 3. Stop-disc cutout circles: n circles of radius y, centered at distance
  //    c from the wheel center, rotated by half-slot-pitch so they sit
  //    between slots.
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
 * Builds the 2D profile of the drive crank.
 * By default centers it at (c, 0) so wheel and crank ship in assembly position.
 * Layers: crank_outer, crank_pin, crank_stop_disc
 */
export function buildCrankProfile(
  params: GenevaParams,
  offsetX: number = params.c
): Profile {
  const { a, b, p, z, v } = params;
  const out: Profile = [];

  // 1. Outer disc
  out.push({
    kind: 'circle',
    cx: offsetX,
    cy: 0,
    r: a + p,
    layer: 'crank_outer',
  } satisfies Circle);

  // 2. Pin at the far-side dwell position (between slots, pin just clear of wheel).
  //    π − atan(b/a) places the pin on the far side of the line of centers.
  const pinStart = Math.PI - Math.atan(b / a);
  out.push({
    kind: 'circle',
    cx: offsetX + a * Math.cos(pinStart),
    cy: a * Math.sin(pinStart),
    r: p / 2,
    layer: 'crank_pin',
  } satisfies Circle);

  // 3. Stop disc outline: convex z-arc on the crank center +
  //    concave clearance v-arc cut from one side. Matches the SVG mask
  //    in the source repo: white circle radius z at drive center MINUS
  //    black circle radius v centered at (drive.x - z, drive.y - v).
  // For v1 we emit both as full circles (arcs 0..2π); Fusion's region
  // detector handles the boolean.
  out.push({
    kind: 'arc',
    cx: offsetX,
    cy: 0,
    r: z,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    layer: 'crank_stop_disc',
  } satisfies Arc);
  out.push({
    kind: 'arc',
    cx: offsetX - z,
    cy: -v,
    r: v,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    layer: 'crank_stop_disc',
  } satisfies Arc);

  return out;
}
