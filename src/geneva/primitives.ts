export interface Circle {
  kind: 'circle';
  cx: number;
  cy: number;
  r: number;
  layer: string;
}

export interface Arc {
  kind: 'arc';
  cx: number;
  cy: number;
  r: number;
  /** Radians, counter-clockwise from +x axis */
  startAngle: number;
  /** Radians, counter-clockwise from +x axis */
  endAngle: number;
  layer: string;
}

export interface Line {
  kind: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  layer: string;
}

export type Primitive = Circle | Arc | Line;
export type Profile = Primitive[];
