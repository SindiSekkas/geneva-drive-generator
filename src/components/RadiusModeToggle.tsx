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
        'relative flex-1 rounded-[5px] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]',
        'transition-all duration-150',
        mode === value
          ? 'bg-bg text-fg shadow-[inset_0_0_0_1px_var(--color-border-bright),0_1px_0_rgba(0,0,0,0.4)]'
          : 'text-fg-subtle hover:text-fg-muted'
      )}
    >
      <span className="flex items-center justify-center gap-2">
        <span
          className={cn(
            'size-1 rounded-full transition-colors',
            mode === value ? 'bg-accent' : 'bg-fg-subtle/40'
          )}
        />
        {label}
      </span>
    </button>
  );
  return (
    <div className="flex gap-1 rounded-md border border-border bg-bg-elev-2 p-1">
      <Btn value="a" label="a · crank radius" />
      <Btn value="b" label="b · wheel radius" />
    </div>
  );
}
