import { cn } from '../lib/cn';
import type { RadiusMode } from '../geneva/params';

interface Props {
  mode: RadiusMode;
  onChange: (m: RadiusMode) => void;
}

interface BtnProps {
  value: RadiusMode;
  label: string;
  active: boolean;
  onChange: (m: RadiusMode) => void;
}

// Defined at module scope (not inside RadiusModeToggle) so React treats it as a
// stable component type across renders. Previously this was an inner function,
// which React unmounts and remounts on every parent render — that occasionally
// left the visible pressed-state out of sync with the actual mode.
function Btn({ value, label, active, onChange }: BtnProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      className={cn(
        'relative flex-1 rounded-[5px] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]',
        'transition-all duration-150',
        active
          ? 'bg-bg text-fg shadow-[inset_0_0_0_1px_var(--color-border-bright),0_1px_0_rgba(0,0,0,0.4)]'
          : 'text-fg-subtle hover:text-fg-muted'
      )}
    >
      <span className="flex items-center justify-center gap-2">
        <span
          className={cn(
            'size-1 rounded-full transition-colors',
            active ? 'bg-accent' : 'bg-fg-subtle/40'
          )}
        />
        {label}
      </span>
    </button>
  );
}

export function RadiusModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-md border border-border bg-bg-elev-2 p-1">
      <Btn value="a" label="a · crank radius" active={mode === 'a'} onChange={onChange} />
      <Btn value="b" label="b · wheel radius" active={mode === 'b'} onChange={onChange} />
    </div>
  );
}
