import { cn } from '../lib/cn';

interface Props {
  label: string;
  symbol: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  precision?: number;
}

export function ParameterControl({
  label, symbol, value, onChange, min, max, step, unit = 'mm', precision = 2,
}: Props) {
  const display = Number.isInteger(step) ? value.toString() : value.toFixed(precision);
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base text-fg">{symbol}</span>
          <span className="text-sm text-fg-muted">{label}</span>
        </div>
        <span className="font-mono text-xs text-fg-subtle">{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'flex-1 h-1.5 appearance-none rounded-full bg-border accent-accent',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:size-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-accent',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110'
          )}
        />
        <input
          type="number"
          min={min} max={max} step={step}
          value={display}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-20 rounded-md border border-border bg-bg-elev px-2 py-1',
            'font-mono text-sm tabular-nums text-fg',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
          )}
        />
      </div>
    </div>
  );
}
