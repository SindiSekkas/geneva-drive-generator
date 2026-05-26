# Geneva Drive Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React+Vite+TypeScript web app that lets users configure a Geneva drive mechanism and download a DXF file ready to import into Fusion 360. Visual polish at "engineering-product" quality. Deploys to GitHub Pages.

**Architecture:** Single-page app. Pure-TS core (math + geometry + DXF + SVG) lives under `src/geneva/` with zero framework deps. React UI consumes it. State lives in a reducer mirrored to URL params. STL button rendered but disabled. Tests cover the entire core via Vitest.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Slider, Input, Button, Tooltip, Switch, Card), Vitest, ESLint, Prettier, GitHub Actions → GitHub Pages.

**Spec:** [docs/superpowers/specs/2026-05-26-geneva-drive-generator-design.md](../specs/2026-05-26-geneva-drive-generator-design.md)

**Placeholder to substitute:** `<owner>` appears in `src/components/Header.tsx`,
`README.md`, and the deployment notes — replace it with the actual GitHub
username/org before pushing.

---

## File Structure (recap, full paths)

```
src/
├── geneva/
│   ├── params.ts                 # math: GenevaInput → GenevaParams
│   ├── primitives.ts             # Primitive type union (Circle | Arc | Line)
│   ├── geometry.ts               # buildWheelProfile, buildCrankProfile
│   └── exporters/
│       ├── dxf.ts                # profilesToDxf(profiles: Profile[]) → string
│       └── svg.ts                # primitiveToSvgProps for React rendering
├── hooks/
│   ├── useGenevaParams.ts        # reducer + state
│   ├── useUrlState.ts            # serializes state to URL
│   └── useAnimation.ts           # rAF loop for drive spin angle
├── lib/
│   ├── cn.ts                     # clsx + tailwind-merge
│   └── download.ts               # trigger blob download
├── components/
│   ├── ParameterPanel.tsx
│   ├── ParameterControl.tsx
│   ├── RadiusModeToggle.tsx
│   ├── DerivedValuesCard.tsx
│   ├── Preview.tsx
│   ├── PreviewControls.tsx
│   ├── ExportBar.tsx
│   └── Header.tsx
├── App.tsx
├── main.tsx
└── index.css
tests/
├── params.test.ts
├── geometry.test.ts
└── dxf.test.ts
```

---

## Phase 1 — Project Scaffolding

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`

- [ ] **Step 1: Scaffold the project**

Run in the repo root (current dir already contains `docs/` and a git repo):

```bash
npm create vite@latest . -- --template react-ts
# answer "Yes" to "Directory not empty, continue?"
```

- [ ] **Step 2: Install base deps**

```bash
npm install
```

- [ ] **Step 3: Verify dev server boots**

```bash
npm run dev
```
Open the printed URL in a browser. You should see the Vite + React starter page. Stop the server (Ctrl-C).

- [ ] **Step 4: Set Vite base path for GH Pages**

Edit `vite.config.ts` to include:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/geneva-drive-generator/',
});
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Install Tailwind CSS v4 + Vite plugin

**Files:**
- Create / modify: `vite.config.ts`, `src/index.css`, `package.json`

- [ ] **Step 1: Install Tailwind v4**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Wire the Vite plugin**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/geneva-drive-generator/',
});
```

- [ ] **Step 3: Replace src/index.css with Tailwind import + theme tokens**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0B0D10;
  --color-bg-elev: #13161A;
  --color-border: #23272E;
  --color-fg: #E6E8EB;
  --color-fg-muted: #8A9099;
  --color-fg-subtle: #5A6068;
  --color-accent: #5B8DEF;
  --color-accent-fg: #FFFFFF;
  --color-warn: #E0B341;
  --color-wheel: #5B8DEF;
  --color-crank: #8A9099;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;

  --radius: 0.5rem;
}

html, body, #root { height: 100%; }
body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Verify Tailwind is applied**

Edit `src/App.tsx` body content to a single `<div className="p-8 text-2xl font-mono text-accent">Geneva Drive Generator</div>`. Run `npm run dev`, confirm accent-blue monospace text shows up. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: install Tailwind v4 with theme tokens"
```

---

### Task 3: Install Vitest

**Files:**
- Create: `vitest.config.ts`, `tests/` directory placeholder

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitest/ui jsdom
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add scripts to package.json**

In `package.json` `scripts`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create a smoke test**

Create `tests/smoke.test.ts`:

```ts
import { test, expect } from 'vitest';

test('vitest is wired', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: install Vitest with a smoke test"
```

---

### Task 4: Install fonts + utility libs

**Files:**
- Modify: `package.json`, `src/index.css`, `src/lib/cn.ts`

- [ ] **Step 1: Install fonts and utilities**

```bash
npm install @fontsource/inter @fontsource/jetbrains-mono clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Import fonts at top of src/index.css**

Prepend to `src/index.css` (BEFORE the `@import "tailwindcss";`):

```css
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";
```

- [ ] **Step 3: Create src/lib/cn.ts**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: install Inter, JetBrains Mono, and cn() utility"
```

---

### Task 5: License, attribution, and third-party licenses

**Files:**
- Create: `LICENSE`, `ATTRIBUTION.md`, `THIRD_PARTY_LICENSES`

- [ ] **Step 1: Write LICENSE (MIT)**

Create `LICENSE`:

```
MIT License

Copyright (c) 2026 Alex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Write ATTRIBUTION.md**

```markdown
# Attribution

The math and geometry approach in this project were ported from:

- **[benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen)** — MIT
  Licensed, © 2014 Ben Brandt. We adapted the `genevaController.js` formulas
  and the SVG geometry construction in `genevaDrawingTmpl.htm` /
  `genevaDrawingController.js`.

- **J. E. Johnson's blog post** *"Make Geneva wheels of any size"* on
  [New Gottland](https://web.archive.org/web/20141016211828/http://newgottland.com/2012/01/08/make-geneva-wheels-of-any-size/),
  which derives the formulas from Ronald A. Walsh's *Handbook of Machining
  and Metalworking Calculations*.

This implementation is a fresh port to TypeScript with a new UI, but stands
on the shoulders of the above work.
```

- [ ] **Step 3: Write THIRD_PARTY_LICENSES**

Run:

```bash
curl -s "https://raw.githubusercontent.com/benbrandt22/genevaGen/gh-pages/LICENSE" > THIRD_PARTY_LICENSES
```

Then prepend a header. Open `THIRD_PARTY_LICENSES` and put this at the very top:

```
================================================================================
benbrandt22/genevaGen
https://github.com/benbrandt22/genevaGen
================================================================================

```

- [ ] **Step 4: Commit**

```bash
git add LICENSE ATTRIBUTION.md THIRD_PARTY_LICENSES
git commit -m "docs: add MIT license, attribution, and third-party licenses"
```

---

## Phase 2 — Core Math (`src/geneva/params.ts`)

### Task 6: GenevaInput / GenevaParams types + skeleton

**Files:**
- Create: `src/geneva/params.ts`, `tests/params.test.ts`

- [ ] **Step 1: Write the failing test (reference values from screenshot)**

Create `tests/params.test.ts`:

```ts
import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';

test('n=6, b=55, p=4, t=0.1 produces the screenshot reference values', () => {
  const out = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  expect(out.a).toBeCloseTo(31.7543, 4);
  expect(out.b).toBe(55);
  expect(out.c).toBeCloseTo(63.5085, 4);
  expect(out.s).toBeCloseTo(23.2457, 4);
  expect(out.w).toBeCloseTo(4.1, 4);
  expect(out.y).toBeCloseTo(25.7543, 4);
  expect(out.z).toBeCloseTo(25.6543, 4);
  expect(out.v).toBeCloseTo(44.4345, 4);
  expect(out.warnings).toEqual([]);
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
npm test
```
Expected: FAIL — `Cannot find module '../src/geneva/params'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/geneva/params.ts`:

```ts
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
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
npm test
```
Expected: 2 passed (smoke + params).

- [ ] **Step 5: Commit**

```bash
git add src/geneva/params.ts tests/params.test.ts
git commit -m "feat(geneva): implement deriveParams with reference value test"
```

---

### Task 7: Mode-`a` parity test + blog-comment reference

**Files:**
- Modify: `tests/params.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `tests/params.test.ts`:

```ts
test('n=4, b=105 produces c ≈ 148.49 (blog comment)', () => {
  const out = deriveParams({ mode: 'b', b: 105, n: 4, p: 1, t: 0.05 });
  expect(out.c).toBeCloseTo(148.49, 2);
});

test('a-mode and b-mode are equivalent for the same geometry', () => {
  const bMode = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const aMode = deriveParams({ mode: 'a', a: bMode.a, n: 6, p: 4, t: 0.1 });
  expect(aMode.b).toBeCloseTo(bMode.b, 6);
  expect(aMode.c).toBeCloseTo(bMode.c, 6);
  expect(aMode.s).toBeCloseTo(bMode.s, 6);
  expect(aMode.y).toBeCloseTo(bMode.y, 6);
});
```

- [ ] **Step 2: Run, confirm they pass**

```bash
npm test
```
Expected: 4 passed (parity + blog comment work because the implementation already handles both modes).

- [ ] **Step 3: Commit**

```bash
git add tests/params.test.ts
git commit -m "test(geneva): assert a/b-mode parity and blog reference"
```

---

### Task 8: Validation warnings

**Files:**
- Modify: `src/geneva/params.ts`, `tests/params.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/params.test.ts`:

```ts
test('n < 3 produces a warning', () => {
  const out = deriveParams({ mode: 'b', b: 55, n: 2, p: 4, t: 0.1 });
  expect(out.warnings.some((w) => /n must be at least 3/i.test(w))).toBe(true);
});

test('pin too large for crank radius (y negative) warns', () => {
  const out = deriveParams({ mode: 'b', b: 10, n: 6, p: 20, t: 0.1 });
  expect(out.warnings.some((w) => /stop arc radius/i.test(w))).toBe(true);
});

test('negative or zero radius input warns', () => {
  const out = deriveParams({ mode: 'b', b: 0, n: 6, p: 4, t: 0.1 });
  expect(out.warnings.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run, confirm they fail**

```bash
npm test
```
Expected: 3 new failures.

- [ ] **Step 3: Add validation to deriveParams**

In `src/geneva/params.ts`, after the line `const warnings: string[] = [];` add:

```ts
if (!Number.isInteger(n) || n < 3) {
  warnings.push('n must be at least 3 (got ' + n + ')');
}
if (p <= 0) warnings.push('Pin diameter p must be positive (got ' + p + ')');
if (t < 0) warnings.push('Clearance t must be non-negative (got ' + t + ')');
if (input.mode === 'b' && (input.b ?? 0) <= 0) {
  warnings.push('Wheel radius b must be positive');
}
if (input.mode === 'a' && (input.a ?? 0) <= 0) {
  warnings.push('Crank radius a must be positive');
}
```

Then after computing `y`, also add:

```ts
if (y <= 0) {
  warnings.push(
    'Stop arc radius y is not positive — pin is too large relative to crank radius'
  );
}
```

- [ ] **Step 4: Run, confirm they pass**

```bash
npm test
```
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geneva): add input validation warnings"
```

---

## Phase 3 — Geometry primitives

### Task 9: Primitive type union

**Files:**
- Create: `src/geneva/primitives.ts`

- [ ] **Step 1: Create the file**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/geneva/primitives.ts
git commit -m "feat(geneva): define Primitive type union"
```

---

### Task 10: Wheel profile — rim arcs

**Files:**
- Create: `src/geneva/geometry.ts`, `tests/geometry.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/geometry.test.ts`:

```ts
import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';
import { buildWheelProfile } from '../src/geneva/geometry';

test('wheel profile has n rim arcs', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const rimArcs = profile.filter((p) => p.layer === 'wheel_outer');
  expect(rimArcs).toHaveLength(6);
  for (const a of rimArcs) expect(a.kind).toBe('arc');
});

test('wheel profile has n stop-disc cutout circles', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const stops = profile.filter((p) => p.layer === 'wheel_stop_cutouts');
  expect(stops).toHaveLength(6);
  for (const s of stops) expect(s.kind).toBe('circle');
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm test
```
Expected: FAIL — `Cannot find module geometry`.

- [ ] **Step 3: Implement rim arcs + stop-disc cutouts**

Create `src/geneva/geometry.ts`:

```ts
import type { GenevaParams } from './params';
import type { Profile, Arc, Circle, Line } from './primitives';

/**
 * Builds the 2D profile of the Geneva wheel centered at (0, 0).
 * Layers: wheel_outer, wheel_slots, wheel_stop_cutouts
 */
export function buildWheelProfile(params: GenevaParams): Profile {
  const { b, c, s, w, y, n } = params;
  const out: Profile = [];

  // Half-angle subtended by the slot opening at the wheel center.
  const slotHalfAngle = Math.asin(w / 2 / b);

  // 1. Rim: n arcs between slot openings.
  for (let i = 0; i < n; i++) {
    const slotCenter = (i * 2 * Math.PI) / n;
    const arcStart = slotCenter + slotHalfAngle;
    const arcEnd = slotCenter + (2 * Math.PI) / n - slotHalfAngle;
    const arc: Arc = {
      kind: 'arc',
      cx: 0,
      cy: 0,
      r: b,
      startAngle: arcStart,
      endAngle: arcEnd,
      layer: 'wheel_outer',
    };
    out.push(arc);
  }

  // 2. Slots: skipped until Task 11.

  // 3. Stop-disc cutout circles: n circles of radius y, centered at distance
  //    c from the wheel center, rotated by half-slot-pitch so they sit
  //    between slots.
  const halfPitch = Math.PI / n;
  for (let i = 0; i < n; i++) {
    const angle = halfPitch + (i * 2 * Math.PI) / n;
    const circle: Circle = {
      kind: 'circle',
      cx: c * Math.cos(angle),
      cy: c * Math.sin(angle),
      r: y,
      layer: 'wheel_stop_cutouts',
    };
    out.push(circle);
  }

  return out;
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm test
```
Expected: both new tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geneva): build wheel rim arcs and stop-disc cutouts"
```

---

### Task 11: Wheel profile — slots

**Files:**
- Modify: `src/geneva/geometry.ts`, `tests/geometry.test.ts`

- [ ] **Step 1: Add failing test**

Append to `tests/geometry.test.ts`:

```ts
test('wheel profile has n slot stadiums (2n lines + n inner arcs)', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildWheelProfile(params);
  const slotLines = profile.filter(
    (p) => p.layer === 'wheel_slots' && p.kind === 'line'
  );
  const slotArcs = profile.filter(
    (p) => p.layer === 'wheel_slots' && p.kind === 'arc'
  );
  expect(slotLines).toHaveLength(12); // 2 per slot
  expect(slotArcs).toHaveLength(6); // 1 per slot
});
```

- [ ] **Step 2: Run, confirm failure**

- [ ] **Step 3: Replace the `// 2. Slots: skipped` block in `geometry.ts` with**

```ts
  // 2. Slots: each is a stadium opened to the wheel rim.
  for (let i = 0; i < n; i++) {
    const slotAngle = (i * 2 * Math.PI) / n;
    // Build the slot in canonical orientation (along +x) then rotate.
    const innerCenterX = b - s; // center of the inner semicircle
    const halfW = w / 2;
    // Two parallel lines from rim opening inward to the semicircle tangent.
    const lineOuterX = Math.sqrt(b * b - halfW * halfW);
    const lineInnerX = innerCenterX;
    const rotate = (x: number, y: number) => ({
      x: x * Math.cos(slotAngle) - y * Math.sin(slotAngle),
      y: x * Math.sin(slotAngle) + y * Math.cos(slotAngle),
    });
    const a1 = rotate(lineOuterX, +halfW);
    const a2 = rotate(lineInnerX, +halfW);
    const b1 = rotate(lineOuterX, -halfW);
    const b2 = rotate(lineInnerX, -halfW);
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y,
    } satisfies Line);
    out.push({
      kind: 'line', layer: 'wheel_slots',
      x1: b1.x, y1: b1.y, x2: b2.x, y2: b2.y,
    } satisfies Line);
    // Inner semicircle: centered at (innerCenterX, 0), radius halfW,
    // sweeping from +90° to +270° (closed end of the stadium).
    out.push({
      kind: 'arc', layer: 'wheel_slots',
      cx: innerCenterX * Math.cos(slotAngle),
      cy: innerCenterX * Math.sin(slotAngle),
      r: halfW,
      startAngle: slotAngle + Math.PI / 2,
      endAngle: slotAngle + (3 * Math.PI) / 2,
    } satisfies Arc);
  }
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geneva): add slot stadiums to wheel profile"
```

---

### Task 12: Crank profile

**Files:**
- Modify: `src/geneva/geometry.ts`, `tests/geometry.test.ts`

- [ ] **Step 1: Add failing test**

Append to `tests/geometry.test.ts`:

```ts
import { buildCrankProfile } from '../src/geneva/geometry';

test('crank profile has outer circle, pin circle, and 2 stop-disc arcs', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildCrankProfile(params);
  const outer = profile.filter((p) => p.layer === 'crank_outer');
  const pin = profile.filter((p) => p.layer === 'crank_pin');
  const stop = profile.filter((p) => p.layer === 'crank_stop_disc');
  expect(outer).toHaveLength(1);
  expect(outer[0].kind).toBe('circle');
  expect(pin).toHaveLength(1);
  expect(pin[0].kind).toBe('circle');
  expect(stop).toHaveLength(2);
  for (const arc of stop) expect(arc.kind).toBe('arc');
});

test('crank profile honors offsetX (defaults to c)', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const profile = buildCrankProfile(params);
  const outer = profile.find((p) => p.layer === 'crank_outer') as
    | { cx: number }
    | undefined;
  expect(outer?.cx).toBeCloseTo(params.c, 6);
});
```

- [ ] **Step 2: Run, confirm failure**

- [ ] **Step 3: Implement buildCrankProfile**

Append to `src/geneva/geometry.ts`:

```ts
/**
 * Builds the 2D profile of the drive crank.
 * By default centers it at (c, 0) so wheel and crank ship in assembly position.
 * Layers: crank_outer, crank_pin, crank_stop_disc
 */
export function buildCrankProfile(
  params: GenevaParams,
  offsetX: number = params.c
): Profile {
  const { a, b, p, z, v } = params;
  const out: Profile = [];

  // 1. Outer disc
  out.push({
    kind: 'circle',
    cx: offsetX,
    cy: 0,
    r: a + p,
    layer: 'crank_outer',
  });

  // 2. Pin (starts at the angle where it would just enter a wheel slot).
  const pinStart = Math.PI - Math.atan(b / a);
  out.push({
    kind: 'circle',
    cx: offsetX + a * Math.cos(pinStart),
    cy: a * Math.sin(pinStart),
    r: p / 2,
    layer: 'crank_pin',
  });

  // 3. Stop disc outline: convex z-arc on the crank center +
  //    concave clearance v-arc cut from one side. Matches the SVG mask
  //    in the source repo: white circle radius z at drive center MINUS
  //    black circle radius v centered at (drive.x - z, drive.y - v).
  // For the v1 we emit the two full circles as arcs spanning 0..2π;
  // Fusion's region detector handles the boolean. (Computing the exact
  // intersection arcs is possible but adds complexity for no visual gain
  // in the imported sketch.)
  out.push({
    kind: 'arc',
    cx: offsetX,
    cy: 0,
    r: z,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    layer: 'crank_stop_disc',
  });
  out.push({
    kind: 'arc',
    cx: offsetX - z,
    cy: -v,
    r: v,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    layer: 'crank_stop_disc',
  });

  return out;
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geneva): build crank profile (outer, pin, stop disc)"
```

---

### Task 13: Geometry sanity test (finite coords)

**Files:**
- Modify: `tests/geometry.test.ts`

- [ ] **Step 1: Add failing test**

Append:

```ts
import type { Primitive } from '../src/geneva/primitives';

function allCoords(p: Primitive): number[] {
  if (p.kind === 'line') return [p.x1, p.y1, p.x2, p.y2];
  if (p.kind === 'arc') return [p.cx, p.cy, p.r, p.startAngle, p.endAngle];
  return [p.cx, p.cy, p.r];
}

test('every primitive in both profiles has finite coordinates', () => {
  const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
  const all = [...buildWheelProfile(params), ...buildCrankProfile(params)];
  for (const prim of all) {
    for (const v of allCoords(prim)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  }
});
```

- [ ] **Step 2: Run, confirm pass** (should pass immediately if math is correct)

- [ ] **Step 3: Commit**

```bash
git add tests/geometry.test.ts
git commit -m "test(geneva): assert all primitive coords are finite"
```

---

## Phase 4 — DXF Exporter

### Task 14: profilesToDxf skeleton + LAYER table

**Files:**
- Create: `src/geneva/exporters/dxf.ts`, `tests/dxf.test.ts`

- [ ] **Step 1: Failing test**

Create `tests/dxf.test.ts`:

```ts
import { test, expect } from 'vitest';
import { deriveParams } from '../src/geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../src/geneva/geometry';
import { profilesToDxf } from '../src/geneva/exporters/dxf';

const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
const dxf = () => profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);

test('DXF starts with SECTION and ends with EOF', () => {
  const s = dxf();
  expect(s).toMatch(/^0\r?\nSECTION/);
  expect(s.trimEnd()).toMatch(/EOF$/);
});

test('DXF contains a LAYER table with every layer used', () => {
  const s = dxf();
  for (const layer of [
    'wheel_outer', 'wheel_slots', 'wheel_stop_cutouts',
    'crank_outer', 'crank_pin', 'crank_stop_disc',
  ]) {
    expect(s).toContain(layer);
  }
  expect(s).toContain('LAYER');
});

test('DXF declares millimeter units ($INSUNITS 4)', () => {
  expect(dxf()).toMatch(/\$INSUNITS[\r\n]+\s*70[\r\n]+\s*4/);
});
```

- [ ] **Step 2: Run, confirm fail**

- [ ] **Step 3: Implement**

Create `src/geneva/exporters/dxf.ts`:

```ts
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
    code(1, 'AC1009'),
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
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geneva): DXF exporter (CIRCLE/ARC/LINE, layered, mm)"
```

---

### Task 15: Entity-count integration test

**Files:**
- Modify: `tests/dxf.test.ts`

- [ ] **Step 1: Add failing test**

Append:

```ts
test('DXF contains the expected entity counts', () => {
  const s = dxf();
  const circles = (s.match(/^CIRCLE$/gm) ?? []).length;
  const arcs = (s.match(/^ARC$/gm) ?? []).length;
  const lines = (s.match(/^LINE$/gm) ?? []).length;
  // Wheel: 6 rim arcs + 12 slot lines + 6 slot inner arcs + 6 stop cutout circles
  // Crank: 1 outer circle + 1 pin circle + 2 stop-disc arcs
  expect(circles).toBe(6 + 2); // wheel cutouts + crank outer + pin
  expect(arcs).toBe(6 + 6 + 2); // wheel rim + slot inners + crank stop disc
  expect(lines).toBe(12);
});
```

- [ ] **Step 2: Run, confirm pass** (counts derived from earlier tasks)

- [ ] **Step 3: Commit**

```bash
git add tests/dxf.test.ts
git commit -m "test(dxf): assert entity counts match expected geometry"
```

---

### Task 16: Manual Fusion 360 verification (no code)

**Files:** none

- [ ] **Step 1: Generate a sample DXF**

Add a temporary script `scripts/sample-dxf.mjs`:

```js
import { writeFileSync } from 'node:fs';
import { deriveParams } from '../src/geneva/params.ts';
import { buildWheelProfile, buildCrankProfile } from '../src/geneva/geometry.ts';
import { profilesToDxf } from '../src/geneva/exporters/dxf.ts';

const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
const dxf = profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);
writeFileSync('sample.dxf', dxf);
console.log('Wrote sample.dxf');
```

Run with:

```bash
npx tsx scripts/sample-dxf.mjs
```

If `tsx` complains, install it first: `npm i -D tsx`.

- [ ] **Step 2: Verify in Fusion 360**

Open `sample.dxf` in Fusion 360 (Insert → Insert DXF, or File → Open). Confirm:
- Both parts are present, on separate layers.
- The wheel has 6 slots and 6 stop-disc cutouts, positioned correctly.
- The crank has a pin and a stop disc cutout.
- Center distance between the two parts looks correct.

If anything is wrong (typically: arcs going the wrong direction, or layers missing), debug before proceeding. The most common DXF gotcha is arc winding — DXF arcs are always CCW; if a slot's inner arc looks inverted, swap `startAngle` and `endAngle`.

- [ ] **Step 3: Remove the temporary file**

```bash
rm sample.dxf
git add scripts/sample-dxf.mjs
git commit -m "chore(scripts): add manual DXF sample generator"
```

(Keep the script — it's useful for future debugging.)

---

## Phase 5 — SVG exporter

### Task 17: primitiveToSvgProps

**Files:**
- Create: `src/geneva/exporters/svg.ts`

- [ ] **Step 1: Implement (no test — visual review later)**

```ts
import type { Primitive } from '../primitives';

/**
 * Convert a Primitive into the props/string needed by an SVG element.
 * Returns a discriminated union so callers can switch on `tag`.
 */
export type SvgEntity =
  | { tag: 'circle'; cx: number; cy: number; r: number; layer: string }
  | { tag: 'line'; x1: number; y1: number; x2: number; y2: number; layer: string }
  | { tag: 'path'; d: string; layer: string };

export function primitiveToSvgEntity(p: Primitive): SvgEntity {
  switch (p.kind) {
    case 'circle':
      return { tag: 'circle', cx: p.cx, cy: p.cy, r: p.r, layer: p.layer };
    case 'line':
      return {
        tag: 'line',
        x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2,
        layer: p.layer,
      };
    case 'arc': {
      // SVG path A command. Note: SVG y is flipped vs. our math y.
      // We'll handle the y-flip at the SVG <g transform> level, so emit
      // angles as if in math coordinates.
      const sx = p.cx + p.r * Math.cos(p.startAngle);
      const sy = p.cy + p.r * Math.sin(p.startAngle);
      const ex = p.cx + p.r * Math.cos(p.endAngle);
      const ey = p.cy + p.r * Math.sin(p.endAngle);
      let sweep = p.endAngle - p.startAngle;
      while (sweep < 0) sweep += 2 * Math.PI;
      const largeArc = sweep > Math.PI ? 1 : 0;
      // SVG sweep-flag: 1 = CCW in screen coords (which is CW in math
      // coords because we flip y in the parent). We want CCW in math,
      // so emit sweep-flag = 1.
      return {
        tag: 'path',
        d: `M ${sx} ${sy} A ${p.r} ${p.r} 0 ${largeArc} 1 ${ex} ${ey}`,
        layer: p.layer,
      };
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/geneva/exporters/svg.ts
git commit -m "feat(geneva): SVG primitive converter"
```

---

## Phase 6 — React app foundations

### Task 18: useGenevaParams reducer hook

**Files:**
- Create: `src/hooks/useGenevaParams.ts`

- [ ] **Step 1: Create file**

```ts
import { useReducer, useMemo } from 'react';
import { deriveParams } from '../geneva/params';
import type { GenevaInput, GenevaParams, RadiusMode } from '../geneva/params';

export interface UiState {
  input: GenevaInput;
  showDimensions: boolean;
  animate: boolean;
}

export const DEFAULT_STATE: UiState = {
  input: { mode: 'b', b: 55, n: 6, p: 4, t: 0.1 },
  showDimensions: true,
  animate: false,
};

export type Action =
  | { type: 'setN'; value: number }
  | { type: 'setRadius'; value: number }
  | { type: 'setP'; value: number }
  | { type: 'setT'; value: number }
  | { type: 'setMode'; value: RadiusMode }
  | { type: 'toggleAnimate' }
  | { type: 'toggleDimensions' }
  | { type: 'replaceAll'; state: UiState };

export function reducer(state: UiState, action: Action): UiState {
  switch (action.type) {
    case 'setN':
      return { ...state, input: { ...state.input, n: action.value } };
    case 'setRadius':
      return {
        ...state,
        input: {
          ...state.input,
          [state.input.mode]: action.value,
        } as GenevaInput,
      };
    case 'setP':
      return { ...state, input: { ...state.input, p: action.value } };
    case 'setT':
      return { ...state, input: { ...state.input, t: action.value } };
    case 'setMode': {
      // Carry the currently-derived value across so geometry doesn't snap.
      const derived = deriveParams(state.input);
      const next: GenevaInput =
        action.value === 'a'
          ? { mode: 'a', a: derived.a, n: state.input.n, p: state.input.p, t: state.input.t }
          : { mode: 'b', b: derived.b, n: state.input.n, p: state.input.p, t: state.input.t };
      return { ...state, input: next };
    }
    case 'toggleAnimate':
      return { ...state, animate: !state.animate };
    case 'toggleDimensions':
      return { ...state, showDimensions: !state.showDimensions };
    case 'replaceAll':
      return action.state;
  }
}

export function useGenevaParams() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const params: GenevaParams = useMemo(
    () => deriveParams(state.input),
    [state.input]
  );
  return { state, dispatch, params };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useGenevaParams.ts
git commit -m "feat(hooks): useGenevaParams reducer"
```

---

### Task 19: useUrlState

**Files:**
- Create: `src/hooks/useUrlState.ts`

- [ ] **Step 1: Create file**

```ts
import { useEffect } from 'react';
import type { UiState } from './useGenevaParams';
import type { GenevaInput } from '../geneva/params';

function serialize(state: UiState): string {
  const { input } = state;
  const radiusValue = input.mode === 'b' ? input.b! : input.a!;
  const parts = new URLSearchParams();
  parts.set('mode', input.mode);
  parts.set('n', String(input.n));
  parts.set(input.mode, String(radiusValue));
  parts.set('p', String(input.p));
  parts.set('t', String(input.t));
  if (state.showDimensions) parts.set('dims', '1');
  if (state.animate) parts.set('anim', '1');
  return parts.toString();
}

export function parseUrl(search: string): Partial<UiState> | null {
  const q = new URLSearchParams(search);
  const mode = q.get('mode');
  if (mode !== 'a' && mode !== 'b') return null;
  const n = Number(q.get('n'));
  const radius = Number(q.get(mode));
  const p = Number(q.get('p'));
  const t = Number(q.get('t'));
  if (![n, radius, p, t].every(Number.isFinite)) return null;
  const input: GenevaInput = mode === 'b'
    ? { mode, b: radius, n, p, t }
    : { mode, a: radius, n, p, t };
  return {
    input,
    showDimensions: q.get('dims') === '1',
    animate: q.get('anim') === '1',
  };
}

/** Debounce-mirror state into the URL query string. Loading from URL is
 *  handled in App.tsx so this hook stays one-directional. */
export function useUrlState(state: UiState): void {
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = '?' + serialize(state);
      window.history.replaceState(null, '', url);
    }, 200);
    return () => clearTimeout(id);
  }, [state]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useUrlState.ts
git commit -m "feat(hooks): useUrlState for shareable permalinks"
```

---

### Task 20: download utility

**Files:**
- Create: `src/lib/download.ts`

- [ ] **Step 1: Create file**

```ts
export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Free the blob soon — Safari needs a small delay.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/download.ts
git commit -m "feat(lib): downloadText helper"
```

---

## Phase 7 — UI Components (use frontend-design skill)

> **IMPORTANT:** Before starting Phase 7, the executing agent MUST invoke
> `frontend-design:frontend-design` so the visual output has real character,
> not stock shadcn. The structural code below provides the skeleton and the
> design tokens — `frontend-design` is responsible for the look.

### Task 21: Header

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight text-fg">
            Geneva Drive Generator
          </span>
          <span className="font-mono text-xs text-fg-subtle">v0.1</span>
        </div>
        <a
          href="https://github.com/<owner>/geneva-drive-generator"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          <Github className="size-4" />
          <span>Source</span>
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

Replace `src/App.tsx`:

```tsx
import { Header } from './components/Header';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-8" />
    </div>
  );
}
```

- [ ] **Step 3: Visually verify**

`npm run dev`. Header visible, dark bg, accent unused yet, mono "v0.1" badge. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): header component"
```

---

### Task 22: ParameterControl (linked slider + input)

**Files:**
- Create: `src/components/ParameterControl.tsx`

- [ ] **Step 1: Implement**

```tsx
import { cn } from '../lib/cn';

interface Props {
  label: string;
  symbol: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  precision?: number;
}

export function ParameterControl({
  label, symbol, value, onChange, min, max, step, unit = 'mm', precision = 2,
}: Props) {
  const display = Number.isInteger(step) ? value.toString() : value.toFixed(precision);
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base text-fg">{symbol}</span>
          <span className="text-sm text-fg-muted">{label}</span>
        </div>
        <span className="font-mono text-xs text-fg-subtle">{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'flex-1 h-1.5 appearance-none rounded-full bg-border accent-accent',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:size-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-accent',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110'
          )}
        />
        <input
          type="number"
          min={min} max={max} step={step}
          value={display}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-20 rounded-md border border-border bg-bg-elev px-2 py-1',
            'font-mono text-sm tabular-nums text-fg',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
          )}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ParameterControl.tsx
git commit -m "feat(ui): ParameterControl (slider + numeric input)"
```

---

### Task 23: RadiusModeToggle

**Files:**
- Create: `src/components/RadiusModeToggle.tsx`

- [ ] **Step 1: Implement**

```tsx
import { cn } from '../lib/cn';
import type { RadiusMode } from '../geneva/params';

interface Props {
  mode: RadiusMode;
  onChange: (m: RadiusMode) => void;
}

export function RadiusModeToggle({ mode, onChange }: Props) {
  const Btn = ({ value, label }: { value: RadiusMode; label: string }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={mode === value}
      className={cn(
        'flex-1 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wide',
        'transition-colors',
        mode === value
          ? 'bg-accent text-accent-fg'
          : 'text-fg-muted hover:text-fg'
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1 rounded-md border border-border bg-bg-elev p-1">
      <Btn value="a" label="a · crank radius" />
      <Btn value="b" label="b · wheel radius" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RadiusModeToggle.tsx
git commit -m "feat(ui): RadiusModeToggle segmented control"
```

---

### Task 24: ParameterPanel

**Files:**
- Create: `src/components/ParameterPanel.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { Action, UiState } from '../hooks/useGenevaParams';
import { ParameterControl } from './ParameterControl';
import { RadiusModeToggle } from './RadiusModeToggle';

interface Props {
  state: UiState;
  derivedA: number;
  derivedB: number;
  dispatch: React.Dispatch<Action>;
}

export function ParameterPanel({ state, derivedA, derivedB, dispatch }: Props) {
  const { input } = state;
  const radiusValue = input.mode === 'b' ? (input.b ?? derivedB) : (input.a ?? derivedA);
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-elev p-6">
      <h2 className="text-xs uppercase tracking-widest text-fg-subtle">Parameters</h2>
      <RadiusModeToggle
        mode={input.mode}
        onChange={(m) => dispatch({ type: 'setMode', value: m })}
      />
      <ParameterControl
        label={input.mode === 'b' ? 'Geneva wheel radius' : 'Drive crank radius'}
        symbol={input.mode}
        value={radiusValue}
        onChange={(v) => dispatch({ type: 'setRadius', value: v })}
        min={1} max={500} step={0.1} precision={2}
      />
      <ParameterControl
        label="number of positions"
        symbol="n"
        value={input.n}
        onChange={(v) => dispatch({ type: 'setN', value: Math.round(v) })}
        min={3} max={24} step={1} unit=""
      />
      <ParameterControl
        label="pin diameter"
        symbol="p"
        value={input.p}
        onChange={(v) => dispatch({ type: 'setP', value: v })}
        min={0.1} max={50} step={0.1} precision={2}
      />
      <ParameterControl
        label="allowed clearance"
        symbol="t"
        value={input.t}
        onChange={(v) => dispatch({ type: 'setT', value: v })}
        min={0} max={5} step={0.01} precision={3}
      />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ParameterPanel.tsx
git commit -m "feat(ui): ParameterPanel"
```

---

### Task 25: DerivedValuesCard

**Files:**
- Create: `src/components/DerivedValuesCard.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { GenevaParams } from '../geneva/params';

const ROWS: ReadonlyArray<{ key: keyof GenevaParams; label: string; formula: string }> = [
  { key: 'c', label: 'center distance', formula: 'c = b / cos(π/n)' },
  { key: 's', label: 'slot center length', formula: 's = a + b − c' },
  { key: 'w', label: 'slot width', formula: 'w = p + t' },
  { key: 'y', label: 'stop arc radius', formula: 'y = a − 1.5p' },
  { key: 'z', label: 'stop disc radius', formula: 'z = y − t' },
  { key: 'v', label: 'clearance arc', formula: 'v = b·z / a' },
];

export function DerivedValuesCard({ params }: { params: GenevaParams }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-elev p-6">
      <h2 className="text-xs uppercase tracking-widest text-fg-subtle">Derived</h2>
      <div className="flex flex-col divide-y divide-border">
        {ROWS.map(({ key, label, formula }) => {
          const value = params[key] as number;
          return (
            <div key={key} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-2">
              <span className="font-mono text-base text-fg">{key}</span>
              <span className="text-sm text-fg-muted">{label}</span>
              <span className="font-mono text-sm tabular-nums text-fg">
                {value.toFixed(4)}
                <span className="ml-1 text-fg-subtle">mm</span>
              </span>
              <span className="col-span-3 font-mono text-xs text-fg-subtle">{formula}</span>
            </div>
          );
        })}
      </div>
      {params.warnings.length > 0 && (
        <div className="rounded-md border border-warn/40 bg-warn/10 p-3">
          {params.warnings.map((w, i) => (
            <div key={i} className="text-xs text-warn">{w}</div>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DerivedValuesCard.tsx
git commit -m "feat(ui): DerivedValuesCard"
```

---

### Task 26: Preview SVG

**Files:**
- Create: `src/components/Preview.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useMemo } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { primitiveToSvgEntity } from '../geneva/exporters/svg';

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

  const renderEntity = (e: ReturnType<typeof primitiveToSvgEntity>, idx: number) => {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Preview.tsx
git commit -m "feat(ui): Preview SVG"
```

---

### Task 27: PreviewControls (animate + dimensions toggles)

**Files:**
- Create: `src/components/PreviewControls.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { Action, UiState } from '../hooks/useGenevaParams';

interface Props {
  state: UiState;
  dispatch: React.Dispatch<Action>;
}

const Toggle = ({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors
      ${on ? 'border-accent bg-accent/10 text-accent' : 'border-border text-fg-muted hover:text-fg'}`}
  >
    <span className={`size-2 rounded-full ${on ? 'bg-accent' : 'bg-fg-subtle'}`} />
    {label}
  </button>
);

export function PreviewControls({ state, dispatch }: Props) {
  return (
    <div className="flex gap-2">
      <Toggle
        label="Animate"
        on={state.animate}
        onClick={() => dispatch({ type: 'toggleAnimate' })}
      />
      <Toggle
        label="Dimensions"
        on={state.showDimensions}
        onClick={() => dispatch({ type: 'toggleDimensions' })}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PreviewControls.tsx
git commit -m "feat(ui): PreviewControls"
```

---

### Task 28: ExportBar (DXF active, STL disabled)

**Files:**
- Create: `src/components/ExportBar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Download, Info } from 'lucide-react';
import { useState } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { profilesToDxf } from '../geneva/exporters/dxf';
import { downloadText } from '../lib/download';

export function ExportBar({ params }: { params: GenevaParams }) {
  const handleDxf = () => {
    const dxf = profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);
    downloadText('geneva-drive.dxf', dxf, 'application/dxf');
  };

  const [tip, setTip] = useState(false);
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elev p-6">
      <h2 className="text-xs uppercase tracking-widest text-fg-subtle">Export</h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDxf}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg
            shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Download className="size-4" />
          Export DXF
        </button>
        <div
          className="relative"
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          <button
            type="button"
            aria-disabled
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-bg
              px-4 py-2 text-sm text-fg-muted opacity-40"
          >
            <Download className="size-4" />
            Export STL
            <Info className="size-3.5 ml-1" />
          </button>
          {tip && (
            <div
              role="tooltip"
              className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-md border border-border bg-bg-elev
                px-3 py-1.5 text-xs text-fg-muted shadow-lg whitespace-nowrap"
            >
              STL export — coming soon
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ExportBar.tsx
git commit -m "feat(ui): ExportBar with active DXF + disabled STL button"
```

---

### Task 29: Wire everything into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx**

```tsx
import { useEffect } from 'react';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { DerivedValuesCard } from './components/DerivedValuesCard';
import { Preview } from './components/Preview';
import { PreviewControls } from './components/PreviewControls';
import { ExportBar } from './components/ExportBar';
import { useGenevaParams } from './hooks/useGenevaParams';
import { useUrlState, parseUrl } from './hooks/useUrlState';

export default function App() {
  const { state, dispatch, params } = useGenevaParams();

  useEffect(() => {
    const fromUrl = parseUrl(window.location.search);
    if (fromUrl?.input) {
      dispatch({
        type: 'replaceAll',
        state: { ...state, ...fromUrl } as typeof state,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUrlState(state);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-6">
          <ParameterPanel
            state={state}
            derivedA={params.a}
            derivedB={params.b}
            dispatch={dispatch}
          />
          <DerivedValuesCard params={params} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] w-full rounded-xl border border-border bg-bg-elev">
            <Preview params={params} />
          </div>
          <PreviewControls state={state} dispatch={dispatch} />
          <ExportBar params={params} />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Manual verify**

`npm run dev`. You should now see the full app:
- Parameter sliders work
- Preview redraws as you drag
- Derived values update live
- "Export DXF" downloads a file
- "Export STL" is faded and shows a tooltip on hover
- URL updates with `?mode=b&n=6...` as you change params; reloading restores them

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): wire everything together"
```

---

### Task 30: Invoke frontend-design skill for visual polish

**Files:** Various component files.

- [ ] **Step 1: Invoke the skill**

Use the Skill tool: `frontend-design:frontend-design`. Brief it with:

> "Polish the visual design of a Geneva drive generator web app. Tech-product, engineering aesthetic — see Linear, Vercel, Cabin. NOT a generic shadcn dashboard. Tokens are already in `src/index.css` (@theme): dark bg `#0B0D10`, accent `#5B8DEF`, Inter + JetBrains Mono. Constraints: design tokens fixed; layout fixed (two-column on desktop); don't add new components. Focus on micro-details: hover/focus states, transitions ≤200ms ease-out, slider styling, tooltip presentation, derived-value crossfade on change, header polish, preview grid color, button physicality. Read the spec at `docs/superpowers/specs/2026-05-26-geneva-drive-generator-design.md` §10 for the non-negotiables."

- [ ] **Step 2: Apply the skill's suggestions to components**

- [ ] **Step 3: Visually verify**

Run `npm run dev`. Compare against the spec §10 checklist:
- Inter for UI, JetBrains Mono for numbers ✓
- Focus rings in accent color ✓
- Slider thumb scales on hover ✓
- Buttons have inset top highlight ✓
- Preview strokes hairline + non-scaling-stroke ✓
- Disabled STL: 40% opacity, no hover-lift, tooltip with 100ms delay ✓
- Derived values use `tabular-nums` and crossfade on change ✓
- Color contrast passes WCAG AA on body text ✓

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "polish(ui): visual design pass via frontend-design skill"
```

---

## Phase 8 — Animation

### Task 31: useAnimation hook

**Files:**
- Create: `src/hooks/useAnimation.ts`

- [ ] **Step 1: Implement**

```ts
import { useEffect, useRef, useState } from 'react';
import type { GenevaParams } from '../geneva/params';

/**
 * Returns `{driveAngleDeg, wheelAngleDeg}` updated each frame.
 * Replicates the genevaDrawingController.js logic:
 *  - Drive spins at ~60°/sec when enabled.
 *  - Wheel angle = atan2(pin.y, pin.x − wheelX) when pin is inside the wheel,
 *    else snaps to the halfway-between-slots locked position.
 */
export function useAnimation(params: GenevaParams, enabled: boolean) {
  const [driveAngleDeg, setDriveAngleDeg] = useState(0);
  const [wheelAngleDeg, setWheelAngleDeg] = useState(180 / params.n);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = (t: number) => {
      const dt = lastRef.current === 0 ? 0 : (t - lastRef.current) / 1000;
      lastRef.current = t;
      setDriveAngleDeg((prev) => (prev + 60 * dt) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastRef.current = 0;
    };
  }, [enabled]);

  useEffect(() => {
    const pinStart = Math.PI - Math.atan(params.b / params.a);
    const pinAngle = pinStart + (driveAngleDeg * Math.PI) / 180;
    const pinX = params.c + params.a * Math.cos(pinAngle);
    const pinY = params.a * Math.sin(pinAngle);
    const dist = Math.hypot(pinX, pinY);
    if (dist <= params.b) {
      setWheelAngleDeg((Math.atan2(pinY, pinX) * 180) / Math.PI);
    } else {
      setWheelAngleDeg(180 / params.n);
    }
  }, [driveAngleDeg, params]);

  return { driveAngleDeg, wheelAngleDeg };
}
```

- [ ] **Step 2: Use it in App.tsx**

In `src/App.tsx`, add at top:

```tsx
import { useAnimation } from './hooks/useAnimation';
```

Inside the `App` component, after `useGenevaParams`:

```tsx
const { driveAngleDeg, wheelAngleDeg } = useAnimation(params, state.animate);
```

Pass to Preview:

```tsx
<Preview params={params} driveAngleDeg={driveAngleDeg} wheelAngleDeg={wheelAngleDeg} />
```

- [ ] **Step 3: Manual verify**

`npm run dev` → toggle "Animate" → drive spins smoothly, wheel snaps between locked positions and rotates when the pin is engaged. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): drive + wheel animation"
```

---

## Phase 9 — Deploy to GitHub Pages

### Task 32: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages deploy workflow"
```

- [ ] **Step 3: Note for user**

After the first push, the user must:
1. Push to a GitHub repo named `geneva-drive-generator`.
2. Settings → Pages → Source: "GitHub Actions".
3. The workflow runs and the site appears at `https://<owner>.github.io/geneva-drive-generator/`.

---

### Task 33: README

**Files:**
- Create / replace: `README.md`

- [ ] **Step 1: Write README**

```markdown
# Geneva Drive Generator

A browser-based parametric generator for Geneva drive mechanisms. Dial in your
parameters, see a live preview, and export a DXF ready to import into Fusion
360 (or any CAD program).

🔗 **[Live site](https://<owner>.github.io/geneva-drive-generator/)**

## What is a Geneva drive?

A mechanism that converts continuous rotation into intermittent stepped
rotation. Used in film projectors, indexing tables, and watch escapements.
This tool generates the 2D profiles of both parts (the driven Geneva wheel
and the driver crank), positioned at their working center distance, on
separate layers in a single DXF.

## Parameters

- `n` — number of positions (≥ 3)
- `a` *or* `b` — drive crank radius *or* Geneva wheel radius (pick which one to drive)
- `p` — pin diameter
- `t` — allowed clearance

All other dimensions (`c`, `s`, `w`, `y`, `z`, `v`) are derived. The math
comes from Ronald A. Walsh's *Handbook of Machining and Metalworking
Calculations*.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # vitest
npm run build     # production build → dist/
```

## Importing into Fusion 360

1. Click **Export DXF** — downloads `geneva-drive.dxf`.
2. In Fusion: **Insert → Insert DXF** → select the file.
3. The wheel and crank appear on separate layers, positioned at their real
   center distance.
4. Extrude each layer to whatever thickness you want.

## Attribution

See [ATTRIBUTION.md](./ATTRIBUTION.md). Math + geometry approach adapted from
[benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen) (MIT).

## License

MIT — see [LICENSE](./LICENSE).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README"
```

---

### Task 34: Final verification

**Files:** none

- [ ] **Step 1: Run all tests**

```bash
npm test
```
Expected: all green (~12-15 tests across params, geometry, dxf).

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: completes with no TS errors, no missing deps.

- [ ] **Step 3: Preview the production build**

```bash
npm run preview
```
Open the printed URL, smoke-test:
- Sliders work
- Preview renders
- Export DXF downloads
- STL button is disabled with tooltip
- URL state syncs

- [ ] **Step 4: Final commit**

If everything passes:

```bash
git status   # should be clean
```

If anything new came up, commit it. Then this is ready to push to GitHub.

---

## Out of scope — explicitly not in v1

(Repeated from spec §15 so the executor doesn't drift.)

- STL export (button rendered but disabled with tooltip)
- 3D preview
- Shaft / mounting holes
- Imperial units
- Internationalization
- Saved presets / user accounts

## Done definition

- All 34 tasks checked off.
- `npm test` green.
- `npm run build` green.
- Manual verification of UI features in §29.
- DXF imports cleanly into Fusion 360 (§16).
- Animation runs at ~60°/sec without dropping frames.
- Committed and ready to push.
