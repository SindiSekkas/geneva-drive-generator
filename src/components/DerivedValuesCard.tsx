import { useEffect, useRef } from 'react';
import type { GenevaParams } from '../geneva/params';

const ROWS: ReadonlyArray<{ key: keyof GenevaParams; label: string; formula: string }> = [
  { key: 'c', label: 'center distance',    formula: 'c = b / cos(π/n)' },
  { key: 's', label: 'slot center length', formula: 's = a + b − c' },
  { key: 'w', label: 'slot width',         formula: 'w = p + t' },
  { key: 'y', label: 'stop arc radius',    formula: 'y = a − 1.5·p' },
  { key: 'z', label: 'stop disc radius',   formula: 'z = y − t' },
  { key: 'v', label: 'clearance arc',      formula: 'v = b·z / a' },
];

/** A single derived-value row. Flashes the value briefly when it changes. */
function Row({ k, label, formula, value }: { k: string; label: string; formula: string; value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value && ref.current) {
      ref.current.classList.remove('value-flash');
      // Force reflow so the animation re-fires for consecutive identical-class changes.
      void ref.current.offsetWidth;
      ref.current.classList.add('value-flash');
      prev.current = value;
    }
  }, [value]);

  return (
    <div className="grid grid-cols-[20px_1fr_auto] items-baseline gap-3 py-2.5">
      <span className="font-mono text-[14px] font-medium text-fg">{k}</span>
      <span className="text-[13px] text-fg-muted">{label}</span>
      <span ref={ref} className="font-mono text-[13px] tabular-nums text-fg">
        {value.toFixed(4)}
        <span className="ml-1.5 text-[10px] uppercase tracking-[0.16em] text-fg-subtle">mm</span>
      </span>
      <span className="col-span-3 ml-[32px] -mt-1 font-mono text-[10px] tracking-tight text-fg-subtle">
        {formula}
      </span>
    </div>
  );
}

export function DerivedValuesCard({ params }: { params: GenevaParams }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-bg-elev p-6">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
          Derived
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
          OUTPUT
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {ROWS.map(({ key, label, formula }) => (
          <Row
            key={key}
            k={key}
            label={label}
            formula={formula}
            value={params[key] as number}
          />
        ))}
      </div>

      {params.warnings.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 rounded-md border border-warn/30 bg-warn/[0.06] p-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-warn">
            <span className="size-1.5 rounded-full bg-warn pulse-soft" />
            Caution
          </div>
          {params.warnings.map((w, i) => (
            <div key={i} className="text-[12px] leading-relaxed text-warn/90">{w}</div>
          ))}
        </div>
      )}
    </section>
  );
}
