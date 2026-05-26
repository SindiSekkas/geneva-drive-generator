# Geneva Drive Generator — Design Spec

**Status:** Draft for review
**Date:** 2026-05-26
**Repo (planned):** `geneva-drive-generator`
**Live URL (planned):** `https://<owner>.github.io/geneva-drive-generator/`

## 1. Goal

A static web app that lets a user dial in the parameters of a Geneva drive
(intermittent-motion mechanism) and download a DXF file ready to import into
Fusion 360, where they will extrude each part and assemble it. The app must
look unmistakably premium — engineering-tool restraint rather than generic
modern-AI dashboard aesthetics.

The tool replaces both:

- The need for a Python CLI (the website produces the same DXF output, with a UI).
- The existing browser tool [benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen),
  whose math we are porting but whose UI we are replacing entirely.

## 2. Background — the math

The math is taken directly from Ronald A. Walsh's *Handbook of Machining and
Metalworking Calculations* (as cited in the [New Gottland blog post](https://web.archive.org/web/20141016211828/http://newgottland.com/2012/01/08/make-geneva-wheels-of-any-size/))
and matches the formulas implemented in `genevaController.js` of the source repo.

**Inputs:**
- `n` — number of slots (positions). Must be ≥ 3.
- `a` or `b` — drive crank radius **or** Geneva wheel radius (one is the input, the
  other is derived; user toggles which).
- `p` — pin diameter.
- `t` — allowed clearance / tolerance.

**Derived:**

| Symbol | Formula | Meaning |
|---|---|---|
| `c` | `b / cos(π/n)` (when `b` is input) or `a / sin(π/n)` (when `a` is input) | center-to-center distance |
| `a` (when derived) | `√(c² − b²)` | drive crank radius |
| `b` (when derived) | `√(c² − a²)` | Geneva wheel radius |
| `s` | `a + b − c` | slot center length (depth) |
| `w` | `p + t` | slot width |
| `y` | `a − 1.5·p` | stop arc radius |
| `z` | `y − t` | stop disc radius |
| `v` | `b · z / a` | clearance arc radius |

**Reference values** (used in tests, taken from the screenshot in the source PDF):
With `n=6, b=55, p=4, t=0.1` → `a=31.7543, c=63.5085, s=23.2457, w=4.1000,
y=25.7543, z=25.6543, v=44.4345`.

**Validation rules:**
- `n` must be an integer ≥ 3.
- `a`, `b`, `p` must be positive.
- `t` must be ≥ 0.
- All derived values must be > 0 — if not, the UI surfaces a friendly error
  (e.g., a small `n` with a large `p` makes `y = a − 1.5p` go negative).

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Build | Vite | Single config, fast HMR, painless GH Pages build. |
| Framework | React 19 + TypeScript | Reactive UI; types catch math errors early. |
| Styling | Tailwind CSS v4 | Utility-first; theme tokens for consistent palette. |
| Component primitives | shadcn/ui (Slider, Input, Button, Tooltip, Switch, Card) | Used as a foundation, **restyled** so the result doesn't look like a default shadcn dashboard. |
| 2D preview | Native SVG | One-to-one with our DXF primitives; no extra dependency. |
| DXF writer | Hand-rolled (`src/geneva/exporters/dxf.ts`) | ~150 LOC of minimal AC1009 R12 DXF — only CIRCLE, ARC, LINE entities and LAYER table. Avoids a dependency for trivial output. |
| 3D preview / STL | Out of scope for v1 | STL button is present but disabled. |
| Tests | Vitest | Same toolchain as Vite. |
| Lint / format | ESLint + Prettier (defaults) | Minimal config. |
| Deploy | GitHub Actions → GitHub Pages | Workflow builds and pushes `dist/` to `gh-pages` branch. |

## 4. Project layout

```
geneva-drive-generator/
├── src/
│   ├── geneva/                       # framework-free core (no React imports)
│   │   ├── params.ts                 # GenevaParams type + deriveParams()
│   │   ├── geometry.ts               # buildWheelProfile(), buildCrankProfile()
│   │   ├── primitives.ts             # Circle | Arc | Line types
│   │   └── exporters/
│   │       ├── dxf.ts                # profilesToDxf(profiles) → string
│   │       └── svg.ts                # profileToSvg(profile) → JSX or string
│   ├── components/
│   │   ├── ParameterPanel.tsx        # all input controls
│   │   ├── ParameterControl.tsx      # slider+input pair, used by ParameterPanel
│   │   ├── RadiusModeToggle.tsx      # toggle between "a is input" / "b is input"
│   │   ├── DerivedValuesCard.tsx     # readout of c, s, w, y, z, v with formula chips
│   │   ├── Preview.tsx               # SVG of wheel + crank
│   │   ├── PreviewControls.tsx       # animate toggle, show-dimensions toggle, theme toggle
│   │   └── ExportBar.tsx             # 2 buttons: DXF (active), STL (disabled+tooltip)
│   ├── hooks/
│   │   ├── useGenevaParams.ts        # central params state via reducer
│   │   ├── useUrlState.ts            # syncs params to ?n=6&b=55&p=4&t=0.1
│   │   └── useAnimation.ts           # requestAnimationFrame loop for drive spin
│   ├── lib/
│   │   ├── download.ts               # triggers <a download> for a blob
│   │   └── cn.ts                     # className helper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                     # Tailwind directives + font imports
├── tests/
│   ├── params.test.ts                # reference value assertions
│   ├── geometry.test.ts              # entity counts, geometric sanity
│   └── dxf.test.ts                   # output string contains expected DXF sections
├── public/
│   └── favicon.svg
├── .github/workflows/deploy.yml
├── vite.config.ts                    # base: '/geneva-drive-generator/'
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── README.md
├── LICENSE                            # MIT
├── ATTRIBUTION.md                     # credits benbrandt22 + J.E. Johnson
└── THIRD_PARTY_LICENSES               # verbatim upstream MIT
```

**Boundary rule:** anything under `src/geneva/` imports zero React, zero DOM
APIs, zero Tailwind. It is pure math + data. Everything else may depend on it.
This makes the core testable in isolation and trivially portable if a future
Python or Fusion-add-in version is ever wanted.

## 5. Module: `src/geneva/params.ts`

```ts
export type RadiusMode = 'a' | 'b';

export interface GenevaInput {
  mode: RadiusMode;     // which radius is the user-controlled input
  a?: number;            // present iff mode === 'a'
  b?: number;            // present iff mode === 'b'
  n: number;
  p: number;
  t: number;
}

export interface GenevaParams {
  // inputs (always populated; the non-driving one is derived)
  a: number; b: number; n: number; p: number; t: number;
  // derived
  c: number; s: number; w: number; y: number; z: number; v: number;
  // diagnostics
  warnings: string[];   // e.g. "y is negative — pin is too large for crank radius"
}

export function deriveParams(input: GenevaInput): GenevaParams;
```

`deriveParams` always returns a `GenevaParams`. If the math produces a
nonsensical value it still returns it but adds a string to `warnings`; the UI
decides how to surface that. This keeps the function pure and easy to test.

## 6. Module: `src/geneva/geometry.ts`

**Profile** is a flat list of primitives, each tagged with a layer name:

```ts
export type Primitive =
  | { kind: 'circle'; cx: number; cy: number; r: number; layer: string }
  | { kind: 'arc'; cx: number; cy: number; r: number; startAngle: number; endAngle: number; layer: string }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; layer: string };

export type Profile = Primitive[];

export function buildWheelProfile(p: GenevaParams): Profile;
export function buildCrankProfile(p: GenevaParams, offsetX?: number): Profile;
```

**Wheel profile** (centered at origin, `offsetX = 0`):

1. **Outer rim:** N arcs along the circle of radius `b`, with breaks where each
   slot opens. Slot opening half-angle on the rim ≈ `asin((w/2) / b)`. Each rim
   arc goes from `(i·2π/n + α)` to `((i+1)·2π/n − α)`.
2. **Slots:** N stadium shapes (rect + 2 semicircles). For each slot at
   orientation `θ = i·2π/n`: 2 line segments parallel to the slot axis from
   the rim opening inward by depth `s`, then 1 semicircle of radius `w/2`
   closing the inner end. The slot's outer end is the rim opening (already
   broken in step 1).
3. **Stop-disc cutouts:** N circles of radius `y` centered at distance `c` from
   the wheel center, **rotated by `π/n` (half-slot pitch)** so they sit between
   slots, not on top of them. These are inner holes in the sketch — Fusion will
   recognize them as such automatically.

Layers used: `wheel_outer`, `wheel_slots`, `wheel_stop_cutouts`.

**Crank profile** (centered at `(offsetX, 0)`, defaults `offsetX = c` so the
two parts ship in their assembly position):

1. **Outer disc:** circle of radius `a + p`.
2. **Pin:** circle of radius `p/2`, center at distance `a` from crank center
   along the pin's start angle (`π − atan(b/a)` from the original; chosen so
   the pin sits at the slot entry of an adjacent wheel slot at rest).
3. **Stop disc with clearance:** the locking arc on the crank, formed by two
   arcs:
   - convex arc of radius `z` centered at the crank center
   - concave arc of radius `v` centered offset by `(−z, −v)` from the crank
     center (matches the SVG mask in the original).
   Together they form the crescent the wheel lobes pass through.

Layers used: `crank_outer`, `crank_pin`, `crank_stop_disc`.

The choice of `offsetX = c` for the export means **the generated DXF shows the
two parts at their real working positions**. Importing into Fusion gives you
an instantly-meaningful assembly view; you can then split the parts into
separate components using "Create Sketch" + "Project" with a layer filter.

## 7. Module: `src/geneva/exporters/dxf.ts`

```ts
export function profilesToDxf(profiles: Profile[]): string;
```

Emits a minimal AC1009 (R12) DXF — the most universally-supported flavor —
with these sections:

- `HEADER` — minimal (`$INSUNITS = 4` for millimeters)
- `TABLES` — `LAYER` table with one entry per unique layer name in the input,
  with sensible default colors so the user can visually distinguish features in
  Fusion's import dialog
- `ENTITIES` — one entity per primitive

Why hand-rolled rather than a library:

- DXF for CIRCLE/ARC/LINE is ~5 lines per entity. Total writer is ~150 LOC.
- Removes a dependency.
- Lets us guarantee Fusion-friendly output (correct angle direction for ARC,
  correct unit metadata).

Tested by importing into Fusion 360 manually before merging.

## 8. Module: `src/geneva/exporters/svg.ts`

Same `Profile` → SVG `<g>` of `<circle>`, `<path d="M... A...">` (for arcs),
and `<line>`. Used by the `Preview` component. Animation is achieved by
re-running geometry + re-rendering each frame; the `Profile` is cheap to
recompute (< 1 ms for typical params).

## 9. UI components

### 9.1 Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Geneva Drive Generator                       [Sun/Moon] [GitHub]│
├──────────────────────────────────┬───────────────────────────────┤
│                                  │                               │
│  ParameterPanel                  │  Preview                      │
│   - RadiusModeToggle             │   (SVG, fills available)      │
│   - ParameterControl × 5         │                               │
│                                  │                               │
│  DerivedValuesCard               │  PreviewControls              │
│   - 6 rows, mono-font            │   - Animate    [switch]       │
│   - formula chips                │   - Dimensions [switch]       │
│                                  │                               │
│                                  │  ExportBar                    │
│                                  │   [Export DXF]  [Export STL ⓘ]│
│                                  │                               │
└──────────────────────────────────┴───────────────────────────────┘
  (stacks vertically on screens narrower than ~900 px)
```

### 9.2 `ParameterControl` (the linked slider + input)

Single visual unit, used 5× (n, a-or-b, p, t):

- Label on the left in normal weight, symbol in mono on the right.
- Range slider takes most of the width.
- Numeric input pinned to the right (`tabular-nums`, mono).
- Value chip floats over the slider thumb showing the current value as you
  drag (disappears on blur).
- Step values picked per parameter: `n` step 1, radii step 0.1, `p` step 0.1,
  `t` step 0.01.
- Bounds: `n ∈ [3, 24]`, radii ∈ `[1, 500]`, `p ∈ [0.1, 50]`, `t ∈ [0, 5]`.

### 9.3 `RadiusModeToggle`

A single segmented control:  `[ a — crank radius | b — wheel radius ]`. When
toggled, the previously-derived value becomes the new input (carries the
current value across, so toggling doesn't snap geometry).

### 9.4 `DerivedValuesCard`

Six rows. Each row:

```
c       63.5085 mm     [ c = b / cos(π/n) ]
```

- Symbol mono, value mono right-aligned with fixed decimal places (4),
  units in a smaller subtle color.
- Formula in a small "chip" — bordered, low-contrast — surfaces the math like
  the original blog did, without dominating.
- When a derived value changes, the value text crossfades over ~150 ms.
- If `params.warnings` contains anything, a small warning row appears at the
  bottom of the card with a yellow accent.

### 9.5 `Preview`

- SVG fills the right column.
- Faint dotted grid in the background (10 mm spacing, ~10% opacity).
- Geneva wheel in one stroke color (foreground accent), drive crank in
  another (slightly muted).
- Strokes are thin (1 px CSS, vector-effect non-scaling-stroke) — engineering
  drawing aesthetic.
- If "Dimensions" is on: the `abc` triangle and `vz` triangle from the original
  drawing are overlaid in a lighter stroke, with labels.
- If "Animate" is on: drive crank spins at ~10 RPM (60°/sec, i.e. 1°/frame at
  60 fps). Wheel rotation is computed per frame using the same logic as
  `genevaDrawingController.js` (`isWithinWheel` check on the pin, `atan2` of
  pin-to-wheel-center vector).
- Smooth transitions on parameter change: 150 ms ease-out on `transform`,
  `r`, `cx`, `cy` (all CSS-animatable). The `<path d="...">` attribute is
  **not** CSS-animatable cross-browser, so when a parameter changes we
  re-render the path; the eye doesn't notice within 150 ms.

### 9.6 `ExportBar`

Two buttons in a horizontal row:

- **Export DXF** — primary style, accent-colored, with a small download icon.
  Click triggers a download of `geneva-drive.dxf` (a single file with both
  parts on separate layers, positioned at real center distance `c`).
- **Export STL** — secondary style at reduced opacity (~40%), `cursor:
  not-allowed`, `aria-disabled="true"`. Hovering shows a Tooltip:
  *"STL export — coming soon"*. The button is rendered but not clickable.

## 10. Visual design specification

This is the "great design" commitment — concrete enough that we can verify it
in implementation.

### 10.1 Color tokens

| Token | Dark mode (default) | Light mode |
|---|---|---|
| `bg`         | `#0B0D10` (near-black, slight cool tint) | `#FAFAF9` (warm off-white) |
| `bg-elev`    | `#13161A` (cards)                        | `#FFFFFF` |
| `border`     | `#23272E`                                 | `#E5E5E2` |
| `fg`         | `#E6E8EB`                                 | `#171717` |
| `fg-muted`   | `#8A9099`                                 | `#5C5C5A` |
| `fg-subtle`  | `#5A6068`                                 | `#9A9A98` |
| `accent`     | `#5B8DEF` (desaturated electric blue)     | `#3B6EE0` |
| `accent-fg`  | `#FFFFFF`                                 | `#FFFFFF` |
| `warn`       | `#E0B341`                                 | `#B58817` |
| `wheel`      | `#5B8DEF` (the accent — wheel is "hero")  | `#3B6EE0` |
| `crank`      | `#8A9099` (muted — secondary in preview)  | `#5C5C5A` |

### 10.2 Typography

- **Inter** for all UI text — system fallback `ui-sans-serif`.
- **JetBrains Mono** for every digit and symbol that represents math — values
  in inputs, derived readouts, formula chips. Use the `tabular-nums` variant
  so digits are equal-width.
- Type scale: 12 / 14 / 16 / 24 / 32 px. Body 14 px. Section labels 12 px
  uppercase tracked. Heading 24 px.

### 10.3 Spacing & layout

- 8 px base unit. Card padding 24 px. Section gap 32 px. Generous left/right
  page padding (max-width 1200 px, centered).
- Cards have 1 px borders, no shadow.
- Header is sticky, 56 px tall, with a 1 px bottom border.

### 10.4 Motion

- All transitions ≤ 200 ms.
- `ease-out` curve for state changes (`cubic-bezier(0.2, 0.0, 0.0, 1.0)`).
- Number transitions on derived values: fade out 80 ms → fade in 80 ms.
- Slider thumb has a subtle 1.05× scale on active drag.
- No scroll-driven animation, no parallax, no auto-spinning anything (the
  preview animation is user-toggled).

### 10.5 Detail polish — non-negotiable

These are the small things that separate "shadcn template" from "real product":

- Inputs have a 1 px ring on focus in `accent` color — never the default
  browser outline.
- Sliders show ticks at integer values for `n`.
- Buttons have an inset 1 px top highlight in dark mode (`box-shadow:
  inset 0 1px 0 rgb(255 255 255 / 0.06)`) — gives them physicality without
  being skeuomorphic.
- The disabled STL button does **not** lift on hover; its tooltip animates in
  with a 100 ms delay so it doesn't feel jumpy.
- Preview SVG strokes are hairline (`stroke-width: 1; vector-effect:
  non-scaling-stroke`) — preserves the engineering-drawing feel at any zoom.

The **`frontend-design` skill MUST be invoked during implementation** of the
UI components so the visual character is built in, not retrofitted.

## 11. State management

A single React reducer for parameters lives in `useGenevaParams`. It owns:

- `mode: 'a' | 'b'`
- `n`, `a`, `b`, `p`, `t` (only the one matching `mode` is treated as input;
  the other is derived)
- `showDimensions: boolean`
- `animate: boolean`

`useUrlState` is a one-way hook that serializes the reducer state to
`window.location.search` on every change (debounced 200 ms) and seeds the
reducer from URL on mount. Reading the URL gives shareable permalinks like
`?mode=b&b=55&n=6&p=4&t=0.1`.

`useAnimation` runs an rAF loop that advances the drive's spin angle at
~60°/sec (≈10 RPM, which feels right for visualizing the intermittent motion)
when `animate` is true. The current angle is component-local state, not in
the URL.

## 12. Build & deployment

### 12.1 Vite config

- `base: '/geneva-drive-generator/'` so asset URLs resolve correctly under the
  GH Pages subpath.
- Standard React + TS preset.

### 12.2 GitHub Actions workflow (`.github/workflows/deploy.yml`)

Triggered on push to `main`:

1. Checkout
2. Setup Node 20
3. `npm ci`
4. `npm run lint && npm run test && npm run build`
5. Deploy `dist/` to `gh-pages` branch using `peaceiris/actions-gh-pages` (or
   the native `actions/deploy-pages` flow — pick whichever has the simpler
   permissions setup at implementation time).

User enables GitHub Pages on the repo once → site goes live at
`https://<owner>.github.io/geneva-drive-generator/`.

## 13. Tests

Vitest, run in CI. **Coverage target: 100% of `src/geneva/`**, no coverage
required for UI components in v1 (frontend changes too rapidly during design
polish to be worth pinning).

- `params.test.ts`:
  - The screenshot reference: `n=6, b=55, p=4, t=0.1` → exact `c, s, w, y, z, v`.
  - The blog comment reference: `n=4, b=105` → `c ≈ 148.49`.
  - `n=3`: math is still valid.
  - `n=2`: rejected with warning.
  - `a`-input mode and `b`-input mode produce identical derived geometry for
    equivalent inputs.
  - Negative-`y` case (`p` too large relative to `a`) produces a warning.

- `geometry.test.ts`:
  - Wheel profile has exactly `n` rim arcs, `n` slot stadiums (= 2n lines + n
    arcs), `n` stop-disc cutout circles.
  - Crank profile has 1 outer circle, 1 pin circle, 2 stop-disc arcs.
  - All primitives have finite coordinates.
  - Wheel and crank don't have overlapping bounding boxes when crank is
    offset by `c`.

- `dxf.test.ts`:
  - Output starts with `0\nSECTION\n` and ends with `0\nEOF`.
  - Contains a `LAYER` table entry for each layer used.
  - Number of `CIRCLE`, `ARC`, `LINE` records matches profile.
  - Header declares millimeter units.

## 14. Attribution & licensing

- `LICENSE` — MIT, copyright current year, owner from `git config user.name`.
- `ATTRIBUTION.md` — credits:
  - [benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen) (MIT,
    © 2014 Ben Brandt) for the original math implementation we ported.
  - J. E. Johnson's [*Make Geneva wheels of any size*](https://web.archive.org/web/20141016211828/http://newgottland.com/2012/01/08/make-geneva-wheels-of-any-size/)
    blog post (New Gottland) for the geometric derivation.
  - Ronald A. Walsh's *Handbook of Machining and Metalworking Calculations*
    as the original source of the formulas.
- `THIRD_PARTY_LICENSES` — verbatim copy of the upstream MIT license text.
- `README.md` — short description, screenshot, how to run locally, link to the
  live site, attribution section.

## 15. Out of scope for v1 (explicitly)

- STL export. Button is rendered but disabled with a "coming soon" tooltip.
- 3D preview.
- User-configurable shaft / mounting holes (Fusion does that easily after import).
- Saved presets / accounts / multi-user anything.
- Internationalization (English only).
- Imperial units (mm only).

## 16. Future work (not promised, but kept in mind so v1 doesn't preclude it)

- STL export by extruding profiles in a small mesh writer. Reuses the same
  `Profile` data structure → fits cleanly behind the existing disabled button.
- "Split into two files" toggle for DXF export.
- 3D preview via Three.js as a second tab.
- A separate **Fusion 360 add-in** (Python, runs inside Fusion) that consumes
  the same params and builds the parametric model natively. Shares zero
  runtime code with the web app but the math module is a near-line-for-line
  Python port of `params.ts`.

---

## Approval

When this spec is approved, the next step is to invoke `superpowers:writing-plans`
to break it into an implementation plan with verifiable steps.
