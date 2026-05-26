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
  const slotHalfAngle = Math.asin(w / 2 / b);

  // 1. Rim: n arcs between slot openings.
  for (let i = 0; i < n; i++) {
    const slotCenter = (i * 2 * Math.PI) / n;
    const arcStart = slotCenter + slotHalfAngle;
    const arcEnd = slotCenter + (2 * Math.PI) / n - slotHalfAngle;
    const arc: Arc = {
      kind: 'arc',
      cx: 0,
      cy: 0,
      r: b,
      startAngle: arcStart,
      endAngle: arcEnd,
      layer: 'wheel_outer',
    };
    out.push(arc);
  }

  // 2. Slots: each is a stadium opened to the wheel rim.
  for (let i = 0; i < n; i++) {
    const slotAngle = (i * 2 * Math.PI) / n;
    // Build the slot in canonical orientation (along +x) then rotate.
    const innerCenterX = b - s; // center of the inner semicircle
    const halfW = w / 2;
    // Two parallel lines from rim opening inward to the semicircle tangent.
    const lineOuterX = Math.sqrt(b * b - halfW * halfW);
    const lineInnerX = innerCenterX;
    const rotate = (x: number, ry: number) => ({
      x: x * Math.cos(slotAngle) - ry * Math.sin(slotAngle),
      y: x * Math.sin(slotAngle) + ry * Math.cos(slotAngle),
    });
    const a1 = rotate(lineOuterX, +halfW);
    const a2 = rotate(lineInnerX, +halfW);
    const b1 = rotate(lineOuterX, -halfW);
    const b2 = rotate(lineInnerX, -halfW);
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
      cx: innerCenterX * Math.cos(slotAngle),
      cy: innerCenterX * Math.sin(slotAngle),
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
    const circle: Circle = {
      kind: 'circle',
      cx: c * Math.cos(angle),
      cy: c * Math.sin(angle),
      r: y,
      layer: 'wheel_stop_cutouts',
    };
    out.push(circle);
  }

  return out;
}
