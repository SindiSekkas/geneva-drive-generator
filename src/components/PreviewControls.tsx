import type { Action, UiState } from '../hooks/useGenevaParams';
import { cn } from '../lib/cn';

interface Props {
  state: UiState;
  dispatch: React.Dispatch<Action>;
}

function Toggle({
  label, on, onClick,
}: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-1.5',
        'font-mono text-[10px] uppercase tracking-[0.16em]',
        'transition-all duration-150',
        on
          ? 'border-accent/60 bg-accent/[0.08] text-accent shadow-[inset_0_0_0_1px_var(--color-accent-dim)]'
          : 'border-border bg-bg-elev/40 text-fg-muted hover:border-border-bright hover:text-fg'
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full transition-colors',
          on ? 'bg-accent' : 'bg-fg-subtle/50'
        )}
      />
      {label}
    </button>
  );
}

export function PreviewControls({ state, dispatch }: Props) {
  return (
    <div className="flex items-center gap-2">
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
