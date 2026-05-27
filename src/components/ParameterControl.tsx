import { useEffect, useMemo, useState } from 'react';
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
  /** How many tick marks to render under the slider (including endpoints). */
  ticks?: number;
}

export function ParameterControl({
  label, symbol, value, onChange, min, max, step,
  unit = 'mm', precision = 2, ticks = 5,
}: Props) {
  // Canonical formatted display — what the field shows when it's NOT focused.
  const display = Number.isInteger(step) ? value.toString() : value.toFixed(precision);

  // Local draft while the user is typing. Decoupling the typed text from the
  // canonical formatted value is what fixes the "can only type one digit" bug:
  // without this, every keystroke triggered a re-format ("5" → "5.00") which
  // pushed the cursor and ate subsequent input.
  const [draft, setDraft] = useState(display);
  const [focused, setFocused] = useState(false);

  // Keep the draft in sync with the canonical value whenever it changes from
  // outside (slider, URL state, mode toggle), but never while the user is
  // actively editing the input.
  useEffect(() => {
    if (!focused) setDraft(display);
  }, [display, focused]);

  const tickValues = useMemo(
    () => Array.from({ length: ticks }, (_, i) => min + (i * (max - min)) / (ticks - 1)),
    [min, max, ticks]
  );

  return (
    <div className="flex flex-col gap-2 py-1">
      {/* Top row: symbol + label, with unit on the far right. */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[15px] font-medium text-fg">{symbol}</span>
          <span className="text-[13px] text-fg-muted">{label}</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
          {unit || '—'}
        </span>
      </div>

      {/* Slider + numeric input row. */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="slider-precision w-full"
            aria-label={`${symbol} (${label})`}
          />
          {/* Vernier-style tick marks under the track. */}
          <div className="pointer-events-none absolute left-[7px] right-[7px] top-[14px] flex justify-between">
            {tickValues.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'block w-px bg-border-bright',
                  i === 0 || i === tickValues.length - 1 ? 'h-2' : 'h-1'
                )}
              />
            ))}
          </div>
        </div>
        <input
          type="number"
          min={min} max={max} step={step}
          value={draft}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            // Snap back to the canonical format on commit. If the field
            // was left empty or non-numeric, revert to last good value.
            setDraft(display);
          }}
          onChange={(e) => {
            // Always reflect what the user typed, even mid-edit states
            // like "" or "5." that aren't valid numbers yet.
            setDraft(e.target.value);
            const n = parseFloat(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          className={cn(
            'w-[78px] rounded-md border border-border bg-bg-elev-2 px-2 py-1',
            'font-mono text-[13px] tabular-nums text-fg',
            'transition-shadow duration-150',
            'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-dim)]'
          )}
        />
      </div>
    </div>
  );
}
