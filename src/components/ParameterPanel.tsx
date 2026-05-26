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
  const radiusValue =
    input.mode === 'b' ? input.b : input.a;
  const radiusFallback = input.mode === 'b' ? derivedB : derivedA;
  const effectiveRadius = Number.isFinite(radiusValue) ? radiusValue : radiusFallback;

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
        value={effectiveRadius}
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
