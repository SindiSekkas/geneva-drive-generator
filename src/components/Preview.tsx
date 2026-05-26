import { useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { primitiveToSvgEntity, type SvgEntity } from '../geneva/exporters/svg';
import type { Primitive } from '../geneva/primitives';

interface Props {
  params: GenevaParams;
  driveAngleDeg?: number;
  wheelAngleDeg?: number;
  showDimensions?: boolean;
}

/** Layers we *render* in the preview. Auxiliary CAD layers (stop-disc cutouts,
 *  v-clearance arc) are visually noisy — they are kept in the DXF so Fusion can
 *  boolean-subtract them, but hidden here so the preview reads as the real
 *  visible mechanism: wheel rim + slots + crank disc + pin. */
const PREVIEW_LAYERS = new Set([
  'wheel_outer',
  'wheel_slots',
  'crank_outer',
  'crank_pin',
]);

const STROKES: Record<string, string> = {
  wheel_outer: 'stroke-wheel',
  wheel_slots: 'stroke-wheel',
  crank_outer: 'stroke-crank',
  crank_pin: 'stroke-crank',
};

/** The pin is small — filling it makes it pop so the user actually sees the
 *  pin entering each slot. Everything else is hairline-outlined. */
const FILLED_LAYERS = new Set(['crank_pin']);

export function Preview({
  params, driveAngleDeg = 0, wheelAngleDeg = 0, showDimensions = true,
}: Props) {
  const wheel = useMemo(
    () => buildWheelProfile(params).filter((p: Primitive) => PREVIEW_LAYERS.has(p.layer)),
    [params]
  );
  const crank = useMemo(
    () => buildCrankProfile(params, params.c).filter((p: Primitive) => PREVIEW_LAYERS.has(p.layer)),
    [params]
  );

  const bbox = useMemo(() => {
    const pad = 1.25;
    const totalW = (params.c + params.a + params.p + params.b) * pad;
    const totalH = Math.max(params.a, params.b) * 2 * pad;
    return { x: -params.b * pad, y: -totalH / 2, w: totalW, h: totalH };
  }, [params]);

  // Grid spacing in math units — scales with bbox so it never gets too dense.
  const gridUnit = useMemo(() => {
    const ref = Math.max(bbox.w, bbox.h);
    if (ref > 800) return 50;
    if (ref > 200) return 10;
    if (ref > 40) return 5;
    return 1;
  }, [bbox]);

  const renderEntity = (e: SvgEntity, idx: number) => {
    const isFilled = FILLED_LAYERS.has(e.layer);
    const cls = `${isFilled ? 'fill-crank/80' : 'fill-none'} ${STROKES[e.layer] ?? 'stroke-fg-muted'}`;
    const sw = { strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const };
    if (e.tag === 'circle')
      return <circle key={idx} cx={e.cx} cy={e.cy} r={e.r} className={cls} {...sw} />;
    if (e.tag === 'line')
      return <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={cls} {...sw} />;
    return <path key={idx} d={e.d} className={cls} {...sw} />;
  };

  const dimC = showDimensions ? params.c : 0;

  // Pin world-coordinates (for the optional "engagement halo" cue during animation).
  const pinStart = Math.PI - Math.atan(params.b / params.a);
  const pinTheta = pinStart + (driveAngleDeg * Math.PI) / 180;
  const pinX = params.c + params.a * Math.cos(pinTheta);
  const pinY = params.a * Math.sin(pinTheta);
  const pinInWheel = Math.hypot(pinX, pinY) <= params.b;

  return (
    <svg
      viewBox={`${bbox.x} ${bbox.y} ${bbox.w} ${bbox.h}`}
      className="size-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="grid" width={gridUnit} height={gridUnit} patternUnits="userSpaceOnUse">
          <path
            d={`M ${gridUnit} 0 L 0 0 0 ${gridUnit}`}
            className="fill-none stroke-border/50"
            strokeWidth={0.25}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern id="grid-major" width={gridUnit * 5} height={gridUnit * 5} patternUnits="userSpaceOnUse">
          <path
            d={`M ${gridUnit * 5} 0 L 0 0 0 ${gridUnit * 5}`}
            className="fill-none stroke-border-bright/70"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>

      {/* Grid backdrop. */}
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill="url(#grid)" />
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill="url(#grid-major)" />

      {/* Math-space (y-up). */}
      <g transform="scale(1,-1)">
        {/* Crosshairs at part origins. */}
        <g className="stroke-fg-subtle/45" strokeWidth={0.6} vectorEffect="non-scaling-stroke">
          <line x1={-3} y1={0} x2={3} y2={0} />
          <line x1={0} y1={-3} x2={0} y2={3} />
          <line x1={params.c - 3} y1={0} x2={params.c + 3} y2={0} />
          <line x1={params.c} y1={-3} x2={params.c} y2={3} />
        </g>

        {/* Center-distance c indicator (dashed, only when "Dimensions" is on). */}
        {showDimensions && (
          <g
            className="stroke-fg-subtle/50"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 2"
          >
            <line x1={0} y1={0} x2={dimC} y2={0} />
          </g>
        )}

        {/* Faint engagement halo: when pin is inside wheel, show a soft ring so
            the user knows the wheel SHOULD be rotating. */}
        {pinInWheel && (
          <circle
            cx={pinX}
            cy={pinY}
            r={params.p * 1.6}
            className="fill-none stroke-accent/40"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Wheel — rotation tied directly to rAF, no CSS transition so it
            tracks the animation precisely without phantom lag. */}
        <g transform={`rotate(${-wheelAngleDeg} 0 0)`}>
          {wheel.map(primitiveToSvgEntity).map(renderEntity)}
        </g>

        {/* Crank — rotates around (c, 0). */}
        <g transform={`rotate(${-driveAngleDeg} ${params.c} 0)`}>
          {crank.map(primitiveToSvgEntity).map(renderEntity)}
        </g>
      </g>
    </svg>
  );
}
