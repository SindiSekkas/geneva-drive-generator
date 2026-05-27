import type { Profile, Primitive } from '../primitives';

/**
 * Minimal AutoCAD R12 (AC1009) DXF emitter.
 *
 * R12 is the simplest dialect every modern CAD parser (Fusion 360, FreeCAD,
 * LibreCAD, QCAD, OnShape, dxfgrabber, ezdxf) accepts, and it does NOT require
 * entity handles or AcDbEntity subclass markers. Do not declare AC1015 in the
 * header while emitting R12-style entities — that mismatch makes several
 * parsers reject the file or silently drop entities.
 *
 * Number formatting: fixed decimal only — never scientific. Fusion 360 and
 * other importers don't accept 1e-15 in coordinate fields. We snap |v| < 1e-9
 * to 0. 6 decimals = sub-micron precision at typical mm scales.
 */

const NL = '\r\n';

function num(v: number): string {
  if (!Number.isFinite(v)) return '0';
  if (Math.abs(v) < 1e-9) return '0';
  return v.toFixed(6);
}

function code(group: number, value: string | number): string {
  const v = typeof value === 'number' ? num(value) : value;
  return `${group}${NL}${v}${NL}`;
}

// Integer-only group code for flags and color numbers (avoids "0.000000").
function icode(group: number, value: number): string {
  return `${group}${NL}${Math.trunc(value)}${NL}`;
}

const LAYER_COLORS: Record<string, number> = {
  wheel_outer: 5,        // blue
  wheel_slots: 3,        // green
  wheel_stop_cutouts: 4, // cyan
  crank_outer: 1,        // red
  crank_pin: 2,          // yellow
  crank_stop_disc: 6,    // magenta
};

function tables(layers: string[]): string {
  // Declare CONTINUOUS explicitly: R12 treats it as a built-in default, but
  // strict parsers like Fusion 360 warn when a layer references an
  // undeclared linetype.
  const ltype = [
    code(0, 'TABLE'),
    code(2, 'LTYPE'),
    icode(70, 1),
    code(0, 'LTYPE'),
    code(2, 'CONTINUOUS'),
    icode(70, 0),
    code(3, 'Solid line'),
    icode(72, 65),
    icode(73, 0),
    code(40, 0),
    code(0, 'ENDTAB'),
  ].join('');

  const layerEntries = layers
    .map((name) =>
      [
        code(0, 'LAYER'),
        code(2, name),
        icode(70, 0),
        icode(62, LAYER_COLORS[name] ?? 7),
        code(6, 'CONTINUOUS'),
      ].join('')
    )
    .join('');

  const layerTable = [
    code(0, 'TABLE'),
    code(2, 'LAYER'),
    icode(70, layers.length),
    layerEntries,
    code(0, 'ENDTAB'),
  ].join('');

  return [
    code(0, 'SECTION'),
    code(2, 'TABLES'),
    ltype,
    layerTable,
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
        code(30, 0), // Z; R12 importers default to 0 if missing, but be explicit.
        code(40, p.r),
      ].join('');
    case 'line':
      return [
        code(0, 'LINE'),
        code(8, p.layer),
        code(10, p.x1),
        code(20, p.y1),
        code(30, 0),
        code(11, p.x2),
        code(21, p.y2),
        code(31, 0),
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
        code(30, 0),
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
  const layers = Array.from(new Set(profiles.flat().map((p) => p.layer)));
  return [
    code(0, 'SECTION'),
    code(2, 'HEADER'),
    code(9, '$ACADVER'),
    code(1, 'AC1009'),
    code(9, '$INSUNITS'),
    icode(70, 4),
    code(0, 'ENDSEC'),
    tables(layers),
    entities(profiles),
    code(0, 'EOF'),
  ].join('');
}
