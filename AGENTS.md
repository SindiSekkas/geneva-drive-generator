# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server at http://localhost:5173/geneva-drive-generator/
npm run build             # tsc -b && vite build  →  dist/
npm test                  # vitest run (one-shot, CI mode)
npm run test:watch        # vitest in watch mode
npx vitest tests/dxf.test.ts                    # run a single test file
npx vitest -t "engagement entry boundary"       # filter by test name
npm run lint              # eslint
node scripts/sample-dxf.mjs   # writes sample.dxf using the default params
```

The dev base path is `/geneva-drive-generator/` because the app is served as a GitHub Pages subpath — don't strip it. CI deploys via `.github/workflows/deploy.yml` on push to `main`/`master`.

## Architecture

This is a Vite + React 19 + Tailwind v4 SPA. There is no backend — everything is client-side math and SVG/DXF generation.

### The data pipeline

```
user inputs → GenevaInput → deriveParams() → GenevaParams
                                              ├── buildWheelProfile()  ──┐
                                              ├── buildCrankProfile()  ──┼→ Profile[] (Primitive[])
                                              │                          │
                                              │                          ├→ profilesToDxf()  (export)
                                              │                          └→ Preview.tsx     (live render)
                                              └── useAnimation()          
```

Everything downstream of `deriveParams()` reads `GenevaParams` — the renderer, the exporter, and the animation hook all consume the same derived object, so there is exactly one place to change geometry math: [src/geneva/params.ts](src/geneva/params.ts). User inputs are either `{ mode: 'a', a, ... }` or `{ mode: 'b', b, ... }` — the radius the user picks is primary; the other is derived via `c = a/sin(π/n)` or `c = b/cos(π/n)`. Inputs are validated soft-tly: `deriveParams()` always returns a result, with problems collected in `params.warnings: string[]`. Callers must check warnings before trusting `z`/`v` because they can go nonsensical when `y ≤ 0`.

### Geometry primitives (the IR)

[src/geneva/primitives.ts](src/geneva/primitives.ts) defines `Circle | Arc | Line` with a discriminated `kind` field. `buildWheelProfile()` and `buildCrankProfile()` emit `Profile = Primitive[]` in math-space coordinates (y-up, mm units), tagged with a `layer` string. From there:

- **DXF export** ([src/geneva/exporters/dxf.ts](src/geneva/exporters/dxf.ts)) walks the primitives and emits R12 (AC1009) entities. Numbers go through `num()` which forces fixed-decimal notation and snaps |v| < 1e-9 to 0 — see the file header for why scientific notation is forbidden.
- **Preview rendering** ([src/components/Preview.tsx](src/components/Preview.tsx)) does NOT consume the primitives. It re-derives the shapes from `params` directly as SVG `<rect>`/`<circle>`/`<mask>` elements, matching the mask-based approach of the original [benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen). The outer group has `transform="scale(1,-1)"` to flip to math-space y-up; everything inside it uses math coordinates.

Both paths are parameter-driven — no hardcoded coordinates anywhere — but they are two independent code paths, so if you change the wheel's appearance, change both.

### Animation invariants (subtle)

[src/hooks/useAnimation.ts](src/hooks/useAnimation.ts) computes `wheelAngleDeg` per frame:

- During engagement (pin distance from wheel center ≤ `b`): `wheelAngleDeg = atan2(pinY, pinX) * 180/π`.
- Otherwise: parked at `180/n` (the half-pitch position between two slots).

The engagement threshold MUST be exactly `b`, not `b - p/2` or any other offset. The math: at distance = b, `atan2` evaluates to exactly ±180/n, matching the park angle, so engagement entry is continuous and the engagement-exit step from `-180/n` to `+180/n` is exactly `360/n` (one slot pitch). The wheel's n-fold rotational symmetry then makes that step visually invisible. Any other threshold produces a step that is NOT a clean pitch, and a visible micro-rotation appears when the pin leaves the slot. There is a regression test for this in [tests/animation.test.ts](tests/animation.test.ts).

### State & URL sync

[src/hooks/useGenevaParams.ts](src/hooks/useGenevaParams.ts) holds the reducer for the UI state. [src/hooks/useUrlState.ts](src/hooks/useUrlState.ts) serializes/parses the input to/from query string — so shared URLs deep-link to specific configurations. When switching radius mode (a↔b), the reducer carries the currently-derived value across so geometry doesn't snap.

## Conventions

- **Math-space everywhere.** All geometry is computed in mm, y-up. The SVG flips with `scale(1,-1)` at the root group; DXF takes math coords directly. Never introduce y-down coordinates in geometry code.
- **Tests live in `tests/`**, not colocated. Vitest is configured in `vitest.config.ts` with `jsdom`. Geometry/DXF tests instantiate `deriveParams()` and check primitive counts and DXF text shape — the same pattern when adding new tests.
- **Reference the original sparingly.** The math comes from [benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen) (AngularJS, MIT, 2014). Attribution is mandatory — see [ATTRIBUTION.md](ATTRIBUTION.md). The original has no DXF export; ours is greenfield.
