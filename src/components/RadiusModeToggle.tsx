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
        'flex-1 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wide',
        'transition-colors',
        mode === value
          ? 'bg-accent text-accent-fg'
          : 'text-fg-muted hover:text-fg'
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1 rounded-md border border-border bg-bg-elev p-1">
      <Btn value="a" label="a · crank radius" />
      <Btn value="b" label="b · wheel radius" />
    </div>
  );
}
