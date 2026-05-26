import type { GenevaParams } from '../geneva/params';

const ROWS: ReadonlyArray<{ key: keyof GenevaParams; label: string; formula: string }> = [
  { key: 'c', label: 'center distance', formula: 'c = b / cos(π/n)' },
  { key: 's', label: 'slot center length', formula: 's = a + b − c' },
  { key: 'w', label: 'slot width', formula: 'w = p + t' },
  { key: 'y', label: 'stop arc radius', formula: 'y = a − 1.5p' },
  { key: 'z', label: 'stop disc radius', formula: 'z = y − t' },
  { key: 'v', label: 'clearance arc', formula: 'v = b·z / a' },
];

export function DerivedValuesCard({ params }: { params: GenevaParams }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-elev p-6">
      <h2 className="text-xs uppercase tracking-widest text-fg-subtle">Derived</h2>
      <div className="flex flex-col divide-y divide-border">
        {ROWS.map(({ key, label, formula }) => {
          const value = params[key] as number;
          return (
            <div key={key} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-2">
              <span className="font-mono text-base text-fg">{key}</span>
              <span className="text-sm text-fg-muted">{label}</span>
              <span className="font-mono text-sm tabular-nums text-fg">
                {value.toFixed(4)}
                <span className="ml-1 text-fg-subtle">mm</span>
              </span>
              <span className="col-span-3 font-mono text-xs text-fg-subtle">{formula}</span>
            </div>
          );
        })}
      </div>
      {params.warnings.length > 0 && (
        <div className="rounded-md border border-warn/40 bg-warn/10 p-3">
          {params.warnings.map((w, i) => (
            <div key={i} className="text-xs text-warn">{w}</div>
          ))}
        </div>
      )}
    </section>
  );
}
