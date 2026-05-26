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
