import type { GenevaParams } from './params';
import type { Profile, Arc, Circle } from './primitives';

/**
 * Builds the 2D profile of the Geneva wheel centered at (0, 0).
 * Layers: wheel_outer, wheel_slots, wheel_stop_cutouts
 */
export function buildWheelProfile(params: GenevaParams): Profile {
  const { b, c, w, y, n } = params;
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

  // 2. Slots: skipped until Task 11.

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
