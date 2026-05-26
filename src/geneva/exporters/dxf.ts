import type { Profile, Primitive } from '../primitives';

const NL = '\r\n';

function code(group: number, value: string | number): string {
  return `${group}${NL}${value}${NL}`;
}

const LAYER_COLORS: Record<string, number> = {
  wheel_outer: 5,        // blue
  wheel_slots: 3,        // green
  wheel_stop_cutouts: 4, // cyan
  crank_outer: 1,        // red
  crank_pin: 2,          // yellow
  crank_stop_disc: 6,    // magenta
};

function header(): string {
  return [
    code(0, 'SECTION'),
    code(2, 'HEADER'),
    code(9, '$ACADVER'),
    code(1, 'AC1015'),
    code(9, '$INSUNITS'),
    code(70, 4), // 4 = millimeters
    code(0, 'ENDSEC'),
  ].join('');
}

function tables(layers: string[]): string {
  const layerEntries = layers.map((name) =>
    [
      code(0, 'LAYER'),
      code(2, name),
      code(70, 0),
      code(62, LAYER_COLORS[name] ?? 7),
      code(6, 'CONTINUOUS'),
    ].join('')
  );

  return [
    code(0, 'SECTION'),
    code(2, 'TABLES'),
    code(0, 'TABLE'),
    code(2, 'LAYER'),
    code(70, layers.length),
    ...layerEntries,
    code(0, 'ENDTAB'),
    code(0, 'ENDSEC'),
  ].join('');
}

function entity(p: Primitive): string {
  switch (p.kind) {
    case 'circle':
      return [
        code(0, 'CIRCLE'),
        code(8, p.layer),
        code(10, p.cx),
        code(20, p.cy),
        code(40, p.r),
      ].join('');
    case 'line':
      return [
        code(0, 'LINE'),
        code(8, p.layer),
        code(10, p.x1),
        code(20, p.y1),
        code(11, p.x2),
        code(21, p.y2),
      ].join('');
    case 'arc': {
      // DXF wants degrees, CCW, positive direction.
      const startDeg = (p.startAngle * 180) / Math.PI;
      const endDeg = (p.endAngle * 180) / Math.PI;
      return [
        code(0, 'ARC'),
        code(8, p.layer),
        code(10, p.cx),
        code(20, p.cy),
        code(40, p.r),
        code(50, startDeg),
        code(51, endDeg),
      ].join('');
    }
  }
}

function entities(profiles: Profile[]): string {
  const all = profiles.flat();
  return [
    code(0, 'SECTION'),
    code(2, 'ENTITIES'),
    ...all.map(entity),
    code(0, 'ENDSEC'),
  ].join('');
}

export function profilesToDxf(profiles: Profile[]): string {
  const layers = Array.from(
    new Set(profiles.flat().map((p) => p.layer))
  );
  return [header(), tables(layers), entities(profiles), code(0, 'EOF')].join('');
}
