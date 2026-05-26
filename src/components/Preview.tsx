import { useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { primitiveToSvgEntity, type SvgEntity } from '../geneva/exporters/svg';

interface Props {
  params: GenevaParams;
  driveAngleDeg?: number;
  wheelAngleDeg?: number;
}

const STROKES: Record<string, string> = {
  wheel_outer: 'stroke-wheel',
  wheel_slots: 'stroke-wheel',
  wheel_stop_cutouts: 'stroke-wheel/60',
  crank_outer: 'stroke-crank',
  crank_pin: 'stroke-crank',
  crank_stop_disc: 'stroke-crank/60',
};

export function Preview({ params, driveAngleDeg = 0, wheelAngleDeg = 0 }: Props) {
  const wheel = useMemo(() => buildWheelProfile(params), [params]);
  const crank = useMemo(() => buildCrankProfile(params, params.c), [params]);

  const bbox = useMemo(() => {
    const pad = 1.2;
    const w = (params.c + params.a + params.p + params.b) * pad;
    const h = Math.max(params.a, params.b) * 2 * pad;
    return { x: -params.b * pad, y: -h / 2, w, h };
  }, [params]);

  const renderEntity = (e: SvgEntity, idx: number) => {
    const cls = `fill-none ${STROKES[e.layer] ?? 'stroke-fg-muted'}`;
    const sw = { strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const };
    if (e.tag === 'circle') return <circle key={idx} cx={e.cx} cy={e.cy} r={e.r} className={cls} {...sw} />;
    if (e.tag === 'line') return <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={cls} {...sw} />;
    return <path key={idx} d={e.d} className={cls} {...sw} />;
  };

  return (
    <svg
      viewBox={`${bbox.x} ${bbox.y} ${bbox.w} ${bbox.h}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" className="fill-none stroke-border/40" strokeWidth={0.5} />
        </pattern>
      </defs>
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill="url(#grid)" />
      <g transform="scale(1,-1)">
        <g transform={`rotate(${-wheelAngleDeg} 0 0)`}>
          {wheel.map(primitiveToSvgEntity).map(renderEntity)}
        </g>
        <g transform={`rotate(${-driveAngleDeg} ${params.c} 0)`}>
          {crank.map(primitiveToSvgEntity).map(renderEntity)}
        </g>
      </g>
    </svg>
  );
}
