import { useId, useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';

interface Props {
  params: GenevaParams;
  driveAngleDeg?: number;
  wheelAngleDeg?: number;
  showDimensions?: boolean;
}

/**
 * Live preview of the Geneva drive. Uses the mask-based approach of the
 * original benbrandt22/genevaGen: each part is a filled shape with cutouts
 * subtracted via an SVG <mask> wrapped in a rotating <g>.
 */
export function Preview({
  params, driveAngleDeg = 0, wheelAngleDeg = 0, showDimensions = true,
}: Props) {
  const { a, b, c, n, p, s, w, y, z, v } = params;
  const uid = useId().replace(/:/g, '');
  const wheelMaskId = `wheel-mask-${uid}`;
  const stopDiscMaskId = `stop-disc-mask-${uid}`;

  const pinStart = Math.PI - Math.atan(b / a);

  const bbox = useMemo(() => {
    const pad = 1.25;
    const totalW = (c + a + p + b) * pad;
    const totalH = Math.max(a, b) * 2 * pad;
    return { x: -b * pad, y: -totalH / 2, w: totalW, h: totalH };
  }, [a, b, c, p]);

  const gridUnit = useMemo(() => {
    const ref = Math.max(bbox.w, bbox.h);
    if (ref > 800) return 50;
    if (ref > 200) return 10;
    if (ref > 40) return 5;
    return 1;
  }, [bbox]);

  const crossSize = Math.max(Math.min(a, b) * 0.06, 0.5);
  const crossStroke = Math.max(Math.min(a, b) * 0.008, 0.1);

  const slotInnerX = b - s - w / 2;
  const slotWidth = s + 2 * w;
  const slotHeight = w;

  const nonScalingStroke = { vectorEffect: 'non-scaling-stroke' as const };

  return (
    <svg
      viewBox={`${bbox.x} ${bbox.y} ${bbox.w} ${bbox.h}`}
      className="size-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`grid-${uid}`} width={gridUnit} height={gridUnit} patternUnits="userSpaceOnUse">
          <path
            d={`M ${gridUnit} 0 L 0 0 0 ${gridUnit}`}
            className="fill-none stroke-border/50"
            strokeWidth={0.25}
            {...nonScalingStroke}
          />
        </pattern>
        <pattern id={`grid-major-${uid}`} width={gridUnit * 5} height={gridUnit * 5} patternUnits="userSpaceOnUse">
          <path
            d={`M ${gridUnit * 5} 0 L 0 0 0 ${gridUnit * 5}`}
            className="fill-none stroke-border-bright/70"
            strokeWidth={0.5}
            {...nonScalingStroke}
          />
        </pattern>

        <mask id={wheelMaskId}>
          <circle cx={0} cy={0} r={b} fill="white" />
          {Array.from({ length: n }).map((_, i) => {
            const angle = (i * 360) / n;
            return (
              <g key={i} transform={`rotate(${angle} 0 0)`}>
                <rect
                  x={slotInnerX}
                  y={-slotHeight / 2}
                  width={slotWidth}
                  height={slotHeight}
                  rx={slotHeight / 2}
                  ry={slotHeight / 2}
                  fill="black"
                />
                <g transform={`rotate(${180 / n} 0 0)`}>
                  <circle cx={c} cy={0} r={y} fill="black" />
                </g>
              </g>
            );
          })}
        </mask>

        {/* V-clearance crescent at driver-local angle (180 − 180/n)°: this is
            the only placement that clears the wheel rim throughout the
            engagement window, since the cut faces the wheel at mid-engagement
            when the rim intrudes most into the stop disc. */}
        <mask id={stopDiscMaskId}>
          <circle cx={c} cy={0} r={z} fill="white" />
          <circle cx={c - z} cy={v} r={v} fill="black" />
        </mask>
      </defs>

      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill={`url(#grid-${uid})`} />
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill={`url(#grid-major-${uid})`} />

      {/* Math-space (y-up). */}
      <g transform="scale(1,-1)">
        <g className="stroke-fg-subtle/40" strokeWidth={crossStroke} {...nonScalingStroke}>
          <line x1={-crossSize} y1={0} x2={crossSize} y2={0} />
          <line x1={0} y1={-crossSize} x2={0} y2={crossSize} />
          <line x1={c - crossSize} y1={0} x2={c + crossSize} y2={0} />
          <line x1={c} y1={-crossSize} x2={c} y2={crossSize} />
        </g>

        {/* Dimension annotations. Text needs an inner `scale(1,-1)` to render
            right-side-up against the outer y-flip. */}
        {showDimensions && (() => {
          const offset = Math.max(a, b) * 0.18;
          const tick = Math.max(a, b) * 0.025;
          const fontSize = Math.max(a, b) * 0.07;
          const cDimY = -b - offset;
          const bDimX = -b - offset;
          const labelClass = 'fill-fg-muted';
          // stroke="none" on each <text> below: the enclosing dim <g> sets a
          // grey stroke for the lines, and SVG <text> inherits stroke from
          // its parent — without this opt-out every glyph gets a halo.
          const labelStyle = {
            fontSize,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
          };
          return (
            <g className="stroke-fg-subtle/70" strokeWidth={0.4} {...nonScalingStroke}>
              {/* c — centre distance. */}
              <line x1={0} y1={cDimY} x2={c} y2={cDimY} />
              <line x1={0} y1={cDimY - tick} x2={0} y2={cDimY + tick} />
              <line x1={c} y1={cDimY - tick} x2={c} y2={cDimY + tick} />
              <line x1={0} y1={-b} x2={0} y2={cDimY + tick} strokeDasharray="1.2 1.2" strokeWidth={0.3} />
              <line x1={c} y1={0} x2={c} y2={cDimY + tick} strokeDasharray="1.2 1.2" strokeWidth={0.3} />
              <g transform={`translate(${c / 2} ${cDimY - tick - fontSize * 0.4}) scale(1,-1)`}>
                <text textAnchor="middle" stroke="none" className={labelClass} style={labelStyle}>
                  c = {c.toFixed(2)}
                </text>
              </g>

              {/* b — wheel radius. */}
              <line x1={bDimX} y1={0} x2={bDimX} y2={b} />
              <line x1={bDimX - tick} y1={0} x2={bDimX + tick} y2={0} />
              <line x1={bDimX - tick} y1={b} x2={bDimX + tick} y2={b} />
              <line x1={-b} y1={0} x2={bDimX + tick} y2={0} strokeDasharray="1.2 1.2" strokeWidth={0.3} />
              <line x1={-b} y1={b} x2={bDimX + tick} y2={b} strokeDasharray="1.2 1.2" strokeWidth={0.3} />
              <g transform={`translate(${bDimX - tick - fontSize * 0.3} ${b / 2}) rotate(-90) scale(1,-1)`}>
                <text textAnchor="middle" stroke="none" className={labelClass} style={labelStyle}>
                  b = {b.toFixed(2)}
                </text>
              </g>

              {/* a — crank radius, drawn as a CAD-style leader at -30°
                  (lower-right) to stay clear of the pin's rest position
                  (upper-left) and the v-cut (lower-left). */}
              {(() => {
                const leaderAngle = -Math.PI / 6;
                const cosL = Math.cos(leaderAngle);
                const sinL = Math.sin(leaderAngle);
                const tipX = c + a * cosL;
                const tipY = a * sinL;
                const labelR = a + offset * 0.9;
                const labelX = c + labelR * cosL;
                const labelY = labelR * sinL;
                const perpX = -sinL;
                const perpY = cosL;
                return (
                  <>
                    <line x1={c} y1={0} x2={tipX} y2={tipY} />
                    <line
                      x1={tipX - perpX * tick}
                      y1={tipY - perpY * tick}
                      x2={tipX + perpX * tick}
                      y2={tipY + perpY * tick}
                    />
                    <line x1={tipX} y1={tipY} x2={labelX} y2={labelY} strokeDasharray="1.2 1.2" strokeWidth={0.3} />
                    <g transform={`translate(${labelX + fontSize * 1.4} ${labelY}) scale(1,-1)`}>
                      <text textAnchor="middle" stroke="none" className={labelClass} style={labelStyle}>
                        a = {a.toFixed(2)}
                      </text>
                    </g>
                  </>
                );
              })()}
            </g>
          );
        })()}

        {/* Wheel rotation sign convention: this <g> lives inside the outer
            `scale(1,-1)`, so a math-frame CCW rotation by θ requires SVG
            `rotate(+θ)`. The outer flip already negates the visual direction
            once; negating here too would spin the wheel backward and decouple
            it from the pin's math position. */}
        <g transform={`rotate(${wheelAngleDeg} 0 0)`}>
          <circle
            cx={0}
            cy={0}
            r={b}
            mask={`url(#${wheelMaskId})`}
            className="fill-wheel/15 stroke-wheel"
            strokeWidth={1}
            {...nonScalingStroke}
          />
        </g>

        {/* Crank: same rotation sign convention as the wheel above. */}
        <g transform={`rotate(${driveAngleDeg} ${c} 0)`}>
          <circle
            cx={c}
            cy={0}
            r={a + p}
            className="fill-crank/8 stroke-crank/85"
            strokeWidth={1}
            {...nonScalingStroke}
          />
          <circle
            cx={c}
            cy={0}
            r={z}
            mask={`url(#${stopDiscMaskId})`}
            className="fill-crank/30 stroke-crank"
            strokeWidth={1}
            {...nonScalingStroke}
          />
          <circle
            cx={c + a * Math.cos(pinStart)}
            cy={a * Math.sin(pinStart)}
            r={p / 2}
            className="fill-accent stroke-accent"
            strokeWidth={1}
            {...nonScalingStroke}
          />
        </g>
      </g>
    </svg>
  );
}
