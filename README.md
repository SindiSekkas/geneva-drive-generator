# Geneva Drive Generator

A browser-based parametric generator for [Geneva drive](https://en.wikipedia.org/wiki/Geneva_drive)
mechanisms. Dial in your parameters, see a live preview, and export a DXF
ready to import into Fusion 360 (or any other CAD program).

**[Live site](https://<owner>.github.io/geneva-drive-generator/)**

## What is a Geneva drive?

A mechanism that converts continuous rotation into intermittent stepped
rotation. Used in film projectors, indexing tables, watch escapements, and
yogurt-cup filling machines. This tool generates the 2D profiles of both
parts (the driven Geneva wheel and the driver crank), positioned at their
working center distance, on separate layers in a single DXF.

## Parameters

| Symbol | Meaning |
|---|---|
| `n` | number of positions (≥ 3) |
| `a` *or* `b` | drive crank radius *or* Geneva wheel radius (pick which one drives) |
| `p` | pin diameter |
| `t` | allowed clearance |

All other dimensions (`c`, `s`, `w`, `y`, `z`, `v`) are derived. The math
comes from Ronald A. Walsh's *Handbook of Machining and Metalworking
Calculations*.

## Importing into Fusion 360

1. Click **Export DXF** — downloads `geneva-drive.dxf`.
2. In Fusion: **Insert → Insert DXF** → select the file.
3. The wheel and crank appear on separate layers, positioned at their real
   center distance.
4. Extrude each layer to whatever thickness you want; add a shaft hole.

## Development

```bash
npm install
npm run dev       # http://localhost:5173/geneva-drive-generator/
npm test          # vitest
npm run build     # production build → dist/
```

## Deployment

Pushing to `main` (or `master`) triggers the GitHub Actions workflow at
`.github/workflows/deploy.yml`. On the repo settings → Pages, set the source
to "GitHub Actions" and the site will be at:

```
https://<your-username>.github.io/geneva-drive-generator/
```

## Attribution

The math and geometry approach were ported from
[benbrandt22/genevaGen](https://github.com/benbrandt22/genevaGen) (MIT, ©
2014 Ben Brandt). The formulas originate in J. E. Johnson's
[New Gottland blog post](https://web.archive.org/web/20141016211828/http://newgottland.com/2012/01/08/make-geneva-wheels-of-any-size/),
which cites Ronald A. Walsh's *Handbook of Machining and Metalworking
Calculations*. See [ATTRIBUTION.md](./ATTRIBUTION.md) and
[THIRD_PARTY_LICENSES](./THIRD_PARTY_LICENSES) for details.

## License

MIT — see [LICENSE](./LICENSE).
