export type RadiusMode = 'a' | 'b';

export interface GenevaInput {
  mode: RadiusMode;
  a?: number;
  b?: number;
  n: number;
  p: number;
  t: number;
}

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

export function deriveParams(input: GenevaInput): GenevaParams {
  const { n, p, t } = input;
  const warnings: string[] = [];
  const halfAngle = Math.PI / n;

  let a: number;
  let b: number;
  let c: number;
  if (input.mode === 'b') {
    b = input.b!;
    c = b / Math.cos(halfAngle);
    a = Math.sqrt(c * c - b * b);
  } else {
    a = input.a!;
    c = a / Math.sin(halfAngle);
    b = Math.sqrt(c * c - a * a);
  }

  const s = a + b - c;
  const w = p + t;
  const y = a - 1.5 * p;
  const z = y - t;
  const v = (b * z) / a;

  return { a, b, n, p, t, c, s, w, y, z, v, warnings };
}
