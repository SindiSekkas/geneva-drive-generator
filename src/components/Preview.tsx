import { useId, useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';

interface Props {
  params: GenevaParams;
  driveAngleDeg?: number;
  wheelAngleDeg?: number;
  showDimensions?: boolean;
}

/**
 * Live preview of the Geneva drive.
 *
 * Adopts the mask-based rendering approach of the original benbrandt22/genevaGen
 * tool: each part is drawn as a *filled* shape with its cutouts subtracted via
 * an SVG <mask>. The mask is in <defs> at the SVG root in non-rotated
 * coordinates; the masked element is wrapped in a rotating <g> so the parent
 * transform rotates the mask alongside the part — that's how the slots,
 * stop-disc cutouts, and v-clearance crescent actually appear to rotate with
 * their parent body.
 *
 * Visible elements:
 *   - Geneva wheel (blue, semi-transparent fill) with 6 slot stadiums + 6
 *     between-slot scallops cut out.
 *   - Crank base disc (outer ring, light grey).
 *   - Crank stop disc — the inner cylinder — visible at a slightly higher
 *     opacity, with the v-clearance crescent cut out.
 *   - Pin (filled accent dot).
 *   - Optional centre crosshairs, centre-distance dimension line, and
 *     engagement halo when the pin is inside the wheel.
 */
export function Preview({
  params, driveAngleDeg = 0, wheelAngleDeg = 0, showDimensions = true,
}: Props) {
  const { a, b, c, n, p, s, w, y, z, v } = params;
  const uid = useId().replace(/:/g, '');
  const wheelMaskId = `wheel-mask-${uid}`;
  const stopDiscMaskId = `stop-disc-mask-${uid}`;

  // Pin position in math space (already including drive rotation).
  const pinStart = Math.PI - Math.atan(b / a);
  const pinAngleRad = pinStart + (driveAngleDeg * Math.PI) / 180;
  const pinX = c + a * Math.cos(pinAngleRad);
  const pinY = a * Math.sin(pinAngleRad);
  // Match useAnimation's engagement threshold so the halo lights up exactly
  // when the wheel begins to follow the pin.
  const pinInWheel = Math.hypot(pinX, pinY) <= b - p / 2;

  const bbox = useMemo(() => {
    const pad = 1.25;
    const totalW = (c + a + p + b) * pad;
    const totalH = Math.max(a, b) * 2 * pad;
    return { x: -b * pad, y: -totalH / 2, w: totalW, h: totalH };
  }, [a, b, c, p]);

  // Grid spacing scales with bbox so density stays comfortable at any zoom.
  const gridUnit = useMemo(() => {
    const ref = Math.max(bbox.w, bbox.h);
    if (ref > 800) return 50;
    if (ref > 200) return 10;
    if (ref > 40) return 5;
    return 1;
  }, [bbox]);

  // Crosshair size scales with geometry (3mm fixed was huge on b=11).
  const crossSize = Math.max(Math.min(a, b) * 0.06, 0.5);
  const crossStroke = Math.max(Math.min(a, b) * 0.008, 0.1);

  // Slot rect dimensions — extend beyond rim so the cut opens cleanly to it.
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

        {/* Wheel mask: white wheel disc minus n slot stadiums and n stop-disc cutouts.
            Shapes are in non-rotated coords; the rotating wrapper <g> below makes
            them follow the wheel's rotation. */}
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
                {/* Stop-disc cutout sits at half-pitch (between slots). */}
                <g transform={`rotate(${180 / n} 0 0)`}>
                  <circle cx={c} cy={0} r={y} fill="black" />
                </g>
              </g>
            );
          })}
        </mask>

        {/* Stop-disc mask: white stop disc minus the v-clearance crescent. */}
        <mask id={stopDiscMaskId}>
          <circle cx={c} cy={0} r={z} fill="white" />
          <circle cx={c - z} cy={-v} r={v} fill="black" />
        </mask>
      </defs>

      {/* Grid backdrop. */}
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill={`url(#grid-${uid})`} />
      <rect x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h} fill={`url(#grid-major-${uid})`} />

      {/* Math-space (y-up). */}
      <g transform="scale(1,-1)">
        {/* Crosshairs at part origins. */}
        <g className="stroke-fg-subtle/40" strokeWidth={crossStroke} {...nonScalingStroke}>
          <line x1={-crossSize} y1={0} x2={crossSize} y2={0} />
          <line x1={0} y1={-crossSize} x2={0} y2={crossSize} />
          <line x1={c - crossSize} y1={0} x2={c + crossSize} y2={0} />
          <line x1={c} y1={-crossSize} x2={c} y2={crossSize} />
        </g>

        {/* Centre-distance c indicator. */}
        {showDimensions && (
          <line
            x1={0}
            y1={0}
            x2={c}
            y2={0}
            className="stroke-fg-subtle/40"
            strokeWidth={0.4}
            strokeDasharray="2 2"
            {...nonScalingStroke}
          />
        )}

        {/* GENEVA WHEEL — filled with mask, then a thin outline.
            The rotating wrapper makes the mask rotate with the wheel. */}
        <g transform={`rotate(${-wheelAngleDeg} 0 0)`}>
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

        {/* CRANK — base + stop disc + pin all in one rotating group. */}
        <g transform={`rotate(${-driveAngleDeg} ${c} 0)`}>
          {/* Outer base disc (a + p). */}
          <circle
            cx={c}
            cy={0}
            r={a + p}
            className="fill-crank/8 stroke-crank/85"
            strokeWidth={1}
            {...nonScalingStroke}
          />
          {/* Inner stop disc — the "inner cylinder" — with v-crescent cut. */}
          <circle
            cx={c}
            cy={0}
            r={z}
            mask={`url(#${stopDiscMaskId})`}
            className="fill-crank/30 stroke-crank"
            strokeWidth={1}
            {...nonScalingStroke}
          />
          {/* Pin — solid accent dot, instantly visible. */}
          <circle
            cx={c + a * Math.cos(pinStart)}
            cy={a * Math.sin(pinStart)}
            r={p / 2}
            className="fill-accent stroke-accent"
            strokeWidth={1}
            {...nonScalingStroke}
          />
        </g>

        {/* Engagement halo — drawn outside the rotating crank so the pin's
            world-space position is the one we measured for pinInWheel. */}
        {pinInWheel && (
          <circle
            cx={pinX}
            cy={pinY}
            r={p * 1.6}
            className="fill-none stroke-accent/40"
            strokeWidth={1.2}
            {...nonScalingStroke}
          />
        )}
      </g>
    </svg>
  );
}
