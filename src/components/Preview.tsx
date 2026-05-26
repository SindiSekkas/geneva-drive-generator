import { useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { primitiveToSvgEntity, type SvgEntity } from '../geneva/exporters/svg';

interface Props {
  params: GenevaParams;
  driveAngleDeg?: number;
  wheelAngleDeg?: number;
  showDimensions?: boolean;
}

const STROKES: Record<string, string> = {
  wheel_outer: 'stroke-wheel',
  wheel_slots: 'stroke-wheel',
  wheel_stop_cutouts: 'stroke-wheel/55',
  crank_outer: 'stroke-crank',
  crank_pin: 'stroke-crank',
  crank_stop_disc: 'stroke-crank/55',
};

export function Preview({
  params, driveAngleDeg = 0, wheelAngleDeg = 0, showDimensions = true,
}: Props) {
  const wheel = useMemo(() => buildWheelProfile(params), [params]);
  const crank = useMemo(() => buildCrankProfile(params, params.c), [params]);

  const bbox = useMemo(() => {
    const pad = 1.25;
    const totalW = (params.c + params.a + params.p + params.b) * pad;
    const totalH = Math.max(params.a, params.b) * 2 * pad;
    return { x: -params.b * pad, y: -totalH / 2, w: totalW, h: totalH };
  }, [params]);

  // Grid spacing in math units — pick something that scales with bbox so the
  // grid never gets too dense or too sparse.
  const gridUnit = useMemo(() => {
    const ref = Math.max(bbox.w, bbox.h);
    if (ref > 800) return 50;
    if (ref > 200) return 10;
    if (ref > 40) return 5;
    return 1;
  }, [bbox]);

  const renderEntity = (e: SvgEntity, idx: number) => {
    const cls = `fill-none ${STROKES[e.layer] ?? 'stroke-fg-muted'}`;
    const sw = { strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const };
    if (e.tag === 'circle')
      return <circle key={idx} cx={e.cx} cy={e.cy} r={e.r} className={cls} {...sw} />;
    if (e.tag === 'line')
      return <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={cls} {...sw} />;
    return <path key={idx} d={e.d} className={cls} {...sw} />;
  };

  // Center-distance "c" dimension line, sketched between the two part origins.
  const dimC = showDimensions ? params.c : 0;

  return (
    <svg
      viewBox={`${bbox.x} ${bbox.y} ${bbox.w} ${bbox.h}`}
      className="size-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id="grid"
          width={gridUnit}
          height={gridUnit}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridUnit} 0 L 0 0 0 ${gridUnit}`}
            className="fill-none stroke-border/50"
            strokeWidth={0.25}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern
          id="grid-major"
          width={gridUnit * 5}
          height={gridUnit * 5}
          patternUnits="userSpaceOnUse"
        >
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

      {/* Math-space group (flip y). */}
      <g transform="scale(1,-1)">
        {/* Crosshairs at part origins for the precision-tool feel. */}
        <g className="stroke-fg-subtle/50" strokeWidth={0.6} vectorEffect="non-scaling-stroke">
          <line x1={-3} y1={0} x2={3} y2={0} />
          <line x1={0} y1={-3} x2={0} y2={3} />
          <line x1={params.c - 3} y1={0} x2={params.c + 3} y2={0} />
          <line x1={params.c} y1={-3} x2={params.c} y2={3} />
        </g>

        {/* Center-distance c indicator. */}
        {showDimensions && (
          <g
            className="stroke-fg-subtle/60"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 2"
          >
            <line x1={0} y1={0} x2={dimC} y2={0} />
          </g>
        )}

        <g
          transform={`rotate(${-wheelAngleDeg} 0 0)`}
          style={{ transition: 'transform 150ms cubic-bezier(0.2,0,0,1)' }}
        >
          {wheel.map(primitiveToSvgEntity).map(renderEntity)}
        </g>
        <g
          transform={`rotate(${-driveAngleDeg} ${params.c} 0)`}
          style={{ transition: 'transform 150ms cubic-bezier(0.2,0,0,1)' }}
        >
          {crank.map(primitiveToSvgEntity).map(renderEntity)}
        </g>
      </g>
    </svg>
  );
}
