import { useEffect } from 'react';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { DerivedValuesCard } from './components/DerivedValuesCard';
import { Preview } from './components/Preview';
import { PreviewControls } from './components/PreviewControls';
import { ExportBar } from './components/ExportBar';
import { useGenevaParams } from './hooks/useGenevaParams';
import { useUrlState, parseUrl } from './hooks/useUrlState';
import { useAnimation } from './hooks/useAnimation';

/** Four corner brackets that frame the preview SVG — viewfinder/CAD vibe. */
function CornerTicks() {
  const base =
    'absolute size-3 border-fg-subtle/60 pointer-events-none';
  return (
    <>
      <span className={`${base} left-2 top-2 border-l border-t`} />
      <span className={`${base} right-2 top-2 border-r border-t`} />
      <span className={`${base} bottom-2 left-2 border-l border-b`} />
      <span className={`${base} bottom-2 right-2 border-r border-b`} />
    </>
  );
}

export default function App() {
  const { state, dispatch, params } = useGenevaParams();
  const { driveAngleDeg, wheelAngleDeg } = useAnimation(params, state.animate);

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

  const radiusLabel = state.input.mode === 'b' ? 'b' : 'a';
  const radiusValue = state.input.mode === 'b' ? params.b : params.a;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[420px_1fr]">
        {/* LEFT COLUMN — input + derived. */}
        <div className="flex flex-col gap-6 reveal" style={{ animationDelay: '40ms' }}>
          <ParameterPanel
            state={state}
            derivedA={params.a}
            derivedB={params.b}
            dispatch={dispatch}
          />
          <DerivedValuesCard params={params} />
        </div>

        {/* RIGHT COLUMN — preview + controls + export. */}
        <div className="flex flex-col gap-4 reveal" style={{ animationDelay: '120ms' }}>
          {/* Preview frame */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-bg-elev">
            <CornerTicks />
            {/* Drawing-sheet header strip */}
            <div className="flex items-center justify-between border-b border-border bg-bg-elev-2/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent pulse-soft" />
                Live Preview
              </span>
              <span>VIEW · TOP · 1:1</span>
            </div>

            {/* SVG canvas */}
            <div className="aspect-[4/3] w-full">
              <Preview
                params={params}
                showDimensions={state.showDimensions}
                driveAngleDeg={driveAngleDeg}
                wheelAngleDeg={wheelAngleDeg}
              />
            </div>

            {/* Drawing-sheet footer strip — live status line.
                Compact glyph format so it never wraps on mobile. */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-elev-2/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">
              <span className="min-w-0 truncate text-fg-subtle">
                <span className="text-fg-muted">n</span>=<span className="tabular-nums text-fg-muted">{state.input.n}</span>
                <span className="mx-1.5 text-border-bright">·</span>
                <span className="text-fg-muted">{radiusLabel}</span>=<span className="tabular-nums text-fg-muted">{radiusValue.toFixed(1)}</span>
                <span className="mx-1.5 text-border-bright">·</span>
                <span className="text-fg-muted">c</span>=<span className="tabular-nums text-fg-muted">{params.c.toFixed(2)}</span>
                <span className="ml-1 text-fg-subtle/70">mm</span>
              </span>
              <span className="shrink-0 text-fg-subtle">
                {params.warnings.length > 0 ? (
                  <span className="text-warn">⚠ {params.warnings.length}</span>
                ) : (
                  <span>● READY</span>
                )}
              </span>
            </div>
          </div>

          <PreviewControls state={state} dispatch={dispatch} />
          <ExportBar params={params} />
        </div>
      </main>

      <footer className="mx-auto max-w-[1200px] px-6 pb-10 pt-2 reveal" style={{ animationDelay: '200ms' }}>
        <div className="border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
          <a
            href="https://github.com/SindiSekkas"
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted underline decoration-fg-subtle/40 underline-offset-4 hover:text-fg"
          >
            github.com/SindiSekkas
          </a>
        </div>
      </footer>
    </div>
  );
}
