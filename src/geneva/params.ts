export type RadiusMode = 'a' | 'b';

export type GenevaInput =
  | { mode: 'a'; a: number; n: number; p: number; t: number }
  | { mode: 'b'; b: number; n: number; p: number; t: number };

export interface GenevaParams {
  a: number;
  b: number;
  n: number;
  p: number;
  t: number;
  c: number;
  s: number;
  w: number;
  y: number;
  z: number;
  v: number;
  warnings: string[];
}

/** 1.5× pin radius — Walsh's Handbook of Machining and Metalworking Calculations. */
const STOP_ARC_FACTOR = 1.5;

export function deriveParams(input: GenevaInput): GenevaParams {
  const { n, p, t } = input;
  const warnings: string[] = [];
  if (!Number.isInteger(n) || n < 3) {
    warnings.push('n must be at least 3 (got ' + n + ')');
  }
  if (p <= 0) warnings.push('Pin diameter p must be positive (got ' + p + ')');
  if (t < 0) warnings.push('Clearance t must be non-negative (got ' + t + ')');
  if (input.mode === 'b' && input.b <= 0) {
    warnings.push('Wheel radius b must be positive');
  }
  if (input.mode === 'a' && input.a <= 0) {
    warnings.push('Crank radius a must be positive');
  }
  const halfAngle = Math.PI / n;

  let a: number;
  let b: number;
  let c: number;
  if (input.mode === 'b') {
    b = input.b;
    c = b / Math.cos(halfAngle);
    a = Math.sqrt(c * c - b * b);
  } else {
    a = input.a;
    c = a / Math.sin(halfAngle);
    b = Math.sqrt(c * c - a * a);
  }

  const s = a + b - c;
  const w = p + t;
  const y = a - STOP_ARC_FACTOR * p;
  if (y <= 0) {
    warnings.push(
      'Stop arc radius y is not positive — pin is too large relative to crank radius'
    );
  }
  // When y <= 0, z and v are also nonsensical. Callers MUST check
  // the returned `warnings` array before trusting z/v in geometry output.
  const z = y - t;
  const v = (b * z) / a;

  return { a, b, n, p, t, c, s, w, y, z, v, warnings };
}
