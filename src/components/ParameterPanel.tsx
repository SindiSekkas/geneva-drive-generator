import type { Action, UiState } from '../hooks/useGenevaParams';
import { ParameterControl } from './ParameterControl';
import { RadiusModeToggle } from './RadiusModeToggle';

interface Props {
  state: UiState;
  derivedA: number;
  derivedB: number;
  dispatch: React.Dispatch<Action>;
}

function SectionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-2">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">{children}</h2>
      {sub && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
          {sub}
        </span>
      )}
    </div>
  );
}

export function ParameterPanel({ state, derivedA, derivedB, dispatch }: Props) {
  const { input } = state;
  const radiusValue = input.mode === 'b' ? input.b : input.a;
  const radiusFallback = input.mode === 'b' ? derivedB : derivedA;
  const effectiveRadius = Number.isFinite(radiusValue) ? radiusValue : radiusFallback;

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-bg-elev p-6">
      <SectionLabel sub="INPUT">PARAMETERS</SectionLabel>

      <RadiusModeToggle
        mode={input.mode}
        onChange={(m) => dispatch({ type: 'setMode', value: m })}
      />

      <div className="flex flex-col">
        <ParameterControl
          label={input.mode === 'b' ? 'Geneva wheel radius' : 'Drive crank radius'}
          symbol={input.mode}
          value={effectiveRadius}
          onChange={(v) => dispatch({ type: 'setRadius', value: v })}
          min={1} max={500} step={0.1} precision={2}
          ticks={5}
        />
        <ParameterControl
          label="number of positions"
          symbol="n"
          value={input.n}
          onChange={(v) => dispatch({ type: 'setN', value: Math.round(v) })}
          min={3} max={24} step={1} unit=""
          ticks={5}
        />
        <ParameterControl
          label="pin diameter"
          symbol="p"
          value={input.p}
          onChange={(v) => dispatch({ type: 'setP', value: v })}
          min={0.1} max={50} step={0.1} precision={2}
          ticks={5}
        />
        <ParameterControl
          label="allowed clearance"
          symbol="t"
          value={input.t}
          onChange={(v) => dispatch({ type: 'setT', value: v })}
          min={0} max={5} step={0.01} precision={3}
          ticks={5}
        />
      </div>
    </section>
  );
}
