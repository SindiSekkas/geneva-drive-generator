import type { Primitive } from '../primitives';

/**
 * Convert a Primitive into props for an SVG element. The rendering parent is
 * expected to apply `transform="scale(1, -1)"` so math-coords display y-up.
 */
export type SvgEntity =
  | { tag: 'circle'; cx: number; cy: number; r: number; layer: string }
  | { tag: 'line'; x1: number; y1: number; x2: number; y2: number; layer: string }
  | { tag: 'path'; d: string; layer: string };

export function primitiveToSvgEntity(p: Primitive): SvgEntity {
  switch (p.kind) {
    case 'circle':
      return { tag: 'circle', cx: p.cx, cy: p.cy, r: p.r, layer: p.layer };
    case 'line':
      return {
        tag: 'line',
        x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2,
        layer: p.layer,
      };
    case 'arc': {
      const sx = p.cx + p.r * Math.cos(p.startAngle);
      const sy = p.cy + p.r * Math.sin(p.startAngle);
      const ex = p.cx + p.r * Math.cos(p.endAngle);
      const ey = p.cy + p.r * Math.sin(p.endAngle);
      let sweep = p.endAngle - p.startAngle;
      while (sweep < 0) sweep += 2 * Math.PI;
      const largeArc = sweep > Math.PI ? 1 : 0;
      // sweep-flag = 1: CCW in screen coords (= CCW in math after parent y-flip).
      return {
        tag: 'path',
        d: `M ${sx} ${sy} A ${p.r} ${p.r} 0 ${largeArc} 1 ${ex} ${ey}`,
        layer: p.layer,
      };
    }
  }
}
